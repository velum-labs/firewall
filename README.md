# @velum/firewall

Firewall middleware for AI SDK language models. Provides catalog-based extraction, tokenization, and policy-driven content filtering.

> **Status:** `@velum/firewall` is under active development. APIs, configuration, and behavior may change without notice as we iterate quickly. Expect breaking changes between releases until the package reaches a stable major version.

## Features

- **Top-down API**: Declare subjects and predicates in a catalog, define policies with ALLOW/DENY/TOKENIZE actions
- **LLM Extraction**: Uses Vercel AI SDK structured outputs with dynamic enums for accurate entity extraction
- **Deterministic Tokenization**: HMAC-based tokenization that's stable and reversible with a vault
- **Policy Engine**: Subject-only or predicate-based policies with binding and confidence thresholds
- **Content Filtering**: Block, allow, or tokenize content based on detected entities and predicates
- **Type-safe**: Full TypeScript support

## Quick Start

### 1. Define a Catalog

```typescript
import { defineCatalog } from "@velum/firewall";

export const catalog = defineCatalog({
  subjects: {
    PERSON: {
      description: "Named human",
      examples: ["John", "Dr. Lee"],
    },
    COMPANY: {
      description: "Business or fund name",
      examples: ["Acme Capital"],
    },
    EMAIL: {
      description: "Email address",
      patterns: [
        String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`,
      ],
    },
  },
  predicates: {
    FINANCIAL_EVENT: {
      definition: "Corporate finance events (IPO, merger, acquisition).",
      examples: ["filed for IPO", "announced acquisition of"],
      relatedSubjects: ["COMPANY"],
    },
  },
});
```

### 2. Define Policies

```typescript
import type { Policy } from "@velum/firewall";

// Deny documents with email addresses
export const PolNoEmail: Policy = {
  id: "pol_deny_emails",
  nl: "Block any document containing email addresses.",
  when: {
    subjects: ["EMAIL"],
    minConfidence: 0.9,
  },
  then: { action: "DENY" },
};

// Tokenize financial events and bound companies
export const PolIPO: Policy = {
  id: "pol_fin_event_tokenize",
  nl: "Tokenize financial events related to companies.",
  when: {
    predicate: "FINANCIAL_EVENT",
    bind: {
      subjects: ["COMPANY"],
      proximity: "sentence",
      cardinality: ">=1",
    },
  },
  then: { action: "TOKENIZE", targets: "both" },
};

// Requires predicatesEnabled=true when creating the engine or middleware.

// Tokenize person names
export const PolTokenizeNames: Policy = {
  id: "pol_tokenize_person",
  nl: "Tokenize personal names.",
  when: {
    subjects: ["PERSON"],
  },
  then: { action: "TOKENIZE", targets: "subjects" },
};
```

### 3. Create Engine and Make Decisions

```typescript
import { createEngine } from "@velum/firewall";
import { openai } from "@ai-sdk/openai";
import { catalog } from "./catalog";
import { PolIPO, PolNoEmail } from "./policies";

const engine = createEngine(catalog, {
  tokenSecret: process.env.TOKEN_KEY ?? "",
  model: openai("gpt-4o-mini"),
  predicatesEnabled: true, // required because PolIPO uses predicate rules
});

const text =
  "Company X is having an IPO in November. Email us at ir@companyx.com.";

const decisions = await engine.decide("doc1", text, [PolIPO, PolNoEmail]);

for (const decision of decisions) {
  console.log(`Policy: ${decision.policyId}`);
  console.log(`Decision: ${decision.decision}`);

  if (decision.decision === "TOKENIZE") {
    console.log(`Tokenized: ${decision.textTokenized}`);
    console.log(`Tokens:`, decision.tokens);
  }
}

/*
Example output:
Policy: pol_fin_event_tokenize
Decision: TOKENIZE
Tokenized: [[SUBJ:COMPANY:K3FQ2V7X]] is having an [[PRED:FINANCIAL_EVENT:ABC123XY]] in November. Email us at ir@companyx.com.
Tokens: ['[[SUBJ:COMPANY:K3FQ2V7X]]', '[[PRED:FINANCIAL_EVENT:ABC123XY]]']

Policy: pol_deny_emails
Decision: DENY
Triggered By: [
  {
    kind: 'predicate',
    type: 'EMAIL_ADDRESS',
    text: 'ir@companyx.com'
  }
]
*/
```

## Entity Linking & Canonical Tokens

`@velum/firewall` automatically assigns a canonical surface and global entity
ID to every non-structured subject. The middleware ships with a fuzzy matcher
that uses normalized string similarity (Levenshtein, Jaro–Winkler, character
n-grams) to cluster variants such as “Alen Rubilar” and “Alen” before
tokenization. Canonical surfaces are preferred when creating tokens, and the
entity ID is hashed into the token payload for perfect stability.

### Configuring the middleware

```typescript
import {
  createFirewallMiddleware,
  createFuzzyEntityLinker,
} from "@velum/firewall";

const firewall = createFirewallMiddleware(catalog, policies, {
  tokenSecret: process.env.TOKEN_KEY!,
  model: openai("gpt-4o-mini"),
  entityLinker: createFuzzyEntityLinker({
    thresholds: {
      PERSON: { accept: 0.9, ambiguous: 0.84 },
    },
    llmAssist: {
      model: openai("gpt-4o-mini"),
      maxPairs: 5,
    },
  }),
  entityNamespace: ({ docId }) => docId.split(":")[0] ?? "global",
});
```

### Cross-project stability with `@velum/firewall-vault`

For persistence across services, supply an entity linker backed by your
database. The `@velum/firewall-vault` package includes Drizzle helpers and the
required schema (`FirewallEntity`, `FirewallEntitySurface`) to share canonical
entities and reuse the same entity IDs everywhere.

```typescript
import { createDrizzleEntityLinker } from "@velum/firewall-vault";
import { firewallEntity, firewallEntitySurface } from "./db/schema";
import { db } from "./db/client";

const entityLinker = createDrizzleEntityLinker({
  db,
  schema: {
    entities: {
      table: firewallEntity,
      columns: {
        id: "id",
        namespace: "namespace",
        label: "label",
        canonicalSurface: "canonicalSurface",
        canonicalNorm: "canonicalNorm",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },
    surfaces: {
      table: firewallEntitySurface,
      columns: {
        id: "id",
        entityId: "entityId",
        surface: "surface",
        normalized: "normalized",
        createdAt: "createdAt",
      },
    },
  },
});

const firewallMiddleware = createFirewallMiddleware(catalog, policies, {
  tokenSecret,
  model: openai("gpt-4o-mini"),
  entityLinker,
  entityNamespace: () => "ai-chatbot",
});
```

When a multi-tenant namespace is provided, entities are isolated per tenant.
For global analytics, omit the namespace or derive it from your chat/user IDs.

## API Reference

### Catalog

#### `defineCatalog(catalog: Catalog)`

Define subjects and predicates for extraction.

**SubjectSpec:**

- `description?: string` - Description for extraction prompt
- `examples?: string[]` - Example mentions
- `patterns?: string[]` - Regex patterns for fast-path extraction

**PredicateSpec:**

- `definition: string` - Crisp guidance for extraction
- `examples?: string[]` - Example mentions
- `negatives?: string[]` - Counter-examples
- `relatedSubjects?: string[]` - Hints for binding
- `patterns?: string[]` - Regex patterns for fast-path extraction

### Policies

#### Policy Types

**Subject-only policy:**

```typescript
{
  id: string;
  nl?: string;
  when: {
    subjects: string[];
    scope?: 'sentence' | 'paragraph' | 'doc' | { token: number };
    minConfidence?: number; // 0..1, default 0.7
  };
  then: { action: 'ALLOW' | 'DENY' | 'TOKENIZE'; targets?: 'subjects' };
}
```

**Predicate-based policy:**

```typescript
{
  id: string;
  nl?: string;
  when: {
    predicate: string;
    bind?: {
      subjects?: string[];
      proximity?: 'sentence' | 'paragraph' | 'doc' | { token: number };
      cardinality?: '>=1' | '==1' | '>=2';
    };
    minConfidence?: {
      predicate?: number; // default 0.8
      subjects?: number;  // default 0.7
    };
  };
  unless?: Array<SubjectRule | PredicateRule>;
  then: { action: 'ALLOW' | 'DENY' | 'TOKENIZE'; targets?: 'subjects' | 'predicates' | 'both' };
}
```

### Engine

#### `createEngine(catalog, options)`

Create an engine for extraction and decision-making.

**Options:**

- `tokenSecret: string` - Secret key for HMAC tokenization (required)
- `model: LanguageModelV2` - Preconfigured AI SDK model instance to use for extraction/decisions (required)
- `predicatesEnabled?: boolean` - Enable predicate extraction & predicate-based policies (defaults to `false`)
- `temperature?: number` - Sampling temperature passed to the model (defaults to `0`)
- `structuredDetectorsOnly?: boolean` - Skip LLM extraction and rely exclusively on deterministic detectors

**Returns:**

```typescript
{
  extract(docId: string, text: string, policies: Policy[]): Promise<Detections>;
  decide(docId: string, text: string, policies: Policy[]): Promise<Decision[]>;
}
```

#### Decision Metadata

Each `Decision` may include a `triggeredBy` array that captures the exact subjects or predicates that satisfied the policy:

- `kind: 'subject'` entries mirror the underlying subject mention (`id`, `type`, `text`, `confidence`, `spans`) and now include a `tokenized` object describing the deterministic token (`value`, `id`, `format`).
- `kind: 'predicate'` entries include the predicate mention plus its bound subjects (each with their own `tokenized` view) so you can show user-facing explanations while logging only tokens.

This metadata is present for `DENY`, `TOKENIZE`, and logging policies whenever a match occurs. Because the triggers ship with their tokenized forms, you can safely persist the denial context without retaining raw sensitive strings.

### Tokenization

Tokens have the format `[[KIND:LABEL:SHORTID]]`:

- `KIND` is either `SUBJ` or `PRED`
- `LABEL` is the subject or predicate label
- `SHORTID` is a Base32-encoded HMAC hash

Tokens are:

- **Stable**: Same matter produces same token across documents
- **Deterministic**: Based on HMAC-SHA256 with normalization
- **Reversible**: Keep a vault mapping tokens to original text if needed

#### `makeTokenizer(secret: string)`

Create a tokenizer for manual tokenization.

```typescript
import { makeTokenizer } from "@velum/firewall";

const tokenizer = makeTokenizer("secret-key");

const token = tokenizer.token({
  kind: "SUBJ",
  label: "COMPANY",
  surface: "Acme Corp",
});
// => '[[SUBJ:COMPANY:K3FQ2V7X]]'
```

## Examples

### Extract Only (No Decisions)

```typescript
const detections = await engine.extract("doc1", text, [PolIPO]);

console.log("Subjects:", detections.subjects);
// [{ id: 'llm-s-COMPANY-0', type: 'COMPANY', text: 'Acme Corp', spans: [...], confidence: 0.95 }]

console.log("Predicates:", detections.predicates);
// [{ id: 'llm-p-FINANCIAL_EVENT-10', type: 'FINANCIAL_EVENT', text: 'IPO in November', ... }]
```

### Multiple Policies

```typescript
const decisions = await engine.decide("doc1", text, [
  PolTokenizeNames,
  PolNoEmail,
  PolIPO,
]);

// Each policy returns a decision
decisions.forEach((d) => {
  console.log(`${d.policyId}: ${d.decision}`);
});
```

### Exception Handling with `unless`

```typescript
const PolNoQuotes: Policy = {
  id: "pol_no_quotes",
  when: { predicate: "FINANCIAL_EVENT" },
  unless: [{ predicate: "QUOTE_OR_CITATION" }],
  then: { action: "TOKENIZE" },
};

// Text with a quote will skip tokenization
const text = '"Acme is having an IPO," the source said.';
const [decision] = await engine.decide("doc1", text, [PolNoQuotes]);
// decision.decision === 'ALLOW' (exception matched)
```

## Testing

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Run eval-driven E2E checks (LLM required)
FIREWALL_RUN_LIVE_TESTS=1 pnpm evals:run

# Watch mode for evals
FIREWALL_RUN_LIVE_TESTS=1 pnpm evals:watch

# Export eval summaries
pnpm evals:export --output report/export
```

Notes:

- Live evals and middleware/engine integration tests only run when both `OPENAI_API_KEY` and `FIREWALL_RUN_LIVE_TESTS=1` are set.
- Unit tests do not require external API access.

### E2E Evaluations

The package includes an end-to-end evaluation framework that uses an LLM judge to assess:

- Decision correctness (DENY/TOKENIZE/ALLOW alignment)
- Tokenization coverage and over-redaction
- Binding correctness (predicates ↔ subjects)
- Exception handling (`unless` conditions)

See [evals/README.md](evals/README.md) for complete documentation on:

- Running evaluations
- Environment variables and thresholds
- Adding new test cases
- Interpreting reports
- CI integration

## Development

```bash
# Build the package
pnpm build

# Lint the code
pnpm lint

# Run tests
pnpm test
```

## License

Apache 2.0 © 2025 Velum Labs
