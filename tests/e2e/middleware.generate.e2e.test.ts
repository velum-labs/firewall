import { describe, it, expect, beforeAll } from 'vitest';
import { createFirewallMiddleware, FirewallDeniedError } from '../../src/middleware';
import { defineCatalog } from '../../src/catalog';
import type { Policy } from '../../src/policy';
import type { LanguageModelV2Message } from '@ai-sdk/provider';
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
  predicates: {
    FINANCIAL_EVENT: {
      definition: 'Corporate finance events (IPO, merger, acquisition).',
      examples: ['filed for IPO', 'announced acquisition'],
      relatedSubjects: [],
    },
  },
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

describeLive('middleware.generate.e2e', () => {
  beforeAll(() => {
    if (!runLiveLlMTests) {
      throw new Error(
        'middleware.generate.e2e requires FIREWALL_RUN_LIVE_TESTS=1 and OPENAI_API_KEY.'
      );
    }
  });

  it('should deny INPUT with FirewallDeniedError when policy blocks', async () => {
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
          content: [{ type: 'text' as const, text: 'Contact me at test@example.com' }],
        },
      ],
    };

    await expect(
      middleware.transformParams?.({
        type: 'generate',
        params: mockParams,
        model,
      })
    ).rejects.toThrow(FirewallDeniedError);
  });

  it('should not throw when throwOnDeny is false', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolNoEmail], {
      model,
      tokenSecret: 'test-secret',
      throwOnDeny: false,
    });

    const mockParams = {
      prompt: [
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: 'Contact me at test@example.com' }],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'generate',
      params: mockParams,
      model,
    });
    expect(result).toBeDefined();
    expect(result?.prompt[0].content[0]).toMatchObject({ 
      type: 'text', 
      text: 'Contact me at test@example.com' 
    });
  });

  it('should tokenize INPUT content before sending to LLM', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolTokenizePerson], {
      model,
      tokenSecret: 'test-secret',
    });

    const mockParams = {
      prompt: [
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: 'John Smith met with Dr. Lee.' }],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'generate',
      params: mockParams,
      model,
    });
    
    expect(result).toBeDefined();
    const userMessage = result?.prompt[0];
    expect(userMessage?.role).toBe('user');
    
    if (Array.isArray(userMessage?.content)) {
      const textPart = userMessage.content.find((p: LanguageModelV2Message['content'][0]) => 
        (p as { type: string }).type === 'text'
      );
      if (textPart && 'text' in textPart) {
        expect(textPart.text).toMatch(/\[\[SUBJ:PERSON:[A-Za-z0-9]+\]\]/);
      }
    }
  });

  it('should preserve non-text content items in user message', async () => {
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
            { type: 'text' as const, text: 'John Smith here.' },
            { type: 'file' as const, data: 'base64data', mimeType: 'image/png' },
          ],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'generate',
      params: mockParams,
      model,
    });
    
    expect(result?.prompt[0].content).toHaveLength(2);
    expect(result?.prompt[0].content[1]).toMatchObject({
      type: 'file',
      mimeType: 'image/png',
    });
  });

  it('should handle markdown token format', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolTokenizePerson], {
      model,
      tokenSecret: 'test-secret',
      tokenFormat: 'markdown',
    });

    const mockParams = {
      prompt: [
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: 'John Smith met with Dr. Lee.' }],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'generate',
      params: mockParams,
      model,
    });
    
    const userMessage = result?.prompt[0];
    if (Array.isArray(userMessage?.content)) {
      const textPart = userMessage.content.find((p: LanguageModelV2Message['content'][0]) => 
        (p as { type: string }).type === 'text'
      );
      if (textPart && 'text' in textPart) {
        expect(textPart.text).toMatch(/\[.+\]\(firewall:\/\/subj\/PERSON\/[A-Za-z0-9]+\)/);
      }
    }
  });

  it('should skip firewall when no user message', async () => {
    const model = openai('gpt-4o-mini');
    const middleware = createFirewallMiddleware(catalog, [PolTokenizePerson], {
      model,
      tokenSecret: 'test-secret',
    });

    const mockParams = {
      prompt: [
        {
          role: 'system' as const,
          content: [{ type: 'text' as const, text: 'You are a helpful assistant.' }],
        },
      ],
    };

    const result = await middleware.transformParams?.({
      type: 'generate',
      params: mockParams,
      model,
    });
    
    expect(result?.prompt).toEqual(mockParams.prompt);
  });
});

