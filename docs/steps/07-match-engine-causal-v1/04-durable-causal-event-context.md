# Durable Causal Event Context

## Goal

Persist the smallest useful causal opportunity context in durable match reports after `stepMatch` uses causal actors.

## Why we implement it this way

Engine-local actors help internal coherence, but later systems need durable facts: fixture inspection, player memory, ratings, ticker detail, and future UI should all read the same match report. This step promotes only the minimal context that is already produced by the engine and useful outside it.

The project should still avoid full possession chains. Durable reports should store structured IDs and enum-like context, not prose and not long event histories.

## What to implement

- Decide the minimal durable causal fields based on the completed `03-step-match-causal-actors.md` result.
- Expected durable additions should be narrow, for example:
  - optional `creatorPlayerId` where it adds information beyond existing `assistPlayerId`;
  - optional `primaryDefenderPlayerId` for blocked shots or defensive context;
  - no duplicate `shooterPlayerId` on goals unless a clear need is documented.
- Update domain match-event contracts.
- Bump `MATCH_EVENT_SCHEMA_VERSION` if durable event payloads change.
- Update `createMatchReport` to copy causal context from engine-local events without recalculating it.
- Update player-stat helpers only if they need to ignore or preserve new fields.
- Add tests proving durable reports preserve causal context deterministically.

## What NOT to implement

- Do not add possession chains, pass sequences, defensive mistakes, goalkeeper mistakes, ratings, xG, cards, injuries, penalties, substitutions, tactics, fatigue, form, morale, or minutes played.
- Do not add CLI rendering in this step unless existing tests require a tiny compatibility adjustment.
- Do not change match outcome probabilities, score generation, balance targets, fake content, or table logic.
- Do not add UI, storage migrations, save browsing, localization, market, economy, staff, youth, facilities, media, or career systems.
- Do not store rendered text in domain events.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/simulate-match.test.ts` only if golden durable output changes.
- `packages/engine/src/season-engine/player-match-stats.test.ts` only if new fields affect stat derivation expectations.
- `docs/PROJECT_STATUS.md`
- `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` only if durable fields differ from this step's assumptions.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched domain/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Durable match reports contain minimal causal context needed by future inspection and rating work.
- Schema version reflects any durable event contract change.
- `createMatchReport` copies context instead of recalculating it.
- Existing player stats, season summaries, fixture inspection, and balance behavior remain valid.
- No CLI causal rendering, full duel chain, live match-day, UI, storage, or management system is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the minimal durable causal event context produced by the current engine-local chance actors. Do not add rendering, ratings, full duel chains, UI, storage, or gameplay systems. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect, and stop.
