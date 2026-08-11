# Step 06B23A1 - World-Isolated Leader Reader

## Status

Done - **GO**. World boundaries are preserved, the complete gate is green and
the corrected same-seed L6.3B replay reconciles.

## Finding

The first L6.3B run is structurally valid but cannot decide the shooter lane.
Directly reading its `70` First-Division season tables gives mean top-ten
scoring near `18.47`; the checkpoint reports `26.74`.

The code explains the difference. `evaluateOwnerAttributionCheckpoint(...)`
flattens `OwnerAttributionWorldFacts.playerSeasons` across worlds before calling
`leaderProductionFacts(...)`. `topTenPlayerSeasonFacts(...)` groups only by
`competitionId|seasonNumber`, so the reader chooses ten leaders from all seven
worlds sharing season number 1, rather than ten from each world-season. It
creates `10` leader rows where the historical denominator requires `70`.

This also invalidates top scorer/assist means, leader ages, age-33+ shares and
exceptional-leader counts. It does not invalidate the underlying season facts,
the match engine or the other checkpoint families.

## Contract

- preserve `OwnerAttributionWorldFacts` as the world owner; do not duplicate
  `worldSeed` onto every player row;
- pass first-division player rows to the leader derivation grouped by world;
- within each world, retain the existing deterministic
  `competitionId|seasonNumber` grouping and player-ID final tie-breaker;
- pool the resulting world-season leader rows only after each top ten is fixed;
- do not change shot/assist counts, historical bands or the public report shape.

## Required Proof

1. Two worlds with the same competition/season and disjoint ten-player tables
   yield the mean of both top tens (`10.5` in the frozen fixture), not the top
   ten of their pooled twenty (`15.5`).
2. Reversing rows/world order is deterministic.
3. The existing one-world competition/season isolation test stays green.
4. Focused test, typecheck, `pnpm check`, `git diff --check` and Graphify pass.
5. L6.3B reruns with the exact same locked profile/seeds to a new output path;
   the invalid first report remains available and is never overwritten.

## Staged Exit

- **GO:** the reader isolates worlds, all tests pass and the corrected rerun has
  zero reconciliation/fallback/unavailable facts. Return to 06B23A's frozen
  lane decisions using only the corrected report.
- **REFINE:** world isolation is correct but another denominator mismatch
  remains. Reopen only this reader step.
- **STOP / RETHINK:** fixing the metric requires regenerated facts, a target
  change or a second report formula.

## What NOT To Implement

- no gameplay, profile, seed, target, report schema or content change;
- no `worldSeed` duplication inside each player-season fact;
- no direct calculation from presentation-only top-scorer tables in production;
- no overwrite or reinterpretation of the invalid first L6.3B report.

## Expected Files

- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test;
- this step, 06B23A, the Phase README and `docs/PROJECT_STATUS.md`;
- the corrected L6.3B audit and audit index only after the rerun.

## Outcome

- a two-world fixture now reports both world top tens: `10.5`, not pooled
  `15.5`; reversed world order is byte-identical;
- no `worldSeed` was duplicated into player-season facts;
- `pnpm check` passed `306/306` files and `2394/2394` tests;
- the same cached L6.3B facts were reevaluated in under two seconds, with report
  hash `845fd9df94c3934a00170fd5108b4540`, zero reconciliation and no overwrite;
- corrected top-ten scoring is `18.45` (green), corrected top-ten assists are
  `7.1614` (red). 06B23A therefore remains `REFINE` and opens attribution 06B23B.
