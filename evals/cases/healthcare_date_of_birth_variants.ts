/**
 * Healthcare Test Case: Date of Birth Format Variations
 * 
 * Multiple DOB formats testing HIPAA identifier detection.
 */

import {
  defineCase,
  expectTokenizedEntities,
  registerCase,
} from '../case-registry';
import {
  healthcareSubjects,
  healthcarePolicies,
  healthcarePredicates,
} from '../catalog/healthcare';

export const healthcareDateOfBirthVariantsCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_date_of_birth_variants',
      title: 'Date of Birth Format Variations',
      description:
        'Multiple DOB formats as HIPAA identifiers requiring detection and tokenization',
      owner: 'healthcare',
      category: 'extended',
      severity: 'major',
      tags: ['healthcare', 'dob', 'date', 'hipaa-identifier', 'tokenize'],
      risk: 'DOB is a HIPAA identifier that appears in many formats',
    },
    subjects: [
      healthcareSubjects.DATE_OF_BIRTH,
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
    ],
    predicates: [healthcarePredicates.RESEARCH_PARTICIPATION],
    policies: [
      healthcarePolicies.pol_healthcare_research_deidentify,
      healthcarePolicies.pol_healthcare_high_confidence_phi,
      healthcarePolicies.pol_healthcare_tokenize_dob,
      healthcarePolicies.pol_healthcare_tokenize_patient_identifiers,
    ],
    text: `
PATIENT REGISTRATION VERIFICATION REPORT
Demographics Data Quality Audit

Patient Record 1:
Name: Jennifer Martinez (MRN-112233)
Date of Birth: 01/15/1990
Format: MM/DD/YYYY (US Standard)
Age: 34 years

Patient Record 2:  
Name: Robert Thompson (MRN-223344)
DOB: January 15, 1990
Format: Full Month Name
Age: 34 years

Patient Record 3:
Name: Maria Garcia (MRN-334455)
Birthdate: 1990-01-15
Format: ISO 8601 (YYYY-MM-DD)
Age: 34 years

Patient Record 4:
Name: David Chen (MRN-445566)
DOB: 15-Jan-90
Format: DD-Mon-YY (Abbreviated)
Age: 34 years

Patient Record 5:
Name: Sarah Williams (MRN-556677)
Date of birth: January 15th, 1990
Format: Ordinal Month Day
Age: 34 years

Patient Record 6:
Name: Michael Anderson (MRN-667788)
Born: 1/15/1990
Format: M/DD/YYYY (Variable Digits)
Age: 34 years

Patient Record 7:
Name: Lisa Johnson (MRN-778899)
DOB 15/01/1990
Format: DD/MM/YYYY (European)
Age: 34 years

Patient Record 8:
Name: James Brown (MRN-889900)
Birthdate 01-15-90
Format: MM-DD-YY (Two-digit Year)
Age: 34 years

Patient Record 9:
Name: Patricia Davis (MRN-990011)
Born on: 15th of January, 1990
Format: Ordinal Full Text
Age: 34 years

Patient Record 10:
Name: Christopher Wilson (MRN-101112)
Date of Birth (DOB): 90/01/15
Format: YY/MM/DD
Age: 34 years

Research Participation:
- Participants participated in diabetes study evaluating outcomes for de-identified research datasets.

DATA QUALITY FINDINGS:
All ten patient records contain date of birth information, but in ten different formats. Our health information system must normalize these variations while maintaining accuracy. Per HIPAA Safe Harbor de-identification method, all dates of birth must be redacted or generalized to year only for research datasets.

RECOMMENDATIONS:
1. Standardize DOB entry to ISO 8601 format (YYYY-MM-DD)
2. Implement data validation at point of entry
3. Ensure legacy data migration handles all format variants
4. Apply consistent redaction across all DOB formats for de-identification

Note: All patients listed above are fictional examples for data quality demonstration purposes.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'DATE_OF_BIRTH',
          surfaces: [
            '01/15/1990',
            'January 15, 1990',
            '1990-01-15',
            '15-Jan-90',
            'January 15th, 1990',
            '1/15/1990',
            '15/01/1990',
            '01-15-90',
            'Born on: 15th of January, 1990',
            '90/01/15',
          ],
          minCount: 10,
          note: 'Multiple DOB format variations should all be detected',
        },
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: [
            'Jennifer Martinez',
            'Robert Thompson',
            'Maria Garcia',
            'David Chen',
            'Sarah Williams',
            'Michael Anderson',
            'Lisa Johnson',
            'James Brown',
            'Patricia Davis',
            'Christopher Wilson',
          ],
          note: 'All patient names',
        },
        {
          kind: 'SUBJ',
          label: 'MRN',
          minCount: 10,
          note: 'All MRNs from MRN-112233 through MRN-101112',
        },
      ]),
    ],
  })
);

