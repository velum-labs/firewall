/**
 * Healthcare Test Case: PHI in Structured Metadata
 * 
 * PHI appearing in JSON/XML metadata fields, not just narrative text.
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

export const healthcarePhiInMetadataCase = registerCase(
  defineCase({
    meta: {
      id: 'healthcare_phi_in_metadata',
      title: 'PHI in Structured Metadata Fields',
      description:
        'PHI appearing in JSON/XML metadata, headers, and structured fields',
      owner: 'healthcare',
      category: 'extended',
      severity: 'critical',
      tags: ['healthcare', 'metadata', 'structured-data', 'tokenize', 'phi'],
      risk: 'PHI in metadata fields often overlooked in redaction processes',
    },
    subjects: [
      healthcareSubjects.PATIENT_IDENTIFIER,
      healthcareSubjects.MRN,
      healthcareSubjects.DATE_OF_BIRTH,
    ],
    predicates: [],
    policies: [healthcarePolicies.pol_healthcare_tokenize_mrn],
    text: `
CLINICAL DATA EXCHANGE MESSAGE
HL7 FHIR Resource - Patient Demographics

JSON Payload:
{
  "resourceType": "Patient",
  "id": "patient-12345",
  "identifier": [
    {
      "system": "http://hospital.org/mrn",
      "value": "MRN-778899"
    }
  ],
  "name": [
    {
      "family": "Thompson",
      "given": ["Michael", "James"],
      "text": "Michael James Thompson"
    }
  ],
  "birthDate": "1965-03-15",
  "gender": "male",
  "address": [
    {
      "line": ["742 Evergreen Terrace"],
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "(555) 234-5678",
      "use": "home"
    }
  ]
}

XML Document Header:
<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument>
  <PatientInfo>
    <MedicalRecordNumber>MRN-334455</MedicalRecordNumber>
    <PatientName>Sarah Elizabeth Williams</PatientName>
    <DOB>1978-08-22</DOB>
    <SSN>123-45-6789</SSN>
  </PatientInfo>
  <EncounterInfo>
    <EncounterID>ENC-2024-001234</EncounterID>
    <AdmitDate>2024-11-10</AdmitDate>
    <DischargeDate>2024-11-13</DischargeDate>
  </EncounterInfo>
</ClinicalDocument>

HTTP Header Metadata:
X-Patient-MRN: MR#556677
X-Patient-Name: Robert Chen
X-Patient-DOB: 01/15/1960
X-Encounter-ID: ENC-2024-998877
Content-Type: application/fhir+json
Authorization: Bearer [token]

Database Export Format (CSV):
patient_id,mrn,last_name,first_name,dob,admission_date
12345,MRN-998877,Anderson,Jennifer,1972-11-30,2024-11-13
67890,MRN-776655,Martinez,Carlos,1985-06-18,2024-11-12

Legacy System Pipe-Delimited:
PATIENT|Medical Record: 445566|LASTNAME:Johnson|FIRSTNAME:Emily|DOB:1990-05-12|ADMISSION:2024-11-11

The above examples demonstrate PHI appearing in various structured formats beyond narrative clinical notes. All metadata fields containing patient identifiers must be properly handled regardless of format or location within the document structure.
    `.trim(),
    expectations: [
      expectTokenizedEntities([
        {
          kind: 'SUBJ',
          label: 'MRN',
          surfaces: [
            'MRN-778899',
            'MRN-334455',
            'MR#556677',
            'MRN-998877',
            'MRN-776655',
            'Medical Record: 445566',
          ],
          note: 'MRNs in JSON, XML, HTTP headers, CSV, and pipe-delimited formats',
        },
        {
          kind: 'SUBJ',
          label: 'PATIENT_IDENTIFIER',
          surfaces: [
            'Michael James Thompson',
            'Sarah Elizabeth Williams',
            'Robert Chen',
            'Jennifer',
            'Carlos',
            'Emily',
          ],
          minCount: 5,
          note: 'Patient names in various metadata structures',
        },
        {
          kind: 'SUBJ',
          label: 'DATE_OF_BIRTH',
          surfaces: [
            '1965-03-15',
            '1978-08-22',
            '01/15/1960',
            '1972-11-30',
            '1985-06-18',
            '1990-05-12',
          ],
          note: 'Dates of birth in multiple formats within structured data',
        },
      ]),
    ],
  })
);

