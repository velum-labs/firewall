import type { CheckResult } from '../types';
import { decisionCheck } from './decision-check';
import { detectionCheck } from './detection-check';
import {
  diffHintsCheck,
  surfaceCoverageCheck,
  unchangedRegionCheck,
} from './surface-check';
import { tokenFormatCheck } from './token-format-check';
import type { CheckContext, PipelineResult, CheckRunner } from './types';

const CHECKS: CheckRunner[] = [
  decisionCheck,
  detectionCheck,
  surfaceCoverageCheck,
  unchangedRegionCheck,
  tokenFormatCheck,
  diffHintsCheck,
];

export async function runDeterministicPipeline(ctx: CheckContext): Promise<PipelineResult> {
  const checks: CheckResult[] = [];
  for (const check of CHECKS) {
    try {
      const result = await check(ctx);
      checks.push(result);
    } catch (error) {
      checks.push({
        id: `check-error-${check.name}`,
        label: `Check ${check.name} failed`,
        category: 'deterministic',
        severity: 'BLOCKER',
        status: 'fail',
        details: [`Exception while running check: ${String(error)}`],
      });
    }
  }

  const passed = checks.every(
    (check) => !(check.status === 'fail' && check.severity === 'BLOCKER')
  );

  return { checks, passed };
}

