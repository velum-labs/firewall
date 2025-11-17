import "dotenv/config";
import process from "node:process";
import { createEngine } from "../src/engine";
import { openai } from "@ai-sdk/openai";
import { catalog } from "./catalog/registry";
import {
  getCaseById,
  getAllCases,
  loadCasesFromGlob,
} from "./case-registry";
import {
  runCase,
  resolveEngineConfig,
  type FirewallTaskResult,
} from "./utils";
import { runDeterministicPipeline } from "./checks";
import type { CheckResult } from "./types";

type OutputMode = "pretty" | "json";

type CaseRunStatus = "success" | "failed" | "error";

type CaseOutputPayload = {
  caseId: string;
  title?: string;
  severity: string;
  category: string;
  status: CaseRunStatus;
  error?: string;
  failureReason?: string;
  processedText?: string;
  decisions?: FirewallTaskResult["decisions"];
  detections?: FirewallTaskResult["detections"];
  deterministicChecks?: CheckResult[];
  deterministicPass?: boolean;
};

async function main() {
  const { caseId, globPattern, outputMode } = parseArgs();

  await loadCasesFromGlob({
    glob: globPattern ?? process.env.FIREWALL_SINGLE_CASE_GLOB ?? "**/*.ts",
  });

  const testCase = getCaseById(caseId);
  if (!testCase) {
    const available = getAllCases({ includeSkipped: true })
      .map((c) => c.id)
      .slice(0, 10)
      .join(", ");
    throw new Error(
      `Case "${caseId}" not found. Loaded cases include: ${available}${
        available.length ? "…" : ""
      }`
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required.");
  }

  const engineConfig = resolveEngineConfig();
  const engine = createEngine(catalog, {
    tokenSecret: engineConfig.tokenSecret,
    model: openai(engineConfig.modelName),
    predicatesEnabled: engineConfig.predicatesEnabled,
  });

  const caseMetadata = {
    caseId: testCase.id,
    title: testCase.meta.title ?? testCase.meta.description,
    severity: testCase.meta.severity,
    category: testCase.meta.category,
  };

  let payload: CaseOutputPayload;
  let fatalError: unknown;
  let shouldExitWithFailure = false;

  try {
    const result = await runCase(testCase, engine);
    const deterministic = await runDeterministicPipeline({
      testCase,
      originalText: testCase.text,
      processedText: result.processedText,
      decisions: result.decisions,
      detections: result.detections,
    });

    const deterministicPass = deterministic.passed;
    payload = {
      ...caseMetadata,
      status: deterministicPass ? "success" : "failed",
      failureReason: deterministicPass ? undefined : "Deterministic checks failed",
      processedText: result.processedText,
      decisions: result.decisions,
      detections: result.detections,
      deterministicChecks: deterministic.checks,
      deterministicPass,
    };

    if (!deterministicPass) {
      shouldExitWithFailure = true;
    }
  } catch (error) {
    fatalError = error;
    payload = {
      ...caseMetadata,
      status: "error",
      error: formatErrorMessage(error),
    };
  }

  if (outputMode === "json") {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    printPretty(payload);
  }

  if (fatalError) {
    throw fatalError;
  }
  if (shouldExitWithFailure) {
    process.exitCode = 1;
  }
}

function parseArgs(): {
  caseId: string;
  globPattern?: string;
  outputMode: OutputMode;
} {
  const args = process.argv.slice(2);
  let caseId: string | undefined;
  let globPattern: string | undefined;
  let outputMode: OutputMode = "pretty";

  for (let idx = 0; idx < args.length; idx += 1) {
    const arg = args[idx];
    if (arg === "--json") {
      outputMode = "json";
      continue;
    }
    if (arg === "--glob" || arg === "-g") {
      globPattern = args[idx + 1];
      idx += 1;
      continue;
    }
    if (!caseId) {
      caseId = arg;
      continue;
    }
    throw new Error(`Unknown argument "${arg}"`);
  }

  caseId =
    caseId ??
    process.env.FIREWALL_SINGLE_CASE ??
    process.env.FIREWALL_CASE_ID;

  if (!caseId) {
    throw new Error(
      `Usage: pnpm evals:case <case-id> [--json] [--glob "**/core_*.ts"]`
    );
  }

  return { caseId, globPattern, outputMode };
}

function printPretty(payload: CaseOutputPayload) {
  console.log(`Case: ${payload.caseId} — ${payload.title ?? "Untitled"}`);
  console.log(`Category: ${payload.category} | Severity: ${payload.severity}`);
  console.log("");
  console.log(`Status: ${payload.status.toUpperCase()}`);

  if (payload.status === "error") {
    console.log(`Details: ${payload.error ?? "Unknown error"}`);
    return;
  }

  if (payload.status === "failed") {
    console.log(`Reason: ${payload.failureReason ?? "Unknown failure"}`);
    console.log("");
  }

  console.log("Processed Text:");
  console.log(payload.processedText ?? "");
  console.log("");
  console.log("Decisions:");
  for (const decision of payload.decisions ?? []) {
    console.log(
      `- [${decision.decision}] policy=${decision.policyId} confidence=${decision.confidence.toFixed(
        2
      )}`
    );
    if (decision.explanations.length) {
      console.log(`  explanations: ${decision.explanations.join(" | ")}`);
    }
    if (decision.triggeredBy?.length) {
      console.log(
        `  triggeredBy: ${decision.triggeredBy
          .map(
            (t) =>
              `${t.kind}:${t.type} token=${t.tokenized.id} (${t.tokenized.value})`
          )
          .join(", ")}`
      );
    }
  }
  console.log("");
  console.log("Deterministic checks:");
  const checks = payload.deterministicChecks ?? [];
  const overall =
    payload.deterministicPass === undefined
      ? "UNKNOWN"
      : payload.deterministicPass
        ? "PASS"
        : "FAIL";
  console.log(`Overall: ${overall}`);
  if (!checks.length) {
    console.log("- No deterministic checks executed.");
    return;
  }
  for (const check of checks) {
    const status = check.status.toUpperCase();
    const details = check.details?.length ? ` — ${check.details.join(" | ")}` : "";
    console.log(`- ${check.label}: ${status} (${check.severity})${details}`);
  }
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    const serialized = JSON.stringify(error);
    return typeof serialized === "string" ? serialized : "Unknown error";
  } catch {
    return "Unknown error";
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

