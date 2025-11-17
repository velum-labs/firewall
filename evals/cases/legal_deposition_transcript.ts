/**
 * Legal Test Case: Deposition Transcript
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

export const legalDepositionTranscriptCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_deposition_transcript',
      title: 'Deposition Transcript Q&A Format',
      description:
        'Tests structured deposition dialogue with witness names and testimony',
      owner: 'legal',
      category: 'extended',
      severity: 'major',
      tags: ['legal', 'deposition', 'transcript', 'witness', 'tokenize'],
      risk: 'Deposition transcripts contain witness testimony and case strategy',
    },
    subjects: [
      legalSubjects.WITNESS_NAME,
      legalSubjects.ATTORNEY_NAME,
      legalSubjects.CASE_NUMBER,
    ],
    predicates: [legalPredicates.TESTIMONY],
    policies: [
      legalPolicies.pol_legal_deposition_redact,
      legalPolicies.pol_legal_tokenize_attorney_names,
      legalPolicies.pol_legal_tokenize_witness_names,
    ],
    text: `
DEPOSITION TRANSCRIPT
Case No.: 23-CV-44556
Matter: Johnson v. TechCorp Inc.
Deponent: Robert Chen
Date: November 13, 2024

APPEARANCES:
Sarah Mitchell, Esq. - Attorney for Plaintiff
Michael Rodriguez, Esq. - Attorney for Defendant
Court Reporter: Jennifer Park, CSR

Q. (By Ms. Mitchell) Please state your name for the record.
A. Robert Chen.

Q. Mr. Chen, were you present at the meeting on March 15, 2023?
A. Yes, I was.

Q. Who else attended that meeting?
A. The CEO, David Thompson, was there. Also present were Lisa Anderson from HR and witness Maria Rodriguez from legal department.

Q. What did Mr. Thompson say regarding the plaintiff?
A. He stated that, quote, "we need to find a younger replacement."

Q. Did anyone object to this statement?
A. Witness Maria Rodriguez said it could create legal issues, but Mr. Thompson dismissed her concerns.

Deponent Robert Chen provided testimony regarding discriminatory statements. Witness testimony continues for 47 pages. All witness names and attorney names must be tokenized.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'WITNESS_NAME',
          surfaces: ['Robert Chen', 'Maria Rodriguez'],
          note: 'Deponent and other witnesses',
        },
        {
          kind: 'SUBJ',
          label: 'ATTORNEY_NAME',
          surfaces: ['Sarah Mitchell', 'Michael Rodriguez'],
          note: 'Attorneys conducting deposition',
        },
        {
          kind: 'PRED',
          label: 'TESTIMONY',
          minCount: 2,
          targets: 'subjects',
          note: 'Testimony events',
        },
      ]),
    ],
  })
);

