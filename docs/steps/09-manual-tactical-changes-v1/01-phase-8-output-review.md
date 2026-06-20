# Phase 8 Output Review

## Goal

Review the completed Phase 08 tactic/lineup output and decide whether it is good enough to build manual tactic switching on top of it, or whether a narrow rework is needed first.

## Why we implement it this way

The current `--setup-demo=pro01-attacking` proves that setup overrides work, but it also shows that an aggressive setup used for an entire season can make PRO01 worse. That is not necessarily a bug: it is a signal that tactics should be used as manager-selected tools in context, not as hidden automatic behavior.

Before adding manual match switches, this step must record whether Phase 08 is acceptable as a technical baseline and whether profile names/output need a small cleanup.

This is a review step. It should not introduce new tactic switching or simulation code.

## What to implement

- Run and inspect current deterministic CLI outputs:
  - default season summary;
  - setup-demo season summary;
  - setup-demo fixture detail;
  - strict balance report.
- Compare default output against `--setup-demo=pro01-attacking`:
  - verify default output remains unchanged;
  - verify the setup demo clearly prints selected club, tactic values, and role changes;
  - verify the profile is understood as a demo/manual tactic option, not as an optimized season-long strategy.
- Decide whether Phase 08 can be used as the Phase 09 baseline.
- If current output is good enough, update `docs/PROJECT_STATUS.md` so the active step becomes `02-saved-tactic-demo-profiles.md`.
- If rework is needed, document the blocker in `docs/PROJECT_STATUS.md` and stop.

## What NOT to implement

- Do not change code unless a tiny documentation correction is required.
- Do not add saved tactic profiles, match segments, manual switch commands, live sessions, substitutions, fatigue, morale, cards, injuries, UI, persistence, or management systems.
- Do not tune scoring, balance targets, fake content, team-strength spread, or conversion probabilities.
- Do not implement automatic tactical decisions.
- Do not create Phase 10 docs.

## Allowed dependencies

- None. This is a review/documentation step.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` only if the review changes the next step scope.

## Required tests/checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm check` only if any source or test file is changed.

## Definition of Done

- `docs/PROJECT_STATUS.md` records whether Phase 08 output is good enough to build on.
- Any blocker or rework need is documented clearly.
- If there is no blocker, the next action points to `02-saved-tactic-demo-profiles.md`.
- No manual tactic switching implementation has started.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review the current Phase 08 outputs by running the required CLI checks. Do not implement new tactic switching code. Update `docs/PROJECT_STATUS.md` with the review result, next active step, and anything I should manually inspect. Stop after this review.
