import { createEngine } from "../src/engine";
import { evalite } from "evalite";
import { catalog } from "./catalog/registry";
import { getAllCases, loadCasesFromGlob } from "./case-registry";
import { firewallScorers } from "./evalite/scorers";
import { resolveEvaliteConfig } from "./evalite/config";
import type { E2ECase, ExpectedIntent } from "./types";
import {
  applyFilters,
  applyMetaFilters,
  runCase,
  resolveEngineConfig,
  type FirewallTaskResult,
} from "./utils";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { models } from "./models";

type FirewallInput = E2ECase;

// Resolve configuration from environment
const engineConfig = resolveEngineConfig();
const evalConfig = resolveEvaliteConfig();

evalite.each(models)<FirewallInput, FirewallTaskResult, ExpectedIntent>(
  "Core",
  {
    data: async () => {
      await loadCasesFromGlob({ glob: "**/core_*.ts" });

      let cases = getAllCases();
      cases = applyFilters(cases, evalConfig);
      cases = applyMetaFilters(cases);

      if (cases.length === 0) {
        throw new Error("No E2E cases selected for Evalite run.");
      }

      return cases.map((testCase) => ({
        input: testCase,
        expected: testCase.expected,
        only: Boolean(testCase.meta.only),
      }));
    },

    columns: ({ input, output }) => {
      return [
        { label: "ID", value: input.id },
        { label: "Input", value: input.text },
        { label: "Output", value: output.processedText },
      ];
    },

    task: async (
      input: FirewallInput,
      variant
    ): Promise<FirewallTaskResult> => {
      const engine = createEngine(catalog, {
        tokenSecret: engineConfig.tokenSecret,
        model: wrapAISDKModel(variant.model),
        predicatesEnabled: engineConfig.predicatesEnabled,
      });
      return runCase(input, engine);
    },

    scorers: firewallScorers,
  }
);
