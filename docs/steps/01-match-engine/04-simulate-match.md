# Simulate Match

## Goal

Build the batch match driver that runs `stepMatch` until full time and returns a deterministic result.

## Why we implement it this way

The CLI and balance tools need complete matches before interactive match-day exists. `requirements.md` requires the batch driver to reuse the same step function that future match-day sessions will use. This avoids a rewrite when UI and auto-pause arrive later.

## What to implement

- `simulateMatch(context)` that initializes `MatchSimulationState`.
- Loop over `stepMatch` until full time.
- Derive the match RNG from seed and fixture ID.
- Return score, final stats, and emitted events.
- Include safety guard against infinite loops.
- Keep output serializable and independent from mutable domain objects.

## What NOT to implement

- Do not update fixtures or league tables.
- Do not write files.
- Do not create CLI commands in this step.
- Do not add ticker text, localization, auto-pause, or interactive commands.
- Do not implement player ratings unless required for final report structure.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/simulate-match.ts`
- `packages/engine/src/match-engine/simulate-match.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/index.ts`

## Required tests

- Same seed and fixture ID produce identical match output.
- Different fixture IDs can produce different output with the same seed.
- A match reaches full time.
- Final score equals the goal events emitted.
- 1000 deterministic matches complete without crash.

## Definition of Done

- Batch match simulation works without CLI or UI.
- Determinism tests pass.
- Output is serializable.
- Engine still imports only domain and shared.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the batch `simulateMatch` driver from `docs/steps/01-match-engine/04-simulate-match.md`. It must run over `stepMatch` and return serializable output. Do not update season state or create CLI commands.
