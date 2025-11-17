/**
 * Healthcare Test Case: False Positive Avoidance - General Medical Content
 * 
 * Medical textbook/encyclopedia content without actual patient data.
 * Should NOT trigger PHI policies - tests context awareness.
 */

import {
  defineCase,
  expectAllow,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePredicates,
  healthcarePolicies,
} from '../catalog/healthcare';

export const healthcareFalsePositiveMedicalTermsCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_false_positive_medical_terms',
      title: 'False Positive Avoidance - General Medical Discussion',
      description:
        'Medical textbook content without patient data, should not trigger PHI detection',
      owner: 'healthcare',
      category: 'adversarial',
      severity: 'critical',
      tags: ['healthcare', 'false-positive', 'allow', 'context-awareness'],
      risk: 'Over-sensitive detection could block legitimate medical education content',
    },
    subjects: [
      healthcareSubjects.DIAGNOSIS,
      healthcareSubjects.MEDICATION,
      healthcareSubjects.HEALTHCARE_PROVIDER,
    ],
    predicates: [healthcarePredicates.CLINICAL_EVENT],
    policies: [
      healthcarePolicies.pol_healthcare_allow_public_health,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
    ],
    text: `
MEDICAL ENCYCLOPEDIA ENTRY: Type 2 Diabetes Mellitus

DEFINITION:
Type 2 Diabetes Mellitus is a chronic metabolic disorder characterized by insulin resistance and relative insulin deficiency. Unlike Type 1 diabetes, patients with Type 2 typically retain some insulin production capacity. The condition affects approximately 10% of the global population and represents a major public health challenge.

PATHOPHYSIOLOGY:
In Type 2 Diabetes, peripheral tissues become resistant to insulin signaling, requiring the pancreatic beta cells to produce increasing amounts of insulin. Over time, beta cell function declines, leading to progressive hyperglycemia. Key mechanisms include:
- Impaired insulin receptor substrate (IRS) signaling
- Decreased GLUT4 transporter expression in muscle and adipose tissue
- Increased hepatic gluconeogenesis
- Beta cell dysfunction and apoptosis

CLINICAL PRESENTATION:
Patients typically present with polyuria, polydipsia, and polyphagia. Some individuals remain asymptomatic and are diagnosed through routine screening. Diagnosis requires fasting plasma glucose ≥126 mg/dL, HbA1c ≥6.5%, or 2-hour glucose ≥200 mg/dL during oral glucose tolerance test.

TREATMENT APPROACHES:
First-line therapy includes lifestyle modifications (diet and exercise) combined with pharmacotherapy. Common medication classes include:

1. Metformin: Decreases hepatic glucose production, improves insulin sensitivity. Typical dosing is 500-2000mg daily divided into 1-2 doses. Contraindicated in severe renal impairment (eGFR <30 mL/min).

2. Sulfonylureas (Glimepiride, Glyburide): Stimulate insulin secretion from pancreatic beta cells. Risk of hypoglycemia, particularly in elderly patients.

3. DPP-4 Inhibitors (Sitagliptin, Linagliptin): Increase incretin levels, enhance glucose-dependent insulin secretion. Weight-neutral with low hypoglycemia risk.

4. GLP-1 Receptor Agonists (Dulaglutide, Semaglutide): Injectable medications that enhance insulin secretion, suppress glucagon, slow gastric emptying. Promote weight loss.

5. SGLT2 Inhibitors (Empagliflozin, Dapagliflozin): Increase renal glucose excretion. Cardiovascular and renal benefits demonstrated in clinical trials.

6. Insulin Therapy: Reserved for patients with inadequate glycemic control on oral agents. Options include basal insulin (Glargine, Detemir), prandial insulin (Lispro, Aspart), and premixed formulations.

COMPLICATIONS:
Chronic hyperglycemia leads to microvascular complications (retinopathy, nephropathy, neuropathy) and macrovascular disease (coronary artery disease, stroke, peripheral arterial disease). The UK Prospective Diabetes Study (UKPDS) demonstrated that intensive glycemic control reduces microvascular complications by 25%.

MONITORING:
Physicians should monitor HbA1c every 3 months in patients not at glycemic goal, every 6 months when stable. Annual screening for diabetic retinopathy, nephropathy (urine albumin-to-creatinine ratio), and neuropathy (monofilament foot exam) is recommended. Cardiovascular risk assessment includes lipid panel and blood pressure monitoring.

PROGNOSIS:
With appropriate management, patients with Type 2 Diabetes can achieve good glycemic control and reduce complication risk. However, the disease is progressive, and many individuals eventually require combination therapy or insulin. Lifestyle modification remains crucial throughout disease course.

RECENT ADVANCES:
Novel therapies under investigation include dual GLP-1/GIP receptor agonists (Tirzepatide) and glucagon receptor antagonists. Closed-loop insulin delivery systems and continuous glucose monitoring technology continue improving diabetes management.

This medical reference material is intended for healthcare professional education and does not constitute patient-specific medical advice. Physicians should individualize treatment based on patient characteristics, comorbidities, and preferences.
    `.trim(),
    expectations: [
      expectAllow(),
    ],
  })
);

