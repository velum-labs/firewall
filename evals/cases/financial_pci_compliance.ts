/**
 * Financial Test Case: PCI-DSS Compliance Violation
 * 
 * Payment log with full unmasked credit card numbers - PCI-DSS violation.
 * Should DENY to prevent cardholder data exposure.
 */

import {
  defineCase,
  expectDenial,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import {
  financialSubjects,
  financialPredicates,
  financialPolicies,
} from '../catalog/financial';

export const financialPciComplianceCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_pci_compliance',
      title: 'PCI-DSS Violation - Unmasked Cardholder Data',
      description:
        'Payment processing log with full card numbers representing clear PCI-DSS violation',
      owner: 'financial',
      category: 'core',
      severity: 'blocker',
      tags: ['financial', 'pci-dss', 'deny', 'card-data', 'compliance-violation'],
      risk: 'Critical PCI-DSS violation - fines up to $500,000 per incident, card brand penalties',
    },
    subjects: [
      financialSubjects.CREDIT_CARD,
      financialSubjects.TRANSACTION_ID,
    ],
    predicates: [
      financialPredicates.PCI_SCOPE_EVENT,
      financialPredicates.TRANSACTION,
    ],
    policies: [financialPolicies.pol_financial_deny_unmasked_cards],
    text: `
PAYMENT GATEWAY TRANSACTION LOG - SECURITY INCIDENT
E-Commerce Platform: OnlineRetail Pro
Log Export Date: November 13, 2024
WARNING: This file contains unmasked Primary Account Numbers (PANs) in violation of PCI-DSS

INCIDENT SUMMARY:
A configuration error in our payment gateway resulted in full credit card numbers being logged to plaintext files instead of tokenized format. This represents a CRITICAL PCI-DSS compliance violation under requirements 3.3, 3.4, and 8.2.1.

AFFECTED TRANSACTIONS (Sample of 15):

Transaction ID: PAY-2024-11-13-00145
Timestamp: 2024-11-13 08:15:23
Card Number: 4532-1234-5678-9010 (Visa)
Cardholder: [REDACTED]
Expiration: 05/2026
CVV: 123 (SHOULD NOT BE STORED)
Amount: $234.56
Merchant Category: Electronics
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00146
Timestamp: 2024-11-13 08:22:41
Card Number: 5425-2334-3010-9903 (Mastercard)
Cardholder: [REDACTED]
Expiration: 08/2027
CVV: 456 (VIOLATION: CVV MUST NOT BE STORED POST-AUTH)
Amount: $1,567.89
Merchant Category: Travel
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00147
Timestamp: 2024-11-13 08:34:12
Card Number: 3782-822463-10005 (American Express)
Cardholder: [REDACTED]
Expiration: 12/2025
CVV: 1234 (4-digit CVV for Amex - STORAGE VIOLATION)
Amount: $5,432.10
Merchant Category: Luxury Goods
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00148
Timestamp: 2024-11-13 08:45:33
Card Number: 6011-1111-1111-1117 (Discover)
Cardholder: [REDACTED]
Expiration: 03/2026
CVV: 789
Amount: $89.99
Merchant Category: Subscription Services
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00149
Timestamp: 2024-11-13 09:12:05
Card Number: 4916-3385-0975-2509 (Visa Debit)
Cardholder: [REDACTED]
Expiration: 11/2025
CVV: 321
Amount: $678.45
Merchant Category: Home Goods
Status: Declined
Processor Response: 05-Do Not Honor

Transaction ID: PAY-2024-11-13-00150
Timestamp: 2024-11-13 09:28:47
Card Number: 5555-5555-5555-4444 (Mastercard)
Cardholder: [REDACTED]
Expiration: 07/2027
CVV: 654
Amount: $2,345.00
Merchant Category: Jewelry
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00151
Timestamp: 2024-11-13 09:45:19
Card Number: 3714-496353-98431 (American Express Corporate)
Cardholder: [REDACTED]
Expiration: 09/2026
CVV: 5678
Amount: $8,976.54
Merchant Category: Business Equipment
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00152
Timestamp: 2024-11-13 10:03:41
Card Number: 6011-0009-9013-9424 (Discover)
Cardholder: [REDACTED]
Expiration: 04/2028
CVV: 987
Amount: $156.78
Merchant Category: Online Services
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00153
Timestamp: 2024-11-13 10:22:08
Card Number: 4539-1488-0343-6467 (Visa)
Cardholder: [REDACTED]
Expiration: 02/2027
CVV: 246
Amount: $3,890.12
Merchant Category: Furniture
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00154
Timestamp: 2024-11-13 10:38:55
Card Number: 5105-1051-0510-5100 (Mastercard)
Cardholder: [REDACTED]
Expiration: 06/2026
CVV: 135
Amount: $745.23
Merchant Category: Sporting Goods
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00155
Timestamp: 2024-11-13 11:15:32
Card Number: 4485-2750-6271-8394 (Visa)
Cardholder: [REDACTED]
Expiration: 10/2025
CVV: 802
Amount: $4,567.89
Merchant Category: Computer Hardware
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00156
Timestamp: 2024-11-13 11:42:19
Card Number: 6011-6011-6011-6611 (Discover)
Cardholder: [REDACTED]
Expiration: 01/2028
CVV: 579
Amount: $912.34
Merchant Category: Software Licenses
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00157
Timestamp: 2024-11-13 12:08:44
Card Number: 3782-8224-6310-005 (American Express)
Cardholder: [REDACTED]
Expiration: 05/2027
CVV: 4321
Amount: $15,678.90
Merchant Category: Consulting Services
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00158
Timestamp: 2024-11-13 12:33:17
Card Number: 5200-8282-8282-8210 (Mastercard Debit)
Cardholder: [REDACTED]
Expiration: 08/2026
CVV: 468
Amount: $234.56
Merchant Category: Food Delivery
Status: Approved
Processor Response: 00-Approved

Transaction ID: PAY-2024-11-13-00159
Timestamp: 2024-11-13 12:55:02
Card Number: 4012-8888-8888-1881 (Visa)
Cardholder: [REDACTED]
Expiration: 12/2027
CVV: 753
Amount: $6,789.45
Merchant Category: Education
Status: Approved
Processor Response: 00-Approved

INCIDENT DETAILS:

Total Affected Transactions: 1,847
Time Period: November 1-13, 2024 (13 days)
Cardholder Data Compromised: Full PAN, Expiration Date, CVV (CRITICAL VIOLATION)
Total Transaction Value: $8,945,234.67

PCI-DSS VIOLATIONS IDENTIFIED:

1. Requirement 3.2.1: Do not store sensitive authentication data after authorization
   VIOLATION: CVV codes stored in plaintext

2. Requirement 3.3: Mask PAN when displayed
   VIOLATION: Full PANs visible in logs

3. Requirement 3.4: Render PAN unreadable in storage
   VIOLATION: PANs stored in plaintext, not encrypted

4. Requirement 8.2.1: Strong authentication mechanisms
   VIOLATION: Logging system accessed without MFA

5. Requirement 10.2: Audit trail for cardholder data access
   VIOLATION: No alerts triggered for PAN exposure

IMMEDIATE ACTIONS REQUIRED:

1. PURGE all log files containing unmasked PANs
2. NOTIFY acquiring bank and card brands (Visa, Mastercard, Amex, Discover)
3. ENGAGE forensic investigator for PCI Forensic Investigator (PFI) breach assessment
4. NOTIFY affected cardholders per state breach notification laws
5. IMPLEMENT card replacement program for all 1,847 affected cardholders
6. REMEDIATE logging configuration to tokenize all PANs

ESTIMATED FINANCIAL IMPACT:

PCI-DSS Fines: $50,000 - $500,000
Card Brand Assessments: $25,000 per brand
Forensic Investigation: $50,000 - $150,000
Card Reissuance Costs: $5 per card × 1,847 = $9,235
Customer Notifications: $15,000
Regulatory Penalties: Under review
Total Estimated Cost: $200,000 - $750,000+

SECURITY TEAM NOTES:

This document itself represents a PCI-DSS violation and must be handled according to incident response procedures. Access restricted to authorized security personnel only. Document must be encrypted at rest and in transit. Destruction required after investigation completion.

Incident Report Filed: SEC-INC-2024-1113
Acquiring Bank Notified: November 13, 2024 10:00 AM
Forensic Firm Engaged: CyberSec Forensics LLC
Expected Remediation: 30 days

Status: CRITICAL - IMMEDIATE REMEDIATION REQUIRED
    `.trim(),
    expectations: [
      expectDenial('pol_financial_deny_unmasked_cards'),
      expectDetectionMap({
        subjects: {
          CREDIT_CARD: [
            '4532-1234-5678-9010',
            '5425-2334-3010-9903',
            '3782-822463-10005',
            '6011-1111-1111-1117',
            '4916-3385-0975-2509',
          ],
        },
        predicates: {
          PCI_SCOPE_EVENT: [
            'Card Number',
            'stored',
            'CVV',
          ],
          TRANSACTION: [
            'processed',
            'Approved',
          ],
        },
      }),
    ],
  })
);

