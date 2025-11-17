/**
 * Quote span resolution tests
 */

import { describe, it, expect } from 'vitest';
import { resolveQuoteSpan } from '../src/engine/quoteSpan';

describe('resolveQuoteSpan', () => {
  it('should resolve unique quote without anchors', () => {
    const text = 'John Smith met with Dr. Sarah Lee yesterday.';
    const span = resolveQuoteSpan(text, 'John Smith');
    expect(span).toEqual({ start: 0, end: 10 });
  });

  it('should return null for quote not found', () => {
    const text = 'Hello world';
    const span = resolveQuoteSpan(text, 'missing');
    expect(span).toBeNull();
  });

  it('should return null for duplicate quote without anchors', () => {
    const text = 'Apple released a new Apple product.';
    const span = resolveQuoteSpan(text, 'Apple');
    expect(span).toBeNull();
  });

  it('should disambiguate with pre anchor', () => {
    const text = 'Apple released a new Apple product.';
    const span = resolveQuoteSpan(text, 'Apple', 'new ');
    expect(span).toEqual({ start: 21, end: 26 }); // second "Apple"
  });

  it('should disambiguate with post anchor', () => {
    const text = 'Apple released a new Apple product.';
    const span = resolveQuoteSpan(text, 'Apple', undefined, ' released');
    expect(span).toEqual({ start: 0, end: 5 }); // first "Apple"
  });

  it('should disambiguate with both pre and post anchors', () => {
    const text = 'The cat sat. The cat ran. The cat jumped.';
    const span = resolveQuoteSpan(text, 'cat', 'The ', ' ran');
    expect(span).toEqual({ start: 17, end: 20 }); // middle "cat"
  });

  it('should handle partial anchor matches', () => {
    const text = 'Contact us: test@example.com or info@example.com';
    // "example.com" appears twice, use post anchor to pick first
    const span = resolveQuoteSpan(text, 'example.com', 'test@', ' or');
    expect(span).toEqual({ start: 17, end: 28 }); // first occurrence
  });

  it('should handle first occurrence when empty pre anchor', () => {
    const text = 'Apple pie and Apple pie are both good.';
    // First occurrence matches better with empty pre and ' are' post
    const span = resolveQuoteSpan(text, 'Apple pie', '', ' are');
    // Second occurrence matches ' are' post anchor
    expect(span).toEqual({ start: 14, end: 23 });
  });

  it('should handle quote at start of text', () => {
    const text = 'Beginning of the sentence continues here.';
    const span = resolveQuoteSpan(text, 'Beginning');
    expect(span).toEqual({ start: 0, end: 9 });
  });

  it('should handle quote at end of text', () => {
    const text = 'This is the end';
    const span = resolveQuoteSpan(text, 'end');
    expect(span).toEqual({ start: 12, end: 15 });
  });

  it('should prefer exact anchor match over no match', () => {
    const text = 'First test case. Second test run. Third test scenario.';
    const span = resolveQuoteSpan(text, 'test', 'Second ', ' run');
    expect(span).toEqual({ start: 24, end: 28 }); // "test" in "Second test run"
  });

  it('should handle multi-word quotes', () => {
    const text = 'TechCorp Inc. filed for an IPO yesterday. AcmeCo also filed for an IPO.';
    const span = resolveQuoteSpan(text, 'filed for an IPO', 'TechCorp Inc. ');
    expect(span).toEqual({ start: 14, end: 30 }); // first occurrence
  });

  it('should handle quotes with punctuation', () => {
    const text = 'Email: test@example.com or call us.';
    const span = resolveQuoteSpan(text, 'test@example.com');
    expect(span).toEqual({ start: 7, end: 23 });
  });

  it('should return null when multiple quotes match anchors equally', () => {
    const text = 'The person named John and another person named John.';
    // Both "John" have "person named " before them with equal match quality
    const span = resolveQuoteSpan(text, 'John', 'person named ');
    // Both have same score, so returns null due to ambiguity
    expect(span).toBeNull();
  });

  it('should disambiguate when one anchor matches better', () => {
    const text = 'A person John walked by. Another guy named John Smith.';
    // Second John has better match for "named " prefix
    const span = resolveQuoteSpan(text, 'John', 'named ');
    expect(span).toEqual({ start: 43, end: 47 }); // second John
  });

  it('should handle very short quotes', () => {
    const text = 'Some text here with a character a again';
    const span = resolveQuoteSpan(text, 'a', 'with ', ' character');
    // Should find the 'a' between "with " and " character"
    expect(span).toEqual({ start: 20, end: 21 });
  });

  it('should handle case-sensitive matching', () => {
    const text = 'Apple and apple are different.';
    const span = resolveQuoteSpan(text, 'apple');
    expect(span).toEqual({ start: 10, end: 15 }); // lowercase only
  });

  it('should handle complex real-world example', () => {
    const text = 'Acme Corp announced an IPO in November. This IPO is expected to raise $500M.';
    const span = resolveQuoteSpan(text, 'IPO', 'an ', ' in November');
    expect(span).toEqual({ start: 23, end: 26 }); // first IPO
  });

  it('should split anchors that include the quote text', () => {
    const text =
      'John Smith met with Dr. Sarah Lee. Later, John Smith spoke to the team.';
    const firstSpan = resolveQuoteSpan(text, 'John Smith', 'John Smith met with');
    expect(firstSpan).toEqual({ start: 0, end: 10 });

    const secondSpan = resolveQuoteSpan(
      text,
      'John Smith',
      undefined,
      'spoke to the team'
    );
    expect(secondSpan).toEqual({ start: 42, end: 52 });
  });
});

