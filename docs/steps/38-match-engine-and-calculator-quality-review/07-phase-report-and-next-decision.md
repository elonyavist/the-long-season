# Step 07 - Phase Report And Next Decision

## Goal

Close Phase 38 with a clear decision: keep the current engine as-is, implement a
narrow rework phase, or move to the next product area.

## Context

The goal of this phase is not to keep producing diagnostics forever. It should
produce enough evidence to decide whether the match engine and calculator are
credible enough for continued career-loop work.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Summarize findings from Steps 01-06.
- State whether the calculator is currently good enough.
- List any blockers that harm user fun or football credibility.
- List non-blocking future diagnostics or UI needs.
- If a rework is needed, recommend a narrow next phase and explain the
  user-facing reason.
- If no rework is needed, recommend the next product direction.
- Run the required phase-level checks.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code behavior in the final report step.
- Do not start the next phase.
- Do not hide unresolved blockers.
- Do not recommend fixes only to make numbers prettier.
- Do not create broad roadmap documents unless evidence requires it.

## Required checks

- focused tests for touched files, if any
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Phase 38 has a complete final report.
- The report states whether the engine/calculator is currently acceptable.
- The next action is explicit.
- `docs/PROJECT_STATUS.md` records Phase 38 as complete or blocked.
- No next phase is implemented.
