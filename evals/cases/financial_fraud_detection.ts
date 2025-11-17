/**
 * Financial Test Case: Fraud Detection with SAR
 * 
 * Suspicious Activity Report with SSNs and card numbers.
 * Tests policy priority: DENY cards vs preserve fraud indicators.
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

export const financialFraudDetectionCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_fraud_detection',
      title: 'Suspicious Activity Report - Fraud Detection',
      description:
        'SAR with customer PII requiring tokenization while preserving fraud signal patterns',
      owner: 'financial',
      category: 'core',
      severity: 'critical',
      tags: ['financial', 'fraud', 'sar', 'suspicious-activity', 'tokenize'],
      risk: 'Must protect customer PII while maintaining fraud indicator integrity for investigation',
    },
    subjects: [
      financialSubjects.SSN,
      financialSubjects.ACCOUNT_NUMBER,
      financialSubjects.CREDIT_CARD,
      financialSubjects.TRANSACTION_ID,
    ],
    predicates: [
      financialPredicates.FRAUD_INDICATOR,
      financialPredicates.TRANSACTION,
    ],
    policies: [
      financialPolicies.pol_financial_fraud_preserve,
      financialPolicies.pol_financial_tokenize_accounts,
      financialPolicies.pol_financial_tokenize_ssn,
      financialPolicies.pol_financial_tokenize_credit_cards,
      financialPolicies.pol_financial_crypto_privacy,
    ],
    text: `
SUSPICIOUS ACTIVITY REPORT (SAR)
Filing Institution: Metropolitan Community Bank
Report ID: SAR-2024-11-13-0045
Filing Date: November 13, 2024
Investigator: Sarah Chen, Fraud Prevention Manager

SUBJECT INFORMATION:

Primary Subject:
Name: [REDACTED FOR PRIVACY]
SSN: 123-45-6789
Account Number: 9876543210
Date of Birth: [REDACTED]
Address: [REDACTED]
Phone: [REDACTED]

SUSPICIOUS ACTIVITY SUMMARY:

Our automated fraud detection system flagged unusual patterns on customer account 9876543210 (SSN: 123-45-6789) between November 1-12, 2024. The activity exhibits multiple fraud indicators consistent with account takeover and money laundering schemes.

DETAILED SUSPICIOUS ACTIVITY TIMELINE:

PHASE 1 - CREDENTIAL COMPROMISE INDICATORS:

November 1, 2024 - 02:15 AM (TXN-2024-FR-001)
- Multiple failed login attempts detected: 47 failed attempts from IP address 185.220.101.34 (TOR exit node)
- Geolocation: Russia (Moscow)
- Device fingerprint: Unknown/New Device
- User agent: Automated script detected

FRAUD INDICATOR: Credential stuffing attack suggesting compromised credentials from data breach

November 1, 2024 - 02:47 AM (TXN-2024-FR-002)  
- Successful login from same IP address
- Immediate change of contact information:
  * Email changed to: tempmail2024@anonymousemail.com
  * Phone number updated to burner number
  * Security questions reset

FRAUD INDICATOR: Account takeover - immediate profile modification to evade customer notification

PHASE 2 - RAPID FUND EXTRACTION:

November 2, 2024 - 03:12 AM (TXN-2024-FR-003)
- Wire transfer initiated: $48,500.00
- Destination: Account 4561237890 at Offshore International Bank (Cayman Islands)
- Beneficiary: Shell Company XYZ Ltd
- Reference: "Consulting Services Invoice"

FRAUD INDICATOR: Wire to high-risk jurisdiction inconsistent with customer profile (retired teacher, age 67, no international business ties)

November 2, 2024 - 04:35 AM (TXN-2024-FR-004)
- Credit card linked to account: 4532-8876-5421-9103
- Immediate cash advances:
  * $9,800 at Casino Royal (Las Vegas) - Card-not-present transaction
  * $9,950 at Diamond Jewelry (Miami) - Card-not-present  
  * $9,900 at Electronics Mega Store (Online) - Card-not-present

FRAUD INDICATOR: Structuring just below $10,000 reporting threshold, multiple cash-equivalent transactions

November 3, 2024 - Multiple Transactions (TXN-2024-FR-005 through 015)
- Series of peer-to-peer payment app transfers:
  * Venmo: $2,999 (11 separate transfers to different recipients)
  * Cash App: $2,995 (8 separate transfers)
  * Zelle: $2,990 (6 separate transfers)

FRAUD INDICATOR: Velocity anomaly - 25 P2P transfers within 3 hours, all just below $3,000 threshold

PHASE 3 - CRYPTOCURRENCY CONVERSION:

November 4-5, 2024 (TXN-2024-FR-016 through 020)
- ACH transfers to cryptocurrency exchanges:
  * $15,000 to CoinBase Pro
  * $12,500 to Kraken Exchange
  * $11,000 to Binance US
  * $8,500 to Gemini Exchange

- Linked crypto wallet addresses:
  * Bitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
  * Ethereum: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

FRAUD INDICATOR: Rapid conversion to cryptocurrency for obfuscation and cross-border movement

PHASE 4 - MULE ACCOUNT PATTERNS:

November 6-12, 2024 (TXN-2024-FR-021 through 045)
- Received 15 incoming wire transfers totaling $87,000 from multiple sources:
  * Small business accounts (suspected compromised)
  * Consumer accounts (possible romance scam victims)
  * Immediate outbound transfers upon receipt

FRAUD INDICATOR: Classic money mule behavior - rapid in/out movement, minimal balance retention

ACCOUNT BALANCE TRACKING:

Opening Balance (Nov 1): $52,347.18
Total Credits (Nov 1-12): $87,000.00
Total Debits (Nov 1-12): $134,500.00
Closing Balance (Nov 12): $4,847.18

Net Movement: $129,653.00 (fraudulent extraction)

ADDITIONAL FRAUD INDICATORS:

1. IP Address Analysis:
   - 47 different IP addresses used across 12 days
   - Locations: Russia (12), Nigeria (8), Ukraine (6), Romania (5), USA-Tor Nodes (16)
   - Pattern: Distributed botnet or VPN/proxy cycling

2. Device Fingerprinting:
   - 23 unique device signatures
   - No matches to customer's historical devices
   - Indicators of device emulation/spoofing

3. Velocity Analysis:
   - Historical average: 3 transactions per week
   - Suspicious period: 187 transactions in 12 days
   - Increase factor: 62x normal activity

4. Transaction Type Analysis:
   - Historical: 100% domestic retail purchases  
   - Suspicious period: 85% high-risk categories (crypto, gambling, international wires)

5. Customer Profile Inconsistency:
   - Victim customer: Retired educator, age 67, modest fixed income
   - Activity: Sophisticated multi-layered fraud scheme
   - Conclusion: Account definitively compromised

CUSTOMER NOTIFICATION:

November 12, 2024 - 08:45 AM
- Customer contacted using verified phone number (different from account profile)
- Customer confirmed NO KNOWLEDGE of any suspicious transactions
- Customer reports receiving phishing email on October 30th
- Customer SSN 123-45-6789 confirmed compromised in recent healthcare data breach

Account immediately frozen. Law enforcement notified. Customer issued new account number 5432109876 and SSN credit monitoring activated.

FINANCIAL IMPACT:

Customer Loss: $52,347.18 (entire account balance stolen)
Institution Exposure: Under review for reimbursement
Total Fraud Amount: $129,653.00 (includes deposits from other victims)

REGULATORY FILING:

This SAR filed pursuant to 31 CFR 1020.320 for:
- Transactions aggregating $5,000 or more involving potential money laundering
- Account takeover with customer harm
- Structured transactions to evade reporting requirements
- International wire transfers to high-risk jurisdictions

FinCEN SAR Filing: COMPLETED
Internal Case Number: FRAUD-2024-1134
Law Enforcement: FBI Internet Crime Complaint Center (IC3) - Case #IC3-2024-778899
Status: UNDER INVESTIGATION

FRAUD PREVENTION RECOMMENDATIONS:

1. Enhanced monitoring for SSN 123-45-6789 across all products
2. Mandatory step-up authentication for high-risk transactions
3. Velocity limits: International wires >$5,000 require callback verification
4. Block transactions to cryptocurrency exchanges without prior customer authorization
5. Geographic restrictions: Block access from Tor exit nodes

All customer PII (SSN, account numbers, card numbers) must be tokenized for fraud analytics database while preserving complete fraud indicator patterns, timestamps, amounts, and behavioral signals for machine learning models.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'SSN',
          surface: '123-45-6789',
          note: 'SSN must be tokenized to protect customer identity',
        },
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: [
            '9876543210',
            '4561237890',
            '5432109876',
          ],
          note: 'Account numbers tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'CREDIT_CARD',
          surface: '4532-8876-5421-9103',
          note: 'Card number must be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'CRYPTO_ADDRESS',
          surfaces: [
            '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          ],
          note: 'Cryptocurrency addresses tokenized',
        },
        {
          kind: 'PRED',
          label: 'FRAUD_INDICATOR',
          minCount: 8,
          note: 'Multiple fraud indicators preserved for investigation',
        },
      ]),
      allowUnchangedRegion([
        '$48,500.00',
        '$9,800',
        'Velocity anomaly',
        'Account takeover',
        'Credential stuffing',
        'TOR exit node',
        'November',
      ]),
    ],
  })
);

