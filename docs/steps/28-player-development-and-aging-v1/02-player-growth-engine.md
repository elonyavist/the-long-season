# Step 02 - Player Growth Engine

## Goal

Implement deterministic positive development for eligible players.

## Context

Growth should be strongest for young players with room to grow, but it should not guarantee that every prospect reaches high potential.

## Expected files

- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Use the development model spec.
- Derive deterministic development RNG from world seed, season ID, and player ID.
- Grow role-relevant abilities more than irrelevant abilities.
- Keep growth bounded by potential and current phase rules.
- Add tests for ordinary youth, serious prospect, rare prodigy, senior player, and deterministic same-seed output.

## What NOT to implement

- Do not implement decline in this step.
- Do not implement staff/training facilities.
- Do not expose hidden potential.
- Do not mutate storage directly.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`
- `pnpm check`

## Definition of Done

- Growth exists as a pure engine operation.
- Same seed produces same development.
- Different eligible players can develop differently.

