/**
 * Financial Test Case: Transaction Monitoring
 * 
 * Transaction log with account numbers, amounts, and transaction IDs.
 * Tests TRANSACTION → ACCOUNT_NUMBER binding while preserving patterns for fraud detection.
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

export const financialTransactionMonitoringCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_transaction_monitoring',
      title: 'Transaction Monitoring for Fraud Detection',
      description:
        'Transaction log requiring PII tokenization while preserving fraud detection patterns',
      owner: 'financial',
      category: 'core',
      severity: 'blocker',
      tags: ['financial', 'transaction', 'monitoring', 'tokenize', 'fraud-detection'],
      risk: 'Transaction data contains PII but patterns must be preserved for fraud analysis',
    },
    subjects: [
      financialSubjects.ACCOUNT_NUMBER,
      financialSubjects.TRANSACTION_ID,
      financialSubjects.FINANCIAL_INSTITUTION,
    ],
    predicates: [financialPredicates.TRANSACTION],
    policies: [
      financialPolicies.pol_financial_tokenize_transactions,
      financialPolicies.pol_financial_tokenize_accounts,
      financialPolicies.pol_financial_tokenize_transaction_ids,
    ],
    text: `
TRANSACTION MONITORING SYSTEM - DAILY ACTIVITY LOG
First National Bank - Fraud Prevention Department
Report Date: November 13, 2024

TRANSACTION BATCH #1 - HIGH-VOLUME ACCOUNT ACTIVITY

Account: 4567890123 (Checking - Primary)
Account Holder: [SYSTEM_PROTECTED]
Transaction History (24-hour period):

2024-11-13 08:15:32 - TXN-2024-AA4521
Debit: $45.67
Merchant: Starbucks Coffee #4521
Category: Food & Beverage
Location: Seattle, WA
Status: Approved

2024-11-13 09:42:18 - TXN-2024-AA4522
Transfer OUT: $2,500.00
To Account: 9876543210 at Wells Fargo Bank
Reference: Monthly Rent Payment
Status: Completed

2024-11-13 11:30:05 - TXN-2024-AA4523
Debit: $89.32
Merchant: Shell Gas Station #789
Category: Fuel
Location: Portland, OR
Status: Approved

2024-11-13 13:15:44 - TXN-2024-AA4524
Credit: $3,247.18
Source: Employer Direct Deposit - Tech Corp Inc
Reference: Salary Nov 1-15
Status: Posted

2024-11-13 14:52:09 - TXN-2024-AA4525
Debit: $156.78
Merchant: Amazon.com
Category: Online Shopping
Status: Approved

2024-11-13 16:20:33 - TXN-2024-AA4526
Transfer OUT: $1,000.00
To Account: 5432167890 at Chase Bank
Reference: Investment Transfer
Status: Completed

2024-11-13 18:35:21 - TXN-2024-AA4527
Debit: $67.45
Merchant: Whole Foods Market #234
Category: Groceries
Location: San Francisco, CA
Status: Approved

2024-11-13 20:10:55 - TXN-2024-AA4528
Debit: $12.99
Merchant: Netflix Subscription
Category: Entertainment
Status: Approved

TRANSACTION BATCH #2 - POTENTIAL VELOCITY ANOMALY

Account: 7890123456 (Checking - Business)
Account Holder: [SYSTEM_PROTECTED]
Transaction History:

2024-11-13 03:22:14 - TXN-2024-BB8901
Wire Transfer OUT: $45,000.00
To Account: 3456789012 at Bank of America
To: Global Trading Partners LLC
Reference: Invoice #INV-2024-1234
Status: Pending Approval

2024-11-13 03:28:47 - TXN-2024-BB8902
Wire Transfer OUT: $38,500.00
To Account: 6789012345 at CitiBank
To: International Suppliers Inc
Reference: Invoice #INV-2024-1235
Status: Flagged - Review Required

2024-11-13 03:35:19 - TXN-2024-BB8903
Wire Transfer OUT: $52,000.00
To Account: 1234567890 at US Bank
To: Overseas Manufacturing Ltd
Reference: Invoice #INV-2024-1236
Status: Blocked - Velocity Limit Exceeded

FRAUD ALERT: Account 7890123456 triggered velocity controls with three large wire transfers within 15 minutes. Total attempted transfer amount: $135,500.00. Account temporarily frozen pending customer verification.

TRANSACTION BATCH #3 - CROSS-BORDER ACTIVITY

Account: 2345678901 (Savings - Premium)
Account Holder: [SYSTEM_PROTECTED]
Transaction History:

2024-11-13 10:15:00 - TXN-2024-CC3401
International Wire IN: $75,000.00
From Account: GB29NWBK60161331926819 (IBAN)
From: Barclays Bank PLC (SWIFT: BARCGB22)
Source: Property Sale Proceeds - London
Status: Cleared - Currency Conversion Applied (GBP to USD)

2024-11-13 15:30:22 - TXN-2024-CC3402
Wire Transfer OUT: $50,000.00
To Account: 8901234567 at Goldman Sachs
Reference: Investment Portfolio Contribution
Status: Completed

2024-11-13 19:45:10 - TXN-2024-CC3403
ACH Transfer OUT: $5,000.00
To Account: 4567890123 (Internal Transfer)
Reference: Checking Account Funding
Status: Same-Day Processing

TRANSACTION BATCH #4 - RECURRING PAYMENT PATTERNS

Account: 6543210987 (Checking - Standard)
Account Holder: [SYSTEM_PROTECTED]
Transaction History:

2024-11-13 00:01:15 - TXN-2024-DD7701
Auto-Debit: $1,245.67
Payee: First Mortgage Company
Category: Mortgage Payment
Reference: Loan #MTG-445566
Status: Scheduled Payment Executed

2024-11-13 00:01:42 - TXN-2024-DD7702
Auto-Debit: $245.00
Payee: State Farm Insurance
Category: Auto Insurance
Reference: Policy #AUTO-778899
Status: Scheduled Payment Executed

2024-11-13 00:02:08 - TXN-2024-DD7703
Auto-Debit: $89.99
Payee: Electric Utility Company
Category: Utilities
Reference: Account #ELEC-334455
Status: Scheduled Payment Executed

2024-11-13 12:30:00 - TXN-2024-DD7704
Direct Deposit IN: $4,125.00
Source: Social Security Administration
Reference: Monthly Benefit Payment
Status: Posted

2024-11-13 16:45:33 - TXN-2024-DD7705
Debit: $234.56
Merchant: Costco Wholesale #567
Category: Shopping
Status: Approved

FRAUD ANALYSIS SUMMARY:

Total Accounts Monitored: 4
Total Transactions Processed: 21
Flagged for Review: 1 (Account 7890123456)
Blocked: 1 (TXN-2024-BB8903)
Average Transaction Value: $5,847.23
Highest Transaction: $75,000.00 (international wire)

RISK INDICATORS:
- Velocity anomaly detected on Account 7890123456
- Cross-border transaction requires enhanced due diligence (Account 2345678901)
- Normal patterns on Accounts 4567890123 and 6543210987

ACTIONS REQUIRED:
1. Contact business account holder for Account 7890123456 to verify wire transfer legitimacy
2. Verify source of international wire for Account 2345678901 (AML compliance)
3. Review and potentially increase velocity limits for verified business accounts

All account numbers and transaction IDs must be tokenized for data analytics while preserving transaction amounts, timestamps, and merchant categories for fraud pattern detection.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: [
            '4567890123',
            '9876543210',
            '5432167890',
            '7890123456',
            '3456789012',
            '6789012345',
            '1234567890',
            '2345678901',
            '8901234567',
            '6543210987',
          ],
          minCount: 10,
          note: 'All account numbers must be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'TRANSACTION_ID',
          surfaces: [
            'TXN-2024-AA4521',
            'TXN-2024-AA4528',
            'TXN-2024-BB8901',
            'TXN-2024-BB8903',
            'TXN-2024-CC3401',
            'TXN-2024-DD7705',
          ],
          minCount: 6,
          note: 'Transaction IDs should be tokenized as identifiers',
        },
        {
          kind: 'PRED',
          label: 'TRANSACTION',
          minCount: 20,
          targets: 'both',
          note: 'All transaction events with bound account numbers',
        },
      ]),
      allowUnchangedRegion([
        '$45.67',
        '$2,500.00',
        '$3,247.18',
        '$75,000.00',
        '2024-11-13 08:15:32',
        'Starbucks Coffee',
        'Amazon.com',
        'Velocity',
      ]),
    ],
  })
);

