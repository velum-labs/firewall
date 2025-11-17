/**
 * Legal Test Case: Sealed vs Public Court Documents
 */

import {
  defineCase,
  expectTokenizedEntities,
  allowUnchangedRegion,
  registerCase,
} from '../case-registry';
import {
  legalSubjects,
  legalPolicies,
} from '../catalog/legal';

export const legalSealedVsPublicCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_sealed_vs_public',
      title: 'Sealed vs Public Court Record Distinction',
      description:
        'Tests unless conditions for sealed vs public information',
      owner: 'legal',
      category: 'extended',
      severity: 'critical',
      tags: ['legal', 'sealed', 'public-record', 'selective', 'tokenize'],
      risk: 'Sealed documents require protection; public docket info does not',
    },
    subjects: [
      legalSubjects.CASE_NUMBER,
      legalSubjects.CLIENT_NAME,
      legalSubjects.CONFIDENTIAL_BUSINESS_INFO,
    ],
    predicates: [],
    policies: [
      legalPolicies.pol_legal_public_record_allow,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_confidential_info,
    ],
    text: `
DOCKET REPORT - Case No.: 23-CV-78901
Johnson v. MegaCorp Inc.

PUBLIC DOCKET ENTRIES:
- 11/01/2024: Complaint filed (PUBLIC - available on PACER)
- 11/05/2024: Answer filed (PUBLIC)
- 11/08/2024: Scheduling Order (PUBLIC)

SEALED FILINGS:
- 11/10/2024: FILED UNDER SEAL - Motion to Compel Production of Trade Secrets
  [Document contains client Johnson's proprietary manufacturing process - CONFIDENTIAL]
  
- 11/12/2024: FILED UNDER SEAL - Settlement Discussions
  [Contains confidential settlement terms and party admissions - PROTECTED]

PUBLIC INFORMATION:
Case: Johnson v. MegaCorp Inc. (Case 23-CV-78901)
Court: U.S. District Court
Judge: Hon. Sarah Mitchell
Status: Active Litigation

Public docket information remains unredacted. Sealed documents and confidential business information must be tokenized.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surface: 'Johnson',
          note: 'Client name in sealed context',
        },
        {
          kind: 'SUBJ',
          label: 'CONFIDENTIAL_BUSINESS_INFO',
          surfaces: ['proprietary manufacturing process', 'confidential settlement terms'],
          minCount: 1,
          note: 'Confidential info in sealed filings',
        },
      ]),
      allowUnchangedRegion([
        'Case No.: 23-CV-78901',
        'PACER',
        'PUBLIC',
        'Hon. Sarah Mitchell',
      ]),
    ],
  })
);

