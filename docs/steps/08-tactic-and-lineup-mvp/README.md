# Tactic And Lineup MVP Steps

## Goal

Give the project its first real managerial lever: the user should be able to choose a lineup and a small tactical setup, then verify that deterministic season/match output changes in a believable and testable way.

## Why we implement it this way

Phases 04-07 made match output visible at player level and more causally coherent. The next useful step is not UI or career persistence yet; it is giving the simulation a controlled input that represents a manager decision.

This phase must stay CLI-first and deterministic. It should introduce explicit lineup and tactic contracts, validate them, route them into existing team-strength and match-context creation, and expose a minimal CLI inspection path. It must not become full match-day, substitutions, training, morale, fatigue, or a tactical UI.

## What to implement

- Review the current Phase 07 output before adding tactical scope.
- Add minimal domain contracts for tactical setup and selected lineups.
- Add engine validation/building helpers that convert selected lineups and tactic inputs into existing match team context data.
- Allow season simulation to use caller-provided team setup overrides for at least one club.
- Expose a small CLI path that lets a developer compare default output against a selected lineup/tactic setup.
- Preserve deterministic output and keep all new ordering explicit.
- Keep tactic effects narrow and explainable:
  - lineup affects which players are used in team strength and event attribution;
  - tactical distribution affects existing `directness`, `pressing`, `width`, and `risk` match context inputs;
  - no new live match controls or in-match state changes.

## What NOT to implement

- Do not implement React UI, tactical board UI, live match sessions, substitutions, auto-pause, team talks, tactical familiarity, training, fatigue, form, morale, injuries, cards, penalties, set-piece takers, player ratings, xG, possession, or full duel chains.
- Do not implement market, contracts, economy, board pressure, staff, scouting, youth, facilities, media, manager career, save progression, SQLite, Web Worker, Tauri, localization, or modding editor.
- Do not tune scoring rates, conversion probabilities, calibration targets, fake content generation, or team-strength formulas unless a specific active step proves a measured regression and documents the fix.
- Do not store rendered prose in domain events or reports.
- Do not add real football data, real identities, scraped datasets, or licensed competition names.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `simulation-tools -> domain, engine, shared`

## Expected files

- `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md`
- `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md`
- `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md`
- `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md`
- `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 08 has a documented incremental path from output review to CLI-visible tactic/lineup input.
- The first active step is a review/check step, so the project does not add new tactical scope on top of an unreviewed Phase 07 result.
- Domain contracts, engine building, season integration, and CLI inspection are split into separate steps.
- UI, live match-day, dynamic player states, management systems, and persistence remain outside this phase.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md`. Review the current Phase 07 season and fixture output before implementing tactic or lineup code. Update `docs/PROJECT_STATUS.md` with the decision and stop.
