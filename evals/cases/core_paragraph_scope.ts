/**
 * E2E case: Paragraph-level scope binding
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const paragraphScopeCase = registerCase(
  defineCase({
    meta: {
      id: 'paragraph_scope',
      title: 'Paragraph scope binding',
      description: 'Should bind across sentences within same paragraph',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['binding', 'paragraph', 'predicate'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_paragraph_scope],
    text: 'TechCorp is a major technology company. The firm announced an IPO filing last week.',
    expectations: expectTokenizedEntities({
      kind: 'PRED',
      label: 'FINANCIAL_EVENT',
      surface: 'IPO',
      targets: 'both',
    }),
  })
);

