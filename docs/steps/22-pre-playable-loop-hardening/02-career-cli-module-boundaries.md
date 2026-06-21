# Step 02 - Career CLI Module Boundaries

## Goal

Reduce career CLI module pressure before Phase 23 adds save-driven career-loop behavior.

## Context

Phase 21 found no package-boundary blocker, but identified `apps/cli/src/commands/career.ts` as a maintainability risk. Phase 23 will likely add summary/progression commands; adding those directly to the current file would make the CLI harder to reason about and harder to migrate to UI later.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Extract private career CLI helpers into focused modules under `apps/cli/src/commands/career/`.
- Preserve the existing public command behavior.
- Keep parsing, formatting, save loading, and career action orchestration in separate small units where practical.
- Keep user-facing text routed through the existing localization layer.
- Add or update tests that prove existing career commands still behave the same.

## What NOT to implement

- Do not add new career commands.
- Do not advance career time.
- Do not simulate persisted fixtures.
- Do not change career save schema.
- Do not change market behavior.
- Do not add unused helper abstractions for hypothetical future features.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused tests for touched career CLI files
- `pnpm cli career --save=phase22-boundary-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase22-boundary-world --inspect`
- `pnpm check`

## Definition of Done

- Existing career CLI output remains functionally equivalent.
- The career command has clearer private module boundaries for Phase 23.
- No dead code or unused compatibility path is introduced.
