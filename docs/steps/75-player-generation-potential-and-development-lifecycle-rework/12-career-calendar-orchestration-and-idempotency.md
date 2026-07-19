# Step 12 - Career Calendar Orchestration And Idempotency

## Status

Done.

## Goal

Make one canonical career-calendar path apply monthly player lifecycle changes
exactly once across Continue, direct fixture progress, reload, and season
rollover.

## Inspectable Outcome

- Crossing a development month applies participation close, growth, role
  adaptation, decline, and potential compression once in a documented order.
- Reloading or reaching the same date through another command does not repeat
  the checkpoint.
- Season rollover handles only season-boundary work and does not replay twelve
  hidden monthly passes.

## Scope

1. Add one pure monthly lifecycle use case over `CareerState`.
2. Apply operations in one explicit order: close participation, positive
   development, role familiarity, decline, potential compression, then ledger
   window reset.
3. Store the last applied development month/season checkpoint.
4. Call the use case from canonical career advancement for every crossed month
   boundary.
5. Reconcile direct fixture advancement and season rollover with the same path.
6. Preserve deterministic daily Continue attention stops and match checkpoints.
7. Ensure selected-club and AI players receive the same factual lifecycle
   processing from their own participation.
8. Return structured monthly summaries for diagnostics without rendered prose.
9. Remove direct seasonal development calls and duplicate date checks.

## Expected Files

- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/continue-career.ts`
- `packages/engine/src/career/continue-career.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `packages/engine/src/index.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No second advancement orchestrator or app-owned development loop.
- No development on every day or every render.
- No change to attention categories, Inbox/Posta behavior, autosave cadence, or
  match outcome logic.
- No compatibility call to the removed seasonal system.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/advance-career-month.test.ts packages/engine/src/career/continue-career.test.ts packages/engine/src/career/progress-fixture.test.ts packages/engine/src/career/advance-career-season.test.ts packages/engine/src/career/player-season-rollover.test.ts apps/cli/src/commands/career.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
pnpm check
git diff --check
```

## Completion Criteria

- Every calendar route shares one monthly lifecycle use case.
- Same-date, reload, direct-fixture, and season-rollover idempotency pass.
- No seasonal development or duplicate checkpoint path remains.
- Step 13 is the single next action.

## Adopted Solution

- Added `advanceCareerMonths` as the canonical pure monthly lifecycle
  checkpoint. It closes only completed participation months, applies the
  existing monthly development consumer month by month, and uses
  `playerParticipationLedger.closedMonthKeys` as the durable idempotency
  checkpoint.
- Routed direct selected-club fixture progression through the monthly
  checkpoint before applying the new fixture result and accruing its
  participation facts.
- Routed season advancement through the same monthly checkpoint before exits,
  youth lifecycle, intake, squad maintenance, and transfer turnover.
- Exported the new use case for adapters and diagnostics without adding a
  second advancement orchestrator, app-owned lifecycle loop, or compatibility
  path for discarded beta saves.

## Verification Result

- Node 24.16.0 focused monthly lifecycle, direct fixture, season rollover,
  Continue, player rollover, and CLI career tests pass.
- Engine and CLI typechecks pass.
- Dependency-cruiser passes.
- Full `pnpm check` passes: lint, dependency-cruiser, localized text check,
  183 test files / 1,088 tests, and all workspace typechecks.
- `git diff --check` passes.

## Next Action

Step 13 is the next documented action: player trajectory diagnostics and
inspection reports.
