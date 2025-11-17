import { readdir } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Minimatch } from 'minimatch';
import type { ExpectedDetection, RegisteredCase } from './types';
import { policyRequiresPredicates } from './types';
export {
  defineCase,
  expectAllow,
  expectDenial,
  expectDetectionMap,
  expectProcessedDiff,
  expectTokenizedEntities,
  allowUnchangedRegion,
} from './types';
export type {
  E2ECase,
  CaseMeta,
  RegisteredCase,
  ExpectationSuite,
  ExpectedTokenization,
  ExpectedDetection,
} from './types';

const CASE_DIR = fileURLToPath(new URL('./cases', import.meta.url));

const predicatesEnabledEnv = process.env.FIREWALL_PREDICATES_ENABLED;
const predicatesEnabled =
  (predicatesEnabledEnv?.trim().toLowerCase() ?? '') === '1' ||
  (predicatesEnabledEnv?.trim().toLowerCase() ?? '') === 'true' ||
  (predicatesEnabledEnv?.trim().toLowerCase() ?? '') === 'yes';

const registry = new Map<string, RegisteredCase>();

export function registerCase(testCase: RegisteredCase): RegisteredCase {
  const requiresPredicates = testCase.policies.some(policyRequiresPredicates);
  const finalCase =
    !predicatesEnabled && requiresPredicates
      ? stripPredicatesFromCase(testCase)
      : testCase;
  if (registry.has(testCase.id)) {
    throw new Error(`Duplicate case id registered: ${testCase.id}`);
  }
  registry.set(finalCase.id, finalCase);
  return finalCase;
}

export function getCaseById(id: string): RegisteredCase | undefined {
  return registry.get(id);
}

export function clearRegistry() {
  registry.clear();
}

export type RegistryQuery = {
  includeSkipped?: boolean;
  tags?: string[];
  only?: boolean;
};

export function getAllCases(query: RegistryQuery = {}): RegisteredCase[] {
  const values = Array.from(registry.values());
  const hasOnly = values.some((c) => c.meta.only);
  let filtered = values;
  if (query.only || hasOnly) {
    filtered = filtered.filter((c) => c.meta.only);
  }
  if (!query.includeSkipped) {
    filtered = filtered.filter((c) => !c.meta.skip);
  }
  if (query.tags && query.tags.length > 0) {
    filtered = filtered.filter((c) =>
      query.tags?.every((tag) => c.meta.tags.includes(tag))
    );
  }
  return filtered.sort((a, b) => a.id.localeCompare(b.id));
}

export function getCasesByTag(tag: string): RegisteredCase[] {
  return getAllCases({ includeSkipped: true }).filter((c) =>
    c.meta.tags.includes(tag)
  );
}

type LoadOptions = {
  glob?: string;
  root?: string;
  ignore?: string[];
};

export async function loadCasesFromGlob(
  options: LoadOptions = {}
): Promise<void> {
  const root = options.root ?? CASE_DIR;
  const globPattern = options.glob ?? '**/*.ts';
  const ignorePatterns = options.ignore ?? ['**/*.d.ts'];

  const matcher = new Minimatch(globPattern, { dot: false, matchBase: true });
  const ignoreMatchers = ignorePatterns.map(
    (pattern) => new Minimatch(pattern, { dot: false, matchBase: true })
  );

  const files = await collectFiles(root);
  const filtered = files.filter((file) => {
    const rel = relative(root, file);
    if (ignoreMatchers.some((m) => m.match(rel))) {
      return false;
    }
    return matcher.match(rel);
  });

  for (const file of filtered) {
    if (extname(file) !== '.ts') continue;
    const rel = relative(root, file);
    if (rel === 'index.ts') continue;
    await import(pathToFileURL(file).href);
  }
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolved = join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(resolved);
      }
      return resolved;
    })
  );
  return files.flat();
}

function stripPredicatesFromCase(testCase: RegisteredCase): RegisteredCase {
  const policiesWithoutPredicates = testCase.policies.filter(
    (policy) => !policyRequiresPredicates(policy)
  );
  const expectations = stripPredicateExpectations(testCase.expectations);
  let expected = stripPredicateExpectedIntent(testCase.expected);

  const hasDecisionIntent =
    Boolean(expectations.decisions.mustAllow) ||
    Boolean(expectations.decisions.mustDeny) ||
    (expectations.decisions.mustTokenize?.length ?? 0) > 0;

  let decisions = expectations.decisions;
  if (!hasDecisionIntent) {
    decisions = {
      ...decisions,
      mustAllow: true,
      mustDeny: undefined,
      mustTokenize: [],
    };
    expected = {
      ...expected,
      must_allow: true,
      must_deny: undefined,
      must_tokenize: undefined,
    };
  }

  return {
    ...testCase,
    predicates: [],
    policies: policiesWithoutPredicates,
    expectations: {
      ...expectations,
      decisions,
    },
    expected,
  };
}

function stripPredicateExpectations(
  expectations: RegisteredCase['expectations']
): RegisteredCase['expectations'] {
  const mustTokenize =
    expectations.decisions.mustTokenize?.filter(
      (token) => token.kind !== 'PRED'
    ) ?? [];
  return {
    ...expectations,
    decisions: {
      ...expectations.decisions,
      mustTokenize,
    },
    detections: stripPredicateDetections(expectations.detections),
  };
}

function stripPredicateExpectedIntent(
  expected: RegisteredCase['expected']
): RegisteredCase['expected'] {
  const mustTokenize =
    expected.must_tokenize?.filter((token) => token.kind !== 'PRED') ?? [];
  return {
    ...expected,
    must_tokenize: mustTokenize.length > 0 ? mustTokenize : undefined,
    expected_detections: stripPredicateDetections(expected.expected_detections),
  };
}

function stripPredicateDetections(
  detections?: ExpectedDetection
): ExpectedDetection | undefined {
  if (!detections) {
    return undefined;
  }
  const subjects = cloneDetectionMap(detections.subjects);
  if (!subjects) {
    return undefined;
  }
  return { subjects };
}

function cloneDetectionMap(
  source?: Record<string, string[]>
): Record<string, string[]> | undefined {
  if (!source) return undefined;
  const entries = Object.entries(source).map(([label, values]) => [
    label,
    [...values],
  ]);
  if (entries.length === 0) {
    return undefined;
  }
  return Object.fromEntries(entries);
}

