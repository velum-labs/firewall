/**
 * E2E case: Unless condition with quotes/citations
 */

import { defineCase, registerCase } from '../case-registry';
import { policies, subjects, predicates } from '../catalog/registry';

export const unlessQuoteCase = registerCase(
  defineCase({
    meta: {
      id: 'unless_quote',
      title: 'Unless quote',
      description: 'Should allow when financial event is in a quote (unless condition)',
      owner: 'firewall',
      category: 'extended',
      severity: 'major',
      tags: ['allow', 'quote', 'unless'],
    },
    subjects: [subjects.COMPANY],
    predicates: [predicates.FINANCIAL_EVENT],
    policies: [policies.pol_fin_event_tokenize_with_quote_unless],
    text: '"Acme Corp is having an IPO in November," said the source.',
    expectations: {
      decisions: {
        mustAllow: true,
        unlessRationale: 'Content is quoted, should skip tokenization',
      },
    },
  })
);

