/**
 * Streaming examples for Vercel AI SDK middleware
 *
 * Run with:
 *   OPENAI_API_KEY=xxx pnpm tsx examples/vercel-ai-streaming.ts
 */

import { openai } from '@ai-sdk/openai';
import { streamText, wrapLanguageModel } from 'ai';
import 'dotenv/config';
import { createFirewallMiddleware, FirewallDeniedError } from '../src';
import type { Policy } from '../src/policy';
import { catalog } from './catalog';

// ============================================================================
// Example 1: Streaming with TOKENIZE policy
// ============================================================================

const PolTokenizeNames: Policy = {
  id: 'pol_tokenize_person',
  nl: 'Tokenize personal names.',
  when: {
    subjects: ['PERSON'],
  },
  then: { action: 'TOKENIZE', targets: 'subjects' },
};

async function exampleStreamingTokenize() {
  console.log('\n=== Example 1: Streaming with TOKENIZE ===\n');

  const firewallMiddleware = createFirewallMiddleware(
    catalog,
    [PolTokenizeNames],
    {
      tokenSecret: process.env.TOKEN_KEY || 'demo-secret-key',
      model: openai('gpt-4o-mini'),
    }
  );

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  try {
    console.log('Streaming text with person names...');
    const result = streamText({
      model,
      prompt: 'Write three sentences about Alice Johnson, Bob Smith, and Carol Davis.',
    });

    console.log('\nStreamed output:');
    console.log('(Note: Firewall validation happens after streaming completes)\n');

    // Stream the text as it arrives
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log('\n\nFinal text:', await result.text);
    console.log('Usage:', await result.usage);
    console.log('Finish reason:', await result.finishReason);

    console.log('\nNote: In streaming mode, the firewall validates after the stream completes.');
    console.log('For real-time filtering, consider using non-streaming generateText instead.');
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('✗ Denied by policy:', error.policyId);
    } else {
      console.error('✗ Error:', error);
    }
  }
}

// ============================================================================
// Example 2: Streaming with DENY policy
// ============================================================================

const PolNoEmail: Policy = {
  id: 'pol_deny_emails',
  nl: 'Block any document containing email addresses.',
  when: {
    subjects: ['EMAIL'],
    minConfidence: 0.9,
  },
  then: { action: 'DENY' },
};

async function exampleStreamingDeny() {
  console.log('\n=== Example 2: Streaming with DENY Policy ===\n');

  const firewallMiddleware = createFirewallMiddleware(
    catalog,
    [PolNoEmail],
    {
      tokenSecret: process.env.TOKEN_KEY || 'demo-secret-key',
      model: openai('gpt-4o-mini'),
    }
  );

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  // Test 1: Clean text (should stream successfully)
  try {
    console.log('Test 1: Streaming clean text...');
    const result = streamText({
      model,
      prompt: 'Write a short paragraph about company policies.',
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log('\n✓ Stream completed successfully\n');
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('\n✗ Denied by policy:', error.policyId);
    } else {
      console.error('\n✗ Error:', error);
    }
  }

  // Test 2: Text with email (should stream but throw after completion)
  try {
    console.log('Test 2: Streaming text with email...');
    const result = streamText({
      model,
      prompt: 'Write a sentence and include the email contact@example.com',
    });

    console.log('(Streaming...)');
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    // The firewall check happens after the stream completes
    console.log('\n✓ Stream completed (firewall validation pending)');
    
    // Force finalization to trigger firewall check
    await result.text;
    
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      console.log('\n✗ Denied by policy after streaming:', error.policyId);
      console.log('  Note: Content was already streamed to client');
      console.log('  Consider using non-streaming mode for DENY policies');
    } else {
      console.error('\n✗ Error:', error);
    }
  }
}

// ============================================================================
// Example 3: Streaming with financial event tokenization
// ============================================================================

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

async function exampleStreamingFinancial() {
  console.log('\n=== Example 3: Streaming with Financial Event TOKENIZE ===\n');

  const firewallMiddleware = createFirewallMiddleware(
    catalog,
    [PolIPO],
    {
      tokenSecret: process.env.TOKEN_KEY || 'demo-secret-key',
      model: openai('gpt-4o-mini'),
    }
  );

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  try {
    console.log('Streaming text about company IPO...');
    const result = streamText({
      model,
      prompt: 'Write a short news snippet about Acme Corp filing for an IPO.',
    });

    console.log('\nStreaming output:');
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log('\n');
    const finalText = await result.text;
    console.log('\nNote: Tokenization would be applied to final text');
    console.log('(Streaming mode limitation: tokens applied post-stream)');
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Example 4: Practical streaming pattern
// ============================================================================

async function examplePracticalStreaming() {
  console.log('\n=== Example 4: Practical Streaming Pattern ===\n');
  console.log('Best practice: Use ALLOW policies for logging during streaming');
  console.log('Use non-streaming mode for DENY/TOKENIZE policies\n');

  const PolAllowAll: Policy = {
    id: 'pol_allow_all',
    nl: 'Allow all content for logging purposes.',
    when: {
      subjects: ['PERSON', 'COMPANY'],
      minConfidence: 0.5,
    },
    then: { action: 'ALLOW' },
  };

  const firewallMiddleware = createFirewallMiddleware(
    catalog,
    [PolAllowAll],
    {
      tokenSecret: process.env.TOKEN_KEY || 'demo-secret-key',
      model: openai('gpt-4o-mini'),
    }
  );

  const model = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: firewallMiddleware,
  });

  try {
    console.log('Streaming with ALLOW policy (for logging)...');
    const result = streamText({
      model,
      prompt: 'Write about John Doe working at Acme Corp.',
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log('\n\n✓ Streaming completed with logging');
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Run all examples
// ============================================================================

async function main() {
  console.log('Vercel AI SDK Firewall Middleware - Streaming Examples');
  console.log('=======================================================');

  await exampleStreamingTokenize();
  await exampleStreamingDeny();
  await exampleStreamingFinancial();
  await examplePracticalStreaming();

  console.log('\n=======================================================');
  console.log('Streaming examples complete!');
  console.log('\nKey Takeaways:');
  console.log('- Firewall validation happens AFTER streaming completes');
  console.log('- For DENY policies, use non-streaming generateText()');
  console.log('- For TOKENIZE, consider non-streaming for real-time redaction');
  console.log('- Use ALLOW policies for logging/monitoring during streaming');
}

main().catch(console.error);

