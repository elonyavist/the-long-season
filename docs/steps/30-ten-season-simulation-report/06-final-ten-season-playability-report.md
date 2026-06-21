# Step 06 - Final Ten-Season Playability Report

## Goal

Close Phase 30 with an evidence-based decision about what to do after the long-run simulation milestone.

## Context

The project should not move to UI just because the next number exists. It should move only if the ten-season report shows the engine is credible enough to inspect visually.

## Expected files

- `docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run the ten-season report for at least two seeds.
- Record the observed metrics.
- Record anomalies.
- Score the current game world.
- Decide whether the next work should be UI exploration, engine tuning, market depth, youth/development, or another hardening phase.
- Recommend exactly one next phase.

## What NOT to implement

- Do not start the next phase.
- Do not hide bad results.
- Do not tune values inside the report step.

## Required checks

- `pnpm check`
- ten-season report for at least two documented seeds
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The final ten-season report exists.
- The report answers whether the game is credible enough to approach UI later.
- `docs/PROJECT_STATUS.md` records the next single recommended phase.

