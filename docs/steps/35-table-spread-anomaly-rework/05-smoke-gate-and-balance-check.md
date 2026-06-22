# Step 05 - Smoke Gate And Balance Check

## Goal

Validate the table-spread rework on the smaller 50 worlds x 10 seasons gate
before attempting the final 250 worlds x 30 seasons gate.

## Context

The validation ladder remains mandatory. The final gate must not run until the
smoke gate passes.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run:
  - `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- Record:
  - failed worlds;
  - warning worlds;
  - `table_points_spread_avg`;
  - creator-concentration checks;
  - squad/youth structural checks;
  - balance metrics from strict `calibration-v1`.
- If the 50x10 gate fails, stop and mark this step blocked.
- Do not attempt 250x30 while 50x10 is failing.

## What NOT to implement

- Do not change thresholds.
- Do not skip the smoke gate.
- Do not start the final gate if this gate fails.
- Do not add unrelated gameplay systems.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The 50x10 gate passes.
- No `table_points_spread_avg` failures remain in the smoke gate.
- No creator-concentration failures are reintroduced.
- The project is allowed to attempt the final 250x30 gate.
