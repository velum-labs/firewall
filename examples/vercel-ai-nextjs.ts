/**
 * Next.js API route example with Vercel AI SDK firewall middleware
 *
 * This file demonstrates how to integrate the firewall middleware
 * into a Next.js application with API routes.
 *
 * Usage:
 * 1. Copy this file to your Next.js app/api/chat/route.ts
 * 2. Install dependencies: pnpm add @velum/firewall
 * 3. Set environment variables: OPENAI_API_KEY, TOKEN_KEY
 * 4. Use with AI SDK's useChat hook on the frontend
 */

import { openai } from '@ai-sdk/openai';
import { streamText, wrapLanguageModel, tool } from 'ai';
import { z } from 'zod';
import { createFirewallMiddleware, FirewallDeniedError } from '@velum/firewall';
import type { Policy, Catalog } from '@velum/firewall';

// ============================================================================
// Define your catalog
// ============================================================================

const catalog: Catalog = {
  subjects: {
    PERSON: {
      description: 'Named human',
      examples: ['John', 'Dr. Lee'],
    },
    COMPANY: {
      description: 'Business or fund name',
      examples: ['Acme Capital'],
    },
    EMAIL: {
      description: 'Email address',
      patterns: [String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`],
    },
    SSN: {
      description: 'Social Security Number',
      patterns: [String.raw`\b\d{3}-\d{2}-\d{4}\b`],
    },
  },
  predicates: {
    FINANCIAL_EVENT: {
      definition: 'Corporate finance events (IPO, merger, acquisition).',
      examples: ['filed for IPO', 'announced acquisition of'],
      relatedSubjects: ['COMPANY'],
    },
  },
};

// ============================================================================
// Define your policies
// ============================================================================

const policies: Policy[] = [
  // Block emails and SSNs (PII protection)
  {
    id: 'pol_deny_pii',
    nl: 'Block any response containing emails or SSNs.',
    when: {
      subjects: ['EMAIL', 'SSN'],
      minConfidence: 0.9,
    },
    then: { action: 'DENY' },
  },
  
  // Tokenize person names (privacy protection)
  {
    id: 'pol_tokenize_person',
    nl: 'Tokenize personal names in responses.',
    when: {
      subjects: ['PERSON'],
      minConfidence: 0.8,
    },
    then: { action: 'TOKENIZE', targets: 'subjects' },
  },
  
  // Tokenize financial events (confidentiality)
  {
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
  },
];

// ============================================================================
// Create the firewall middleware
// ============================================================================

const firewallMiddleware = createFirewallMiddleware(catalog, policies, {
  tokenSecret: process.env.TOKEN_KEY || 'CHANGE_ME_IN_PRODUCTION',
  model: openai('gpt-4o-mini'),
  throwOnDeny: true,
});

// ============================================================================
// Wrap your model
// ============================================================================

const model = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: firewallMiddleware,
});

// ============================================================================
// Next.js API Route Handler (App Router)
// ============================================================================

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model,
      messages,
      system: `You are a helpful AI assistant. Provide clear and concise responses.`,
      tools: {
        // Example tool: Get weather information
        getWeather: tool({
          description: 'Get the current weather in a location',
          parameters: z.object({
            location: z.string().describe('The city and state, e.g. San Francisco, CA'),
          }),
          execute: async ({ location }) => {
            // Simulated weather data
            return {
              location,
              temperature: 72 + Math.floor(Math.random() * 21) - 10,
              condition: 'Sunny',
            };
          },
        }),
      },
      maxSteps: 5,
    });

    // Return the stream response
    // Note: Firewall validation happens after streaming completes
    return result.toDataStreamResponse();
    
  } catch (error) {
    // Handle firewall denial
    if (error instanceof FirewallDeniedError) {
      return new Response(
        JSON.stringify({
          error: 'Content policy violation',
          policyId: error.policyId,
          message: 'The response was blocked by our content policy.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle other errors
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================================================
// Alternative: Non-streaming for better policy enforcement
// ============================================================================

/**
 * Non-streaming version that applies firewall before returning response.
 * This ensures DENY and TOKENIZE policies work correctly before any
 * content reaches the client.
 */
export async function POST_NON_STREAMING(req: Request) {
  try {
    const { messages } = await req.json();

    // Use generateText instead of streamText
    const { generateText } = await import('ai');
    
    const result = await generateText({
      model,
      messages,
      system: `You are a helpful AI assistant. Provide clear and concise responses.`,
      tools: {
        getWeather: tool({
          description: 'Get the current weather in a location',
          parameters: z.object({
            location: z.string().describe('The city and state'),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: 72,
            condition: 'Sunny',
          }),
        }),
      },
      maxSteps: 5,
    });

    // Firewall has already been applied
    return new Response(
      JSON.stringify({
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    if (error instanceof FirewallDeniedError) {
      return new Response(
        JSON.stringify({
          error: 'Content policy violation',
          policyId: error.policyId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================================================
// Frontend usage example (Client Component)
// ============================================================================

/**
 * Example client component using the API route:
 * 
 * ```tsx
 * 'use client';
 * 
 * import { useChat } from 'ai/react';
 * 
 * export default function ChatComponent() {
 *   const { messages, input, handleInputChange, handleSubmit, error } = useChat({
 *     api: '/api/chat',
 *     onError: (error) => {
 *       console.error('Chat error:', error);
 *       // Handle firewall denials gracefully
 *       if (error.message.includes('Content policy violation')) {
 *         alert('Your message was blocked by our content policy.');
 *       }
 *     },
 *   });
 * 
 *   return (
 *     <div>
 *       <div className="messages">
 *         {messages.map((m) => (
 *           <div key={m.id} className={m.role}>
 *             {m.role}: {m.content}
 *           </div>
 *         ))}
 *       </div>
 * 
 *       {error && (
 *         <div className="error">
 *           Error: {error.message}
 *         </div>
 *       )}
 * 
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           value={input}
 *           onChange={handleInputChange}
 *           placeholder="Say something..."
 *         />
 *         <button type="submit">Send</button>
 *       </form>
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// Configuration recommendations
// ============================================================================

/**
 * Environment Variables (.env.local):
 * 
 * OPENAI_API_KEY=sk-...
 * TOKEN_KEY=your-secret-tokenization-key-change-in-production
 * 
 * 
 * Production Recommendations:
 * 
 * 1. Store TOKEN_KEY in a secure secrets manager
 * 2. Use non-streaming mode for critical DENY/TOKENIZE policies
 * 3. Log all firewall decisions for audit trails
 * 4. Monitor policy hit rates and adjust confidence thresholds
 * 5. Consider rate limiting to prevent policy bypass attempts
 * 6. Implement a token vault to reverse tokenization when needed
 * 
 * 
 * Performance Optimization:
 * 
 * 1. Cache catalog and policies (they're static)
 * 2. Reuse the firewall middleware instance across requests
 * 3. Use streaming for better UX, non-streaming for security
 * 4. Consider batching policy evaluations for high-volume scenarios
 * 5. Monitor extraction API costs (uses LLM for entity detection)
 */

