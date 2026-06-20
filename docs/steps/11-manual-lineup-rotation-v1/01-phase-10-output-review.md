# Phase 10 Output Review

## Goal

Review the completed Phase 10 condition output before adding manual lineup rotation.

## Why we implement it this way

Manual lineup rotation should build on a trusted fitness baseline. Phase 10 currently shows that a fixed PRO01 lineup starts at fitness `100`, spends `8` after a match, recovers to `100` before the next weekly fixture, and ends the season at `92` after the final match.

Before introducing alternate lineups, this step confirms that the existing condition output is clear enough to compare first-team and rotated selections later.

## What to implement

- Run and inspect the current default season output.
- Run and inspect the current condition demo:
  - `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- Confirm whether the output clearly shows:
  - selected club;
  - lifecycle enabled;
  - fitness rules;
  - first selected fixture;
  - post-match fitness;
  - recovery before the next selected fixture;
  - final starter fitness.
- Record the decision in `docs/PROJECT_STATUS.md`.
- If the condition output is unclear, document the required correction in the next relevant Phase 11 step before implementing lineup profiles.

## What NOT to implement

- Do not add lineup profiles in this step.
- Do not modify engine, content, or CLI code unless the review discovers a blocking bug in existing output.
- Do not add automatic lineup selection, rotation recommendations, substitutions, injuries, form, morale, training, UI, persistence, or career mode.
- Do not change fitness rules, scoring calibration, or fake content strength spread.

## Allowed dependencies

- None unless a blocking bug is discovered and fixed inside the files already responsible for Phase 10 output.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` only if a lesson learned changes the next step scope.

## Required tests/checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Phase 10 output is accepted or a blocker is documented.
- `docs/PROJECT_STATUS.md` records the decision and next action.
- No lineup implementation starts before this review is complete.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review the Phase 10 condition output only. Do not add lineup code. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what I should inspect, and stop.
