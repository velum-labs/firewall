/**
 * Types for E2E evaluation framework
 */

import type { Policy } from '../src/policy';
import type { TokenFormat } from '../src/tokenization';
import type { SubjectSpec, PredicateSpec } from '../src/catalog';
import type { LLMUsageTotals } from '../src/engine/types';
import type { CostBreakdown } from './cost-tracking';

export type CaseSeverity = 'blocker' | 'critical' | 'major' | 'minor';
export type CaseCategory = 'core' | 'adversarial' | 'extended' | string;

export type CaseMeta = {
  id: string;
  title?: string;
  description: string;
  owner: string;
  category: CaseCategory;
  severity: CaseSeverity;
  tags: string[];
  risk?: string;
  skip?: boolean;
  only?: boolean;
};

export type ExpectedTokenization = {
  kind: 'SUBJ' | 'PRED';
  label: string;
  surface?: string;
  regex?: string;
  targets?: 'subjects' | 'predicates' | 'both';
  count?: number;
  surfaces?: string[];
  minCount?: number;
  note?: string;
};

export type ExpectedDetection = {
  subjects?: Record<string, string[]>;
  predicates?: Record<string, string[]>;
};

export type DecisionExpectation = {
  mustDeny?: boolean | string;
  mustTokenize?: ExpectedTokenization[];
  mustAllow?: boolean;
  unlessRationale?: string;
};

export type ProcessingExpectation = {
  allowedUnchangedRegions?: Array<{ start: number; end: number } | string>;
  diffHints?: string[];
};

export type JudgeExpectation = {
  rubricNote?: string;
};

export type ExpectationSuite = {
  decisions?: DecisionExpectation;
  detections?: ExpectedDetection;
  processing?: ProcessingExpectation;
  judge?: JudgeExpectation;
};

export type NormalizedExpectationSuite = {
  decisions: DecisionExpectation;
  detections?: ExpectedDetection;
  processing: ProcessingExpectation;
  judge?: JudgeExpectation;
};

export type ExpectedIntent = {
  must_deny?: boolean | string;
  must_tokenize?: ExpectedTokenization[];
  must_allow?: boolean;
  unless_rationale?: string;
  allowed_unchanged_regions?: Array<{ start: number; end: number } | string>;
  expected_detections?: ExpectedDetection;
};

export type CaseDefinition = {
  meta: CaseMeta;
  text: string;
  subjects: SubjectSpec[];
  predicates: PredicateSpec[];
  policies: Policy[];
  expectations: ExpectationSuite | ExpectationSuite[];
  tokenFormat?: TokenFormat;
};

export type RegisteredCase = {
  id: string;
  meta: CaseMeta;
  text: string;
  subjects: SubjectSpec[];
  predicates: PredicateSpec[];
  policies: Policy[];
  expected: ExpectedIntent;
  expectations: NormalizedExpectationSuite;
  tokenFormat?: TokenFormat;
};

export type E2ECase = RegisteredCase;

export type CheckSeverity = 'BLOCKER' | 'WARN' | 'INFO';
export type CheckCategory = 'deterministic' | 'judge' | 'infra';

export type CheckResult = {
  id: string;
  label: string;
  category: CheckCategory;
  severity: CheckSeverity;
  status: 'pass' | 'fail' | 'skip';
  details: string[];
  expected?: string;
  actual?: string;
  remediation?: string;
};

export type JudgeVerdict = {
  decision_alignment: number;
  tokenization_coverage: number;
  over_redaction: number;
  binding_correctness: number;
  exception_handling: number;
  pass: boolean;
  notes: string;
};

export type ResourceCoverage = {
  subjects: Record<string, number>;
  predicates: Record<string, number>;
  policies: Record<string, number>;
};

export type E2EResult = {
  caseId: string;
  meta: CaseMeta;
  text: string;
  subjects: SubjectSpec[];
  predicates: PredicateSpec[];
  processedText: string;
  checks: CheckResult[];
  judge: JudgeVerdict;
  deterministicPass: boolean;
  pass: boolean;
  attempts: number;
  cost?: CostBreakdown;
};

export type Breakdown = {
  total: number;
  passed: number;
  failed: number;
};

export type FailureTaxonomy = Record<string, number>;

export type E2ESummary = {
  totals: {
    totalCases: number;
    passed: number;
    failed: number;
    passRate: number;
    attempts: number;
  };
  averageScores: {
    decision_alignment: number;
    tokenization_coverage: number;
    over_redaction: number;
    binding_correctness: number;
    exception_handling: number;
  };
  thresholds: {
    decision_alignment: number;
    tokenization_coverage: number;
    over_redaction: number;
    suite_pass_rate: number;
  };
  meetsThresholds: boolean;
  failedCaseIds: string[];
  tagBreakdown: Record<string, Breakdown>;
  categoryBreakdown: Record<string, Breakdown>;
  failureTaxonomy: FailureTaxonomy;
  resourceCoverage: ResourceCoverage;
  generatedAt: string;
  totalCost: {
    engineCost: number;
    judgeCost: number;
    totalCost: number;
    engineTokens: LLMUsageTotals;
    judgeTokens: LLMUsageTotals;
  };
};

export function mergeExpectationSuites(
  suites: ExpectationSuite[]
): ExpectationSuite {
  return suites.reduce<ExpectationSuite>(
    (acc, suite) => {
      acc.decisions = mergeDecisions(acc.decisions, suite.decisions);
      acc.detections = mergeDetections(acc.detections, suite.detections);
      acc.processing = mergeProcessing(acc.processing, suite.processing);
      if (suite.judge) {
        acc.judge = { ...(acc.judge ?? {}), ...suite.judge };
      }
      return acc;
    },
    {}
  );
}

function mergeDecisions(
  a?: DecisionExpectation,
  b?: DecisionExpectation
): DecisionExpectation | undefined {
  if (!a && !b) return undefined;
  if (!a) {
    return b
      ? {
          ...b,
          mustTokenize: b.mustTokenize ? [...b.mustTokenize] : undefined,
        }
      : undefined;
  }
  if (!b) {
    return {
      ...a,
      mustTokenize: a.mustTokenize ? [...a.mustTokenize] : undefined,
    };
  }
  return {
    mustAllow: b.mustAllow ?? a.mustAllow,
    mustDeny: b.mustDeny ?? a.mustDeny,
    unlessRationale: b.unlessRationale ?? a.unlessRationale,
    mustTokenize: [...(a.mustTokenize ?? []), ...(b.mustTokenize ?? [])],
  };
}

function mergeDetections(
  a?: ExpectedDetection,
  b?: ExpectedDetection
): ExpectedDetection | undefined {
  if (!a && !b) return undefined;
  if (!a) {
    return b
      ? {
          subjects: b.subjects ? { ...b.subjects } : undefined,
          predicates: b.predicates ? { ...b.predicates } : undefined,
        }
      : undefined;
  }
  if (!b) {
    return {
      subjects: a.subjects ? { ...a.subjects } : undefined,
      predicates: a.predicates ? { ...a.predicates } : undefined,
    };
  }
  return {
    subjects: { ...(a.subjects ?? {}), ...(b.subjects ?? {}) },
    predicates: { ...(a.predicates ?? {}), ...(b.predicates ?? {}) },
  };
}

function mergeProcessing(
  a?: ProcessingExpectation,
  b?: ProcessingExpectation
): ProcessingExpectation | undefined {
  if (!a && !b) return undefined;
  if (!a) {
    return b
      ? {
          allowedUnchangedRegions: b.allowedUnchangedRegions
            ? [...b.allowedUnchangedRegions]
            : undefined,
          diffHints: b.diffHints ? [...b.diffHints] : undefined,
        }
      : undefined;
  }
  if (!b) {
    return {
      allowedUnchangedRegions: a.allowedUnchangedRegions
        ? [...a.allowedUnchangedRegions]
        : undefined,
      diffHints: a.diffHints ? [...a.diffHints] : undefined,
    };
  }
  return {
    allowedUnchangedRegions: [
      ...(a.allowedUnchangedRegions ?? []),
      ...(b.allowedUnchangedRegions ?? []),
    ],
    diffHints: [...(a.diffHints ?? []), ...(b.diffHints ?? [])],
  };
}

function assertMeta(meta: CaseMeta) {
  if (!meta.id) {
    throw new Error('Case meta.id is required');
  }
  if (!meta.description) {
    throw new Error(`Case ${meta.id} missing description`);
  }
  if (!meta.owner) {
    throw new Error(`Case ${meta.id} missing owner`);
  }
  if (!meta.tags || meta.tags.length === 0) {
    throw new Error(`Case ${meta.id} must include at least one tag`);
  }
}

function normalizeExpectations(
  text: string,
  suite: ExpectationSuite
): NormalizedExpectationSuite {
  const decisions: DecisionExpectation = {
    mustAllow: suite.decisions?.mustAllow,
    mustDeny: suite.decisions?.mustDeny,
    mustTokenize: suite.decisions?.mustTokenize ?? [],
    unlessRationale: suite.decisions?.unlessRationale,
  };

  const validations: string[] = [];
  if (decisions.mustTokenize) {
    for (const exp of decisions.mustTokenize) {
      if (exp.surfaces) {
        for (const surface of exp.surfaces) {
          if (!text.includes(surface)) {
            validations.push(surface);
          }
        }
      }
      if (exp.surface && !text.includes(exp.surface)) {
        validations.push(exp.surface);
      }
    }
  }
  if (validations.length > 0) {
    throw new Error(
      `Expected surfaces not found in text: ${validations.join(', ')}`
    );
  }

  return {
    decisions,
    detections: suite.detections,
    processing: {
      allowedUnchangedRegions: suite.processing?.allowedUnchangedRegions ?? [],
      diffHints: suite.processing?.diffHints ?? [],
    },
    judge: suite.judge,
  };
}

function assertResources(def: CaseDefinition) {
  if (!def.subjects || def.subjects.length === 0) {
    throw new Error(`Case ${def.meta.id} must declare at least one subject`);
  }
  if (!def.policies || def.policies.length === 0) {
    throw new Error(`Case ${def.meta.id} must declare at least one policy`);
  }
  if (!def.predicates) {
    throw new Error(`Case ${def.meta.id} must declare predicates (use []) if none`);
  }
}

export function defineCase(def: CaseDefinition): RegisteredCase {
  assertMeta(def.meta);
  assertResources(def);
  const suites = Array.isArray(def.expectations)
    ? def.expectations
    : [def.expectations];
  const merged = mergeExpectationSuites(suites);
  const expectations = normalizeExpectations(def.text, merged);
  const policies = clonePolicies(def.policies);

  const mustTokenize = expectations.decisions.mustTokenize;
  const expected: ExpectedIntent = {
    must_deny: expectations.decisions.mustDeny,
    must_tokenize: mustTokenize && mustTokenize.length > 0 ? mustTokenize : undefined,
    must_allow: expectations.decisions.mustAllow,
    unless_rationale: expectations.decisions.unlessRationale,
    allowed_unchanged_regions: expectations.processing.allowedUnchangedRegions,
    expected_detections: expectations.detections,
  };

  return {
    id: def.meta.id,
    meta: def.meta,
    text: def.text,
    subjects: [...def.subjects],
    predicates: [...def.predicates],
    policies,
    expected,
    expectations,
    tokenFormat: def.tokenFormat,
  };
}

export function policyRequiresPredicates(policy: Policy): boolean {
  if ('predicate' in policy.when) {
    return true;
  }
  return (policy.unless ?? []).some((rule) => 'predicate' in rule);
}

function clonePolicies(policies: Policy[]): Policy[] {
  return policies.map((policy) =>
    JSON.parse(JSON.stringify(policy)) as Policy
  );
}

export function expectDenial(policyId?: string): ExpectationSuite {
  return {
    decisions: {
      mustDeny: policyId ?? true,
    },
  };
}

export function expectAllow(): ExpectationSuite {
  return {
    decisions: {
      mustAllow: true,
    },
  };
}

export function expectTokenizedEntities(
  entities: ExpectedTokenization | ExpectedTokenization[]
): ExpectationSuite {
  const list = Array.isArray(entities) ? entities : [entities];
  return {
    decisions: {
      mustTokenize: list,
    },
  };
}

export function expectDetectionMap(
  detections: ExpectedDetection
): ExpectationSuite {
  return { detections };
}

type UnchangedRegion = { start: number; end: number } | string;

export function allowUnchangedRegion(
  region: UnchangedRegion | UnchangedRegion[]
): ExpectationSuite {
  const list = Array.isArray(region) ? region : [region];
  return {
    processing: {
      allowedUnchangedRegions: list,
    },
  };
}

export function expectProcessedDiff(hints: string | string[]): ExpectationSuite {
  const list = Array.isArray(hints) ? hints : [hints];
  return {
    processing: {
      diffHints: list,
    },
  };
}

