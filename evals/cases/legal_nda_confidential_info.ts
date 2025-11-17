/**
 * Legal Test Case: NDA with Confidential Information
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  legalSubjects,
  legalPredicates,
  legalPolicies,
} from '../catalog/legal';

export const legalNdaConfidentialInfoCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_nda_confidential_info',
      title: 'Non-Disclosure Agreement with Trade Secrets',
      description:
        'NDA containing confidential business information definitions',
      owner: 'legal',
      category: 'extended',
      severity: 'major',
      tags: ['legal', 'nda', 'confidential', 'trade-secrets', 'tokenize'],
      risk: 'NDAs contain definitions of protected confidential information',
    },
    subjects: [
      legalSubjects.CLIENT_NAME,
      legalSubjects.CONFIDENTIAL_BUSINESS_INFO,
    ],
    predicates: [legalPredicates.CONFIDENTIALITY_AGREEMENT],
    policies: [
      legalPolicies.pol_legal_nda_enforce,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_confidential_info,
    ],
    text: `
MUTUAL NON-DISCLOSURE AGREEMENT

Parties: InnovaTech Solutions Inc. ("Disclosing Party") and Strategic Partners LLC ("Receiving Party")
Date: November 13, 2024

1. CONFIDENTIAL INFORMATION DEFINED:
"Confidential Information" includes:
- Proprietary software algorithms (trade secret)
- Customer lists and pricing information
- Product roadmaps and development plans
- Financial projections and business strategies
- Technical specifications for the X-500 platform

2. OBLIGATIONS:
Receiving Party Strategic Partners LLC agrees to:
- Maintain confidentiality of all Confidential Information
- Use information solely for evaluation of potential partnership
- Return or destroy all materials upon request

3. TERM:
This NDA remains in effect for 5 years from date of execution.

Client InnovaTech's proprietary catalyst formula and manufacturing processes constitute trade secrets subject to this agreement. Breach results in irreparable harm requiring injunctive relief.

Executed by authorized representatives of both parties.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surfaces: ['InnovaTech Solutions', 'Strategic Partners LLC'],
          note: 'Parties to NDA',
        },
        {
          kind: 'SUBJ',
          label: 'CONFIDENTIAL_BUSINESS_INFO',
          minCount: 2,
          note: 'Confidential information types',
        },
        {
          kind: 'PRED',
          label: 'CONFIDENTIALITY_AGREEMENT',
          minCount: 1,
          targets: 'both',
          note: 'NDA terms and obligations',
        },
      ]),
    ],
  })
);

