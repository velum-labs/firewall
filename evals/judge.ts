/**
 * LLM Judge for evaluating firewall decisions
 */

import { generateObject, type LanguageModel } from 'ai';
import createDebug from 'debug';
import { z } from 'zod/v4';
import type { Policy } from '../src/policy';
import type { Decision, Detections, LLMUsageTotals } from '../src/engine/types';
import type { ExpectedIntent, JudgeVerdict } from './types';

const debug = createDebug('firewall:e2e:judge');

const JudgeSchema = z.object({
  decision_alignment: z
    .number()
    .min(0)
    .max(1)
    .describe('1 if final outcome matches expected (DENY/TOKENIZE/ALLOW), else 0'),
  tokenization_coverage: z
    .number()
    .min(0)
    .max(1)
    .describe('Fraction of expected sensitive spans correctly redacted'),
  over_redaction: z
    .number()
    .min(0)
    .max(1)
    .describe('1 - (fraction of non-sensitive content incorrectly redacted)'),
  binding_correctness: z
    .number()
    .min(0)
    .max(1)
    .describe('1 if predicate spans align with correct bound subjects and cardinality'),
  exception_handling: z
    .number()
    .min(0)
    .max(1)
    .describe('1 if unless conditions (e.g., quotes) neutralize enforcement appropriately'),
  pass: z.boolean().describe('Overall pass/fail based on all criteria'),
  notes: z.string().max(500).describe('Brief explanation of verdict'),
});

export type JudgeInput = {
  original: string;
  processed: string;
  policies: Policy[];
  decisions: Decision[];
  detections: Detections;
  expected: ExpectedIntent;
  rubricNote?: string;
  model: LanguageModel;
};

export async function judgeCase(input: JudgeInput): Promise<{
  verdict: JudgeVerdict;
  usage: LLMUsageTotals;
}> {
  const { original, processed, policies, decisions, detections, expected, rubricNote, model } = input;

  // Build expected entity table
  const expectedEntityTable: string[] = [];
  if (expected.must_tokenize) {
    expectedEntityTable.push('### Expected Entities to Tokenize:');
    expectedEntityTable.push('');
    expectedEntityTable.push('| Entity Type | Label | Expected Count | Expected Surfaces |');
    expectedEntityTable.push('|-------------|-------|----------------|-------------------|');
    
    for (const exp of expected.must_tokenize) {
      const entityType = `${exp.kind}:${exp.label}`;
      const count = exp.count !== undefined ? exp.count.toString() : 
                    exp.surfaces ? exp.surfaces.length.toString() :
                    exp.minCount !== undefined ? `≥${exp.minCount}` : 'N/A';
      const surfaces = exp.surfaces 
        ? exp.surfaces.map(s => `"${s}"`).join(', ')
        : exp.surface 
        ? `"${exp.surface}"`
        : 'See regex/pattern';
      
      expectedEntityTable.push(`| ${entityType} | ${exp.label} | ${count} | ${surfaces} |`);
    }
    expectedEntityTable.push('');
  }

  // Build detected entity summary
  const detectedEntitySummary: string[] = [];
  detectedEntitySummary.push('### Detected Entities:');
  detectedEntitySummary.push('');
  
  if (detections.subjects.length > 0) {
    detectedEntitySummary.push('**Subjects:**');
    // Group by type
    const subjectsByType = new Map<string, typeof detections.subjects>();
    for (const subj of detections.subjects) {
      const existing = subjectsByType.get(subj.type) ?? [];
      existing.push(subj);
      subjectsByType.set(subj.type, existing);
    }
    for (const [type, instances] of subjectsByType.entries()) {
      detectedEntitySummary.push(`- ${type}: ${instances.length} instance(s)`);
      for (const inst of instances) {
        detectedEntitySummary.push(`  - "${inst.text}" (confidence: ${inst.confidence?.toFixed(2) ?? 'N/A'})`);
      }
    }
    detectedEntitySummary.push('');
  }
  
  if (detections.predicates.length > 0) {
    detectedEntitySummary.push('**Predicates:**');
    // Group by type
    const predicatesByType = new Map<string, typeof detections.predicates>();
    for (const pred of detections.predicates) {
      const existing = predicatesByType.get(pred.type) ?? [];
      existing.push(pred);
      predicatesByType.set(pred.type, existing);
    }
    for (const [type, instances] of predicatesByType.entries()) {
      detectedEntitySummary.push(`- ${type}: ${instances.length} instance(s)`);
      for (const inst of instances) {
        detectedEntitySummary.push(`  - "${inst.text}" (confidence: ${inst.confidence?.toFixed(2) ?? 'N/A'})`);
      }
    }
    detectedEntitySummary.push('');
  }

  debug('Judge original text: %s', original);
  debug('Judge processed text: %s', processed);
  debug('Judge expected entity table:\n%s', expectedEntityTable.join('\n') || '(none)');
  debug('Judge detected entities summary:\n%s', detectedEntitySummary.join('\n') || '(none)');

  const prompt = [
    'You are an evaluator for an AI firewall system. Output JSON only per the provided schema.',
    '',
    '## Inputs',
    '',
    '### Original text:',
    `"""${original}"""`,
    '',
    '### Processed text:',
    `"""${processed}"""`,
    '',
    '### Policies:',
    JSON.stringify(policies, null, 2),
    '',
    '### Decisions:',
    JSON.stringify(decisions, null, 2),
    '',
    detectedEntitySummary.join('\n'),
    '',
    expectedEntityTable.join('\n'),
    '',
    '### Expected intent:',
    JSON.stringify(expected, null, 2),
    '',
    '## Scoring Rules',
    '',
    '**CRITICAL: You must systematically verify ALL expected entities.**',
    '',
    '**decision_alignment** (0-1):',
    '- Score 1.0 if the final outcome (DENY/TOKENIZE/ALLOW) matches the expected intent.',
    '- Score 0.0 if the decision contradicts expectations.',
    '- Consider: must_deny → should have DENY decision; must_tokenize → should have TOKENIZE decision and modified text; must_allow → should have ALLOW with no changes.',
    '',
    'Special guidance for must_deny expectations:',
    '- If expected.must_deny is true and any DENY decision exists, treat decision_alignment as 1.0 even if other tokenization expectations are present.',
    '- Do not penalize tokenization_coverage when must_deny is satisfied; report 1.0 for coverage in that scenario.',
    '- Unless other critical issues exist (e.g., over-redaction or exception handling failures), set pass=true once a DENY decision is confirmed for must_deny cases.',
    '',
    '**tokenization_coverage** (0-1):',
    '- **CRITICAL**: When expected surfaces or count are provided, you MUST verify ALL occurrences.',
    '- For each expected surface in the table above:',
    '  1. Count how many times the surface appears as PLAIN TEXT in the original',
    '  2. Check if the surface DISAPPEARED from the processed text (replaced by a token)',
    '  3. Count matching tokens [[KIND:LABEL:*]] in the processed text',
    '  4. Surface was tokenized if: (a) it is gone from processed text, AND (b) a corresponding token exists',
    '- **IMPORTANT**: Original text may already contain tokens - ignore pre-existing tokens when counting surfaces.',
    '- Formula: tokenization_coverage = (number of plain-text surfaces tokenized) / (total plain-text surfaces)',
    '- Example: "John Smith" appears 1 time in original → processed has [[SUBJ:PERSON:xyz]] instead → coverage = 1.0',
    '- Example: "John Smith" appears 4 times in original but only 2 are replaced by tokens → coverage = 0.5',
    '- If no expected surfaces or count provided, use semantic judgment.',
    '',
    '**over_redaction** (0-1):',
    '- Score = 1 - (fraction of non-sensitive content incorrectly redacted).',
    '- Higher is better. Penalize if content not marked as sensitive was tokenized.',
    '- Only count content that should NOT have been tokenized per the policies.',
    '',
    '**binding_correctness** (0-1):',
    '- Score 1.0 if predicate spans are correctly bound to subjects per policy binding rules.',
    '- Check detections.predicates[].bindings match expected cardinality and subject types.',
    '- For subject-only policies, score 1.0 (no binding required).',
    '',
    '**exception_handling** (0-1):',
    '- Score 1.0 if "unless" conditions correctly neutralize enforcement when applicable.',
    '- If unless_rationale is specified, verify the decision reflects it.',
    '- If no unless conditions apply, score 1.0.',
    '',
    '**pass** (boolean):',
    '- True if all scores meet reasonable thresholds (≥0.95 for decision_alignment, ≥0.95 for coverage/over_redaction, ≥0.8 for binding/exceptions).',
    '- **CRITICAL**: If expected count or surfaces are provided and ANY are missing, pass MUST be false.',
    '- False otherwise.',
    '',
    '**notes** (string, max 500 chars):',
    '- Brief explanation of verdict, focusing on failures or edge cases.',
    '- If tokenization_coverage < 1.0, explicitly state which surfaces were missed and how many times.',
    '',
    '## Verification Checklist',
    '',
    '1. For each row in "Expected Entities to Tokenize" table:',
    '   - If surfaces are listed, verify EACH surface was tokenized ALL times it appears',
    '   - If count is provided, count tokens in processed text and verify exact match',
    '   - Report any discrepancies in notes',
    '',
    '2. Check for over-redaction:',
    '   - Identify any tokens in processed text that should not be there',
    '   - Reduce over_redaction score accordingly',
    '',
    '3. Verify detections match expectations:',
    '   - All expected entities should appear in detections',
    '   - All detections should result in appropriate decisions',
    '',
    '## Guidelines',
    '- Prefer exact string/position comparisons.',
    '- Count every occurrence - do not assume patterns.',
    '- Token format is [[KIND:LABEL:SHORTID]] or markdown format [text](firewall://...).',
    '- Be strict: if even one occurrence is missed, reflect it in the score.',
    rubricNote ? `\n${rubricNote}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  debug('Judge prompt:\n%s', prompt);

  const { object, usage } = await generateObject({
    model,
    temperature: 0,
    schema: JudgeSchema,
    prompt,
  });

  return {
    verdict: object,
    usage: {
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      totalTokens: usage?.totalTokens ?? 0,
    },
  };
}

