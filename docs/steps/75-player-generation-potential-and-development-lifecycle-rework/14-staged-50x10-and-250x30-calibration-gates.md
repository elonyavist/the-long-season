# Step 14 - Staged 50x10 And 250x30 Calibration Gates

## Status

Done.

## Goal

Calibrate the complete lifecycle on small reproducible cohorts before the
operational `10000 x 50` gate.

## Inspectable Outcome

- The `50 x 10` diagnostic identifies defects quickly with named seeds.
- The `250 x 30` pre-gate proves credible generation, minutes, growth, decline,
  rarity, role adaptation, exits, and squad renewal.
- Every adjustment has one football reason and one owning module.

## Scope

1. Run the fixed-seed examples from Step 01 and compare them to the accepted
   contract, not to obsolete exact values.
2. Run `50` worlds for `10` seasons as a diagnostic cohort.
3. Investigate every hard failure and representative warning by seed/player.
4. Tune only content-owned generation policy or engine-owned lifecycle policy;
   do not create a cross-package coefficient layer.
5. Rerun focused tests after every adjustment.
6. Run `250` worlds for `30` seasons as the pre-release structural gate.
7. Verify no world has roster collapse, impossible potential gaps, physical
   floor breaches, duplicate development, youth overpopulation, or age-profile
   collapse.
8. Verify rare third-division prospects remain fun but genuinely rare.
9. Record all threshold values before running Step 15; Step 15 may not loosen
   them.

## Expected Files

- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-allocation.test.ts`
- `packages/content/src/generators/youth-development-level.ts`
- `packages/content/src/generators/youth-development-level.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `packages/engine/src/team-selection/ai-half-time-substitution.ts`
- `packages/engine/src/team-selection/ai-half-time-substitution.test.ts`
- `packages/engine/src/career/player-development-policy.ts`
- `packages/engine/src/career/player-development-policy.test.ts`
- `packages/engine/src/career/player-aging-policy.ts`
- `packages/engine/src/career/player-aging-policy.test.ts`
- `packages/engine/src/career/player-role-adaptation.ts`
- `packages/engine/src/career/player-role-adaptation.test.ts`
- `packages/simulation-tools/src/long-run/player-evolution.ts`
- `packages/simulation-tools/src/long-run/player-evolution.test.ts`
- `packages/simulation-tools/src/long-run/youth-stability.ts`
- `packages/simulation-tools/src/long-run/youth-stability.test.ts`
- `docs/audits/PLAYER_LIFECYCLE_REWORK_50X10_REPORT.md`
- `docs/audits/PLAYER_LIFECYCLE_REWORK_250X30_REPORT.md`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No threshold relaxation, seed filtering, warning suppression, or report-only
  cosmetic fix.
- No new gameplay system or UI.
- No global balance package.
- No final `10000 x 50` claim; Step 15 owns that gate.

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli ten-season-report --seed-prefix=phase75-diagnostic --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_50X10_REPORT.md
pnpm cli ten-season-report --seed-prefix=phase75-pre-gate --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_250X30_REPORT.md
pnpm cli balance-report --seed-prefix=phase75-balance --seasons=20 --target-profile=calibration-v1 --strict
git diff --check
```

## Completion Criteria

- `50 x 10` and `250 x 30` complete with no hard lifecycle or squad-structure
  failure.
- Remaining warnings are classified by football meaning and accepted only when
  they represent credible variety.
- Final thresholds are locked in the report.
- Step 15 is the single next action.

## Adopted Solution

- Ran the staged lifecycle gates without changing gameplay policy because both
  cohorts passed with zero hard failures.
- Preserved all anomaly thresholds and recorded them in the `50 x 10` and
  `250 x 30` audit reports before Step 15.
- Classified warning families as football meaning instead of hiding them:
  creator spikes and dynasty streaks are accepted story variance below fail
  thresholds, while useful-player and goals-per-match warnings remain monitor
  signals.
- Did not touch UI, global balance packages, seed filtering, warning
  suppression, or report-only formulas.

## Verification Result

- Node `24.16.0` `pnpm check` PASS.
- `pnpm cli ten-season-report --seed-prefix=phase75-diagnostic --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_50X10_REPORT.md` PASS with `0` failed worlds.
- `pnpm cli ten-season-report --seed-prefix=phase75-pre-gate --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_250X30_REPORT.md` PASS with `0` failed worlds.
- `pnpm cli balance-report --seed-prefix=phase75-balance --seasons=20 --target-profile=calibration-v1 --strict` PASS.

## Lesson Learned

- The complete lifecycle holds structurally through `250 x 30`: no roster
  collapse, missing natural goalkeepers, youth overpopulation, or active-player
  population collapse was observed.
- Step 15 must not loosen thresholds. If the `10000 x 50` gate finds a hard
  failure, it needs a focused rework rather than a closeout tuning shortcut.
