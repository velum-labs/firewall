/**
 * Text replacement tests
 */

import { describe, it, expect } from 'vitest';
import { applyReplacements, mergeTokenizations, selectNonOverlapping } from '../src/replace';
import type { Decision } from '../src/engine/types';

describe('applyReplacements', () => {
  it('should replace single span', () => {
    const text = 'Hello World';
    const items = [{ span: { start: 6, end: 11 }, repl: 'TOKEN', kind: 'SUBJ' as const }];
    const result = applyReplacements(text, items);
    expect(result).toBe('Hello TOKEN');
  });

  it('should replace multiple non-overlapping spans', () => {
    const text = 'Hello World Today';
    const items = [
      { span: { start: 0, end: 5 }, repl: 'T1', kind: 'SUBJ' as const },
      { span: { start: 12, end: 17 }, repl: 'T2', kind: 'SUBJ' as const },
    ];
    const result = applyReplacements(text, items);
    expect(result).toBe('T1 World T2');
  });

  it('should handle longest-span-first replacement', () => {
    const text = 'Acme Corp announced IPO';
    const items = [
      { span: { start: 0, end: 9 }, repl: '[[SUBJ:COMPANY:ABC]]', kind: 'SUBJ' as const },
      { span: { start: 20, end: 23 }, repl: '[[PRED:EVENT:XYZ]]', kind: 'PRED' as const },
    ];
    const result = applyReplacements(text, items);
    expect(result).toBe('[[SUBJ:COMPANY:ABC]] announced [[PRED:EVENT:XYZ]]');
  });

  it('should handle empty replacement', () => {
    const text = 'Hello World';
    const items = [{ span: { start: 6, end: 11 }, repl: '', kind: 'SUBJ' as const }];
    const result = applyReplacements(text, items);
    expect(result).toBe('Hello ');
  });

  it('should handle adjacent spans', () => {
    const text = 'ABC DEF GHI';
    const items = [
      { span: { start: 0, end: 3 }, repl: 'X', kind: 'SUBJ' as const },
      { span: { start: 4, end: 7 }, repl: 'Y', kind: 'SUBJ' as const },
    ];
    const result = applyReplacements(text, items);
    expect(result).toBe('X Y GHI');
  });
});

describe('selectNonOverlapping', () => {
  it('prefers longer spans when overlaps occur', () => {
    const items = [
      { span: { start: 0, end: 4 }, repl: 'SHORT', kind: 'SUBJ' as const },
      { span: { start: 0, end: 6 }, repl: 'LONGER', kind: 'SUBJ' as const },
      { span: { start: 10, end: 14 }, repl: 'TAIL', kind: 'SUBJ' as const },
    ];

    const result = selectNonOverlapping(items);
    expect(result).toHaveLength(2);
    expect(result.some((item) => item.repl === 'LONGER')).toBe(true);
    expect(result.some((item) => item.repl === 'TAIL')).toBe(true);
  });
});

describe('mergeTokenizations', () => {
const makeDecisionBase = (): Omit<
  Decision,
  'decision' | 'appliesToSpans' | 'tokens' | 'textTokenized'
> => ({
  policyId: 'pol_test',
  docId: 'doc',
  confidence: 0.9,
  explanations: [],
});

  it('merges tokens across multiple decisions and resolves overlaps', () => {
    const text =
      'Dr. Smith from Smith & Associates discussed the merger with Johnson LLC.';
    const spanFor = (surface: string) => {
      const start = text.indexOf(surface);
      if (start === -1) {
        throw new Error(`Surface "${surface}" not found in test text`);
      }
      return { start, end: start + surface.length };
    };

    const decisions: Decision[] = [
      {
        ...makeDecisionBase(),
        policyId: 'pol_tokenize_person',
        decision: 'TOKENIZE',
        appliesToSpans: [spanFor('Dr. Smith'), spanFor('Johnson')],
        tokens: ['[[SUBJ:PERSON:A]]', '[[SUBJ:PERSON:B]]'],
      },
      {
        ...makeDecisionBase(),
        policyId: 'pol_tokenize_company',
        decision: 'TOKENIZE',
        appliesToSpans: [
          spanFor('Smith & Associates'),
          spanFor('Johnson LLC'),
        ],
        tokens: ['[[SUBJ:COMPANY:C]]', '[[SUBJ:COMPANY:D]]'],
      },
    ];

    const merged = mergeTokenizations(text, decisions);
    expect(merged).toBe(
      '[[SUBJ:PERSON:A]] from [[SUBJ:COMPANY:C]] discussed the merger with [[SUBJ:COMPANY:D]].'
    );
    expect(merged).not.toContain('[[SUBJ:PERSON:B]]');
  });
});

