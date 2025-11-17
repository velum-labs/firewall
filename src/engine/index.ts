import type { Catalog } from "../catalog";
import type { Policy } from "../policy";
import type { TokenFormat } from "../tokenization";
import { extractForPolicies } from "./extract";
import { decideOne } from "./decide";
import type { Decision, Detections } from "./types";
import type { LanguageModelV2 } from "@ai-sdk/provider";

export type FirewallEngineOptions = {
  tokenSecret: string;
  model: LanguageModelV2;
  temperature?: number;
  tokenFormat?: TokenFormat;
  structuredDetectorsOnly?: boolean;
  predicatesEnabled?: boolean;
};

export type FirewallEngine = ReturnType<typeof createEngine>;

function assertPredicatesAllowed(policies: Policy[], enabled: boolean): void {
  if (enabled) {
    return;
  }
  for (const policy of policies) {
    if ("predicate" in policy.when) {
      throw new Error(
        `Policy ${policy.id} requires predicate support, but predicatesEnabled is false.`
      );
    }
    if (policy.unless?.some((rule) => "predicate" in rule)) {
      throw new Error(
        `Policy ${policy.id} references predicate rules in unless, but predicatesEnabled is false.`
      );
    }
  }
}

export function createEngine(catalog: Catalog, opts: FirewallEngineOptions) {
  if (!opts || typeof opts !== "object") {
    throw new Error("createEngine options are required.");
  }
  if (!opts.tokenSecret || !opts.tokenSecret.trim()) {
    throw new Error("createEngine requires a non-empty tokenSecret.");
  }
  if (!opts.model) {
    throw new Error("createEngine requires a configured LanguageModel instance.");
  }

  const tokenSecret = opts.tokenSecret;
  const tokenFormat = opts.tokenFormat ?? "brackets";
  const model = opts.model;
  const temperature = opts.temperature ?? 0;
  const predicatesEnabled = opts.predicatesEnabled ?? false;

  const ctx = { model, temperature };

  const decideFromDetections = (
    text: string,
    policies: Policy[],
    detections: Detections,
    localOpts?: { tokenFormat?: TokenFormat }
  ): Decision[] => {
    const effectiveFormat = localOpts?.tokenFormat ?? tokenFormat;
    return policies.map((p) =>
      decideOne({
        policy: p,
        det: detections,
        text,
        tokenSecret,
        tokenFormat: effectiveFormat,
      })
    );
  };

  const structuredOnly = opts.structuredDetectorsOnly ?? false;

  return {
    async extract(
      docId: string,
      text: string,
      policies: Policy[]
    ): Promise<Detections> {
      assertPredicatesAllowed(policies, predicatesEnabled);
      const { detections } = await extractForPolicies(ctx, {
        text,
        docId,
        catalog,
        policies,
        structuredOnly,
        predicatesEnabled,
      });
      return detections;
    },
    async decide(
      docId: string,
      text: string,
      policies: Policy[],
      opts?: { tokenFormat?: TokenFormat }
    ): Promise<Decision[]> {
      assertPredicatesAllowed(policies, predicatesEnabled);
      const extraction = await extractForPolicies(ctx, {
        text,
        docId,
        catalog,
        policies,
        structuredOnly,
        predicatesEnabled,
      });
      return decideFromDetections(text, policies, extraction.detections, {
        tokenFormat: opts?.tokenFormat,
      });
    },
    async decideWithDetections(
      text: string,
      policies: Policy[],
      detections: Detections,
      opts?: { tokenFormat?: TokenFormat }
    ): Promise<Decision[]> {
      assertPredicatesAllowed(policies, predicatesEnabled);
      return decideFromDetections(text, policies, detections, opts);
    },
  };
}

export * from "./types";
export { resolveQuoteSpan } from "./quoteSpan";
