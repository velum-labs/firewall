/**
 * Financial Test Case: Transaction Timestamps
 * 
 * Precise timestamps with timezones must be preserved exactly.
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

export const financialTransactionTimestampsCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_transaction_timestamps',
      title: 'Transaction Timestamp Precision',
      description:
        'Tests preservation of exact timestamps including milliseconds and timezones',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'timestamp', 'precision', 'timezone', 'tokenize'],
      risk: 'Timestamp alterations invalidate fraud analysis and regulatory compliance',
    },
    subjects: [
      financialSubjects.TRANSACTION_ID,
      financialSubjects.ACCOUNT_NUMBER,
    ],
    predicates: [financialPredicates.TRANSACTION],
    policies: [
      financialPolicies.pol_financial_tokenize_transactions,
      financialPolicies.pol_financial_tokenize_accounts,
      financialPolicies.pol_financial_tokenize_transaction_ids,
    ],
    text: `
HIGH-FREQUENCY TRADING LOG
Microsecond Precision Transaction Records

Account: 9876543210

TXN-2024-11-13-000001
Timestamp: 2024-11-13T09:30:00.123456Z (UTC)
Amount: $10,000.00
Type: Buy Order

TXN-2024-11-13-000002
Timestamp: 2024-11-13T09:30:00.234567Z (UTC)
Amount: $15,000.00
Type: Sell Order
Latency: 111.111ms from previous

TXN-2024-11-13-000003
Timestamp: 2024-11-13T14:32:18.456789+00:00 (ISO 8601)
Amount: $25,000.00
Type: Market Order

TXN-2024-11-13-000004
Timestamp: 2024-11-13T10:15:30.789012-05:00 (EST)
Amount: $30,000.00
Type: Limit Order

TXN-2024-11-13-000005
Timestamp: 2024-11-13T16:45:22.345678+01:00 (CET)
Amount: $45,000.00
Type: Stop Loss

TXN-2024-11-13-000006
Timestamp: 2024-11-13T23:59:59.999999Z (End of day)
Amount: $5,000.00
Type: After Hours Trade

Account: 8765432109

TXN-2024-11-13-000007
Timestamp: 2024-11-13T00:00:00.000001Z (Start of day)
Amount: $12,000.00
Type: Pre-Market Order

TXN-2024-11-13-000008
Timestamp: 2024-11-13T12:00:00.000000Z (Exactly noon UTC)
Amount: $50,000.00
Type: Large Block Trade

All timestamps must be preserved exactly as shown including:
- Date (YYYY-MM-DD)
- Time (HH:MM:SS)
- Subsecond precision (microseconds)
- Timezone offsets
- Format variations (Z, +HH:MM, -HH:MM)

Any timestamp modification invalidates audit trail and regulatory compliance.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'TRANSACTION_ID',
          surfaces: [
            'TXN-2024-11-13-000001',
            'TXN-2024-11-13-000008',
          ],
          minCount: 2,
          note: 'Transaction IDs tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          surfaces: ['9876543210', '8765432109'],
          note: 'Account numbers tokenized',
        },
        {
          kind: 'PRED',
          label: 'TRANSACTION',
          minCount: 8,
          targets: 'both',
          note: 'All transaction events',
        },
      ]),
      allowUnchangedRegion([
        '2024-11-13T09:30:00.123456Z',
        '2024-11-13T14:32:18.456789+00:00',
        '2024-11-13T10:15:30.789012-05:00',
        '2024-11-13T16:45:22.345678+01:00',
        '2024-11-13T23:59:59.999999Z',
        '$10,000.00',
      ]),
    ],
  })
);

