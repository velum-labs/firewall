/**
 * E2E case: URLs and domain names
 */

import {
  defineCase,
  expectDenial,
  expectDetectionMap,
  registerCase,
} from '../case-registry';
import { policies, subjects } from '../catalog/registry';

export const emailInUrlCase = registerCase(
  defineCase({
    meta: {
      id: 'email_in_url',
      title: 'Email embedded in URL',
      description: 'Should detect emails even when embedded in URLs or text',
      owner: 'firewall',
      category: 'extended',
      severity: 'blocker',
      tags: ['deny', 'email', 'regex'],
    },
    subjects: [subjects.EMAIL],
    predicates: [],
    policies: [policies.pol_deny_email],
    text: 'Visit https://example.com or contact support@example.com for help.',
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

export const multipleEmailsCase = registerCase(
  defineCase({
    meta: {
      id: 'multiple_emails',
      title: 'Multiple email detection',
      description: 'Should detect multiple email addresses',
      owner: 'firewall',
      category: 'extended',
      severity: 'blocker',
      tags: ['deny', 'email', 'multi'],
    },
    subjects: [subjects.EMAIL],
    predicates: [],
    policies: [policies.pol_deny_email],
    text: 'Contact sales@example.com, support@example.com, or info@company.org.',
    expectations: [
      expectDenial(),
      expectDetectionMap({
        subjects: {
          EMAIL: ['sales@example.com', 'support@example.com', 'info@company.org'],
        },
      }),
    ],
  })
);

