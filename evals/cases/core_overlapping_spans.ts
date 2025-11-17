/**
 * E2E case: Overlapping entity spans
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const overlappingSpansCase = registerCase(
  defineCase({
    meta: {
      id: 'overlapping_spans',
      title: 'Overlapping spans',
      description:
        'Should handle overlapping person and company mentions without corruption',
      owner: 'firewall',
      category: 'adversarial',
      severity: 'critical',
      tags: ['tokenize', 'overlap', 'person', 'company'],
    },
    subjects: [subjects.PERSON, subjects.COMPANY],
    predicates: [],
    policies: [policies.pol_tokenize_person, policies.pol_tokenize_company],
    text: 'Dr. Smith from Smith & Associates discussed the merger with Johnson LLC.',
    expectations: expectTokenizedEntities([
      {
        kind: 'SUBJ',
        label: 'PERSON',
        surfaces: ['Dr. Smith'],
      },
      {
        kind: 'SUBJ',
        label: 'COMPANY',
        surfaces: ['Smith & Associates', 'Johnson LLC'],
      },
    ]),
  })
);

