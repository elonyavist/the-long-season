# Step 06B12 - Checkpoint L5.2 Standings Hierarchy 7 x 2

## Status

Done on 2026-08-09: **STOP / RETHINK**. The canonical `7 x 2` run completed
with zero reconciliation, fallback or unavailable-player failures, but the
Second Division goals-per-match mean (`2.7993 > 2.7578`) and Third Division
draw-share mean (`0.2934 > 0.2868`) crossed their frozen historical bands.
First Division also missed champion points (`71.4286 < 72.3842`) and spread
(`46.2143 < 47`). Because 06B11 cannot alter either lower division, 06B12A
measures the same rules over the preregistered `7 x 10` population before an
owner is assigned.

## Goal

Verify that better first-division squads now produce a credible hierarchy over
two seasons without damaging total goals, draws or the separately calibrated
Second and Third Divisions.

## Locked Population

- `7` deterministic worlds x `2` complete seasons x `3` divisions;
- seed prefix `phase81a-standings-hierarchy-l5-2-v1`;
- exactly `7` workers;
- canonical career simulator and recorded standings only;
- profile `phase81a-standings-hierarchy-l5-2-7x2`;
- JSON output
  `simulation-out/phase81a-standings-hierarchy-l5-2-7x2.json`.

The profile and targets are frozen before the first run. No paired analysis
oracle enters this checkpoint.

## Gates

Each division is evaluated only against
`HISTORICAL_DIVISION_TABLE_TARGETS[level]`. For all three, champion points,
last-club points, spread, PPG standard deviation, goals per match and draw share
must be observed and inside their own bands.

Additional invariants:

- exactly `14` competition-seasons per division and `42` total;
- points, wins/draws/losses, goals and ranking reconcile from canonical rows;
- zero fallback formation, unavailable starter or report reconciliation;
- deterministic rebuild and worker-count metadata `7`.

The small `7 x 2` checkpoint answers immediate correction direction, not
ten-year renewal. It cannot authorize player-development or leader changes.

## Decision

- **GO:** every division and guardrail passes; open 06B13;
- **REFINE:** first-division hierarchy remains red while lower-league and
  goal/draw guardrails hold; reopen only 06B11;
- **STOP / RETHINK:** goals/draws move materially, lower divisions regress, or
  any reconciliation fails.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner tests;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and tests for the
  three-division historical evaluation using existing world facts;
- `packages/i18n/src/labels.ts` for profile help in all five languages;
- this step, phase README, audit README and project status;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_2_STANDINGS_HIERARCHY.md` (new);
- generated JSON under ignored `simulation-out/`.

## Required Checks

Focused report tests, locked run alone with exactly `7` workers, `pnpm check`,
`git diff --check`, `graphify update .`.

## Verification

- canonical artifact:
  `simulation-out/phase81a-standings-hierarchy-l5-2-7x2.json`;
- `42/42` competition-seasons, `14` per division, worker count `7`;
- decision `STOP_RETHINK`, process exit `1` as required by the locked gate;
- no gameplay conclusion is drawn from this small sample after its STOP.
