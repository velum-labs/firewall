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

export {
  createFirewallMiddleware,
  FirewallDeniedError,
  createFirewallContext,
} from "./middleware";
export type {
  FirewallMiddlewareOptions,
  FirewallContext,
  FirewallScanResult,
} from "./middleware";

export { scanInput } from "./scan-input";
export type { ScanInputOptions } from "./scan-input";

// Token utilities
export {
  parseToken,
  normalizeToken,
  convertTokenFormat,
  getTokenVariants,
  extractTokensFromText,
  normalizeTokens,
} from "./token-utils";
export type { ParsedToken } from "./token-utils";

// Detection utilities
export {
  highlightDetections,
  summarizeDetections,
  groupDetectionsByType,
  getUniqueEntityTypes,
  filterDetectionsByConfidence,
  filterDetectionsByType,
} from "./detection-utils";
export type { HighlightSegment, DetectionSummary } from "./detection-utils";

// Markdown plugins
export { rehypeFirewall } from "./markdown/rehype-firewall";
export type { RehypeFirewallOptions } from "./markdown/rehype-firewall";

export { remarkFirewall } from "./markdown/remark-firewall";
export type { RemarkFirewallOptions } from "./markdown/remark-firewall";
