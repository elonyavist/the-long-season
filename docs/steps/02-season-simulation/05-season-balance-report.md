# Season Balance Report

## Goal

Create the first broad balance report for simulated seasons, using hand-authored calibration targets and deterministic batch runs.

## Why we implement it this way

The project promise is statistical truth, but early targets must be broad and practical. `requirements.md` requires batch validation against aggregate facts without importing protected football databases. Balance reporting should expose drift early without pretending to be final calibration.

## What to implement

- `packages/simulation-tools` package when this step starts.
- `CalibrationTarget` type or content file for broad targets.
- Batch runner for N seasons with a seed prefix.
- Metrics: goals per match, home/draw/away rates, first-place points, last-place points, and upset proxy if team strengths exist.
- `balance-report` CLI command or `simulate-season --report` only if that keeps scope smaller.
- PASS/FAIL with wide tolerance bands.

## What NOT to implement

- Do not scrape or import real datasets.
- Do not use club, player, competition, or market identities from real databases.
- Do not implement economic metrics yet.
- Do not implement injuries or cards unless those systems already exist.
- Do not create dashboards or charts.

## Allowed dependencies

- `packages/simulation-tools -> domain, engine, shared`
- `packages/content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `packages/simulation-tools/package.json`
- `packages/simulation-tools/tsconfig.json`
- `packages/simulation-tools/src/calibration-report.ts`
- `packages/simulation-tools/src/calibration-report.test.ts`
- `packages/simulation-tools/src/index.ts`
- `packages/content/src/balance/calibration-targets.ts` or `packages/content/src/balance/calibration-targets.json`
- `apps/cli/src/commands/balance-report.ts`
- `apps/cli/src/index.ts`

## Required tests

- Report is deterministic for the same seed and season count.
- Report includes all required metrics.
- Targets are hand-authored aggregate values.
- PASS/FAIL respects tolerance bands.
- CLI exits nonzero when report is outside targets if strict mode is enabled.

## Definition of Done

- Batch season metrics can be produced from CLI.
- Targets are aggregate and hand-authored.
- No real database content is used.
- Report can be used as an automated gate later.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the first season balance report from `docs/steps/02-season-simulation/05-season-balance-report.md`. Add `simulation-tools` only for aggregate deterministic metrics. Do not add charts, real data, or economic systems.
