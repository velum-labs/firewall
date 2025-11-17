/**
 * Financial Test Case: Pre-Masked Card Numbers
 * 
 * Cards already masked should be allowed (already compliant).
 */

import {
  defineCase,
  expectAllow,
  registerCase,
} from '../case-registry';
import {
  financialSubjects,
  financialPolicies,
} from '../catalog/financial';

export const financialMaskedCardNumbersCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_masked_card_numbers',
      title: 'Pre-Masked Card Numbers - Already Compliant',
      description:
        'Partially masked cards are PCI compliant and should be allowed',
      owner: 'financial',
      category: 'adversarial',
      severity: 'major',
      tags: ['financial', 'masked', 'pci-compliant', 'allow'],
      risk: 'Over-blocking masked cards would prevent legitimate operations',
    },
    subjects: [financialSubjects.CREDIT_CARD],
    predicates: [],
    policies: [financialPolicies.pol_financial_masked_allow],
    text: `
PAYMENT RECONCILIATION REPORT
Customer Service Department - Transaction Lookup
Date: November 13, 2024

TRANSACTION REVIEW CASES:

Case #1: Customer Inquiry
Transaction ID: PAY-2024-1113-001
Customer: [NAME REDACTED]
Card Used: ****-****-****-1234 (Visa)
Amount: $456.78
Date: November 10, 2024
Status: Successfully Processed
Customer Question: "I don't recognize this charge"
Resolution: Customer confirmed legitimate purchase after reviewing merchant name

Case #2: Chargeback Dispute
Transaction ID: PAY-2024-1113-002
Customer: [NAME REDACTED]
Card Used: XXXX-XXXX-XXXX-5678 (Mastercard)
Amount: $1,234.00
Date: November 8, 2024
Status: Chargeback Filed
Merchant: Online Electronics Store
Investigation: Merchant provided tracking showing delivery, chargeback reversed

Case #3: Subscription Cancellation
Transaction ID: PAY-2024-1113-003
Customer: [NAME REDACTED]
Card Used: ************9012 (American Express)
Amount: $19.99
Date: November 1, 2024 (Recurring)
Status: Subscription Cancelled
Notes: Customer requested cancellation, final charge processed, no future charges

Case #4: Duplicate Charge Investigation  
Transaction ID: PAY-2024-1113-004
Customer: [NAME REDACTED]
Card Used: XXXXXXXXXXXX3456 (Discover)
Amount: $89.50 (charged twice)
Date: November 12, 2024
Status: Refund Issued
Resolution: System error caused duplicate charge, second charge refunded within 24 hours

Case #5: Fraud False Positive
Transaction ID: PAY-2024-1113-005
Customer: [NAME REDACTED]
Card Used: ####-####-####-7890 (Visa Debit)
Amount: $2,500.00
Date: November 11, 2024
Status: Initially Declined - Now Approved
Issue: Large purchase in new location triggered fraud alert, customer verified transaction via SMS

PAYMENT HISTORY LOOKUP:

Account: CUST-445566
Card on File: ****-****-****-2345 (Visa)
Recent Transactions:
- Nov 13: $45.67 at Coffee Shop - Approved
- Nov 12: $156.78 at Gas Station - Approved
- Nov 10: $234.56 at Restaurant - Approved
- Nov 8: $1,200.00 at Electronics Store - Approved
- Nov 5: $67.89 at Grocery Store - Approved

Account: CUST-778899
Card on File: XXXX-XXXX-XXXX-6789 (Mastercard)
Recent Transactions:
- Nov 13: $89.99 at Streaming Service - Approved
- Nov 10: $1,567.00 at Travel Agency - Approved
- Nov 7: $345.00 at Department Store - Approved

BILLING STATEMENT PREVIEW:

Cardholder: [NAME REDACTED]
Account Ending In: 4321
Card Type: Visa
Billing Period: October 13 - November 12, 2024

Transactions:
10/15 - Restaurant XYZ - $78.90
10/18 - Online Shopping - $245.00
10/22 - Gas Station - $56.78
10/28 - Grocery Store - $187.45
11/02 - Coffee Shop - $12.34
11/08 - Electronics - $1,456.00

Previous Balance: $2,347.18
Payments Received: -$2,347.18
New Charges: $2,036.47
New Balance: $2,036.47
Minimum Payment Due: $61.09

Card Number for Reference: XXXX-XXXX-XXXX-4321

All card numbers shown in this report are properly masked per PCI-DSS requirements (only last 4 digits visible). This document is PCI-compliant and approved for customer service use.
    `.trim(),
    expectations: [expectAllow()],
  })
);

