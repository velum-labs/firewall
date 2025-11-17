/**
 * Smoke test for E2E harness (does not require API key)
 */

import { beforeAll, describe, it, expect } from 'vitest';
import { getAllCases, loadCasesFromGlob } from '../../evals/case-registry';
import type { E2ECase } from '../../evals/types';
import { policyRequiresPredicates } from '../../evals/types';

let allCases: E2ECase[] = [];
const predicatesEnabledEnv = process.env.FIREWALL_PREDICATES_ENABLED ?? '';
const predicatesEnabled =
  (predicatesEnabledEnv.trim().toLowerCase() === '1') ||
  (predicatesEnabledEnv.trim().toLowerCase() === 'true') ||
  (predicatesEnabledEnv.trim().toLowerCase() === 'yes');

beforeAll(async () => {
  await loadCasesFromGlob();
  allCases = getAllCases({ includeSkipped: true });
});

describe('e2e smoke tests', () => {
  it('should have all test cases defined', () => {
    expect(allCases.length).toBeGreaterThan(0);
  });

  it('should have valid case structure', () => {
    for (const tc of allCases) {
      expect(tc.id).toBeTruthy();
      expect(tc.text).toBeDefined(); // text can be empty string
      expect(tc.policies).toBeDefined();
      expect(tc.policies.length).toBeGreaterThanOrEqual(0);
      if (!predicatesEnabled) {
        const hasPredicatePolicies = tc.policies.some(policyRequiresPredicates);
        expect(hasPredicatePolicies).toBe(false);
      }
      expect(tc.expected).toBeDefined();
    }
  });

  it('should have unique case ids', () => {
    const ids = allCases.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid expected intents', () => {
    for (const tc of allCases) {
      const { expected } = tc;
      const hasIntent =
        expected.must_deny !== undefined ||
        expected.must_tokenize !== undefined ||
        expected.must_allow !== undefined;
      expect(hasIntent).toBe(true);
    }
  });

  it('should have valid policies', () => {
    for (const tc of allCases) {
      for (const pol of tc.policies) {
        expect(pol.id).toBeTruthy();
        expect(pol.when).toBeDefined();
        expect(pol.then).toBeDefined();
        expect(pol.then.action).toMatch(/^(ALLOW|DENY|TOKENIZE)$/);
      }
    }
  });
});

