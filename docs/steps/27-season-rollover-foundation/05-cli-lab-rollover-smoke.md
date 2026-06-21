# Step 05 - CLI Lab Rollover Smoke

## Goal

Expose a minimal lab command that proves one career save can roll from one season to the next.

## Context

This command is a development inspection tool. It is not a polished gameplay UI. Its purpose is to validate the engine loop before Phase 28 and Phase 30.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/parse-career-args.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a narrow career lab flag for season rollover.
- Load an existing save.
- Confirm current season completion before rollover.
- Archive completed-season summary.
- Attach/generate the next season calendar.
- Apply player age/state rollover.
- Write the save only on success.
- Localize every user-facing label.

## What NOT to implement

- Do not make this a final UI.
- Do not add broad CLI feature polish.
- Do not auto-play many seasons.
- Do not implement player development.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- CLI smoke defined by the implementation, using a deterministic test save.

## Definition of Done

- A career save can roll over to the next season through a lab command.
- The output states what changed and what did not change.

