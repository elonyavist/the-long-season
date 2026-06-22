# Step 01 - Table Spread Failure Audit

## Goal

Reproduce and explain the two Phase 34 smoke-gate worlds that failed only on
`table_points_spread_avg`.

## Context

Phase 34 Step 04 failed the 50x10 smoke gate with:

- `phase34-concentration-world-00003`;
- `phase34-concentration-world-00040`.

Both failures are table-spread failures, not creator-concentration failures.
Before changing code, this step must identify what the compressed seasons look
like and whether the issue is caused by standings, strength hierarchy, draws,
upsets, or missing diagnostics.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Re-run:
  - `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`
  - `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`
- Record for each failing world:
  - `table_points_spread_avg`;
  - lowest spread season;
  - highest spread season;
  - champion points range;
  - last-place points range;
  - average draw rate if already exposed;
  - creator metrics to prove the Phase 34 issue remains fixed.
- If current output lacks enough evidence, add diagnostics only. Do not tune
  gameplay in this step.
- Write `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md` with exact seeds and facts.

## What NOT to implement

- Do not change simulation behavior.
- Do not change thresholds.
- Do not change match scoring probabilities.
- Do not tune player generation, youth, development, or transfers.
- Do not run the final 250x30 gate in this step.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`
- `git diff --check`

## Definition of Done

- The two failing worlds are reproduced.
- The audit explains whether the current output is sufficient or needs extra
  diagnostics.
- No gameplay behavior changes are made.
- `docs/PROJECT_STATUS.md` points to the next Phase 35 step.
