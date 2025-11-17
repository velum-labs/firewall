/**
 * Legal Test Case: Discovery Production
 * 
 * Discovery document with redactions for production.
 * Tests unless conditions and selective tokenization.
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

export const legalDiscoveryProductionCase = registerCase(
  defineCase({
    meta: {
      id: 'legal_discovery_production',
      title: 'Discovery Document Production with Privilege Redactions',
      description:
        'Discovery production requiring selective redaction based on privilege and confidentiality',
      owner: 'legal',
      category: 'core',
      severity: 'critical',
      tags: ['legal', 'discovery', 'production', 'redaction', 'tokenize'],
      risk: 'Improper redaction can disclose privileged information or over-redact responsive documents',
    },
    subjects: [
      legalSubjects.CLIENT_NAME,
      legalSubjects.ATTORNEY_NAME,
      legalSubjects.CASE_NUMBER,
      legalSubjects.CONFIDENTIAL_BUSINESS_INFO,
    ],
    predicates: [
      legalPredicates.DISCOVERY_REQUEST,
      legalPredicates.PRIVILEGED_COMMUNICATION,
      legalPredicates.CONFIDENTIALITY_AGREEMENT,
    ],
    policies: [
      legalPolicies.pol_legal_discovery_redact,
      legalPolicies.pol_legal_tokenize_client_names,
      legalPolicies.pol_legal_tokenize_attorney_names,
      legalPolicies.pol_legal_tokenize_case_numbers,
      legalPolicies.pol_legal_tokenize_confidential_info,
    ],
    text: `
PRODUCTION LOG - DISCOVERY RESPONSES
Case: Thompson Industries LLC v. GlobalTech Corp
Case No.: 2023-CA-445566
Producing Party: Thompson Industries LLC
Date: November 13, 2024

DOCUMENT #001 - Email Chain re: Product Development
Bates Range: THOMPSON-DISC-000001-000005
Responsive To: Request for Production No. 12 ("All documents concerning development of the X-500 product")

From: Jennifer Martinez <jmartinez@thompsonind.com>
To: Robert Chen <rchen@thompsonind.com>
Date: March 15, 2023
Subject: X-500 Development Timeline

Bob - Per your request, here's the development timeline for X-500:

Phase 1 (Jan-Mar 2023): Initial design specifications
- Our proprietary catalyst formula (CONFIDENTIAL - Trade Secret) shows 40% improvement
- Manufacturing cost: $2.3M estimated
- Team: 12 engineers assigned

Phase 2 (Apr-Jun 2023): Prototype testing
- Results exceed industry benchmarks
- Patent application filed: Application No. 18/123,456

Meeting with legal counsel Sarah Mitchell scheduled for April 3rd to discuss IP protection strategy. [REDACTED - ATTORNEY-CLIENT PRIVILEGED]

PRIVILEGE LOG ENTRY for Redacted Portion:
- Attorney: Sarah Mitchell, Thompson Industries General Counsel
- Client: Robert Chen, VP Product Development
- Date: April 3, 2023
- Subject Matter: Legal advice regarding patent strategy and trade secret protection
- Privilege Asserted: Attorney-Client Privilege
- Withheld: 3 pages of email correspondence

DOCUMENT #002 - Supplier Quotation
Bates Range: THOMPSON-DISC-000006-000008
Responsive To: Request for Production No. 15

Quotation from Advanced Materials Corp:
Reference: Quote-2023-0089
Client: Thompson Industries LLC

Raw Materials for X-500 Production:
- Component A: $450,000 (CONFIDENTIAL per NDA dated Jan 10, 2023)
- Component B: $780,000
- Delivery: 60 days ARO

This quotation subject to Mutual Non-Disclosure Agreement between Thompson Industries and Advanced Materials Corp executed January 10, 2023. [REDACTED - CONFIDENTIAL BUSINESS INFORMATION]

CONFIDENTIALITY LOG:
- Information Type: Supplier pricing and proprietary component specifications
- Protecting Party: Advanced Materials Corp
- Basis: NDA Section 3.2 - Competitive Pricing Information
- Withheld: Detailed component specifications (2 pages)

DOCUMENT #003 - Internal Meeting Minutes
Bates Range: THOMPSON-DISC-000009-000012
Responsive To: Request for Production No. 8

Thompson Industries - Executive Committee Meeting
Date: May 12, 2023
Attendees: CEO David Thompson, CFO Lisa Anderson, VP Engineering Robert Chen, General Counsel Sarah Mitchell

Agenda Item 3: Competitive Analysis

Discussion of GlobalTech Corp's competing product line (public information from their website and SEC filings - no confidential information).

Market share analysis:
- Thompson Industries: 35% market share
- GlobalTech Corp: 28% market share
- Others: 37% combined

Agenda Item 4: Legal Strategy [REDACTED - ATTORNEY-CLIENT PRIVILEGED]

[This section contained discussion with General Counsel Sarah Mitchell regarding litigation strategy against GlobalTech Corp for patent infringement. Entire section withheld as attorney work product and attorney-client privileged communication.]

PRIVILEGE LOG ENTRY:
- Document Type: Internal litigation strategy discussion
- Participants: Executive team and General Counsel Sarah Mitchell
- Date: May 12, 2023
- Privilege: Attorney-Client Privilege; Attorney Work Product
- Withheld: 8 pages of meeting minutes

DOCUMENT #004 - Public Court Filing
Bates Range: THOMPSON-DISC-000013
Responsive To: Request for Production No. 20
Source: Public court records, Case No. 2022-IP-98765

Thompson Industries LLC v. Competitor Corp
U.S. District Court, Central District of California
Case No.: 2022-IP-98765

This document previously filed with the court and available on PACER. No redactions required - public record.

Parties: Thompson Industries LLC (Plaintiff) v. Competitor Corp (Defendant)
Nature of Suit: Patent Infringement
Judgment: $2.5M awarded to Thompson Industries (public information)

DOCUMENT #005 - Settlement Communication
Bates Range: NOT PRODUCED
Responsive To: Request for Production No. 25
Privilege: Federal Rule of Evidence 408 - Settlement Negotiations

Email between attorney Sarah Mitchell and opposing counsel regarding settlement discussions in this matter. Entire document withheld pursuant to FRE 408 as protected settlement communication.

PRIVILEGE LOG ENTRY:
- From: Sarah Mitchell (Thompson counsel)
- To: Michael Park (GlobalTech counsel)
- Date: August 15, 2023
- Subject: Settlement Proposal - Case 2023-CA-445566
- Privilege: FRE 408 Settlement Privilege
- Description: Settlement offer and counteroffer discussion
- Withheld: Complete email chain (12 messages)

SUMMARY OF PRODUCTION:

Total Documents Reviewed: 1,247
Documents Produced: 1,189
Documents Withheld (Privilege): 43  
Documents Withheld (Confidentiality): 15

Privilege Assertions:
- Attorney-Client Privilege: 38 documents
- Work Product: 22 documents (some overlap with attorney-client)
- Settlement Privilege (FRE 408): 5 documents

Third-Party Confidentiality:
- Protected by NDA: 12 documents
- Trade Secret (Thompson): 8 documents
- Trade Secret (Third Party): 3 documents

This production log demonstrates proper redaction of privileged and confidential information while producing responsive, non-privileged documents. Public information remains unredacted.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'CLIENT_NAME',
          surfaces: ['Robert Chen', 'David Thompson', 'Lisa Anderson'],
          note: 'Client personnel names tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'ATTORNEY_NAME',
          surfaces: ['Sarah Mitchell'],
          note: 'Attorney name tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'CASE_NUMBER',
          surfaces: ['2023-CA-445566', '2022-IP-98765'],
          note: 'Case numbers from discovery context',
        },
        {
          kind: 'SUBJ',
          label: 'CONFIDENTIAL_BUSINESS_INFO',
          surfaces: ['proprietary catalyst formula', 'Trade Secret'],
          minCount: 1,
          note: 'Confidential business information',
        },
        {
          kind: 'PRED',
          label: 'DISCOVERY_REQUEST',
          minCount: 3,
          targets: 'subjects',
          note: 'Discovery request events',
        },
      ]),
      allowUnchangedRegion([
        '$2.3M',
        '35% market share',
        'PACER',
        '[REDACTED - ATTORNEY-CLIENT PRIVILEGED]',
      ]),
    ],
  })
);

