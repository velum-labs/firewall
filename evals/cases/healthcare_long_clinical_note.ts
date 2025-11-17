/**
 * Healthcare Test Case: Long Clinical Note (Stress Test)
 * 
 * 2000+ word clinical note testing extraction completeness and performance.
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

export const healthcareLongClinicalNoteCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_long_clinical_note',
      title: 'Long Clinical Progress Note - Performance Stress Test',
      description:
        '2000+ word clinical note testing extraction completeness without truncation',
      owner: 'healthcare',
      category: 'extended',
      severity: 'major',
      tags: ['healthcare', 'performance', 'long-document', 'tokenize', 'stress-test'],
      risk: 'Long documents may exceed LLM token limits or timeout',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DIAGNOSIS,
      healthcareSubjects.MEDICATION,
      healthcareSubjects.HEALTHCARE_PROVIDER,
    ],
    predicates: [
      healthcarePredicates.CLINICAL_EVENT,
      healthcarePredicates.PRESCRIPTION_EVENT,
      healthcarePredicates.LAB_RESULT,
    ],
    policies: [
      healthcarePolicies.pol_healthcare_tokenize_clinical_events,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
    ],
    text: `
COMPREHENSIVE PROGRESS NOTE
Intensive Care Unit - Day 14 of Hospitalization

Patient: Elizabeth Margaret Richardson
Medical Record Number: MRN-445678
Date of Service: November 13, 2024
Attending Physician: Dr. Jonathan Mitchell, MD, FCCP
ICU Team: Dr. Sarah Chen (Fellow), Dr. Michael Rodriguez (Resident), Nurse Practitioner Amanda Williams

CHIEF COMPLAINT:
Mrs. Richardson is a 72-year-old female with complicated hospital course following admission for acute respiratory failure secondary to bilateral pneumonia and septic shock.

HISTORY OF PRESENT ILLNESS:
Patient Elizabeth Richardson initially presented to the emergency department 14 days ago with 5-day history of progressive dyspnea, productive cough with purulent sputum, fever to 103.2°F, and altered mental status. Family reported patient had been increasingly confused over 48 hours prior to presentation. Emergency Medical Services transported patient from her assisted living facility.

Upon ED arrival, patient was hypotensive (BP 82/45), tachycardic (HR 128), tachypneic (RR 32), hypoxemic (SpO2 78% on room air), and febrile (T 102.8°F). Patient was in obvious respiratory distress with use of accessory muscles and unable to complete full sentences. Dr. Patricia Thompson, ED attending, immediately initiated sepsis protocol.

HOSPITAL COURSE BY SYSTEM:

RESPIRATORY:
Initial chest X-ray demonstrated bilateral infiltrates consistent with multilobar pneumonia. Patient Richardson rapidly progressed to acute hypoxemic respiratory failure requiring emergent endotracheal intubation by Dr. Thompson. Mechanical ventilation initiated with lung-protective strategy: tidal volume 6 mL/kg ideal body weight, PEEP 10 cm H2O, FiO2 80%.

Bronchoscopy performed on hospital day 2 by pulmonologist Dr. Kevin Park revealed purulent secretions. Bronchoalveolar lavage cultures subsequently grew Streptococcus pneumoniae (penicillin-sensitive) and Haemophilus influenzae. Antibiotic regimen adjusted from empiric therapy to targeted treatment.

Mrs. Richardson required ventilator support for 10 days. Multiple spontaneous breathing trials attempted. Successfully extubated on hospital day 11 to high-flow nasal cannula 40L/min, FiO2 50%. Currently on 4L nasal cannula with SpO2 94-96%. Respiratory therapy provides aggressive pulmonary hygiene including chest physiotherapy and incentive spirometry.

INFECTIOUS DISEASE:
Initial empiric antibiotics: Vancomycin 1500mg IV q12h, Piperacillin-Tazobactam 4.5g IV q6h, Azithromycin 500mg IV daily. After culture results, de-escalated to Ceftriaxone 2g IV q24h on hospital day 4. Infectious disease consultant Dr. Rachel Martinez recommended 14-day total course.

Blood cultures from admission grew Streptococcus pneumoniae (2 of 2 bottles). Follow-up cultures on day 3 negative. Patient completed day 12 of antibiotic therapy. Procalcitonin trended down from peak 45 ng/mL to current 0.8 ng/mL. White blood cell count normalized to 8.2 K/μL from admission peak 24.5 K/μL.

CARDIOVASCULAR:
Patient presented in distributive (septic) shock requiring aggressive fluid resuscitation and vasopressor support. Received 6 liters crystalloid in first 24 hours. Central venous catheter placed by Dr. Rodriguez for central venous pressure monitoring and medication delivery.

Norepinephrine infusion initiated at 0.2 mcg/kg/min, titrated to maintain MAP >65 mmHg. Peak vasopressor requirement: Norepinephrine 0.45 mcg/kg/min plus Vasopressin 0.04 units/min. Echocardiography on day 3 revealed hyperdynamic left ventricle with EF 65%, no wall motion abnormalities.

Successfully weaned off all vasopressors by hospital day 7. Current blood pressure stable 118-132/65-78. Heart rate controlled 75-88 bpm (atrial fibrillation with rate control, see below).

CARDIAC RHYTHM:
Developed new-onset atrial fibrillation with rapid ventricular response (HR 145-160) on hospital day 5, likely multifactorial: critical illness, systemic inflammation, electrolyte disturbances. Cardiology consultant Dr. Jennifer Lee evaluated patient Richardson.

Rate control achieved with Metoprolol IV initially, transitioned to Metoprolol 50mg PO BID. Diltiazem added (30mg QID) for additional rate control. CHA2DS2-VASc score 5 (age, female, hypertension, diabetes, prior stroke). Anticoagulation with Apixaban 5mg BID initiated after discussing bleeding risk. Patient remains in atrial fibrillation with adequate rate control, HR 70-85.

RENAL:
Acute kidney injury on admission: creatinine 2.8 mg/dL (baseline 1.1 mg/dL), BUN 48 mg/dL. Prerenal azotemia from septic shock and dehydration. Urine output initially oligouric <20 mL/hour despite fluid resuscitation.

Nephrology consultant Dr. Steven Brooks evaluated. Fortunately, renal function improved with treatment of sepsis and fluid management. Did not require renal replacement therapy. Current creatinine 1.3 mg/dL, trending toward baseline. Urine output adequate 40-60 mL/hour.

ENDOCRINE:
Known history of Type 2 Diabetes Mellitus. Home medications: Metformin 1000mg BID, Glimepiride 4mg daily. Metformin held due to acute illness and renal dysfunction. Glimepiride discontinued.

Managed with intensive insulin therapy during critical illness. Insulin infusion protocol for blood glucose target 140-180 mg/dL. Transitioned to subcutaneous insulin on day 9: Insulin Glargine 24 units at bedtime, Insulin Lispro sliding scale before meals. Blood glucose control improved, range 110-165 mg/dL. Endocrinology consultant Dr. Lisa Anderson will manage diabetes transition to oral agents at discharge.

NEUROLOGIC:
Presented with altered mental status, likely septic encephalopathy. Richmond Agitation-Sedation Scale (RASS) -4 on admission. Required sedation with Propofol and Fentanyl during mechanical ventilation.

Successfully underwent spontaneous awakening trial protocol. Sedation weaned off by day 10. Patient now alert and oriented x3 (person, place, time). No focal neurological deficits. Physical therapy assessing for ICU-acquired weakness. Patient able to follow commands, move all extremities against gravity.

Psychiatry consultant Dr. Mark Thompson evaluated for ICU delirium. Recommended environmental modifications, sleep-wake cycle optimization, early mobilization. No psychotropic medications needed currently.

HEMATOLOGY:
Anemia of chronic disease/critical illness. Hemoglobin nadir 7.8 g/dL on day 6. Transfused 2 units packed red blood cells with appropriate increment. Current hemoglobin 9.2 g/dL, stable. Iron studies consistent with anemia of inflammation. Supplementation with Iron sulfate 325mg daily.

Thrombocytopenia noted (platelet count 89 K/μL) on day 4, likely consumptive from sepsis. Heparin-induced thrombocytopenia (HIT) score low. Platelets recovered to 165 K/μL without intervention.

GASTROINTESTINAL/NUTRITION:
NPO initially due to mechanical ventilation and hemodynamic instability. Enteral nutrition started on day 3 via orogastric tube. Tube feeding: Osmolite 1.5 Cal at goal rate 55 mL/hour providing 1980 calories, 79g protein daily.

Speech pathology consult after extubation. Swallow evaluation revealed mild dysphagia. Advanced to pureed diet with nectar-thick liquids. Tolerating oral intake, supplemented with tube feeding overnight. Nutrition status improving, albumin 2.8 g/dL (from nadir 2.1).

CURRENT MEDICATIONS (Hospital Day 14):
1. Ceftriaxone 2g IV q24h (2 days remaining)
2. Metoprolol 50mg PO BID
3. Diltiazem 30mg PO QID
4. Apixaban 5mg PO BID
5. Insulin Glargine 24 units subcutaneous at bedtime
6. Insulin Lispro per sliding scale AC
7. Pantoprazole 40mg IV daily
8. Docusate 100mg PO BID
9. Senna 8.6mg PO BID
10. Acetaminophen 650mg PO q6h PRN fever
11. Ondansetron 4mg IV q6h PRN nausea

LABORATORY DATA (Current, November 13, 2024):
Complete Blood Count:
- WBC 8.2 K/μL (normal range)
- Hemoglobin 9.2 g/dL (mild anemia)
- Platelets 165 K/μL (normal)

Comprehensive Metabolic Panel:
- Sodium 138 mEq/L
- Potassium 4.1 mEq/L  
- Chloride 102 mEq/L
- Bicarbonate 24 mEq/L
- BUN 22 mg/dL
- Creatinine 1.3 mg/dL (improving)
- Glucose 145 mg/dL
- Calcium 8.6 mg/dL

Liver Function:
- AST 32 U/L
- ALT 28 U/L
- Alkaline phosphatase 88 U/L
- Total bilirubin 0.8 mg/dL
- Albumin 2.8 g/dL

Inflammatory Markers:
- Procalcitonin 0.8 ng/mL (markedly improved)
- C-reactive protein 4.2 mg/dL (decreasing)

VITAL SIGNS (Current):
- Blood Pressure: 122/68 mmHg
- Heart Rate: 78 bpm (irregular)
- Respiratory Rate: 18 breaths/min
- SpO2: 95% on 4L nasal cannula
- Temperature: 98.6°F

PHYSICAL EXAMINATION:
General: Alert, oriented x3, conversing appropriately, appears fatigued
HEENT: Normocephalic, atraumatic, mucous membranes moist
Cardiovascular: Irregularly irregular rhythm, no murmurs
Pulmonary: Bilateral breath sounds, scattered crackles at bases, improved aeration
Abdomen: Soft, non-tender, bowel sounds present
Extremities: Trace lower extremity edema, warm, well-perfused
Neurologic: Cranial nerves II-XII intact, strength 4/5 all extremities
Skin: Central line site clean, no erythema or drainage

ASSESSMENT AND PLAN:

Mrs. Elizabeth Richardson is a 72-year-old female with severe community-acquired pneumonia complicated by septic shock, acute respiratory failure requiring mechanical ventilation, acute kidney injury, and new-onset atrial fibrillation, now significantly improved.

1. PNEUMONIA/SEPSIS - Continue Ceftriaxone through day 14. Monitor clinical improvement. Plan de-escalation to oral antibiotics if continues to improve.

2. RESPIRATORY STATUS - Wean supplemental oxygen as tolerated. Continue aggressive pulmonary toilet and mobilization. Repeat chest X-ray in 2 days.

3. ATRIAL FIBRILLATION - Continue rate control with Metoprolol and Diltiazem. Therapeutic anticoagulation with Apixaban. Outpatient cardiology follow-up arranged.

4. DIABETES MELLITUS - Continue insulin therapy, transition to oral agents when tolerating full diet. Endocrinology follow-up scheduled.

5. NUTRITION - Advance diet as tolerated per speech pathology. Goal: regular diet with thin liquids before discharge.

6. DISPOSITION - Transfer from ICU to progressive care unit (step-down). Target discharge to skilled nursing facility in 3-5 days for continued rehabilitation and recovery.

Dr. Jonathan Mitchell, MD, FCCP
Attending Physician, Medical Intensive Care Unit
Dictated: November 13, 2024, 14:30
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Elizabeth Margaret Richardson'],
          note: 'Patient name appears throughout this extensive note',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surface: 'MRN-445678',
          note: 'Medical record number',
        },
        {
          kind: 'SUBJ',
          label: 'HEALTHCARE_PROVIDER',
          surfaces: [
            'Dr. Jonathan Mitchell',
            'Dr. Sarah Chen',
            'Dr. Michael Rodriguez',
            'Dr. Patricia Thompson',
            'Dr. Kevin Park',
            'Dr. Rachel Martinez',
            'Dr. Jennifer Lee',
            'Dr. Steven Brooks',
            'Dr. Lisa Anderson',
            'Dr. Mark Thompson',
          ],
          minCount: 10,
          note: 'Multiple providers documented in comprehensive note',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          minCount: 25,
          targets: 'both',
          note: 'Extensive clinical events throughout 14-day hospitalization',
        },
        {
          kind: 'PRED',
          label: 'LAB_RESULT',
          minCount: 15,
          targets: 'both',
          note: 'Numerous laboratory results documented',
        },
        {
          kind: 'PRED',
          label: 'PRESCRIPTION_EVENT',
          minCount: 11,
          targets: 'both',
          note: 'Current medication list with 11 medications',
        },
      ]),
    ],
  })
);

