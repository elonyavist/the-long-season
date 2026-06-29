# Match Consequences State Audit

Date: 2026-06-29
Phase: `64-match-consequences-and-player-state-reactivity`
Step: `01-current-player-state-and-match-consequence-audit`

## Scope

This audit maps the current selected-club matchday flow before adding post-match
form and morale consequences. It is intentionally limited to existing structured
facts and existing persisted player state.

## Current Player State

`PlayerDynamicState` already persists three volatile values on the 0-100 scale:

- `fitness`: physical readiness.
- `form`: recent performance state.
- `morale`: current morale state.

Initial state is expected to be `fitness=100`, `form=50`, and `morale=50`.
Season rollover already resets fitness/form and normalizes morale toward neutral.

## Current Matchday Flow

The CLI career path uses `advanceCareerNextFixture` as the selected-club adapter:

1. Validate that the selected club has saved match preparation.
2. Find the next selected-club fixture.
3. Apply pre-match weekly fitness recovery to the selected club roster.
4. Build team contexts from the recovered player state.
5. Call engine `progressNextCareerFixture`.
6. Retarget match preparation to the next selected-club fixture.

The engine path inside `progressNextCareerFixture` currently:

1. Finds the next selected-club fixture.
2. Validates that both team contexts exist.
3. Simulates the fixture and creates a durable `MatchReport`.
4. Applies the match result to the fixture.
5. Applies selected-starter condition consequences.
6. Advances the calendar date to the played fixture date.
7. Returns structured condition changes and the updated career state.

## Existing Consequences

Only fitness is currently changed by a played fixture:

- Selected starters spend the configured match fitness cost.
- Rested first-team players are included in the condition summary when available,
  but their fitness is not spent.
- Fitness recovery happens before the fixture, not after it.

There is no current post-match change to `form` or `morale`.

## Facts Already Available

The durable match report already contains language-agnostic structured facts
that can safely drive a small v1 consequence model:

- Final score and side-specific aggregate stats.
- Goal events with `scorerPlayerId`, optional `assistPlayerId`, and optional
  `creatorPlayerId`.
- Save events with `goalkeeperPlayerId` and optional `shooterPlayerId`.
- Miss and block events with optional shooter/defender IDs.
- Shot context with minute, side, quality, shot type, chance type, and
  on-target flag.

These facts are enough to react to result, goals, assists, saves, and clean
sheets without inventing narrative or hidden player psychology.

## Safe Integration Seam

The safe seam is immediately after `applyCareerFixtureConditionConsequences`
inside `progressNextCareerFixture`.

The new helper should:

- Receive copied player states after match fitness spend.
- Receive the selected club id, fixture, match report, and selected starter IDs.
- Mutate neither input state nor stable player entities.
- Return copied player states plus ordered structured consequence facts.
- Keep deterministic ordering by iterating selected starter IDs.

This keeps the engine authoritative for state changes while letting CLI and UI
render the returned facts however they need.

## Explicitly Missing Facts

The current data does not yet support these consequences safely:

- Substitute minutes or bench appearance effects.
- Bench dissatisfaction or unused-substitute morale.
- Injuries, suspensions, cards, training, team talks, promises, staff, media, or
  personality effects.
- Precise blame for conceded goals beyond aggregate team result.
- Opponent player state persistence during selected-club advancement, unless a
  later documented phase makes every club's dynamic state part of fixture
  progression.

These must stay out of Phase 64.

## Fun And Engine Risks

The main risk is overreacting to one result. A fun manager game needs player
state to be visible and responsive, but not so volatile that a single match
turns the squad into noise.

The v1 model should therefore:

- Use small bounded deltas.
- Reward clear individual facts such as goals, assists, and saves.
- Apply modest result context to starters.
- Avoid hidden bench penalties.
- Preserve the existing state-multiplier pathway so the next fixture can react
  naturally without adding advice text or auto-selection.

## Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked. Phase 64 is part of
the later engine/playability sequence, not a web section. No roadmap row is
applicable to mark done in this documentation-only audit step.

## Decision

Proceed to Step 02 and define a bounded post-match form/morale consequence
contract before source-code changes.
