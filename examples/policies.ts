/**
 * Example policy definitions
 */

import type { Policy } from '../src/policy';

// Predicate policy: tokenize both the event span and bound company mentions
export const PolIPO: Policy = {
  id: 'pol_fin_event_tokenize',
  nl: 'Tokenize financial events related to companies.',
  when: {
    predicate: 'FINANCIAL_EVENT',
    bind: {
      subjects: ['COMPANY'],
      proximity: 'sentence',
      cardinality: '>=1',
    },
  },
  unless: [
    {
      predicate: 'QUOTE_OR_CITATION',
      minConfidence: { predicate: 0.85 },
    },
  ],
  then: { action: 'TOKENIZE', targets: 'both' },
};

// Subject-only policy: deny documents that expose emails
export const PolNoEmail: Policy = {
  id: 'pol_deny_emails',
  nl: 'Block any document containing email addresses.',
  when: {
    subjects: ['EMAIL'],
    minConfidence: 0.9,
  },
  then: { action: 'DENY' },
};

// Subject-only policy: tokenize PERSON names
export const PolTokenizeNames: Policy = {
  id: 'pol_tokenize_person',
  nl: 'Tokenize personal names.',
  when: {
    subjects: ['PERSON'],
  },
  then: { action: 'TOKENIZE', targets: 'subjects' },
};

// Allow policy for logging
export const PolAllowAll: Policy = {
  id: 'pol_allow_all',
  nl: 'Allow all content for logging purposes.',
  when: {
    subjects: ['PERSON', 'COMPANY'],
    minConfidence: 0.5,
  },
  then: { action: 'ALLOW' },
};

