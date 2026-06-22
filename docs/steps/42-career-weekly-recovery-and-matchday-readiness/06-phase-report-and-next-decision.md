# 06 - Phase Report And Next Decision

## Goal

Finalize Phase 42 with a clear report on whether weekly recovery makes the career matchday loop more playable and what should happen next.

## Expected files

- `docs/audits/CAREER_WEEKLY_RECOVERY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Summarize the adopted recovery solution.
- Summarize the repeated-fixture smoke results.
- Record whether the user can now inspect:
  - saved lineup;
  - saved tactic;
  - next fixture;
  - pre-match readiness;
  - match consequence;
  - post-match condition.
- Record any remaining concern that affects fun:
  - no schedule congestion yet;
  - recovery too generous;
  - recovery too harsh;
  - CLI still too noisy;
  - missing UI slice.
- Recommend one next phase only.
- Update `docs/PROJECT_STATUS.md` to mark Phase 42 complete or blocked.

## What NOT to implement

- Do not start the next phase.
- Do not add new features.
- Do not tune balance without a documented blocker.
- Do not create advisory manager text.

## Required checks

- `pnpm check`
- `pnpm cli career --save=phase42-check --summary`
- `pnpm cli career --save=phase42-check --squad`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Phase 42 status is complete or blocked with a concrete reason.
- The audit explains whether the career loop is more playable.
- The next action is explicit and limited to one recommended phase.

