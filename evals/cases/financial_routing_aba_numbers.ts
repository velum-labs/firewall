/**
 * Financial Test Case: ABA Routing Numbers
 * 
 * 9-digit routing numbers for US banks.
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  financialSubjects,
  financialPolicies,
} from '../catalog/financial';

export const financialRoutingAbaNumbersCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_routing_aba_numbers',
      title: 'ABA Routing Transit Numbers',
      description:
        'Tests detection of 9-digit ABA routing numbers',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'routing', 'aba', 'domestic', 'tokenize'],
      risk: 'Routing numbers link to specific bank branches and accounts',
    },
    subjects: [
      financialSubjects.ROUTING_NUMBER,
      financialSubjects.ACCOUNT_NUMBER,
      financialSubjects.FINANCIAL_INSTITUTION,
    ],
    predicates: [],
    policies: [financialPolicies.pol_financial_tokenize_accounts],
    text: `
DOMESTIC ACH SETUP FORM
Direct Deposit Authorization

Employee #1:
Bank Name: Chase Bank
Routing Number: 021000021
Account Number: 9876543210
Account Type: Checking

Employee #2:
Bank Name: Bank of America
RTN: 026009593
Account Number: 8765432109
Account Type: Savings

Employee #3:
Bank Name: Wells Fargo
ABA: 121000248
Account Number: 7654321098
Account Type: Checking

Employee #4:
Bank Name: Citibank
Routing: 021000089
Account Number: 6543210987
Account Type: Checking

Employee #5:
Bank Name: US Bank
ABA Routing Number: 091000019
Account Number: 5432109876
Account Type: Checking

Employee #6:
Bank Name: PNC Bank
Transit Routing: 043000096
Account Number: 4321098765
Account Type: Savings

Employee #7:
Bank Name: TD Bank
Routing Number: 011103093
Account Number: 3210987654
Account Type: Checking

Employee #8:
Bank Name: Capital One
RTN Number: 056073502
Account Number: 2109876543
Account Type: 360 Checking

Employee #9:
Bank Name: Navy Federal Credit Union
ABA Number: 256074974
Account Number: 1098765432
Account Type: Savings

Employee #10:
Bank Name: Charles Schwab Bank
Routing: 121202211
Account Number: 0987654321
Account Type: High Yield Investor Checking

All routing numbers above are valid ABA routing transit numbers used for ACH, wire transfers, and check processing. These must be tokenized along with account numbers.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'ROUTING_NUMBER',
          surfaces: [
            '021000021',
            '026009593',
            '121000248',
            '021000089',
            '091000019',
            '043000096',
            '011103093',
            '056073502',
            '256074974',
            '121202211',
          ],
          note: 'All 9-digit ABA routing numbers',
        },
        {
          kind: 'SUBJ',
          label: 'ACCOUNT_NUMBER',
          minCount: 10,
          note: 'Associated account numbers',
        },
      ]),
    ],
  })
);

