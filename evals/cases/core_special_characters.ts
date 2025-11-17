/**
 * E2E case: Special characters and edge punctuation
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies } from '../catalog/registry';
import { subjects } from '../catalog/registry';

export const specialCharactersCase = registerCase(
  defineCase({
    meta: {
      id: 'special_characters',
      title: 'Special characters',
      description: 'Should handle names with special characters and punctuation',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'person', 'punctuation'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: "Meeting with Dr. O'Brien-Smith, Mrs. García-López, and M. D'Angelo Jr.",
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      surfaces: ["Dr. O'Brien-Smith", 'Mrs. García-López', "M. D'Angelo Jr."],
    }),
  })
);

