# Player Stats And Match Detail Steps

## Goal

Turn the calibrated aggregate season simulator into a player-visible simulator: goals should belong to real players, reports should carry structured player references, and the CLI should expose top scorers and basic fixture detail.

## Why we implement it this way

Phase 3 made the macro football believable enough: goals per match, result split, first-place points, last-place points, table spread, and upset proxy all pass `calibration-v1`. The next missing gameplay signal is attachment. The current CLI still prints `Top scorer: unavailable in aggregate engine v1`, so seasons produce tables but not player stories.

This phase bridges the gap between aggregate match simulation and the later full nominal duel engine. It should add the smallest deterministic player attribution surface first, then carry that data through durable reports, season aggregation, and CLI inspection.

The phase must not become the full match-day or UI phase. It creates structured data that later ticker, UI, market, growth, and memory systems can consume.

## What to implement

- Attribute each goal to one player from the scoring side's explicit lineup.
- Extend structured match events only as needed to store player references.
- Aggregate minimum season player statistics from match reports.
- Replace the CLI top-scorer placeholder with real deterministic output.
- Add a minimal CLI inspection path for fixture results and basic match detail.
- Keep all data language-agnostic: IDs, numbers, structured event fields, no prose in engine or domain.
- Preserve current balance calibration unless a later active step proves a measurable drift.

## What NOT to implement

- Do not implement assists, cards, injuries, substitutions, fatigue changes, live pagelles, team talks, tactical changes, or full duel chains in this phase.
- Do not implement UI, React, Web Worker, SQLite, Tauri, localization, modding editor, market, staff, youth, facilities, economy, board pressure, or career profile.
- Do not add real football data or real identities.
- Do not make content import engine or engine import content.
- Do not store rendered text in match reports or events.
- Do not change scoring rates, conversion probabilities, or calibration targets unless a specific active step documents why.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md`
- `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`
- `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`
- `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`
- `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 04 has a documented incremental path from goal attribution to CLI-visible player statistics.
- The first active step is small enough to implement without report schema migration beyond its scope.
- Future match-day, UI, market, growth, and narrative systems remain outside this phase.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md`. Implement only deterministic goal attribution. Do not add assists, UI, persistence, full duel chains, or new gameplay systems. Update `docs/PROJECT_STATUS.md` and stop.
