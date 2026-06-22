# Step 06 - Final Long-Run Gate And Phase Report

## Goal

Run the final long-run gate and close Phase 35 with a clear next action.

## Context

This step can run only after Step 05 and Step 05a pass. It proves that the
table-spread rework holds beyond the smoke gate, that Phase 34's
creator-concentration fix remains valid, and that the smoke-gate
`champion_streak` blocker is no longer active.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run the final gate:
  - `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- Run strict balance:
  - `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- Re-run the original Phase 33 creator seed:
  - `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- Summarize:
  - final pass/fail status;
  - remaining warnings by type;
  - table-spread metrics;
  - creator-concentration metrics;
  - whether Phase 34/35 blockers are cleared.
- Update `docs/PROJECT_STATUS.md` with the next active step.

## What NOT to implement

- Do not change behavior while running the final gate.
- Do not widen thresholds.
- Do not hide remaining failures as warnings.
- Do not start the next phase.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The 250x30 gate passes, or the phase is blocked with exact failing seeds and
  checks.
- The report states whether Phase 34's creator-concentration blocker is still
  cleared.
- The report states whether Phase 35's table-spread blocker is cleared.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
