/**
 * Financial Test Case: SSN Format Variations
 * 
 * Multiple SSN formats testing pattern detection.
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

export const financialSsnVariantsCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_ssn_variants',
      title: 'Social Security Number Format Variations',
      description:
        'Multiple SSN formats to test regex pattern flexibility',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'ssn', 'patterns', 'tokenize'],
      risk: 'Failure to detect all SSN formats may leak customer PII',
    },
    subjects: [financialSubjects.SSN],
    predicates: [],
    policies: [financialPolicies.pol_financial_tokenize_ssn],
    text: `
BANK CUSTOMER RECORDS - DATA QUALITY AUDIT
First National Bank - Compliance Department
Audit Date: November 13, 2024

SSN FORMAT STANDARDIZATION PROJECT:

Our legacy systems contain SSNs in multiple formats due to decades of mergers and acquisitions. This audit identifies format variations requiring normalization.

FORMAT 1: Standard Hyphenated (Most Common)
- Customer A: SSN 123-45-6789
- Customer B: SSN 987-65-4321
- Customer C: SSN 456-78-9012
Total Records: 45,678 customers

FORMAT 2: Space-Separated
- Customer D: SSN 234 56 7890
- Customer E: SSN 876 54 3210
- Customer F: SSN 345 67 8901
Total Records: 12,345 customers

FORMAT 3: No Separators (Continuous)
- Customer G: SSN 567890123
- Customer H: SSN 789012345
- Customer I: SSN 890123456
Total Records: 8,901 customers (legacy system import)

FORMAT 4: Text Prefix with Hyphenated
- Customer J: SSN: 678-90-1234
- Customer K: Social Security Number: 901-23-4567
- Customer L: SS#: 012-34-5678
Total Records: 23,456 customers

FORMAT 5: Masked with Partial Visible (INTERNAL USE ONLY)
Note: These appear in customer service screens but full SSN is in database
- Customer M: XXX-XX-2345 (Full in DB: 123-45-2345)
- Customer N: ***-**-6789 (Full in DB: 987-65-6789)
- Customer O: ###-##-0123 (Full in DB: 456-78-0123)

MIGRATION PLAN:

All SSN variants above must be:
1. Detected by automated scanning tools
2. Normalized to format: XXX-XX-XXXX
3. Encrypted in database per GLBA requirements
4. Tokenized in reports and logs

SAMPLE DATA FOR TESTING:

Account Opening Form (Paper Scan):
Applicant Name: [REDACTED]
Date of Birth: [REDACTED]
Social Security Number: 321-54-9876
Employment: [REDACTED]

Wire Transfer Request:
Sender SSN: 654 32 1098
Amount: $50,000
Purpose: Real Estate Purchase

Tax Form 1099-INT:
Recipient SSN: 210987654
Interest Paid: $1,234.56
Tax Year: 2024

Fraud Investigation Case:
Subject SSN: SSN 543-21-0987
Alert Type: Identity Theft Suspected
Status: Under Review

Customer Service Call Log:
Caller verified with last 4 digits: ****-**-5432
Full SSN on file: 876-54-5432
Authentication: Passed

DATA QUALITY FINDINGS:

Total SSNs scanned: 90,380
Valid format: 89,234 (98.7%)
Invalid/Corrupted: 1,146 (1.3%)
Duplicates detected: 23 (requiring investigation)

All SSN formats must be consistently detected and tokenized regardless of separator style or text labels.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'SSN',
          surfaces: [
            '123-45-6789',
            '987-65-4321',
            '234 56 7890',
            '567890123',
            '678-90-1234',
            '321-54-9876',
            '654 32 1098',
            '210987654',
            '543-21-0987',
          ],
          minCount: 9,
          note: 'All SSN format variations should be detected',
        },
      ]),
    ],
  })
);

