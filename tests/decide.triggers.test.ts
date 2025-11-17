import { describe, it, expect } from 'vitest';
import { decideOne } from '../src/engine/decide';
import type { Policy } from '../src/policy';
import type { Detections } from '../src/engine/types';
import { makeTokenizer } from '../src/tokenization';

const tokenSecret = 'unit-test-secret';
const tokenizer = makeTokenizer(tokenSecret);

describe('decision triggers', () => {
  it('reports subject matches that deny a policy', () => {
    const policy: Policy = {
      id: 'pol_subj_deny',
      when: { subjects: ['PERSON'], minConfidence: 0.5 },
      then: { action: 'DENY' },
    };

    const detections: Detections = {
      docId: 'doc-1',
      subjects: [
        {
          id: 's1',
          type: 'PERSON',
          text: 'Alice',
          spans: [{ start: 0, end: 5 }],
          confidence: 0.92,
        },
      ],
      predicates: [],
      sentences: [{ start: 0, end: 5 }],
    };

    const decision = decideOne({
      policy,
      det: detections,
      text: 'Alice',
      tokenSecret,
    });

    expect(decision.decision).toBe('DENY');
    expect(decision.triggeredBy).toBeDefined();
    expect(decision.triggeredBy).toHaveLength(1);
    const trigger = decision.triggeredBy?.[0];
    expect(trigger?.kind).toBe('subject');
    expect(trigger).toMatchObject({
      id: 's1',
      type: 'PERSON',
      text: 'Alice',
    });
    const expectedTokenized = {
      value: tokenizer.token({
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'Alice',
      }),
      id: tokenizer.id({
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'Alice',
      }),
      format: 'brackets' as const,
    };
    expect(trigger?.tokenized).toEqual(expectedTokenized);
  });

  it('reports predicate matches and their bound subjects', () => {
    const policy: Policy = {
      id: 'pol_pred_deny',
      when: {
        predicate: 'LEAKED',
        bind: { subjects: ['COMPANY'], cardinality: '>=1' },
      },
      then: { action: 'DENY' },
    };

    const detections: Detections = {
      docId: 'doc-2',
      subjects: [
        {
          id: 's2',
          type: 'COMPANY',
          text: 'Contoso Ltd',
          spans: [{ start: 0, end: 11 }],
          confidence: 0.94,
        },
      ],
      predicates: [
        {
          id: 'p1',
          type: 'LEAKED',
          text: 'leaked confidential data',
          spans: [{ start: 12, end: 36 }],
          confidence: 0.91,
        },
      ],
      sentences: [{ start: 0, end: 36 }],
    };

    const decision = decideOne({
      policy,
      det: detections,
      text: 'Contoso Ltd leaked confidential data',
      tokenSecret,
    });

    expect(decision.decision).toBe('DENY');
    expect(decision.triggeredBy).toBeDefined();
    expect(decision.triggeredBy).toHaveLength(1);
    const [trigger] = decision.triggeredBy ?? [];
    expect(trigger?.kind).toBe('predicate');
    if (trigger?.kind === 'predicate') {
      expect(trigger.subjects).toHaveLength(1);
      expect(trigger.subjects[0]).toMatchObject({
        kind: 'subject',
        id: 's2',
        type: 'COMPANY',
      });
      expect(trigger.tokenized).toEqual({
        value: tokenizer.token({
          kind: 'PRED',
          label: 'LEAKED',
          surface: 'leaked confidential data',
          subjects: [{ label: 'COMPANY', surface: 'Contoso Ltd' }],
        }),
        id: tokenizer.id({
          kind: 'PRED',
          label: 'LEAKED',
          surface: 'leaked confidential data',
          subjects: [{ label: 'COMPANY', surface: 'Contoso Ltd' }],
        }),
        format: 'brackets',
      });
      expect(trigger.subjects[0]?.tokenized).toEqual({
        value: tokenizer.token({
          kind: 'SUBJ',
          label: 'COMPANY',
          surface: 'Contoso Ltd',
        }),
        id: tokenizer.id({
          kind: 'SUBJ',
          label: 'COMPANY',
          surface: 'Contoso Ltd',
        }),
        format: 'brackets',
      });
    }
  });
});

