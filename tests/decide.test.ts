import { describe, it, expect } from 'vitest';
import type { Detections } from '../src/engine/types';
import { bindWithinParagraph } from '../src/engine/decide';

const defaultText = [
  'Acme Corp announced a merger with Contoso Ltd.',
  '',
  'Globex Holdings issued a press release in Europe.',
].join('\n');

function makeDetections(source: string): Detections {
  const acmeStart = source.indexOf('Acme Corp');
  const contosoStart = source.indexOf('Contoso Ltd.');
  const globexStart = source.indexOf('Globex Holdings');
  const predicateOneStart = source.indexOf('announced a merger');
  const predicateTwoStart = source.indexOf('issued a press release');

  return {
    docId: 'test',
    subjects: [
      {
        id: 's1',
        type: 'COMPANY',
        text: 'Acme Corp',
        spans: [{ start: acmeStart, end: acmeStart + 'Acme Corp'.length }],
        confidence: 0.99,
      },
      {
        id: 's2',
        type: 'COMPANY',
        text: 'Contoso Ltd.',
        spans: [{ start: contosoStart, end: contosoStart + 'Contoso Ltd.'.length }],
        confidence: 0.99,
      },
      {
        id: 's3',
        type: 'COMPANY',
        text: 'Globex Holdings',
        spans: [{ start: globexStart, end: globexStart + 'Globex Holdings'.length }],
        confidence: 0.99,
      },
    ],
    predicates: [
      {
        id: 'p1',
        type: 'FINANCIAL_EVENT',
        text: 'announced a merger',
        spans: [
          {
            start: predicateOneStart,
            end: predicateOneStart + 'announced a merger'.length,
          },
        ],
        confidence: 0.95,
      },
      {
        id: 'p2',
        type: 'FINANCIAL_EVENT',
        text: 'issued a press release',
        spans: [
          {
            start: predicateTwoStart,
            end: predicateTwoStart + 'issued a press release'.length,
          },
        ],
        confidence: 0.95,
      },
    ],
    sentences: [{ start: 0, end: source.length }],
  };
}

describe('bindWithinParagraph', () => {
  it('binds predicates only to subjects within the same paragraph', () => {
    const det = makeDetections(defaultText);
    bindWithinParagraph(det, ['COMPANY'], defaultText);

    const firstBindings = det.predicates[0].bindings?.subjects ?? [];
    const secondBindings = det.predicates[1].bindings?.subjects ?? [];

    expect(firstBindings).toContain('s1');
    expect(firstBindings).toContain('s2');
    expect(firstBindings).not.toContain('s3');
    expect(secondBindings).toEqual(['s3']);
  });

  it('falls back to entire text when no paragraph is found', () => {
    const singleParagraphText = defaultText.replace('\n\n', '\n');
    const det = makeDetections(singleParagraphText);
    bindWithinParagraph(det, ['COMPANY'], singleParagraphText);

    const bindings = det.predicates[0].bindings?.subjects ?? [];
    expect(bindings).toContain('s1');
    expect(bindings).toContain('s2');
    expect(bindings).toContain('s3');
  });
});

