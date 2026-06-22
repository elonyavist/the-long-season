# Step 02 - Table Spread Diagnostics

## Goal

Make long-run reports explain table-spread failures clearly enough to guide a
narrow rework.

## Context

The existing long-run report can say that `table_points_spread_avg` failed, but
the next rework needs more evidence about how the table compressed.

Useful diagnostics should be compact and deterministic:

- per-world average first-place points;
- per-world average last-place points;
- per-world average table spread;
- min/max season spread;
- season number for the lowest spread;
- top-four and bottom-four point bands if useful;
- draw/upset indicators if already available from existing season metrics.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add table-spread diagnostics to the existing long-run output only where they
  help explain failures.
- Keep the output compact enough for 50-world and 250-world runs.
- Add or update tests for:
  - deterministic table-spread diagnostics;
  - CLI rendering;
  - localized labels if new user-facing text is introduced.
- Re-run the two failing worlds and append the diagnostic interpretation to the
  audit.

## What NOT to implement

- Do not change simulation behavior.
- Do not change pass/fail thresholds.
- Do not add large raw tables for every season unless the report needs them for
  a failing world.
- Do not add UI.

## Required checks

- focused tests for touched simulation-tools/CLI/i18n files
- `pnpm check`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`
- `git diff --check`

## Definition of Done

- Long-run output identifies why a table-spread world failed.
- The audit has enough evidence to select the rework source.
- No gameplay behavior changes are made.
- `docs/PROJECT_STATUS.md` points to the next Phase 35 step.
