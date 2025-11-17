import { openai } from '@ai-sdk/openai';
import { generateText, wrapLanguageModel } from 'ai';
import 'dotenv/config';
import { createFirewallMiddleware, FirewallDeniedError } from '../src';
import type { Policy } from '../src/policy';
import { catalog } from './catalog';

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === 'object' && input !== null;

const extractFirewallMetadata = (value: unknown) => {
  if (!isRecord(value)) {
    return undefined;
  }
  const providerMetadata = value.experimental_providerMetadata;
  if (!isRecord(providerMetadata)) {
    return undefined;
  }
  return providerMetadata.firewall;
};

const resolveProcessEnv = (): Record<string, string | undefined> => {
  const scope: unknown = globalThis;
  if (!isRecord(scope)) {
    return {};
  }
  const maybeProcess = scope.process;
  if (!isRecord(maybeProcess)) {
    return {};
  }
  const env = maybeProcess.env;
  if (!isRecord(env)) {
    return {};
  }
  return env as Record<string, string | undefined>;
};

const processEnv = resolveProcessEnv();

const PolNoEmail: Policy = {
  id: 'pol_deny_emails',
  nl: 'Block any document containing email addresses.',
  when: {
    subjects: ['EMAIL'],
    minConfidence: 0.9,
  },
  then: { action: 'DENY' },
};

async function exampleDeny() {
  console.log('\n=== Example 1: DENY Policy ===\n');

  const firewallMiddleware = createFirewallMiddleware(catalog, [PolNoEmail], {
    tokenSecret: processEnv.TOKEN_KEY || 'demo-secret-key',
    model: openai('gpt-4o-mini'),
  });

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  try {
    console.log('Test 1: Text without email...');
    const result = await generateText({
      model,
      prompt: 'Write a short sentence about company policies.',
    });
    console.log('✓ Passed:', result.text);
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('✗ Denied by policy:', error.policyId);
    } else {
      console.error('✗ Error:', error);
    }
  }

  try {
    console.log('\nTest 2: Text with email...');
    const result = await generateText({
      model,
      prompt: 'Write a sentence with this email: contact@example.com',
    });
    console.log('✓ Passed:', result.text);
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('✗ Denied by policy:', error.policyId);
      console.log('  Decisions:', error.decisions.map(d => ({ policy: d.policyId, decision: d.decision })));
    } else {
      console.error('✗ Error:', error);
    }
  }
}

const PolTokenizeNames: Policy = {
  id: 'pol_tokenize_person',
  nl: 'Tokenize personal names.',
  when: {
    subjects: ['PERSON'],
  },
  then: { action: 'TOKENIZE', targets: 'subjects' },
};

async function exampleTokenize() {
  console.log('\n=== Example 2: TOKENIZE Policy ===\n');

  const firewallMiddleware = createFirewallMiddleware(
    catalog,
    [PolTokenizeNames],
    {
      tokenSecret: processEnv.TOKEN_KEY || 'demo-secret-key',
      model: openai('gpt-4o-mini'),
    }
  );

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  try {
    console.log('Generating text with person name...');
    const result = await generateText({
      model,
      prompt: 'Write a sentence about a person named Alice Johnson.',
    });
    console.log('Original response (would contain name)');
    console.log('Tokenized response:', result.text);
    const metadata = extractFirewallMetadata(result);
    if (metadata !== undefined) {
      console.log('\nFirewall metadata:', metadata);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const PolIPO: Policy = {
  id: 'pol_fin_event_tokenize',
  nl: 'Tokenize financial events related to companies.',
  when: {
    predicate: 'FINANCIAL_EVENT',
    bind: {
      subjects: ['COMPANY'],
      proximity: 'sentence',
      cardinality: '>=1',
    },
  },
  then: { action: 'TOKENIZE', targets: 'both' },
};

async function exampleMultiplePolicies() {
  console.log('\n=== Example 3: Multiple Policies ===\n');

  const firewallMiddleware = createFirewallMiddleware(
    catalog,
    [PolNoEmail, PolTokenizeNames, PolIPO],
    {
      tokenSecret: processEnv.TOKEN_KEY || 'demo-secret-key',
      model: openai('gpt-4o-mini'),
    }
  );

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  try {
    console.log('Test 1: Text with person name and company IPO...');
    const result = await generateText({
      model,
      prompt: 'Write about John Smith and Acme Corp filing for an IPO.',
    });
    console.log('Tokenized response:', result.text);
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('✗ Denied by policy:', error.policyId);
    } else {
      console.error('✗ Error:', error);
    }
  }

  try {
    console.log('\nTest 2: Text with email (should be denied)...');
    const result = await generateText({
      model,
      prompt: 'Write a sentence with this email: john@acme.com',
    });
    console.log('Response:', result.text);
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('✗ Denied by policy:', error.policyId);
    } else {
      console.error('✗ Error:', error);
    }
  }
}

async function main() {
  console.log('Vercel AI SDK Firewall Middleware - Basic Examples');
  console.log('===================================================');

  await exampleDeny();
  await exampleTokenize();
  await exampleMultiplePolicies();

  console.log('\n===================================================');
  console.log('Examples complete!');
}

main().catch(console.error);

