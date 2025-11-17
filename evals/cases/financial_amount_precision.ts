/**
 * Financial Test Case: Amount Precision Preservation
 * 
 * Multiple currency formats - amounts must remain byte-identical.
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

export const financialAmountPrecisionCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_amount_precision',
      title: 'Currency Amount Precision Preservation',
      description:
        'Tests that amounts and currency formatting remain exactly preserved during tokenization',
      owner: 'financial',
      category: 'extended',
      severity: 'critical',
      tags: ['financial', 'precision', 'currency', 'amounts', 'tokenize'],
      risk: 'Altering financial amounts even slightly causes reconciliation failures',
    },
    subjects: [
      financialSubjects.ACCOUNT_NUMBER,
      financialSubjects.TRANSACTION_ID,
    ],
    predicates: [financialPredicates.TRANSACTION],
    policies: [
      financialPolicies.pol_financial_tokenize_transactions,
      financialPolicies.pol_financial_tokenize_accounts,
    ],
    text: `
MULTI-CURRENCY TRANSACTION RECONCILIATION
Global Treasury Operations
Date: November 13, 2024

US DOLLAR TRANSACTIONS:

Account 9876543210:
$1,234.56 - Purchase at retail store
$12,345.67 - Payroll deposit
$123,456.78 - Real estate transaction  
$1,234,567.89 - Corporate acquisition payment

Account 8765432109:
$0.01 - Micropayment test
$0.99 - Subscription service
$999,999.99 - Investment transfer
$1,000,000.00 - Wire transfer (exactly one million)

EURO TRANSACTIONS:

Account 7654321098:
€1.234,56 - European merchant (comma decimal)
€12.345,67 - International wire
€123.456,78 - Business payment
€1.234.567,89 - Large corporate transfer

Account 6543210987:
€0,50 - Coffee shop
€9,99 - Digital service
€999.999,99 - Asset sale
€1.000.000,00 - Escrow payment

BRITISH POUND TRANSACTIONS:

Account 5432109876:
£1,234.56 - UK supplier payment
£12,345.67 - Investment income
£123,456.78 - Property purchase
£1,234,567.89 - M&A transaction

YEN TRANSACTIONS (No Decimal Places):

Account 4321098765:
¥1,234 - Tokyo restaurant
¥123,456 - Monthly rent
¥1,234,567 - Vehicle purchase
¥123,456,789 - Real estate investment

SWISS FRANC TRANSACTIONS:

Account 3210987654:
CHF 1'234.56 - Swiss format (apostrophe separator)
CHF 12'345.67 - Banking service fee
CHF 123'456.78 - Asset management
CHF 1'234'567.89 - Private banking transfer

PRECISION CRITICAL AMOUNTS:

Account 2109876543:
$0.001 - Fractional cent (mil)
$12.3456 - Four decimal places
$1,234.567890 - Six decimal precision
$999.995 - Rounding sensitive

CRYPTOCURRENCY PRECISION:

Account 1098765432:
0.00000001 BTC - 1 satoshi
0.12345678 BTC - Eight decimal precision
1.23456789012345 ETH - Full Ethereum precision
1234.567890123456 USDT - Stablecoin precision

All monetary amounts above must remain EXACTLY as shown - no rounding, no format changes, no decimal shifts. Account numbers should be tokenized but amounts must be byte-identical to original.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: [
            '9876543210',
            '8765432109',
            '7654321098',
            '6543210987',
            '5432109876',
            '4321098765',
            '3210987654',
            '2109876543',
            '1098765432',
          ],
          note: 'All account numbers tokenized',
        },
        {
          kind: 'PRED',
          label: 'TRANSACTION',
          minCount: 9,
          targets: 'both',
          note: 'Transaction events per account',
        },
      ]),
      allowUnchangedRegion([
        '$1,234.56',
        '€1.234,56',
        '£1,234.56',
        '¥1,234',
        "CHF 1'234.56",
        '$0.001',
        '0.00000001 BTC',
        '$1,000,000.00',
        '€1.000.000,00',
      ]),
    ],
  })
);

