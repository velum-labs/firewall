export type StructuredValidator = (normalizedValue: string) => boolean;

export type StructuredSpec = {
  pattern: string | RegExp;
  flags?: string;
  group?: number;
  normalizer?: 'digits' | 'alnum' | 'uppercase' | 'lowercase';
  validator?: StructuredValidator;
  confidence?: number;
};

export type SubjectSpec = {
  description?: string;
  examples?: readonly string[];
  patterns?: readonly string[];
  structured?: StructuredSpec | readonly StructuredSpec[];
};

export type PredicateSpec = {
  definition: string;
  examples?: readonly string[];
  negatives?: readonly string[];
  relatedSubjects?: readonly string[];
  patterns?: readonly string[];
};

export type Catalog = {
  subjects: Record<string, SubjectSpec>;
  predicates: Record<string, PredicateSpec>;
};

export const defineCatalog = (c: Catalog) => c;

