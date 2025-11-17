/**
 * Legal Test Case: Attorney-Client Privilege
 * 
 * Privileged email thread with legal advice.
 * Should DENY to prevent privilege waiver in insecure contexts.
 */

import {
  defineCase,
  expectDenial,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import {
  legalSubjects,
  legalPredicates,
  legalPolicies,
} from '../catalog/legal';

export const legalAttorneyClientPrivilegeCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_attorney_client_privilege',
      title: 'Attorney-Client Privileged Communication',
      description:
        'Email thread containing privileged legal advice requiring protection from inadvertent disclosure',
      owner: 'legal',
      category: 'core',
      severity: 'blocker',
      tags: ['legal', 'privilege', 'attorney-client', 'deny', 'confidential'],
      risk: 'Inadvertent disclosure of privileged communications waives privilege protection',
    },
    subjects: [
      legalSubjects.CLIENT_NAME,
      legalSubjects.ATTORNEY_NAME,
      legalSubjects.CASE_NUMBER,
      legalSubjects.PRIVILEGE_MARKER,
    ],
    predicates: [
      legalPredicates.PRIVILEGED_COMMUNICATION,
      legalPredicates.LEGAL_ADVICE,
    ],
    policies: [
      legalPolicies.pol_legal_deny_privileged_markers,
      legalPolicies.pol_legal_deny_privileged,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_attorney_names,
      legalPolicies.pol_legal_tokenize_case_numbers,
    ],
    text: `
From: Sarah Mitchell <smitchell@lawfirm.com>
To: Robert Anderson <randerson@company.com>
CC: Michael Chen, Esq. <mchen@lawfirm.com>
Date: November 13, 2024 2:30 PM
Subject: RE: ATTORNEY-CLIENT PRIVILEGED - Litigation Strategy for Case No. 23-CV-12345

**ATTORNEY-CLIENT PRIVILEGED AND CONFIDENTIAL**
**ATTORNEY WORK PRODUCT**

Dear Mr. Anderson,

This communication contains confidential attorney-client privileged information regarding your ongoing litigation in Anderson v. TechCorp Industries, Case No. 23-CV-12345 pending in the United States District Court, Northern District of California.

CASE BACKGROUND:
You contacted our firm seeking legal counsel regarding the breach of contract claim filed against you personally and your former employer. As your legal counsel, I am providing this analysis of your legal position and recommended strategy.

PRIVILEGE ANALYSIS:
This email is protected by the attorney-client privilege. The information contained herein represents confidential legal advice provided by me, Sarah Mitchell, as your attorney, to you, Robert Anderson, as my client, for the purpose of providing legal representation in the above-referenced matter.

LEGAL ASSESSMENT:

1. LIABILITY EXPOSURE:
Based on our review of the contract documents and your testimony, I believe we have strong defenses to the breach of contract claim. The opposing party, TechCorp Industries, alleges you violated the non-compete agreement, but my analysis suggests the agreement is likely unenforceable due to overbroad geographic and temporal restrictions.

My legal opinion: The non-compete restricts you from working "anywhere in the technology industry globally for five years" - this is almost certainly void as against public policy in California under Business & Professions Code § 16600.

2. COUNTERCLAIM STRATEGY:
I advise you to assert a counterclaim for wage and hour violations. Our investigation revealed that TechCorp failed to pay you overtime for the 18-month period you worked as a "salaried exempt" employee, despite your duties not meeting the administrative exemption test.

My legal recommendation: File a Labor Code § 510 claim. Potential recovery: approximately $87,000 in unpaid overtime plus penalties and attorney's fees.

3. DISCOVERY STRATEGY:
The opposing counsel has requested production of all emails between you and your current employer. My legal advice is to assert attorney-client privilege over any communications where you consulted me regarding the enforceability of the non-compete before accepting your new position.

Additionally, I recommend we assert work product protection over my internal litigation file, including:
- Witness interview notes
- Legal research memos
- Litigation strategy documents
- Damages calculations

4. SETTLEMENT POSITION:
Opposing counsel informally indicated willingness to discuss resolution. Based on my evaluation of the case strengths and weaknesses, my advice is to counteroffer as follows:

- Dismiss all claims with prejudice
- TechCorp pays your attorney's fees: $45,000
- Mutual non-disparagement clause
- Narrow confidentiality agreement (limited to trade secrets only, not general industry knowledge)

My legal opinion: We have leverage due to the weak non-compete and your strong counterclaim. Do not accept less than full attorney's fee reimbursement.

5. TRIAL PREPARATION:
If settlement fails, I advise we prepare for trial on the following timeline:
- Expert witness designation: December 15, 2024
- Dispositive motions: January 30, 2025  
- Trial date: March 15, 2025 (estimated)

My recommendation for expert witness: Dr. Jennifer Park, employment law expert, to testify regarding industry standards for non-compete enforceability. Her fee: $450/hour.

NEXT STEPS:

1. Review and approve counterclaim draft (attached)
2. Authorize expert witness retention
3. Schedule deposition preparation meeting
4. Consider settlement authority parameters
5. Coordinate directly with Michael Chen, Esq., who will maintain the privilege log, oversee document review, and prepare you for deposition to preserve confidentiality.

Please call my office to discuss this confidential legal advice. Do not forward this email to anyone outside the attorney-client relationship, including family members or business associates, as doing so may waive the privilege protection.

This communication is intended solely for use in the course of our attorney-client relationship and may not be disclosed to third parties without my express written consent.

Very truly yours,

Sarah Mitchell, Esq.
Senior Partner, Employment Law Group
Mitchell & Chen LLP
State Bar No. 234567

**CONFIDENTIALITY NOTICE: This email and any attachments are protected by the attorney-client privilege and work product doctrine. If you are not the intended recipient, any dissemination, distribution, or copying is strictly prohibited. Please notify the sender immediately and destroy all copies.**

Attachments:
- Draft Counterclaim (PRIVILEGED)
- Wage Analysis Spreadsheet (WORK PRODUCT)  
- Legal Research Memo re: Non-Compete Enforceability (WORK PRODUCT)
    `.trim(),
    expectations: [
      expectDenial('pol_legal_deny_privileged'),
      expectDetectionMap({
        subjects: {
          CLIENT_NAME: ['Robert Anderson'],
          ATTORNEY_NAME: ['Sarah Mitchell', 'Michael Chen, Esq.'],
          CASE_NUMBER: ['23-CV-12345'],
        },
        predicates: {
          PRIVILEGED_COMMUNICATION: [
            'attorney-client privileged',
            'confidential attorney-client',
          ],
          LEGAL_ADVICE: [
            'my legal opinion',
            'my legal advice',
            'my legal recommendation',
          ],
        },
      }),
    ],
  })
);

