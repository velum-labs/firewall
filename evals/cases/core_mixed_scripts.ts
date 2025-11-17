/**
 * E2E case: Mixed scripts and internationalization
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies } from '../catalog/registry';
import { subjects } from '../catalog/registry';

export const mixedScriptsCase = registerCase(
  defineCase({
    meta: {
      id: 'mixed_scripts',
      title: 'Mixed scripts',
      description: 'Should handle names in multiple scripts (Latin, Cyrillic, CJK)',
      owner: 'firewall',
      category: 'adversarial',
      severity: 'critical',
      tags: ['tokenize', 'person', 'i18n'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: '会議の参加者: John Smith, Алексей Иванов, 田中太郎, and María García.',
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      surfaces: ['John Smith', 'Алексей Иванов', '田中太郎', 'María García'],
    }),
  })
);

