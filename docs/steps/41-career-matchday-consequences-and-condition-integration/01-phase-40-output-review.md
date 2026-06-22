# Step 01 - Phase 40 Output Review

## Goal

Review the Phase 40 audit and lock the exact condition/fatigue problem this
phase must solve.

## Context

Phase 40 concluded that the career loop is close to playable, but not ready for
serious UI because played career fixtures do not yet produce visible
condition/fatigue consequences.

## Expected files

- `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Read `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`.
- Create `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`.
- Record the exact Phase 40 blocker.
- Record what existing condition systems can be reused.
- Record what must stay out of scope.
- Confirm whether Phase 41 can proceed without a new product decision.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code in this review step.
- Do not design injuries, morale, or training.
- Do not add a broader fatigue model than Phase 41 needs.
- Do not start UI.

## Required checks

- `test -f docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `git diff --check`

## Definition of Done

- The audit states the Phase 41 blocker in user-facing terms.
- Reusable existing systems are identified.
- The next action is Step 02.
- `docs/PROJECT_STATUS.md` is updated.
