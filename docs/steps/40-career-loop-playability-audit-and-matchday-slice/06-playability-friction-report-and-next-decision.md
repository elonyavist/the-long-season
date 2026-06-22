# Step 06 - Playability Friction Report And Next Decision

## Goal

Close Phase 40 by deciding whether the project should move toward UI, fix one
core gameplay blocker, or run another focused simulation audit first.

## Context

The project should not keep adding CLI features indefinitely. This final step
turns the Phase 40 findings into a product decision grounded in whether the
manager loop is understandable and fun.

## Expected files

- `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Summarize the current playable career loop.
- List the main friction points in priority order.
- Separate blockers from nice-to-have improvements.
- State what already feels ready for UI.
- State what would be risky to expose in UI before fixing.
- Recommend exactly one next phase direction.
- Do not start that phase.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code in the final report step.
- Do not start UI implementation.
- Do not propose fixes only to improve reports.
- Do not recommend multiple parallel next phases.
- Do not ignore user fun in favor of mathematical neatness.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli career --save=phase40-check --summary`
- `pnpm cli career --save=phase40-check --advance-next-fixture`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Phase 40 has a complete final audit/report.
- The report states whether the current career loop is playable enough for UI.
- The report names the single best next phase.
- `docs/PROJECT_STATUS.md` records Phase 40 as complete or blocked.
