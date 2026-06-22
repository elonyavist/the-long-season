# Step 04 - Long-Run Smoke Gate

## Goal

Validate the creator-concentration rework on the smaller long-run gate before attempting the expensive final gate.

## Context

The project uses a validation ladder. This step must pass `50` worlds x `10` seasons before moving to `250` worlds x `30` seasons.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run:
  - `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=50 --seasons=10 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`
- Record:
  - failed worlds;
  - warning worlds;
  - `top_creator_goal_share_max`;
  - `top_three_creator_goal_share_max`;
  - `top_assist_max`;
  - youth roster max/min checks;
  - active player population warning status.
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
- `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=50 --seasons=10 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The 50x10 gate passes.
- No `top_creator_goal_share_max` failures remain in the smoke gate.
- Any remaining warnings are documented and classified.
- The project is allowed to attempt the final 250x30 gate.
