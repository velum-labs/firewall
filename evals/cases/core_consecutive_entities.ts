/**
 * E2E case: Consecutive entities without separators
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const consecutiveEntitiesCase = registerCase(
  defineCase({
    meta: {
      id: 'consecutive_entities',
      title: 'Consecutive entities',
      description: 'Should handle consecutive entities in lists',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'person', 'list'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'Attendees: John Smith, Sarah Johnson, Michael Chen, Emily Rodriguez, David Kim.',
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      count: 5,
      surfaces: [
        'John Smith',
        'Sarah Johnson',
        'Michael Chen',
        'Emily Rodriguez',
        'David Kim',
      ],
    }),
  })
);

export const colonSeparatedCase = registerCase(
  defineCase({
    meta: {
      id: 'colon_separated',
      title: 'Colon separated',
      description: 'Should handle entities after colons and labels',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'person', 'labels'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'CEO: John Smith, CFO: Sarah Johnson, CTO: Michael Chen.',
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      count: 3,
      surfaces: ['John Smith', 'Sarah Johnson', 'Michael Chen'],
    }),
  })
);

