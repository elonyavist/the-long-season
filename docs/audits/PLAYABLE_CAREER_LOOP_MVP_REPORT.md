# Playable Career Loop MVP Report

Date: 2026-06-21

Phase: `23-playable-career-loop-mvp`

Status: Complete

## Executive Summary

Score after Phase 23: 98 / 100

The project now has a narrow but real save-driven career loop:

- create a new generated career world;
- load a career summary from the save;
- inspect selected club state;
- apply a durable manual transfer decision;
- advance the selected club's next fixture;
- reload the save and see persisted consequences.

This is close enough to the current `100 / 100` milestone for the CLI-first playable loop. It is not a complete game, but the core state loop is now proven end to end.

The remaining 2 points are intentionally not hidden: fixture advancement currently uses an MVP default lineup derived from persisted roster order because career saves do not yet store the user's selected lineup and tactic as the active match-preparation decision.

## What Changed In Phase 23

### Save Summary

`pnpm cli career --save=<saveId> --summary` now reads an existing save and prints:

- save ID and save directory;
- world seed and generator version when available;
- current date and current season;
- selected club;
- selected club roster size;
- selected club transfer funds;
- next unplayed selected-club fixture.

New career worlds now persist the initial deterministic fixture calendar, so summary and progression operate from saved state instead of a regenerated season output.

### Next Fixture Contract

`findNextCareerFixture(careerState)` was added in the engine layer.

It returns typed results:

- `found`;
- `none`;
- `invalid`.

It reads explicit fixture order from `gameState.fixtureIds`, does not mutate state, and is independent from CLI and storage.

### Fixture Progression

`progressNextCareerFixture(input)` was added in the engine layer.

It:

- uses `findNextCareerFixture`;
- receives match-ready team contexts from the caller;
- simulates exactly one selected-club fixture;
- creates a durable match report;
- applies the report to a copied game state;
- returns a copied career state;
- does not write storage;
- does not choose lineup, tactic, market, or unrelated fixtures.

### Save-Writing Career Advance

`pnpm cli career --save=<saveId> --advance-next-fixture` now:

- loads the save;
- builds deterministic MVP team contexts from persisted roster/player state;
- advances the selected club's next fixture;
- writes the updated save only when the fixture is advanced;
- prints fixture result and next selected-club fixture.

### Decision Continuity

The accepted permanent-transfer demo now has automated continuity coverage:

- transfer is applied and persisted;
- roster/budget/history are visible;
- a fixture is advanced;
- the save is reloaded;
- roster/budget/history remain visible after time passes.

## Verified Commands

Playable-loop smoke:

```sh
pnpm cli career --save=phase23-loop-world --seed=world-a --new-world-preview
pnpm cli career --save=phase23-loop-world --summary
pnpm cli career --save=phase23-loop-world --advance-next-fixture
pnpm cli career --save=phase23-loop-world --inspect
```

Observed result:

- summary loaded `save:phase23-loop-world`;
- next fixture before advance was `fixture:000003 PRO10 vs PRO01`;
- advance produced `PRO10 3-0 PRO01`;
- inspect after reload showed `Selected club played fixtures: 1`.

Continuity smoke:

```sh
pnpm cli career --save=phase23-continuity-transfer --seed=demo-001 --apply-market-demo=pro01-affordable-permanent
pnpm cli career --save=phase23-continuity-transfer --summary
pnpm cli career --save=phase23-continuity-transfer --advance-next-fixture
pnpm cli career --save=phase23-continuity-transfer --inspect
```

Observed result:

- transfer persisted `Nico Albanesi` from `PRO18` to `PRO01`;
- selected club roster stayed at `23`;
- selected club funds stayed at `EUR 4223480.99`;
- transfer history remained visible after fixture advancement;
- selected club played fixtures became `1`.

Balance gate:

```sh
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Observed result:

- status: `PASS`;
- goals per match: `2.863`;
- first-place points: `70.350`;
- table points spread: `46.400`;
- upset proxy rate: `0.338`.

Full gate:

```sh
pnpm check
```

Observed result:

- lint passed;
- dependency boundaries passed;
- localized text check passed;
- `51` test files passed;
- `373` tests passed;
- workspace typecheck passed.

## What Is Fun Enough Now

The current loop has the first real manager-game rhythm:

- a career save exists and is loaded repeatedly;
- a generated squad feels tied to the save;
- budget and roster state can change;
- a match result can happen from that save;
- the next fixture changes after a result;
- reloading the save shows durable consequences.

This is enough to stop treating the project as only a simulation sandbox. It is now a playable CLI prototype.

## What Still Feels Missing

The main missing piece is not more match math. It is manager agency inside the career save.

Current limitation:

- career fixture advancement uses an MVP default 4-4-2 lineup from saved roster order;
- selected lineup and tactic are not yet stored as the active career setup;
- the user cannot yet prepare a match from the career command by choosing starters and tactic, then advance using that saved decision.

Secondary missing pieces:

- no fixture-by-fixture inbox/calendar view;
- no multi-fixture date advancement;
- no injuries/suspensions;
- no scouting/youth intake;
- no market search or negotiation loop;
- no UI.

These are not blockers for Phase 23 completion. They are future product depth.

## Risks

### Accepted MVP Shortcut

The CLI career advance uses a deterministic default lineup until career setup persistence exists. This is acceptable for Phase 23 because the goal was save progression, not match preparation.

This shortcut should not become permanent.

### Save Schema Maturity

Career state is still schema version `1`. The next phase should extend it carefully if active lineup/tactic setup becomes durable.

### CLI-Only Playability

The loop is proven in CLI. UI should still wait until the career decisions are represented as reusable domain/storage state.

## Next Phase Recommendation

Recommended next phase:

`Phase 24 - Career Match Preparation Persistence`

Goal:

Persist the user's selected lineup and tactic inside the career save, expose CLI commands to inspect/change them, and make `--advance-next-fixture` use the saved setup instead of the temporary default lineup.

Why this next:

- it directly improves the core manager fantasy;
- it removes the biggest Phase 23 shortcut;
- it keeps the user, not the system, responsible for who plays and how;
- it builds on existing Phase 8, 9, 11, and 12 contracts;
- it should happen before youth, scouting, deeper market, or UI.

Out of scope for the next phase:

- youth intake;
- scouting fog;
- loans/contracts/wages;
- market search;
- UI;
- automatic lineup/tactic AI.

## Decision

Phase 23 is complete.

The current milestone is close enough to `100 / 100` for the first playable career loop: `98 / 100`.

Do not start the next phase until `Phase 24 - Career Match Preparation Persistence` is documented with incremental steps.
