# Step 08a - Long-Run Gate Anomaly Rework

## Goal

Fix the specific anomalies found by the `50` worlds x `10` seasons smoke gate before attempting larger gates.

The rework must make the long-run report explain both `WARN` and `FAIL` outcomes, then address the failing causes without weakening the validation ladder.

## Context

`docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md` added the explicit batch gate runner, but the first gate failed:

- Gate: `50` worlds x `10` seasons.
- Status: `FAIL`.
- Failed worlds: `2`.
- Warnings: `39`.
- Structural squad collapse: not observed.
- Clubs below minimum squad size: `0`.
- Clubs without natural goalkeeper: `0`.
- Blocking seed `phase31-gate-world-00009`: `top_assist_max` reached `19`.
- Blocking seed `phase31-gate-world-00040`: `champion_streak` reached `7`.

The evidence says the squad-refresh loop is structurally working, but long-run balance still has three suspicious areas:

1. too many warning worlds, likely driven mostly by `age_30_plus_share`;
2. occasional creator/assist concentration that can exceed the current hard threshold;
3. occasional club dominance across too many consecutive seasons.

This step must not hide those findings. It must improve diagnostics first, then apply narrow reworks only where the report proves they are needed.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`
- `docs/audits/CAREER_SQUAD_REFRESH_ANOMALY_REWORK_REPORT.md`
- `docs/PROJECT_STATUS.md`

If the rework proves that an engine/content change is required, the touched engine/content files are allowed, but only for the minimal behavior needed to address the measured anomaly.

## Implementation checklist

- Extend the batch gate report with `warn_checks` per worst/warning world, not only `fail_checks`.
- Add aggregate warning counts by anomaly key, so the report explains why many worlds are `WARN`.
- Reproduce and record:
  - `phase31-gate-world-00001` for a representative age-distribution warning;
  - `phase31-gate-world-00009` for `top_assist_max`;
  - `phase31-gate-world-00040` for `champion_streak`.
- Rework age distribution only if the warning count proves the final `30+` share is too high across the smoke gate.
- Rework creator/assist concentration only if the report proves assist concentration is consistently too high, not because one realistic outlier exists.
- Rework champion dominance only if the report proves repeated title streaks are too common, not because one strong club exists.
- Prefer narrow simulation/content tuning over threshold changes.
- If a threshold is demonstrably unrealistic, document the reason and change it explicitly with before/after evidence. Do not silently widen thresholds.
- Rerun the validation ladder from the start:
  1. `50` worlds x `10` seasons;
  2. only if that passes, `250` worlds x `30` seasons;
  3. only if that passes, `10,000` worlds x `50` seasons.
- Update both audit reports with the old result, adopted rework, and new result.

## What NOT to implement

- Do not reduce world count or season count.
- Do not skip the `50` x `10` rerun after changes.
- Do not run `250` x `30` or `10,000` x `50` while `50` x `10` is failing.
- Do not remove anomaly checks to make the gate pass.
- Do not weaken squad-size or natural-goalkeeper gates.
- Do not add UI.
- Do not add advanced transfer systems, contracts, wages, loans, installments, auctions, or swap deals.
- Do not let the system choose the user's lineup, tactics, or market strategy.

## Required checks

- focused tests for touched simulation-tools/CLI/i18n files
- focused tests for any touched engine/content files
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm cli ten-season-report --seed=phase31-gate-world-00001 --seasons=10`
- `pnpm cli ten-season-report --seed=phase31-gate-world-00009 --seasons=10`
- `pnpm cli ten-season-report --seed=phase31-gate-world-00040 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase31-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`
- If `50` x `10` passes: `pnpm cli ten-season-report --seed-prefix=phase31-gate --worlds=250 --seasons=30 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`
- If `250` x `30` passes: `pnpm cli ten-season-report --seed-prefix=phase31-gate --worlds=10000 --seasons=50 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`
- `git diff --check`

## Definition of Done

- Batch gate output explains both warning keys and failing keys.
- The known failing seeds are reproducible and documented.
- `CAREER_SQUAD_REFRESH_ANOMALY_REWORK_REPORT.md` records the diagnosis and adopted fix.
- The `50` x `10` smoke gate passes before larger gates are attempted.
- If `50` x `10` still fails, the step is marked blocked with exact failing seeds and reasons.
- If `50` x `10` passes, the step continues through `250` x `30` and then `10,000` x `50` as documented.
- `docs/PROJECT_STATUS.md` records whether Phase 31 can continue to the final report or needs another focused rework.
