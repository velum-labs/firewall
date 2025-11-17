/**
 * Healthcare Test Case: Emergency Room Admission
 * 
 * ER admission with rapid-fire clinical events and multiple identifiers.
 * Tests consecutive entity detection and overlapping spans in compressed timeline.
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

export const healthcareEmergencyRoomCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_emergency_room',
      title: 'Emergency Room Triage and Treatment Documentation',
      description:
        'ER admission with rapid clinical events, multiple providers, and overlapping temporal sequences',
      owner: 'healthcare',
      category: 'core',
      severity: 'major',
      tags: ['healthcare', 'emergency', 'clinical-event', 'tokenize', 'consecutive'],
      risk: 'High-volume PHI in emergency documentation requires careful handling',
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
EMERGENCY DEPARTMENT RECORD
County General Hospital Emergency Department
Patient Arrival: November 13, 2024 18:45

PATIENT IDENTIFICATION:
Name: Christopher Hayes
MRN-923745
Age: 67 years
Arrival Mode: Ambulance - Code 3 (Lights and Sirens)

18:45 - TRIAGE (Nurse Angela Martinez, RN):
Chief Complaint: "Crushing chest pain and can't breathe"
Vital Signs: BP 168/94, HR 112 irregular, RR 24, SpO2 88% on room air, Temp 98.4°F
Pain Score: 9/10 substernal chest pressure
Immediate Actions: Patient placed on continuous cardiac monitoring, oxygen 4L via nasal cannula, two large-bore IV access established

18:48 - RAPID ASSESSMENT (Dr. Michael Stewart, Emergency Medicine):
Patient Mr. Hayes reports sudden onset severe chest pain starting 2 hours ago while watching television. Pain radiates to left arm and jaw. Associated with shortness of breath, diaphoresis, and nausea. Denies recent trauma or similar episodes. Past medical history significant for hypertension and hyperlipidemia, both poorly controlled per patient report.

18:50 - STAT ORDERS PLACED:
- 12-lead EKG (Priority: STAT)
- Cardiac enzyme panel: Troponin I, CK-MB, BNP
- Complete metabolic panel, CBC
- Chest X-ray portable
- Aspirin 324mg chewed immediately
- Nitroglycerin 0.4mg sublingual for chest pain
- Morphine 4mg IV for pain management

18:52 - EKG INTERPRETATION (Dr. Stewart):
Acute ST-segment elevation in leads II, III, aVF consistent with INFERIOR WALL STEMI (ST-Elevation Myocardial Infarction). Cardiology consult activated immediately. Patient meets criteria for emergent cardiac catheterization.

18:55 - MEDICATION ADMINISTRATION (Nurse Carlos Rodriguez, RN):
Administered: Aspirin 324mg PO (chewed), Nitroglycerin 0.4mg SL, Atorvastatin 80mg PO loading dose, Clopidogrel 600mg PO loading dose, Heparin 60 units/kg IV bolus followed by infusion. Patient's chest pain decreased from 9/10 to 6/10 after nitroglycerin.

19:00 - CARDIOLOGY CONSULT (Dr. Jennifer Park, Interventional Cardiology):
Reviewed EKG, examined patient Christopher Hayes. Clear STEMI presentation, patient hemodynamically stable but requires urgent intervention. Consent obtained from patient for emergency cardiac catheterization and possible percutaneous coronary intervention (PCI). Explained risks, benefits, alternatives. Family contacted - wife Maria Hayes notified, en route to hospital.

19:05 - INITIAL LAB RESULTS:
Troponin I: 2.4 ng/mL (CRITICAL - significantly elevated)
BNP: 580 pg/mL (elevated)  
Creatinine: 1.1 mg/dL (within normal limits)
Hemoglobin: 14.2 g/dL
Platelet count: 245,000/μL
INR: 1.0

19:10 - TRANSFER TO CARDIAC CATHETERIZATION LAB:
Patient transported by Dr. Park's team to cath lab. Pre-procedure checklist completed. Nurse Martinez accompanied patient, continuous monitoring maintained. Vital signs stable: BP 142/86, HR 98, SpO2 96% on 4L O2.

19:25 - CARDIAC CATHETERIZATION FINDINGS (Dr. Park):
Right coronary artery with 95% occlusion - culprit lesion identified. Drug-eluting stent successfully deployed, achieving TIMI 3 flow restoration. Left anterior descending artery shows 40% stenosis (non-critical). Circumflex artery patent. Patient tolerated procedure well.

20:15 - POST-PROCEDURE TRANSFER TO CCU:
Mr. Hayes transferred to Coronary Care Unit in stable condition. Chest pain completely resolved (0/10). Groin access site hemostasis achieved with closure device. Post-PCI medications prescribed: Aspirin 81mg daily, Clopidogrel 75mg daily, Atorvastatin 80mg nightly, Metoprolol 25mg twice daily, Lisinopril 10mg daily.

20:30 - CCU ADMISSION NOTE (Dr. Rachel Thompson, Cardiology Fellow):
Patient Christopher Hayes admitted to CCU following successful primary PCI for inferior STEMI. Currently pain-free, hemodynamically stable. Will continue telemetry monitoring, serial cardiac enzymes, and strict bed rest for 6 hours post-procedure. Family at bedside. Prognosis discussed with patient and wife - excellent outcome expected given prompt intervention and complete revascularization.

EMERGENCY DEPARTMENT DISPOSITION:
Admitted to CCU under care of Dr. Park
Total ED Time: 1 hour 45 minutes (Door-to-Balloon time: 40 minutes - EXCELLENT)
Diagnosis: Acute Inferior Wall ST-Elevation Myocardial Infarction, status post PCI with DES to RCA

Dr. Michael Stewart, MD - Emergency Medicine Attending
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Christopher Hayes'],
          note: 'Patient name appears multiple times throughout emergency record',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surface: 'MRN-923745',
          note: 'Medical record number',
        },
        {
          kind: 'SUBJ',
          label: 'HEALTHCARE_PROVIDER',
          surfaces: [
            'Nurse Angela Martinez',
            'Dr. Michael Stewart',
            'Nurse Carlos Rodriguez',
            'Dr. Jennifer Park',
            'Dr. Rachel Thompson',
          ],
          minCount: 5,
          note: 'Multiple providers involved in emergency care',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          minCount: 10,
          targets: 'both',
          note: 'Numerous rapid clinical events: triage, assessment, procedures',
        },
        {
          kind: 'PRED',
          label: 'LAB_RESULT',
          minCount: 5,
          targets: 'both',
          note: 'Multiple lab results throughout emergency care',
        },
        {
          kind: 'PRED',
          label: 'PRESCRIPTION_EVENT',
          minCount: 8,
          targets: 'both',
          note: 'Multiple medications administered and prescribed',
        },
      ]),
    ],
  })
);

