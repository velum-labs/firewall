import type { LLMUsageTotals } from '../src/engine/types';

export type ModelPricing = {
  inputTokensPerMillion: number;
  outputTokensPerMillion: number;
};

export type CostBreakdown = {
  engineCost: number;
  judgeCost: number;
  totalCost: number;
  engineTokens: LLMUsageTotals;
  judgeTokens: LLMUsageTotals;
};

const DEFAULT_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': { inputTokensPerMillion: 2.5, outputTokensPerMillion: 10 },
  'gpt-4o-mini': { inputTokensPerMillion: 0.15, outputTokensPerMillion: 0.6 },
};

const FALLBACK_PRICING: ModelPricing = {
  inputTokensPerMillion: 1,
  outputTokensPerMillion: 1,
};

export function emptyUsage(): LLMUsageTotals {
  return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
}

export function cloneUsage(usage?: LLMUsageTotals): LLMUsageTotals {
  if (!usage) {
    return emptyUsage();
  }
  return {
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    totalTokens: usage.totalTokens ?? 0,
  };
}

export function addUsageTotals(
  base: LLMUsageTotals,
  delta?: LLMUsageTotals
): LLMUsageTotals {
  if (!delta) {
    return base;
  }
  return {
    inputTokens: base.inputTokens + (delta.inputTokens ?? 0),
    outputTokens: base.outputTokens + (delta.outputTokens ?? 0),
    totalTokens: base.totalTokens + (delta.totalTokens ?? 0),
  };
}

export function calculateCost(
  usage: LLMUsageTotals,
  pricing: ModelPricing
): number {
  const inputCost =
    (usage.inputTokens / 1_000_000) * pricing.inputTokensPerMillion;
  const outputCost =
    (usage.outputTokens / 1_000_000) * pricing.outputTokensPerMillion;
  return inputCost + outputCost;
}

export function getModelPricing(
  kind: 'engine' | 'judge',
  modelName: string
): ModelPricing {
  const defaultPricing = matchDefaultPricing(modelName) ?? FALLBACK_PRICING;

  return {
    inputTokensPerMillion:
      parsePrice(
        kind === 'engine'
          ? process.env.FIREWALL_MODEL_INPUT_PRICE
          : process.env.FIREWALL_JUDGE_MODEL_INPUT_PRICE
      ) ?? defaultPricing.inputTokensPerMillion,
    outputTokensPerMillion:
      parsePrice(
        kind === 'engine'
          ? process.env.FIREWALL_MODEL_OUTPUT_PRICE
          : process.env.FIREWALL_JUDGE_MODEL_OUTPUT_PRICE
      ) ?? defaultPricing.outputTokensPerMillion,
  };
}

function parsePrice(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

function matchDefaultPricing(modelName: string): ModelPricing | undefined {
  const normalized = modelName.toLowerCase();
  if (normalized.includes('gpt-4o-mini')) {
    return DEFAULT_PRICING['gpt-4o-mini'];
  }
  if (normalized.includes('gpt-4o')) {
    return DEFAULT_PRICING['gpt-4o'];
  }
  return undefined;
}

export function buildCostBreakdown(
  engineUsage: LLMUsageTotals,
  judgeUsage: LLMUsageTotals,
  engineModelName: string,
  judgeModelName: string
): CostBreakdown {
  const enginePricing = getModelPricing('engine', engineModelName);
  const judgePricing = getModelPricing('judge', judgeModelName);
  const engineCostValue = calculateCost(engineUsage, enginePricing);
  const judgeCostValue = calculateCost(judgeUsage, judgePricing);
  return {
    engineCost: engineCostValue,
    judgeCost: judgeCostValue,
    totalCost: engineCostValue + judgeCostValue,
    engineTokens: engineUsage,
    judgeTokens: judgeUsage,
  };
}

