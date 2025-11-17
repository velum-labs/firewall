/**
 * Example usage of the top-down API
 */

import { openai } from '@ai-sdk/openai';
import { createEngine } from '../src/engine';
import { catalog } from './catalog';
import { PolIPO, PolNoEmail, PolTokenizeNames } from './policies';

async function main() {
  // Create engine with catalog and token secret
  const engine = createEngine(catalog, {
    tokenSecret: process.env.TOKEN_KEY ?? 'test-secret-key',
    model: openai('gpt-4o-mini'),
    predicatesEnabled: true,
  });

  // Example 1: Tokenize financial events with company mentions
  const text1 =
    'Company X is having an IPO in November. Email us at ir@companyx.com.';

  console.log('Example 1: Financial events + email blocking');
  console.log('Text:', text1);
  console.log('\n');

  const decisions1 = await engine.decide('doc1', text1, [PolIPO, PolNoEmail]);

  for (const decision of decisions1) {
    console.log(`Policy: ${decision.policyId}`);
    console.log(`Decision: ${decision.decision}`);
    console.log(`Confidence: ${decision.confidence}`);
    console.log(`Explanations:`, decision.explanations);
    if (decision.textTokenized) {
      console.log(`Tokenized text: ${decision.textTokenized}`);
      console.log(`Tokens:`, decision.tokens);
    }
    console.log('\n');
  }

  // Example 2: Tokenize person names
  const text2 = 'John Smith and Dr. Sarah Lee met yesterday to discuss the project.';

  console.log('Example 2: Tokenize person names');
  console.log('Text:', text2);
  console.log('\n');

  const decisions2 = await engine.decide('doc2', text2, [PolTokenizeNames]);

  for (const decision of decisions2) {
    console.log(`Policy: ${decision.policyId}`);
    console.log(`Decision: ${decision.decision}`);
    if (decision.textTokenized) {
      console.log(`Tokenized text: ${decision.textTokenized}`);
      console.log(`Tokens:`, decision.tokens);
    }
    console.log('\n');
  }

  // Example 3: Extract only (without decisions)
  const text3 = 'Acme Corp announced a merger with TechVentures Inc.';
  console.log('Example 3: Extraction only');
  console.log('Text:', text3);
  console.log('\n');

  const detections = await engine.extract('doc3', text3, [PolIPO]);
  console.log('Subjects:', detections.subjects);
  console.log('Predicates:', detections.predicates);
  console.log('Sentences:', detections.sentences);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };

