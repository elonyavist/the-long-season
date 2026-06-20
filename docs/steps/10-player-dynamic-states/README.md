# Player Dynamic States V1 Steps

## Goal

Introduce the first real consequence across matches: player fitness/condition.

## Why we implement it this way

Phase 09 made tactical switching explicit and inspectable, but the simulator is still mostly stateless between fixtures. The same players can be selected every match with no physical cost, and intense tactical choices do not yet create a reason to manage the squad over time.

The domain already has `PlayerDynamicState` with `fitness`, `form`, and `morale`, and the engine already has optional state multiplier curves in `deriveTeamStrength`. Phase 10 should use that existing shape instead of inventing a second condition model.

This phase focuses only on fitness. Fitness is the safest first dynamic state because it has a concrete loop:

1. a player plays;
2. fitness decreases;
3. days pass;
4. fitness recovers;
5. low fitness slightly reduces performance.

Form and morale are intentionally left for later, because they need match ratings, results context, team talks, media, and player expectations to be meaningful.

## What to implement

- Review Phase 09 output and decide whether the manual tactic-switch inspection is good enough to build on.
- Define deterministic fitness spend and recovery rules over existing `PlayerDynamicState.fitness`.
- Make low fitness affect team strength through explicit multiplier curves.
- Apply fitness spend/recovery during season simulation in a narrow, optional way.
- Expose a CLI inspection path that lets a developer see fitness before/after matches and after calendar recovery.
- Preserve deterministic output and explicit ordering.
- Keep balance impact small enough that `calibration-v1` strict mode remains useful.

## What NOT to implement

- Do not implement injuries, form, morale, team talks, player ratings, staff effects, training, tactical familiarity, player growth, aging, contracts, economy, market, scouting, youth, facilities, board pressure, media, UI, storage, or career saves.
- Do not implement rotation recommendations or automatic lineup selection.
- Do not implement automatic tactical switching based on score, minute, fatigue, or context.
- Do not make fitness dominate ability. It should be a light cost, not a replacement for player quality.
- Do not tune scoring rates, conversion probabilities, fake content strength spread, or calibration target ranges unless a documented step proves a measured regression and captures the reason.
- Do not store rendered prose in domain state or match reports.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `simulation-tools -> domain, engine, shared`

## Expected files

- `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md`
- `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md`
- `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md`
- `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md`
- `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 10 has a documented incremental path from Phase 09 review to CLI-visible fitness consequences.
- The phase uses existing `PlayerDynamicState.fitness` instead of adding a duplicate state model.
- Fitness spend, recovery, strength impact, season lifecycle, and CLI inspection are split into separate steps.
- The phase explicitly bans injuries, form, morale, staff, training, and automatic lineup/tactic decisions.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md`. Review current Phase 09 output before implementing player dynamic states. Update `docs/PROJECT_STATUS.md` with the decision and stop.
