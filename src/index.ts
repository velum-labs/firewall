export { defineCatalog } from "./catalog";
export type { Catalog, SubjectSpec, PredicateSpec } from "./catalog";

export type { Policy, Scope } from "./policy";

export { makeTokenizer } from "./tokenization";
export type { Matter, TokenFormat } from "./tokenization";

export { applyReplacements } from "./replace";

export { createEngine, resolveQuoteSpan } from "./engine";
export type {
  Span,
  SubjectMention,
  PredicateMention,
  Detections,
  Decision,
} from "./engine/types";

export { createFirewallMiddleware, FirewallDeniedError } from "./middleware";
export type { FirewallMiddlewareOptions } from "./middleware";

export { scanInput } from "./scan-input";
export type { ScanInputOptions } from "./scan-input";
