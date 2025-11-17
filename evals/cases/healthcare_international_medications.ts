/**
 * Healthcare Test Case: International Medication Names
 * 
 * Medications with Unicode characters, accents, and non-ASCII names.
 * Tests Unicode normalization (NFKC) and international drug detection.
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePredicates,
  healthcarePolicies,
} from '../catalog/healthcare';

export const healthcareInternationalMedicationsCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_international_medications',
      title: 'International Medication Names with Unicode',
      description:
        'Medications with accented characters and non-ASCII names testing Unicode normalization',
      owner: 'healthcare',
      category: 'extended',
      severity: 'major',
      tags: ['healthcare', 'unicode', 'medication', 'international', 'tokenize'],
      risk: 'International patient records may contain non-ASCII drug names',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MEDICATION,
      healthcareSubjects.MRN,
    ],
    predicates: [healthcarePredicates.PRESCRIPTION_EVENT],
    policies: [
      healthcarePolicies.pol_healthcare_prescription_redact,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
      healthcarePolicies.pol_healthcare_tokenize_medication,
    ],
    text: `
INTERNATIONAL PHARMACY CONSULTATION REPORT
Global Health Clinic - Multilingual Patient Services

PATIENT: María José García-López (MRN-556789)
Prescriptions from home country (Spain):
- Paracétamol 1000mg (acetaminophen) - analgesic
- Ibuprofén 600mg - anti-inflammatory  
- Omeprazol 20mg - proton pump inhibitor
- Ácido acetilsalicílico 100mg (aspirin)

US equivalent medications prescribed: Patient García-López will continue with Tylenol® (acetaminophen) 1000mg and omeprazole 20mg. Discussed medication name differences between countries.

PATIENT: Αλέξανδρος Παπαδόπουλος (Alexander Papadopoulos, MRN-667234)
Greek prescriptions requiring conversion:
- Αμοξυκιλλίνη 500mg (Amoxicillin) - antibiotic
- Μετφορμίνη 850mg (Metformin) - antidiabetic
- Ατορβαστατίνη 20mg (Atorvastatin) - statin

Patient Papadopoulos educated on US pharmacy system and medication labeling. Will fill prescriptions at pharmacy with Greek-speaking pharmacist available.

PATIENT: François Dubois (MRN-778345)
Medications from France:
- Doliprane® (paracétamol) 500mg
- Spasfon® (phloroglucinol) - antispasmodic
- Eductyl® with codéine - cough suppressant

Mr. Dubois requires prescription conversion for controlled substance (codeine). Discussed regulatory differences between French and US pharmacies.

PATIENT: 李明 (Li Ming, MRN-889456)
Chinese traditional medicine integration:
- 阿司匹林 (Aspirin) 100mg
- 二甲双胍 (Metformin) 500mg  
- Also taking traditional Chinese medicines: 丹参 (Salvia), 黄芪 (Astragalus)

Patient Li Ming educated on potential herb-drug interactions. Recommended consultation with integrative medicine specialist familiar with both Chinese and Western pharmacology.

PATIENT: João Silva (MRN-990567)
Portuguese medications:
- Brufen® (ibuprofeno) 400mg
- Crestor® (rosuvastatina) 10mg
- Ben-u-ron® (paracetamol) 500mg

Mr. Silva's prescriptions successfully converted to US formulary equivalents. Portuguese-speaking nurse provided medication counseling.

UNICODE MEDICATION BRAND NAMES:
- Advil® (ibuprofen with registered trademark symbol)
- Tylenol® Extra Strength
- Motrin® IB  
- Aleve® (naproxen)

All international medication records must preserve original Unicode characters for accurate medical history documentation while ensuring US prescription safety.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: [
            'María José García-López',
            'Αλέξανδρος Παπαδόπουλος',
            'Alexander Papadopoulos',
            'François Dubois',
            '李明',
            'Li Ming',
            'João Silva',
          ],
          note: 'Patient names with Unicode characters from multiple languages',
        },
        {
          kind: 'SUBJ',
          label: 'MEDICATION',
          surfaces: [
            'Paracétamol',
            'Ibuprofén',
            'Omeprazol',
            'Αμοξυκιλλίνη',
            'Μετφορμίνη',
            'codéine',
            '阿司匹林',
            '二甲双胍',
            'ibuprofeno',
            'rosuvastatina',
          ],
          minCount: 8,
          note: 'Medications with accented and non-ASCII characters',
        },
        {
          kind: 'PRED',
          label: 'PRESCRIPTION_EVENT',
          minCount: 5,
          targets: 'both',
          note: 'Prescription events for international patients',
        },
      ]),
    ],
  })
);

