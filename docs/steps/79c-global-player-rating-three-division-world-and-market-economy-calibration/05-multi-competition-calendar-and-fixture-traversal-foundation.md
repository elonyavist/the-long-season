# Step 05 - Multi-Competition Calendar And Fixture Traversal Foundation

## Status

Done.

## Goal

Make calendar generation and career fixture traversal safe for multiple
competitions before the three-division world is instantiated.

## Expected Files

- `packages/engine/src/season-engine/calendar.ts`
- `packages/engine/src/season-engine/calendar.test.ts`
- `packages/engine/src/career/next-fixture.ts`
- `packages/engine/src/career/next-fixture.test.ts`
- `packages/engine/src/career/continue-career.ts`
- `packages/engine/src/career/continue-career.test.ts`
- `packages/engine/src/career/season-completion.ts`
- `packages/engine/src/career/season-completion.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/index.ts`
- `docs/ARCHITECTURE.md`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/05-multi-competition-calendar-and-fixture-traversal-foundation.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Require `competitionId` and `seasonId` as explicit calendar-generation
  identity inputs.
- Generate fixture IDs that remain globally unique when three calendars are
  produced with the same round/slot counts.
- Preserve deterministic double round robin and the existing complete
  tie-breaker/ordering rules.
- Prove the accepted 18-club format yields 34 matchdays and 306 fixtures per
  competition.
- Traverse fixtures through explicit ordered competition and fixture ID arrays;
  never pick the first object key or first arbitrary current-season fixture.
- Make next-fixture, Continue, season-completion detection, and progress helpers
  competition-aware while keeping selected-club queries narrow.
- Detect duplicate fixture IDs and cross-competition membership mismatches
  before publishing a calendar.
- Preserve existing single-competition fixtures through the same generalized
  API in tests; do not keep a separate legacy implementation.
- Keep every function pure and deterministic.

## What NOT To Implement

- No three-division content generation or app bootstrap.
- No promotion/relegation or next-season movement.
- No transfer-window, Market, valuation, wage, budget, AI, storage, or web
  behavior.
- No app-side fixture-ID rewriting.
- No cup/continental calendar, postponement, midweek, or asymmetric schedule.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/season-engine/calendar.test.ts \
  packages/engine/src/career/next-fixture.test.ts \
  packages/engine/src/career/continue-career.test.ts \
  packages/engine/src/career/season-completion.test.ts \
  packages/engine/src/career/progress-fixture.test.ts
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Three same-season calendars cannot collide in IDs or traversal.
- The 18-club schedule is deterministic and complete.
- Selected-club and world-level fixture queries use canonical ordered
  competition state.
- No second single-league calendar/traversal path remains.
- No generated world or season movement changed.
