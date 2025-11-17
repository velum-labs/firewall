/**
 * Financial Test Case: Multi-Currency Foreign Exchange
 * 
 * FX transactions with multiple currencies and exchange rates.
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

export const financialMultiCurrencyTransactionCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_multi_currency_transaction',
      title: 'Multi-Currency Foreign Exchange Transaction',
      description:
        'Tests preservation of exchange rates and multiple currency values',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'forex', 'multi-currency', 'exchange-rate', 'tokenize'],
      risk: 'FX rates and amounts must be preserved exactly for accounting and compliance',
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
FOREIGN EXCHANGE TRANSACTION CONFIRMATION
Global Treasury Services - FX Trading Desk
Execution Date: November 13, 2024

TRANSACTION #1: USD to EUR Conversion
Transaction ID: FX-2024-1113-001
Customer Account: 9876543210

Sell Currency: USD (United States Dollar)
Sell Amount: $1,000,000.00
Buy Currency: EUR (Euro)
Buy Amount: €920,000.00
Exchange Rate: 0.9200 EUR/USD
Mid-Market Rate: 0.9185 EUR/USD
Bank Spread: 0.0015 (15 basis points)
Value Date: 2024-11-15 (T+2)

Originating Bank: JPMorgan Chase (New York)
Beneficiary Bank: Deutsche Bank (Frankfurt)

TRANSACTION #2: GBP to JPY Conversion
Transaction ID: FX-2024-1113-002
Customer Account: 8765432109

Sell Currency: GBP (British Pound Sterling)
Sell Amount: £500,000.00
Buy Currency: JPY (Japanese Yen)
Buy Amount: ¥93,750,000
Exchange Rate: 187.50 JPY/GBP
Market Rate: 187.35 JPY/GBP
Spread: 0.15 JPY (8 basis points)
Value Date: 2024-11-14 (T+1)

Originating Bank: Barclays (London)
Beneficiary Bank: Mizuho Bank (Tokyo)

TRANSACTION #3: EUR to CHF Conversion
Transaction ID: FX-2024-1113-003
Customer Account: 7654321098

Sell Currency: EUR (Euro)
Sell Amount: €250,000.00
Buy Currency: CHF (Swiss Franc)
Buy Amount: CHF 232,500.00
Exchange Rate: 0.9300 CHF/EUR
Market Rate: 0.9285 CHF/EUR
Spread: 0.0015 (16 basis points)
Value Date: 2024-11-13 (Same Day)

Originating Bank: BNP Paribas (Paris)
Beneficiary Bank: UBS (Zurich)

TRANSACTION #4: Triangular Currency Trade
Transaction ID: FX-2024-1113-004
Customer Account: 6543210987

Step 1: USD → EUR
Sell: $100,000.00
Buy: €92,000.00
Rate: 0.9200 EUR/USD

Step 2: EUR → GBP
Sell: €92,000.00
Buy: £80,360.00
Rate: 0.8735 GBP/EUR

Step 3: GBP → USD
Buy: $101,654.60
Rate: 1.2650 USD/GBP

Net Position: Gained $1,654.60 through arbitrage

TRANSACTION #5: Exotic Currency Pair
Transaction ID: FX-2024-1113-005
Customer Account: 5432109876

Sell Currency: SGD (Singapore Dollar)
Sell Amount: SGD 500,000.00
Buy Currency: AUD (Australian Dollar)
Buy Amount: AUD 556,500.00
Exchange Rate: 1.1130 AUD/SGD
Market Rate: 1.1115 AUD/SGD
Value Date: 2024-11-15

TRANSACTION #6: Multiple Currency Split
Transaction ID: FX-2024-1113-006
Customer Account: 4321098765

Source: $500,000.00 USD

Split Distribution:
- 40% → EUR: €184,000.00 @ 0.9200
- 30% → GBP: £118,350.00 @ 0.7890
- 20% → JPY: ¥15,000,000 @ 150.00
- 10% → CHF: CHF 46,500.00 @ 0.9300

All exchange rates, amounts, and currency values must remain EXACTLY as shown. Account numbers tokenized but all financial figures preserved with full precision including decimal places and currency symbols.
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
          ],
          note: 'All customer accounts',
        },
        {
          kind: 'SUBJ',
          label: 'TRANSACTION_ID',
          surfaces: [
            'FX-2024-1113-001',
            'FX-2024-1113-006',
          ],
          minCount: 2,
          note: 'FX transaction IDs',
        },
        {
          kind: 'PRED',
          label: 'TRANSACTION',
          minCount: 6,
          targets: 'both',
          note: 'All FX transactions',
        },
      ]),
      allowUnchangedRegion([
        '$1,000,000.00',
        '€920,000.00',
        '0.9200 EUR/USD',
        '£500,000.00',
        '¥93,750,000',
        '187.50 JPY/GBP',
        'CHF 232,500.00',
      ]),
    ],
  })
);

