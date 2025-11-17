/**
 * E2E case: Numbers and dates in context
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies } from '../catalog/registry';
import { subjects } from '../catalog/registry';

export const numbersAndDatesCase = registerCase(
  defineCase({
    meta: {
      id: 'numbers_and_dates',
      title: 'Numbers & dates',
      description: 'Should handle names with numbers and dates nearby',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'person', 'numbers'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'John Smith (born 1985) and Sarah Lee #42 completed the project on 2024-01-15.',
    expectations: expectTokenizedEntities([
      {
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'John Smith',
      },
      {
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'Sarah Lee',
      },
    ]),
  })
);

