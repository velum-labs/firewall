import type { CheckResult, ExpectedTokenization } from '../types';
import type { CheckContext } from './types';

export function surfaceCoverageCheck(ctx: CheckContext): CheckResult {
  const { testCase, processedText, originalText } = ctx;
  const expectations = testCase.expectations.decisions.mustTokenize;
  if (!expectations || expectations.length === 0) {
    return {
      id: 'surface-coverage',
      label: 'Tokenization coverage',
      category: 'deterministic',
      severity: 'INFO',
      status: 'skip',
      details: ['No tokenization coverage expectations'],
    };
  }

  const tokenFormat = testCase.tokenFormat ?? 'brackets';
  const details: string[] = [];
  const markdownTokens =
    tokenFormat === 'markdown'
      ? Array.from(
          processedText.matchAll(
            /\[(.*?)\]\(firewall:\/\/(subj|pred)\/([A-Za-z0-9_]+)\/[A-Za-z0-9]+\)/g
          )
        ).map((match) => ({
          surface: match[1] ?? '',
          kind: (match[2]?.toUpperCase() === 'PRED' ? 'PRED' : 'SUBJ') as
            | 'SUBJ'
            | 'PRED',
          label: match[3] ?? '',
        }))
      : [];

  for (const exp of expectations) {
    const pattern =
      tokenFormat === 'markdown'
        ? undefined
        : new RegExp(`\\[\\[${exp.kind}:${exp.label}:[A-Za-z0-9]+\\]\\]`, 'g');
    const bracketMatches = pattern ? processedText.match(pattern) ?? [] : [];
    const labelMarkdownTokens =
      tokenFormat === 'markdown'
        ? markdownTokens.filter(
            (token) => token.kind === exp.kind && token.label === exp.label
          )
        : [];
    const matchCount =
      tokenFormat === 'markdown'
        ? labelMarkdownTokens.length
        : bracketMatches.length;

    if (typeof exp.count === 'number' && matchCount !== exp.count) {
      details.push(
        `Expected ${exp.count} tokens for ${exp.kind}:${exp.label} but found ${matchCount}`
      );
    }
    if (typeof exp.minCount === 'number' && matchCount < exp.minCount) {
      details.push(
        `Expected at least ${exp.minCount} tokens for ${exp.kind}:${exp.label} but found ${matchCount}`
      );
    }

    if (exp.surfaces && exp.surfaces.length > 0) {
      const enforceSurfaceCount =
        typeof exp.count === 'number' || typeof exp.minCount === 'number';
      if (tokenFormat === 'markdown') {
        for (const surface of exp.surfaces) {
          const tokenized = labelMarkdownTokens.some(
            (token) => token.surface === surface
          );
          if (!tokenized) {
            details.push(
              `Surface "${surface}" for ${exp.kind}:${exp.label} was not converted into a markdown token`
            );
          }
        }
      } else {
        for (const surface of exp.surfaces) {
          if (originalText.includes(surface) && processedText.includes(surface)) {
            details.push(
              `Surface "${surface}" for ${exp.kind}:${exp.label} was not tokenized`
            );
          }
        }
      }
      if (enforceSurfaceCount && matchCount !== exp.surfaces.length) {
        details.push(
          `Surface list expected ${exp.surfaces.length} tokens for ${exp.kind}:${exp.label} but found ${matchCount}`
        );
      }
    }
  }

  const status = details.length === 0 ? 'pass' : 'fail';

  return {
    id: 'surface-coverage',
    label: 'Tokenization coverage',
    category: 'deterministic',
    severity: 'BLOCKER',
    status,
    details: details.length === 0 ? ['All expected surfaces were tokenized'] : dedupe(details),
    remediation:
      status === 'fail'
        ? 'Ensure all declared surfaces are tokenized and counts align with expectations.'
        : undefined,
  };
}

export function unchangedRegionCheck(ctx: CheckContext): CheckResult {
  const { testCase, processedText, originalText } = ctx;
  const regions = testCase.expectations.processing.allowedUnchangedRegions;
  if (!regions || regions.length === 0) {
    return {
      id: 'unchanged-regions',
      label: 'Unchanged regions preserved',
      category: 'deterministic',
      severity: 'INFO',
      status: 'skip',
      details: ['No unchanged regions declared'],
    };
  }

  const violations: string[] = [];
  for (const region of regions) {
    if (typeof region === 'string') {
      if (originalText.includes(region) && !processedText.includes(region)) {
        violations.push(`String region "${region}" was modified or removed`);
      }
    } else {
      const slice = originalText.slice(region.start, region.end);
      const processedSlice = processedText.slice(region.start, region.end);
      if (slice !== processedSlice) {
        violations.push(
          `Span ${region.start}-${region.end} expected to remain unchanged but was modified`
        );
      }
    }
  }

  const status = violations.length === 0 ? 'pass' : 'fail';

  return {
    id: 'unchanged-regions',
    label: 'Unchanged regions preserved',
    category: 'deterministic',
    severity: 'WARN',
    status,
    details:
      violations.length === 0 ? ['All unchanged regions were preserved'] : violations,
    remediation:
      status === 'fail'
        ? 'Limit tokenization to the intended spans and preserve the declared unchanged regions.'
        : undefined,
  };
}

export function diffHintsCheck(ctx: CheckContext): CheckResult {
  const hints = ctx.testCase.expectations.processing.diffHints;
  if (!hints || hints.length === 0) {
    return {
      id: 'diff-hints',
      label: 'Diff hints',
      category: 'deterministic',
      severity: 'INFO',
      status: 'skip',
      details: ['No diff hints specified'],
    };
  }

  return {
    id: 'diff-hints',
    label: 'Diff hints',
    category: 'deterministic',
    severity: 'INFO',
    status: 'pass',
    details: hints,
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

