# Shared RNG And Date

## Goal

Create deterministic shared utilities for seeded RNG and pure Gregorian date conversion. These utilities are the only allowed source of randomness and game date arithmetic for engine code.

## Why we implement it this way

The engine must be reproducible: same seed, same output. `requirements.md` requires derived RNG streams by stable keys and epoch-day game dates. Date conversion must not depend on JavaScript `Date`, time zones, locale, or the real clock.

## What to implement

- `sfc32` PRNG implementation.
- Stable string hash seed function for derived streams.
- `deriveRng(seed, streamName, ...keyParts)` returning a deterministic RNG object.
- RNG methods for `nextFloat`, `nextInt`, and deterministic choice helpers if needed.
- Pure ISO `YYYY-MM-DD` to epoch-day conversion.
- Pure epoch-day to ISO conversion.
- `addDays` and `diffDays`.
- Optional `formatMoney(amount, currency, locale)` if needed by CLI output, but keep game logic out of shared.

## What NOT to implement

- Do not use `Math.random()` for simulation randomness.
- Do not use `Date`, `Date.now()`, `new Date()`, or time-zone APIs for game dates.
- Do not put football, economy, match, or content logic in `shared`.
- Do not create global RNG state.

## Allowed dependencies

- `packages/shared -> nothing`

## Expected files

- `packages/shared/src/rng/sfc32.ts`
- `packages/shared/src/rng/derive-rng.ts`
- `packages/shared/src/date-utils.ts`
- `packages/shared/src/number-utils.ts`
- `packages/shared/src/assert.ts`
- `packages/shared/src/errors.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/**/*.test.ts`

## Required tests

- Same seed and same stream key produce the same sequence.
- Same seed and different stream keys produce different sequences.
- Different key parts produce different sequences.
- `fromISO(toISO(day))` round-trips.
- Leap day `2000-02-29` round-trips.
- Years `1900` and `2100` are not treated as leap years.
- `addDays` and `diffDays` are stable across month and year boundaries.

## Definition of Done

- RNG has no global mutable stream.
- Date utilities do not use JavaScript `Date`.
- Shared contains no game-specific logic.
- Tests prove deterministic behavior.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only shared deterministic RNG and pure date utilities from `docs/steps/00-foundation/02-shared-rng-and-date.md`. Do not add engine, content, storage, UI, or gameplay logic.
