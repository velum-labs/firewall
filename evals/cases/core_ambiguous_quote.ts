/**
 * E2E case: Ambiguous duplicate quotes requiring anchors
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const ambiguousQuoteCase = registerCase(
  defineCase({
    meta: {
      id: 'ambiguous_quote',
      title: 'Duplicate name anchors',
      description: 'Should handle duplicate name occurrences with LLM anchors',
      owner: 'firewall',
      category: 'core',
      severity: 'major',
      tags: ['tokenize', 'person', 'anchors'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'John Smith met with Dr. Sarah Lee. Later, John Smith spoke to the team.',
    expectations: expectTokenizedEntities([
      {
        kind: 'SUBJ',
        label: 'PERSON',
        surfaces: ['John Smith', 'John Smith', 'Dr. Sarah Lee'],
      },
    ]),
  })
);

