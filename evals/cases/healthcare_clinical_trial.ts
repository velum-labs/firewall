/**
 * Healthcare Test Case: Clinical Trial Data
 * 
 * Multi-patient clinical trial report with diagnoses, medications, and MRNs.
 * Tests paragraph scope binding and cardinality requirements for research de-identification.
 */

import {
  defineCase,
  expectTokenizedEntities,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePredicates,
  healthcarePolicies,
} from '../catalog/healthcare';

export const healthcareClinicalTrialCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_clinical_trial',
      title: 'Clinical Trial De-identification',
      description:
        'Multi-patient clinical trial data requiring comprehensive de-identification with paragraph scope binding',
      owner: 'healthcare',
      category: 'core',
      severity: 'blocker',
      tags: ['healthcare', 'clinical-trial', 'research', 'tokenize', 'hipaa'],
      risk: 'HIPAA violation if PHI leaks in published research',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DIAGNOSIS,
      healthcareSubjects.MEDICATION,
      healthcareSubjects.HEALTHCARE_PROVIDER,
    ],
    predicates: [
      healthcarePredicates.RESEARCH_PARTICIPATION,
      healthcarePredicates.CLINICAL_EVENT,
      healthcarePredicates.PRESCRIPTION_EVENT,
    ],
    policies: [
      healthcarePolicies.pol_healthcare_research_deidentify,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
    ],
    text: `
CLINICAL TRIAL REPORT: Phase III Diabetes Management Study
Study ID: DM-2024-003
Principal Investigator: Dr. Sarah Mitchell, Memorial Hospital

PATIENT COHORT SUMMARY:

Patient 1: Robert Chen (MRN-847392) enrolled on January 15, 2024. Subject is a 58-year-old male diagnosed with Type 2 Diabetes Mellitus (HbA1c 8.9%). Baseline assessment revealed poor glycemic control despite previous treatment with Metformin monotherapy.

Treatment Protocol: Initiated combination therapy with Metformin 1000mg twice daily and Empagliflozin 10mg once daily. Patient educated on SMBG (self-monitoring blood glucose) protocol and dietary modifications.

Follow-up Visit (Week 12): Mr. Chen reported improved energy levels and adherence to medication regimen. Laboratory results showed HbA1c decreased to 7.1%. No adverse events reported. Continue current medication dosing.

Patient 2: Maria Rodriguez (MRN-923847) participated in the study beginning February 3, 2024. This 62-year-old female presented with newly diagnosed Type 2 Diabetes (HbA1c 9.3%) and hypertension. Medical history significant for obesity (BMI 32.4).

Treatment Protocol: Started on Metformin 500mg twice daily with gradual titration planned. Also prescribed Lisinopril 10mg daily for hypertension management. Enrolled in diabetes education program led by certified diabetes educator.

Week 12 Assessment: Ms. Rodriguez demonstrated excellent medication compliance. HbA1c improved to 7.8%, blood pressure well-controlled at 128/76 mmHg. Metformin dose increased to 1000mg twice daily per protocol.

Patient 3: James Thompson (MRN-756201) enrolled March 10, 2024. 45-year-old male with Type 2 Diabetes (HbA1c 8.2%) and family history of cardiovascular disease. Patient works as software engineer, sedentary lifestyle.

Treatment Protocol: Prescribed Metformin XR 1500mg once daily and Jardiance 25mg once daily. Referred to cardiac rehabilitation program for supervised exercise. Dr. Mitchell emphasized importance of lifestyle modification in addition to pharmacotherapy.

Interim Analysis (Week 8): Mr. Thompson's HbA1c decreased to 7.3%. Patient reported mild gastrointestinal side effects from Metformin, resolved with continued use. Exercise compliance improving, now walking 30 minutes daily.

STUDY CONCLUSIONS: All three participants in this cohort demonstrated significant improvement in glycemic control with combination therapy. The study protocol successfully achieved target HbA1c reductions while maintaining acceptable safety profile.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Robert Chen', 'Maria Rodriguez', 'James Thompson'],
          note: 'All three patient names must be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: ['MRN-847392', 'MRN-923847', 'MRN-756201'],
          note: 'All Medical Record Numbers must be tokenized',
        },
        {
          kind: 'PRED',
          label: 'RESEARCH_PARTICIPATION',
          minCount: 3,
          note: 'Research participation events for all three patients',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          minCount: 6,
          note: 'Multiple clinical events including diagnoses and follow-ups',
        },
        {
          kind: 'PRED',
          label: 'PRESCRIPTION_EVENT',
          minCount: 5,
          note: 'Medication prescriptions for all patients',
        },
      ]),
      expectDetectionMap({
        subjects: {
          PATIENT_IDENTIFIER: ['Robert Chen', 'Maria Rodriguez', 'James Thompson'],
          MRN: ['MRN-847392', 'MRN-923847', 'MRN-756201'],
          HEALTHCARE_PROVIDER: ['Dr. Sarah Mitchell'],
        },
        predicates: {
          RESEARCH_PARTICIPATION: ['enrolled', 'participated'],
          CLINICAL_EVENT: [
            'diagnosed with Type 2 Diabetes',
            'HbA1c decreased',
          ],
          PRESCRIPTION_EVENT: [
            'Initiated combination therapy',
            'Prescribed Metformin',
          ],
        },
      }),
    ],
  })
);

