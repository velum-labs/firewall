/**
 * Healthcare Test Case: MRN Format Variations
 * 
 * Multiple Medical Record Number formats testing regex pattern flexibility.
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePolicies,
} from '../catalog/healthcare';

export const healthcareMrnVariantsCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_mrn_variants',
      title: 'Medical Record Number Format Variations',
      description:
        'Multiple MRN formats to test regex pattern flexibility and fast-path detection',
      owner: 'healthcare',
      category: 'extended',
      severity: 'major',
      tags: ['healthcare', 'mrn', 'patterns', 'regex', 'tokenize'],
      risk: 'Failure to detect all MRN formats may leak patient identifiers',
    },
    subjects: [healthcareSubjects.MRN, healthcareSubjects.PATIENT_IDENTIFIER],
    predicates: [],
    policies: [healthcarePolicies.pol_healthcare_tokenize_mrn],
    text: `
PATIENT RECORD MIGRATION REPORT
Hospital Information System Upgrade - Legacy Data Conversion

Our health system is consolidating records from four acquired facilities, each using different medical record number formats. The following patient identifiers have been mapped to our new unified system:

FORMAT 1 - HYPHENATED PREFIX:
- MRN-123456 (St. Mary's Hospital legacy format)
- MRN-987654 (transferred from St. Mary's)
- MRN-445567 (St. Mary's cardiology patient)

FORMAT 2 - HASH SYMBOL PREFIX:
- MR#789012 (Community General legacy format)
- MR#345678 (Community General ER patient)
- MR#901234 (transferred from Community General)

FORMAT 3 - TEXT LABEL WITH COLON:
- Medical Record: 456789 (Valley Health System format)
- Med Rec: 234567 (Valley Health abbreviated)
- Medical Record: 890123 (Valley Health oncology)

FORMAT 4 - EMR PREFIX:
- EMR:567890 (Regional Medical Center electronic format)
- EMR:123789 (Regional Medical Center)
- EMR:778899 (Regional Medical pediatrics)

FORMAT 5 - PATIENT ID VARIATIONS:
- Patient ID: P-998877 (alternate identifier)
- Medical Record Number: 665544 (full text format)
- MRN: 334422 (space-separated prefix)

CONVERSION CHALLENGES:
All 15 unique identifier formats above must be correctly migrated to our new unified system using format: HIS-XXXXXXXXX. Legacy references in clinical notes, lab reports, and imaging studies need to maintain cross-reference capability.

Data validation confirmed all formats successfully parsed and mapped. Patient privacy maintained throughout migration with tokenized intermediate storage.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: [
            'MRN-123456',
            'MRN-987654',
            'MRN-445567',
            'MR#789012',
            'MR#345678',
            'MR#901234',
            'Medical Record: 456789',
            'Med Rec: 234567',
            'Medical Record: 890123',
            'EMR:567890',
            'EMR:123789',
            'EMR:778899',
          ],
          note: 'All MRN format variations should be detected by regex patterns',
        },
      ]),
    ],
  })
);

