export type Scope = 'sentence' | 'paragraph' | 'doc' | { token: number };

export type SubjectRule = {
  subjects: readonly string[];
  scope?: Scope;
  minConfidence?: number;
};

export type PredicateRule = {
  predicate: string;
  bind?: {
    subjects?: readonly string[];
    proximity?: Scope;
    cardinality?: '>=1' | '==1' | '>=2';
  };
  minConfidence?: { predicate?: number; subjects?: number } | number;
};

export type Policy = {
  id: string;
  nl?: string;
  when: SubjectRule | PredicateRule;
  unless?: Array<SubjectRule | PredicateRule>;
  then:
    | { action: 'ALLOW' }
    | { action: 'DENY' }
    | { action: 'TOKENIZE'; targets?: 'subjects' | 'predicates' | 'both' };
};

