/**
 * Quick start example for the top-down API
 */

import { openai } from '@ai-sdk/openai';
import { createEngine, defineCatalog, type Policy } from '../src';

// 1. Define a catalog
const catalog = defineCatalog({
  subjects: {
    EMAIL: {
      description: 'Email address',
      patterns: [
        String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`,
      ],
    },
    PERSON: {
      description: 'Named human',
      examples: ['John Smith', 'Dr. Lee'],
    },
  },
  predicates: {},
});

// 2. Define policies
const denyEmails: Policy = {
  id: 'deny_emails',
  when: { subjects: ['EMAIL'], minConfidence: 0.9 },
  then: { action: 'DENY' },
};

const tokenizeNames: Policy = {
  id: 'tokenize_names',
  when: { subjects: ['PERSON'] },
  then: { action: 'TOKENIZE' },
};

// 3. Create engine and use it
async function main() {
  const engine = createEngine(catalog, {
    tokenSecret: process.env.TOKEN_KEY ?? 'demo-secret',
    model: openai('gpt-4o-mini'),
  });

  const text = 'John Smith contacted us at john@example.com yesterday.';
  const decisions = await engine.decide('doc1', text, [
    tokenizeNames,
    denyEmails,
  ]);

  console.log('Decisions:');
  for (const d of decisions) {
    console.log(`  - Policy: ${d.policyId}`);
    console.log(`    Decision: ${d.decision}`);
    if (d.textTokenized) {
      console.log(`    Tokenized: ${d.textTokenized}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

