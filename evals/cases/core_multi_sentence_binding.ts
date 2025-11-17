/**
 * E2E case: Multi-sentence binding boundaries
 */

import {
  allowUnchangedRegion,
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const multiSentenceBindingCase = registerCase(
  defineCase({
    meta: {
      id: 'multi_sentence_binding',
      title: 'Sentence-local bindings',
      description: 'Should bind only within same sentence, not across sentences',
      owner: 'firewall',
      category: 'adversarial',
      severity: 'critical',
      tags: ['binding', 'predicate', 'sentence'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_fin_event_tokenize],
    text: 'TechCorp is a major player. Acme Inc filed for an IPO yesterday.',
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'PRED',
          label: 'FINANCIAL_EVENT',
          surfaces: ['filed for an IPO'],
          targets: 'both',
        },
        {
          kind: 'SUBJ',
          label: 'COMPANY',
          surfaces: ['Acme Inc'],
          targets: 'both',
        },
      ]),
      allowUnchangedRegion('TechCorp is a major player.'),
    ],
  })
);

