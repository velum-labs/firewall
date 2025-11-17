/**
 * Legal Test Case: Multi-Case Conflict Check
 * 
 * Document referencing multiple cases and clients.
 * Tests exact cardinality matching and conflict detection.
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

export const legalMultiCaseConflictCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_multi_case_conflict',
      title: 'Multi-Case Conflict of Interest Analysis',
      description:
        'Conflicts check memo referencing multiple cases and clients requiring proper binding',
      owner: 'legal',
      category: 'core',
      severity: 'critical',
      tags: ['legal', 'conflicts', 'multi-case', 'cardinality', 'tokenize'],
      risk: 'Conflicts of interest can result in disqualification and ethical violations',
    },
    subjects: [
      legalSubjects.CLIENT_NAME,
      legalSubjects.CASE_NUMBER,
      legalSubjects.ATTORNEY_NAME,
      legalSubjects.OPPOSING_PARTY,
    ],
    predicates: [],
    policies: [
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_attorney_names,
      legalPolicies.pol_legal_tokenize_opposing_party,
      legalPolicies.pol_legal_tokenize_case_numbers,
    ],
    text: `
CONFLICTS OF INTEREST MEMORANDUM
CONFIDENTIAL - ATTORNEY WORK PRODUCT

To: Sarah Mitchell, Managing Partner
From: Michael Rodriguez, Conflicts Counsel
Re: New Client Intake - Conflicts Analysis
Date: November 13, 2024

PROSPECTIVE CLIENT INFORMATION:

Prospective Client: Jennifer Anderson
Matter: Employment discrimination claim
Opposing Party: TechCorp Global Inc.
Proposed Case: Anderson v. TechCorp Global Inc. (to be filed)

CONFLICTS CHECK RESULTS:

I have completed a comprehensive conflicts analysis regarding representation of prospective client Jennifer Anderson against TechCorp Global Inc. The following issues require partner review:

ISSUE #1: Current Client Representation

Our firm currently represents David Thompson in Case No. 23-CV-11223 (Thompson v. MegaSoft Industries). David Thompson is a former employee of MegaSoft Industries alleging age discrimination.

Opposing Party: MegaSoft Industries (current defendant in the Thompson matter).

Conflict Analysis: NO CONFLICT
- Different opposing parties (TechCorp Global vs. MegaSoft Industries)
- No relationship between the companies
- Different industries and legal issues
- Both employment discrimination cases but factually unrelated
Recommendation: CLEARED

ISSUE #2: Former Client Relationship

Our firm previously represented Robert Chen in Case No. 22-CV-88765 (Chen v. DataCorp Systems), which settled in March 2023. Robert Chen alleged wrongful termination.

Opposing Party: DataCorp Systems (former employer named in Chen litigation).

During that representation, attorney Sarah Mitchell learned that Robert Chen previously worked at TechCorp Global Inc. (prospective opposing party) from 2015-2018.

Conflict Analysis: POTENTIAL CONFLICT
- Robert Chen (former client) worked at TechCorp Global (prospective opposing party)
- Uncertain whether our representation of Robert Chen involved confidential information about TechCorp Global
- Rule 1.9 analysis required (duties to former clients)

Action Required: Contact Robert Chen for conflict waiver. If Robert Chen objects, we cannot represent Jennifer Anderson against TechCorp Global without screening safeguards.

ISSUE #3: Related Party Representation

Our firm currently represents Maria Rodriguez in Case No. 23-CV-44556 (Rodriguez v. InnoTech Solutions). Maria Rodriguez is suing her former employer for pregnancy discrimination.

Opposing Party: InnoTech Solutions (now a wholly owned TechCorp Global subsidiary).

Cross-reference check reveals: TechCorp Global Inc. (prospective opposing party) acquired InnoTech Solutions in December 2022. Maria Rodriguez now technically employed by TechCorp Global as parent company.

Conflict Analysis: DIRECT CONFLICT IDENTIFIED
- Maria Rodriguez (current client) employed by TechCorp Global (prospective opposing party)
- Directly adverse representation prohibited under Rule 1.7
- Cannot represent Jennifer Anderson against TechCorp Global while simultaneously representing Maria Rodriguez (TechCorp employee)

Recommendation: DECLINE REPRESENTATION of Jennifer Anderson unless Maria Rodriguez matter concludes or client obtains different counsel.

ISSUE #4: Adverse to Former Client's Subsidiary

Our firm represented GlobalTech Holdings LLC in Case No. 21-CV-99887 (GlobalTech Holdings v. Competitive Corp), concluded June 2022.

Corporate records search reveals: TechCorp Global Inc. (prospective opposing party) is a wholly-owned subsidiary of GlobalTech Holdings LLC (former client).

Conflict Analysis: SIGNIFICANT CONFLICT
- Substantially related matter analysis required
- Former client GlobalTech Holdings likely has confidential information about subsidiary TechCorp Global
- Rule 1.9(a) prohibits representation materially adverse to former client in substantially related matter

Recommendation: DECLINE REPRESENTATION unless GlobalTech Holdings provides informed consent waiver.

ISSUE #5: Common Counsel in Unrelated Matter

Attorney Lisa Anderson in our firm currently represents TechCorp Global Inc. in Case No. 23-CV-33445 (TechCorp Global v. Patent Holdings LLC), patent litigation matter.

Conflict Analysis: CONCURRENT CONFLICT - IMPERMISSIBLE
- Our firm cannot sue TechCorp Global (in Anderson employment case) while simultaneously representing TechCorp Global (in patent case)
- Direct conflict under Rule 1.7(a)
- Regardless of whether matters are related, concurrent representation for and against same client prohibited

Recommendation: MUST DECLINE Jennifer Anderson representation. Cannot take case adverse to current client Lisa Anderson is representing.

SUMMARY OF CONFLICTS:

Current Clients:
1. David Thompson (Case 23-CV-11223) - NO CONFLICT
2. Maria Rodriguez (Case 23-CV-44556) - DIRECT CONFLICT (employed by opposing party parent)
3. TechCorp Global (Case 23-CV-33445, Lisa Anderson representation) - IMPERMISSIBLE CONCURRENT CONFLICT

Former Clients:
1. Robert Chen (Case 22-CV-88765) - POTENTIAL CONFLICT (former opposing party employee)
2. GlobalTech Holdings (Case 21-CV-99887) - SIGNIFICANT CONFLICT (opposing party is subsidiary)

RECOMMENDATION:

DECLINE REPRESENTATION of prospective client Jennifer Anderson in employment claim against TechCorp Global Inc.

Basis:
1. Current concurrent representation of TechCorp Global by attorney Lisa Anderson (Case 23-CV-33445) creates impermissible conflict
2. Current representation of Maria Rodriguez (TechCorp employee) creates additional direct conflict
3. Former representation of GlobalTech Holdings (TechCorp parent) creates substantial relationship conflict

Alternative: If prospective client Jennifer Anderson strongly desires our representation, the following steps would be required:

1. Withdraw from representation of TechCorp Global in Case 23-CV-33445 (Lisa Anderson matter)
2. Complete Maria Rodriguez matter in Case 23-CV-44556 or transfer to other counsel  
3. Obtain conflict waiver from Robert Chen (former client)
4. Obtain conflict waiver from GlobalTech Holdings (former client)

Estimated timeline: 6-12 months to clear all conflicts. Not practical for prospective client's immediate needs.

ATTORNEY REFERRAL:

I recommend referring prospective client Jennifer Anderson to:
- Martinez & Associates LLP (employment law specialists, no conflicts)
- Williams Law Group (experienced in TechCorp litigation)

These firms have confirmed no conflicts with Jennifer Anderson matter.

Prepared by:
Michael Rodriguez, Esq.
Conflicts Counsel
Mitchell & Chen LLP

cc: Ethics Committee File
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          minCount: 4,
          note: 'Prospective, current, and former clients must be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'CASE_NUMBER',
          surfaces: [
            '23-CV-11223',
            '22-CV-88765',
            '23-CV-44556',
            '21-CV-99887',
            '23-CV-33445',
          ],
          note: 'All referenced case numbers',
        },
        {
          kind: 'SUBJ',
          label: 'ATTORNEY_NAME',
          surfaces: ['Sarah Mitchell', 'Michael Rodriguez', 'Lisa Anderson'],
          note: 'Attorneys at the firm',
        },
        {
          kind: 'SUBJ',
          label: 'OPPOSING_PARTY',
          minCount: 4,
          note: 'Opposing parties named across the conflict analysis',
        },
      ]),
    ],
  })
);

