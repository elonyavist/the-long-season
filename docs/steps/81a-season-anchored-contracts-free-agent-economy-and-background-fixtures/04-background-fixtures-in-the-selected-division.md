# Step 04 - Background Fixtures In The Selected Division

## Status

Not started.

## Entry Gate

- Steps 01-03 are Done and reported together against the frozen bands.
- Phase 81's four seams are in place: the named squad-depth accessor, the
  context constructor taking an explicit squad, the non-selected club as an
  ordinary caller, and the match RNG keyed by `(worldSeed, fixtureId)`.

## Goal

Resolve the other fixtures of the selected club's own division inside the
existing advancement, so the manager's league table is real at every point in
the season.

## User-Facing Reason

Today the table around the manager is empty: only his own results exist. A
league where nobody else plays cannot produce a title race, a relegation fight,
or a reason to care about next week.

## What To Implement

- Resolve background fixtures inside `advanceCareerMonths` only. For every
  interval the career crosses, resolve the selected division's fixtures dated
  within it, and resolve fixtures dated on the arrival date after the manager's
  own match has committed.
- Build each background club's context through Phase 81's single constructor,
  passing an explicit squad obtained through the named squad-depth accessor, and
  select its XI through the canonical Phase 81 selection. No background-specific
  lineup path is introduced.
- Derive every background match's randomness from `(worldSeed, fixtureId)` so
  that resolution order, batching, and timing cannot change a result.
- Make resolution idempotent with a durable checkpoint, following the discipline
  already used by `closedMonthKeys`: an already-resolved fixture is skipped and
  never replayed. Crossing the same interval twice changes nothing.
- Preserve the reveal order the current code already produces: because
  `advanceCareerMonths` runs before the manager's match report is applied,
  same-date background results appear after his own without a special case.
- Do not commit precomputed background results while a volatile live match
  session is open. A refresh that discards the manager's match must discard the
  background work with it; the second attempt recomputes identical results.
- Feed resolved results into the existing league-table computation and season
  aggregation, so standings, scorers, and player statistics include background
  clubs without a parallel aggregator.
- Measure and record the added cost per tick, per component, against the budget:
  p50 under one second for a Continue, under five seconds for a matchday.
- Add tests for: interval crossing twice; identical results across day-by-day
  versus month-jump advancement; a full division table after a simulated season;
  reveal order on a shared date; and no result produced for a fixture outside
  the selected division.

## Clean-Code Requirements

- One advancement function and one clock. If a second entry point appears, it is
  a defect, not a variant.
- Background resolution reuses the existing fixture-result application and
  table computation; no second write path for a match result exists.
- The checkpoint uses the existing durable-checkpoint pattern rather than a new
  bespoke mechanism.
- Remove any test fixture or helper that only existed to simulate an empty
  background division.

## What NOT To Implement

- No other divisions, no other countries, no cups, no aggregate producer. The
  world-extension work owns them.
- No second advancement function, no lazy after-the-fact resolution, no
  worker-only path that produces different results from the inline one.
- No match-engine change.
- No market or contract change.
- No per-minute telemetry for background matches.

## Expected Files

- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/background-fixture-resolution.ts`
- `packages/engine/src/career/background-fixture-resolution.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/index.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/background-fixture-resolution.test.ts \
  packages/engine/src/career/progress-fixture.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/career-storage.contract.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- The selected division's table is complete at every point in the season.
- All background resolution happens inside `advanceCareerMonths`; an absence
  check proves no other path advances the world.
- Crossing an interval twice replays nothing.
- Day-by-day and month-jump advancement produce identical results at the same
  seed.
- Same-date background results appear after the manager's own match.
- A discarded live session discards the background work with it, and the retry
  reproduces identical results.
- Measured p50 Continue stays under one second and a matchday under five
  seconds, reported per component.
- Step 05 is the only next action.
