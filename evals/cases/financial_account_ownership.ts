/**
 * Financial Test Case: Joint Account Ownership
 * 
 * Multiple people bound to one account - cardinality testing.
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  financialSubjects,
  financialPredicates,
  financialPolicies,
} from '../catalog/financial';

export const financialAccountOwnershipCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_account_ownership',
      title: 'Joint Account and Beneficiary Ownership',
      description:
        'Tests multiple parties linked to single account with complex ownership structures',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'joint-account', 'cardinality', 'tokenize'],
      risk: 'All parties on account must be tokenized while maintaining ownership structure',
    },
    subjects: [
      financialSubjects.SSN,
      financialSubjects.ACCOUNT_NUMBER,
    ],
    predicates: [financialPredicates.ACCOUNT_OPENING],
    policies: [
      financialPolicies.pol_financial_tokenize_ssn,
      financialPolicies.pol_financial_tokenize_accounts,
    ],
    text: `
JOINT ACCOUNT REGISTRATION FORMS
Premier Banking Services
Date: November 13, 2024

ACCOUNT #1: Joint Checking Account
Account Number: 9876543210
Account Type: Joint with Right of Survivorship

Primary Owner:
Name: [REDACTED]
SSN: 123-45-6789
Ownership: 50%

Joint Owner:
Name: [REDACTED]
SSN: 987-65-4321
Ownership: 50%

Beneficiaries:
1. [REDACTED], SSN: 456-78-9012 (40%)
2. [REDACTED], SSN: 789-01-2345 (30%)
3. [REDACTED], SSN: 234-56-7890 (30%)

ACCOUNT #2: Trust Account
Account Number: 8765432109
Account Type: Revocable Living Trust

Grantor/Trustee:
Name: [REDACTED]
SSN: 345-67-8901
Role: Primary Trustee

Co-Trustee:
Name: [REDACTED]
SSN: 678-90-1234
Role: Co-Trustee

Trust Beneficiaries:
1. [REDACTED], SSN: 901-23-4567 (33.33%)
2. [REDACTED], SSN: 012-34-5678 (33.33%)
3. [REDACTED], SSN: 321-09-8765 (33.34%)

ACCOUNT #3: Business Account with Multiple Signers
Account Number: 7654321098
Account Type: Business Checking (LLC)

Authorized Signers:
1. [REDACTED], SSN: 543-21-0987 (Managing Member)
2. [REDACTED], SSN: 654-32-1098 (Member)
3. [REDACTED], SSN: 765-43-2109 (Member)
4. [REDACTED], SSN: 876-54-3210 (Authorized Employee)

ACCOUNT #4: Custodial Account (UTMA)
Account Number: 6543210987
Account Type: Uniform Transfers to Minors Act

Custodian:
Name: [REDACTED]
SSN: 210-98-7654

Minor Beneficiary:
Name: [REDACTED]
SSN: 432-10-9876
Date of Birth: [REDACTED]

Account transfers to minor at age 21 (state law).

All SSNs and account numbers above must be tokenized while preserving the ownership structure, percentages, and relationships between parties.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'SSN',
          surfaces: [
            '123-45-6789',
            '987-65-4321',
            '456-78-9012',
            '789-01-2345',
            '234-56-7890',
            '345-67-8901',
            '678-90-1234',
            '901-23-4567',
            '012-34-5678',
            '321-09-8765',
            '543-21-0987',
            '654-32-1098',
            '765-43-2109',
            '876-54-3210',
            '210-98-7654',
            '432-10-9876',
          ],
          minCount: 16,
          note: 'All SSNs from joint accounts, trusts, business, and custodial accounts',
        },
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: [
            '9876543210',
            '8765432109',
            '7654321098',
            '6543210987',
          ],
          note: 'All account numbers',
        },
      ]),
    ],
  })
);

