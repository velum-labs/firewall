/**
 * Financial Test Case: Consumer Credit Report
 * 
 * Credit report with SSN, account history, and credit scores.
 * Tests overlapping spans where SSN appears multiple times.
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

export const financialCreditReportCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_credit_report',
      title: 'Consumer Credit Report with Multiple PII Instances',
      description:
        'Credit report with SSN appearing multiple times, testing overlapping span detection',
      owner: 'financial',
      category: 'core',
      severity: 'major',
      tags: ['financial', 'credit-report', 'ssn', 'overlapping-spans', 'tokenize'],
      risk: 'Credit reports contain extensive PII including SSN, account numbers, and addresses',
    },
    subjects: [
      financialSubjects.SSN,
      financialSubjects.ACCOUNT_NUMBER,
      financialSubjects.CREDIT_CARD,
    ],
    predicates: [financialPredicates.CREDIT_APPLICATION],
    policies: [
      financialPolicies.pol_financial_tokenize_ssn,
      financialPolicies.pol_financial_tokenize_accounts,
    ],
    text: `
CONSUMER CREDIT REPORT
Equifax Credit Services
Report Date: November 13, 2024
Report ID: ECR-2024-1113-78945

CONSUMER IDENTIFICATION:

Primary SSN: 123-45-6789
Previous SSN: None Reported
Name: [CONSUMER NAME REDACTED]
Date of Birth: [REDACTED]
Current Address: [REDACTED]
Previous Addresses: [REDACTED]

CREDIT SUMMARY (As of November 13, 2024):

FICO® Score: 742 (Good)
VantageScore 3.0: 738 (Good)
Total Accounts: 17
Open Accounts: 12
Closed Accounts: 5
Derogatory Marks: 0
Public Records: 0
Credit Inquiries (24 months): 8
Total Debt: $187,543.00
Available Credit: $92,450.00
Credit Utilization: 27%
Oldest Account: 18 years 4 months
Average Account Age: 8 years 3 months

VERIFICATION: Social Security Number 123-45-6789 confirmed against SSA records. No fraud alerts or identity theft flags detected.

DETAILED ACCOUNT HISTORY:

REVOLVING ACCOUNTS:

1. Chase Sapphire Reserve Credit Card
   Account Number: 4532-****-****-3456 (Full: 4532-1234-5678-3456)
   Date Opened: March 2019
   Current Balance: $3,245.00
   Credit Limit: $25,000
   Payment Status: Current - Never Late
   Last Payment: $850.00 on November 1, 2024
   SSN on File: 123-45-6789

2. American Express Gold Card
   Account Number: 3782-******-05671 (Full: 3782-822463-05671)
   Date Opened: July 2015
   Current Balance: $1,567.00
   Credit Limit: $15,000
   Payment Status: Current - Never Late
   Last Payment: $1,567.00 (Paid in Full) on October 25, 2024
   SSN on File: 123-45-6789

3. Discover it Cash Back
   Account Number: 6011-****-****-8934 (Full: 6011-1111-2222-8934)
   Date Opened: January 2021
   Current Balance: $892.00
   Credit Limit: $8,500
   Payment Status: Current
   Last Payment: $250.00 on November 5, 2024
   SSN on File: 123-45-6789

4. Capital One Venture Rewards
   Account Number: 5425-****-****-7812 (Full: 5425-2334-4455-7812)
   Date Opened: September 2018
   Current Balance: $2,134.00
   Credit Limit: $12,000
   Payment Status: Current - 30-day late June 2020 (Pandemic-related)
   Last Payment: $500.00 on October 28, 2024
   SSN on File: 123-45-6789

5. Wells Fargo Platinum Card
   Account Number: 4916-****-****-6543 (Full: 4916-5544-3322-6543)
   Date Opened: May 2022
   Current Balance: $0.00
   Credit Limit: $10,000
   Payment Status: Current - Zero Balance
   Last Payment: $1,200.00 (Paid Off) on September 15, 2024
   SSN Verified: 123-45-6789

INSTALLMENT LOANS:

6. Toyota Auto Loan
   Account Number: AUTO-556677889
   Original Amount: $32,000
   Current Balance: $12,450.00
   Monthly Payment: $625.00
   Date Opened: February 2021
   Payment Status: Current - Never Late
   Remaining Term: 20 months
   SSN: 123-45-6789

7. Wells Fargo Personal Loan
   Account Number: LOAN-334455667
   Original Amount: $15,000
   Current Balance: $4,567.00
   Monthly Payment: $385.00
   Date Opened: August 2022
   Payment Status: Current
   Remaining Term: 12 months
   SSN: 123-45-6789

MORTGAGE ACCOUNTS:

8. Quicken Loans Mortgage
   Account Number: MTG-998877665544
   Original Amount: $385,000
   Current Balance: $347,234.00
   Monthly Payment: $2,245.00 (Principal & Interest)
   Date Opened: June 2018
   Payment Status: Current - Never Late
   Property Address: [REDACTED]
   SSN on Mortgage: 123-45-6789

STUDENT LOANS:

9. Federal Student Loan - Navient
   Account Number: SL-778899001122
   Original Amount: $45,000
   Current Balance: $28,456.00
   Monthly Payment: $315.00
   Date Opened: September 2006
   Payment Status: Current - In Repayment
   SSN: 123-45-6789

10. Federal Student Loan - Great Lakes
    Account Number: SL-665544332211
    Original Amount: $22,000
    Current Balance: $8,934.00
    Monthly Payment: $185.00
    Date Opened: September 2007
    Payment Status: Current
    SSN: 123-45-6789

CLOSED ACCOUNTS:

11. Bank of America Cash Rewards (Closed 2020)
    Account Number: 5555-****-****-1234
    Closed By: Consumer
    Final Balance: $0.00
    Payment History: Always Current
    SSN: 123-45-6789

12. Citi Double Cash Card (Closed 2019)
    Account Number: 5200-****-****-5678
    Closed By: Consumer - Account Consolidation
    Final Balance: $0.00
    SSN: 123-45-6789

CREDIT INQUIRIES (Hard Pulls):

November 2024 - Chase Bank (SSN: 123-45-6789) - Credit Card Application
September 2024 - Tesla Motors (SSN: 123-45-6789) - Auto Loan Inquiry
June 2024 - American Express (SSN: 123-45-6789) - Credit Limit Increase
March 2024 - Quicken Loans (SSN: 123-45-6789) - Refinance Inquiry
January 2024 - Capital One (SSN: 123-45-6789) - Pre-Approval Check

CREDIT MIX ANALYSIS:

Credit Cards: 5 accounts (30% of total)
Auto Loans: 1 account (6% of total)
Mortgages: 1 account (6% of total)
Student Loans: 2 accounts (12% of total)
Personal Loans: 1 account (6% of total)
Closed Accounts: 5 accounts (29% of total)

Positive Factors:
✓ Long credit history (18+ years oldest account)
✓ Low credit utilization (27%)
✓ Diverse credit mix
✓ No derogatory marks
✓ Consistent payment history

Negative Factors:
⚠ Recent credit inquiries (5 in past year)
⚠ One 30-day late payment in 2020 (pandemic-related)

IDENTITY VERIFICATION:

SSN 123-45-6789 cross-referenced with:
- Internal Revenue Service records: MATCHED
- Social Security Administration: MATCHED
- Previous credit applications: MATCHED (17 applications)
- Employment verification: MATCHED

FRAUD ALERTS: None Active
SECURITY FREEZE: Not Enabled
CREDIT MONITORING: Enrolled

CONSUMER STATEMENT:
"The 30-day late payment on Capital One account (June 2020) was due to COVID-19 pandemic financial hardship. Account brought current and has remained current since July 2020."

CREDITOR CONTACT INFORMATION:

All creditors on file have consumer SSN 123-45-6789 for account verification and identity confirmation. Any disputes should reference this SSN for proper account matching.

REPORT GENERATION DETAILS:

Requested By: Consumer (SSN: 123-45-6789)
Report Purpose: Annual Free Credit Report Request
Delivery Method: Secure Online Portal
Authentication: SSN + Security Questions Verified

This credit report contains multiple instances of SSN 123-45-6789 throughout various sections. All instances must be consistently tokenized while preserving credit scores, account balances, payment amounts, and dates for legitimate credit evaluation purposes.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'SSN',
          surface: '123-45-6789',
          count: 20,
          note: 'SSN appears 20+ times throughout report, all instances must be tokenized consistently',
        },
        {
          kind: 'SUBJ',
          label: 'CREDIT_CARD',
          surfaces: [
            '4532-1234-5678-3456',
            '3782-822463-05671',
            '6011-1111-2222-8934',
            '5425-2334-4455-7812',
            '4916-5544-3322-6543',
          ],
          note: 'Full credit card numbers (not masked versions)',
        },
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: [
            'AUTO-556677889',
            'LOAN-334455667',
            'MTG-998877665544',
            'SL-778899001122',
            'SL-665544332211',
          ],
          note: 'Loan and mortgage account numbers',
        },
        {
          kind: 'PRED',
          label: 'CREDIT_APPLICATION',
          minCount: 5,
          note: 'Credit inquiries and applications',
        },
      ]),
      allowUnchangedRegion([
        '742',
        '738',
        '$187,543.00',
        '$25,000',
        'November 13, 2024',
      ]),
    ],
  })
);

