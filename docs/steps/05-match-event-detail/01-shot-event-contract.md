# Shot Event Contract

## Goal

Extend structured shot outcome events with the minimum stable context needed by later assist attribution, goalkeeper save attribution, player match stats, and richer CLI match detail.

## Why we implement it this way

Phase 4 goal events identify the scorer, but shot outcomes still carry only minute, side, quality, and on-target status. Before adding assists or goalkeeper saves, the durable event contract needs a slightly richer shared shot context so later steps can attach player references without inventing ad hoc fields.

This step is deliberately a contract step. It should not change how many shots or goals happen. It should make existing events more descriptive and versioned, while keeping them language-agnostic and serializable.

## What to implement

- Extend the domain `ShotContext` with small enum-like structured fields, for example:
  - `shotType`, such as `normal`, `header`, or `set_piece`;
  - `chanceType`, such as `open_play`, `counter`, `cross`, or `dead_ball`;
  - only fields that can be derived deterministically from existing aggregate data.
- Mirror the same fields in engine-local shot outcome events.
- Populate the new fields deterministically in the match engine without changing scoring outcomes.
- Bump `MATCH_EVENT_SCHEMA_VERSION` because durable match event payloads change.
- Update match-report mapping so domain reports preserve the new shot context.
- Add focused tests proving:
  - existing goal/save/miss/block events carry the new structured shot context;
  - the same seed produces the same context sequence;
  - final score and fixture results are not changed by the new fields;
  - no rendered prose enters domain or engine event data.

## What NOT to implement

- Do not add assists.
- Do not add goalkeeper IDs to saves.
- Do not add shooter IDs to non-goal shots unless this step explicitly proves it is required for the contract.
- Do not add player match-stat aggregation.
- Do not change opportunity rates, conversion probabilities, team strengths, or calibration targets.
- Do not add UI, storage migration, save browsing, localization, ticker prose, or full duel chains.

## Allowed dependencies

- `packages/domain -> nothing`
- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/simulate-match.test.ts` only if golden output changes because event shape changes.
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

- Every durable shot outcome event carries the new structured shot context.
- Engine-local shot outcome events and domain match reports agree on the context fields.
- Existing scoring, tables, top-scorer output, and balance gates remain valid.
- `MATCH_EVENT_SCHEMA_VERSION` reflects the durable event payload change.
- No assists, goalkeeper save attribution, player match stats, UI, storage migration, or full duel chain is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only the richer structured shot-event contract. Keep scoring and player attribution behavior unchanged. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
