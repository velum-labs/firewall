/**
 * E2E case: Deny documents containing email addresses
 */

import {
  defineCase,
  expectDenial,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const denyEmailCase = registerCase(
  defineCase({
    meta: {
      id: 'deny_email',
      title: 'Email denial via regex fast-path',
      description:
        'Should deny documents containing email addresses using regex fast-path',
      owner: 'firewall',
      category: 'core',
      severity: 'blocker',
      tags: ['deny', 'email', 'regex'],
    },
    subjects: [subjects.EMAIL],
    predicates: [],
    policies: [policies.pol_deny_email],
    text: 'Contact us at support@example.com for assistance.',
    expectations: [
      expectDenial(),
      expectDetectionMap({
        subjects: {
          EMAIL: ['support@example.com'],
        },
      }),
    ],
  })
);

