/**
 * E2E case: Empty or minimal input
 */

import { defineCase, expectAllow, registerCase } from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const emptyInputCase = registerCase(
  defineCase({
    meta: {
      id: 'empty_input',
      title: 'Empty input',
      description: 'Should handle empty input gracefully',
      owner: 'firewall',
      category: 'extended',
      severity: 'minor',
      tags: ['allow', 'empty'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: '',
    expectations: expectAllow(),
  })
);

export const whitespaceOnlyCase = registerCase(
  defineCase({
    meta: {
      id: 'whitespace_only',
      title: 'Whitespace-only input',
      description: 'Should handle whitespace-only input',
      owner: 'firewall',
      category: 'extended',
      severity: 'minor',
      tags: ['allow', 'empty'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: '   \n\t  ',
    expectations: expectAllow(),
  })
);

