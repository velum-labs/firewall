/**
 * E2E case: Exact cardinality requirement (==1)
 */

import {
  defineCase,
  expectAllow,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const exactlyOneCompanyCase = registerCase(
  defineCase({
    meta: {
      id: 'exactly_one_company',
      title: 'Exact cardinality = 1',
      description: 'Should tokenize when exactly one company is present',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['cardinality', 'tokenize', 'company'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_exactly_one_company],
    text: 'Acme Corp filed for an IPO yesterday.',
    expectations: expectTokenizedEntities([
      {
        kind: 'PRED',
        label: 'FINANCIAL_EVENT',
        surface: 'filed for an IPO',
        targets: 'both',
      },
      {
        kind: 'SUBJ',
        label: 'COMPANY',
        surface: 'Acme Corp',
        targets: 'both',
      },
    ]),
  })
);

export const exactlyOneFailsTwoCase = registerCase(
  defineCase({
    meta: {
      id: 'exactly_one_fails_two',
      title: 'Exact cardinality fail',
      description:
        'Should not tokenize when cardinality is 2 but requires exactly 1',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['cardinality', 'allow', 'company'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_exactly_one_company],
    text: 'TechCorp and GlobalVentures announced a merger.',
    expectations: expectAllow(),
  })
);

