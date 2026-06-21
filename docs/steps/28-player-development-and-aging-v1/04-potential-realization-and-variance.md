# Step 04 - Potential Realization And Variance

## Goal

Add controlled variance so potential is not guaranteed.

## Context

The game should produce interesting stories: some good prospects stall, some category players become reliable, and only rare prodigies become top players.

## Expected files

- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add deterministic realization modifiers.
- Ensure potential class constrains but does not fully determine outcomes.
- Make rare prodigies better odds, not guaranteed stars.
- Add tests that long-run samples stay within expected bounds.
- Record any tuning lessons for the Phase 30 report.

## What NOT to implement

- Do not expose exact potential.
- Do not add scouting reports.
- Do not add youth intake.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`
- `pnpm check`

## Definition of Done

- Potential realization is deterministic but varied.
- The model supports rare long-term stories without flooding the league with stars.

