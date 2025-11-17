/**
 * Healthcare Test Case: Ambiguous Patient Names
 * 
 * Patient names that are also common words or phrases.
 * Tests confidence thresholds and false positive avoidance.
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

export const healthcareAmbiguousNamesCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_ambiguous_names',
      title: 'Ambiguous Patient Names - False Positive Avoidance',
      description:
        'Patient names that coincide with common words, testing confidence thresholds',
      owner: 'healthcare',
      category: 'adversarial',
      severity: 'minor',
      tags: ['healthcare', 'ambiguous', 'confidence', 'false-positive'],
      risk: 'Over-redaction can obscure medical content unnecessarily',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DIAGNOSIS,
      healthcareSubjects.HEALTHCARE_PROVIDER,
    ],
    predicates: [healthcarePredicates.CLINICAL_EVENT],
    policies: [healthcarePolicies.pol_healthcare_high_confidence_phi],
    text: `
CLINICAL CASE REVIEW SESSION
Department of Internal Medicine Grand Rounds
Topic: Challenging Burn Cases

Case Presentation by Dr. Sarah Williams:

Today we discuss three interesting burn patients from our unit. First, patient Major Burns (MRN-445123) was admitted following a house fire. Major Burns sustained second-degree thermal injuries to approximately 18% total body surface area. The patient, a retired military officer, received immediate fluid resuscitation and wound care. Major Burns is progressing well on our standard burn protocol.

Second case involves Will Power (MRN-778234), a 34-year-old male with chemical burns from industrial accident. Mr. Power demonstrated excellent recovery, showing remarkable will power throughout painful debridement procedures. Will Power was discharged after 12 days with outpatient wound clinic follow-up.

Our third patient, Faith Hope (MRN-882391), suffered electrical burns while working as an electrician. Ms. Hope maintained incredible faith and hope despite significant injuries requiring skin grafting. Faith Hope's family provided excellent support during the recovery period.

It's worth noting that burn treatment requires not just medical expertise but also helping patients develop the will power to endure lengthy recovery. We must have faith and hope in our treatment protocols while remaining evidence-based.

Additional Teaching Points:
- Major burns (>20% TBSA) require ICU-level care
- Will power and patient motivation significantly impact recovery outcomes  
- Faith, hope, and family support are important psychosocial factors
- Always assess for inhalation injury in house fires

Dr. Patient, our psychology consultant, evaluated all three individuals for post-traumatic stress. Dr. Patient recommended continued counseling for Major Burns and Faith Hope.

In conclusion, these challenging cases demonstrate that treating major burns successfully requires attention to both physical wounds and psychological well-being.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Major Burns', 'Will Power', 'Faith Hope'],
          note: 'Names in medical context should be tokenized despite being common words',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: ['MRN-445123', 'MRN-778234', 'MRN-882391'],
          note: 'Medical record numbers confirm patient context',
        },
        {
          kind: 'SUBJ',
          label: 'HEALTHCARE_PROVIDER',
          surfaces: ['Dr. Sarah Williams', 'Dr. Patient'],
          note: 'Provider names including the ambiguous "Dr. Patient"',
        },
      ]),
      allowUnchangedRegion([
        'major burns (>20% TBSA)',
        'will power and patient motivation',
        'faith, hope, and family support',
        'Faith, hope, and family',
      ]),
    ],
  })
);

