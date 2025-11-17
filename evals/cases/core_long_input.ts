/**
 * E2E case: Long input with multiple entities
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import { policies } from '../catalog/registry';
import { subjects } from '../catalog/registry';

export const longInputCase = registerCase(
  defineCase({
    meta: {
      id: 'long_input',
      title: 'Long input stress',
      description: 'Should handle long text with many entity mentions efficiently',
      owner: 'firewall',
      category: 'adversarial',
      severity: 'critical',
      tags: ['tokenize', 'person', 'long'],
    },
    subjects: [subjects.PERSON],
    predicates: [],
    policies: [policies.pol_tokenize_person],
    text: `
    In a meeting yesterday, John Smith, Sarah Johnson, and Dr. Michael Chen discussed 
    the quarterly results. John Smith presented the findings, while Sarah Johnson 
    provided feedback. Dr. Michael Chen raised concerns about the methodology.
    
    Later in the day, Emily Rodriguez and David Kim joined the discussion. Emily Rodriguez
    suggested alternative approaches, and David Kim agreed with her assessment. John Smith
    took notes throughout the session.
    
    The team, including John Smith, Sarah Johnson, Dr. Michael Chen, Emily Rodriguez,
    and David Kim, decided to reconvene next week for further analysis.
  `.trim(),
    expectations: expectTokenizedEntities({
      kind: 'SUBJ',
      label: 'PERSON',
      count: 16,
    }),
  })
);

