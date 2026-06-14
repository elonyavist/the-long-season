# Step Match

## Goal

Implement the deterministic one-minute match step that advances local `MatchSimulationState` and optionally emits structured events.

## Why we implement it this way

`requirements.md` requires one engine with two future drivers: batch simulation and interactive match-day. Building `stepMatch` first keeps the hot loop local and serializable while avoiding UI, Web Worker, and match session scope. The initial resolver is aggregate and can later be swapped for nominal duels.

## What to implement

- `MatchSimulationState` with minute, score, accumulated stats, and local state.
- `stepMatch(sim, rng)` returning next sim state, next RNG state if needed, events, and completion status.
- Per-minute Bernoulli chance generation for each team.
- Deterministic randomized home/away processing order per minute.
- `OccasionResolver` interface.
- `AggregateOccasionResolver` for Step 1.1 level resolution.
- Structured sparse events for kickoff, notable shot outcomes, half time, and full time only if those events are already defined in domain.

## What NOT to implement

- Do not implement player duel chains.
- Do not implement substitutions, team talks, commands, auto-pause, or interactive `MatchSession`.
- Do not update `GameState`.
- Do not generate prose text.
- Do not implement live UI statistics or ratings beyond minimal final stats.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/match-simulation-state.ts`
- `packages/engine/src/match-engine/occasion-resolver.ts`
- `packages/engine/src/match-engine/aggregate-occasion-resolver.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- Domain files only for serializable event/report types if needed.

## Required tests

- One step advances the minute exactly once.
- Same seed and context produce the same events and state.
- Stronger team produces more shots or goals over a large deterministic sample.
- Home/away processing order does not always favor the same side.
- `stepMatch` does not mutate the input simulation state.

## Definition of Done

- Match stepping is pure at the API boundary.
- The hot loop uses local simulation state, not `GameState`.
- Initial aggregate resolver exists behind an interface.
- No UI or interactive match-day code exists.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only one-minute match stepping from `docs/steps/01-match-engine/03-step-match.md`. Use an aggregate resolver behind an interface. Do not implement full match driver, UI, commands, or duel chains.
