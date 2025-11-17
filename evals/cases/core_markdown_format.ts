/**
 * E2E case: Markdown token format
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies } from '../catalog/registry';
import { subjects } from '../catalog/registry';

export const markdownFormatCase = registerCase(
  defineCase({
    meta: {
      id: 'markdown_format',
      title: 'Markdown token format',
      description: 'Should use markdown format when specified',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['tokenize', 'person', 'markdown'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: 'Meeting with John Smith and Dr. Sarah Lee.',
    tokenFormat: 'markdown',
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      surfaces: ['John Smith', 'Dr. Sarah Lee'],
    }),
  })
);

