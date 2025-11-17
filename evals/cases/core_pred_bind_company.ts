/**
 * E2E case: Tokenize financial events bound to companies
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const predBindCompanyCase = registerCase(
  defineCase({
    meta: {
      id: 'pred_bind_company',
      title: 'Predicate bound to company',
      description:
        'Should tokenize financial event and bound company within same sentence',
      owner: 'firewall',
      category: 'core',
      severity: 'blocker',
      tags: ['tokenize', 'predicate', 'company'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_fin_event_tokenize],
    text: 'Acme Corp announced an IPO in November.',
    expectations: expectTokenizedEntities([
      {
        kind: 'PRED',
        label: 'FINANCIAL_EVENT',
        surfaces: ['IPO in November'],
        targets: 'both',
      },
      {
        kind: 'SUBJ',
        label: 'COMPANY',
        surfaces: ['Acme Corp'],
        targets: 'both',
      },
    ]),
  })
);

