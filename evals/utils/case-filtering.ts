import type { E2ECase } from "../types";
import type { FirewallEvaliteConfig } from "../evalite/config";

/**
 * Apply filters to test cases based on the provided configuration.
 * Supports filtering by:
 * - Case set (specific ordered list of case IDs)
 * - Case filters (filter by specific case IDs)
 * - Tag filters (cases must have all specified tags)
 *
 * @param cases - Array of test cases to filter
 * @param config - Configuration object containing filter criteria
 * @returns Filtered array of test cases
 */
export function applyFilters(
  cases: E2ECase[],
  config: FirewallEvaliteConfig
): E2ECase[] {
  // If a specific case set is provided, use it and maintain order
  if (config.caseSet && config.caseSet.length > 0) {
    const lookup = new Map(cases.map((tc) => [tc.id, tc]));
    const ordered: E2ECase[] = [];
    for (const id of config.caseSet) {
      const match = lookup.get(id);
      if (match) {
        ordered.push(match);
      }
    }
    return ordered;
  }

  let filtered = [...cases];

  // Apply case ID filters
  if (config.caseFilters.length > 0) {
    const byId = new Set(config.caseFilters);
    filtered = filtered.filter((tc) => byId.has(tc.id));
  }

  // Apply tag filters (case must have all specified tags)
  if (config.tagFilters.length > 0) {
    filtered = filtered.filter((tc) =>
      config.tagFilters.every((tag) => tc.meta.tags.includes(tag))
    );
  }

  return filtered;
}

/**
 * Apply meta filters to test cases (skip and only).
 * 
 * @param cases - Array of test cases to filter
 * @returns Filtered array of test cases with skip/only applied
 */
export function applyMetaFilters(cases: E2ECase[]): E2ECase[] {
  // Check if there are any "only" cases
  const onlyCases = cases.filter((tc) => tc.meta.only);

  // If there are "only" cases, use only those
  if (onlyCases.length > 0) {
    return onlyCases;
  }

  // Otherwise, filter out skipped cases
  return cases.filter((tc) => !tc.meta.skip);
}

