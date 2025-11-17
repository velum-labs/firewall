import type { LanguageModelMiddleware } from "ai";
import createDebug from "debug";
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
import { LanguageModelV2 } from "@ai-sdk/provider";

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

export interface FirewallMiddlewareOptions {
  tokenSecret: string;

  model: LanguageModelV2;

  throwOnDeny?: boolean;

  predicatesEnabled?: boolean;

  docIdGenerator?: () => string;

  tokenFormat?: "brackets" | "markdown";
}

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

      debug("Input processed: %s", processedText.slice(0, 100));

      const firewallResult = {
        decisions,
        detections,
        docId,
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
