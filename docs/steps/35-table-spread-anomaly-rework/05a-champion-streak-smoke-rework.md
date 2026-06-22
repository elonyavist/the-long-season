# Step 05a - Champion Streak Smoke Rework

## Goal

Resolve the new smoke-gate blocker observed after the table-spread rework:
`phase35-table-spread-world-00037` fails `champion_streak` in the 50 worlds x 10
seasons gate.

This step exists only because Step 05 proved that the original Phase 35 target
is fixed at smoke level: no `table_points_spread_avg` failures and no
creator-concentration failures remain in the 50x10 gate.

## Context

Step 05 ran:

```bash
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md
```

Observed result:

- gate status: `FAIL`;
- failed worlds: `1`;
- failing check counts: `champion_streak=1`;
- failing seed: `phase35-table-spread-world-00037`;
- table-spread failures: `0`;
- creator-concentration failures: `0`;
- clubs below minimum squad size: `0`;
- clubs without natural goalkeeper: `0`.

The blocker is no longer table spread. The blocker is whether repeated champion
dominance over a 10-season smoke sample is a real simulation issue or a
long-run anomaly-policy issue.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Reproduce the failing world:
  - `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`
- Identify the exact champion streak:
  - champion club;
  - streak length;
  - seasons involved;
  - champion points during the streak;
  - table spread during the streak;
  - whether the same club is structurally dominant or the check is too strict
    for a 10-season smoke sample.
- If report output does not expose enough evidence, add compact champion-streak
  diagnostics without changing simulation behavior.
- Choose exactly one narrow remedy:
  - fix a real dominance source if the same club is winning because of a bug or
    excessive structural advantage;
  - adjust anomaly scoring only if the evidence proves the current
    `champion_streak` policy is too strict for short smoke gates.
- Re-run the 50x10 smoke gate.
- Re-run strict balance.
- Append the adopted solution and observed metrics to the audit.

## What NOT to implement

- Do not change `table_points_spread_avg` thresholds.
- Do not change creator/assist concentration thresholds.
- Do not undo the Step 04 opportunity-volume rework.
- Do not change match scoring conversion probabilities.
- Do not hide a real champion-dominance collapse by simply downgrading it to a
  warning.
- Do not start the 250x30 final gate unless the 50x10 smoke gate passes.
- Do not add unrelated gameplay systems.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The `champion_streak` smoke-gate blocker is explained with evidence.
- Any remedy is narrow, deterministic, and tested.
- The 50x10 smoke gate passes.
- Table-spread failures remain cleared.
- Creator-concentration failures remain cleared.
- The project is allowed to attempt Step 06 final 250x30 gate.
