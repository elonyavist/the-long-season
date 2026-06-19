# CLI Inspection And Stat Completeness Steps

## Goal

Make the CLI a cleaner and more complete inspection tool for deterministic season and match output before moving to UI, storage browsing, or larger management systems.

## Why we implement it this way

Phase 5 made structured match detail visible through `simulate-season --fixture=<fixtureId>`, but the current output still has two practical gaps.

First, `--fixture` prints the full season table before the match detail. That is useful for the normal season view but noisy when the user wants to inspect one match. A direct fixture view should be concise and easy to read in a terminal.

Second, player match stats are intentionally incomplete: non-goal shot events do not yet identify the shooter, so per-player `shots` and `shotsOnTarget` are credited only for goals. Before building UI, player ratings, save memory, or richer reports, the project should close that data gap with durable event data and CLI-visible proof.

This phase keeps the same deterministic aggregate match engine. It improves inspection, event attribution, and stat derivation without changing scoring calibration, adding UI, or introducing full possession chains.

## What to implement

- Make fixture-level CLI inspection concise and independent from the full season table.
- Attribute shot takers for all durable shot outcome events where the current aggregate engine can do so deterministically.
- Complete per-player match stats from durable match reports.
- Improve fixture player-stat rendering so it is useful for manual review.
- Add minimal season-level assist/save summaries only after the underlying match data is complete.
- Preserve deterministic ordering and stable IDs in every output.
- Keep CLI rendering separate from engine/domain data contracts.

## What NOT to implement

- Do not add React UI, ticker UI, Web Worker, Tauri, SQLite, save browsing, persistence, or storage migrations in this phase.
- Do not add live match sessions, pause controls, team talks, substitutions, cards, injuries, fatigue, minutes played, player ratings, xG, possession, passes, tackles, fouls, or tactical changes.
- Do not implement full possession chains, full duel chains, rebound logic, goalkeeper mistakes, penalties, set-piece assignment, or rendered commentary prose.
- Do not implement market, growth, staff, youth, facilities, economy, board pressure, media, manager career, or save progression.
- Do not add real football data, real identities, scraped datasets, or licensed competition names.
- Do not change scoring rates, conversion probabilities, calibration targets, or team-strength generation unless a specific active step proves this phase caused measurable drift.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md`
- `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md`
- `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md`
- `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md`
- `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 06 has a documented incremental path from cleaner fixture inspection to complete current player shot/save/assist stats.
- The first active step is a narrow CLI presentation improvement.
- Shot-taker attribution and stat completion are split into separate steps.
- UI, storage browsing, live match-day, ratings, cards, injuries, and management systems remain outside this phase.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md`. Implement only the fixture-only CLI output refinement. Do not add shooter attribution, stat completion, UI, storage, ratings, or new match mechanics. Update `docs/PROJECT_STATUS.md` and stop.
