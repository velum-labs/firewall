import type { TokenFormat } from '../tokenization';

export type Span = { start: number; end: number };

export type SubjectMention = {
  id: string;
  type: string;
  text: string;
  spans: Span[];
  confidence: number;
};

export type PredicateMention = {
  id: string;
  type: string;
  text: string;
  spans: Span[];
  confidence: number;
  bindings?: { subjects: string[]; mode: string };
};

export type Detections = {
  docId: string;
  subjects: SubjectMention[];
  predicates: PredicateMention[];
  sentences: Span[];
};

export type TriggerTokenized = {
  value: string;
  id: string;
  format: TokenFormat;
};

export type DecisionSubjectTrigger = {
  kind: 'subject';
  tokenized: TriggerTokenized;
} & Pick<SubjectMention, 'id' | 'type' | 'text' | 'spans' | 'confidence'>;

export type DecisionPredicateTrigger = {
  kind: 'predicate';
  tokenized: TriggerTokenized;
  subjects: DecisionSubjectTrigger[];
  bindings?: PredicateMention['bindings'];
} & Pick<PredicateMention, 'id' | 'type' | 'text' | 'spans' | 'confidence'>;

export type DecisionTrigger = DecisionSubjectTrigger | DecisionPredicateTrigger;

export type Decision = {
  policyId: string;
  docId: string;
  decision: 'ALLOW' | 'DENY' | 'TOKENIZE';
  confidence: number;
  appliesToSpans: Span[];
  textTokenized?: string;
  tokens?: string[];
  tokenKinds?: Array<'SUBJ' | 'PRED'>;
  explanations: string[];
  triggeredBy?: DecisionTrigger[];
};

export type LLMUsageTotals = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

