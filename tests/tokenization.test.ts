/**
 * Tokenization tests
 */

import { describe, it, expect } from 'vitest';
import { makeTokenizer } from '../src/tokenization';

describe('tokenization', () => {
  const tokenizer = makeTokenizer('test-secret-key');

  it('should create stable tokens for same subject matter', () => {
    const token1 = tokenizer.token({
      kind: 'SUBJ',
      label: 'COMPANY',
      surface: 'Acme Corp',
    });
    const token2 = tokenizer.token({
      kind: 'SUBJ',
      label: 'COMPANY',
      surface: 'Acme Corp',
    });
    expect(token1).toBe(token2);
  });

  it('should create different tokens for different matter', () => {
    const token1 = tokenizer.token({
      kind: 'SUBJ',
      label: 'COMPANY',
      surface: 'Acme Corp',
    });
    const token2 = tokenizer.token({
      kind: 'SUBJ',
      label: 'COMPANY',
      surface: 'Tech Inc',
    });
    expect(token1).not.toBe(token2);
  });

  it('should normalize surface text', () => {
    const token1 = tokenizer.token({
      kind: 'SUBJ',
      label: 'COMPANY',
      surface: 'Acme Corp',
    });
    const token2 = tokenizer.token({
      kind: 'SUBJ',
      label: 'COMPANY',
      surface: '  acme corp  ', // different whitespace and case
    });
    expect(token1).toBe(token2);
  });

  it('should create predicate tokens with bindings', () => {
    const token = tokenizer.token({
      kind: 'PRED',
      label: 'FINANCIAL_EVENT',
      surface: 'IPO in November',
      subjects: [
        { label: 'COMPANY', surface: 'Acme Corp' },
        { label: 'COMPANY', surface: 'Tech Inc' },
      ],
    });
    expect(token).toMatch(/^\[\[PRED:FINANCIAL_EVENT:[A-Za-z0-9]+\]\]$/);
  });

  it('should create stable predicate tokens with same bindings', () => {
    const token1 = tokenizer.token({
      kind: 'PRED',
      label: 'FINANCIAL_EVENT',
      surface: 'IPO in November',
      subjects: [
        { label: 'COMPANY', surface: 'Acme Corp' },
        { label: 'COMPANY', surface: 'Tech Inc' },
      ],
    });
    const token2 = tokenizer.token({
      kind: 'PRED',
      label: 'FINANCIAL_EVENT',
      surface: 'IPO in November',
      subjects: [
        { label: 'COMPANY', surface: 'Tech Inc' }, // different order
        { label: 'COMPANY', surface: 'Acme Corp' },
      ],
    });
    expect(token1).toBe(token2); // order doesn't matter due to sorting
  });

  it('should have correct token format', () => {
    const token = tokenizer.token({
      kind: 'SUBJ',
      label: 'PERSON',
      surface: 'John Smith',
    });
    expect(token).toMatch(/^\[\[SUBJ:PERSON:[A-Za-z0-9]+\]\]$/);
  });

  it('should prioritize entityId when hashing subjects', () => {
    const tokenWithEntity = tokenizer.token({
      kind: 'SUBJ',
      label: 'PERSON',
      surface: 'J. Smith',
      entityId: 'entity-123',
    });
    const tokenSameEntity = tokenizer.token({
      kind: 'SUBJ',
      label: 'PERSON',
      surface: 'John Smith',
      entityId: 'entity-123',
    });
    const tokenDifferentEntity = tokenizer.token({
      kind: 'SUBJ',
      label: 'PERSON',
      surface: 'John Smith',
      entityId: 'entity-456',
    });
    expect(tokenWithEntity).toBe(tokenSameEntity);
    expect(tokenWithEntity).not.toBe(tokenDifferentEntity);
  });

  it('should include bound subject entityIds for predicates', () => {
    const tokenA = tokenizer.token({
      kind: 'PRED',
      label: 'DISCLOSURE',
      surface: 'shared data',
      subjects: [
        { label: 'PERSON', surface: 'A. Smith', entityId: 'entity-a' },
        { label: 'COMPANY', surface: 'Acme', entityId: 'entity-b' },
      ],
    });
    const tokenB = tokenizer.token({
      kind: 'PRED',
      label: 'DISCLOSURE',
      surface: 'shared data',
      subjects: [
        { label: 'PERSON', surface: 'Alice Smith', entityId: 'entity-a' },
        { label: 'COMPANY', surface: 'ACME CORP', entityId: 'entity-b' },
      ],
    });
    expect(tokenA).toBe(tokenB);
  });
});

