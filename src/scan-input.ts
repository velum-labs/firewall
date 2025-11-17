import { createEngine } from "./engine";
import type { Catalog } from "./catalog";
import type { Policy } from "./policy";
import type { Detections } from "./engine/types";
import type { LanguageModelV2 } from "@ai-sdk/provider";

export interface ScanInputOptions {
  model: LanguageModelV2;
  tokenSecret?: string;
  predicatesEnabled?: boolean;
}

export async function scanInput(
  text: string,
  catalog: Catalog,
  policies: Policy[],
  options: ScanInputOptions
): Promise<Detections> {
  const { model, predicatesEnabled = false } = options;
  if (!model) {
    throw new Error("scanInput requires a configured LanguageModel instance.");
  }
  const engine = createEngine(catalog, {
    tokenSecret: options.tokenSecret ?? "scan-input-placeholder",
    model,
    predicatesEnabled,
  });

  return engine.extract(`input-${Date.now()}`, text, policies);
}
