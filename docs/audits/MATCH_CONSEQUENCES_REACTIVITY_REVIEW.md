# Match Consequences Reactivity Review

Date: 2026-06-29
Phase: `64-match-consequences-and-player-state-reactivity`
Step: `06-next-fixture-reactivity-and-season-boundary-checks`

## Reactivity Path

The selected-club matchday path now has a complete state loop:

1. `advanceCareerNextFixture` loads the current career save.
2. Pre-match weekly recovery updates selected-club fitness.
3. Team contexts are built from the copied `playerStates`.
4. `progressNextCareerFixture` simulates and applies the fixture.
5. Starter fitness is spent.
6. Starter `form` and `morale` react to structured match facts.
7. The copied career state is persisted by the CLI adapter.
8. The next fixture context is built from that persisted copied state.

This means a heavy loss, a good scoring contribution, or a goalkeeper save
sequence can influence the next fixture through the existing team-strength
state multiplier curves when caller content supplies those curves.

## Bounded Effect

The post-match state module caps each player's movement per match:

- `form`: `-5..+5`.
- `morale`: `-4..+4`.
- final values clamped to `0..100`.

Team-strength curves remain caller-supplied. Phase 64 does not tune those curves
or inflate the effect. The result is enough to make player state matter without
letting one fixture dominate the long-run engine.

## User Value

This improves manager agency because match preparation is no longer isolated
from match consequences:

- A tired or low-morale team can become a real next-match problem.
- A player who scores or assists can carry visible short-term form.
- A goalkeeper can soften a bad result with saves.
- The CLI/UI can explain changes from stable facts instead of vague prose.

The feature remains inspectable rather than advisory. The manager still decides
how to react.

## Season Boundary

Season rollover remains the safety boundary:

- fitness resets to `100`;
- form resets to `50`;
- morale moves toward neutral by the existing rollover rule.

Focused tests now cover a post-match-like state (`fitness=92`, `form=48`,
`morale=47`) returning to a clean new-season baseline.

## Current Limits

Still out of scope:

- substitute minutes;
- bench dissatisfaction;
- injuries and suspensions;
- team talks;
- personality;
- training/staff;
- UI rendering;
- match balance tuning.

Those systems need their own durable facts before they can safely affect player
state.

## Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked. This is an
engine/playability verification step and has no web-section row to mark done.
