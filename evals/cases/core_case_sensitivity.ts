/**
 * E2E case: Case sensitivity and normalization
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const mixedCaseCase = registerCase(
  defineCase({
    meta: {
      id: 'mixed_case',
      title: 'Case sensitivity',
      description: 'Should handle mixed case and all caps names',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'person', 'case'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'JOHN SMITH met with sarah johnson and Dr. MICHAEL CHEN.',
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      surfaces: ['JOHN SMITH', 'sarah johnson', 'Dr. MICHAEL CHEN'],
    }),
  })
);

