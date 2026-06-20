# Squad Selection And Formation Core Steps

## Goal

Turn the current demo lineup/tactic work into a real manager-facing squad selection core.

## Why we implement it this way

Phases 08-11 proved that the engine can accept selected lineups, tactic setups, manual tactical switches, fitness, and fixture lineup overrides. That is useful infrastructure, but it is not yet the core Football Manager/Scudetto loop.

The real loop is:

1. the user chooses a club with a concrete squad;
2. the squad has strengths and gaps;
3. the user chooses a recognizable formation;
4. the user selects 11 starters from the squad;
5. the game validates whether the squad fits the formation;
6. the game makes tactical-market consequences visible.

If a team has played with three center backs and wing backs, switching to a `4-4-2` should reveal a need for full backs. If a team has many wide players from a `3-4-3`, switching to a narrow central shape with a trequartista and two strikers should reveal surplus wide players and missing central creators/forwards. The game should not silently flatten these differences.

This phase is a consolidation phase. It should create the structural model that future market, scouting, training, tactical familiarity, and UI phases can build on.

## What to implement

- Review Phase 08-11 output before changing the model.
- Add a broad curated formation catalog based on common modern professional football shapes.
- Define the squad/formation/lineup contracts needed for:
  - a first-team squad of roughly 22 senior players;
  - 11 starters;
  - a bench/reserve group;
  - selected formation slots;
  - selected players assigned to those slots.
- Add position/role suitability so a player can be natural, adapted, weak, or invalid for a slot.
- Add squad-fit reporting for selected formations:
  - missing required positions;
  - weak depth;
  - surplus players;
  - players forced out of position;
  - likely future market needs.
- Add CLI inspection for one fake club and several formations.
- Keep the user in control: the system can validate, explain, and report needs, but it must not auto-pick the lineup or auto-buy players.
- Keep code minimal, deterministic, typed, and documented with TSDoc/JSDoc where useful for a junior developer.

## Formation catalog to support

The first catalog should be broad enough to cover common major-league tactical families without becoming a free positional editor.

Back four:

- `4-4-2`
- `4-4-1-1`
- `4-3-3`
- `4-2-3-1`
- `4-1-4-1`
- `4-1-2-1-2`
- `4-3-1-2`
- `4-3-2-1`
- `4-5-1`
- `4-2-2-2`
- `4-2-4`

Back three:

- `3-5-2`
- `3-4-3`
- `3-4-1-2`
- `3-4-2-1`
- `3-1-4-2`
- `3-3-3-1`

Back five:

- `5-3-2`
- `5-4-1`
- `5-2-3`
- `5-2-1-2`
- `5-2-2-1`

The catalog should define slot needs, not only names. For example, a `4-4-2` needs left/right full backs, while a `3-4-3` can naturally need wing backs or wide midfielders depending on the slot model.

## What NOT to implement

- Do not implement the transfer market in this phase.
- Do not implement buying, selling, loans, contracts, agents, scouting, or AI club market behavior.
- Do not implement automatic best-XI selection, automatic rotation, automatic tactical recommendations, or AI squad planning.
- Do not add a free-form formation editor.
- Do not add substitutions, injuries, suspensions, staff, youth, training, tactical familiarity, morale effects, form effects, UI, persistence, or career saves.
- Do not change match scoring rates, balance targets, calendar generation, or fake content strength spread unless a documented step proves a measured regression.
- Do not remove Phase 08-11 behavior unless the active step explicitly replaces it and tests the migration.
- Do not leave dead code, compatibility leftovers, unused helpers, duplicated logic, or undocumented cleanup behind.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `simulation-tools -> domain, engine, shared`

## Expected files

- `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md`
- `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md`
- `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md`
- `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md`
- `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md`
- `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 12 has a documented path from Phase 11 review to CLI-visible formation/squad fit inspection.
- The phase captures the core design rule: squad building and formation choice must create meaningful trade-offs.
- The formation catalog is broad and curated, not a free-form editor.
- The system reports squad gaps and surplus players without auto-solving them.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md`. Review current Phase 11 output before implementing the formation/squad core. Update `docs/PROJECT_STATUS.md` with the decision and stop.
