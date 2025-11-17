## Firewall E2E Harness

The Firewall suite now runs on top of [Evalite](https://github.com/mattpocock/evalite), but the registry + reporting guarantees remain the same. Each case under `tests/e2e/cases` registers metadata + expectations so the Evalite data loader can filter, retry, and emit structured artifacts. Shared catalog and policy definitions live in `tests/e2e/catalog/registry.ts` so subjects, predicates, and canonical policies stay consistent across cases, and the deterministic + LLM judge pipelines are identical to the legacy harness.

### Adding a Case

1. Create `tests/e2e/cases/<name>.ts`.
2. Import the registry helpers and shared policy catalog:
   ```ts
   import {
     defineCase,
     expectDenial,
     expectDetectionMap,
     registerCase,
   } from "../case-registry";
   import { policies } from "../catalog/registry";
   ```
3. Register the case and **explicitly declare the resources it exercises**:
   ```ts
   export const denyEmailCase = registerCase(
     defineCase({
       meta: {
         id: "deny_email",
         title: "Email denial",
         description: "Blocks documents containing email addresses",
         owner: "firewall",
         category: "core",
         severity: "blocker",
         tags: ["deny", "email"],
       },
       subjects: ["EMAIL"],
       predicates: [],
       policies: [policies.pol_deny_email],
       text: "Contact support@example.com",
       expectations: [
         expectDenial(),
         expectDetectionMap({ subjects: { EMAIL: ["support@example.com"] } }),
       ],
     })
   );
   ```
   - `subjects` must include every subject label you expect to exercise.

- `predicates` should list all predicate labels (use `[]` when none are involved). Predicate-driven cases require `predicatesEnabled: true` when constructing the engine or middleware.
- Predicate-focused cases no longer skip when predicates are disabled. If `FIREWALL_PREDICATES_ENABLED` is not set (or resolved to `false`), the registry strips predicate labels, predicate-only expectations, and predicate policies so the case still executes as a subject-only scenario. Set `FIREWALL_PREDICATES_ENABLED=1` (or `true/yes`) before loading the registry to exercise full predicate behavior.
  - `policies` accepts the shared canonical policies, but you can still inline bespoke `Policy` objects when a case needs special behavior—just make sure their `id` is unique.

4. Use helpers (`expectAllow`, `expectTokenizedEntities`, `allowUnchangedRegion`, `expectProcessedDiff`) to ensure deterministic checks & judge prompts stay aligned.
5. These resource declarations feed the reporting layer so coverage summaries can highlight how often each subject, predicate, and policy is exercised.

### Running Locally

Evalite is now the only runner. Use the helper scripts to invoke it:

```
# Run the full suite once and exit
pnpm test:e2e -- --tag core

# Watch for file changes (Evalite CLI flag)
pnpm evals:watch -- --only deny_email

# Export static HTML/JSON artifacts
pnpm evals:export
```

These commands call `evalite tests/e2e/firewall.eval.ts` directly, so all standard Evalite CLI flags (`--only`, `--skip`, `--watch`, `--outputPath`, etc.) are available. Refer to the [Evalite CLI docs](https://github.com/mattpocock/evalite) for the complete flag list.

### Single-Case Runner

For quick debugging you can run an individual registry case (outside the Evalite harness) with:

```
# Pretty console output
pnpm evals:case core_deny_email

# JSON payload for scripting
pnpm evals:case core_deny_email -- --json
```

By default the runner loads every file under `evals/cases`. Use `--glob "**/financial_*.ts"` (or set `FIREWALL_SINGLE_CASE_GLOB`) to restrict the loader. The command honours the same engine env vars as the Evalite suite (`OPENAI_API_KEY`, `FIREWALL_MODEL`, `FIREWALL_TOKEN_SECRET`, etc.) and executes the deterministic checks so you can immediately see why a case fails.

#### Evalite filter environment variables

You can use these to scope runs even when you invoke Evalite directly:

| Variable                                                          | Description                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `FIREWALL_EVALITE_CASE_FILTERS`                                   | Comma-separated case IDs (e.g. `deny_email,allow_safe_doc`)             |
| `FIREWALL_EVALITE_TAG_FILTERS`                                    | Comma-separated tag filters                                             |
| `FIREWALL_EVALITE_GLOB`                                           | Glob passed to the registry loader                                      |
| `FIREWALL_EVALITE_CASE_SET`                                       | JSON array of case IDs (preserves ordering)                             |
| `FIREWALL_EVALITE_MAX_RETRIES`                                    | Per-case retry attempts (defaults to `FIREWALL_E2E_MAX_RETRIES`)        |
| `FIREWALL_EVALITE_REPORT_DIR` / `FIREWALL_EVALITE_REPORT_FORMATS` | Customize report location + formats when auto-reporting                 |
| `FIREWALL_EVALITE_AUTOREPORT`                                     | Set to `1` to mirror Evalite’s built-in report writer (defaults to `0`) |
| `FIREWALL_EVALITE_NO_REPORT`                                      | Set to `1` to suppress Evalite report writes entirely                   |

> Concurrency and per-case timeouts are now controlled via `evalite.config.ts` (`maxConcurrency`, `testTimeout`). Legacy CLI flags such as `--concurrency` and `--timeout` are ignored.

### Cost Tracking

The harness now reports the estimated dollar cost and token usage for each run (and each case). Costs are computed from OpenAI's published rates for GPT-4o models, but you can override them via environment variables:

| Variable                            | Description                             |
| ----------------------------------- | --------------------------------------- |
| `FIREWALL_MODEL_INPUT_PRICE`        | Engine prompt price per 1M tokens (USD) |
| `FIREWALL_MODEL_OUTPUT_PRICE`       | Engine completion price per 1M tokens   |
| `FIREWALL_JUDGE_MODEL_INPUT_PRICE`  | Judge prompt price per 1M tokens        |
| `FIREWALL_JUDGE_MODEL_OUTPUT_PRICE` | Judge completion price per 1M tokens    |

If unset, the scorers assume `$2.50 / $10.00` (input/output) for `gpt-4o` and `$0.15 / $0.60` for `gpt-4o-mini`, falling back to `$1.00` for unknown models. Costs are surfaced through Evalite scorer metadata.

### Deterministic Checks

Deterministic evaluation runs before the LLM judge and emits typed failure categories:

- `decision-mismatch` – expected allow/deny/tokenize not met
- `expected-detections` – extractor missed required entities
- `surface-coverage` – missing tokens or unredacted surfaces
- `unchanged-regions` – protected spans mutated
- `token-format` – malformed tokens
- `diff-hints` – informational hints for reviewing diffs

Failures are grouped by severity (`BLOCKER`, `WARN`, `INFO`) and surfaced in raw results + summary taxonomy so CI can distinguish infra issues from coverage gaps.

### Validating Without API Calls

Use the smoke test to ensure registry integrity:

```
pnpm vitest tests/e2e/smoke.test.ts
```

This loads the registry, validates metadata, and fails fast if ids collide or expectations are malformed.
