# Step 05 - Multi-Fixture Condition Smoke

## Goal

Smoke-test repeated career fixture advancement to confirm condition consequences
remain visible and deterministic over multiple matchdays.

## Context

One match is not enough to prove the loop is fun. The user should see condition
drop across repeated fixtures when the same lineup keeps playing, making the
next lineup decision meaningful.

## Expected files

- `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- touched test/source files only if a narrow blocker fix is explicitly required
  by this step
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Create a fresh deterministic save for this phase if needed.
- Save first-team lineup and balanced tactic.
- Record initial squad condition.
- Advance at least two selected-club fixtures.
- Inspect squad condition after each advancement.
- Run one explained fixture advancement and confirm condition impact is tracked
  when expected.
- Record whether the output creates a meaningful rotation decision.
- Fix only narrow blockers needed for the smoke.
- Update audit and status.

## What NOT to implement

- Do not run huge long-run gates.
- Do not tune condition numbers unless the current result clearly harms
  playability and the step documents it.
- Do not add automatic rotation.
- Do not add UI.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli career --save=phase41-check --summary`
- `pnpm cli career --save=phase41-check --advance-next-fixture`
- `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase41-check --squad`
- `git diff --check`

## Definition of Done

- Repeated fixture advancement produces understandable condition changes.
- The manager can see why rotation matters.
- The audit records any remaining friction.
- `docs/PROJECT_STATUS.md` is updated.
