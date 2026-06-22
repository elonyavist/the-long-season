# Step 06 - Warning Semantics Decision Report

## Goal

Close Phase 36 with a decision table and a next action.

## Context

Steps 01-05 should classify every remaining warning type by gameplay meaning.
This final step must decide whether any warning requires code rework, threshold
redefinition, better diagnostics, or no immediate action.

## Expected files

- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Summarize all warning classifications:
  - `active_player_population`;
  - `top_assist_max`;
  - `top_creator_goal_share_max`;
  - `champion_streak`;
  - `table_points_spread_avg`.
- For each warning, record:
  - classification;
  - user-facing gameplay interpretation;
  - whether it is fun/credible/healthy;
  - whether it needs better diagnostics;
  - whether it needs future code rework;
  - proposed next action.
- State which warnings should remain as monitoring signals.
- State which warnings, if any, should become future rework steps.
- Run final checks.
- Update `docs/PROJECT_STATUS.md` with the next active step or “none selected”
  if the next phase still needs user confirmation.

## What NOT to implement

- Do not change game behavior in the final report step.
- Do not start the next phase.
- Do not mark a warning healthy without evidence from earlier steps.
- Do not create a cleanup/rework step unless the audit proves it is needed.

## Required checks

- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` has a final decision table.
- Every remaining Phase 35 warning has a gameplay interpretation.
- The next action is explicit and does not depend on chat context.
- `docs/PROJECT_STATUS.md` is updated.
