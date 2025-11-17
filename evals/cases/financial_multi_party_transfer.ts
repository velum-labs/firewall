/**
 * Financial Test Case: Multi-Party Wire Transfer
 * 
 * Wire transfer involving multiple financial institutions.
 * Tests cardinality >=2 institutions and complex binding.
 */

import {
  defineCase,
  expectTokenizedEntities,
  allowUnchangedRegion,
  registerCase,
} from '../case-registry';
import {
  financialSubjects,
  financialPredicates,
  financialPolicies,
} from '../catalog/financial';

export const financialMultiPartyTransferCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_multi_party_transfer',
      title: 'Multi-Party International Wire Transfer',
      description:
        'Complex wire transfer through multiple institutions testing cardinality requirements',
      owner: 'financial',
      category: 'core',
      severity: 'major',
      tags: ['financial', 'wire-transfer', 'international', 'multi-party', 'tokenize'],
      risk: 'Wire transfer details contain sensitive account and institution information',
    },
    subjects: [
      financialSubjects.ACCOUNT_NUMBER,
      financialSubjects.ROUTING_NUMBER,
      financialSubjects.SWIFT_CODE,
      financialSubjects.IBAN,
      financialSubjects.FINANCIAL_INSTITUTION,
      financialSubjects.TRANSACTION_ID,
    ],
    predicates: [financialPredicates.WIRE_TRANSFER],
    policies: [
      financialPolicies.pol_financial_tokenize_accounts,
      financialPolicies.pol_financial_international_accounts,
    ],
    text: `
INTERNATIONAL WIRE TRANSFER CONFIRMATION
Transaction Processing Report
Date: November 13, 2024

WIRE TRANSFER DETAILS:

Reference Number: TXN-WIRE-2024-1113-00789
Execution Date: November 13, 2024 14:35:12 GMT
Transfer Type: International Multi-Correspondent Wire
Status: COMPLETED
Total Transfer Time: 4 hours 23 minutes

ORIGINATING PARTY:

Sender Name: [BENEFICIARY PROTECTED]
Originating Account: 9876543210
Originating Institution: First National Bank of California
Address: 100 Financial Plaza, San Francisco, CA 94111
ABA Routing Number: 121000248
SWIFT Code: FNBCUS33

Amount Debited: USD $250,000.00
Wire Fee: USD $45.00
Total Debit: USD $250,045.00

INTERMEDIARY BANK #1 (CORRESPONDENT):

Institution: JPMorgan Chase Bank N.A. (New York)
SWIFT Code: CHASUS33
Correspondent Account: 4567890123
Role: USD Clearing Bank
Processing Fee: USD $25.00
Processing Time: 08:15:12 - 09:42:18

Intermediary Instructions: "Forward to Deutsche Bank Frankfurt for EUR conversion and onward transmission to final beneficiary"

INTERMEDIARY BANK #2 (CORRESPONDENT/CURRENCY CONVERSION):

Institution: Deutsche Bank AG (Frankfurt, Germany)
SWIFT Code: DEUTDEFF
Correspondent Account (EUR): DE89370400440532013000 (IBAN format)
Role: Currency Conversion & European Clearing
Processing Fee: EUR €35.00
Exchange Rate Applied: 1 USD = 0.92 EUR
Amount Converted: EUR €230,000.00 (from USD $250,000.00)
Processing Time: 10:15:33 - 11:28:45

Foreign Exchange Details:
- Mid-Market Rate: 0.9185 EUR/USD
- Bank Margin: 0.0015 EUR/USD (0.16%)
- Client Rate: 0.9200 EUR/USD
- FX Revenue: EUR €375.00

INTERMEDIARY BANK #3 (LOCAL CORRESPONDENT):

Institution: BNP Paribas (Paris, France)
SWIFT Code: BNPAFRPP
Correspondent Account (EUR): FR7630004000031234567890143 (IBAN)
Role: Final Domestic Clearing for French Beneficiary
Processing Fee: EUR €15.00
Processing Time: 11:45:22 - 12:58:19

BENEFICIARY (FINAL RECIPIENT):

Beneficiary Name: [BENEFICIARY PROTECTED]
Beneficiary Account: FR1420041010050500013M02606 (IBAN)
Beneficiary Bank: Société Générale (Lyon Branch)
Bank Address: 45 Rue de la République, 69002 Lyon, France
SWIFT Code: SOGEFRPP
BIC: SOGEFRPPLYO (Branch Identifier)

Amount Credited: EUR €229,950.00
Beneficiary Bank Fee: EUR €50.00
Net Credit to Beneficiary: EUR €229,900.00

VALUE DATING:

Debit Value Date: November 13, 2024
Credit Value Date: November 13, 2024
Same-Day Value Achieved: Yes (premium service)

COMPLIANCE AND REPORTING:

Purpose of Payment: "Commercial Invoice #INV-2024-5678 - Industrial Equipment Purchase"
OFAC Screening: PASSED (All parties cleared)
EU Sanctions Screening: PASSED
AML Review: PASSED
Transaction Classification: B2B Commercial Payment

Regulatory Reporting:
- US: FinCEN Form 104 (FBAR) - Filed
- EU: SEPA Reporting - Filed  
- France: TRACFIN Report - Not Required (< €300,000 threshold)

ROUTING CHAIN SUMMARY:

1. First National Bank of California (FNBCUS33)
   Account: 9876543210 | Routing: 121000248
   ↓ USD $250,000.00

2. JPMorgan Chase Bank N.A. (CHASUS33)
   Account: 4567890123
   ↓ USD $250,000.00

3. Deutsche Bank AG (DEUTDEFF)
   Account: DE89370400440532013000
   ↓ EUR €230,000.00 (converted)

4. BNP Paribas (BNPAFRPP)
   Account: FR7630004000031234567890143
   ↓ EUR €229,950.00

5. Société Générale (SOGEFRPP)
   Account: FR1420041010050500013M02606
   ✓ EUR €229,900.00 (final credit)

TOTAL FEE BREAKDOWN:

Originating Bank: USD $45.00
Intermediary Bank 1 (JPMorgan): USD $25.00 (EUR $23.00 equivalent)
Intermediary Bank 2 (Deutsche Bank): EUR €35.00
Intermediary Bank 3 (BNP Paribas): EUR €15.00
Beneficiary Bank (Société Générale): EUR €50.00
FX Margin (Deutsche Bank): EUR €375.00

Total Fees/Costs: Approximately EUR €498.00 or USD $541.30
Effective Cost to Client: 0.22% of transfer amount

WIRE TRANSFER CONFIRMATION CODES:

JPMorgan Reference: CHASE-WIRE-334455
Deutsche Bank Reference: DEUT-FX-778899
BNP Paribas Reference: BNPP-CLR-445566
Société Générale Reference: SOGE-INC-990011

SETTLEMENT ACCOUNTS (INTERBANK):

JPMorgan ↔ Deutsche Bank Nostro: Account 7890123456 at Deutsche Bank
Deutsche Bank ↔ BNP Paribas Nostro: Account 1234567890 at BNP Paribas
BNP Paribas ↔ Société Générale: SEPA Instant Payment (no nostro account required)

AUTHENTICATION AND SECURITY:

Message Authentication: SWIFT FIN validated
Encryption: End-to-end encrypted per SWIFT standards
Dual Authorization: Required and obtained
Anti-Fraud Checks: Passed (callback verification completed)
Beneficiary Verification: Account pre-validated on November 12

SPECIAL INSTRUCTIONS:

Payment Priority: URGENT (Same-Day Value)
Beneficiary Notification: Email and SMS sent
Charges Instruction: SHA (Shared - each party pays own bank's fees)
Additional Info: "Reference Commercial Contract dated October 15, 2024"

AUDIT TRAIL:

Initiated By: [CUSTOMER PROTECTED]
Approved By: Wire Transfer Department Manager
Secondary Approval: Compliance Officer
Processing Officer: International Wire Team
Completion Verified: Treasury Operations

This wire transfer successfully moved funds through 5 financial institutions across 2 countries (United States and France) with currency conversion from USD to EUR. All accounts, routing numbers, SWIFT codes, and IBAN numbers must be tokenized while preserving the transaction flow, amounts, timestamps, and fee structure for audit and reconciliation purposes.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: [
            '9876543210',
            '4567890123',
            '7890123456',
            '1234567890',
          ],
          note: 'Account numbers at various institutions',
        },
        {
          kind: 'SUBJ',
          label: 'ROUTING_NUMBER',
          surface: '121000248',
          note: 'ABA routing number for originating bank',
        },
        {
          kind: 'SUBJ',
          label: 'SWIFT_CODE',
          surfaces: [
            'FNBCUS33',
            'CHASUS33',
            'DEUTDEFF',
            'BNPAFRPP',
            'SOGEFRPP',
          ],
          note: 'SWIFT codes for all 5 institutions in the chain',
        },
        {
          kind: 'SUBJ',
          label: 'IBAN',
          surfaces: [
            'DE89370400440532013000',
            'FR7630004000031234567890143',
            'FR1420041010050500013M02606',
          ],
          note: 'IBAN numbers for European accounts',
        },
        {
          kind: 'SUBJ',
          label: 'FINANCIAL_INSTITUTION',
          surfaces: [
            'First National Bank of California',
            'JPMorgan Chase Bank',
            'Deutsche Bank AG',
            'BNP Paribas',
            'Société Générale',
          ],
          minCount: 5,
          note: 'All institutions in the correspondent chain',
        },
        {
          kind: 'PRED',
          label: 'WIRE_TRANSFER',
          minCount: 5,
          targets: 'both',
          note: 'Wire transfer events through correspondent chain',
        },
      ]),
      allowUnchangedRegion([
        'USD $250,000.00',
        'EUR €230,000.00',
        '0.9200 EUR/USD',
        'November 13, 2024',
      ]),
    ],
  })
);

