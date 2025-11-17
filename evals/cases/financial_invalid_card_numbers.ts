/**
 * Financial Test Case: Invalid Card Numbers (Luhn Checksum Failure)
 * 
 * Numbers that look like cards but fail validation - tests false positives.
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

export const financialInvalidCardNumbersCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_invalid_card_numbers',
      title: 'Invalid Card Numbers - Luhn Checksum Failures',
      description:
        'Numbers resembling cards but failing Luhn validation should not trigger PCI policies',
      owner: 'financial',
      category: 'adversarial',
      severity: 'critical',
      tags: ['financial', 'luhn', 'validation', 'false-positive', 'allow'],
      risk: 'False positives on invalid numbers could block legitimate operations',
    },
    subjects: [financialSubjects.CREDIT_CARD],
    predicates: [],
    policies: [financialPolicies.pol_financial_deny_unmasked_cards],
    text: `
PAYMENT TESTING ENVIRONMENT
QA Test Data - Invalid Card Numbers for Testing

TEST CASE 1: Invalid Visa (Luhn Failure)
Test Card: 4532-1234-5678-0000
Luhn Checksum: FAILED (last digit should be 9010, not 0000)
Expected Behavior: Decline - Invalid Card Number
Use Case: Testing card validation logic

TEST CASE 2: Invalid Mastercard (Luhn Failure)
Test Card: 5425-2334-3010-0000  
Luhn Checksum: FAILED
Expected Behavior: Decline - Invalid Card Number
Use Case: Error handling validation

TEST CASE 3: Invalid Amex (Luhn Failure)
Test Card: 3782-822463-00000
Luhn Checksum: FAILED
Expected Behavior: Decline - Invalid Card Number
Use Case: Testing 15-digit Amex format

TEST CASE 4: Invalid Discover (Luhn Failure)
Test Card: 6011-1111-1111-0000
Luhn Checksum: FAILED
Expected Behavior: Decline - Invalid Card Number
Use Case: Decline code testing

TEST CASE 5: Sequential Numbers (Invalid)
Test Card: 1234-5678-9012-3456
Luhn Checksum: FAILED (Sequential pattern, not real card)
Expected Behavior: Decline - Pattern Detected
Use Case: Fraud detection testing

TEST CASE 6: Repeating Digits (Invalid)
Test Card: 4444-4444-4444-4444
Luhn Checksum: FAILED (All same digits)
Expected Behavior: Decline - Invalid Pattern
Use Case: Input validation testing

TEST CASE 7: Random Numbers (Invalid Format)
Test Card: 9999-8888-7777-6666
Luhn Checksum: FAILED (Wrong BIN range)
Expected Behavior: Decline - Unknown Card Type
Use Case: BIN validation testing

TEST CASE 8: Alphanumeric (Obviously Invalid)
Test Card: ABCD-EFGH-IJKL-MNOP
Format: Not numeric
Expected Behavior: Decline - Invalid Format
Use Case: Input sanitation testing

TEST CASE 9: Short Number (Invalid Length)
Test Card: 4532-1234-5678
Length: 12 digits (too short)
Expected Behavior: Decline - Invalid Length
Use Case: Length validation

TEST CASE 10: Long Number (Invalid Length)
Test Card: 4532-1234-5678-9010-1234
Length: 20 digits (too long)
Expected Behavior: Decline - Invalid Length
Use Case: Buffer overflow testing

TESTING NOTES:

These invalid card numbers should NOT trigger PCI-DSS compliance violations because they are not real payment card numbers. Systems using Luhn validation should filter these out before any PCI-scope processing occurs.

Pattern-only detection might flag these, but validation-based systems should allow them as they pose no actual cardholder data risk.

Recommended Approach:
1. Pattern match to identify potential card numbers
2. Apply Luhn algorithm to validate
3. Only treat Luhn-valid numbers as actual cards
4. Log invalid numbers as test data or typos, not PCI-scope data

This document contains only invalid, non-functional card numbers suitable for testing environments. No actual cardholder data is present.
    `.trim(),
    expectations: [expectAllow()],
  })
);

