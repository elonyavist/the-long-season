# Step 05 - Table Spread Warning Audit

## Goal

Decide whether the remaining `table_points_spread_avg` warnings are healthy
tight leagues or lingering table-compression issues.

## Context

Phase 35 fixed the table-spread blocker:

- final `250x30` gate passes;
- no `table_points_spread_avg` failures;
- only `3` worlds warn on table spread;
- minimum world-average table spread is `35.67`, close to the pass threshold.

Some tight leagues should exist. The game becomes less fun if every league has
the same shape.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect table-spread warning worlds from the final report.
- Confirm whether they are:
  - slightly compressed but plausible;
  - repeatedly compressed across many seasons;
  - caused by low champion points;
  - caused by high bottom-club points;
  - caused by draw/upset patterns;
  - caused by strength hierarchy convergence.
- Use existing diagnostics first.
- Add report diagnostics only if the current output cannot answer the question.
- Update `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` with a decision.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not widen `table_points_spread_avg` thresholds.
- Do not tune match result separation further unless evidence shows a real
  recurring compression problem.
- Do not remove tight leagues just because they are warnings.
- Do not change scoring conversion probabilities.

## Required checks

- focused tests for touched files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`;
- `git diff --check`.

## Definition of Done

- The audit says whether table-spread warnings are healthy variance or future
  rework material.
- Any future action is justified by gameplay credibility, not threshold
  neatness.
