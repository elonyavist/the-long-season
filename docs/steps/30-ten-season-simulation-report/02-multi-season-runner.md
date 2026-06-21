# Step 02 - Multi-Season Runner

## Goal

Implement a deterministic runner that can simulate multiple seasons from one career/world seed.

## Context

The runner is a lab tool. It should reuse career rollover, player development, and season simulation rather than inventing a separate simulation path.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/`
- `apps/cli/src/commands/*.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a simulation-tools long-run runner.
- Support a configurable season count with ten as the standard smoke target.
- Keep outputs structured and deterministic.
- Wire a narrow CLI lab command to run it.
- Localize user-facing labels.
- Add tests for same-seed stability and season-count handling.

## What NOT to implement

- Do not add UI.
- Do not duplicate season simulation logic.
- Do not add broad market/development features in this step.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused tests for the runner and CLI command
- `pnpm check`

## Definition of Done

- A deterministic multi-season runner exists.
- The CLI can run a ten-season lab simulation for one seed.

