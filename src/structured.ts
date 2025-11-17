import type { Catalog, StructuredSpec, StructuredValidator } from './catalog';
import type { SubjectMention, Span } from './engine/types';

function ensureGlobal(pattern: string | RegExp, flags?: string): RegExp {
  if (pattern instanceof RegExp) {
    const baseFlags = pattern.flags.includes('g')
      ? pattern.flags
      : `${pattern.flags}g`;
    return new RegExp(pattern.source, baseFlags);
  }
  const finalFlags =
    flags && flags.includes('g') ? flags : `${flags ?? ''}g`;
  return new RegExp(pattern, finalFlags);
}

export function detectStructuredMentions(
  text: string,
  label: string,
  spec: StructuredSpec
): SubjectMention[] {
  const pattern = ensureGlobal(spec.pattern, spec.flags);
  const matches: SubjectMention[] = [];
  for (const match of text.matchAll(pattern)) {
    if (match.index === undefined) {
      continue;
    }
    const targetGroup = spec.group ?? 0;
    const surface = match[targetGroup] ?? match[0];
    if (!surface) {
      continue;
    }
    const span =
      targetGroup === 0
        ? { start: match.index, end: match.index + match[0].length }
        : deriveGroupSpan(match, targetGroup, text);
    if (!span) {
      continue;
    }
    const normalized = normalize(surface, spec.normalizer);
    if (!passesValidation(normalized, spec.validator)) {
      continue;
    }
    matches.push({
      id: `structured-${label}-${span.start}`,
      type: label,
      text: surface,
      spans: [span],
      confidence: spec.confidence ?? 0.98,
    });
  }
  return matches;
}

export function detectStructuredSubjectsFromCatalog(
  text: string,
  labels: string[],
  catalog: Catalog
): SubjectMention[] {
  const mentions: SubjectMention[] = [];
  const seen = new Set<string>();
  for (const label of labels) {
    const subject = catalog.subjects[label];
    if (!subject?.structured) {
      continue;
    }
    const configs = Array.isArray(subject.structured)
      ? subject.structured
      : [subject.structured];
    for (const config of configs) {
      for (const mention of detectStructuredMentions(text, label, config)) {
        const span = mention.spans[0];
        const key = `${label}:${span.start}-${span.end}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        mentions.push(mention);
      }
    }
  }
  return mentions;
}

function deriveGroupSpan(
  match: RegExpMatchArray,
  groupIndex: number,
  text: string
): Span | null {
  const fullStart = match.index ?? -1;
  if (fullStart < 0) {
    return null;
  }
  const groupValue = match[groupIndex];
  if (!groupValue) {
    return null;
  }
  const relative = match[0].indexOf(groupValue);
  if (relative >= 0) {
    const start = fullStart + relative;
    return { start, end: start + groupValue.length };
  }
  const fallbackStart = text.indexOf(groupValue, fullStart);
  if (fallbackStart === -1) {
    return null;
  }
  return { start: fallbackStart, end: fallbackStart + groupValue.length };
}

function normalize(
  value: string,
  mode: StructuredSpec['normalizer']
): string {
  if (!mode) return value;
  switch (mode) {
    case 'digits':
      return value.replace(/\D+/g, '');
    case 'alnum':
      return value.replace(/[^A-Za-z0-9]+/g, '');
    case 'uppercase':
      return value.toUpperCase();
    case 'lowercase':
      return value.toLowerCase();
    default:
      return value;
  }
}

function passesValidation(
  value: string,
  validator?: StructuredValidator
): boolean {
  if (!validator) return true;
  try {
    return validator(value);
  } catch {
    return false;
  }
}


