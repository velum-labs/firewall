import { defineCatalog } from '../../src/catalog';
import type { Policy } from '../../src/policy';

// Validator helper functions for structured detection
function isValidLuhn(raw: string): boolean {
  const digits = raw.replace(/\s+/g, '');
  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (Number.isNaN(digit)) {
      return false;
    }
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function isValidIban(raw: string): boolean {
  const cleaned = raw.replace(/\s+/g, '').toUpperCase();
  if (cleaned.length < 15 || cleaned.length > 34) {
    return false;
  }
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  let expanded = '';
  for (const ch of rearranged) {
    if (/[A-Z]/.test(ch)) {
      expanded += (ch.charCodeAt(0) - 55).toString();
    } else {
      expanded += ch;
    }
  }
  let remainder = 0;
  for (const digit of expanded) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

function isValidRoutingNumber(value: string): boolean {
  if (value.length !== 9) return false;
  const digits = value.split('').map((d) => Number(d));
  const checksum =
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    (digits[2] + digits[5] + digits[8]);
  return checksum % 10 === 0;
}

function isValidSwift(value: string): boolean {
  return value.length === 8 || value.length === 11;
}

const SUBJECTS = {
  PERSON: {
    description:
      'Named individuals including titles (Dr., Prof., Mr., Mrs.) and full or partial names',
    examples: ['John Smith', 'Dr. Lee', 'Sarah Johnson', 'Prof. Williams'],
  },
  COMPANY: {
    description:
      'Business entities, corporations, funds, and organizations (including suffixes like Inc., LLC, Corp., Ltd.)',
    examples: ['Acme Capital', 'TechCorp Inc.', 'Global Ventures LLC', 'Smith & Associates'],
  },
  EMAIL: {
    description: 'Email address',
    patterns: [String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`],
  },
  SSN: {
    description: 'US Social Security Number',
    structured: [
      {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/,
        normalizer: 'digits',
      },
      {
        pattern: /\b\d{3}\s+\d{2}\s+\d{4}\b/,
        normalizer: 'digits',
      },
      {
        pattern: /\b\d{9}\b/,
      },
    ],
  },
  CREDIT_CARD: {
    description: 'Credit card number',
    structured: {
      pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{3,4}\b/,
      normalizer: 'digits',
      validator: (val: string) => val.length >= 13 && val.length <= 19 && isValidLuhn(val),
    },
  },
  IBAN: {
    description: 'International Bank Account Number',
    structured: {
      pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/,
      normalizer: 'uppercase',
      validator: isValidIban,
    },
  },
  SWIFT_CODE: {
    description: 'SWIFT/BIC code',
    structured: {
      pattern: /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?\b/,
      normalizer: 'uppercase',
      validator: isValidSwift,
    },
  },
  ROUTING_NUMBER: {
    description: 'US ABA routing number',
    structured: {
      pattern: /\b\d{9}\b/,
      validator: isValidRoutingNumber,
    },
  },
  ACCOUNT_NUMBER: {
    description: 'Bank account number',
    structured: {
      pattern: /\b\d{10,18}\b/,
    },
  },
  CRYPTO_ADDRESS: {
    description: 'Cryptocurrency wallet address',
    structured: [
      {
        pattern: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/,
      },
      {
        pattern: /\bbc1[a-z0-9]{39,87}\b/,
      },
      {
        pattern: /\b0x[a-fA-F0-9]{40,42}\b/,
      },
      {
        pattern: /\b[LM][a-km-zA-HJ-NP-Z1-9]{26,33}\b/,
      },
      {
        pattern: /\bq[a-z0-9]{41}\b/,
      },
      {
        pattern: /\br[a-zA-Z0-9]{24,34}\b/,
      },
      {
        pattern: /\baddr1[a-z0-9]{53,98}\b/,
      },
    ],
  },
  TRANSACTION_ID: {
    description: 'Transaction or reference identifier',
    structured: [
      {
        pattern: /\b[A-Z]{2,4}-\d{4}-\d{4,8}-\d{4,8}\b/,
      },
      {
        pattern: /\bTXN-[A-Z0-9-]{8,32}\b/,
      },
      {
        pattern: /\bFX-\d{4}-\d{4}-\d{3}\b/,
      },
    ],
  },
  MRN: {
    description: 'Medical Record Number',
    structured: [
      {
        pattern: /\bMRN-\d{6}\b/,
      },
      {
        pattern: /\bMR#\d{6}\b/,
      },
      {
        pattern: /\bMedical Record:\s*\d{6}\b/,
        group: 0,
      },
      {
        pattern: /\bEMR:\d{6}\b/,
      },
    ],
  },
  CASE_NUMBER: {
    description: 'Legal case number',
    structured: [
      {
        pattern: /\b\d:\d{2}-cv-\d{5}-[A-Z]{3}\b/,
      },
      {
        pattern: /\b\d{2}-CV-\d{5}\b/,
      },
      {
        pattern: /\b\d{4}-CA-\d{6}\b/,
      },
      {
        pattern: /\bCR-\d{4}-\d{5}\b/,
      },
    ],
  },
  DATE_OF_BIRTH: {
    description: 'Date of birth',
    structured: [
      {
        pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
      },
      {
        pattern: /\b\d{4}-\d{2}-\d{2}\b/,
      },
      {
        pattern: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/,
      },
      {
        pattern: /\b\d{1,2}-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2,4}\b/,
      },
      {
        pattern: /\b\d{1,2}-\d{1,2}-\d{2,4}\b/,
      },
      {
        pattern: /\bBorn on:?\s*\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4}\b/,
      },
    ],
  },
  PATIENT_IDENTIFIER: {
    description: 'Patient name or identifier in healthcare context',
    examples: ['John Doe', 'Patient Smith'],
  },
  HEALTHCARE_PROVIDER: {
    description: 'Healthcare provider name',
    examples: ['Dr. Smith', 'Nurse Johnson'],
  },
  MEDICATION: {
    description: 'Medication or drug name',
    examples: ['Metformin', 'Insulin Glargine', 'Lisinopril'],
  },
  FINANCIAL_INSTITUTION: {
    description: 'Bank or financial institution name',
    examples: ['JPMorgan Chase', 'Deutsche Bank', 'Wells Fargo'],
  },
  CLIENT_NAME: {
    description: 'Legal client name',
    examples: ['Robert Chen', 'Anderson Corp'],
  },
  ATTORNEY_NAME: {
    description: 'Attorney or lawyer name',
    examples: ['Sarah Mitchell, Esq.', 'Michael Chen'],
  },
  WITNESS_NAME: {
    description: 'Witness name in legal context',
    examples: ['Maria Rodriguez', 'Dr. Park'],
  },
  CONFIDENTIAL_BUSINESS_INFO: {
    description: 'Confidential business information, trade secrets, or proprietary data',
    examples: ['proprietary catalyst formula', 'trade secret manufacturing process'],
  },
} as const;

const PREDICATES = {
  FINANCIAL_EVENT: {
    definition:
      'Definite corporate finance events like IPO filings, completed mergers/acquisitions, funding rounds, or financial offerings. Must be stated as fact, not speculation.',
    examples: ['filed for IPO', 'announced merger with', 'completed acquisition of', 'raised Series A'],
    negatives: ['considering an IPO', 'may acquire', 'rumored merger'],
    relatedSubjects: ['COMPANY'],
  },
  QUOTE_OR_CITATION: {
    definition:
      'Quoted or cited text (news quotes, “according to…”, block quotes) indicating the content is reported speech rather than a factual statement from the author.',
    examples: ['“Acme plans an IPO next year”', 'according to sources', 'the spokesperson said'],
  },
} as const;

export type SubjectId = keyof typeof SUBJECTS;
export type PredicateId = keyof typeof PREDICATES;

export const catalog = defineCatalog({
  subjects: SUBJECTS,
  predicates: PREDICATES,
});

export const subjects = SUBJECTS;
export const predicates = PREDICATES;

const POLICIES = {
  pol_tokenize_person: {
    id: 'pol_tokenize_person',
    nl: 'Tokenize personal names.',
    when: { subjects: ['PERSON'] },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_tokenize_company: {
    id: 'pol_tokenize_company',
    nl: 'Tokenize company names.',
    when: { subjects: ['COMPANY'] },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_deny_email: {
    id: 'pol_deny_email',
    nl: 'Block any document containing email addresses.',
    when: { subjects: ['EMAIL'], minConfidence: 0.9 },
    then: { action: 'DENY' },
  },
  pol_fin_event_tokenize: {
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
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_fin_event_tokenize_with_quote_unless: {
    id: 'pol_fin_event_tokenize_with_quote_unless',
    nl: 'Tokenize financial events unless they appear inside quotes or citations.',
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
  },
  pol_require_two_companies: {
    id: 'pol_require_two_companies',
    nl: 'Tokenize events that mention at least two companies.',
    when: {
      predicate: 'FINANCIAL_EVENT',
      bind: {
        subjects: ['COMPANY'],
        proximity: 'sentence',
        cardinality: '>=2',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_exactly_one_company: {
    id: 'pol_exactly_one_company',
    nl: 'Tokenize only when exactly one company is bound.',
    when: {
      predicate: 'FINANCIAL_EVENT',
      bind: {
        subjects: ['COMPANY'],
        proximity: 'sentence',
        cardinality: '==1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_paragraph_scope: {
    id: 'pol_paragraph_scope',
    nl: 'Allow binding across sentences within the same paragraph.',
    when: {
      predicate: 'FINANCIAL_EVENT',
      bind: {
        subjects: ['COMPANY'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_high_confidence_person: {
    id: 'pol_high_confidence_person',
    nl: 'Tokenize people only with very high confidence.',
    when: { subjects: ['PERSON'], minConfidence: 0.95 },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_low_confidence_person: {
    id: 'pol_low_confidence_person',
    nl: 'Tokenize people with low confidence threshold.',
    when: { subjects: ['PERSON'], minConfidence: 0.5 },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
} satisfies Record<string, Policy>;

export type PolicyId = keyof typeof POLICIES;

export const subjectsRegistry = SUBJECTS;
export const predicatesRegistry = PREDICATES;
export const policies = POLICIES;

