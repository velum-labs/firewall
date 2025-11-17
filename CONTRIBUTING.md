# Contributing to `@velum/firewall`

Thanks for helping make the Velum firewall better. This guide explains how to set up your environment, run checks, and submit changes that match the rest of the monorepo.

## Prerequisites

- Node.js >= 20.10
- `pnpm` (the monorepo uses `pnpm-workspace.yaml`; never mix in `npm` or `yarn`)
- An OpenAI API key if you want to exercise the optional live evals

## Getting started

```bash
pnpm install
pnpm --filter @velum/firewall build
```

The package scripts are wired for filtered runs, so you can run linters and tests in isolation without touching the rest of the workspace:

```bash
pnpm --filter @velum/firewall lint
pnpm --filter @velum/firewall test
pnpm --filter @velum/firewall typecheck
```

Live evals and end-to-end tests are disabled by default. To run them you need an API key and the feature flag:

```bash
export OPENAI_API_KEY=sk-...
export FIREWALL_RUN_LIVE_TESTS=1
pnpm --filter @velum/firewall test
```

## Coding standards

- Stick to strict TypeScript (no `any`, no non-null assertions).
- Follow the Biome/Ultracite lint rules already configured in the repo. Run `pnpm --filter @velum/firewall lint` (or `npx ultracite check` from the workspace root if you need the global sweep) before opening a PR.
- Tests should cover new runtime logic. Prefer Vitest unit tests; only turn on the live flag when a change truly requires touching a provider.
- Keep docs and examples in sync. If you add a new option, update `README.md` and any relevant sample in `examples/`.

## Submitting changes

1. Create a topic branch.
2. Make focused commits (docs/infra vs runtime logic in separate commits when possible).
3. Run build, lint, tests (and evals if they are affected).
4. Open a PR that describes the change, the motivation, and any manual testing steps. Link to issues if relevant.

We review contributions continuously. Please be responsive to feedback so we can merge quickly.
