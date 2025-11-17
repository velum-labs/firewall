/**
 * E2E case: Predicate cardinality requirements
 */

import {
  defineCase,
  expectAllow,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const cardinalityFailCase = registerCase(
  defineCase({
    meta: {
      id: 'cardinality_fail',
      title: 'Cardinality fail',
      description:
        'Should not tokenize when cardinality requirement not met (needs >=2 companies)',
      owner: 'firewall',
      category: 'adversarial',
      severity: 'major',
      tags: ['cardinality', 'tokenize', 'predicate'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_require_two_companies],
    text: 'Acme Corp filed for an IPO in November.',
    expectations: expectAllow(),
  })
);

export const cardinalityPassCase = registerCase(
  defineCase({
    meta: {
      id: 'cardinality_pass',
      title: 'Cardinality success',
      description:
        'Should tokenize when cardinality requirement met (has >=2 companies)',
      owner: 'firewall',
      category: 'adversarial',
      severity: 'major',
      tags: ['cardinality', 'tokenize', 'predicate'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_require_two_companies],
    text: 'TechCorp and GlobalVentures announced a merger agreement.',
    expectations: expectTokenizedEntities({
      kind: 'PRED',
      label: 'FINANCIAL_EVENT',
      surface: 'merger',
      targets: 'both',
    }),
  })
);

