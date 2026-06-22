# Step 06 - Phase Report And Next Decision

## Goal

Close Phase 41 by deciding whether the career matchday loop is ready for a first
UI prototype or whether one more core gameplay blocker must be fixed.

## Context

Phase 41 should make the matchday loop consequential. This final step must not
start UI work; it should report whether the core loop now deserves UI work.

## Expected files

- `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Summarize what condition consequences now do.
- Summarize what the manager can understand after a match.
- State whether the loop now supports a first UI prototype.
- List remaining blockers, if any.
- Recommend exactly one next phase direction.
- Do not start that phase.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code in the final report step.
- Do not start UI implementation.
- Do not recommend multiple parallel next phases.
- Do not hide remaining friction.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli career --save=phase41-check --summary`
- `pnpm cli career --save=phase41-check --advance-next-fixture`
- `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase41-check --squad`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Phase 41 has a complete final report.
- The report states whether first UI prototype work is justified next.
- The report names the single best next phase.
- `docs/PROJECT_STATUS.md` records Phase 41 as complete or blocked.
