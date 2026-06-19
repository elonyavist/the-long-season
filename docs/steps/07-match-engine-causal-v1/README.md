# Match Engine Causal V1 Steps

## Goal

Move the current player-attributed aggregate match engine toward a more causal nominal engine: match reports should explain which players were involved in an opportunity, not only assign plausible scorer, assist, shooter, and goalkeeper IDs after the outcome.

## Why we implement it this way

Phases 04-06 made match output player-visible and inspectable. The CLI can now show scorers, assists, saves, shots, shots on target, fixture detail, and season leaders. That is enough to inspect the simulator, but the current model is still mostly aggregate: the match engine decides an outcome first, then deterministic attribution helpers assign players around that outcome.

`requirements.md` says the match engine should eventually produce stories from nominal player interactions. This phase is the first narrow move in that direction. It should introduce causal opportunity participants and use them consistently, while keeping the existing aggregate scoring model and calibration stable.

This phase must still be CLI-first and deterministic. It must not become live match-day, tactical UI, player state, injuries, cards, substitutions, or a full possession-chain engine.

## What to implement

- Review the current Phase 06 output before changing code.
- Introduce a minimal engine-local causal opportunity actor model.
- Select chance creator, shooter, primary defender, and goalkeeper deterministically from explicit lineups.
- Use those actors consistently for current scorer, assist, shooter, save, and block attribution where the current aggregate engine can support it.
- Add only the smallest durable event context needed for later ratings, ticker detail, and player memory.
- Make CLI fixture inspection show the new causal context only after durable reports carry it.
- Preserve match outcomes, scoring calibration, and league-table behavior unless a step explicitly documents measured drift.

## What NOT to implement

- Do not implement full possession chains, pass sequences, rebounds, goalkeeper mistakes, penalties, set-piece takers, cards, injuries, substitutions, minutes played, fatigue, form, morale, player ratings, or xG.
- Do not implement tactical setup, lineup editing, live match sessions, team talks, auto-pause, or match commands.
- Do not implement UI, React, Web Worker, SQLite, Tauri, save browsing, storage migrations, localization, modding editor, market, contracts, economy, board pressure, staff, scouting, youth, facilities, media, or manager career.
- Do not add real football data, real identities, scraped datasets, or licensed competition names.
- Do not store rendered prose in domain events or match reports.
- Do not change scoring rates, conversion probabilities, calibration targets, fake content generation, or team-strength calculation unless a specific active step proves a bug or measurable drift.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md`
- `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md`
- `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md`
- `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md`
- `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 07 has a documented incremental path from current output review to durable causal match context.
- The first active step is a review/check step, so the project does not add new scope on top of an unreviewed Phase 06 result.
- Causal actor selection is split from integration and durable schema changes.
- Full duel chains, live match-day, UI, storage, tactics, player states, and management systems remain outside this phase.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md`. Review the current Phase 06 match and season output before implementing new causal match code. Update `docs/PROJECT_STATUS.md` with the decision and stop.
