/**
 * Healthcare Industry Catalog
 * 
 * Subjects, predicates, and policies for HIPAA-compliant healthcare scenarios.
 * Covers PHI protection, clinical event handling, and research de-identification.
 */

import type { SubjectSpec, PredicateSpec } from '../../src/catalog';
import type { Policy } from '../../src/policy';

/**
 * Healthcare Subjects - Protected Health Information and Identifiers
 */
export const HEALTHCARE_SUBJECTS = {
  PHI: {
    description:
      'Protected Health Information including patient names, addresses, and dates of birth in medical contexts',
    examples: [
      'John Smith (patient)',
      'Mary Johnson, DOB 01/15/1980',
      'Patient residence: 123 Main St',
    ],
  },
  MRN: {
    description: 'Medical Record Numbers in various formats',
    examples: ['MRN-123456', 'MR#789012', 'Medical Record: 345678'],
    patterns: [
      String.raw`MRN[-:]?\d{6,10}`,
      String.raw`MR#\d{6,10}`,
      String.raw`(?:Medical Record|Med Rec|EMR):\s*\d{6,10}`,
    ],
  },
  DIAGNOSIS: {
    description:
      'Medical diagnoses, conditions, and ICD codes (not general medical terms)',
    examples: [
      'diagnosed with Type 2 Diabetes',
      'acute myocardial infarction',
      'ICD-10: E11.9',
    ],
  },
  MEDICATION: {
    description:
      'Prescription drugs, medications, and pharmaceuticals (brand and generic names)',
    examples: [
      'Metformin 500mg',
      'Lisinopril',
      'Lipitor (atorvastatin)',
      'Paracétamol',
    ],
  },
  PATIENT_IDENTIFIER: {
    description:
      'Any patient-identifying information including names, IDs, and unique identifiers',
    examples: ['Patient ID: P-98765', 'John Doe (age 45)', 'Subject #042'],
  },
  HEALTHCARE_PROVIDER: {
    description:
      'Physicians, nurses, hospitals, and healthcare facilities in clinical contexts',
    examples: [
      'Dr. Sarah Williams',
      'Memorial Hospital',
      'attending physician Dr. Chen',
    ],
  },
  DATE_OF_BIRTH: {
    description: 'Dates of birth in various formats',
    examples: ['DOB: 01/15/1990', 'born January 15, 1990', 'birthdate 1990-01-15'],
    patterns: [
      String.raw`DOB:?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}`,
      String.raw`DOB:?\s*\d{1,2}-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2,4}`,
      String.raw`(?:born|birthdate|date of birth):?\s*\w+\s+\d{1,2},?\s+\d{4}`,
      String.raw`(?:born|birthdate|date of birth):?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}`,
      String.raw`born\s+on:?\s*\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?\w+,?\s+\d{4}`,
      String.raw`\b\d{1,2}-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2,4}\b`,
      String.raw`\b\d{1,2}-\d{1,2}-\d{2,4}\b`,
      String.raw`\d{4}-\d{2}-\d{2}(?=\s+(?:DOB|birth|age))`,
    ],
  },
  MEDICAL_DEVICE_ID: {
    description: 'Medical device and implant serial numbers',
    examples: [
      'Pacemaker SN: PM-2023-456789',
      'Device ID: D-987654',
      'Implant serial: IMP-2024-001',
    ],
    patterns: [String.raw`(?:Device ID|Serial|SN):\s*[A-Z0-9-]{8,20}`],
  },
} as const satisfies Record<string, SubjectSpec>;

/**
 * Healthcare Predicates - Clinical Events and HIPAA-Sensitive Actions
 */
export const HEALTHCARE_PREDICATES = {
  CLINICAL_EVENT: {
    definition:
      'Medical treatments, procedures, surgeries, or diagnoses performed on or affecting a patient. Must be an actual clinical action, not a general medical discussion.',
    examples: [
      'underwent coronary bypass surgery',
      'treated for pneumonia',
      'diagnosed with hypertension',
      'administered chemotherapy',
    ],
    negatives: [
      'coronary bypass is a common procedure',
      'pneumonia symptoms include',
      'hypertension affects millions',
    ],
    relatedSubjects: ['PATIENT_IDENTIFIER', 'HEALTHCARE_PROVIDER', 'DIAGNOSIS'],
  },
  PRESCRIPTION_EVENT: {
    definition:
      'Medication orders, prescriptions, or dosing instructions for a specific patient. Must involve actual prescription activity, not general drug information.',
    examples: [
      'prescribed Metformin 500mg twice daily',
      'refilled prescription for Lisinopril',
      'adjusted dosage to 20mg',
    ],
    negatives: [
      'Metformin is used to treat diabetes',
      'typical Lisinopril dosage',
      'side effects include',
    ],
    relatedSubjects: ['PATIENT_IDENTIFIER', 'MEDICATION', 'HEALTHCARE_PROVIDER'],
  },
  HIPAA_SENSITIVE: {
    definition:
      'Events or situations that trigger HIPAA privacy concerns, such as PHI disclosure, unauthorized access, or data breach scenarios.',
    examples: [
      'emailed patient records to',
      'accessed medical chart without authorization',
      'disclosed diagnosis to family member',
    ],
    relatedSubjects: ['PHI', 'PATIENT_IDENTIFIER'],
  },
  LAB_RESULT: {
    definition:
      'Laboratory test results, values, or findings for a specific patient. Must include actual test results, not general lab information.',
    examples: [
      'HbA1c level of 7.2%',
      'glucose: 145 mg/dL',
      'positive COVID-19 test',
      'complete blood count showed',
    ],
    negatives: [
      'normal HbA1c range is',
      'glucose testing procedure',
      'COVID-19 test accuracy',
    ],
    relatedSubjects: ['PATIENT_IDENTIFIER', 'DIAGNOSIS'],
  },
  INFORMED_CONSENT: {
    definition:
      'Patient consent discussions, consent forms, or authorization for treatment or research participation.',
    examples: [
      'patient consented to the procedure',
      'signed informed consent form',
      'authorized release of medical records',
    ],
    relatedSubjects: ['PATIENT_IDENTIFIER', 'CLINICAL_EVENT'],
  },
  RESEARCH_PARTICIPATION: {
    definition:
      'Patient enrollment in clinical trials, research studies, or experimental treatments.',
    examples: [
      'enrolled in Phase III trial',
      'randomized to treatment arm',
      'participated in diabetes study',
    ],
    relatedSubjects: ['PATIENT_IDENTIFIER', 'CLINICAL_EVENT'],
  },
} as const satisfies Record<string, PredicateSpec>;

/**
 * Healthcare Policies - HIPAA Compliance and Privacy Protection
 */
export const HEALTHCARE_POLICIES = {
  pol_healthcare_deny_phi: {
    id: 'pol_healthcare_deny_phi',
    nl: 'DENY documents with unredacted PHI in insecure transmission contexts (e.g., unencrypted email).',
    when: {
      predicate: 'HIPAA_SENSITIVE',
      bind: {
        subjects: ['PHI', 'PATIENT_IDENTIFIER'],
        proximity: 'sentence',
        cardinality: '>=1',
      },
      minConfidence: {
        predicate: 0.8,
        subjects: 0.75,
      },
    },
    then: { action: 'DENY' },
  },
  pol_healthcare_tokenize_mrn: {
    id: 'pol_healthcare_tokenize_mrn',
    nl: 'Tokenize all Medical Record Numbers to protect patient identity.',
    when: {
      subjects: ['MRN'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_healthcare_tokenize_clinical_events: {
    id: 'pol_healthcare_tokenize_clinical_events',
    nl: 'Tokenize clinical events and bound patient identifiers for privacy-preserving clinical documentation.',
    when: {
      predicate: 'CLINICAL_EVENT',
      bind: {
        subjects: ['PATIENT_IDENTIFIER', 'PHI'],
        proximity: 'paragraph',
        cardinality: '>=1',
      },
      minConfidence: {
        predicate: 0.75,
        subjects: 0.7,
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_healthcare_research_deidentify: {
    id: 'pol_healthcare_research_deidentify',
    nl: 'Tokenize all patient identifiers for research data de-identification (Safe Harbor method).',
    when: {
      predicate: 'RESEARCH_PARTICIPATION',
      bind: {
        subjects: ['PATIENT_IDENTIFIER', 'PHI', 'MRN', 'DATE_OF_BIRTH'],
        proximity: 'doc',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_healthcare_lab_privacy: {
    id: 'pol_healthcare_lab_privacy',
    nl: 'Tokenize lab results and bound patient identifiers to protect diagnostic privacy.',
    when: {
      predicate: 'LAB_RESULT',
      bind: {
        subjects: ['PATIENT_IDENTIFIER', 'MRN'],
        proximity: 'sentence',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_healthcare_prescription_redact: {
    id: 'pol_healthcare_prescription_redact',
    nl: 'Tokenize prescription events and bound patient information for pharmacy privacy.',
    when: {
      predicate: 'PRESCRIPTION_EVENT',
      bind: {
        subjects: ['PATIENT_IDENTIFIER', 'MEDICATION'],
        proximity: 'sentence',
        cardinality: '>=1',
      },
    },
    then: { action: 'TOKENIZE', targets: 'both' },
  },
  pol_healthcare_high_confidence_phi: {
    id: 'pol_healthcare_high_confidence_phi',
    nl: 'Tokenize only high-confidence PHI to minimize false positives in general medical discussions.',
    when: {
      subjects: ['PHI', 'PATIENT_IDENTIFIER', 'MRN', 'HEALTHCARE_PROVIDER', 'DATE_OF_BIRTH'],
      minConfidence: 0.9,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_healthcare_tokenize_dob: {
    id: 'pol_healthcare_tokenize_dob',
    nl: 'Tokenize dates of birth as HIPAA identifiers for Safe Harbor compliance.',
    when: {
      subjects: ['DATE_OF_BIRTH'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_healthcare_tokenize_medication: {
    id: 'pol_healthcare_tokenize_medication',
    nl: 'Tokenize medication names tied to identifiable patients in clinical notes.',
    when: {
      subjects: ['MEDICATION'],
      minConfidence: 0.85,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_healthcare_tokenize_patient_identifiers: {
    id: 'pol_healthcare_tokenize_patient_identifiers',
    nl: 'Tokenize patient names and identifiers referenced in clinical narratives.',
    when: {
      subjects: ['PATIENT_IDENTIFIER'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  pol_healthcare_allow_public_health: {
    id: 'pol_healthcare_allow_public_health',
    nl: 'Allow de-identified public health data and general medical information.',
    when: {
      subjects: ['DIAGNOSIS', 'MEDICATION'],
      scope: 'sentence',
    },
    unless: [
      {
        subjects: ['PATIENT_IDENTIFIER', 'PHI'],
        minConfidence: 0.7,
      },
    ],
    then: { action: 'ALLOW' },
  },
} satisfies Record<string, Policy>;

export type HealthcareSubjectId = keyof typeof HEALTHCARE_SUBJECTS;
export type HealthcarePredicateId = keyof typeof HEALTHCARE_PREDICATES;
export type HealthcarePolicyId = keyof typeof HEALTHCARE_POLICIES;

export const healthcareSubjects = HEALTHCARE_SUBJECTS;
export const healthcarePredicates = HEALTHCARE_PREDICATES;
export const healthcarePolicies = HEALTHCARE_POLICIES;

