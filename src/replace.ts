import type { Decision, Span } from './engine/types';

type ReplacementItem = { span: Span; repl: string; kind: 'SUBJ' | 'PRED' };

export function applyReplacements(
  text: string,
  items: ReplacementItem[]
): string {
  const sorted = [...items].sort((a, b) => b.span.start - a.span.start);
  let out = text;
  for (const it of sorted) {
    out = out.slice(0, it.span.start) + it.repl + out.slice(it.span.end);
  }
  return out;
}

const spansOverlap = (a: Span, b: Span): boolean =>
  a.start < b.end && b.start < a.end;

export function selectNonOverlapping(items: ReplacementItem[]): ReplacementItem[] {
  const candidates = [...items].sort((a, b) => {
    const priorityA = a.kind === 'SUBJ' ? 0 : 1;
    const priorityB = b.kind === 'SUBJ' ? 0 : 1;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    const lenA = a.span.end - a.span.start;
    const lenB = b.span.end - b.span.start;
    if (lenA !== lenB) {
      return lenB - lenA;
    }
    return b.span.start - a.span.start;
  });

  const selected: ReplacementItem[] = [];
  for (const candidate of candidates) {
    const overlaps = selected.some((chosen) =>
      spansOverlap(candidate.span, chosen.span)
    );
    if (!overlaps) {
      selected.push(candidate);
    }
  }

  return selected;
}

export function mergeTokenizations(text: string, decisions: Decision[]): string {
  const replacements: ReplacementItem[] = [];

  for (const decision of decisions) {
    if (decision.decision !== 'TOKENIZE' || !decision.tokens?.length) {
      continue;
    }

    const spans = decision.appliesToSpans ?? [];
    const kinds = decision.tokenKinds ?? [];
    const count = Math.min(spans.length, decision.tokens.length);
    for (let i = 0; i < count; i += 1) {
      const span = spans[i];
      const token = decision.tokens[i];
      if (
        !span ||
        typeof span.start !== 'number' ||
        typeof span.end !== 'number' ||
        span.start >= span.end
      ) {
        continue;
      }
      const kind = kinds[i] ?? 'SUBJ';
      replacements.push({ span, repl: token, kind });
    }
  }

  if (replacements.length === 0) {
    return text;
  }

  const filtered = selectNonOverlapping(replacements);
  if (filtered.length === 0) {
    return text;
  }

  return applyReplacements(text, filtered);
}

