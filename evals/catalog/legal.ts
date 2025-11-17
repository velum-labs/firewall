/**
 * Legal Industry Catalog
 * 
 * Subjects, predicates, and policies for attorney-client privilege, work product,
 * and legal discovery compliance.
 */

import type { SubjectSpec, PredicateSpec } from '../../src/catalog';
import type { Policy } from '../../src/policy';

/**
 * Legal Subjects - Case Identifiers and Party Information
 */
export const LEGAL_SUBJECTS = {
  CASE_NUMBER: {
    description:
      'Court case identifiers and docket numbers in various jurisdiction formats',
    examples: [
      '23-CV-12345',
      '2023-CA-001234',
      'CR-2023-0045',
      'No. 1:23-cv-00456',
      'Case No. 2023-L-000789',
    ],
    patterns: [
      String.raw`\b\d{2,4}-[A-Z]{2,3}-\d{4,6}\b`, // 23-CV-12345
      String.raw`\b(?:No\.|Case No\.|Docket)\s*\d{1,2}:\d{2}-[a-z]{2}-\d{5}\b`, // No. 1:23-cv-00456
      String.raw`\b[A-Z]{2}-\d{4}-\d{4,6}\b`, // CR-2023-0045
      String.raw`\b\d{4}-[A-Z]{1,3}-\d{6}\b`, // 2023-CA-001234
    ],
  },
  CLIENT_NAME: {
    description:
      'Names of clients in legal representation contexts (not general person names)',
    examples: [
      'client John Smith',
      'our client, Mary Johnson',
      'representing Sarah Williams',
    ],
  },
  ATTORNEY_NAME: {
    description:
      'Names of attorneys, lawyers, and legal counsel in professional contexts',
    examples: [
      'Attorney Robert Chen',
      'counsel for plaintiff, Jane Doe',
      'Esq. Michael Brown',
    ],
  },
  OPPOSING_PARTY: {
    description:
      'Names of opposing parties, defendants, or adverse parties in litigation',
    examples: [
      'defendant ABC Corp',
      'opposing party John Doe',
      'adverse party Smith Industries',
    ],
  },
  COURT_NAME: {
    description:
      'Names of courts, tribunals, and judicial bodies',
    examples: [
      'United States District Court',
      'Superior Court of California',
      'Court of Appeals',
      'Supreme Court',
    ],
  },
  JUDGE_NAME: {
    description:
      'Names of judges, magistrates, and judicial officers',
    examples: [
      'Judge Sarah Thompson',
      'Hon. Michael Rodriguez',
      'Magistrate Judge Williams',
    ],
  },
  WITNESS_NAME: {
    description:
      'Names of witnesses in depositions, trials, or investigations',
    examples: [
      'witness John Anderson',
      'deponent Mary Smith',
      'testified that',
    ],
  },
  DOCKET_NUMBER: {
    description:
      'Docket numbers and filing identifiers',
    examples: [
      'Docket No. 2023-0456',
      'Filing #789012',
      'ECF No. 34',
    ],
    patterns: [
      String.raw`(?:Docket|Filing|ECF)\s+(?:No\.|#)\s*\d{2,8}`,
    ],
  },
  CONFIDENTIAL_BUSINESS_INFO: {
    description:
      'Trade secrets, proprietary information, and confidential business data mentioned in legal contexts',
    examples: [
      'proprietary formula',
      'confidential customer list',
      'trade secret manufacturing process',
    ],
  },
  PRIVILEGE_MARKER: {
    description:
      'Textual markers that explicitly label content as attorney-client privileged or attorney work product',
    patterns: [
      String.raw`\bATTORNEY[-\s]?CLIENT PRIVILEGED\b`,
      String.raw`\bATTORNEY WORK PRODUCT\b`,
      String.raw`\bCONFIDENTIAL LEGAL ADVICE\b`,
      String.raw`\bPRIVILEGED(?: AND CONFIDENTIAL)?\b`,
    ],
  },
} as const satisfies Record<string, SubjectSpec>;

/**
 * Legal Predicates - Privileged Communications and Legal Actions
 */
export const LEGAL_PREDICATES = {
  PRIVILEGED_COMMUNICATION: {
    definition:
      'Attorney-client privileged communications, confidential legal consultations, or protected legal advice. Must be actual privileged communication, not general legal discussion.',
    examples: [
      'attorney-client privileged discussion regarding',
      'confidential legal advice about',
      'privileged communication between counsel and client',
      'seeking legal counsel on',
    ],
    negatives: [
      'attorney-client privilege generally protects',
      'what is privileged communication',
      'privilege can be waived if',
    ],
    relatedSubjects: ['CLIENT_NAME', 'ATTORNEY_NAME'],
  },
  WORK_PRODUCT: {
    definition:
      'Attorney work product, litigation strategy, case analysis, or legal research prepared in anticipation of litigation. Must be actual work product, not definition or discussion.',
    examples: [
      'litigation strategy memo',
      'case analysis shows weakness in',
      'prepared in anticipation of litigation',
      'attorney work product regarding witness credibility',
    ],
    negatives: [
      'work product doctrine protects',
      'what qualifies as work product',
      'work product immunity applies when',
    ],
    relatedSubjects: ['CLIENT_NAME', 'CASE_NUMBER', 'ATTORNEY_NAME'],
  },
  LEGAL_ADVICE: {
    definition:
      'Legal opinions, counsel, recommendations, or professional legal guidance provided by an attorney to a client.',
    examples: [
      'I advise you to file a motion',
      'my legal opinion is that',
      'recommend settling for',
      'counsel advises against',
    ],
    negatives: [
      'legal advice should be sought from',
      'this is not legal advice',
      'general legal guidance suggests',
    ],
    relatedSubjects: ['CLIENT_NAME', 'ATTORNEY_NAME'],
  },
  SETTLEMENT_DISCUSSION: {
    definition:
      'Settlement negotiations, offers, demands, or discussions regarding case resolution. Must be actual settlement activity, not general settlement information.',
    examples: [
      'settlement offer of $500,000',
      'willing to settle for',
      'mediation resulted in agreement',
      'compromise at $250,000',
    ],
    negatives: [
      'typical settlement amounts in',
      'how settlement negotiations work',
      'settlement is often preferable',
    ],
    relatedSubjects: ['CLIENT_NAME', 'OPPOSING_PARTY', 'CASE_NUMBER'],
  },
  TESTIMONY: {
    definition:
      'Witness testimony, deposition statements, or sworn statements in legal proceedings.',
    examples: [
      'witness testified that',
      'deposition testimony revealed',
      'under oath stated that',
      'sworn statement indicated',
    ],
    relatedSubjects: ['WITNESS_NAME', 'CASE_NUMBER'],
  },
  DISCOVERY_REQUEST: {
    definition:
      'Discovery demands, interrogatories, document requests, or production demands in litigation.',
    examples: [
      'Request for Production of Documents',
      'interrogatory responses due',
      'subpoena for documents',
      'discovery demand for all emails',
    ],
    relatedSubjects: ['CASE_NUMBER', 'ATTORNEY_NAME'],
  },
  LEGAL_STRATEGY: {
    definition:
      'Case strategy, litigation tactics, or planned legal approaches. Must be actual strategic planning, not general strategy discussion.',
    examples: [
      'our strategy will be to argue',
      'plan to impeach witness with',
      'tactical decision to file motion',
      'approach is to focus on',
    ],
    negatives: [
      'common litigation strategies include',
      'effective legal strategy requires',
      'strategic considerations in litigation',
    ],
    relatedSubjects: ['CLIENT_NAME', 'CASE_NUMBER', 'ATTORNEY_NAME'],
  },
  CONFIDENTIALITY_AGREEMENT: {
    definition:
      'Non-disclosure agreements, confidentiality clauses, or protective orders involving confidential information.',
    examples: [
      'subject to NDA with',
      'protective order limits disclosure',
      'confidentiality agreement prohibits',
      'bound by non-disclosure',
    ],
    relatedSubjects: ['CONFIDENTIAL_BUSINESS_INFO', 'CLIENT_NAME'],
  },
} as const satisfies Record<string, PredicateSpec>;

/**
 * Legal Policies - Privilege Protection and Discovery Compliance
 */
export const LEGAL_POLICIES = {
  pol_legal_deny_privileged: {
    id: 'pol_legal_deny_privileged',
    nl: 'DENY privileged communications in insecure contexts to prevent privilege waiver.',
    when: {
      predicate: 'PRIVILEGED_COMMUNICATION',
      bind: {
        subjects: ['CLIENT_NAME', 'ATTORNEY_NAME'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
      minConfidence: {
        predicate: 0.85,
        subjects: 0.75,
      },
    },
    then: { action: 'DENY' },
  },
  pol_legal_tokenize_client_names: {
    id: 'pol_legal_tokenize_client_names',
    nl: 'Tokenize client names to protect client identity in legal documents.',
    when: {
      subjects: ['CLIENT_NAME'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_deny_privileged_markers: {
    id: 'pol_legal_deny_privileged_markers',
    nl: 'Deny documents labeled as attorney-client privileged or attorney work product.',
    when: {
      subjects: ['PRIVILEGE_MARKER'],
      scope: 'doc',
      minConfidence: 0.8,
    },
    then: { action: 'DENY' },
  },
  pol_legal_tokenize_attorney_names: {
    id: 'pol_legal_tokenize_attorney_names',
    nl: 'Tokenize attorney names that appear in legal matters.',
    when: {
      subjects: ['ATTORNEY_NAME'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_tokenize_opposing_party: {
    id: 'pol_legal_tokenize_opposing_party',
    nl: 'Tokenize opposing party names referenced in confidential legal documents.',
    when: {
      subjects: ['OPPOSING_PARTY'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_tokenize_confidential_info: {
    id: 'pol_legal_tokenize_confidential_info',
    nl: 'Tokenize confidential business information referenced in legal matters.',
    when: {
      subjects: ['CONFIDENTIAL_BUSINESS_INFO'],
      minConfidence: 0.75,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_tokenize_case_numbers: {
    id: 'pol_legal_tokenize_case_numbers',
    nl: 'Tokenize case numbers contained in non-public legal materials.',
    when: {
      subjects: ['CASE_NUMBER'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_tokenize_witness_names: {
    id: 'pol_legal_tokenize_witness_names',
    nl: 'Tokenize witness names referenced in legal content.',
    when: {
      subjects: ['WITNESS_NAME'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_tokenize_strategy: {
    id: 'pol_legal_tokenize_strategy',
    nl: 'Tokenize work product and legal strategy along with bound client/case information.',
    when: {
      predicate: 'WORK_PRODUCT',
      bind: {
        subjects: ['CLIENT_NAME', 'CASE_NUMBER'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
      minConfidence: {
        predicate: 0.8,
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_legal_discovery_redact: {
    id: 'pol_legal_discovery_redact',
    nl: 'Multi-stage redaction for discovery production: tokenize privileged content and client info.',
    when: {
      predicate: 'DISCOVERY_REQUEST',
      bind: {
        subjects: ['CLIENT_NAME', 'CONFIDENTIAL_BUSINESS_INFO'],
        proximity: 'doc',
        cardinality: '>=1',
      },
    },
    unless: [
      {
        subjects: ['COURT_NAME'], // Public court information exception
        minConfidence: 0.9,
      },
    ],
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_settlement_privacy: {
    id: 'pol_legal_settlement_privacy',
    nl: 'Tokenize settlement discussions and party names while preserving settlement structure.',
    when: {
      predicate: 'SETTLEMENT_DISCUSSION',
      bind: {
        subjects: ['CLIENT_NAME', 'OPPOSING_PARTY'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_public_record_allow: {
    id: 'pol_legal_public_record_allow',
    nl: 'Allow public court records and filings (case numbers, court names in public context).',
    when: {
      subjects: ['CASE_NUMBER', 'COURT_NAME'],
      scope: 'sentence',
    },
    unless: [
      {
        predicate: 'PRIVILEGED_COMMUNICATION',
        minConfidence: 0.7,
      },
      {
        subjects: ['CONFIDENTIAL_BUSINESS_INFO'],
        minConfidence: 0.75,
      },
    ],
    then: { action: 'ALLOW' },
  },
  pol_legal_privilege_strict: {
    id: 'pol_legal_privilege_strict',
    nl: 'High-confidence privilege detection for sensitive legal matters (minimizes false positives).',
    when: {
      predicate: 'PRIVILEGED_COMMUNICATION',
      minConfidence: {
        predicate: 0.95,
      },
    },
    then: { action: 'DENY' },
  },
  pol_legal_witness_protect: {
    id: 'pol_legal_witness_protect',
    nl: 'Tokenize witness names in testimony and deposition contexts for witness protection.',
    when: {
      predicate: 'TESTIMONY',
      bind: {
        subjects: ['WITNESS_NAME'],
        proximity: 'sentence',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_legal_nda_enforce: {
    id: 'pol_legal_nda_enforce',
    nl: 'Tokenize confidential business information subject to NDAs and confidentiality agreements.',
    when: {
      predicate: 'CONFIDENTIALITY_AGREEMENT',
      bind: {
        subjects: ['CONFIDENTIAL_BUSINESS_INFO'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_legal_deposition_redact: {
    id: 'pol_legal_deposition_redact',
    nl: 'Tokenize deposition testimony and witness identifiers for deposition privacy.',
    when: {
      predicate: 'TESTIMONY',
      bind: {
        subjects: ['WITNESS_NAME'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
} satisfies Record<string, Policy>;

export type LegalSubjectId = keyof typeof LEGAL_SUBJECTS;
export type LegalPredicateId = keyof typeof LEGAL_PREDICATES;
export type LegalPolicyId = keyof typeof LEGAL_POLICIES;

export const legalSubjects = LEGAL_SUBJECTS;
export const legalPredicates = LEGAL_PREDICATES;
export const legalPolicies = LEGAL_POLICIES;

