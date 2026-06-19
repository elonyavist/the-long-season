# Phase 7 Output Review

## Goal

Review the completed Phase 07 output and decide whether it is good enough to build tactic and lineup MVP work on top of it, or whether a narrow rework is needed first.

## Why we implement it this way

Phase 08 will introduce the first user-facing managerial input. If the current season and fixture outputs are already confusing, brittle, or statistically unsafe, tactic work would make debugging harder. This step creates a clean baseline before adding selectable lineups or tactical setup.

This is a review step. It should not introduce new tactic, lineup, or simulation code.

## What to implement

- Run and inspect current deterministic CLI outputs:
  - base season summary;
  - one fixture with goal creator context;
  - one fixture with block defender context;
  - strict balance report.
- Check whether Phase 07 output is coherent enough to build on:
  - season leaders are plausible;
  - fixture event rows remain compact and readable;
  - `creator=` appears only where it adds information beyond scorer/assist;
  - `defender=` appears on blocked shots where durable reports provide it;
  - player stats still line up with rendered events;
  - strict balance remains green.
- If current output is good enough, update `docs/PROJECT_STATUS.md` so the active step becomes `02-tactic-domain-contracts.md`.
- If rework is needed, document the blocker in `docs/PROJECT_STATUS.md` and stop.

## What NOT to implement

- Do not change code unless a tiny documentation correction is required.
- Do not implement tactic contracts, lineup contracts, engine builders, CLI tactic arguments, UI, persistence, live match-day, fatigue, morale, substitutions, cards, injuries, or management systems.
- Do not tune scoring, balance targets, fake content, team-strength spread, or conversion probabilities.
- Do not create Phase 09 docs.

## Allowed dependencies

- None. This is a review/documentation step.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` only if the review changes the next step scope.

## Required tests/checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm check` only if any source or test file is changed.

## Definition of Done

- `docs/PROJECT_STATUS.md` records whether Phase 07 output is good enough to build on.
- Any blocker or rework need is documented clearly.
- If there is no blocker, the next action points to `02-tactic-domain-contracts.md`.
- No tactic or lineup implementation has started.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Review the current Phase 07 outputs by running the required CLI checks. Do not implement tactic or lineup code. Update `docs/PROJECT_STATUS.md` with the review result, next active step, and anything I should manually inspect. Stop after this review.
