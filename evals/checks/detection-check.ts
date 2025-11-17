import type { CheckResult } from '../types';
import type { CheckContext } from './types';

export function detectionCheck(ctx: CheckContext): CheckResult {
  const { detections, testCase } = ctx;
  const expected = testCase.expectations.detections;
  if (!expected || (!expected.subjects && !expected.predicates)) {
    return {
      id: 'expected-detections',
      label: 'Expected detections present',
      category: 'deterministic',
      severity: 'INFO',
      status: 'skip',
      details: ['No expected detections declared'],
    };
  }

  const missing: string[] = [];

  if (expected.subjects) {
    for (const [type, surfaces] of Object.entries(expected.subjects)) {
      const detected = detections.subjects
        .filter((subj) => subj.type === type)
        .map((subj) => subj.text);
      for (const surface of surfaces) {
        if (!detected.includes(surface)) {
          missing.push(`Subject ${type} "${surface}"`);
        }
      }
    }
  }

  if (expected.predicates) {
    for (const [type, surfaces] of Object.entries(expected.predicates)) {
      const detected = detections.predicates
        .filter((pred) => pred.type === type)
        .map((pred) => pred.text);
      for (const surface of surfaces) {
        if (!detected.includes(surface)) {
          missing.push(`Predicate ${type} "${surface}"`);
        }
      }
    }
  }

  const status = missing.length === 0 ? 'pass' : 'fail';

  return {
    id: 'expected-detections',
    label: 'Expected detections present',
    category: 'deterministic',
    severity: 'BLOCKER',
    status,
    details:
      missing.length === 0
        ? ['All expected detections were found']
        : missing.map((entry) => `Missing detection: ${entry}`),
    remediation:
      status === 'fail'
        ? 'Ensure extractor identifies all required subjects and predicates.'
        : undefined,
  };
}

