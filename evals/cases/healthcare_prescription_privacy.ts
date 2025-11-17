/**
 * Healthcare Test Case: Prescription Privacy
 * 
 * Pharmacy prescription records with patient identifiers and medications.
 * Tests PRESCRIPTION_EVENT → PATIENT_IDENTIFIER binding.
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

export const healthcarePrescriptionPrivacyCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_prescription_privacy',
      title: 'Prescription Record Privacy Protection',
      description:
        'Pharmacy records with prescriptions, patient IDs, and medications requiring privacy-preserving tokenization',
      owner: 'healthcare',
      category: 'core',
      severity: 'major',
      tags: ['healthcare', 'pharmacy', 'prescription', 'tokenize', 'hipaa'],
      risk: 'Unauthorized disclosure of prescription history violates HIPAA',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.MEDICATION,
      healthcareSubjects.HEALTHCARE_PROVIDER,
    ],
    predicates: [
      healthcarePredicates.PRESCRIPTION_EVENT,
      healthcarePredicates.CLINICAL_EVENT,
    ],
    policies: [
      healthcarePolicies.pol_healthcare_prescription_redact,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
      healthcarePolicies.pol_healthcare_tokenize_medication,
    ],
    text: `
PHARMACY DISPENSING REPORT
Community Health Pharmacy - Daily Controlled Substance Log
Date: November 13, 2024

PRESCRIPTION #1:
Patient: Sandra Mitchell (MRN-556234)
Prescriber: Dr. Alan Foster, Pain Management Specialists
Medication: Oxycodone 10mg tablets
Quantity: 60 tablets
Directions: Take 1 tablet by mouth every 6 hours as needed for pain
Refills: 0
Date Prescribed: 11/10/2024
Date Filled: 11/13/2024 09:15 AM
Pharmacist Notes: Verified prescription in PDMP (Prescription Drug Monitoring Program). Patient ID confirmed with driver's license. Counseled on proper opioid storage and disposal. Risk of respiratory depression discussed.

PRESCRIPTION #2:
Patient: Robert Kim (Medical Record #723891)
Prescriber: Dr. Patricia Chen, Cardiology Group
Medication: Eliquis (Apixaban) 5mg tablets
Quantity: 60 tablets  
Directions: Take 1 tablet by mouth twice daily
Refills: 5
Date Prescribed: 11/08/2024
Date Filled: 11/13/2024 10:30 AM
Pharmacist Notes: Patient prescribed Eliquis for atrial fibrillation. Counseled on bleeding precautions, importance of compliance, and need to inform all healthcare providers of anticoagulation therapy. Drug interaction check performed - no significant interactions found.

PRESCRIPTION #3:
Patient: Maria Gonzalez (MRN-894521)
Prescriber: Dr. James Wilson, Endocrinology Associates  
Medications (Multiple):
  1. Insulin Glargine (Lantus) 100 units/mL - Inject 35 units subcutaneously at bedtime
  2. Insulin Lispro (Humalog) 100 units/mL - Inject per sliding scale before meals
  3. Metformin HCL 1000mg tablets - Take 1 tablet twice daily with food
  4. Empagliflozin (Jardiance) 25mg tablets - Take 1 tablet once daily in morning
Quantity: 30-day supply for all medications
Refills: 3 for each
Date Prescribed: 11/11/2024
Date Filled: 11/13/2024 11:45 AM
Pharmacist Notes: Comprehensive diabetes medication regimen. Patient educated on insulin administration technique, proper storage (refrigeration), and recognition of hypoglycemia symptoms. Provided glucose tablets and encouraged continuous glucose monitoring. Ms. Gonzalez demonstrates good understanding of medication regimen.

PRESCRIPTION #4:
Patient: Thomas Anderson (MRN-671234)
Prescriber: Dr. Rachel Martinez, Psychiatry Clinic
Medication: Venlafaxine XR (Effexor XR) 150mg capsules
Quantity: 30 capsules
Directions: Take 1 capsule by mouth once daily
Refills: 11
Date Prescribed: 11/12/2024
Date Filled: 11/13/2024 02:20 PM
Pharmacist Notes: Antidepressant medication for depression and anxiety. Counseled patient on importance of taking medication consistently, not abruptly discontinuing, and monitoring for worsening depression or suicidal thoughts. Mr. Anderson reports this is a refill continuation, tolerating medication well without side effects.

PRESCRIPTION #5:
Patient: Linda Patel (Medical Record: 445789)
Prescriber: Dr. Steven Brooks, Primary Care Associates
Medications:
  1. Lisinopril 40mg tablets - Take 1 tablet once daily for blood pressure
  2. Hydrochlorothiazide 25mg tablets - Take 1 tablet once daily
  3. Atorvastatin (Lipitor) 80mg tablets - Take 1 tablet at bedtime for cholesterol
Quantity: 90-day supply (mail order)
Refills: 3
Date Prescribed: 11/09/2024
Date Filled: 11/13/2024 03:45 PM
Pharmacist Notes: Cardiovascular medication regimen for hypertension and hyperlipidemia. Blood pressure and lipid management discussed. Patient advised to monitor blood pressure at home and report any dizziness or muscle pain. Ms. Patel enrolled in automatic refill program for medication adherence support.

CONTROLLED SUBSTANCE VERIFICATION:
All Schedule II medications verified through state PDMP system. Prescriber DEA numbers validated. Patient identification confirmed per federal requirements. Pharmacist: Karen Johnson, RPh (License #PH-45782).
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: [
            'Sandra Mitchell',
            'Robert Kim',
            'Maria Gonzalez',
            'Thomas Anderson',
            'Linda Patel',
          ],
          note: 'All patient names must be tokenized',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: [
            'MRN-556234',
            'MRN-894521',
            'MRN-671234',
          ],
          note: 'Medical record numbers are HIPAA identifiers',
        },
        {
          kind: 'PRED',
          label: 'PRESCRIPTION_EVENT',
          minCount: 5,
          targets: 'both',
          note: 'Five separate prescription events with bound patient identifiers',
        },
        {
          kind: 'SUBJ',
          label: 'MEDICATION',
          surfaces: [
            'Oxycodone',
            'Eliquis',
            'Insulin Glargine',
            'Metformin',
            'Venlafaxine',
            'Lisinopril',
          ],
          minCount: 6,
          note: 'Multiple medications should be detected',
        },
      ]),
    ],
  })
);

