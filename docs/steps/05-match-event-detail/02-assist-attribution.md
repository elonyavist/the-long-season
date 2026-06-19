# Assist Attribution

## Goal

Attribute optional assists to eligible goal events deterministically, using only the scoring side lineup and structured shot context already available after the previous step.

## Why we implement it this way

Goals already have scorers, but season stories become more credible when some goals also credit a creator. Assists should not be guaranteed: solo goals, rebounds, set pieces, and unassisted actions are valid football outcomes. The attribution model should therefore be simple, deterministic, and explicitly optional.

This step adds one player reference to goal events when the generated event context makes an assist plausible. It is still not a possession chain or a full duel engine.

## What to implement

- Add optional assist data to engine-local goal events.
- Add optional assist data to durable domain goal events.
- Use deterministic attribution from the scoring side lineup:
  - scorer cannot assist their own goal;
  - attackers and midfielders are more likely creators than defenders;
  - goalkeeper assists are excluded unless explicitly documented;
  - some goals have no assist.
- Use an independent derived RNG stream or otherwise prove that adding assists does not consume the main match RNG.
- Bump `MATCH_EVENT_SCHEMA_VERSION` if durable goal event payloads change.
- Update `createMatchReport` so it copies assist IDs without recalculating them.
- Add focused tests proving:
  - same seed produces same assist sequence;
  - assist IDs belong to the scoring side lineup;
  - assists are absent for at least one documented eligible/ineligible case;
  - scorer and assist are never the same player.

## What NOT to implement

- Do not add shot creators for every non-goal shot.
- Do not add full passing chains, possession chains, key passes, xG, player ratings, or tactical causality.
- Do not add goalkeeper save attribution in this step.
- Do not aggregate assists into season stats yet.
- Do not change scoring rates, final scores, table results, or calibration targets.
- Do not add UI, storage migration, ticker prose, or localization.

## Allowed dependencies

- `packages/domain -> nothing`
- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/engine/src/match-engine/assist-attribution.ts`
- `packages/engine/src/match-engine/assist-attribution.test.ts`
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

- Goal events can carry an optional assist player ID.
- Assist attribution is deterministic and never changes match outcomes.
- Assist player IDs are valid for the scoring side and never equal the scorer.
- Durable match reports preserve assist data without storing text.
- No goalkeeper save attribution, player stat aggregation, UI, storage migration, or full duel chain is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only deterministic optional assist attribution for goal events. Keep match outcomes unchanged. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
