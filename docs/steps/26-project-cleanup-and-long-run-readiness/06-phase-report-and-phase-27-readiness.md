# Step 06 - Phase Report And Phase 27 Readiness

## Goal

Close Phase 26 and confirm that Season Rollover Foundation is the next active phase.

## Context

This phase is successful only if it reduces noise and makes the long-run simulation path clearer. The next phase should not start until the cleanup report says the project is ready.

## Expected files

- `docs/audits/LONG_RUN_READINESS_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Summarize what was archived or deleted.
- Summarize the active report/index structure.
- Summarize the current engine baseline.
- Summarize long-run metrics.
- Confirm whether Phase 27 can start.
- If Phase 27 is blocked, state the blocker.

## What NOT to implement

- Do not start Phase 27 code.
- Do not add new gameplay.
- Do not add UI.

## Required checks

- `find docs -maxdepth 4 -type f | sort`
- `rg -n "CURRENT_ENGINE_BASELINE|LONG_RUN_METRICS_SPEC|LONG_RUN_READINESS_REPORT" docs`
- `git diff --check`

## Definition of Done

- Phase 26 report exists.
- `docs/PROJECT_STATUS.md` points to the first Phase 27 step.
- The active documentation path is cleaner than before the phase.

