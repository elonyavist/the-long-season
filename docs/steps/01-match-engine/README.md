# Match Engine Steps

## Goal

Define the Phase 1 path from team strength to a deterministic batch match simulation that emits structured match reports.

## Why we implement it this way

The match engine is the heart of the game, but it must start small. `requirements.md` requires CLI-first validation, deterministic RNG, aggregate simulation before nominal duels, structured events instead of text, and a hard separation between `engine`, `domain`, `content`, and `storage`.

## What to implement

- Implement these steps only after foundation is done.
- Keep the first resolver aggregate and simple.
- Build `simulateMatch` over a step-based core so future match-day interaction does not require a rewrite.
- Emit data events and reports, never localized prose.

## What NOT to implement

- Do not implement full duel chains yet.
- Do not implement ticker UI, React, Web Worker, substitutions, team talks, live match session, scouting, transfers, finances, or season simulation.
- Do not import content directly into engine.
- Do not read files from engine.

## Allowed dependencies

- `packages/engine -> domain, shared`
- Test fixtures may be local to engine tests.

## Expected files

- `docs/steps/01-match-engine/01-team-strength.md`
- `docs/steps/01-match-engine/02-match-context.md`
- `docs/steps/01-match-engine/03-step-match.md`
- `docs/steps/01-match-engine/04-simulate-match.md`
- `docs/steps/01-match-engine/05-match-report.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own tests.

## Definition of Done

- Match engine step documents exist.
- Each step is independently implementable.
- Scope guards prevent season and UI work.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Read `requirements.md`, `docs/PROJECT_RULES.md`, and `docs/steps/01-match-engine/01-team-strength.md`. Implement only team strength calculation. Do not implement match simulation yet.
