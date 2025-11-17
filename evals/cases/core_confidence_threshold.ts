/**
 * E2E case: Confidence threshold enforcement
 */

import {
  defineCase,
  expectAllow,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const highConfidenceThresholdCase = registerCase(
  defineCase({
    meta: {
      id: 'high_confidence_threshold',
      title: 'High confidence threshold',
      description:
        'Should respect high confidence threshold (may miss ambiguous names)',
      owner: 'firewall',
      category: 'extended',
      severity: 'minor',
      tags: ['confidence', 'person', 'allow'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_high_confidence_person],
    text: 'Meeting with Smith and the team at Apple headquarters.',
    expectations: expectAllow(),
  })
);

export const lowConfidenceThresholdCase = registerCase(
  defineCase({
    meta: {
      id: 'low_confidence_threshold',
      title: 'Low confidence threshold',
      description: 'Should capture more with low confidence threshold',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['confidence', 'person', 'tokenize'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_low_confidence_person],
    text: 'Dr. Johnson and Prof. Williams attended.',
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      surfaces: ['Dr. Johnson', 'Prof. Williams'],
    }),
  })
);

