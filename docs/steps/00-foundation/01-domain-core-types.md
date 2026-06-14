# Domain Core Types

## Goal

Create the stable domain data contracts that future engine code will consume: branded IDs, `GameDate`, `Money`, `BasisPoints`, `AbilityValue`, minimal `Player`, minimal `Club`, dynamic player state, and `GameState`.

## Why we implement it this way

`domain` describes what exists in the game and imports nothing. Keeping core data stable early avoids migrations when the match engine grows from aggregate simulation to nominal duels. Runtime order must be explicit through ID arrays, and game time must be `GameDate`, not JavaScript `Date`.

## What to implement

- Branded string IDs for players, clubs, competitions, fixtures, seasons, and saves.
- `GameDate` as branded epoch-day number.
- `Money` as safe integer minor units with explicit constructors and operations.
- `BasisPoints` as branded integer percent representation.
- `AbilityValue` as current true value from `0` to `20`.
- `Player` with all 25 ability fields, potential fields, birth date, natural positions, and stable identity.
- `PlayerDynamicState` as separate volatile state: fitness, form, morale.
- `Club` with ID, name, ordered `playerIds`, basic reputation/category fields if needed.
- `GameState` with records for lookup and ordered ID arrays for simulation order.

## What NOT to implement

- Do not implement player generation.
- Do not implement scouting fog calculations.
- Do not implement match logic, team strength, lineups, contracts, transfers, finances, staff, youth, facilities, or events.
- Do not import from `shared`, `engine`, `content`, or `storage`.
- Do not use `Date`.

## Allowed dependencies

- `packages/domain -> nothing`

## Expected files

- `packages/domain/src/types/brand.ts`
- `packages/domain/src/types/ids.ts`
- `packages/domain/src/value-objects/game-date.ts`
- `packages/domain/src/value-objects/money.ts`
- `packages/domain/src/value-objects/rating.ts`
- `packages/domain/src/entities/player.entity.ts`
- `packages/domain/src/entities/club.entity.ts`
- `packages/domain/src/state/game-state.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/**/*.test.ts`

## Required tests

- `money()` rejects floats.
- `money()` rejects non-safe integers.
- `basisPoints()` rejects floats and out-of-range values.
- `abilityValue()` rejects values below `0` and above `20`.
- `GameState` fixture in a test uses ordered ID arrays, not record iteration.

## Definition of Done

- `domain` imports no local package.
- All core value-object constructors validate inputs.
- `GameState` separates lookup records from ordered ID arrays.
- Player abilities cover the full launch attribute set from `requirements.md`.
- Tests pass.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the domain core types from `docs/steps/00-foundation/01-domain-core-types.md`. Keep `packages/domain` dependency-free. Do not implement engine logic, content generation, storage, or UI.
