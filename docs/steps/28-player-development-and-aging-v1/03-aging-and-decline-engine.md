# Step 03 - Aging And Decline Engine

## Goal

Implement deterministic aging decline for older players.

## Context

Veterans should remain useful for a time, but physical decline must become visible across long saves.

## Expected files

- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add decline rules to the development engine.
- Make physical decline more likely before technical decline.
- Make goalkeeper decline use appropriate age windows.
- Keep decline bounded and deterministic.
- Add tests for outfield veterans, goalkeepers, late-career attackers, and no-decline young players.

## What NOT to implement

- Do not implement retirement.
- Do not implement injuries.
- Do not implement contract decisions.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`
- `pnpm check`

## Definition of Done

- Older players can decline across season rollover.
- Decline is role- and age-aware enough for ten-season reports.

