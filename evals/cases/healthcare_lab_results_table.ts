/**
 * Healthcare Test Case: Lab Results in Tabular Format
 * 
 * Laboratory results presented in tables/structured format.
 * Tests structured data extraction and binding.
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

export const healthcareLabResultsTableCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_lab_results_table',
      title: 'Laboratory Results in Tabular Format',
      description:
        'Lab results in tables with patient IDs, testing structured data extraction',
      owner: 'healthcare',
      category: 'extended',
      severity: 'major',
      tags: ['healthcare', 'lab-results', 'structured-data', 'table', 'tokenize'],
      risk: 'Tabular PHI requires careful extraction to maintain structure',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DIAGNOSIS,
    ],
    predicates: [
      healthcarePredicates.LAB_RESULT,
      healthcarePredicates.CLINICAL_EVENT,
    ],
    policies: [
      healthcarePolicies.pol_healthcare_lab_privacy,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
    ],
    text: `
CLINICAL LABORATORY SERVICES
Daily Hemoglobin A1c Results Report
Date: November 13, 2024

DIABETES SCREENING PANEL - BATCH RESULTS

┌──────────────────────┬─────────────┬──────────┬────────┬──────────────┬─────────────────┐
│ Patient Name         │ MRN         │ Age/Sex  │ HbA1c  │ Fasting GLU  │ Interpretation  │
├──────────────────────┼─────────────┼──────────┼────────┼──────────────┼─────────────────┤
│ Robert Martinez      │ MRN-334455  │ 58/M     │ 8.9%   │ 178 mg/dL    │ Poor Control    │
│ Sarah Johnson        │ MRN-445566  │ 62/F     │ 6.2%   │ 112 mg/dL    │ Good Control    │
│ Michael Thompson     │ MRN-556677  │ 45/M     │ 7.8%   │ 156 mg/dL    │ Suboptimal      │
│ Jennifer Lee         │ MRN-667788  │ 51/F     │ 5.9%   │ 102 mg/dL    │ Target Achieved │
│ David Chen           │ MRN-778899  │ 67/M     │ 9.2%   │ 195 mg/dL    │ Poor Control    │
│ Maria Rodriguez      │ MRN-889900  │ 55/F     │ 7.1%   │ 138 mg/dL    │ Improving       │
│ James Anderson       │ MRN-990011  │ 49/M     │ 6.8%   │ 125 mg/dL    │ Near Target     │
│ Lisa Williams        │ MRN-101122  │ 59/F     │ 8.5%   │ 168 mg/dL    │ Poor Control    │
└──────────────────────┴─────────────┴──────────┴────────┴──────────────┴─────────────────┘

CRITICAL VALUES ALERT:
Patient: David Chen (MRN-778899) - HbA1c 9.2% significantly above target
Patient: Robert Martinez (MRN-334455) - HbA1c 8.9% requires intervention
Patient: Lisa Williams (MRN-101122) - HbA1c 8.5% needs medication adjustment

COMPREHENSIVE METABOLIC PANEL - ABNORMAL RESULTS

Patient: Robert Martinez (MRN-334455)
Test           Result      Reference Range    Flag
────────────────────────────────────────────────────
Sodium         142 mEq/L   136-145           Normal
Potassium      3.2 mEq/L   3.5-5.0           LOW
Chloride       98 mEq/L    98-107            Normal
CO2            22 mEq/L    23-29             LOW
BUN            28 mg/dL    7-20              HIGH
Creatinine     1.8 mg/dL   0.7-1.3           HIGH
eGFR           42 mL/min   >60               LOW
Glucose        178 mg/dL   70-100            HIGH

Interpretation: Mr. Martinez shows evidence of chronic kidney disease (Stage 3) with electrolyte imbalances. Recommend nephrology consultation.

Patient: David Chen (MRN-778899)
Test           Result      Reference Range    Flag
────────────────────────────────────────────────────
Sodium         138 mEq/L   136-145           Normal
Potassium      4.8 mEq/L   3.5-5.0           Normal
Chloride       102 mEq/L   98-107            Normal
CO2            25 mEq/L    23-29             Normal
BUN            18 mg/dL    7-20              Normal
Creatinine     1.1 mg/dL   0.7-1.3           Normal
eGFR           68 mL/min   >60               Normal
Glucose        195 mg/dL   70-100            HIGH

Interpretation: Patient Chen demonstrates isolated hyperglycemia consistent with poorly controlled diabetes mellitus.

LIPID PANEL SCREENING RESULTS

┌─────────────────┬────────────┬───────────┬───────────┬───────────┬──────────┐
│ Patient         │ MRN        │ Total     │ LDL       │ HDL       │ Trigly   │
│                 │            │ Chol      │ Chol      │ Chol      │ cerides  │
├─────────────────┼────────────┼───────────┼───────────┼───────────┼──────────┤
│ Sarah Johnson   │ MRN-445566 │ 185 mg/dL │ 108 mg/dL │ 58 mg/dL  │ 95 mg/dL │
│ Michael Thompson│ MRN-556677 │ 245 mg/dL │ 165 mg/dL │ 42 mg/dL  │ 190 mg/dL│
│ Jennifer Lee    │ MRN-667788 │ 198 mg/dL │ 115 mg/dL │ 62 mg/dL  │ 105 mg/dL│
│ Maria Rodriguez │ MRN-889900 │ 220 mg/dL │ 145 mg/dL │ 48 mg/dL  │ 135 mg/dL│
│ James Anderson  │ MRN-990011 │ 178 mg/dL │ 98 mg/dL  │ 55 mg/dL  │ 125 mg/dL│
└─────────────────┴────────────┴───────────┴───────────┴───────────┴──────────┘

RECOMMENDATIONS BY PATIENT:

Michael Thompson (MRN-556677): 
- Elevated LDL (165 mg/dL) and triglycerides (190 mg/dL)
- Recommend statin therapy initiation
- Lifestyle modification counseling
- Repeat lipid panel in 3 months

Maria Rodriguez (MRN-889900):
- Borderline high LDL (145 mg/dL)  
- Low HDL (48 mg/dL) - cardiovascular risk factor
- Consider statin if ASCVD risk score >7.5%
- Increase aerobic exercise, omega-3 supplementation

THYROID FUNCTION TESTS

Patient Name: Lisa Williams (MRN-101122)
TSH: 8.5 mIU/L (Reference: 0.4-4.0) - ELEVATED
Free T4: 0.7 ng/dL (Reference: 0.8-1.8) - LOW
Free T3: 2.1 pg/mL (Reference: 2.3-4.2) - LOW

Interpretation: Patient Williams demonstrates primary hypothyroidism. Clinical correlation with symptoms (fatigue, weight gain, cold intolerance) recommended. Suggest levothyroxine therapy initiation.

URINALYSIS WITH MICROSCOPY

Patient: Robert Martinez (MRN-334455)
Color: Yellow         pH: 6.0
Specific Gravity: 1.025    Protein: 2+ (abnormal)
Glucose: 2+ (abnormal)     Ketones: Negative
Blood: Trace              Leukocyte Esterase: Negative

Microscopy:
RBC: 5-10 per HPF
WBC: 2-5 per HPF  
Bacteria: Few
Casts: Hyaline casts present

Interpretation: Proteinuria and glucosuria consistent with diabetic nephropathy in patient Martinez. Recommend urine albumin-to-creatinine ratio for staging.

FOLLOW-UP ACTIONS REQUIRED:
1. Notify Dr. Sarah Mitchell regarding Robert Martinez's renal function decline
2. Endocrinology referral for David Chen (HbA1c 9.2%)
3. Cardiology risk assessment for Michael Thompson (dyslipidemia)
4. Endocrinology consult for Lisa Williams (hypothyroidism)

All results transmitted to ordering physicians via secure electronic medical record system.

Medical Laboratory Director: Dr. Kevin Park, MD, PhD
Clinical Pathologist: Dr. Amanda Chen, MD
Laboratory Supervisor: Rachel Thompson, MT(ASCP)
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: [
            'Robert Martinez',
            'Sarah Johnson',
            'Michael Thompson',
            'Jennifer Lee',
            'David Chen',
            'Maria Rodriguez',
            'James Anderson',
            'Lisa Williams',
          ],
          note: 'All patient names from tabular data',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: [
            'MRN-334455',
            'MRN-445566',
            'MRN-556677',
            'MRN-667788',
            'MRN-778899',
            'MRN-889900',
            'MRN-990011',
            'MRN-101122',
          ],
          note: 'All MRNs from table rows',
        },
        {
          kind: 'PRED',
          label: 'LAB_RESULT',
          minCount: 8,
          targets: 'both',
          note: 'Lab result events for each patient',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          minCount: 4,
          targets: 'both',
          note: 'Clinical interpretations and diagnoses from lab results',
        },
      ]),
    ],
  })
);

