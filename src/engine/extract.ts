import {
  generateObject,
  type LanguageModel,
  type LanguageModelUsage,
} from 'ai';
import { z } from 'zod/v4';
import createDebug from 'debug';
import type { Catalog } from '../catalog';
import type { Policy } from '../policy';
import type {
  Detections,
  LLMUsageTotals,
  PredicateMention,
  Span,
  SubjectMention,
} from './types';
import { resolveQuoteSpan } from './quoteSpan';
import { buildSubjectExtractionPrompt, buildPredicateExtractionPrompt } from './prompts';
import { detectStructuredSubjectsFromCatalog } from '../structured';

const debug = createDebug('firewall:extract');
const HAS_SENTENCE_SEGMENTER =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function';

function createZeroUsage(): LLMUsageTotals {
  return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
}

function accumulateUsage(
  target: LLMUsageTotals,
  usage?: LanguageModelUsage
): void {
  if (!usage) {
    return;
  }
  target.inputTokens += usage.inputTokens ?? 0;
  target.outputTokens += usage.outputTokens ?? 0;
  target.totalTokens += usage.totalTokens ?? 0;
}

export function sentenceSpans(text: string): Span[] {
  if (!text.length) {
    return [{ start: 0, end: 0 }];
  }

  if (HAS_SENTENCE_SEGMENTER) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const spans: Span[] = [];
    for (const part of segmenter.segment(text)) {
      const segment = part.segment ?? '';
      if (!segment.trim().length) {
        continue;
      }
      const start = part.index ?? 0;
      spans.push({ start, end: start + segment.length });
    }
    if (spans.length) {
      return spans;
    }
  }

  const fallback: Span[] = [];
  const rx = /[^.!?]+[.!?]+|\S+$/g;
  for (const match of text.matchAll(rx)) {
    const start = match.index ?? 0;
    fallback.push({ start, end: start + match[0].length });
  }
  return fallback.length ? fallback : [{ start: 0, end: text.length }];
}

function dedupeMentions<T extends { type: string; spans: Span[] }>(xs: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of xs) {
    const k = `${x.type}@${x.spans[0].start}-${x.spans[0].end}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

function spanKey(span: Span): string {
  return `${span.start}-${span.end}`;
}

function expandRepeatedSubjects(list: SubjectMention[], fullText: string): void {
  const canonical = new Map<
    string,
    { text: string; type: string; confidence: number }
  >();

  for (const subj of list) {
    const key = `${subj.type}::${subj.text}`;
    const confidence = subj.confidence ?? 0.8;
    const stored = canonical.get(key);
    if (!stored || confidence > stored.confidence) {
      canonical.set(key, { text: subj.text, type: subj.type, confidence });
    }
  }

  const existing = new Set(list.map((s) => `${s.type}:${spanKey(s.spans[0])}`));

  for (const info of canonical.values()) {
    if (!info.text) continue;
    let offset = 0;
    while (offset < fullText.length) {
      const idx = fullText.indexOf(info.text, offset);
      if (idx === -1) {
        break;
      }
      const span = { start: idx, end: idx + info.text.length };
      const entryKey = `${info.type}:${spanKey(span)}`;
      if (!existing.has(entryKey)) {
        list.push({
          id: `exp-s-${info.type}-${span.start}`,
          type: info.type,
          text: info.text,
          spans: [span],
          confidence: info.confidence,
        });
        existing.add(entryKey);
      }
      offset = idx + 1;
    }
  }
}

function deriveLabelSets(
  policies: Policy[],
  catalog: Catalog,
  predicatesEnabled: boolean
): {
  subjectsUsed: string[];
  predicatesUsed: string[];
} {
  const subSet = new Set<string>();
  const predSet = new Set<string>();
  for (const p of policies) {
    if ('subjects' in p.when) p.when.subjects.forEach((s) => subSet.add(s));
    if (predicatesEnabled && 'predicate' in p.when) {
      predSet.add(p.when.predicate);
      const rel = catalog.predicates[p.when.predicate]?.relatedSubjects ?? [];
      rel.forEach((s) => subSet.add(s));
      p.when.bind?.subjects?.forEach((s) => subSet.add(s));
    }
    (p.unless ?? []).forEach((u) => {
      if ('subjects' in u) u.subjects.forEach((s) => subSet.add(s));
      if (predicatesEnabled && 'predicate' in u) predSet.add(u.predicate);
    });
  }
  return { subjectsUsed: [...subSet], predicatesUsed: [...predSet] };
}

function collectPatternSubjects(
  text: string,
  subjectsUsed: string[],
  catalog: Catalog
): SubjectMention[] {
  const subjects: SubjectMention[] = [];
  for (const s of subjectsUsed) {
    for (const pat of catalog.subjects[s]?.patterns ?? []) {
      const re = new RegExp(pat, 'g');
      for (const m of text.matchAll(re)) {
        const start = m.index ?? 0;
        const end = start + m[0].length;
        subjects.push({
          id: `rx-s-${s}-${start}`,
          type: s,
          text: m[0],
          spans: [{ start, end }],
          confidence: 0.99,
        });
      }
    }
  }
  return subjects;
}

function collectPatternPredicates(
  text: string,
  predicatesUsed: string[],
  catalog: Catalog
): PredicateMention[] {
  const predicates: PredicateMention[] = [];
  for (const p of predicatesUsed) {
    for (const pat of catalog.predicates[p]?.patterns ?? []) {
      const re = new RegExp(pat, 'g');
      for (const m of text.matchAll(re)) {
        const start = m.index ?? 0;
        const end = start + m[0].length;
        predicates.push({
          id: `rx-p-${p}-${start}`,
          type: p,
          text: m[0],
          spans: [{ start, end }],
          confidence: 0.9,
        });
      }
    }
  }
  return predicates;
}

async function llmExtractSubjects(
  ctx: { model: LanguageModel; temperature?: number },
  params: {
    subjectsForLLM: string[];
    text: string;
    catalog: Catalog;
  }
): Promise<{ mentions: SubjectMention[]; usage?: LanguageModelUsage }> {
  const { subjectsForLLM, text, catalog } = params;
  const promptS = buildSubjectExtractionPrompt(subjectsForLLM, catalog, text);

  const schemaS = z.object({
    subjects: z.array(
      z.object({
        type: z.enum(subjectsForLLM as [string, ...string[]]),
        quote: z.string().min(1),
        pre: z.string().optional(),
        post: z.string().optional(),
        confidence: z.number().min(0).max(1).optional().default(0.8),
      })
    ),
  });

  debug('LLM subject extraction prompt: %s', promptS);

  const { object: subjObj, usage } = await generateObject({
    model: ctx.model,
    temperature: ctx.temperature ?? 0,
    schema: schemaS,
    prompt: promptS,
  });

  debug('LLM subject extraction result: %o', subjObj);
  debug('Extracted %d subjects from LLM', subjObj.subjects.length);

  const mentions: SubjectMention[] = [];
  for (const m of subjObj.subjects) {
    const span = resolveQuoteSpan(text, m.quote, m.pre, m.post);
    if (span) {
      mentions.push({
        id: `llm-s-${m.type}-${span.start}`,
        type: m.type,
        text: text.slice(span.start, span.end),
        spans: [span],
        confidence: m.confidence,
      });
      debug(
        'Resolved subject %s at [%d,%d]: "%s"',
        m.type,
        span.start,
        span.end,
        text.slice(span.start, span.end)
      );
    } else {
      debug(
        'Failed to resolve quote for subject %s: "%s" (pre: "%s", post: "%s")',
        m.type,
        m.quote,
        m.pre ?? '',
        m.post ?? ''
      );
    }
  }
  return { mentions, usage };
}

async function llmExtractPredicates(
  ctx: { model: LanguageModel; temperature?: number },
  params: {
    predicatesForLLM: string[];
    text: string;
    catalog: Catalog;
    knownSubjects: Array<{ type: string; text: string }>;
  }
): Promise<{ mentions: PredicateMention[]; usage?: LanguageModelUsage }> {
  const { predicatesForLLM, text, catalog, knownSubjects } = params;
  const promptP = buildPredicateExtractionPrompt(
    predicatesForLLM,
    catalog,
    text,
    knownSubjects
  );

  const schemaP = z.object({
    predicates: z.array(
      z.object({
        type: z.enum(predicatesForLLM as [string, ...string[]]),
        quote: z.string().min(1),
        pre: z.string().optional(),
        post: z.string().optional(),
        confidence: z.number().min(0).max(1).optional().default(0.85),
      })
    ),
  });

  debug('LLM predicate extraction prompt: %s', promptP);
  debug('Conditioning on %d known subjects', knownSubjects.length);

  const { object: predObj, usage } = await generateObject({
    model: ctx.model,
    temperature: ctx.temperature ?? 0,
    schema: schemaP,
    prompt: promptP,
  });

  debug('LLM predicate extraction result: %o', predObj);
  debug('Extracted %d predicates from LLM', predObj.predicates.length);

  const mentions: PredicateMention[] = [];
  for (const m of predObj.predicates) {
    const span = resolveQuoteSpan(text, m.quote, m.pre, m.post);
    if (span) {
      mentions.push({
        id: `llm-p-${m.type}-${span.start}`,
        type: m.type,
        text: text.slice(span.start, span.end),
        spans: [span],
        confidence: m.confidence,
      });
      debug(
        'Resolved predicate %s at [%d,%d]: "%s"',
        m.type,
        span.start,
        span.end,
        text.slice(span.start, span.end)
      );
    } else {
      debug(
        'Failed to resolve quote for predicate %s: "%s" (pre: "%s", post: "%s")',
        m.type,
        m.quote,
        m.pre ?? '',
        m.post ?? ''
      );
    }
  }
  return { mentions, usage };
}

export async function extractForPolicies(
  ctx: { model: LanguageModel; temperature?: number },
  {
    text,
    docId,
    catalog,
    policies,
    structuredOnly = false,
    predicatesEnabled = true,
  }: {
    text: string;
    docId: string;
    catalog: Catalog;
    policies: Policy[];
    structuredOnly?: boolean;
    predicatesEnabled?: boolean;
  }
): Promise<{ detections: Detections; usage: LLMUsageTotals }> {
  const { subjectsUsed, predicatesUsed } = deriveLabelSets(
    policies,
    catalog,
    predicatesEnabled
  );

  debug('Extracting for text: %s', text);
  debug('Subjects to extract: %o', subjectsUsed);
  debug('Predicates to extract: %o', predicatesUsed);

  const usageTotals = createZeroUsage();

  const subjects: SubjectMention[] = collectPatternSubjects(
    text,
    subjectsUsed,
    catalog
  );

  const deterministicSubjects = detectStructuredSubjectsFromCatalog(
    text,
    subjectsUsed,
    catalog
  );
  subjects.push(...deterministicSubjects);

  const predicates: PredicateMention[] = predicatesEnabled
    ? collectPatternPredicates(text, predicatesUsed, catalog)
    : [];

  const subjectTypesPresent = new Set(subjects.map((s) => s.type));
  const subjectsForLLM = subjectsUsed.filter((label) => !subjectTypesPresent.has(label));
  const canSkipSubjectLLM =
    structuredOnly &&
    subjectsForLLM.length === 0 &&
    predicatesUsed.length === 0;

  if (subjectsForLLM.length && !canSkipSubjectLLM) {
    const { mentions, usage } = await llmExtractSubjects(
      ctx,
      {
        subjectsForLLM,
        text,
        catalog,
      }
    );
    accumulateUsage(usageTotals, usage);
    subjects.push(...mentions);
  }

  if (predicatesEnabled) {
    const predicateTypesPresent = new Set(predicates.map((p) => p.type));
    const predicatesForLLM = predicatesUsed.filter(
      (label) => !predicateTypesPresent.has(label)
    );
    if (predicatesForLLM.length) {
      const knownSubjects = subjects.map((s) => ({
        type: s.type,
        text: s.text,
      }));
      const { mentions, usage } = await llmExtractPredicates(
        ctx,
        {
          predicatesForLLM,
          text,
          catalog,
          knownSubjects,
        }
      );
      accumulateUsage(usageTotals, usage);
      predicates.push(...mentions);
    }
  }

  expandRepeatedSubjects(subjects, text);

  const result = {
    docId,
    subjects: dedupeMentions(subjects),
    predicates: dedupeMentions(predicates),
    sentences: sentenceSpans(text),
  };

  debug('Final detections - subjects: %o', result.subjects);
  debug('Final detections - predicates: %o', result.predicates);
  debug('Final detections - sentences: %o', result.sentences);

  return { detections: result, usage: usageTotals };
}

