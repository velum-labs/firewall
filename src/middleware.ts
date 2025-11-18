import type { LanguageModelMiddleware } from "ai";
import createDebug from "debug";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { createEngine } from "./engine";
import type { Catalog } from "./catalog";
import type { Policy } from "./policy";
import type { Decision, Detections } from "./engine/types";
import { mergeTokenizations } from "./replace";
import {
  extractTextFromMessage,
  findLastUserMessage,
  replaceLastUserMessage,
  replaceTextInMessage,
} from "./utils";

const debug = createDebug("firewall:middleware");

export class FirewallDeniedError extends Error {
  constructor(
    public readonly policyId: string,
    public readonly decisions: Decision[],
    message?: string
  ) {
    super(message || `Firewall policy ${policyId} denied the request`);
    this.name = "FirewallDeniedError";
  }
}

export type FirewallScanResult = {
  docId: string;
  textTransformed: string;
  decisions: Decision[];
  detections: Detections;
};

/**
 * FirewallContext provides explicit access to scan results.
 * Useful when AsyncLocalStorage-based global capture is not available
 * or when you want more control over result handling.
 */
export interface FirewallContext {
  /**
   * Get the most recent scan result
   */
  getLatestScan(): FirewallScanResult | undefined;

  /**
   * Clear the stored scan result
   */
  clearScan(): void;
}

/**
 * Create a FirewallContext for explicit scan result capture.
 * Pass this to FirewallMiddlewareOptions to capture results
 * without relying on global AsyncLocalStorage patterns.
 * 
 * @example
 * ```typescript
 * const context = createFirewallContext();
 * const middleware = createFirewallMiddleware(catalog, policies, {
 *   ...options,
 *   context
 * });
 * 
 * // Later, access the scan result
 * const scan = context.getLatestScan();
 * ```
 */
export function createFirewallContext(): FirewallContext {
  let latestScan: FirewallScanResult | undefined;

  return {
    getLatestScan() {
      return latestScan;
    },
    clearScan() {
      latestScan = undefined;
    },
    _setScan(scan: FirewallScanResult) {
      latestScan = scan;
    },
  } as FirewallContext & { _setScan(scan: FirewallScanResult): void };
}

export interface FirewallMiddlewareOptions {
  tokenSecret: string;

  model: LanguageModelV2;

  throwOnDeny?: boolean;

  predicatesEnabled?: boolean;

  docIdGenerator?: () => string;

  tokenFormat?: "brackets" | "markdown";

  onResult?: (result: FirewallScanResult) => void;

  /**
   * Optional explicit context for capturing scan results.
   * If provided, scan results will be stored in this context
   * in addition to any global handlers.
   */
  context?: FirewallContext;
}

const GLOBAL_RESULT_HANDLER_KEY = Symbol.for("velum.firewall.listener");

const emitGlobalResult = (result: FirewallScanResult) => {
  if (typeof globalThis === "undefined") {
    return;
  }
  const handler = (globalThis as {
    [GLOBAL_RESULT_HANDLER_KEY]?: (payload: FirewallScanResult) => void;
  })[GLOBAL_RESULT_HANDLER_KEY];
  handler?.(result);
};

const defaultDocIdGenerator = () =>
  `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function createFirewallMiddleware(
  catalog: Catalog,
  policies: Policy[],
  options: FirewallMiddlewareOptions
): LanguageModelMiddleware {
  const {
    tokenSecret,
    model,
    throwOnDeny = true,
    tokenFormat = "brackets",
    docIdGenerator = defaultDocIdGenerator,
    predicatesEnabled = false,
  } = options;

  const engine = createEngine(catalog, {
    tokenSecret,
    model,
    tokenFormat,
    predicatesEnabled,
  });

  const applyFirewall = async (
    text: string,
    docId: string
  ): Promise<{
    text: string;
    decisions: Decision[];
    detections: Detections;
  }> => {
    debug(
      "Applying firewall to text: %s (docId: %s)",
      text.slice(0, 100),
      docId
    );

    const detections = await engine.extract(docId, text, policies);
    const decisions = await engine.decideWithDetections(
      text,
      policies,
      detections
    );
    debug("Decisions: %o", decisions);

    const denyDecision = decisions.find((d) => d.decision === "DENY");
    if (denyDecision) {
      debug("DENY decision found: %s", denyDecision.policyId);
      if (throwOnDeny) {
        throw new FirewallDeniedError(denyDecision.policyId, decisions);
      }
      return { text, decisions, detections };
    }

    const mergedText = mergeTokenizations(text, decisions);
    if (mergedText !== text) {
      debug("Applied merged TOKENIZE decisions");
      return { text: mergedText, decisions, detections };
    }

    debug("No modifications needed (ALLOW)");
    return { text, decisions, detections };
  };

  const middleware: LanguageModelMiddleware = {
    transformParams: async ({ params }) => {
      debug("transformParams called - scanning INPUT before LLM");

      let { prompt } = params;

      const lastUserMessage = findLastUserMessage(prompt);

      if (!lastUserMessage) {
        debug("No user message found, skipping firewall");
        return params;
      }

      const userText = extractTextFromMessage(lastUserMessage);

      if (!userText) {
        debug("No text content in user message, skipping firewall");
        return params;
      }

      const docId = docIdGenerator();

      const {
        text: processedText,
        decisions,
        detections,
      } = await applyFirewall(userText, docId).catch((error) => {
        if (error instanceof FirewallDeniedError) {
          debug("Firewall denied INPUT: %s", error.message);
          throw error;
        }
        debug("Firewall error: %o", error);
        throw error;
      });

      const eventPayload = {
        docId,
        textTransformed: processedText,
        decisions,
        detections,
      };
      options.onResult?.(eventPayload);
      emitGlobalResult(eventPayload);
      
      // Store in explicit context if provided
      if (options.context) {
        (options.context as FirewallContext & { _setScan(scan: FirewallScanResult): void })._setScan(eventPayload);
      }

      debug("Input processed: %s", processedText.slice(0, 100));

      const firewallResult = {
        decisions,
        detections,
        docId,
        textTransformed: processedText,
      };

      if (processedText !== userText) {
        debug("Input text was modified by firewall (tokenization applied)");
        const newMessage = replaceTextInMessage(lastUserMessage, processedText);
        prompt = replaceLastUserMessage(prompt, newMessage);
      }

      return {
        ...params,
        prompt,
        providerOptions: {
          ...params.providerOptions,
          firewall: firewallResult,
        },
      };
    },

    wrapGenerate: async ({ doGenerate, params }) => {
      debug("wrapGenerate called");

      const result = await doGenerate();

      return {
        ...result,
        providerMetadata: {
          ...result.providerMetadata,
          ...params.providerOptions,
        },
      };
    },
  };

  return middleware;
}
