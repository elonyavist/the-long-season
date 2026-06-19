# Match Event Detail Steps

## Goal

Make match reports more informative while keeping the simulator deterministic, language-agnostic, and CLI-first: shots should carry enough structured context to support assists, goalkeeper saves, player match stats, and richer fixture inspection.

## Why we implement it this way

Phase 4 made matches player-visible by attributing goals, exposing durable scorer IDs, aggregating season goal totals, and printing fixture details from the CLI. The next credibility gap is not a full match-day UI. It is event semantics: today a goal has a scorer, but the report cannot explain the shot type, whether a goal had an assist, which goalkeeper made a save, or how a player's match contribution should be summarized.

This phase keeps the current aggregate match engine in place and adds the smallest structured event detail needed by later ticker, UI, localization, player ratings, and narrative systems. The engine still emits data, never rendered prose.

This phase must not become the full nominal duel engine. It should add deterministic attribution and aggregation surfaces around the current engine, preserving current balance calibration unless an active step documents a measured regression.

## What to implement

- Extend shot outcome events with stable structured shot context.
- Attribute assists for eligible goals using deterministic side-local selection.
- Attribute saves to the defending goalkeeper when a save event occurs.
- Aggregate minimum player match stats from durable match reports.
- Improve CLI match/round detail output using the new structured data.
- Keep event payloads language-agnostic: IDs, enum keys, numbers, side markers, and schema versions.
- Preserve existing season table, scorer, and balance behavior unless a step explicitly documents expected output drift.

## What NOT to implement

- Do not implement live match sessions, UI, React, Web Worker, Tauri, SQLite, save browsing, or storage migrations in this phase.
- Do not implement full possession chains, tactical changes, substitutions, fatigue changes, injuries, cards, penalties, set-piece assignment, player ratings, or team talks.
- Do not implement market, growth, staff, youth, facilities, economy, board pressure, media, manager career, or save progression.
- Do not add real football data, real identities, scraped datasets, or licensed competition names.
- Do not store rendered text in domain events or match reports.
- Do not change scoring rates, conversion probabilities, calibration targets, or team-strength generation unless a specific active step proves this phase caused measurable drift.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `docs/steps/05-match-event-detail/01-shot-event-contract.md`
- `docs/steps/05-match-event-detail/02-assist-attribution.md`
- `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md`
- `docs/steps/05-match-event-detail/04-player-match-stats.md`
- `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 05 has a documented incremental path from richer shot events to CLI-visible match detail.
- The first active step changes only the durable event contract needed by later attribution work.
- Full duel chains, live match-day, UI, storage browsing, and management systems remain outside this phase.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/05-match-event-detail/01-shot-event-contract.md`. Implement only the richer structured shot-event contract. Do not add assists, goalkeeper save attribution, player match-stat aggregation, UI, storage, or full duel chains. Update `docs/PROJECT_STATUS.md` and stop.
