import createDebug from 'debug';
import type { Policy } from '../policy';
import type {
  Detections,
  Decision,
  Span,
  SubjectMention,
  PredicateMention,
  DecisionTrigger,
  DecisionSubjectTrigger,
} from './types';
import { applyReplacements } from '../replace';
import { makeTokenizer, type TokenFormat, type Matter } from '../tokenization';

const debug = createDebug('firewall:decide');

const inSpan = (s: Span, p: Span) => s.start >= p.start && s.end <= p.end;

type Tokenizer = ReturnType<typeof makeTokenizer>;

const toTokenized = (
  tokenizer: Tokenizer,
  tokenFormat: TokenFormat,
  matter: Matter
) => ({
  value: tokenizer.token(matter),
  id: tokenizer.id(matter),
  format: tokenFormat,
});

const toSubjectTrigger = ({
  subject,
  tokenizer,
  tokenFormat,
}: {
  subject: SubjectMention;
  tokenizer: Tokenizer;
  tokenFormat: TokenFormat;
}): DecisionSubjectTrigger => ({
  kind: 'subject',
  id: subject.id,
  type: subject.type,
  text: subject.text,
  spans: subject.spans,
  confidence: subject.confidence,
  tokenized: toTokenized(tokenizer, tokenFormat, {
    kind: 'SUBJ',
    label: subject.type,
    surface: subject.text,
  }),
});

const buildDecisionTriggers = ({
  policy,
  matches,
  det,
  tokenizer,
  tokenFormat,
}: {
  policy: Policy;
  matches: Array<SubjectMention | PredicateMention>;
  det: Detections;
  tokenizer: Tokenizer;
  tokenFormat: TokenFormat;
}): DecisionTrigger[] => {
  if (!matches.length) {
    return [];
  }
  if ('subjects' in policy.when) {
    return (matches as SubjectMention[]).map((subject) =>
      toSubjectTrigger({ subject, tokenizer, tokenFormat })
    );
  }
  return (matches as PredicateMention[]).map((predicate) => {
    const boundIds = new Set(predicate.bindings?.subjects ?? []);
    const boundSubjects = det.subjects.filter((s) => boundIds.has(s.id));
    const subjectTriggers = boundSubjects.map((subject) =>
      toSubjectTrigger({ subject, tokenizer, tokenFormat })
    );
    return {
      kind: 'predicate',
      id: predicate.id,
      type: predicate.type,
      text: predicate.text,
      spans: predicate.spans,
      confidence: predicate.confidence,
      bindings: predicate.bindings,
      subjects: subjectTriggers,
      tokenized: toTokenized(tokenizer, tokenFormat, {
        kind: 'PRED',
        label: predicate.type,
        surface: predicate.text,
        subjects: boundSubjects.map((s) => ({
          label: s.type,
          surface: s.text,
        })),
      }),
    };
  });
};

function minValue(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  let current = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < current) {
      current = values[i];
    }
  }
  return current;
}

function computeDecisionConfidence({
  policy,
  matches,
  det,
}: {
  policy: Policy;
  matches: Array<SubjectMention | PredicateMention>;
  det: Detections;
}): number {
  if (!matches.length) {
    return 0;
  }
  if ('subjects' in policy.when) {
    const subjectMatches = matches as SubjectMention[];
    const values = subjectMatches.map((match) => match.confidence ?? 0);
    return minValue(values);
  }
  const predicateMatches = matches as PredicateMention[];
  const aggregate: number[] = [];
  for (const predicate of predicateMatches) {
    const parts: number[] = [];
    if (typeof predicate.confidence === 'number') {
      parts.push(predicate.confidence);
    }
    const boundIds = new Set(predicate.bindings?.subjects ?? []);
    for (const subject of det.subjects) {
      if (boundIds.has(subject.id) && typeof subject.confidence === 'number') {
        parts.push(subject.confidence);
      }
    }
    aggregate.push(minValue(parts));
  }
  return minValue(aggregate);
}

function filterMatchesAgainstUnless({
  matches,
  policy,
  det,
}: {
  matches: Array<SubjectMention | PredicateMention>;
  policy: Policy;
  det: Detections;
}): {
  filteredMatches: Array<SubjectMention | PredicateMention>;
  exceptionApplied: boolean;
} {
  if (!policy.unless?.length) {
    return { filteredMatches: matches, exceptionApplied: false };
  }

  const exceptionApplied = policy.unless.some((rule) => {
    if ('subjects' in rule) {
      const labs = new Set(rule.subjects);
      return det.subjects.some(
        (s) => labs.has(s.type) && s.confidence >= (rule.minConfidence ?? 0.7)
      );
    }
    const predMin = typeof rule.minConfidence === 'number' 
      ? rule.minConfidence 
      : rule.minConfidence?.predicate ?? 0.8;
    return det.predicates.some(
      (p) => p.type === rule.predicate && p.confidence >= predMin
    );
  });

  return {
    filteredMatches: exceptionApplied ? [] : matches,
    exceptionApplied,
  };
}

function isAlreadyTokenized(sourceText: string, span: Span): boolean {
  const slice = sourceText.slice(span.start, span.end);
  if (!slice) return false;
  if (slice.includes('[[SUBJ:') || slice.includes('[[PRED:')) {
    return true;
  }
  if (slice.includes('](firewall://')) {
    return true;
  }
  return false;
}

function paragraphSpans(text: string): Span[] {
  const paragraphs: Span[] = [];
  const lines = text.split('\n');
  let currentStart = 0;
  let currentEnd = 0;
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = currentEnd;
    const lineEnd = lineStart + line.length;
    
    if (line.trim().length > 0) {
      if (!inParagraph) {
        currentStart = lineStart;
        inParagraph = true;
      }
      currentEnd = lineEnd + 1;
    } else {
      if (inParagraph) {
        paragraphs.push({ start: currentStart, end: currentEnd - 1 });
        inParagraph = false;
      }
      currentEnd = lineEnd + 1;
    }
  }
  
  if (inParagraph) {
    paragraphs.push({ start: currentStart, end: text.length });
  }
  
  return paragraphs.length ? paragraphs : [{ start: 0, end: text.length }];
}

export function bindWithinSentence(det: Detections, types: readonly string[]) {
  debug('Binding predicates to subjects, types filter: %o', types);
  for (const p of det.predicates) {
    const sent =
      det.sentences.find((s) => inSpan(p.spans[0], s)) ?? det.sentences[0];
    const bound = det.subjects.filter(
      (s) =>
        (!types.length || types.includes(s.type)) && inSpan(s.spans[0], sent)
    );
    p.bindings = { subjects: bound.map((b) => b.id), mode: 'sentence' };
    debug('Predicate %s (%s) bound to %d subjects: %o', p.type, p.text, bound.length, bound.map(b => ({ id: b.id, type: b.type, text: b.text })));
  }
}

export function bindWithinParagraph(det: Detections, types: readonly string[], text: string) {
  debug('Binding predicates to subjects at paragraph level, types filter: %o', types);
  const paragraphs = paragraphSpans(text);
  debug('Computed %d paragraph spans', paragraphs.length);
  
  for (const p of det.predicates) {
    const para =
      paragraphs.find((pg) => inSpan(p.spans[0], pg)) ?? paragraphs[0];
    const bound = det.subjects.filter(
      (s) =>
        (!types.length || types.includes(s.type)) && inSpan(s.spans[0], para)
    );
    p.bindings = { subjects: bound.map((b) => b.id), mode: 'paragraph' };
    debug('Predicate %s (%s) bound to %d subjects: %o', p.type, p.text, bound.length, bound.map(b => ({ id: b.id, type: b.type, text: b.text })));
  }
}

export function decideOne({
  policy,
  det,
  text,
  tokenSecret,
  tokenFormat = 'brackets',
}: {
  policy: Policy;
  det: Detections;
  text: string;
  tokenSecret: string;
  tokenFormat?: TokenFormat;
}): Decision {
  debug('=== Deciding for policy: %s ===', policy.id);
  debug('Policy: %o', policy);
  
  const tokenizer = makeTokenizer(tokenSecret, tokenFormat);

  if ('predicate' in policy.when) {
    const proximity = policy.when.bind?.proximity ?? 'sentence';
    if (proximity === 'paragraph') {
      bindWithinParagraph(det, policy.when.bind?.subjects ?? [], text);
    } else {
    bindWithinSentence(det, policy.when.bind?.subjects ?? []);
    }
  }

  const predMin =
    'predicate' in policy.when
      ? typeof policy.when.minConfidence === 'number'
        ? policy.when.minConfidence
        : policy.when.minConfidence?.predicate ?? 0.8
      : 0;
  const subjMin =
    'predicate' in policy.when
      ? typeof policy.when.minConfidence === 'number'
        ? 0.7
        : policy.when.minConfidence?.subjects ?? 0.7
      : policy.when.minConfidence ?? 0.7;

  debug('Confidence thresholds - predicate: %d, subjects: %d', predMin, subjMin);

  let matches = (() => {
    if ('subjects' in policy.when) {
      const labs = new Set(policy.when.subjects);
      debug('Subject-based matching, looking for types: %o', [...labs]);
      const matched = det.subjects.filter(
        (s) => labs.has(s.type) && s.confidence >= subjMin
      );
      debug('Matched %d subjects: %o', matched.length, matched.map(m => ({ type: m.type, text: m.text, conf: m.confidence })));
      return matched;
    } else if ('predicate' in policy.when) {
      const predRule = policy.when;
      debug('Predicate-based matching, looking for type: %s', predRule.predicate);
      const mains = det.predicates.filter(
        (p) => p.type === predRule.predicate && p.confidence >= predMin
      );
      debug('Found %d predicates matching type: %o', mains.length, mains.map(m => ({ type: m.type, text: m.text, conf: m.confidence, bindings: m.bindings })));
      
      const filtered = mains.filter((p) => {
        const need = predRule.bind?.subjects?.length ? 1 : 0;
        const bound = p.bindings?.subjects ?? [];
        debug('Checking predicate %s - bound subjects: %d, cardinality: %s, need: %d', p.text, bound.length, predRule.bind?.cardinality, need);
        
        if (predRule.bind?.cardinality === '==1' && bound.length !== 1) {
          debug('  Failed: cardinality ==1 but got %d bindings', bound.length);
          return false;
        }
        if (predRule.bind?.cardinality === '>=2' && bound.length < 2) {
          debug('  Failed: cardinality >=2 but got %d bindings', bound.length);
          return false;
        }
        if ((predRule.bind?.cardinality === '>=1' || need) && bound.length < 1) {
          debug('  Failed: cardinality >=1 (or need=%d) but got %d bindings', need, bound.length);
          return false;
        }
        const okSubs = det.subjects
          .filter((s) => bound.includes(s.id))
          .every((s) => s.confidence >= subjMin);
        debug('  All bound subjects meet confidence threshold: %s', okSubs);
        return okSubs;
      });
      debug('After filtering for bindings: %d matches', filtered.length);
      return filtered;
    }
    return [];
  })();

  const { filteredMatches, exceptionApplied } = filterMatchesAgainstUnless({
    matches,
    policy,
    det,
  });
  matches = filteredMatches;

  debug('Matches found after exceptions: %d (exception applied=%s)', matches.length, exceptionApplied);

  const triggeredBy = matches.length
    ? buildDecisionTriggers({ policy, matches, det, tokenizer, tokenFormat })
    : [];
  
  if (!matches.length) {
    const decision = {
      policyId: policy.id,
      docId: det.docId,
      decision: 'ALLOW' as const,
      confidence: 1.0,
      appliesToSpans: [],
      explanations: exceptionApplied ? ['Exception matched'] : ['No match'],
    };
    debug('Decision: ALLOW - %s', decision.explanations[0]);
    return decision;
  }

  const decisionConfidence = computeDecisionConfidence({
    policy,
    matches,
    det,
  });

  if (policy.then.action === 'DENY') {
    const spans =
      'subjects' in policy.when
        ? (matches as SubjectMention[]).flatMap((s) => s.spans)
        : (matches as PredicateMention[]).flatMap((p) => p.spans);
    return {
      policyId: policy.id,
      docId: det.docId,
      decision: 'DENY',
      confidence: decisionConfidence,
      appliesToSpans: spans,
      explanations: ['Rule matched'],
      triggeredBy: triggeredBy.length ? triggeredBy : undefined,
    };
  }

  if (policy.then.action === 'TOKENIZE') {
    const items: Array<{ span: Span; repl: string; kind: 'SUBJ' | 'PRED' }> =
      [];
    const tokenKinds: Array<'SUBJ' | 'PRED'> = [];
    if ('subjects' in policy.when) {
      for (const s of matches as SubjectMention[]) {
        const span = s.spans[0];
        if (isAlreadyTokenized(text, span)) continue;
        items.push({
          span,
          repl: tokenizer.token({
            kind: 'SUBJ',
            label: s.type,
            surface: s.text,
          }),
          kind: 'SUBJ',
        });
        tokenKinds.push('SUBJ');
      }
    } else {
      const target = policy.then.targets ?? 'both';
      for (const p of matches as PredicateMention[]) {
        const bound = det.subjects.filter((s) =>
          p.bindings?.subjects?.includes(s.id)
        );
        if (target === 'predicates' || target === 'both') {
          const span = p.spans[0];
          if (!isAlreadyTokenized(text, span)) {
            items.push({
              span,
              repl: tokenizer.token({
                kind: 'PRED',
                label: p.type,
                surface: p.text,
                subjects: bound.map((b) => ({ label: b.type, surface: b.text })),
              }),
              kind: 'PRED',
            });
            tokenKinds.push('PRED');
          }
        }
        if (target === 'subjects' || target === 'both') {
          for (const b of bound) {
            const span = b.spans[0];
            if (isAlreadyTokenized(text, span)) {
              continue;
            }
            items.push({
              span,
              repl: tokenizer.token({
                kind: 'SUBJ',
                label: b.type,
                surface: b.text,
              }),
              kind: 'SUBJ',
            });
            tokenKinds.push('SUBJ');
          }
        }
      }
    }

    const textTokenized = applyReplacements(text, items);
    return {
      policyId: policy.id,
      docId: det.docId,
      decision: 'TOKENIZE',
      confidence: decisionConfidence,
      appliesToSpans: items.map((i) => i.span),
      textTokenized,
      tokens: items.map((i) => i.repl),
      tokenKinds,
      explanations: ['Tokenized matched matter'],
      triggeredBy: triggeredBy.length ? triggeredBy : undefined,
    };
  }

  return {
    policyId: policy.id,
    docId: det.docId,
    decision: 'ALLOW',
    confidence: 1.0,
    appliesToSpans: [],
    explanations: ['Logged'],
    triggeredBy: triggeredBy.length ? triggeredBy : undefined,
  };
}

