# Simulate Season CLI

## Goal

Create the first gameplay milestone command: `pnpm cli simulate-season --seed=demo-001`, printing a credible final table for one 18-team season.

## Why we implement it this way

`requirements.md` identifies this as the first useful gameplay milestone. The CLI is only a shell: it parses args, asks content for a minimal generated league, calls engine use-cases, and prints results. The flow must be deterministic and reusable by future clients.

## What to implement

- Minimal generated 18-team league in `content`.
- Minimal generated players and lineups if needed by match simulation.
- Engine use-case `simulateSeason(state, input)` or equivalent.
- CLI command `simulate-season`.
- `--seed` option with default fixed seed.
- Output final table, top scorer if available, best defense, and worst attack.
- Determinism test for same seed producing same table.

## What NOT to implement

- Do not add UI.
- Do not save games unless explicitly using existing JSON storage for debug output.
- Do not implement transfers, finances, contracts, growth, injuries, staff, youth, facilities, media, or multi-season progression.
- Do not scrape or import real football data.
- Do not implement CSV export unless required by a later report step.

## Allowed dependencies

- `packages/content -> domain, shared`
- `packages/engine -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `packages/content/src/generators/fake-clubs.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/league-system.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/index.ts`
- `apps/cli/src/commands/simulate-season.test.ts`

## Required tests

- `simulateSeason` completes one 18-team, 34-round season.
- Same seed produces same final table.
- No team plays twice in a round.
- Final table contains every club once.
- CLI command accepts `--seed`.
- CLI exits nonzero on invalid args.

## Definition of Done

- `pnpm cli simulate-season --seed=demo-001` runs.
- Output includes a final table.
- Same seed gives same output.
- No real data is used.
- No future-scope systems are introduced.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the first season simulation CLI milestone from `docs/steps/02-season-simulation/04-simulate-season-cli.md`. Generate fake data, call engine use-cases, and make `pnpm cli simulate-season --seed=demo-001` deterministic. Do not add UI, SQLite, or management systems.
