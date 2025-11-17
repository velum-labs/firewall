/**
 * Legal Test Case: Settlement Negotiation
 * 
 * Multi-paragraph settlement proposal.
 * Tests paragraph scope binding and amount preservation.
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

export const legalSettlementNegotiationCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_settlement_negotiation',
      title: 'Settlement Negotiation Proposal',
      description:
        'Multi-page settlement proposal with dollar amounts and party names across paragraphs',
      owner: 'legal',
      category: 'core',
      severity: 'major',
      tags: ['legal', 'settlement', 'negotiation', 'tokenize', 'confidential'],
      risk: 'Settlement communications must be protected while preserving exact financial terms',
    },
    subjects: [
      legalSubjects.CLIENT_NAME,
      legalSubjects.OPPOSING_PARTY,
      legalSubjects.ATTORNEY_NAME,
      legalSubjects.CASE_NUMBER,
    ],
    predicates: [legalPredicates.SETTLEMENT_DISCUSSION],
    policies: [
      legalPolicies.pol_legal_settlement_privacy,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_attorney_names,
      legalPolicies.pol_legal_tokenize_case_numbers,
    ],
    text: `
CONFIDENTIAL SETTLEMENT PROPOSAL
SUBJECT TO FEDERAL RULE OF EVIDENCE 408
NOT ADMISSIBLE AS EVIDENCE

Re: Johnson v. TechCorp Innovations Inc.
Case No.: 2023-CV-556677
United States District Court, Southern District of New York

From: Robert Martinez, Esq. (Counsel for Plaintiff Michael Johnson)
To: Sarah Chen, Esq. (Counsel for Defendant TechCorp Innovations Inc.)
Date: November 13, 2024

Dear Ms. Chen,

This letter constitutes a confidential settlement proposal on behalf of my client, Michael Johnson, in the above-referenced employment discrimination matter against your client, TechCorp Innovations Inc.

BACKGROUND:

As you know, plaintiff Michael Johnson filed this action alleging age discrimination, wrongful termination, and retaliation in violation of federal and state law. Discovery has now closed, and trial is set for February 15, 2025.

Both parties have invested significant resources in this litigation. My client seeks fair compensation for the harm he suffered, while your client defendant TechCorp Innovations Inc. faces substantial exposure at trial, including the possibility of punitive damages given the jury-friendly evidence we've developed.

SETTLEMENT PROPOSAL:

On behalf of Michael Johnson, I propose the following comprehensive settlement terms:

MONETARY CONSIDERATION:

1. Total Settlement Payment: $2,500,000.00

Payment structure:
- Initial payment: $1,000,000.00 (due within 30 days of fully executed settlement agreement)
- Deferred payment: $1,500,000.00 (paid in three annual installments of $500,000 each on settlement anniversary dates)

Tax treatment: Parties agree that $1,200,000 of total settlement represents back pay (subject to employment tax withholding) and $1,300,000 represents compensatory damages for emotional distress (no withholding required under IRC § 104).

2. Attorney's Fees and Costs: $450,000.00

Defendant TechCorp Innovations Inc. to pay plaintiff's attorney fees separately, not reducing client recovery. This amount represents reasonable fees for 650 hours of attorney time plus litigation costs.

3. Total Payment from Defendant: $2,950,000.00

NON-MONETARY TERMS:

1. Mutual Non-Disparagement:
Neither Michael Johnson nor TechCorp Innovations Inc. (including its officers, directors, and employees) shall make any disparaging or negative statements about the other party. Violation subject to liquidated damages of $100,000 per incident.

2. Confidentiality Agreement:
Settlement terms remain confidential except as required by law or tax reporting. Settlement agreement may be disclosed to:
- Immediate family members of plaintiff Michael Johnson
- Financial and tax advisors
- As required by court order or legal process

Violation of confidentiality by either party results in liquidated damages of $250,000 per unauthorized disclosure.

3. Non-Admission Clause:
Settlement does not constitute admission of liability by defendant TechCorp Innovations Inc. Parties acknowledge settlement represents compromise of disputed claims.

4. Neutral Reference:
TechCorp Innovations Inc. agrees to provide neutral employment reference for Michael Johnson, confirming dates of employment (January 2015 - March 2023), final position (Senior Software Engineer), and stating "eligible for rehire" status.

Reference inquiries directed to: HR Department (neutral reference protocol).

5. Release and Waiver:
Plaintiff Michael Johnson releases and forever discharges defendant TechCorp Innovations Inc., its parent companies, subsidiaries, officers, directors, employees, and agents from all claims arising from his employment and termination, including but not limited to:

- Age Discrimination in Employment Act claims
- Title VII claims
- State employment law claims
- Common law wrongful termination
- Emotional distress claims
- Any and all claims that were or could have been asserted in Case No. 2023-CV-556677

Release does not waive claims that cannot be waived by law (e.g., workers' compensation, unemployment benefits, EEOC charges).

6. Dismissal with Prejudice:
Upon receipt of initial settlement payment, plaintiff Michael Johnson will file Joint Stipulation of Dismissal with Prejudice, each party to bear its own fees and costs (except as otherwise provided in this agreement).

ALTERNATIVE PROPOSAL:

If the above terms are not acceptable, Michael Johnson would consider the following reduced settlement:

- Total payment: $1,800,000.00 (lump sum within 60 days)
- Attorney's fees: $350,000.00
- Same non-monetary terms
- Total from TechCorp Innovations Inc.: $2,150,000.00

EVALUATION:

My client Michael Johnson believes this settlement fairly values his claims while providing certainty to both parties. Your client TechCorp Innovations Inc. faces considerable risks at trial:

Trial Risks to Defendant:
- Strong documentary evidence (age-related comments in emails)
- Sympathetic plaintiff (15-year tenure, excellent performance record)
- Jury-friendly venue (SDNY)
- Potential for punitive damages multiplier
- Ongoing negative publicity

Our damages calculation:
- Economic damages: $800,000 (back pay and benefits)
- Emotional distress: $600,000 (conservative estimate)
- Punitive damages: $3,000,000 to $6,000,000 (1-2× ratio)
- Potential verdict range: $4,400,000 to $7,400,000

Current settlement demand ($2,500,000) represents 34%-57% of potential verdict value - significant discount for certainty.

RESPONSE REQUESTED:

Please discuss this proposal with your client, TechCorp Innovations Inc., and defendant's representatives. I believe opposing party Jennifer Martinez, Esq. (TechCorp's General Counsel) has settlement authority.

I request your response by November 27, 2024 (two weeks from date of this letter). My client Michael Johnson is willing to participate in a face-to-face settlement conference if productive.

If we cannot reach agreement, both parties should proceed with final pretrial preparations. However, I believe resolution at this stage serves the interests of both Michael Johnson and TechCorp Innovations Inc.

MEDIATION ALTERNATIVE:

If direct negotiation proves unsuccessful, my client Michael Johnson is willing to participate in mediation. I suggest retired Judge Patricia Williams as a mediator (experience with employment cases, reasonable fee of $500/hour split between parties).

Mediation could be scheduled for early January 2025, providing one last opportunity before trial expenses escalate further.

CONCLUSION:

This confidential settlement proposal reflects my client's desire to resolve this matter reasonably while avoiding the uncertainty, expense, and disruption of trial for both Michael Johnson and TechCorp Innovations Inc.

I look forward to your response and hope we can achieve a mutually satisfactory resolution.

Very truly yours,

Robert Martinez, Esq.
Martinez & Associates LLP
Attorney for Plaintiff Michael Johnson

cc: Michael Johnson (client)

SETTLEMENT COMMUNICATION - FEDERAL RULE OF EVIDENCE 408
CONFIDENTIAL AND NOT DISCOVERABLE
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surface: 'Michael Johnson',
          note: 'Plaintiff client name appears throughout',
        },
        {
          kind: 'SUBJ',
          label: 'OPPOSING_PARTY',
          surface: 'TechCorp Innovations Inc',
          note: 'Defendant/opposing party name',
        },
        {
          kind: 'SUBJ',
          label: 'ATTORNEY_NAME',
          surfaces: ['Robert Martinez', 'Sarah Chen', 'Jennifer Martinez'],
          note: 'Attorneys for both parties',
        },
        {
          kind: 'SUBJ',
          label: 'CASE_NUMBER',
          surface: '2023-CV-556677',
          note: 'Case number',
        },
        {
          kind: 'PRED',
          label: 'SETTLEMENT_DISCUSSION',
          minCount: 5,
          targets: 'subjects',
          note: 'Settlement discussion and negotiation events',
        },
      ]),
      allowUnchangedRegion([
        '$2,500,000.00',
        '$1,000,000.00',
        '$1,500,000.00',
        '$450,000.00',
        '$1,800,000.00',
        'February 15, 2025',
      ]),
    ],
  })
);

