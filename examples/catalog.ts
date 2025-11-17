/**
 * Example catalog definitions
 */

import { defineCatalog } from '../src/catalog';

export const catalog = defineCatalog({
  subjects: {
    PERSON: {
      description: 'Named individuals including titles (Dr., Prof., Mr., Mrs.) and full or partial names',
      examples: ['John Smith', 'Dr. Lee', 'Sarah Johnson', 'Prof. Williams'],
    },
    COMPANY: {
      description: 'Business entities, corporations, funds, and organizations (including suffixes like Inc., LLC, Corp., Ltd.)',
      examples: ['Acme Capital', 'TechCorp Inc.', 'Global Ventures LLC', 'Smith & Associates'],
    },
    EMAIL: {
      description: 'Email address',
      patterns: [
        String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`,
      ],
    },
  },
  predicates: {
    FINANCIAL_EVENT: {
      definition: 'Definite corporate finance events like IPO filings, completed mergers/acquisitions, funding rounds, or financial offerings. Must be stated as fact, not speculation.',
      examples: [
        'filed for IPO',
        'announced merger with',
        'completed acquisition of',
        'raised Series A',
      ],
      negatives: [
        'considering an IPO',
        'may acquire',
        'rumored merger',
      ],
      relatedSubjects: ['COMPANY'],
    },
    QUOTE_OR_CITATION: {
      definition: 'Direct quotations from third parties, enclosed in quotation marks',
      patterns: [
        String.raw`[""][^""]{3,}[""]`,  // curly quotes
        String.raw`"[^"]{3,}"`,          // straight quotes
      ],
      examples: [
        '"The market is volatile," said the analyst',
        '"We expect growth," according to the CEO',
      ],
    },
  },
});

