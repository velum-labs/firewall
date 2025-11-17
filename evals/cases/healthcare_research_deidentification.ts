/**
 * Healthcare Test Case: Research De-identification
 * 
 * Medical research dataset requiring complete de-identification for publication.
 * Tests comprehensive PHI removal with nested clinical events and temporal sequences.
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

export const healthcareResearchDeidentificationCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_research_deidentification',
      title: 'Research Dataset De-identification',
      description:
        'Comprehensive de-identification of research dataset for publication, zero PHI leakage tolerance',
      owner: 'healthcare',
      category: 'core',
      severity: 'critical',
      tags: ['healthcare', 'research', 'deidentification', 'tokenize', 'hipaa'],
      risk: 'Research publication violation and HIPAA breach if any PHI remains',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.PHI,
      healthcareSubjects.MRN,
      healthcareSubjects.DATE_OF_BIRTH,
      healthcareSubjects.DIAGNOSIS,
      healthcareSubjects.MEDICATION,
      healthcareSubjects.HEALTHCARE_PROVIDER,
    ],
    predicates: [
      healthcarePredicates.RESEARCH_PARTICIPATION,
      healthcarePredicates.CLINICAL_EVENT,
      healthcarePredicates.LAB_RESULT,
      healthcarePredicates.PRESCRIPTION_EVENT,
    ],
    policies: [
      healthcarePolicies.pol_healthcare_research_deidentify,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
      healthcarePolicies.pol_healthcare_tokenize_dob,
    ],
    text: `
LONGITUDINAL STUDY: Cardiovascular Outcomes in Diabetic Patients
Research Protocol #CVD-DM-2023-017
Study Period: January 2023 - December 2023

CASE SERIES ANALYSIS:

Subject A (Study ID reassigned from MRN-445821): Female patient, Emily Watson, DOB: 03/22/1968, enrolled January 2023. Initial presentation included established Type 2 Diabetes Mellitus (diagnosed 2018) and newly identified coronary artery disease. Baseline evaluation conducted by Dr. Richard Morrison at University Medical Center revealed elevated cardiac biomarkers: Troponin I 0.8 ng/mL (elevated), BNP 420 pg/mL.

Longitudinal Clinical Course: Ms. Watson underwent cardiac catheterization on February 15, 2023, revealing 75% stenosis in LAD (left anterior descending artery). Cardiologist Dr. Jennifer Park performed percutaneous coronary intervention with drug-eluting stent placement. Post-procedure medications included dual antiplatelet therapy (Aspirin 81mg and Clopidogrel 75mg daily), Atorvastatin 80mg for lipid management, and continuation of diabetes medications (Metformin 1000mg BID, Glimepiride 4mg daily).

Six-Month Follow-up: Patient reported for scheduled evaluation on July 20, 2023. Cardiac stress test negative for ischemia. HbA1c improved to 6.8% from baseline 8.1%. LDL cholesterol at target < 70 mg/dL. Dr. Morrison documented excellent medication compliance and lifestyle modification adherence. Emily participated in cardiac rehabilitation program, completing 36 supervised sessions.

Subject B (Study ID from MRN-778234): Male patient, Michael Chang, birthdate August 10, 1955, enrolled March 2023. Complex medical history including 15-year duration of Type 2 Diabetes, chronic kidney disease (Stage 3, eGFR 48 mL/min), and peripheral arterial disease. Primary care physician Dr. Amanda Rodriguez referred patient to study based on high cardiovascular risk profile.

Baseline Assessment: Laboratory panel showed concerning trends - HbA1c 9.2%, serum creatinine 1.8 mg/dL, microalbuminuria 450 mg/g creatinine. Echocardiogram revealed preserved ejection fraction (55%) but mild left ventricular hypertrophy. Diabetes management required adjustment: transitioned from sulfonylurea to GLP-1 agonist (Dulaglutide 1.5mg weekly) to reduce hypoglycemia risk given renal impairment.

Progressive Monitoring: Mr. Chang experienced hospitalization in May 2023 for acute decompensated heart failure (Dr. Park, attending cardiologist). Treatment included IV diuresis and medication optimization. Post-discharge, patient enrolled in disease management program with registered nurse Sarah Thompson providing telephonic monitoring. September 2023 labs showed improvement: HbA1c 7.9%, stable renal function, reduction in albuminuria to 280 mg/g.

Subject C (from Medical Record #912456): Hispanic female, Isabella Ramirez, DOB: 11/05/1972, enrolled June 2023. Notable for early-onset Type 2 Diabetes (age 35 diagnosis) and strong family history of cardiovascular disease (father MI at age 52, mother stroke at 58). Endocrinologist Dr. Kevin Lin managed complex insulin regimen: Insulin Glargine 40 units at bedtime, Insulin Aspart with meals.

Research Intervention: Patient randomized to intensive glucose monitoring arm with continuous glucose monitor (CGM) technology. Dr. Lin and diabetes educator reviewed CGM data showing significant glycemic variability. Adjusted basal insulin to 45 units, implemented carbohydrate counting education. Ms. Ramirez met with registered dietitian Maria Santos weekly for nutritional counseling.

Outcome Measures at Study Completion (December 2023): Isabella achieved time-in-range improvement from 52% to 78%. Cardiovascular risk factors optimized: blood pressure 118/72 mmHg, LDL 65 mg/dL, HbA1c 6.9%. No major adverse cardiac events during study period.

AGGREGATE FINDINGS: This case series demonstrates successful cardiovascular risk reduction in high-risk diabetic population through multidisciplinary care coordination and intensive monitoring protocols.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Emily Watson', 'Michael Chang', 'Isabella Ramirez'],
          note: 'All patient names must be completely redacted',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: ['MRN-445821', 'MRN-778234'],
          note: 'Medical record numbers must be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'DATE_OF_BIRTH',
          surfaces: ['03/22/1968', 'August 10, 1955', '11/05/1972'],
          note: 'All dates of birth are HIPAA identifiers',
        },
        {
          kind: 'SUBJ',
          label: 'HEALTHCARE_PROVIDER',
          surfaces: [
            'Dr. Richard Morrison',
            'Dr. Jennifer Park',
            'Dr. Amanda Rodriguez',
            'Dr. Kevin Lin',
          ],
          note: 'Provider names should be tokenized in research context',
        },
        {
          kind: 'PRED',
          label: 'RESEARCH_PARTICIPATION',
          minCount: 3,
          targets: 'both',
          note: 'Research enrollment for all subjects',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          minCount: 10,
          targets: 'both',
          note: 'Numerous clinical events across longitudinal timeline',
        },
        {
          kind: 'PRED',
          label: 'LAB_RESULT',
          minCount: 8,
          targets: 'both',
          note: 'Laboratory results must be bound to patient identifiers',
        },
      ]),
    ],
  })
);

