/**
 * E2E case: Multiple policies with potential conflicts
 */

import {
  defineCase,
  expectDenial,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const multiplePoliciesConflictCase = registerCase(
  defineCase({
    meta: {
      id: 'multiple_policies_conflict',
      title: 'Policy precedence',
      description:
        'Should apply DENY when multiple policies match (DENY takes precedence)',
      owner: 'firewall',
      category: 'extended',
      severity: 'blocker',
      tags: ['deny', 'precedence', 'email'],
    },
    subjects: [subjects.PERSON, subjects.EMAIL],
    predicates: [],
    policies: [policies.pol_tokenize_person, policies.pol_deny_email],
    text: 'Contact John Smith at john.smith@example.com for details.',
    expectations: [
      expectDenial('pol_deny_email'),
      expectDetectionMap({
        subjects: {
          EMAIL: ['john.smith@example.com'],
        },
      }),
    ],
  })
);

