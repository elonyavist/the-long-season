# Season Simulation Steps

## Goal

Define the path from deterministic calendar generation to the first gameplay milestone: `pnpm cli simulate-season --seed=demo-001`.

## Why we implement it this way

`requirements.md` makes season simulation the first useful proof that the engine can produce credible football outcomes. The season layer must derive tables from fixtures, keep fixture results as source of truth, use deterministic scheduling, and stay CLI-first with no UI or database.

## What to implement

- Implement these steps after foundation and minimal match simulation exist.
- Generate a simple double round-robin season.
- Apply match reports to fixture results.
- Derive league tables on demand.
- Add CLI season simulation only after engine use-cases exist.
- Add a first balance report with broad calibration targets.

## What NOT to implement

- Do not implement multi-league worlds.
- Do not implement promotion, relegation, playoffs, cups, finances, transfers, growth, or injuries.
- Do not implement UI, SQLite, Web Worker, Tauri, localization, or content packs beyond minimal test data.

## Allowed dependencies

- `packages/engine -> domain, shared`
- `packages/content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `simulation-tools -> domain, engine, shared` only when balance reporting is introduced.

## Expected files

- `docs/steps/02-season-simulation/01-calendar-generation.md`
- `docs/steps/02-season-simulation/02-fixtures-and-results.md`
- `docs/steps/02-season-simulation/03-league-table.md`
- `docs/steps/02-season-simulation/04-simulate-season-cli.md`
- `docs/steps/02-season-simulation/05-season-balance-report.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own tests.

## Definition of Done

- Season simulation step documents exist.
- First gameplay milestone is clearly reachable.
- Future systems remain out of scope.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Read `requirements.md`, `docs/PROJECT_RULES.md`, and `docs/steps/02-season-simulation/01-calendar-generation.md`. Implement only deterministic calendar generation. Do not implement match simulation or CLI commands in that step.
