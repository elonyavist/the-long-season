# 01 - Phase 41 Output Review

## Goal

Review Phase 41 output and document the precise recovery problem before implementing new logic.

## Expected files

- `docs/audits/CAREER_WEEKLY_RECOVERY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`.
- Confirm what Phase 41 already provides:
  - selected-club match preparation;
  - fixture advancement;
  - persisted match results;
  - condition spend for selected starters;
  - condition summaries in career output.
- Document the blocker:
  - current matchday condition can drain across selected fixtures;
  - recovery between fixtures is not yet part of career progression;
  - the user needs visible readiness before matchday to make lineup decisions.
- Identify reusable existing code:
  - `DEFAULT_FITNESS_RULES`;
  - `recoverFitnessForPlayers`;
  - career calendar dates;
  - selected-club fixture advancement;
  - match preparation.
- Define the playability target:
  - normal weekly gaps should usually restore players enough for repeated selection;
  - congested short gaps should still produce fatigue pressure;
  - the system must expose state, not advice.
- Keep the audit deterministic and concise.

## What NOT to implement

- Do not change source code.
- Do not tune condition numbers.
- Do not add injuries, morale, training, or staff modifiers.
- Do not add UI.

## Required checks

- `test -f docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `git diff --check`

## Definition of Done

- The audit explains why Phase 42 is needed.
- The audit separates real gameplay risk from missing implementation.
- `docs/PROJECT_STATUS.md` points to the next step after completion.

