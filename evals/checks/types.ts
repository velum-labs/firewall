import type { Decision, Detections } from '../../src/engine/types';
import type { RegisteredCase, CheckResult } from '../types';

export type CheckContext = {
  testCase: RegisteredCase;
  originalText: string;
  processedText: string;
  decisions: Decision[];
  detections: Detections;
};

export type CheckRunner = (ctx: CheckContext) => Promise<CheckResult> | CheckResult;

export type PipelineResult = {
  checks: CheckResult[];
  passed: boolean;
};

