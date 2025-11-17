import { describe, it, expect, beforeAll } from 'vitest';
import { createFirewallMiddleware, FirewallDeniedError } from '../../src/middleware';
import { defineCatalog } from '../../src/catalog';
import type { Policy } from '../../src/policy';
import { openai } from '@ai-sdk/openai';

const catalog = defineCatalog({
  subjects: {
    PERSON: {
      description: 'Named human',
      examples: ['John', 'Dr. Lee'],
    },
    EMAIL: {
      description: 'Email address',
      patterns: [String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`],
    },
  },
  predicates: {},
});

const PolNoEmail: Policy = {
  id: 'pol_deny_emails',
  when: { subjects: ['EMAIL'], minConfidence: 0.9 },
  then: { action: 'DENY' },
};

const PolTokenizePerson: Policy = {
  id: 'pol_tokenize_person',
  when: { subjects: ['PERSON'] },
  then: { action: 'TOKENIZE', targets: 'subjects' },
};

const runLiveLlMTests = (() => {
  const flag = process.env.FIREWALL_RUN_LIVE_TESTS ?? '';
  const enabled =
    flag.trim().toLowerCase() === '1' ||
    flag.trim().toLowerCase() === 'true' ||
    flag.trim().toLowerCase() === 'yes';
  return enabled && Boolean(process.env.OPENAI_API_KEY);
})();

const describeLive = runLiveLlMTests ? describe : describe.skip;

describeLive('middleware.stream.e2e', () => {
  beforeAll(() => {
    if (!runLiveLlMTests) {
      throw new Error(
        'middleware.stream.e2e requires FIREWALL_RUN_LIVE_TESTS=1 and OPENAI_API_KEY.'
      );
    }
  });

  it('should scan INPUT before streaming (prevents exfiltration)', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolTokenizePerson], {
      model,
      tokenSecret: 'test-secret',
    });

    const mockParams = {
      prompt: [
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: 'John Smith is here.' }],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'stream',
      params: mockParams,
      model,
    });
    
    const userMessage = result?.prompt[0];
    if (Array.isArray(userMessage?.content)) {
      const textPart = userMessage.content[0];
      if ('text' in textPart) {
        expect(textPart.text).toMatch(/\[\[SUBJ:PERSON:[A-Za-z0-9]+\]\]/);
      }
    }
  });

  it('should deny INPUT with email before streaming starts', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolNoEmail], {
      model,
      tokenSecret: 'test-secret',
      throwOnDeny: true,
    });

    const mockParams = {
      prompt: [
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: 'Contact: test@example.com' }],
        },
      ],
    };

    await expect(
      middleware.transformParams?.({
        type: 'stream',
        params: mockParams,
        model,
      })
    ).rejects.toThrow(FirewallDeniedError);
  });

  it('should work with complex multi-part user messages', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolTokenizePerson], {
      model,
      tokenSecret: 'test-secret',
    });

    const mockParams = {
      prompt: [
        {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: 'Here is John Smith and ' },
            { type: 'text' as const, text: 'Dr. Lee together.' },
          ],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'stream',
      params: mockParams,
      model,
    });
    
    const userMessage = result?.prompt[0];
    expect(userMessage?.role).toBe('user');
    expect(Array.isArray(userMessage?.content)).toBe(true);
  });
});

