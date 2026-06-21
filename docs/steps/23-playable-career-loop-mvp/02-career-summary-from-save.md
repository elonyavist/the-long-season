# Step 02 - Career Summary From Save

## Goal

Add a compact career summary command that reads the current career state from the save.

## Context

The user needs one place to understand the current career before advancing time. The summary should not regenerate a world or run a new season simulation. It should load persisted state and present the next actionable situation.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add `pnpm cli career --save=<saveId> --summary`.
- Load the existing career save.
- Print selected club, world seed, current date/season context, roster size, budget, and next selected-club fixture if available.
- Include only information already present in the save or derivable from saved state.
- Localize new user-facing labels.

## What NOT to implement

- Do not advance time.
- Do not simulate fixtures.
- Do not auto-select lineup/tactics/market actions.
- Do not regenerate the world.
- Do not add UI-only formatting.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused career CLI/i18n tests
- `pnpm cli career --save=phase23-summary-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase23-summary-world --summary`
- `pnpm check`

## Definition of Done

- The summary command loads persisted career state.
- The summary gives the user a clear next action without mutating the save.
- All new presentation text is localized.
