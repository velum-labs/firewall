/**
 * Financial Services Industry Catalog
 * 
 * Subjects, predicates, and policies for PCI-DSS, SOC 2, and financial privacy compliance.
 * Covers payment card data, account information, and transaction monitoring.
 */

import type { SubjectSpec, PredicateSpec } from '../../src/catalog';
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

/**
 * Financial Services Subjects - PII and Financial Identifiers
 */
export const FINANCIAL_SUBJECTS = {
  CREDIT_CARD: {
    description:
      'Credit card numbers in various formats (Visa, Mastercard, Amex, Discover). Includes both formatted and unformatted numbers.',
    examples: [
      '4532-1234-5678-9010',
      '5425233430109903',
      '378282246310005',
      '6011111111111117',
    ],
    structured: [
      {
        pattern: /\b4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,4}\b/,
        normalizer: 'digits',
        validator: (val: string) => val.length >= 13 && val.length <= 19 && isValidLuhn(val),
      },
      {
        pattern: /\b5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
        normalizer: 'digits',
        validator: (val: string) => val.length === 16 && isValidLuhn(val),
      },
      {
        pattern: /\b3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}\b/,
        normalizer: 'digits',
        validator: (val: string) => val.length === 15 && isValidLuhn(val),
      },
      {
        pattern: /\b6(?:011|5\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
        normalizer: 'digits',
        validator: (val: string) => val.length === 16 && isValidLuhn(val),
      },
    ],
  },
  SSN: {
    description:
      'Social Security Numbers in various formats (with/without dashes or spaces)',
    examples: ['123-45-6789', '123 45 6789', '123456789', 'SSN: 987-65-4321'],
    structured: [
      {
        pattern: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/,
        normalizer: 'digits',
      },
      {
        pattern: /\b\d{9}\b/,
      },
    ],
  },
  ACCOUNT_NUMBER: {
    description:
      'Bank account numbers (typically 6-17 digits) and account identifiers',
    examples: [
      'Account: 1234567890',
      'Acct #98765432',
      'Account Number: 567890123456',
    ],
    structured: {
      pattern: /\b\d{8,18}\b/,
    },
  },
  ROUTING_NUMBER: {
    description: '9-digit ABA routing transit numbers for US banks',
    examples: ['RTN: 021000021', 'Routing: 111000025', '026009593'],
    structured: {
      pattern: /\b\d{9}\b/,
      validator: isValidRoutingNumber,
    },
  },
  TRANSACTION_ID: {
    description:
      'Transaction identifiers, reference numbers, and confirmation codes',
    examples: [
      'TXN-2024-001234',
      'Ref: TX7890ABC',
      'Confirmation: C-98765',
      'Transaction ID: TID-456789',
    ],
    structured: [
      {
        pattern: /\bTXN-[A-Z0-9-]{8,32}\b/,
      },
      {
        pattern: /\bFX-\d{4}-\d{4}-\d{3}\b/,
      },
    ],
  },
  FINANCIAL_INSTITUTION: {
    description:
      'Banks, credit unions, financial services companies, and payment processors',
    examples: [
      'Wells Fargo',
      'Chase Bank',
      'First National Credit Union',
      'PayPal',
      'Stripe Inc.',
    ],
  },
  IBAN: {
    description:
      'International Bank Account Numbers (European and global standard)',
    examples: [
      'GB29NWBK60161331926819',
      'DE89370400440532013000',
      'FR1420041010050500013M02606',
    ],
    structured: {
      pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/,
      normalizer: 'uppercase',
      validator: isValidIban,
    },
  },
  SWIFT_CODE: {
    description: 'SWIFT/BIC codes for international wire transfers (8 or 11 characters)',
    examples: ['DEUTDEFF', 'CHASUS33', 'BNPAFRPP', 'SWIFT: HSBCGB2L'],
    structured: {
      pattern: /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?\b/,
      normalizer: 'uppercase',
      validator: isValidSwift,
    },
  },
  CRYPTO_ADDRESS: {
    description:
      'Cryptocurrency wallet addresses (Bitcoin, Ethereum, and other blockchain addresses)',
    examples: [
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    ],
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
  TAX_ID: {
    description:
      'Employer Identification Numbers (EIN), Tax ID Numbers (TIN), and other tax identifiers',
    examples: ['EIN: 12-3456789', 'Tax ID: 98-7654321', 'Federal Tax ID 45-6789012'],
    patterns: [
      String.raw`(?:EIN|Tax ID|TIN|Federal Tax ID):?\s*\d{2}-\d{7}`,
    ],
  },
} as const satisfies Record<string, SubjectSpec>;

/**
 * Financial Services Predicates - Transactions and Compliance Events
 */
export const FINANCIAL_PREDICATES = {
  TRANSACTION: {
    definition:
      'Financial transactions including payments, transfers, deposits, withdrawals, or purchases. Must be an actual transaction event, not general financial discussion.',
    examples: [
      'transferred $5,000 to account',
      'payment of $1,234.56 processed',
      'withdrew $500 from ATM',
      'charged $89.99 on credit card',
    ],
    negatives: [
      'typical transaction fee is',
      'how to make a transfer',
      'payment processing options',
    ],
    relatedSubjects: ['ACCOUNT_NUMBER', 'CREDIT_CARD', 'TRANSACTION_ID', 'FINANCIAL_INSTITUTION'],
  },
  FRAUD_INDICATOR: {
    definition:
      'Suspicious activity patterns, fraud signals, or anomalous behavior flagged for investigation. Must indicate potential fraud, not general fraud prevention discussion.',
    examples: [
      'multiple failed login attempts',
      'unusual spending pattern detected',
      'transaction from high-risk country',
      'velocity check triggered',
    ],
    negatives: [
      'fraud prevention best practices',
      'how to detect fraud',
      'fraud statistics show',
    ],
    relatedSubjects: ['TRANSACTION_ID', 'ACCOUNT_NUMBER', 'CREDIT_CARD'],
  },
  PCI_SCOPE_EVENT: {
    definition:
      'Events involving cardholder data that fall under PCI-DSS compliance scope. Must involve actual card data handling, not PCI compliance discussion.',
    examples: [
      'processed payment with card ending 1234',
      'stored CVV code',
      'transmitted unencrypted card data',
      'accessed cardholder database',
    ],
    negatives: [
      'PCI-DSS requirements include',
      'how to achieve PCI compliance',
      'cardholder data security best practices',
    ],
    relatedSubjects: ['CREDIT_CARD'],
  },
  KYC_DATA: {
    definition:
      'Know Your Customer information collection and verification for account opening or compliance. Must involve actual KYC data, not general KYC process discussion.',
    examples: [
      'verified identity with SSN',
      'collected proof of address',
      'customer due diligence completed',
      'beneficial owner information obtained',
    ],
    relatedSubjects: ['SSN', 'ACCOUNT_NUMBER', 'TAX_ID'],
  },
  WIRE_TRANSFER: {
    definition:
      'Wire transfer instructions and execution involving routing numbers, account numbers, and institutions. Must be actual wire transfer activity.',
    examples: [
      'initiated wire transfer to',
      'sent $10,000 via wire',
      'received incoming wire from',
      'SWIFT transfer executed',
    ],
    relatedSubjects: ['ACCOUNT_NUMBER', 'ROUTING_NUMBER', 'SWIFT_CODE', 'IBAN', 'FINANCIAL_INSTITUTION'],
  },
  ACCOUNT_OPENING: {
    definition:
      'New account application and opening processes, including personal information collection.',
    examples: [
      'opened checking account',
      'new account application received',
      'account activation completed',
    ],
    relatedSubjects: ['SSN', 'ACCOUNT_NUMBER', 'TAX_ID'],
  },
  CREDIT_APPLICATION: {
    definition:
      'Credit or loan application submissions and processing, including credit checks and underwriting.',
    examples: [
      'applied for mortgage loan',
      'credit card application approved',
      'credit score pulled',
      'underwriting decision made',
    ],
    relatedSubjects: ['SSN', 'CREDIT_CARD', 'ACCOUNT_NUMBER'],
  },
} as const satisfies Record<string, PredicateSpec>;

/**
 * Financial Services Policies - PCI-DSS and Privacy Compliance
 */
export const FINANCIAL_POLICIES = {
  pol_financial_deny_unmasked_cards: {
    id: 'pol_financial_deny_unmasked_cards',
    nl: 'DENY documents containing full, unmasked credit card numbers (PCI-DSS violation).',
    when: {
      subjects: ['CREDIT_CARD'],
      minConfidence: 0.9,
    },
    then: { action: 'DENY' },
  },
  pol_financial_tokenize_ssn: {
    id: 'pol_financial_tokenize_ssn',
    nl: 'Tokenize all Social Security Numbers for privacy protection.',
    when: {
      subjects: ['SSN'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_tokenize_accounts: {
    id: 'pol_financial_tokenize_accounts',
    nl: 'Tokenize bank account numbers and routing numbers.',
    when: {
      subjects: ['ACCOUNT_NUMBER', 'ROUTING_NUMBER'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_tokenize_transaction_ids: {
    id: 'pol_financial_tokenize_transaction_ids',
    nl: 'Tokenize transaction identifiers to preserve analytics fidelity.',
    when: {
      subjects: ['TRANSACTION_ID'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_tokenize_credit_cards: {
    id: 'pol_financial_tokenize_credit_cards',
    nl: 'Tokenize credit card numbers when redaction (not denial) is required.',
    when: {
      subjects: ['CREDIT_CARD'],
      minConfidence: 0.9,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_tokenize_transactions: {
    id: 'pol_financial_tokenize_transactions',
    nl: 'Tokenize financial transactions and bound account/card information while preserving transaction patterns.',
    when: {
      predicate: 'TRANSACTION',
      bind: {
        subjects: ['ACCOUNT_NUMBER', 'CREDIT_CARD', 'TRANSACTION_ID'],
        proximity: 'sentence',
        cardinality: '>=1',
      },
      minConfidence: {
        predicate: 0.75,
        subjects: 0.8,
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_financial_fraud_preserve: {
    id: 'pol_financial_fraud_preserve',
    nl: 'For fraud detection: TOKENIZE customer PII but preserve fraud indicator signals.',
    when: {
      predicate: 'FRAUD_INDICATOR',
      bind: {
        subjects: ['SSN', 'ACCOUNT_NUMBER', 'CREDIT_CARD'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_pci_strict: {
    id: 'pol_financial_pci_strict',
    nl: 'DENY any PCI scope violations involving unprotected cardholder data.',
    when: {
      predicate: 'PCI_SCOPE_EVENT',
      bind: {
        subjects: ['CREDIT_CARD'],
        proximity: 'sentence',
        cardinality: '>=1',
      },
      minConfidence: {
        predicate: 0.8,
      },
    },
    then: { action: 'DENY' },
  },
  pol_financial_international_accounts: {
    id: 'pol_financial_international_accounts',
    nl: 'Tokenize international account identifiers (IBAN, SWIFT codes).',
    when: {
      subjects: ['IBAN', 'SWIFT_CODE'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_crypto_privacy: {
    id: 'pol_financial_crypto_privacy',
    nl: 'Tokenize cryptocurrency addresses to protect transaction privacy.',
    when: {
      subjects: ['CRYPTO_ADDRESS'],
      minConfidence: 0.9,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_financial_masked_allow: {
    id: 'pol_financial_masked_allow',
    nl: 'Allow pre-masked card numbers (e.g., ****1234) as they are already compliant.',
    when: {
      subjects: ['CREDIT_CARD'],
    },
    unless: [
      {
        subjects: ['CREDIT_CARD'],
        minConfidence: 0.95, // High confidence for full card detection
      },
    ],
    then: { action: 'ALLOW' },
  },
} satisfies Record<string, Policy>;

export type FinancialSubjectId = keyof typeof FINANCIAL_SUBJECTS;
export type FinancialPredicateId = keyof typeof FINANCIAL_PREDICATES;
export type FinancialPolicyId = keyof typeof FINANCIAL_POLICIES;

export const financialSubjects = FINANCIAL_SUBJECTS;
export const financialPredicates = FINANCIAL_PREDICATES;
export const financialPolicies = FINANCIAL_POLICIES;

