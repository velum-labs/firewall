/**
 * E2E case: Unicode normalization (NFKC) in tokenization
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies } from '../catalog/registry';
import { subjects } from '../catalog/registry';

export const unicodeNfkcCase = registerCase(
  defineCase({
    meta: {
      id: 'unicode_nfkc',
      title: 'Unicode normalization',
      description: 'Should normalize Unicode (NFKC) to produce stable tokens',
      owner: 'firewall',
      category: 'core',
      severity: 'major',
      tags: ['tokenize', 'unicode', 'person'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'Meeting with José Müller and café owner François.',
    expectations: expectTokenizedEntities([
      {
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'José Müller',
      },
      {
        kind: 'SUBJ',
        label: 'PERSON',
        surface: 'François',
      },
    ]),
  })
);

