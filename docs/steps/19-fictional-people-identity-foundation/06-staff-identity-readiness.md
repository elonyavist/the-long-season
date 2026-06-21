# 06 - Staff Identity Readiness

## Goal

Prepare the identity foundation for future staff without implementing staff gameplay.

The requirements include staff, scouts, medical staff, sporting directors, and youth staff. This step should make sure the people identity model can support them later.

## What to review

- The new `PersonIdentity` contract.
- Name culture pools.
- Nationality distribution model.
- Requirements Area 8 for staff and scouting.
- Requirements Area 15 for president/media personalities.

## What to produce

- A short staff-identity readiness note in `docs/PROJECT_STATUS.md`.
- Optional lightweight documentation in the next report step if the review finds constraints for future staff phases.

## What NOT to implement

- Do not add staff entities unless the active step is explicitly re-scoped before implementation.
- Do not add staff gameplay.
- Do not add staff salaries, effects, assignments, scouting missions, or hiring flows.
- Do not add president, agent, or coach systems.
- Do not add UI.
- Do not add generated staff to current fake content.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md` only if a lesson learned changes future work.

## Required checks

- `rg -n "staff|scout|medico|preparatore|DS|responsabile vivaio|presidente|agent|procurator" requirements.md docs/PROJECT_STATUS.md packages`
- `pnpm check`

## Definition of Done

- The project records whether the current person identity model is sufficient for future staff.
- No staff gameplay is implemented.
- Any future staff identity constraints are captured before the report step.
- `docs/PROJECT_STATUS.md` records the review result and next action.
