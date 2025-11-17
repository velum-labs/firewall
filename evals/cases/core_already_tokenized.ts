/**
 * E2E case: Input already containing token-like strings
 */

import {
  allowUnchangedRegion,
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { catalog, policies } from '../catalog/registry';

export const alreadyTokenizedCase = registerCase(
  defineCase({
    meta: {
      id: 'already_tokenized',
      title: 'Handling pre-tokenized input',
      description: 'Should handle input already containing token-like patterns',
      owner: 'firewall',
      category: 'core',
      severity: 'major',
      tags: ['tokenize', 'person', 'pretokenized'],
    },
    subjects: [catalog.subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'The user [[SUBJ:PERSON:ABC123XY]] contacted John Smith yesterday.',
    expectations: [
      expectTokenizedEntities({
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'John Smith',
      }),
      allowUnchangedRegion('[[SUBJ:PERSON:ABC123XY]]'),
    ],
  })
);

