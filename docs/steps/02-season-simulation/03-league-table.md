# League Table

## Goal

Derive a deterministic league table from played fixture results and explicit competition rules.

## Why we implement it this way

`requirements.md` says the table is derived, not persisted. This prevents duplicated state and desync. Tie-breakers must be data-driven, with a final deterministic club ID fallback so the same seed always gives the same table ordering.

## What to implement

- `LeagueTableRow` type.
- `computeLeagueTable(clubIds, fixtures, fixtureIds, rules)`.
- Points, wins, draws, losses, goals for, goals against, goal difference.
- Tie-breakers: points, goal difference, goals for, then club ID fallback.
- Optional competition penalties only if already present in domain; otherwise leave a clear extension point.

## What NOT to implement

- Do not persist the table.
- Do not implement head-to-head tie-breakers yet.
- Do not implement playoffs, playouts, promotion, relegation, form table, or media summaries.
- Do not include unplayed fixture projections.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/league-table.entity.ts`
- `packages/engine/src/season-engine/league-table.ts`
- `packages/engine/src/season-engine/league-table.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/index.ts`

## Required tests

- Wins, draws, losses, goals, and points are computed correctly.
- Unplayed fixtures are ignored.
- Sorting follows points, goal difference, goals for, club ID.
- Tied rows have stable deterministic order.
- Input fixtures and club ID arrays are not mutated.

## Definition of Done

- League table is fully derived from fixture results.
- Deterministic fallback tie-breaker exists.
- No table state is stored in `GameState`.
- Tests cover ordering and scoring.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only derived league table computation from `docs/steps/02-season-simulation/03-league-table.md`. Do not persist tables or implement promotions, playoffs, or head-to-head rules.
