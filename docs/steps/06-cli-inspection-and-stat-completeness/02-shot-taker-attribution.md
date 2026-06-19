# Shot Taker Attribution

## Goal

Attribute every durable shot outcome to a shooter so player shot statistics can be derived from match reports.

## Why we implement it this way

Current durable match reports identify the scorer for goals and the goalkeeper for saves, but non-goal shot outcomes do not identify who shot. As a result, player match stats can only credit `shots` and `shotsOnTarget` for goals. This is honest, but incomplete.

The next data gap should be closed at the event level, not in CLI rendering. If shot takers are stored in durable shot outcome events, player match stats, fixture detail, later ratings, UI, and save memory can all read the same source of truth.

This step should stay deterministic and narrow. The aggregate resolver still decides whether a shot becomes a goal, save, miss, or block. This step only chooses the attacking player credited with taking the shot.

## What to implement

- Add deterministic shooter attribution for all shot outcomes:
  - goal;
  - save;
  - miss;
  - block.
- Reuse or extract the existing goal scorer attribution logic where appropriate, but keep behavior explicit and tested.
- Ensure shooter IDs belong to the attacking side lineup.
- Preserve existing goal scorer semantics:
  - for goals, the shooter and scorer should be the same player in the current aggregate model.
- Add `shooterPlayerId` to durable non-goal shot events.
- Decide whether durable goal events need an explicit `shooterPlayerId` or whether `scorerPlayerId` remains the shooter field for goals; document the decision in `docs/PROJECT_STATUS.md`.
- Bump `MATCH_EVENT_SCHEMA_VERSION` if durable event shape changes.
- Add tests proving deterministic output and side correctness.

## What NOT to implement

- Do not change whether shots become goals, saves, misses, or blocks.
- Do not change scoring rates, conversion probabilities, calibration targets, team strengths, or fake content.
- Do not add full possession chains, pass chains, shot zones, xG, rebounds, goalkeeper mistakes, set-piece assignment, penalties, cards, injuries, substitutions, ratings, fatigue, or minutes played.
- Do not add CLI rendering beyond what is necessary to keep existing tests passing.
- Do not add UI, storage migration, save browsing, localization, or commentary prose.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/engine/src/match-engine/shot-attribution.ts`
- `packages/engine/src/match-engine/shot-attribution.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/simulate-match.test.ts` only if golden output changes.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched domain/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Durable shot outcome events contain enough player identity data to derive per-player shot counts.
- Shooter attribution is deterministic and side-correct.
- Existing score, table, top scorer, assists, saves, and balance behavior remain stable unless documented as a schema-only output shape change.
- Match event schema version reflects any durable event contract change.
- No full duel chain, ratings, UI, storage migration, or calibration change is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only deterministic shot-taker attribution for durable shot outcome events. Do not change match outcomes, scoring calibration, CLI presentation, UI, storage, or full duel logic. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
