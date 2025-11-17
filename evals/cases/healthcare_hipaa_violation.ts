/**
 * Healthcare Test Case: HIPAA Violation - Unencrypted Email
 * 
 * Document containing unredacted PHI transmitted via unencrypted email.
 * Should DENY to prevent HIPAA violation.
 */

import {
  defineCase,
  expectDenial,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePredicates,
  healthcarePolicies,
} from '../catalog/healthcare';
import { subjects } from '../catalog/registry';

export const healthcareHipaaViolationCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_hipaa_violation',
      title: 'HIPAA Violation Detection - Unencrypted Transmission',
      description:
        'PHI transmitted via unencrypted email, clear HIPAA violation requiring DENY action',
      owner: 'healthcare',
      category: 'core',
      severity: 'blocker',
      tags: ['healthcare', 'hipaa', 'deny', 'violation', 'email', 'phi'],
      risk: 'Critical HIPAA violation, potential fines up to $50,000 per violation',
    },
    subjects: [
      healthcareSubjects.PHI,
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DIAGNOSIS,
      subjects.EMAIL,
    ],
    predicates: [
      healthcarePredicates.HIPAA_SENSITIVE,
      healthcarePredicates.CLINICAL_EVENT,
    ],
    policies: [healthcarePolicies.pol_healthcare_deny_phi],
    text: `
From: jennifer.smith@memorialhospital.org
To: referrals@cardiology-associates.com
Subject: Patient Referral - Urgent Cardiology Consult
Date: November 13, 2024 2:45 PM

Hi Dr. Martinez,

I'm sending over a patient who needs urgent cardiology evaluation. Please see details below:

Patient: David Thompson (MRN-382947)
DOB: 05/18/1959
Contact: david.thompson@email.com, (555) 234-8901

Chief Complaint: Patient presented to our clinic today with worsening chest pain and shortness of breath over the past week. Reports pain radiates to left arm, associated with diaphoresis.

Medical History:
- Type 2 Diabetes Mellitus (poorly controlled, HbA1c 9.1% last month)
- Hypertension (on Lisinopril 20mg, Amlodipine 10mg)
- Hyperlipidemia (Atorvastatin 40mg)
- Former smoker (quit 2 years ago, 30 pack-year history)
- Family history significant for father MI at age 56

Recent Labs (11/10/2024):
- Troponin I: 0.15 ng/mL (mildly elevated)
- BNP: 380 pg/mL
- LDL: 145 mg/dL
- Creatinine: 1.3 mg/dL

Physical Exam:
- BP 156/92, HR 88, regular
- Cardiac: S1, S2 normal, no murmurs appreciated
- Lungs: Bilateral basilar crackles

Assessment: Likely acute coronary syndrome, possibly NSTEMI given troponin elevation. Started patient on aspirin 325mg, ordered EKG showing non-specific ST changes in lateral leads.

Plan: Patient needs urgent cardiology evaluation, possibly cardiac catheterization. I've advised Mr. Thompson to go directly to your office today if possible, otherwise ER admission tonight.

Please call me at (555) 789-4561 if you need any additional information. Patient is very anxious about the diagnosis and would appreciate seeing you today if you have availability.

Thanks for the expedited consult!

Best regards,
Dr. Jennifer Smith, MD
Internal Medicine
Memorial Hospital
jennifer.smith@memorialhospital.org
Phone: (555) 789-4561
    `.trim(),
    expectations: [
      expectDenial('pol_healthcare_deny_phi'),
      expectDetectionMap({
        subjects: {
          PATIENT_IDENTIFIER: ['David Thompson'],
          MRN: ['MRN-382947'],
          EMAIL: [
            'referrals@cardiology-associates.com',
            'david.thompson@email.com',
            'jennifer.smith@memorialhospital.org',
          ],
        },
        predicates: {
          HIPAA_SENSITIVE: ['emailed', 'sending over'],
          CLINICAL_EVENT: [
            'presented to our clinic',
            'diagnosed',
          ],
        },
      }),
    ],
  })
);

