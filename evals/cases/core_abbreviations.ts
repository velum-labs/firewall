/**
 * E2E case: Abbreviations and company suffixes
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const abbreviationsCase = registerCase(
  defineCase({
    meta: {
      id: 'abbreviations',
      title: 'Company abbreviations',
      description:
        'Should handle company names with abbreviations (Inc., LLC, Corp.)',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'company', 'abbreviation'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_fin_event_tokenize, policies.pol_tokenize_company],
    text: 'TechVentures Inc. and Global Solutions LLC announced a merger. DataCorp Corp. was not involved.',
    expectations: expectTokenizedEntities([
      {
        kind: 'PRED',
        label: 'FINANCIAL_EVENT',
        surface: 'merger',
        targets: 'both',
      },
      {
        kind: 'SUBJ',
        label: 'COMPANY',
        regex: '\\[\\[SUBJ:COMPANY:[A-Za-z0-9]+\\]\\]',
      },
    ]),
  })
);

