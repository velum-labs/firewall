/**
 * Engine integration tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createEngine } from '../src/engine';
import { catalog } from '../examples/catalog';
import { PolIPO, PolNoEmail, PolTokenizeNames } from '../examples/policies';
import { openai } from '@ai-sdk/openai';

const runLiveLlmTests = (() => {
  const flag = process.env.FIREWALL_RUN_LIVE_TESTS ?? '';
  const normalized = flag.trim().toLowerCase();
  const enabled = normalized === '1' || normalized === 'true' || normalized === 'yes';
  return enabled && Boolean(process.env.OPENAI_API_KEY);
})();

const describeLive = runLiveLlmTests ? describe : describe.skip;

describeLive('engine', () => {
  let engine: ReturnType<typeof createEngine>;
  let predicateEngine: ReturnType<typeof createEngine>;

  beforeAll(() => {
    if (!runLiveLlmTests) {
      throw new Error(
        'engine tests require FIREWALL_RUN_LIVE_TESTS=1 and OPENAI_API_KEY.'
      );
    }
    engine = createEngine(catalog, {
      tokenSecret: 'test-key',
      model: openai('gpt-4o-mini'),
    });
    predicateEngine = createEngine(catalog, {
      tokenSecret: 'test-key',
      model: openai('gpt-4o-mini'),
      predicatesEnabled: true,
    });
  });

  it('should deny emails', async () => {
    const text = 'Contact us: test@example.com';
    const [decision] = await engine.decide('d1', text, [PolNoEmail]);
    expect(decision.decision).toBe('DENY');
    expect(decision.policyId).toBe('pol_deny_emails');
  });

  it('should tokenize person names', async () => {
    const text = 'John Smith met with Dr. Sarah Lee yesterday.';
    const [decision] = await engine.decide('d2', text, [PolTokenizeNames]);
    expect(decision.decision).toBe('TOKENIZE');
    expect(decision.textTokenized).toBeDefined();
    expect(decision.tokens).toBeDefined();
    expect(decision.tokens!.length).toBeGreaterThan(0);
  });

  it('should tokenize financial events with company bindings', async () => {
    const text = 'Acme Corp announced an IPO in November.';
    const [decision] = await predicateEngine.decide('d3', text, [PolIPO]);
    expect(decision.decision).toBe('TOKENIZE');
    expect(decision.textTokenized).toBeDefined();
  });

  it('should extract subjects and predicates', async () => {
    const text = 'TechCorp Inc. filed for an IPO yesterday.';
    const detections = await predicateEngine.extract('d4', text, [PolIPO]);
    expect(detections.subjects).toBeDefined();
    expect(detections.predicates).toBeDefined();
    expect(detections.sentences).toBeDefined();
  });

  it('should handle multiple policies', async () => {
    const text = 'John Smith works at Acme Corp. Email: john@acme.com';
    const decisions = await engine.decide('d5', text, [
      PolTokenizeNames,
      PolNoEmail,
    ]);
    expect(decisions).toHaveLength(2);
    expect(decisions.some((d) => d.decision === 'DENY')).toBe(true);
  });

  it('should respect unless conditions', async () => {
    // This is a quote, so financial event tokenization should be skipped
    const text = '"Acme Corp is having an IPO in November," said the source.';
    const [decision] = await predicateEngine.decide('d6', text, [PolIPO]);
    // Should allow due to quote/citation exception
    expect(decision.decision).toBe('ALLOW');
    expect(decision.explanations).toContain('Exception matched');
  });

  it('throws when predicates are disabled but predicate policies are used', async () => {
    const text = 'Acme Corp announced an IPO in November.';
    await expect(engine.decide('d7', text, [PolIPO])).rejects.toThrow(
      /predicatesEnabled/i
    );
  });
});

