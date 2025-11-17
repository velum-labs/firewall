/**
 * Healthcare Test Case: Pre-Redacted Document
 * 
 * Document with existing redactions. Tests idempotency and token format detection.
 */

import {
  defineCase,
  expectTokenizedEntities,
  allowUnchangedRegion,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePredicates,
  healthcarePolicies,
} from '../catalog/healthcare';

export const healthcareRedactedAlreadyCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_redacted_already',
      title: 'Pre-Redacted Document - Idempotency Test',
      description:
        'Document with existing manual redactions, should preserve them without double-tokenization',
      owner: 'healthcare',
      category: 'extended',
      severity: 'major',
      tags: ['healthcare', 'redaction', 'idempotency', 'tokenize'],
      risk: 'Double-redaction could obscure original redaction patterns',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DIAGNOSIS,
    ],
    predicates: [healthcarePredicates.CLINICAL_EVENT],
    policies: [
      healthcarePolicies.pol_healthcare_tokenize_clinical_events,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
    ],
    text: `
CLINICAL SUMMARY - PRE-REDACTED FOR LEGAL REVIEW
Case Management Review for Quality Assurance

Patient [REDACTED] presented to the emergency department on [REDACTED DATE] with acute chest pain. The patient's Medical Record Number [REDACTED] was verified upon admission.

Initial Assessment:
The 58-year-old male patient (name withheld per legal counsel) was triaged by Nurse [REDACTED]. Vital signs documented: BP [REDACTED], HR 92, SpO2 98%. Patient reported pain radiating to left arm, onset approximately 2 hours prior.

Clinical Course:
Dr. Jennifer Martinez evaluated patient [REDACTED] and diagnosed probable acute coronary syndrome. EKG showed ST-segment elevations in leads II, III, aVF. Cardiology consult activated for patient whose identity is protected under litigation hold.

Interventions Performed:
- Cardiac catheterization revealed 90% RCA stenosis
- Drug-eluting stent placed successfully  
- Patient Mr. [LAST NAME REDACTED] tolerated procedure well
- Transferred to CCU for monitoring

The patient with MRN-445789 (partially redacted record) received standard post-PCI medications including dual antiplatelet therapy. Follow-up arranged with Dr. Robert Chen for patient [REDACTED FOR PRIVACY].

Outcome:
Individual [REDACTED PATIENT NAME] was discharged on hospital day 3 in stable condition. Diagnosis of ST-Elevation Myocardial Infarction confirmed. Patient educated on medication compliance and cardiac rehabilitation.

Quality Review Notes:
All care for patient [IDENTITY PROTECTED] met standard of care guidelines. Documentation complete except where redacted by legal department. The individual's protected health information was appropriately safeguarded throughout hospitalization.

Additional PHI removed from this report includes: date of birth [REDACTED], home address [REDACTED], and emergency contact information [REDACTED].

Unredacted clinical data:
- Laboratory values: Troponin peaked at 8.2 ng/mL
- Procedure time: 45 minutes
- No complications during hospitalization
- Left ventricular ejection fraction: 52%

This summary prepared for quality assurance committee review with patient identifiers removed per institutional policy.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'MRN',
          surface: 'MRN-445789',
          note: 'Actual MRN should be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Dr. Robert Chen'],
          note: 'Provider name should be tokenized',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          minCount: 3,
          targets: 'both',
          note: 'Clinical events should be detected despite redactions',
        },
      ]),
      allowUnchangedRegion([
        '[REDACTED]',
        '[REDACTED DATE]',
        '[REDACTED FOR PRIVACY]',
        '[IDENTITY PROTECTED]',
        '[LAST NAME REDACTED]',
        '[REDACTED PATIENT NAME]',
      ]),
    ],
  })
);

