/**
 * Legal Test Case: Case Number Format Variations
 */

import {
  allowUnchangedRegion,
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  legalSubjects,
  legalPolicies,
} from '../catalog/legal';

export const legalCaseNumberFormatsCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_case_number_formats',
      title: 'Multiple Case Number Format Patterns',
      description:
        'Tokenize client names while allowing public case numbers; exercise case-number detection patterns',
      owner: 'legal',
      category: 'extended',
      severity: 'major',
      tags: ['legal', 'case-numbers', 'formats', 'patterns', 'tokenize'],
      risk: 'Case numbers link to specific litigation and parties',
    },
    subjects: [legalSubjects.CASE_NUMBER, legalSubjects.CLIENT_NAME],
    predicates: [],
    policies: [
      legalPolicies.pol_legal_public_record_allow,
      legalPolicies.pol_legal_tokenize_client_names,
    ],
    text: `
CASE MANAGEMENT SYSTEM - ACTIVE LITIGATION
Law Firm Docket Report - November 13, 2024

Federal District Courts:
Client: Anderson - Case No. 1:23-cv-00456-JSW (N.D. Cal.)
Client: Martinez - Case No. 2:23-cv-01234-ABC (C.D. Cal.)
Client: Thompson - Case No. 3:23-cv-05678-DEF (S.D.N.Y.)

State Courts - California:
Client: Chen - Case No. 23-CV-12345 (Superior Court, SF)
Client: Rodriguez - Case No. 2023-CA-445566 (Los Angeles County)
Client: Park - Case No. BC-2023-0789 (Business Court)

Criminal Cases:
Client: Johnson - Case No. CR-2023-00123 (Federal)
Client: Williams - Case No. 2023-CR-4567 (State)

Appeals:
Client: Davis - Case No. 23-1234 (9th Circuit)
Client: Miller - Case No. A-2023-567 (State Appellate)

All case numbers must be tokenized while preserving client names.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surfaces: [
            'Anderson',
            'Martinez',
            'Thompson',
            'Chen',
            'Rodriguez',
            'Park',
            'Johnson',
            'Williams',
            'Davis',
            'Miller',
          ],
          note: 'All client names tokenized',
        },
      ]),
      allowUnchangedRegion([
        '1:23-cv-00456-JSW',
        '2:23-cv-01234-ABC',
        '3:23-cv-05678-DEF',
        '23-CV-12345',
        '2023-CA-445566',
        'BC-2023-0789',
        'CR-2023-00123',
        '2023-CR-4567',
        '23-1234',
        'A-2023-567',
      ]),
    ],
  })
);

