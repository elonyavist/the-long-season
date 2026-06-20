# Phase 9 Output Review

## Goal

Review the completed Phase 09 manual tactic-switch output and decide whether it is good enough to build player fitness consequences on top of it, or whether a narrow rework is needed first.

## Why we implement it this way

Fitness is a cross-match consequence system. If the current tactical output is still confusing, adding dynamic player state would make debugging harder.

Phase 09 should be accepted as a stable baseline before Phase 10 starts modifying state between fixtures. In particular, the CLI must make it clear when a manual tactic switch applies to a fixture, which club it controls, and that the switch is user-declared rather than automatic.

This is a review step. It should not introduce player-state or simulation code.

## What to implement

- Run and inspect current deterministic CLI outputs:
  - default season summary;
  - fixture detail without a manual switch;
  - fixture detail with a non-applicable manual switch;
  - fixture detail with an applicable manual switch;
  - strict balance report.
- Verify:
  - default season output still works;
  - `--fixture=<fixtureId>` remains a clean fixture-focused view;
  - manual switch output shows selected club, initial profile, switch minute, target profile, applicability, and profile timeline;
  - no automatic tactical decision is implied by the output;
  - `calibration-v1` strict mode still passes.
- Decide whether Phase 09 can be used as the Phase 10 baseline.
- If current output is good enough, update `docs/PROJECT_STATUS.md` so the active step becomes `02-fitness-state-rules.md`.
- If rework is needed, document the blocker in `docs/PROJECT_STATUS.md` and stop.

## What NOT to implement

- Do not change code unless a tiny documentation correction is required.
- Do not add fitness, fatigue, form, morale, recovery, injuries, training, staff, player ratings, lineup automation, tactical automation, UI, persistence, economy, market, or career systems.
- Do not tune scoring, balance targets, fake content, team-strength formulas, or tactical profile values.
- Do not create Phase 11 docs.

## Allowed dependencies

- None. This is a review/documentation step.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` only if the review changes the next step scope.

## Required tests/checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm check` only if any source or test file is changed.

## Definition of Done

- `docs/PROJECT_STATUS.md` records whether Phase 09 output is good enough to build on.
- Any blocker or rework need is documented clearly.
- If there is no blocker, the next action points to `02-fitness-state-rules.md`.
- No player dynamic state implementation has started.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review the current Phase 09 outputs by running the required CLI checks. Do not implement player-state code. Update `docs/PROJECT_STATUS.md` with the review result, next active step, and anything I should manually inspect. Stop after this review.
