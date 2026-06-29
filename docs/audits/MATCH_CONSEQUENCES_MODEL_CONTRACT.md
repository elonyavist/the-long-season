# Match Consequences Model Contract

Date: 2026-06-29
Phase: `64-match-consequences-and-player-state-reactivity`
Step: `02-consequence-model-and-state-contract`

## Purpose

This contract defines the v1 post-match state model before implementation. The
goal is not to make every player emotion realistic immediately; the goal is to
make played matches matter in a deterministic, explainable, football-plausible
way without adding unsupported systems.

## State Values

Phase 64 keeps the current fitness lifecycle unchanged:

- Pre-match weekly recovery remains outside the match result.
- Starter fitness spend remains the existing condition consequence.
- Rested players do not spend match fitness.

Phase 64 adds only two post-match changes:

- `form`: selected-club starter recent performance state.
- `morale`: selected-club starter confidence/mood state.

Both values must stay on the existing `0..100` `StateValue` scale.

## Participant Model

The v1 participant model is deliberately narrow:

- `starter`: a selected-club player present in the saved lineup/team context.
- Non-starters: no form/morale change in v1.
- Bench players: no bench-specific morale in v1 because the durable career save
  does not yet persist used substitutes, unused substitutes, or minutes.
- Opponent players: no selected-club career consequence in v1.

This keeps the feature honest: only players with durable participation facts are
changed.

## Stable Reason Keys

Reason keys are machine-readable facts. They are not user-facing labels and must
be localized by presentation layers.

V1 reason keys:

- `result_win`
- `result_draw`
- `result_loss`
- `team_clean_sheet`
- `team_heavy_loss`
- `player_goal`
- `player_assist`
- `goalkeeper_saves`

Negative individual blame is excluded in v1 because the match report does not
yet contain reliable blame facts for conceded goals or defensive mistakes.

## Delta Budget

Per-player deltas are capped after all reasons are combined:

- `form`: minimum `-5`, maximum `+5` per match.
- `morale`: minimum `-4`, maximum `+4` per match.

State values are then clamped to `0..100`.

The default v1 reason weights are:

| Reason | Form delta | Morale delta | Notes |
|---|---:|---:|---|
| `result_win` | `+1` | `+2` | Applied to all selected-club starters. |
| `result_draw` | `0` | `0` | Recorded only when useful for summary; no state change. |
| `result_loss` | `-1` | `-2` | Applied to all selected-club starters. |
| `team_clean_sheet` | `+1` | `+1` | Applied to all selected-club starters in v1; can become role-specific later. |
| `team_heavy_loss` | `-1` | `-1` | Applied when goal difference is `-3` or worse. |
| `player_goal` | `+3` | `+2` | Applied once per goal, then capped. |
| `player_assist` | `+2` | `+1` | Applied once per assist, then capped. |
| `goalkeeper_saves` | `+1` to `+2` | `+1` | Applied when selected-club goalkeeper has at least 2 saves; form bonus is capped at 2. |

These numbers are intentionally modest. They give visible short-term movement
without letting one fixture dominate long-run squad quality.

## Determinism

Implementation must be deterministic:

- Iterate selected starter IDs in lineup order.
- Deduplicate starter IDs before applying changes.
- Count match report events from the durable ordered event array.
- Use stable reason-key ordering.
- Do not use randomness.
- Do not use localized text inside engine facts.

## Structured Consequence Facts

The engine result must expose player-level facts shaped for later CLI/UI use:

- `playerId`
- `participantRole`
- `beforeForm`
- `afterForm`
- `formDelta`
- `beforeMorale`
- `afterMorale`
- `moraleDelta`
- `reasonKeys`

It should also expose aggregate summary facts:

- changed player count;
- total form delta;
- total morale delta.

Presentation layers may decide whether to show all changes or a compact subset,
but the engine must not emit prose.

## Integration Contract

The helper must run after fixture result application and after starter fitness
spend. That ordering means:

1. The report decides what happened.
2. Fitness spend records who played.
3. Form/morale react to the same played fixture.
4. The next fixture team-strength derivation can use updated player states.

## Out Of Scope

The following are explicitly out of Phase 64:

- Injuries.
- Cards and suspensions.
- Team talks.
- Player personality.
- Promises.
- Training and staff effects.
- Market/economy effects.
- Automatic advice or lineup recommendations.
- Bench dissatisfaction without durable bench/minute facts.
- Match balance tuning.
- Player generation tuning.
- UI work.

## Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked. This step defines an
engine contract and has no web-section row to mark complete.

## Decision

Proceed to Step 03 and implement a pure engine module that applies this contract
without changing presentation code yet.
