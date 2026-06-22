# Step 04 - Narrow Table Spread Rework

## Goal

Apply the smallest deterministic rework that addresses the proven
table-spread source.

## Context

This step may only implement the cause selected in Step 03. Examples of valid
narrow reworks include:

- preserving a clearer club-strength hierarchy during long-run turnover;
- preventing development/refresh from flattening all squads into the same band;
- adjusting content/team-strength variance if the audit proves it is too soft;
- improving lineup-strength calculation if it fails to reflect squad quality.

The step must not hide the anomaly by loosening validation.

## Expected files

- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Implement only the chosen narrow rework.
- Add tests proving:
  - the rework preserves determinism;
  - the intended table-spread source changes in the expected direction;
  - creator-concentration diagnostics remain unaffected or still pass on sampled
    worlds.
- Re-run the two failing worlds.
- Re-run strict balance.
- Append the adopted solution and observed metrics to the audit.

## What NOT to implement

- Do not change long-run thresholds.
- Do not remove `table_points_spread_avg` from the gate.
- Do not change creator/assist thresholds.
- Do not tune match scoring probabilities unless Step 03 explicitly proved
  that scoring-rate behavior is the source.
- Do not add new gameplay systems.
- Do not leave duplicate old/new calculation paths behind.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The selected table-spread source is reworked narrowly.
- The two failing worlds improve without threshold widening.
- Strict balance still passes.
- No creator-concentration failure is reintroduced in the sampled commands.
- `docs/PROJECT_STATUS.md` points to the smoke gate step.
