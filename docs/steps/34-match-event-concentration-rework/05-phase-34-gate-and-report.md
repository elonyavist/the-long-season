# Step 05 - Phase 34 Gate And Report

## Goal

Close Phase 34 by running the final long-run gate and deciding whether the project can return to broader career simulation work.

## Context

Phase 34 exists only because Phase 33's final gate had one creator-concentration failure. This step must prove that the narrow rework fixed that blocker without weakening the project gates.

## Expected files

- `docs/audits/MATCH_EVENT_CONCENTRATION_REWORK_REPORT.md`
- `docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run:
  - `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=250 --seasons=30 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`
- Record:
  - pass/fail status;
  - failed worlds;
  - warning worlds;
  - creator/assist concentration metrics;
  - youth/squad structural checks;
  - match balance result.
- Run strict balance after the gate.
- Write `docs/audits/MATCH_EVENT_CONCENTRATION_REWORK_REPORT.md`.
- Decide the next single active step:
  - if 250x30 passes, return to the long-run career validation path;
  - if it fails, create one more narrow anomaly step with exact seeds and causes.

## What NOT to implement

- Do not start the next phase.
- Do not change thresholds.
- Do not hide failed worlds.
- Do not add UI.
- Do not add market/youth/player-generation changes.

## Required checks

- `pnpm check`
- `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=250 --seasons=30 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- `MATCH_EVENT_CONCENTRATION_REWORK_REPORT.md` exists.
- `250` x `30` has no `top_creator_goal_share_max` failures.
- Match balance still passes.
- Phase 34 is marked complete or blocked with exact failing seeds.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
