# Calendar Generation

## Goal

Generate a deterministic double round-robin calendar for one competition using explicit ordered club IDs and epoch-day dates.

## Why we implement it this way

The global game clock is date-first. `requirements.md` requires fixtures to have both `date` and `roundNumber`, with round as sporting metadata, not the world clock. The first calendar is intentionally simple: one round every seven days, no cups, no breaks, no rescheduling.

## What to implement

- `Fixture` and `Round` domain types if missing.
- `generateRoundRobinCalendar(input)` in engine.
- Deterministic club shuffle using `deriveRng(seed, "schedule", seasonId, competitionId)`.
- Berger circle method for first half.
- Mirrored return fixtures with home/away inverted.
- Round dates starting from `seasonStartDate` and adding seven days.
- Explicit fixture ID generation that is stable, non integer-like, and follows the domain namespace convention (`fixture:000001`).

## What NOT to implement

- Do not simulate fixtures.
- Do not compute league tables.
- Do not implement cup fixtures, playoffs, playouts, postponements, TV scheduling, or international breaks.
- Do not persist calendars to storage.
- Do not use JavaScript `Date`.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/competition.entity.ts`
- `packages/domain/src/entities/fixture.entity.ts`
- `packages/engine/src/season-engine/calendar.ts`
- `packages/engine/src/season-engine/calendar.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/index.ts`

## Required tests

- For 18 clubs, generate 34 rounds.
- Each pair plays twice.
- Home and away are inverted in return fixtures.
- No club plays twice in the same round.
- Same seed produces same fixture order.
- Different seed can produce different fixture order.
- Dates advance by seven days.

## Definition of Done

- Calendar is deterministic.
- Fixture order uses explicit arrays.
- Generated fixture IDs use the `fixture:` namespace.
- `roundNumber` and `date` both exist.
- No match simulation or table logic exists in this step.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only deterministic double round-robin calendar generation from `docs/steps/02-season-simulation/01-calendar-generation.md`. Do not simulate matches, compute tables, or add CLI commands.
