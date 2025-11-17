import { describe, it, expect } from 'vitest';
import { sentenceSpans } from '../src/engine/extract';

describe('sentenceSpans', () => {
  it('keeps abbreviations inside the same sentence', () => {
    const text =
      'TechVentures Inc. and Global Solutions LLC announced a merger.';
    const spans = sentenceSpans(text);
    expect(spans).toHaveLength(1);
    const [span] = spans;
    expect(text.slice(span.start, span.end)).toBe(text);
  });

  it('falls back when text is empty', () => {
    const spans = sentenceSpans('');
    expect(spans).toHaveLength(1);
    expect(spans[0]).toEqual({ start: 0, end: 0 });
  });
});

