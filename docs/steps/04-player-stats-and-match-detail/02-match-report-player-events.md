# Match Report Player Events

## Goal

Promote goal scorer attribution from engine-local events into the durable domain `MatchReport` event contract.

## Why we implement it this way

After goal attribution exists inside the match simulation, the data must survive conversion to `MatchReport`. The domain report is the durable, language-agnostic contract used by fixture application, future storage, future ticker rendering, and future memory systems. If scorer IDs remain engine-local, season aggregation and CLI top scorers cannot rely on them.

This step should evolve the structured event contract narrowly: goal events gain a scorer reference. It should not introduce full shot participants or prose.

## What to implement

- Extend the domain goal event shape to include scorer player ID.
- Update `createMatchReport` to copy scorer IDs from engine-local goal events into domain `MatchEvent` goal events.
- Treat the engine-local `scorerPlayerId` as the source of truth; do not recalculate or re-randomize goal attribution in this step.
- Keep `MATCH_EVENT_SCHEMA_VERSION` behavior explicit:
  - update the version if the durable event schema changes;
  - document why in `docs/PROJECT_STATUS.md`.
- Update engine report conversion tests with deterministic goal scorer expectations.
- Keep existing match score, stats, and fixture result behavior unchanged.
- Ensure JSON serialization remains stable and language-agnostic.

## What NOT to implement

- Do not add assists, shot creators, culprits, keeper IDs, card events, injury events, substitutions, or full duel chains.
- Do not add season player-stat aggregation.
- Do not add CLI top-scorer output yet.
- Do not add storage schema files or migrations unless a touched test proves the current JSON boundary breaks.
- Do not render prose.

## Allowed dependencies

- `packages/domain -> nothing`
- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts` only if report-level typing needs a narrow update.
- `packages/domain/src/index.ts` only if exports must be adjusted.
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/simulate-match.test.ts` only if golden event output changes.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched domain/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`

## Definition of Done

- Durable `MatchEvent` goal variants include the scorer ID.
- `createMatchReport` preserves scorer IDs exactly from engine-local goal events.
- Existing event variants remain language-agnostic and serializable.
- Match report tests prove scorer persistence.
- No season aggregation, CLI top scorer, assist, duel, storage migration, UI, or prose rendering is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only durable scorer references on goal match events. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
