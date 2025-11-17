/**
 * Healthcare Test Case: Mixed Medical and Non-Medical Context
 * 
 * Document mixing patient care with non-clinical content.
 * Tests context-aware selective tokenization.
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

export const healthcareMixedContextCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_mixed_context',
      title: 'Mixed Clinical and Non-Clinical Context',
      description:
        'Document mixing patient care with hospital administration and medical news',
      owner: 'healthcare',
      category: 'extended',
      severity: 'critical',
      tags: ['healthcare', 'context-awareness', 'selective', 'tokenize'],
      risk: 'Over-tokenization may redact non-PHI content inappropriately',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.HEALTHCARE_PROVIDER,
      healthcareSubjects.DIAGNOSIS,
    ],
    predicates: [healthcarePredicates.CLINICAL_EVENT],
    policies: [
      healthcarePolicies.pol_healthcare_tokenize_clinical_events,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
    ],
    text: `
HOSPITAL NEWSLETTER - November 2024 Edition
Memorial Medical Center Monthly Digest

CLINICAL CASE OF THE MONTH

Dr. Sarah Mitchell treated patient Jennifer Anderson (MRN-445123) for acute appendicitis in our emergency department last week. Ms. Anderson presented with right lower quadrant pain and underwent successful laparoscopic appendectomy by Dr. Mitchell. Patient Anderson recovered well and was discharged on hospital day 2.

This case exemplifies our commitment to excellent surgical care and rapid patient recovery protocols.

---

ADMINISTRATIVE ANNOUNCEMENTS

Dr. Sarah Mitchell Appointed Department Chair

We are pleased to announce that Dr. Sarah Mitchell has been appointed as the new Chair of the Department of Surgery, effective December 1, 2024. Dr. Mitchell brings 15 years of clinical experience and exceptional leadership to this role.

Dr. Mitchell stated, "I'm honored to serve in this capacity and look forward to advancing our surgical programs." She succeeds Dr. Robert Thompson, who is retiring after 20 years of distinguished service.

The hospital board voted unanimously to approve Dr. Mitchell's appointment. Dr. Mitchell will continue her clinical practice while assuming administrative responsibilities.

---

MEDICAL NEWS ROUNDUP

Breakthrough in Diabetes Treatment

Dr. Jennifer Chen, an endocrinologist not affiliated with our institution, published groundbreaking research in the New England Journal of Medicine this month. Dr. Chen's study of 5,000 patients with Type 2 Diabetes showed that early intensive therapy reduces cardiovascular complications by 35%.

The research, conducted at University Hospital, represents a major advance in diabetes care. Dr. Chen commented that "this will change how we approach newly diagnosed patients."

Our own endocrinology department, led by Dr. Michael Rodriguez, is implementing these evidence-based protocols. Dr. Rodriguez attended the conference where Dr. Chen presented her findings and was impressed by the robust methodology.

---

QUALITY IMPROVEMENT SUCCESS

Patient Safety Initiative Reduces Falls

Our nursing quality team, directed by Amanda Williams, RN, BSN, has achieved a 40% reduction in patient falls over the past six months. The initiative involved comprehensive staff training and environmental modifications.

"Patient safety is our top priority," said Williams. "Every member of our team contributed to this success." The program will be expanded hospital-wide based on these excellent results.

---

RECENT PATIENT OUTCOMES

Cardiac Surgery Program Milestone

Dr. James Park performed his 1,000th coronary artery bypass surgery last month. Patient Michael Stevens (MRN-778234), a 68-year-old male with three-vessel coronary disease, underwent successful triple bypass grafting by Dr. Park on October 28th.

Mr. Stevens' recovery was uncomplicated, and he participated in our cardiac rehabilitation program. Patient Stevens expressed gratitude: "Dr. Park and his team gave me a second chance at life."

This milestone reflects Dr. Park's expertise and our program's commitment to cardiac surgical excellence. Dr. Park has been with Memorial Medical Center since 2010 and maintains outstanding patient outcomes.

---

CONTINUING MEDICAL EDUCATION

Dr. Lisa Anderson, chief of internal medicine, will present grand rounds next Tuesday on "Advances in Heart Failure Management." Dr. Anderson recently returned from the American College of Cardiology conference where she learned about novel therapies.

All staff are invited to attend Dr. Anderson's presentation in the main auditorium at noon. Lunch will be provided, and CME credits are available.

---

COMMUNITY OUTREACH

Free Health Screening Event

Our community health team conducted free diabetes and hypertension screening at the downtown community center last Saturday. Over 200 community members participated.

Registered Nurse Carlos Martinez, who coordinated the event, reported several participants were referred for follow-up care based on abnormal screening results. "These events save lives by identifying undiagnosed conditions," Martinez explained.

The hospital will sponsor monthly community health events. For more information, contact Carlos Martinez at cmartinez@memorialhospital.org.

---

EMPLOYEE RECOGNITION

Nurse of the Month: Angela Thompson, RN

Angela Thompson has been selected as November's Nurse of the Month for her exceptional patient care in the intensive care unit. Thompson has worked at Memorial for 12 years and consistently receives outstanding patient satisfaction scores.

"Angela represents the very best of nursing," said ICU director Dr. Patricia Williams. Thompson will receive a $500 bonus and reserved parking for one month.

Congratulations to Angela Thompson on this well-deserved recognition!
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: ['Jennifer Anderson', 'Michael Stevens'],
          note: 'Only actual patient names in clinical context, not staff mentioned elsewhere',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: ['MRN-445123', 'MRN-778234'],
          note: 'Medical record numbers for actual patients',
        },
        {
          kind: 'PRED',
          label: 'CLINICAL_EVENT',
          surfaces: [
            'treated patient Jennifer Anderson',
            'underwent successful laparoscopic appendectomy',
            'underwent successful triple bypass grafting',
          ],
          minCount: 2,
          targets: 'both',
          note: 'Only clinical events involving actual patients',
        },
      ]),
      allowUnchangedRegion([
        'Dr. Sarah Mitchell has been appointed',
        'Dr. Sarah Mitchell stated',
        'Dr. Mitchell brings 15 years',
        'Dr. Chen commented',
        'directed by Amanda Williams',
        'Dr. Park has been with',
        'Dr. Lisa Anderson, chief of internal medicine',
        'Nurse Angela Thompson',
      ]),
    ],
  })
);

