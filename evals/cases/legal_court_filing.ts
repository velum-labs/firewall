/**
 * Legal Test Case: Public Court Filing
 * 
 * Court filing with public and confidential information.
 * Tests unless conditions for public record exceptions.
 */

import {
  defineCase,
  expectTokenizedEntities,
  allowUnchangedRegion,
  registerCase,
} from '../case-registry';
import {
  legalSubjects,
  legalPredicates,
  legalPolicies,
} from '../catalog/legal';

export const legalCourtFilingCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_court_filing',
      title: 'Public Court Filing with Confidential Business Information',
      description:
        'Court filing mixing public case information with confidential business data',
      owner: 'legal',
      category: 'core',
      severity: 'major',
      tags: ['legal', 'court-filing', 'public-record', 'confidential', 'tokenize'],
      risk: 'Must distinguish public court record from confidential information requiring protection',
    },
    subjects: [
      legalSubjects.CASE_NUMBER,
      legalSubjects.CLIENT_NAME,
      legalSubjects.OPPOSING_PARTY,
      legalSubjects.COURT_NAME,
      legalSubjects.JUDGE_NAME,
      legalSubjects.CONFIDENTIAL_BUSINESS_INFO,
    ],
    predicates: [],
    policies: [
      legalPolicies.pol_legal_public_record_allow,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_confidential_info,
    ],
    text: `
UNITED STATES DISTRICT COURT
NORTHERN DISTRICT OF CALIFORNIA
SAN FRANCISCO DIVISION

INNOVATECH SOLUTIONS INC.,
                        Plaintiff,
v.

COMPETITIVE DYNAMICS CORP.,
                        Defendant.

Case No.: 3:23-cv-04567-JSW
MOTION FOR PRELIMINARY INJUNCTION

Hon. Jeffrey S. White, District Judge

INTRODUCTION

Plaintiff InnovaTech Solutions Inc. respectfully moves this Court for a preliminary injunction pursuant to Federal Rule of Civil Procedure 65 to enjoin defendant Competitive Dynamics Corp. from using plaintiff's proprietary trade secrets and confidential business information.

PARTIES

1. Plaintiff InnovaTech Solutions Inc. is a Delaware corporation with its principal place of business in San Francisco, California. InnovaTech develops software solutions for [REDACTED - CONFIDENTIAL BUSINESS INFORMATION].

2. Defendant Competitive Dynamics Corp. is a California corporation with its principal place of business in San Jose, California.

JURISDICTION AND VENUE

This Court has jurisdiction under 28 U.S.C. § 1331 (federal question) and 28 U.S.C. § 1338 (patent and trade secret claims). Venue is proper in this district under 28 U.S.C. § 1400.

BACKGROUND

A. InnovaTech's Proprietary Technology

Plaintiff InnovaTech Solutions Inc. has invested over $15 million and five years developing its proprietary [REDACTED - TRADE SECRET DESCRIPTION]. This technology provides InnovaTech with significant competitive advantages in the marketplace.

Specific technical details are filed under seal per Protective Order entered by this Court on October 15, 2023. See Docket No. 45.

B. Defendant's Unlawful Conduct

In March 2023, defendant Competitive Dynamics Corp. hired three former InnovaTech employees:
- Robert Chen (former Chief Technology Officer)
- Jennifer Martinez (former Senior Engineer)
- David Thompson (former Product Manager)

These individuals possessed access to InnovaTech's [REDACTED - CONFIDENTIAL INFORMATION SUBJECT TO PROTECTIVE ORDER].

C. Evidence of Misappropriation

Discovery has revealed that defendant Competitive Dynamics Corp. launched a competing product in September 2023 with functionally identical features to InnovaTech's proprietary system. Technical analysis (filed under seal, Exhibit A) demonstrates [REDACTED - TECHNICAL SPECIFICATIONS PROTECTED AS TRADE SECRET].

ARGUMENT

I. PLAINTIFF HAS DEMONSTRATED LIKELIHOOD OF SUCCESS ON THE MERITS

A. Trade Secret Misappropriation

California's Uniform Trade Secrets Act ("CUTSA") provides that "[o]ne who misappropriates a trade secret is liable for damages." Cal. Civ. Code § 3426.3.

InnovaTech's technology constitutes a trade secret under CUTSA because:
1. The information derives independent economic value from not being generally known
2. InnovaTech maintains reasonable secrecy measures (see Declaration of CEO Sarah Mitchell, ¶¶ 12-18)

Defendant's launch of a suspiciously similar product within six months of hiring InnovaTech's key employees creates a strong inference of misappropriation. See Whyte v. Schlage Lock Co., 101 Cal. App. 4th 1443 (2002).

B. Breach of Confidentiality Agreements

Former employees Robert Chen, Jennifer Martinez, and David Thompson each signed confidentiality agreements prohibiting disclosure of InnovaTech's proprietary information. See Exhibits B, C, D (executed agreements).

Defendant Competitive Dynamics Corp. is liable for tortious interference with these contractual obligations. Digital Envoy, Inc. v. Google, Inc., 319 F. Supp. 2d 1377 (N.D. Ga. 2004).

II. IRREPARABLE HARM

InnovaTech faces irreparable harm in the absence of an injunction:

A. Market Share Erosion: InnovaTech has already lost 12% market share to defendant since product launch (Declaration of CFO Michael Park, ¶ 8). This represents approximately $4.5 million in lost revenue.

B. Customer Confusion: Seven major clients have inquired whether InnovaTech's technology was properly licensed to defendant (Declaration of VP Sales Lisa Anderson, ¶¶ 4-9), damaging InnovaTech's reputation.

C. Competitive Advantage Lost: Once trade secrets are publicly disclosed, monetary damages cannot restore InnovaTech's competitive position. MAI Sys. Corp. v. Peak Computer, Inc., 991 F.2d 511 (9th Cir. 1993).

III. BALANCE OF HARDSHIPS FAVORS PLAINTIFF

The balance of hardships strongly favors InnovaTech:

Harm to InnovaTech without injunction: Permanent loss of trade secret protection, market position, and competitive advantage valued at $25+ million.

Harm to Competitive Dynamics with injunction: Defendant can continue business operations using legitimately developed technology. Injunction only prohibits use of misappropriated InnovaTech trade secrets.

IV. PUBLIC INTEREST SUPPORTS INJUNCTION

The public interest favors protecting intellectual property rights and trade secrets. "[P]rotecting trade secrets encourages innovation and technological development." DVD Copy Control Assn., Inc. v. Bunner, 31 Cal. 4th 864, 879 (2003).

REQUESTED RELIEF

WHEREFORE, plaintiff InnovaTech Solutions Inc. respectfully requests that this Court:

1. Issue a preliminary injunction enjoining defendant Competitive Dynamics Corp., its officers, employees, and agents from:
   a. Using, disclosing, or benefiting from InnovaTech's confidential business information
   b. Marketing or selling products incorporating InnovaTech's trade secrets
   c. Soliciting InnovaTech's employees or customers using confidential information

2. Order defendant Competitive Dynamics Corp. to:
   a. Return all InnovaTech confidential materials
   b. Certify destruction of copies
   c. Submit to forensic examination of relevant computer systems

3. Require posting of bond in amount of $500,000

4. Grant such other relief as the Court deems just and proper

Dated: November 13, 2024

Respectfully submitted,

/s/ Patricia Williams
Patricia Williams, Esq. (Cal. Bar No. 234567)
Williams & Associates LLP
Attorneys for Plaintiff InnovaTech Solutions Inc.

CERTIFICATE OF SERVICE

I hereby certify that on November 13, 2024, I electronically filed the foregoing with the Clerk of Court using the CM/ECF system, which will send notification to all counsel of record.

/s/ Patricia Williams
Patricia Williams, Esq.

Note: This public court filing is available on PACER. Case number 3:23-cv-04567-JSW is public record. Confidential business information has been redacted and filed separately under seal per Protective Order.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surfaces: ['Robert Chen', 'Jennifer Martinez', 'David Thompson'],
          note: 'Former employees named in public filing',
        },
        {
          kind: 'SUBJ',
          label: 'OPPOSING_PARTY',
          surface: 'Competitive Dynamics Corp',
          note: 'Defendant name',
        },
        {
          kind: 'SUBJ',
          label: 'CONFIDENTIAL_BUSINESS_INFO',
          minCount: 2,
          note: 'Trade secret and confidential information markers',
        },
      ]),
      allowUnchangedRegion([
        'Case No.: 3:23-cv-04567-JSW',
        'UNITED STATES DISTRICT COURT',
        'Hon. Jeffrey S. White',
        'PACER',
        '$15 million',
        '12% market share',
      ]),
    ],
  })
);

