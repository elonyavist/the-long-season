# Phase 11 Output Review

## Goal

Review the completed Phase 11 manual lineup rotation output before replacing demo lineup concepts with the formation/squad core.

## Why we implement it this way

Phase 11 proved that a user-selected lineup can be applied to one fixture and that selected/rested players have visible condition consequences. Before adding a larger formation catalog and squad-fit model, we need to confirm what Phase 11 should keep and what should be treated as demo scaffolding.

The expected conclusion is that Phase 11 is technically useful but still too profile-based: `pro01-rotated` is a deterministic demo, not a real squad-selection workflow.

## What to implement

- Run and inspect:
  - `pnpm cli simulate-season --seed=demo-001`
  - `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
  - `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- Confirm whether Phase 11 clearly shows:
  - selected club;
  - selected lineup profile;
  - fixture applicability;
  - selected starters;
  - rested first-team players;
  - expected fitness impact;
  - match events and player stats for actual starters.
- Record what should carry forward:
  - explicit user-selected lineups;
  - no automatic selection;
  - fitness spend for actual starters;
  - fixture-level inspection.
- Record what must be replaced by Phase 12:
  - hardcoded PRO01 profile thinking;
  - generic `defender/midfielder/attacker` role-only formation representation;
  - lack of squad-depth analysis;
  - lack of formation slot requirements.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add formation contracts in this step.
- Do not modify engine, content, or CLI code unless the review discovers a blocking bug.
- Do not add automatic lineup selection, transfer market, free-form editing, substitutions, injuries, tactical familiarity, form, morale, UI, persistence, or career saves.
- Do not change balance, scoring, fitness rules, or fake content strength spread.

## Allowed dependencies

- None unless a blocking bug is discovered and fixed inside already responsible files.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md` only if a lesson learned changes the next step scope.

## Required tests/checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Phase 11 output is accepted or a blocker is documented.
- `docs/PROJECT_STATUS.md` records the decision and next action.
- No formation implementation starts before this review is complete.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review Phase 11 output only. Do not add formation code. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what I should inspect, and stop.
