# Step 02 - Next Season Calendar Generation

## Goal

Generate a deterministic next-season calendar for the current career league.

## Context

The existing calendar generator can create one season. Long-run simulation needs a repeatable way to create the next season from career state and world seed.

## Expected files

- `packages/engine/src/career/next-season-calendar.ts`
- `packages/engine/src/career/next-season-calendar.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Derive the next season ID deterministically.
- Generate new fixture IDs without colliding with old fixtures.
- Use the existing calendar generator where possible.
- Keep current clubs unchanged for this MVP.
- Make the generated start date deterministic and documented.
- Add tests for stable output and no fixture ID collisions.

## What NOT to implement

- Do not implement promotion/relegation.
- Do not implement real country-specific fixture rules yet.
- Do not mutate storage.
- Do not implement player growth.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/next-season-calendar.test.ts packages/engine/src/season-engine/calendar.test.ts`
- `pnpm check`

## Definition of Done

- Next-season calendar generation is deterministic.
- Existing completed-season fixtures are not overwritten.
- Future country-specific calendars remain possible.

