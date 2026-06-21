# Step 04 - Player Age And State Rollover

## Goal

Apply deterministic end-of-season age and dynamic-state rollover.

## Context

Before growth exists, players still need to age and their season states need a defined reset. This step prepares Phase 28 without changing abilities.

## Expected files

- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Increase player age by one season or update the existing age source consistently.
- Reset or normalize fitness, form, and morale according to documented MVP rules.
- Do not change abilities or potential.
- Keep the operation pure and deterministic.
- Add tests for starters, reserves, low fitness, high morale, and stable ordering.

## What NOT to implement

- Do not implement growth.
- Do not implement decline.
- Do not implement injuries or recovery histories.
- Do not implement contracts or wages.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/player-season-rollover.test.ts`
- `pnpm check`

## Definition of Done

- End-of-season player age/state transition is explicit.
- Phase 28 can add ability development on top of this baseline.

