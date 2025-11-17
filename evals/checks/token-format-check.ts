import type { CheckResult } from '../types';
import type { CheckContext } from './types';

export function tokenFormatCheck(ctx: CheckContext): CheckResult {
  const { testCase, decisions } = ctx;
  const tokenFormat = testCase.tokenFormat ?? 'brackets';
  const regex =
    tokenFormat === 'markdown'
      ? /^\[.+\]\(firewall:\/\/(subj|pred)\/[A-Z0-9_]+\/[A-Za-z0-9]+\)$/
      : /^\[\[(SUBJ|PRED):[A-Z0-9_]+:[A-Za-z0-9]+\]\]$/;

  const invalidTokens: string[] = [];
  for (const decision of decisions) {
    if (decision.decision !== 'TOKENIZE' || !decision.tokens) continue;
    for (const token of decision.tokens) {
      if (!regex.test(token)) {
        invalidTokens.push(token);
      }
    }
  }

  const status = invalidTokens.length === 0 ? 'pass' : 'fail';

  return {
    id: 'token-format',
    label: 'Token format compliance',
    category: 'deterministic',
    severity: 'WARN',
    status,
    details:
      invalidTokens.length === 0
        ? ['All emitted tokens match the expected format']
        : invalidTokens.map((token) => `Invalid token format: ${token}`),
    expected:
      tokenFormat === 'markdown'
        ? '[text](firewall://subj|pred/LABEL/id)'
        : '[[SUBJ|PRED:LABEL:ID]]',
    actual:
      invalidTokens.length === 0
        ? 'All tokens valid'
        : `Invalid tokens: ${invalidTokens.slice(0, 5).join(', ')}`,
    remediation:
      status === 'fail'
        ? 'Ensure the middleware emits tokens that match the configured token format.'
        : undefined,
  };
}

