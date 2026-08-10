# Step 06B12A - Checkpoint L5.2A Powered Standings Retry 7 x 10

## Status

Planned before the first run.

## User-Facing Reason

A believable football world needs distinct league personalities without
declaring a correction broken because fourteen seasons happened to be noisy.
This retry gives the already-frozen historical bands enough simulated seasons
to identify whether the anomaly is persistent before changing match scoring,
draw resolution or lower-division content.

## Locked Population

- `7` deterministic worlds x `10` complete seasons x `3` divisions;
- seed prefix `phase81a-standings-hierarchy-l5-2a-v1`;
- exactly `7` workers and the canonical career simulator;
- profile `phase81a-standings-hierarchy-l5-2a-7x10`;
- the same `standings_hierarchy_l5_2` evaluator and the unchanged
  `HISTORICAL_DIVISION_TABLE_TARGETS` used by 06B12;
- JSON output
  `simulation-out/phase81a-standings-hierarchy-l5-2a-7x10.json`.

No target, evaluator, result rule or gameplay value may change after the run.
The larger population lowers the noise floor; it does not relax a gate.

## Gates

- exactly `70` competition-seasons per division and `210` total;
- all six historical metrics pass independently in each division;
- zero result, table, fallback-formation or unavailable-starter
  reconciliation failures;
- worker count is exactly `7` and deterministic rebuild is byte-identical.

## Decision

- **GO:** all divisions pass; close 06B12 and open 06B13;
- **REFINE:** only First-Division hierarchy is red while every goals/draw and
  lower-division gate holds; reopen only the demonstrated 06B11 owner;
- **STOP / RETHINK:** a lower-division or goals/draw failure persists. Assign a
  new owner from the failing metric before any gameplay correction; never move
  the historical band.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`;
- `packages/i18n/src/labels.ts`;
- this step, 06B12, phase README, audit README and project status;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_2A_POWERED_STANDINGS.md` (new);
- generated JSON under ignored `simulation-out/`.

## Required Checks

Focused planner/report tests, the locked run alone with exactly `7` workers,
deterministic artifact rebuild, `pnpm check`, `git diff --check`, and
`graphify update .`.
