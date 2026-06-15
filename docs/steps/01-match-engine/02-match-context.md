# Match Context

## Goal

Define the serializable input needed to simulate one match: fixture identity, teams, lineups, strengths, tactical distribution inputs, config, and derived RNG key.

## Why we implement it this way

`simulateMatch` must not read global state or files. `requirements.md` separates content generation, domain state, and engine rules. A compact `MatchContext` makes each match reproducible in isolation and supports future re-simulation for debugging.

## What to implement

- `MatchContext` type.
- `MatchEngineConfig` type for rates, conversion bands, home factor, minute count, and capped tactical distribution knobs.
- `MatchTeamContext` for club ID, lineup, and `TeamStrength`.
- Fixture IDs (`fixture:...`) and stable seed fields needed to derive `deriveRng(seed, "match", fixtureId)`.
- Validation helpers that check context completeness without importing content schemas.

## What NOT to implement

- Do not simulate a match.
- Do not create content config files in this step unless tests need minimal fixtures.
- Do not add Zod schemas to engine.
- Do not include UI preferences, ticker speed, auto-pause, substitutions, or commands.
- Do not persist `MatchContext`.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-engine-config.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/index.ts`

## Required tests

- Valid context passes validation.
- Missing fixture ID fails.
- Missing team strength fails.
- The match RNG key is stable for the same seed and fixture ID.
- Home and away team order is explicit.
- Fixture IDs follow the domain `fixture:` namespace.

## Definition of Done

- A complete match can be described without reading `GameState`.
- Context is serializable.
- RNG derivation uses stable keys.
- No simulation behavior is implemented yet.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only match context and config types from `docs/steps/01-match-engine/02-match-context.md`. Do not implement `stepMatch`, `simulateMatch`, events, or reports.
