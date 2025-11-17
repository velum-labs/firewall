import type { CheckResult } from '../types';
import type { CheckContext } from './types';

export function decisionCheck(ctx: CheckContext): CheckResult {
  const { testCase, decisions, originalText } = ctx;
  const expectation = testCase.expectations.decisions;
  const details: string[] = [];
  const denyDecision = decisions.some((d) => d.decision === 'DENY');
  const tokenizeDecision = decisions.find(
    (d) => d.decision === 'TOKENIZE' && d.textTokenized && d.textTokenized !== originalText
  );
  const enforcementDecision = decisions.some(
    (d) => d.decision === 'TOKENIZE' || d.decision === 'DENY'
  );

  if (expectation.mustDeny && !denyDecision) {
    details.push('Expected DENY decision but none was returned');
  }

  if (expectation.mustAllow && enforcementDecision) {
    details.push('Expected ALLOW but enforcement decision (DENY or TOKENIZE) was returned');
  }

  if (expectation.mustTokenize && expectation.mustTokenize.length > 0 && !tokenizeDecision) {
    details.push('Expected TOKENIZE decision with modified text, but none found');
  }

  const status = details.length === 0 ? 'pass' : 'fail';

  return {
    id: 'decision-mismatch',
    label: 'Decision expectation alignment',
    category: 'deterministic',
    severity: 'BLOCKER',
    status,
    details: details.length > 0 ? details : ['Decision output matches expectations'],
    expected: describeDecisionExpectation(expectation),
    actual: summarizeDecisions(decisions),
    remediation:
      status === 'fail'
        ? 'Verify policies and execution ordering so outcomes align with the declared expectations.'
        : undefined,
  };
}

function describeDecisionExpectation(expectation: CheckContext['testCase']['expectations']['decisions']): string {
  const parts: string[] = [];
  if (expectation.mustDeny) parts.push('DENY');
  if (expectation.mustAllow) parts.push('ALLOW');
  if (expectation.mustTokenize && expectation.mustTokenize.length > 0) {
    parts.push(`TOKENIZE (${expectation.mustTokenize.length} entities)`);
  }
  return parts.length > 0 ? parts.join(', ') : 'No explicit decision expectations';
}

function summarizeDecisions(decisions: CheckContext['decisions']): string {
  const counts = decisions.reduce<Record<string, number>>((acc, decision) => {
    acc[decision.decision] = (acc[decision.decision] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([decision, count]) => `${decision} x${count}`)
    .join(', ');
}

