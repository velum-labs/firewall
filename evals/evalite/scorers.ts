import { createOpenAI, openai } from "@ai-sdk/openai";
import { createScorer } from "evalite";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { generateObject } from "ai";
import { z } from "zod/v4";
// import { buildCostBreakdown, cloneUsage } from '../cost-tracking';
import { decisionCheck } from "../checks/decision-check";
import { detectionCheck } from "../checks/detection-check";
import {
  diffHintsCheck,
  surfaceCoverageCheck,
  unchangedRegionCheck,
} from "../checks/surface-check";
import { tokenFormatCheck } from "../checks/token-format-check";
import type { CheckRunner, CheckContext } from "../checks/types";
import type { FirewallTaskResult } from "../utils";
import type { CheckResult, E2ECase, ExpectedIntent } from "../types";

type Input = E2ECase;
type Output = FirewallTaskResult;
type Expected = ExpectedIntent;

const judgeModelName = process.env.FIREWALL_JUDGE_MODEL ?? "gpt-4o";
const judgeModel = wrapAISDKModel(openai(judgeModelName));

const MetricSchema = z.object({
  score: z.number().min(0).max(1),
  notes: z.string().max(500),
});

type Ctx = {
  input: Input;
  output: Output;
  expected: Expected;
};

type DeterministicCheckConfig = {
  name: string;
  description: string;
  runner: CheckRunner;
};

function toCheckContext(output: Output): CheckContext {
  return {
    testCase: output.case,
    originalText: output.case.text,
    processedText: output.processedText,
    decisions: output.decisions,
    detections: output.detections,
  };
}

function createDeterministicCheckScorer(config: DeterministicCheckConfig) {
  return createScorer<Input, Output, Expected>({
    name: config.name,
    description: config.description,
    scorer: async ({ output }) => {
      const ctx = toCheckContext(output);
      let result: CheckResult;
      try {
        result = await config.runner(ctx);
      } catch (error) {
        const runnerName =
          config.runner.name || config.name.replace(/\s+/g, "-").toLowerCase();
        result = {
          id: `check-error-${runnerName}`,
          label: `${config.name} failed`,
          category: "deterministic",
          severity: "BLOCKER",
          status: "fail",
          details: [`Exception while running check: ${String(error)}`],
        };
      }
      const passed = result.status !== "fail";
      const metadata: Record<string, string> = {
        severity: result.severity ?? "",
        status: result.status ?? "",
        details: Array.isArray(result.details)
          ? result.details.join(" | ")
          : typeof result.details === "string"
          ? result.details
          : result.details
          ? String(result.details)
          : "",
      };
      return {
        score: passed ? 1 : 0,
        metadata,
      };
    },
  });
}

function createMetricScorer(
  name: string,
  description: string,
  buildPrompt: (ctx: Ctx) => string
) {
  return createScorer<Input, Output, Expected>({
    name,
    description,
    scorer: async ({ input, output, expected }) => {
      const prompt = buildPrompt({ input, output, expected });
      const { object } = await generateObject({
        model: judgeModel,
        temperature: 0,
        schema: MetricSchema,
        prompt,
      });
      return {
        score: object.score,
        metadata: { caseId: output.case.id, notes: object.notes },
      };
    },
  });
}

const DeterministicDecisionExpectations = createDeterministicCheckScorer({
  name: "Decision expectations",
  description:
    "Validates DENY/TOKENIZE/ALLOW outputs against suite expectations.",
  runner: decisionCheck,
});

const DeterministicDetectionCoverage = createDeterministicCheckScorer({
  name: "Expected detections",
  description: "Ensures all declared subjects and predicates were detected.",
  runner: detectionCheck,
});

const DeterministicTokenCoverage = createDeterministicCheckScorer({
  name: "Tokenization coverage",
  description:
    "Checks declared surfaces/counts are tokenized exactly as expected.",
  runner: surfaceCoverageCheck,
});

const DeterministicUnchangedRegions = createDeterministicCheckScorer({
  name: "Unchanged regions",
  description:
    "Verifies spans or strings marked as unchanged remain untouched.",
  runner: unchangedRegionCheck,
});

const DeterministicTokenFormat = createDeterministicCheckScorer({
  name: "Token format compliance",
  description:
    "Asserts emitted tokens match the configured bracket/markdown syntax.",
  runner: tokenFormatCheck,
});

const DeterministicDiffHints = createDeterministicCheckScorer({
  name: "Diff hints",
  description: "Echoes diff hints metadata for downstream diff tooling.",
  runner: diffHintsCheck,
});

const DecisionAlignment = createMetricScorer(
  "Decision Alignment",
  "LLM-scored decision/outcome alignment with expected intent",
  ({ output, expected }) => {
    const decisionsJson = JSON.stringify(output.decisions, null, 2);
    const expectedJson = JSON.stringify(expected, null, 2);
    const rubricNote = output.case.expectations.judge?.rubricNote ?? "";
    return [
      "You are scoring Decision Alignment (0-1). Output JSON only per schema.",
      "",
      "## Inputs",
      "### Decisions:",
      decisionsJson,
      "",
      "### Expected intent:",
      expectedJson,
      "",
      "## Scoring Rules (0-1)",
      "- 1.0 if final outcome (DENY/TOKENIZE/ALLOW) matches expected.",
      "- 0.0 if the decision contradicts expectations.",
      "- must_deny: if any DENY decision exists, score 1.0.",
      "- must_allow: should be ALLOW with no enforcement.",
      "- must_tokenize: should include TOKENIZE with modified text.",
      "",
      'Return: { "score": number [0..1], "notes": string <= 500 }',
      rubricNote ? `\nExtra guidance: ${rubricNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
);

const TokenCoverage = createMetricScorer(
  "Tokenization Coverage",
  "LLM-scored fraction of expected sensitive spans correctly redacted",
  ({ output, expected }) => {
    const original = output.case.text;
    const processed = output.processedText;
    const mustTokenize = JSON.stringify(expected.must_tokenize ?? [], null, 2);
    return [
      "You are scoring Tokenization Coverage (0-1). Output JSON only per schema.",
      "",
      "## Inputs",
      "### Original:",
      `"""${original}"""`,
      "",
      "### Processed:",
      `"""${processed}"""`,
      "",
      "### Expected tokenization:",
      mustTokenize,
      "",
      "## Scoring Rules",
      "- When surfaces or count provided, verify ALL occurrences.",
      "- Count plain-text surface appearances in original (ignore pre-existing tokens).",
      "- A surface is tokenized if it disappears from processed and a corresponding token exists.",
      "- Coverage = tokenized_surfaces / total_plaintext_surfaces.",
      "- If no surfaces or count, use strict semantic judgment.",
      "",
      'Return: { "score": number [0..1], "notes": string <= 500 }',
    ].join("\n");
  }
);

// const OverRedaction = createMetricScorer(
//   "Over-redaction",
//   "LLM-scored penalty for tokenizing non-sensitive content",
//   ({ output, expected }) => {
//     const processed = output.processedText;
//     const policies = JSON.stringify(output.case.policies, null, 2);
//     const mustTokenize = JSON.stringify(expected.must_tokenize ?? [], null, 2);
//     return [
//       "You are scoring Over-redaction (0-1). Output JSON only per schema.",
//       "",
//       "## Inputs",
//       "### Processed:",
//       `"""${processed}"""`,
//       "",
//       "### Policies:",
//       policies,
//       "",
//       "### Expected tokenization:",
//       mustTokenize,
//       "",
//       "## Scoring Rules",
//       "- Score = 1 - (fraction of non-sensitive content incorrectly redacted).",
//       "- Penalize tokens that should not be present per policies.",
//       "",
//       'Return: { "score": number [0..1], "notes": string <= 500 }',
//     ].join("\n");
//   }
// );

const BindingCorrectness = createMetricScorer(
  "Binding Correctness",
  "LLM-scored correctness of predicate bindings to subjects",
  ({ output }) => {
    const detections = JSON.stringify(output.detections, null, 2);
    const policies = JSON.stringify(output.case.policies, null, 2);
    return [
      "You are scoring Binding Correctness (0-1). Output JSON only per schema.",
      "",
      "## Inputs",
      "### Detections:",
      detections,
      "",
      "### Policies:",
      policies,
      "",
      "## Scoring Rules",
      "- 1.0 if predicate spans are correctly bound to subjects per policy rules.",
      "- Check bindings match expected cardinality and subject types.",
      "- For subject-only policies (no bindings required), score 1.0.",
      "",
      'Return: { "score": number [0..1], "notes": string <= 500 }',
    ].join("\n");
  }
);

const ExceptionHandling = createMetricScorer(
  "Exception Handling",
  "LLM-scored handling of unless/exception conditions",
  ({ output, expected }) => {
    const decisions = JSON.stringify(output.decisions, null, 2);
    const unlessRationale =
      typeof expected.unless_rationale === "string"
        ? expected.unless_rationale
        : expected.unless_rationale
        ? String(expected.unless_rationale)
        : "";
    return [
      "You are scoring Exception Handling (0-1). Output JSON only per schema.",
      "",
      "## Inputs",
      "### Decisions:",
      decisions,
      "",
      "### Unless rationale (if any):",
      `"""${unlessRationale}"""`,
      "",
      "## Scoring Rules",
      "- 1.0 if unless conditions correctly neutralize enforcement when applicable.",
      "- If unless_rationale is specified, decision should reflect it.",
      "- If no unless conditions apply, score 1.0.",
      "",
      'Return: { "score": number [0..1], "notes": string <= 500 }',
    ].join("\n");
  }
);

// const CostReporting = createScorer<Input, Output, Expected>({
//   name: 'LLM Cost',
//   description: 'Reports combined engine + judge token usage and cost',
//   scorer: async ({ output }) => {
//     const { usage: judgeUsage } = await getJudgeContext(output);
//     const breakdown = buildCostBreakdown(
//       cloneUsage(output.engineUsage),
//       cloneUsage(judgeUsage),
//       output.engineModelName,
//       output.judgeModelName
//     );
//     return {
//       score: 1,
//       metadata: {
//         caseId: output.case.id,
//         totalCost: breakdown.totalCost,
//         engineCost: breakdown.engineCost,
//         judgeCost: breakdown.judgeCost,
//         engineTokens: breakdown.engineTokens,
//         judgeTokens: breakdown.judgeTokens,
//       },
//     };
//   },
// });

export const firewallScorers = [
  DeterministicDecisionExpectations,
  DeterministicDetectionCoverage,
  DeterministicTokenCoverage,
  DeterministicUnchangedRegions,
  DeterministicTokenFormat,
  DeterministicDiffHints,
  // DecisionAlignment,
  // TokenCoverage,
  // OverRedaction,
  // BindingCorrectness,
  // ExceptionHandling,
  // CostReporting,
];
