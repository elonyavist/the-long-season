# Step Match Causal Actors

## Goal

Use the Phase 07 chance actor selector inside `stepMatch` so current scorer, assist, shooter, goalkeeper, and block attribution comes from one opportunity participant set.

## Why we implement it this way

After `ChanceActors` exists, the next useful step is integration. The current aggregate engine may still decide whether an opportunity is a goal, save, miss, or block, but the player IDs attached to that outcome should come from one coherent actor selection for that opportunity.

This step improves causality without changing the aggregate outcome model. It may change which players receive goals, assists, shots, or saves for a fixed seed, but it should not change scores, tables, or balance metrics.

## What to implement

- Call `selectChanceActors` for generated opportunities inside `stepMatch`.
- Use selected actors for current engine-local event attribution:
  - goal scorer should use the selected shooter;
  - optional assist should use the selected creator when eligible and not equal to shooter;
  - save/miss/block shooter should use the selected shooter;
  - save goalkeeper should use the selected goalkeeper;
  - block should keep the selected primary defender engine-local for the later durable-context step if needed.
- Preserve current outcome resolution:
  - opportunity generation stays unchanged;
  - quality calculation stays unchanged unless a focused bug is found;
  - goal/save/miss/block outcome probabilities stay unchanged.
- Update or retire old attribution helpers only where this integration makes them redundant.
- Add focused tests proving:
  - same seed remains deterministic;
  - scores and aggregate stats are unchanged when only attribution changes;
  - event player IDs are side-correct;
  - assists still remain optional and never equal the scorer.

## What NOT to implement

- Do not change durable domain event shape in this step unless a tiny type adjustment is unavoidable and documented.
- Do not bump `MATCH_EVENT_SCHEMA_VERSION` unless durable reports change.
- Do not add CLI rendering for creator/defender yet.
- Do not add full duel chains, shot quality changes, tactical effects, fatigue, ratings, cards, injuries, substitutions, live match sessions, storage, or UI.
- Do not change calibration targets or fake content generation.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/chance-actors.ts`
- `packages/engine/src/match-engine/chance-actors.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts` only if existing report expectations change.
- `packages/engine/src/match-engine/simulate-match.test.ts` only if golden player attribution changes.
- `docs/PROJECT_STATUS.md`
- `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` only if integration changes the durable-context scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched match-engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `stepMatch` uses one coherent actor selection for player attribution on generated opportunities.
- Scores, tables, and strict balance behavior remain stable unless a measured non-score player attribution change is documented.
- Existing durable reports still contain all currently required player IDs.
- No durable causal context, CLI rendering, UI, storage, tactics, player states, or management systems are added.
- `docs/PROJECT_STATUS.md` records the observed output changes and next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Wire chance actors into `stepMatch` attribution only. Do not change match outcome probabilities or durable event context beyond existing fields. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what output changed, and stop.
