import type { FirewallEngine } from "../../src/engine";
import type { Decision, Detections } from "../../src/engine/types";
import { mergeTokenizations } from "../../src/replace";
import type { E2ECase } from "../types";

/**
 * Result of running a firewall test case
 */
export type FirewallTaskResult = {
  case: E2ECase;
  processedText: string;
  decisions: Decision[];
  detections: Detections;
};

/**
 * Run a single test case through the firewall engine.
 * 
 * @param testCase - The test case to run
 * @param engine - The firewall engine instance
 * @param engineModelName - Name of the model used by the engine
 * @param judgeModelName - Name of the model used by the judge
 * @returns Result of the test case execution
 */
export async function runCase(
  testCase: E2ECase,
  engine: FirewallEngine,
): Promise<FirewallTaskResult> {
  // Extract entities and get detections
  const detections = await engine.extract(
    testCase.id,
    testCase.text,
    testCase.policies
  );

  // Make decisions based on detections
  const decisions = await engine.decideWithDetections(
    testCase.text,
    testCase.policies,
    detections,
    { tokenFormat: testCase.tokenFormat }
  );

  // Process text based on decisions
  const deny = decisions.find((d: Decision) => d.decision === "DENY");
  const processedText = deny
    ? testCase.text
    : mergeTokenizations(testCase.text, decisions);

  return {
    case: testCase,
    processedText,
    decisions,
    detections,
  };
}

