/**
 * Legal Test Case: Attorney Work Product
 * 
 * Internal litigation strategy memo.
 * Tests WORK_PRODUCT predicate binding to client/case.
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

export const legalWorkProductStrategyCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_work_product_strategy',
      title: 'Attorney Work Product - Litigation Strategy Memo',
      description:
        'Internal litigation strategy memo requiring work product protection and redaction',
      owner: 'legal',
      category: 'core',
      severity: 'blocker',
      tags: ['legal', 'work-product', 'strategy', 'tokenize', 'confidential'],
      risk: 'Work product disclosure provides opposing party with litigation strategy and case weaknesses',
    },
    subjects: [
      legalSubjects.CLIENT_NAME,
      legalSubjects.ATTORNEY_NAME,
      legalSubjects.CASE_NUMBER,
      legalSubjects.WITNESS_NAME,
    ],
    predicates: [
      legalPredicates.WORK_PRODUCT,
      legalPredicates.LEGAL_STRATEGY,
    ],
    policies: [
      legalPolicies.pol_legal_tokenize_strategy,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_attorney_names,
      legalPolicies.pol_legal_tokenize_case_numbers,
      legalPolicies.pol_legal_tokenize_witness_names,
    ],
    text: `
ATTORNEY WORK PRODUCT - PRIVILEGED AND CONFIDENTIAL
DO NOT DISTRIBUTE OUTSIDE LEGAL TEAM

INTERNAL LITIGATION MEMORANDUM
RE: Case Strategy and Witness Analysis
Matter: Anderson v. MegaCorp International
Case No.: 23-CV-98765
Client: Jennifer Anderson
Date: November 13, 2024
From: Michael Rodriguez, Senior Litigation Associate
To: Sarah Mitchell, Lead Trial Counsel

**ATTORNEY WORK PRODUCT PREPARED IN ANTICIPATION OF LITIGATION**

OVERVIEW:

This memorandum contains my analysis of our litigation strategy for client Jennifer Anderson's wrongful termination and discrimination case against defendant MegaCorp International, Case No. 23-CV-98765. This work product reflects legal theories, witness credibility assessments, and tactical recommendations prepared for trial preparation.

CASE STRENGTHS:

1. Strong Documentary Evidence
- Email from supervisor containing discriminatory language ("too old for this role")
- Performance reviews: Consistent "exceeds expectations" ratings for 8 years
- Comparative evidence: Younger replacement hired at higher salary

My strategic assessment: These documents form the core of our prima facie case. Lead with email evidence in opening - immediate jury impact.

2. Sympathetic Client
Client Jennifer Anderson presents well:
- 15-year tenure with MegaCorp
- Industry recognition and awards
- Credible, articulate witness
- No disciplinary history

Strategic recommendation: Feature client testimony prominently. Her demeanor will resonate with jury.

CASE WEAKNESSES:

1. Timing Issues
- 6-month gap between alleged discriminatory statement and termination
- Client's performance review immediately before termination rated "meets expectations" (down from "exceeds")

My litigation strategy: Argue that downgraded review was pretext and part of papering the file. Expert witness on age discrimination patterns can establish this is common employer tactic.

2. Comparative Evidence Limitations
- Only one comparator (younger replacement)
- Replacement has advanced degree (client does not)

Strategic approach: Emphasize that job requirements didn't change, advanced degree not needed for role. Argue degree requirement added post-hoc to justify age-based decision.

WITNESS ANALYSIS:

Plaintiff's Witnesses:

1. Jennifer Anderson (Client) - STRONG WITNESS
Credibility: High
Anticipated testimony: Personal impact of termination, discriminatory statements heard, job performance
Preparation needs: 2 full-day prep sessions, mock cross-examination
Strategic notes: Keep testimony focused on discrimination, avoid discussing personal financial issues (appears vengeful)

2. Robert Chen (Former Colleague) - MODERATE WITNESS
Credibility: Moderate (still employed by MegaCorp, may be nervous)
Anticipated testimony: Can corroborate client's excellent performance, workplace age-related comments by management
Weaknesses: Subpoenaed witness, not voluntary. May minimize to protect own job.
Strategic approach: Short, targeted examination. Don't over-rely on this witness.

3. Dr. Sarah Park (Age Discrimination Expert) - STRONG WITNESS  
Credibility: High (PhD, 30 years consulting experience, testified 100+ times)
Anticipated testimony: Statistical analysis of MegaCorp's termination patterns, age discrimination indicators
Fee: $450/hour (budgeted $45,000 total)
Strategic value: Critical to establish pattern and practice. Her testimony transforms individual case to systemic issue.

Defendant's Witnesses:

1. David Thompson (MegaCorp HR Director) - WEAK WITNESS
Anticipated defense testimony: Termination was performance-based, legitimate business decision
Vulnerabilities I've identified:
- Inconsistent statements in deposition (pages 45-48, 112-114)
- Email evidence contradicts his testimony
- Never met client Anderson personally before termination decision

My cross-examination strategy:
- Impeach with prior inconsistent statements
- Establish lack of personal knowledge
- Confront with discriminatory emails from his department

2. Lisa Martinez (Client's Former Supervisor) - STRONG DEFENSE WITNESS
Anticipated testimony: Client's performance declined, termination justified
Challenges: Martinez is articulate, prepared, management training
My strategic approach for cross:
- Focus on 8 years of excellent reviews she gave client
- Emphasize that "decline" occurred only after client complained about age comments
- Introduce evidence of retaliation motive

LEGAL STRATEGY - MOTION PRACTICE:

Summary Judgment Strategy:
My recommendation: Do NOT file motion for summary judgment. Evidence conflicts require jury resolution. MSJ would give defendant preview of our case and waste resources.

Opposition to Defendant's Expected MSJ:
Anticipated: Defendant will move for summary judgment on all claims
My strategy to defeat:
- Emphasize email evidence creates genuine issue of material fact
- Temporal proximity argument (complaint → adverse action timing)
- Pretext evidence sufficient to survive summary judgment

TRIAL STRATEGY:

Voir Dire Focus:
- Age bias awareness (identify jurors with age discrimination sensitivity)
- Employment termination experiences (personal connection to client's situation)
- Corporate skepticism (balance with avoid anti-business extremes)

Opening Statement Outline:
1. Humanize client - 15 years of dedication
2. Present "smoking gun" email early
3. Theme: "Experience valued, then discarded"  
4. Damages preview: Lost income $450,000, emotional distress, punitive damages

Witness Order:
1. Jennifer Anderson (client) - establish baseline
2. Robert Chen (corroborating witness) - same day, momentum
3. Documentary evidence - middle of case
4. Dr. Sarah Park (expert) - end strong with pattern evidence

Defendant's Case Strategy:
Expect defendant to present:
- HR policies and training (we argue: policies ignored)
- Performance metrics (we argue: pretextual)
- Business judgment deference (we argue: not shield for discrimination)

My recommended approach: Aggressive cross-examination, minimal defense case rebuttal

DAMAGES STRATEGY:

Economic Damages:
- Lost wages: $150,000/year × 3 years = $450,000
- Lost benefits: $45,000
- Mitigation: Client earning $80,000 at new job
- Net economic: $415,000

Non-Economic:
- Emotional distress: $250,000 (conservative ask)
- Jury likely to award: $100,000-$400,000 range based on comparable verdicts

Punitive Damages:
Strategy: Establish MegaCorp's net worth ($2.5 billion), argue need for deterrence
Ask: $5,000,000 (2:1 ratio to compensatory per due process limits)
Realistic expectation: $500,000-$1,500,000

SETTLEMENT POSTURE:

Current demand: $2,000,000 (all-in settlement)
Defendant's offer: $250,000
Gap: Significant

My strategic recommendation: 
- Minimum acceptable: $1,200,000
- Target range: $1,500,000-$1,800,000
- Trial cost to client if we lose: $0 (contingency fee)
- Trial cost to defendant: $500,000+ in fees

Leverage: Discovery revealed three other similar age discrimination complaints against MegaCorp in past 2 years. Pattern evidence strengthens our position.

Settlement timing strategy: Reassess after summary judgment briefing, before final pretrial conference.

RISK ASSESSMENT:

Probability of favorable verdict: 70%
Expected verdict range: $600,000-$1,800,000
Litigation costs (our side): $180,000
Expected value analysis supports proceeding to trial unless settlement exceeds $1,200,000.

NEXT STEPS:

1. Complete expert witness disclosures (December 1)
2. Prepare detailed witness outlines for all depositions
3. Draft summary judgment opposition
4. Continue settlement discussions at higher demand level

This work product analysis prepared for attorney Sarah Mitchell's strategic planning in representing client Jennifer Anderson. All assessments reflect attorney mental impressions and litigation strategy protected as work product.

Prepared by: Michael Rodriguez, Esq.
Litigation Associate, Mitchell & Chen LLP
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surface: 'Jennifer Anderson',
          note: 'Client name appears throughout strategy memo',
        },
        {
          kind: 'SUBJ',
          label: 'ATTORNEY_NAME',
          surfaces: ['Michael Rodriguez', 'Sarah Mitchell'],
          note: 'Attorney names',
        },
        {
          kind: 'SUBJ',
          label: 'CASE_NUMBER',
          surface: '23-CV-98765',
          note: 'Case number',
        },
        {
          kind: 'SUBJ',
          label: 'WITNESS_NAME',
          surfaces: ['Robert Chen', 'Dr. Sarah Park', 'David Thompson', 'Lisa Martinez'],
          minCount: 4,
          note: 'Witness names in strategy analysis',
        },
        {
          kind: 'PRED',
          label: 'WORK_PRODUCT',
          minCount: 5,
          targets: 'both',
          note: 'Work product sections throughout memo',
        },
        {
          kind: 'PRED',
          label: 'LEGAL_STRATEGY',
          minCount: 10,
          targets: 'both',
          note: 'Numerous legal strategy discussions',
        },
      ]),
    ],
  })
);

