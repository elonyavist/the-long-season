# Manual Lineup Rotation V1 Steps

## Goal

Let the manager manually choose different lineups for selected fixtures and inspect the fitness/result consequences.

## Why we implement it this way

Phase 10 made player fitness visible, but the current fake season still uses the same fixed starters every match. With one match per week and high recovery, fatigue does not create a meaningful management decision yet.

The next useful step is not automatic rotation. In classic Football Manager and Scudetto-style play, the user chooses who plays. The game should provide prepared lineup options, apply explicit user choices, and show the consequences.

This phase should prove that lineup choice is a manager action:

1. the user selects a saved lineup profile;
2. the engine applies that explicit lineup for a fixture or planned fixture set;
3. starters spend fitness;
4. rested players recover;
5. the CLI shows enough information to inspect the choice.

## What to implement

- Review Phase 10 output and decide whether the current condition demo is a good baseline.
- Add deterministic lineup demo profiles for PRO01, such as first team and rotated/reserve options.
- Define a narrow season input contract for explicit fixture lineup overrides.
- Apply explicit lineup overrides during season simulation without automatic selection.
- Expose a CLI inspection path that shows:
  - selected club;
  - selected lineup profile;
  - fixture where the lineup is applied;
  - starters and rested players;
  - fitness consequences;
  - fixture result and final table context.
- Keep default season output unchanged unless an explicit lineup option is passed.
- Keep code minimal, well typed, deterministic, and documented with TSDoc/JSDoc where useful for a junior developer.

## What NOT to implement

- Do not add automatic rotation, AI lineup suggestions, fatigue-based selection, or "best XI" logic.
- Do not add arbitrary lineup editing UI or free-form CLI player selection.
- Do not add substitutions, injuries, suspensions, cards, form, morale, match ratings, training, tactical familiarity, staff, youth, growth, contracts, economy, market, scouting, UI, persistence, or career saves.
- Do not add automatic tactical switching based on score, minute, fatigue, or context.
- Do not tune scoring rates, conversion probabilities, fake content strength spread, or calibration target ranges unless a documented step proves a measured regression and captures the reason.
- Do not store rendered prose in domain events or reports.
- Do not leave dead code, compatibility leftovers, unused helpers, duplicated logic, or undocumented cleanup behind.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `simulation-tools -> domain, engine, shared`

## Expected files

- `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md`
- `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md`
- `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md`
- `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md`
- `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 11 has a documented incremental path from Phase 10 review to CLI-visible manual lineup rotation consequences.
- The phase preserves the rule that the user chooses who plays.
- Lineup demo profiles, engine contract, season wiring, and CLI inspection are split into separate steps.
- The phase explicitly bans automatic lineup selection.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md`. Review current Phase 10 condition output before implementing manual lineup rotation. Update `docs/PROJECT_STATUS.md` with the decision and stop.
