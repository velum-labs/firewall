import { generateObject, type LanguageModel } from "ai";
import { z } from "zod/v4";
import type { EntityLinker, EntityLinkResult } from "./entity-linker";
import {
  createEntityStore,
  createEntry,
  type EntityStore,
  type EntityStoreEntry,
} from "./entity-store";
import {
  computeSimilarityScores,
  normalizeSurface,
} from "./fuzzy";

export type ThresholdConfig = {
  accept: number;
  ambiguous: number;
  minLength: number;
};

const DEFAULT_THRESHOLDS: Record<string, ThresholdConfig> = {
  default: { accept: 0.9, ambiguous: 0.84, minLength: 3 },
};

type ScoreDecision =
  | { status: "accept"; entry: EntityStoreEntry; scores: number[] }
  | { status: "ambiguous"; entry: EntityStoreEntry; scores: number[] }
  | { status: "reject" };

const evaluateScores = (
  entry: EntityStoreEntry,
  normalized: string,
  label: string,
  thresholds: ThresholdConfig
): ScoreDecision => {
  const scores = Object.values(
    computeSimilarityScores(entry.normalized, normalized)
  );
  const shorter =
    entry.normalized.length <= normalized.length
      ? entry.normalized
      : normalized;
  const longer =
    entry.normalized.length > normalized.length
      ? entry.normalized
      : normalized;
  const coverage =
    longer.length === 0 ? 0 : shorter.length / Math.max(longer.length, 1);
  if (
    coverage >= 0.3 &&
    (longer.startsWith(shorter) || longer.endsWith(shorter))
  ) {
    return { status: "accept", entry, scores };
  }
  const trueCount = scores.filter((score) => score >= thresholds.accept).length;
  if (trueCount >= 2) {
    return { status: "accept", entry, scores };
  }
  const ambiguousHits = scores.filter(
    (score) => score >= thresholds.ambiguous
  ).length;
  if (ambiguousHits >= 2) {
    return { status: "ambiguous", entry, scores };
  }
  return { status: "reject" };
};

export type FuzzyEntityLinkerOptions = {
  store?: EntityStore;
  thresholds?: Partial<Record<string, Partial<ThresholdConfig>>>;
  llmAssist?: {
    model: LanguageModel;
    temperature?: number;
    maxPairs?: number;
  };
};

const resolveThreshold = (
  label: string,
  overrides?: Partial<Record<string, Partial<ThresholdConfig>>>
): ThresholdConfig => {
  const base = DEFAULT_THRESHOLDS[label] ?? DEFAULT_THRESHOLDS.default;
  const override = overrides?.[label];
  if (!override) {
    return base;
  }
  return {
    accept: override.accept ?? base.accept,
    ambiguous: override.ambiguous ?? base.ambiguous,
    minLength: override.minLength ?? base.minLength,
  };
};

const namespaceKey = (inputNamespace?: string) =>
  inputNamespace?.trim().length ? inputNamespace : "global";

const labelKey = (label: string, namespace?: string) =>
  `${namespaceKey(namespace)}::${label}`;

export function createFuzzyEntityLinker(
  options: FuzzyEntityLinkerOptions = {}
): EntityLinker & { store: EntityStore } {
  const store = options.store ?? createEntityStore();
  const thresholds = options.thresholds;
  const llmAssist = options.llmAssist;
  const llmSchema = z.object({
    same_entity: z.boolean(),
    canonical_surface: z.string().optional(),
    confidence: z.number().min(0).max(1),
  });

  const runLlmAssist = async (
    label: string,
    candidate: string,
    inputSurface: string
  ) => {
    if (!llmAssist) {
      return undefined;
    }
    const prompt = [
      "Decide if two spans refer to the same real-world entity and respond with JSON only.",
      `Label: ${label}`,
      `Candidate: "${candidate}"`,
      `Input: "${inputSurface}"`,
      "Rules:",
      "- Focus on normalized string similarity (case/diacritics insensitive).",
      "- Prefer longer, more specific surface as canonical.",
      "- Avoid merging when evidence is weak.",
      "",
      "Respond with {\"same_entity\": boolean, \"canonical_surface\": string?, \"confidence\": number} only.",
    ].join("\n");

    const { object } = await generateObject({
      model: llmAssist.model,
      temperature: llmAssist.temperature ?? 0,
      schema: llmSchema,
      prompt,
    });
    if (!object.same_entity) {
      return undefined;
    }
    const canonical = object.canonical_surface?.trim();
    return canonical?.length ? canonical : undefined;
  };

  const resolveMany: EntityLinker["resolveMany"] = async (inputs) => {
    if (!inputs.length) {
      return [];
    }

    const results: EntityLinkResult[] = [];

    let llmCalls = 0;
    const maxLlmPairs = llmAssist?.maxPairs ?? 10;

    for (const input of inputs) {
      const normalized = normalizeSurface(input.surface);
      const label = labelKey(input.label, input.namespace);
      const config = resolveThreshold(input.label, thresholds);

      if (!normalized || normalized.length < config.minLength) {
        const fallbackNorm =
          normalized && normalized.length ? normalized : normalizeSurface(input.surface) || input.surface.toLowerCase();
        const entry = createEntry(input.label, input.surface, fallbackNorm);
        store.addEntry({ ...entry, label });
        results.push({
          label: input.label,
          surface: input.surface,
          canonicalSurface: entry.canonicalSurface,
          entityId: entry.id,
        });
        continue;
      }

      const entries = store.getEntries(label);
      let accepted: EntityStoreEntry | undefined;
      let ambiguousCandidate: EntityStoreEntry | undefined;

      for (const entry of entries) {
        const decision = evaluateScores(entry, normalized, input.label, config);
        if (decision.status === "accept") {
          accepted = entry;
          break;
        }
        if (!ambiguousCandidate && decision.status === "ambiguous") {
          ambiguousCandidate = entry;
        }
      }

      if (
        !accepted &&
        ambiguousCandidate &&
        llmAssist &&
        llmCalls < maxLlmPairs
      ) {
        const canonical = await runLlmAssist(
          input.label,
          ambiguousCandidate.canonicalSurface,
          input.surface
        );
        llmCalls += 1;
        if (canonical) {
          ambiguousCandidate.canonicalSurface = canonical;
          ambiguousCandidate.normalized = normalizeSurface(
            ambiguousCandidate.canonicalSurface
          );
          accepted = ambiguousCandidate;
        }
      }

      if (accepted) {
        store.touch(accepted, input.surface, normalized);
        if (
          input.surface.length > accepted.canonicalSurface.length &&
          input.surface.trim().length
        ) {
          accepted.canonicalSurface = input.surface;
        }
        results.push({
          label: input.label,
          surface: input.surface,
          canonicalSurface: accepted.canonicalSurface,
          entityId: accepted.id,
        });
        continue;
      }

      const newEntry = createEntry(input.label, input.surface, normalized);
      store.addEntry({ ...newEntry, label });
      results.push({
        label: input.label,
        surface: input.surface,
        canonicalSurface: newEntry.canonicalSurface,
        entityId: newEntry.id,
      });
    }

    return results;
  };

  return {
    resolveMany,
    store,
  };
}

