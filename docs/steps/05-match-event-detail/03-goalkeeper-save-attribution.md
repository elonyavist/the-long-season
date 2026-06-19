# Goalkeeper Save Attribution

## Goal

Attribute each saved-shot event to the defending goalkeeper deterministically, so match reports can identify who made saves without changing aggregate match results.

## Why we implement it this way

Current save events say that a shot was saved, but not by whom. For fixture detail, player match stats, and later ratings, the defending goalkeeper needs credit. Since the current content uses fixed lineups, the narrowest credible model is to identify the goalkeeper from the defending side lineup and attach that player ID to save events.

This is not a full goalkeeper duel model. The aggregate resolver still decides whether the shot is saved. This step only attributes the already-decided save to the correct player.

## What to implement

- Add goalkeeper attribution to engine-local save shot events.
- Add goalkeeper attribution to durable domain save events.
- Select the defending side goalkeeper from explicit lineup role data.
- Fail clearly if a saved shot needs a goalkeeper but the defending lineup has no goalkeeper role.
- Bump `MATCH_EVENT_SCHEMA_VERSION` if durable save event payloads change.
- Update match-report mapping so it copies the goalkeeper save ID from engine-local events.
- Add focused tests proving:
  - save events carry the defending goalkeeper ID;
  - goalkeeper IDs belong to the defending side lineup;
  - same seed produces the same saved-shot event payloads;
  - non-save events do not carry goalkeeper save IDs.

## What NOT to implement

- Do not change save probability, shot quality, conversion probabilities, or scoring balance.
- Do not add goalkeeper ratings, mistakes, rebounds, penalties, cards, injuries, substitutions, or fatigue.
- Do not add player match-stat aggregation in this step.
- Do not infer goalkeepers from player names or shirt numbers.
- Do not add UI, storage migration, ticker prose, or localization.

## Allowed dependencies

- `packages/domain -> nothing`
- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/engine/src/match-engine/goalkeeper-attribution.ts`
- `packages/engine/src/match-engine/goalkeeper-attribution.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/index.ts` only if a new helper must be public.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched domain/engine behavior.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --round=1`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Durable save events identify the defending goalkeeper who made the save.
- Attribution is deterministic and does not change match outcomes.
- Missing-goalkeeper input fails clearly instead of producing invalid events.
- Existing CLI season and round output still works.
- No player stat aggregation, UI, storage migration, ratings, or full duel chain is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only deterministic goalkeeper attribution for saved-shot events. Keep match outcomes unchanged. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
