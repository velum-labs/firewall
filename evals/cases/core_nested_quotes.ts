/**
 * E2E case: Nested or complex quote patterns
 */

import { defineCase, registerCase } from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const nestedQuotesCase = registerCase(
  defineCase({
    meta: {
      id: 'nested_quotes',
      title: 'Nested quotes',
      description: 'Should handle nested quotes and complex punctuation',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['allow', 'quote', 'unless'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_fin_event_tokenize_with_quote_unless],
    text: 'The analyst said, "TechCorp\'s IPO filing was surprising," according to sources.',
    expectations: {
      decisions: {
        mustAllow: true,
        unlessRationale: 'Content is quoted despite complex punctuation',
      },
    },
  })
);

