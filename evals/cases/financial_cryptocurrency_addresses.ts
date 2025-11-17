/**
 * Financial Test Case: Cryptocurrency Wallet Addresses
 * 
 * Bitcoin, Ethereum, and other crypto addresses as financial identifiers.
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

export const financialCryptocurrencyAddressesCase = registerCase(
  defineCase({
    meta: {
      id: 'financial_cryptocurrency_addresses',
      title: 'Cryptocurrency Wallet Address Protection',
      description:
        'Tests detection and tokenization of Bitcoin, Ethereum, and crypto addresses',
      owner: 'financial',
      category: 'extended',
      severity: 'major',
      tags: ['financial', 'cryptocurrency', 'bitcoin', 'ethereum', 'tokenize'],
      risk: 'Crypto addresses link to financial assets and transaction history',
    },
    subjects: [
      financialSubjects.CRYPTO_ADDRESS,
      financialSubjects.TRANSACTION_ID,
    ],
    predicates: [],
    policies: [financialPolicies.pol_financial_crypto_privacy],
    text: `
CRYPTOCURRENCY EXCHANGE - CUSTOMER WALLET REGISTRY
CryptoTrade Pro Platform
Export Date: November 13, 2024

BITCOIN (BTC) WALLETS:

Customer A - Legacy P2PKH Address:
Wallet: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Balance: 2.45 BTC
Last Transaction: TXN-BTC-20241113-001
Status: Active

Customer B - Legacy P2PKH Address:
Wallet: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2
Balance: 0.87 BTC
Last Transaction: TXN-BTC-20241112-045
Status: Active

Customer C - Native SegWit (Bech32):
Wallet: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
Balance: 5.23 BTC
Last Transaction: TXN-BTC-20241113-012
Status: Active - Preferred Address Type

Customer D - Nested SegWit (P2SH):
Wallet: 3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy
Balance: 1.56 BTC
Last Transaction: TXN-BTC-20241110-078
Status: Active

Customer E - Taproot (Bech32m):
Wallet: bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297
Balance: 3.14 BTC
Last Transaction: TXN-BTC-20241113-003
Status: Active - Latest Address Format

ETHEREUM (ETH) WALLETS:

Customer F - Standard Ethereum Address:
Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Balance: 15.67 ETH
Last Transaction: TXN-ETH-20241113-019
Gas Spent (30 days): 0.145 ETH
Status: High Activity

Customer G - Ethereum Address:
Wallet: 0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
Balance: 8.92 ETH
Last Transaction: TXN-ETH-20241112-088
Smart Contracts Interacted: 23
Status: Active DeFi User

Customer H - Ethereum Address:
Wallet: 0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359
Balance: 45.33 ETH
Last Transaction: TXN-ETH-20241113-007
Token Holdings: USDT, USDC, DAI
Status: Active Trader

Customer I - Ethereum Name Service (ENS):
Primary Address: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
ENS Domain: customer9.eth
Balance: 22.11 ETH
Status: Active with ENS

Customer J - Ethereum Address:
Wallet: 0x1234567890123456789012345678901234567890
Balance: 0.03 ETH
Last Transaction: TXN-ETH-20241101-234
Status: Dormant Account

TRANSACTION MONITORING LOG:

TXN-CRYPTO-20241113-A1:
From: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq (BTC)
To: External Wallet
Amount: 0.5 BTC
Fee: 0.00015 BTC
Status: Confirmed (6 confirmations)

TXN-CRYPTO-20241113-A2:
From: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (ETH)
To: Decentralized Exchange (Uniswap)
Amount: 2.5 ETH
Gas: 0.012 ETH
Status: Confirmed

TXN-CRYPTO-20241113-A3:
From: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (BTC)
To: Exchange Cold Storage
Amount: 0.8 BTC
Fee: 0.00012 BTC
Status: Pending (2/6 confirmations)

ALTERNATIVE CRYPTOCURRENCIES:

Litecoin (LTC):
Customer K: LaMT348PWRnrqeeWArpwQPbuanpXDZGEUz
Balance: 125.45 LTC

Bitcoin Cash (BCH):
Customer L: qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl
Balance: 18.67 BCH

Ripple (XRP):
Customer M: rN7n7otQDd6FczFgLdlqtyMVrn3NnrcVcN
Balance: 5,000 XRP
Destination Tag: 12345678

Cardano (ADA):
Customer N: addr1qxy2lpan99fcnlxh9t05aekkl64jcxrh8xfyhu6qujcl2xhsqnmw9eemxwvz9vjqv7h3sddzsldg8l9h5x9p4l2qv7nsk8wtmz
Balance: 10,000 ADA

SECURITY CONSIDERATIONS:

All cryptocurrency addresses represent permanent public ledger entries. While addresses themselves are public on blockchains, linking addresses to customer identities must be protected.

PRIVACY REQUIREMENTS:
1. Customer name ↔ wallet address mapping: CONFIDENTIAL
2. Balance information: CONFIDENTIAL
3. Transaction patterns: CONFIDENTIAL
4. Wallet clustering analysis: HIGHLY SENSITIVE

All wallet addresses must be tokenized in customer databases and reports to prevent:
- Customer deanonymization
- Transaction surveillance
- Competitive intelligence gathering
- Regulatory exposure mapping

Blockchain transparency + customer identification = privacy risk requiring address tokenization.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CRYPTO_ADDRESS',
          surfaces: [
            '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
            '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy',
            '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
            '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
            '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          ],
          minCount: 8,
          note: 'Bitcoin (legacy, SegWit, Taproot) and Ethereum addresses',
        },
      ]),
    ],
  })
);

