/**
 * Financial Test Case: International Account Formats
 * 
 * IBAN, SWIFT codes, and international banking identifiers.
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  financialSubjects,
  financialPolicies,
} from '../catalog/financial';

export const financialInternationalAccountsCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_international_accounts',
      title: 'International Account Numbers - IBAN and SWIFT',
      description:
        'Tests IBAN, SWIFT, and non-US banking identifier detection',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'iban', 'swift', 'international', 'tokenize'],
      risk: 'International account numbers contain sensitive customer data',
    },
    subjects: [
      financialSubjects.IBAN,
      financialSubjects.SWIFT_CODE,
      financialSubjects.FINANCIAL_INSTITUTION,
    ],
    predicates: [],
    policies: [financialPolicies.pol_financial_international_accounts],
    text: `
INTERNATIONAL WIRE TRANSFER DIRECTORY
Global Banking Services - Beneficiary Database
Updated: November 13, 2024

EUROPEAN ACCOUNTS:

United Kingdom:
Bank: Barclays Bank PLC (London)
SWIFT: BARCGB22
IBAN: GB29NWBK60161331926819
Account Holder: [BUSINESS ENTITY]
Purpose: Trade Finance

Germany:
Bank: Deutsche Bank AG (Frankfurt)
SWIFT: DEUTDEFF
IBAN: DE89370400440532013000
Account Holder: [BUSINESS ENTITY]
Purpose: Manufacturing Supplier

France:
Bank: BNP Paribas (Paris)
SWIFT: BNPAFRPP
IBAN: FR1420041010050500013M02606
Account Holder: [BUSINESS ENTITY]
Purpose: Distribution Partner

Spain:
Bank: Banco Santander (Madrid)
SWIFT: BSCHESMM
IBAN: ES9121000418450200051332
Account Holder: [BUSINESS ENTITY]
Purpose: Logistics Services

Italy:
Bank: UniCredit Bank (Milan)
SWIFT: UNCRITMM
IBAN: IT60X0542811101000000123456
Account Holder: [BUSINESS ENTITY]
Purpose: Regional Office Operations

MIDDLE EAST ACCOUNTS:

United Arab Emirates:
Bank: Emirates NBD (Dubai)
SWIFT: EBILAEAD
IBAN: AE070331234567890123456
Account Holder: [BUSINESS ENTITY]
Purpose: Oil & Gas Trading

Saudi Arabia:
Bank: Al Rajhi Bank (Riyadh)
SWIFT: RJHISARI
IBAN: SA0380000000608010167519
Account Holder: [BUSINESS ENTITY]
Purpose: Construction Project

ASIA-PACIFIC ACCOUNTS:

Singapore:
Bank: DBS Bank Ltd
SWIFT: DBSSSGSG
Account Number: 0123456789 (SWIFT mandatory, no IBAN)
Account Holder: [BUSINESS ENTITY]
Purpose: Technology Partnership

Hong Kong:
Bank: HSBC Hong Kong
SWIFT: HSBCHKHHHKH
Account Number: 123-456789-001 (local format)
Account Holder: [BUSINESS ENTITY]
Purpose: Import/Export Operations

OTHER REGIONS:

Switzerland:
Bank: UBS Switzerland AG (Zurich)
SWIFT: UBSWCHZH80A
IBAN: CH9300762011623852957
Account Holder: [BUSINESS ENTITY]
Purpose: Asset Management

Netherlands:
Bank: ING Bank (Amsterdam)
SWIFT: INGBNL2A
IBAN: NL91ABNA0417164300
Account Holder: [BUSINESS ENTITY]
Purpose: European Distribution Hub

Belgium:
Bank: KBC Bank (Brussels)
SWIFT: KREDBEBB
IBAN: BE68539007547034
Account Holder: [BUSINESS ENTITY]
Purpose: EU Headquarters

Canada:
Bank: Royal Bank of Canada (Toronto)
SWIFT: ROYCCAT2
Transit Number: 00003
Institution Number: 003
Account Number: 1234567
(Canada uses transit/institution/account, not IBAN)

Australia:
Bank: Commonwealth Bank (Sydney)
SWIFT: CTBAAU2S
BSB: 062-000
Account Number: 12345678
(Australia uses BSB, not IBAN)

COMPLIANCE NOTES:

All IBAN numbers follow ISO 13616 standard:
- Country code (2 letters)
- Check digits (2 digits)
- Bank identifier (variable length)
- Account number (variable length)

All SWIFT codes follow ISO 9362 standard:
- Bank code (4 letters)
- Country code (2 letters)
- Location code (2 characters)
- Branch code (3 characters, optional)

SECURITY REQUIREMENTS:

1. IBAN numbers must be tokenized in databases
2. SWIFT codes may remain visible for routing
3. Account holder names must be redacted
4. Wire transfer purposes logged but encrypted

All international banking identifiers require the same protection level as domestic account numbers per GDPR, data residency laws, and banking regulations.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'IBAN',
          surfaces: [
            'GB29NWBK60161331926819',
            'DE89370400440532013000',
            'FR1420041010050500013M02606',
            'ES9121000418450200051332',
            'IT60X0542811101000000123456',
            'AE070331234567890123456',
            'SA0380000000608010167519',
            'CH9300762011623852957',
            'NL91ABNA0417164300',
            'BE68539007547034',
          ],
          minCount: 10,
          note: 'All IBAN numbers from various countries',
        },
        {
          kind: 'SUBJ',
          label: 'SWIFT_CODE',
          surfaces: [
            'BARCGB22',
            'DEUTDEFF',
            'BNPAFRPP',
            'BSCHESMM',
            'UNCRITMM',
            'EBILAEAD',
            'DBSSSGSG',
            'HSBCHKHHHKH',
            'UBSWCHZH80A',
            'INGBNL2A',
            'KREDBEBB',
            'ROYCCAT2',
            'CTBAAU2S',
          ],
          minCount: 13,
          note: 'SWIFT codes from all listed institutions',
        },
      ]),
    ],
  })
);

