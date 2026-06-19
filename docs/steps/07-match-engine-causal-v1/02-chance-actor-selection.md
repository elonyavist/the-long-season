# Chance Actor Selection

## Goal

Create a minimal deterministic engine-local selector for opportunity participants: chance creator, shooter, primary defender, and goalkeeper.

## Why we implement it this way

Current attribution helpers are useful but separate: goals, assists, non-goal shooters, and goalkeeper saves are selected by focused helpers around already-decided outcomes. Phase 07 needs one small causal building block that can select the involved players for an opportunity before the report is created.

This step should not change match outcomes or durable report shape. It should only introduce and test the reusable actor-selection model that later steps can wire into `stepMatch`.

## What to implement

- Add an engine-local `ChanceActors` contract with at least:
  - `creatorPlayerId`;
  - `shooterPlayerId`;
  - `primaryDefenderPlayerId`;
  - `goalkeeperPlayerId`.
- Add a deterministic `selectChanceActors` helper for one opportunity.
- Select actors from explicit home/away lineups only.
- Keep side correctness strict:
  - creator and shooter belong to the attacking side;
  - primary defender and goalkeeper belong to the defending side.
- Use stable derived RNG streams or a clearly documented RNG input strategy that does not consume extra main match RNG before integration.
- Exclude invalid actor combinations where the current model requires it:
  - goalkeeper should not be selected as attacking creator or shooter unless a later step explicitly allows goalkeeper long-ball events;
  - goalkeeper must come from the defending side `roleKey: "gk"` slot.
- Add tests for determinism, side correctness, missing goalkeeper behavior, and stable tie-breaking.

## What NOT to implement

- Do not wire actor selection into `stepMatch` yet.
- Do not change engine-local event shapes, durable domain event shapes, `MATCH_EVENT_SCHEMA_VERSION`, CLI output, balance reports, scores, or table results.
- Do not remove existing attribution helpers yet.
- Do not implement full duel chains, pass chains, shot quality changes, ratings, tactics, fatigue, injuries, cards, substitutions, or live match sessions.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/chance-actors.ts`
- `packages/engine/src/match-engine/chance-actors.test.ts`
- `packages/engine/src/match-engine/index.ts` only if the helper must be public.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `ChanceActors` exists as engine-local data.
- Actor selection is deterministic, side-correct, and covered by focused tests.
- No match output, durable report schema, CLI output, or balance behavior changes in this step.
- `docs/PROJECT_STATUS.md` records the adopted actor-selection rule and next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only engine-local chance actor selection and focused tests. Do not wire it into match stepping or durable reports. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect, and stop.
