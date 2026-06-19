# Season Player Stats

## Goal

Aggregate minimum player statistics for one simulated season from durable match reports.

## Why we implement it this way

Once goal events carry player IDs, the season layer can produce player-level output without inventing UI or persistence. The first useful statistic is goals. A small aggregation use-case gives the CLI, future UI, future market, future growth, and future player memory systems a deterministic source of truth.

This step should aggregate from match reports or report-derived data, not from rendered text and not from fixture score totals alone. It should stay minimal: goals first, optional appearance counts only if they are already implied by every fixture using a fixed lineup.

## What to implement

- Add a season player-stat data shape in the appropriate package.
- Aggregate goals by player ID from durable `MatchReport` goal events using their `scorerPlayerId` field.
- Treat `MATCH_EVENT_SCHEMA_VERSION >= 2` reports as the supported scorer source; do not read engine-local step events or recalculate scorer attribution.
- Include enough context for CLI display:
  - player ID;
  - club ID;
  - goals;
  - optional appearances only if derived deterministically from fixed lineups without new match-day systems.
- Sort player-stat rows deterministically:
  - goals descending;
  - player ID or a documented stable tie-breaker.
- Thread the aggregation through `simulateSeason` result only if this step lists the result contract as an expected file and tests it.
- Add focused tests proving:
  - goals aggregate correctly across multiple reports;
  - players with no goals are handled according to the documented shape;
  - tie-breakers are stable.

## What NOT to implement

- Do not add assists, minutes played, ratings, cards, injuries, substitutions, fatigue, growth, market value, contracts, or player memory.
- Do not add CLI top-scorer formatting yet unless this step explicitly updates its scope.
- Do not add UI or storage.
- Do not compute stats from prose.
- Do not use object key enumeration for order-sensitive aggregation.

## Allowed dependencies

- `packages/domain -> nothing` only if new durable stat contracts are needed.
- `packages/engine -> domain, shared`
- `packages/simulation-tools -> domain, engine, shared` only if aggregation belongs in tooling rather than season engine.

## Expected files

- `packages/domain/src/entities/player-stat.entity.ts` only if the stat contract should be durable domain data.
- `packages/domain/src/index.ts` only if a new domain export is added.
- `packages/engine/src/season-engine/player-stats.ts`
- `packages/engine/src/season-engine/player-stats.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` only if `SimulateSeasonResult` is extended with player stats.
- `packages/engine/src/use-cases/simulate-season.test.ts` only if the use-case result changes.
- `packages/engine/src/index.ts` only if a new public helper must be exported.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/domain run typecheck` if domain files are touched.
- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine/domain files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`

## Definition of Done

- Season-level player goal totals are derived deterministically from structured goal events.
- Aggregation order has a deterministic final tie-breaker.
- Tests cover multi-match aggregation and ties.
- `simulateSeason` remains deterministic for the same seed.
- No CLI top-scorer display, UI, storage, assists, cards, injuries, growth, or market logic is added unless explicitly scoped in this step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only minimum season player-stat aggregation from structured goal events. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
