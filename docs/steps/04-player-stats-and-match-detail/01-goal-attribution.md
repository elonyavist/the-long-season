# Goal Attribution

## Goal

Attribute every simulated goal to one player from the scoring side's explicit lineup, deterministically and without changing the aggregate scoring calibration.

## Why we implement it this way

The current match engine can produce goals but cannot say who scored them. That blocks top scorers, player attachment, fixture detail, and later narrative memory. This step adds the smallest player-level bridge: after the aggregate resolver says a goal happened, the engine chooses a scorer from the scoring side's lineup.

This is not the full duel engine from the long-term design. It is a deterministic attribution layer over the existing aggregate simulation, using role/ability-weighted selection so attackers score more often while midfielders, defenders, and goalkeepers remain possible only within explicit rules.

## What to implement

- Add a deterministic goal scorer attribution function in `engine`.
- Use only data already present in `MatchContext`:
  - scoring side;
  - explicit lineup order;
  - player IDs;
  - role keys;
  - players if they are made available through a documented input change in this step.
- Prefer a small, testable scorer-weight model:
  - attackers weighted highest;
  - midfielders weighted medium;
  - defenders weighted low;
  - goalkeeper near zero or excluded unless explicitly documented.
- Use seeded match RNG consumption that is stable for the same seed and fixture.
- Attach the scorer ID to engine-local goal step events, not yet to the durable domain event contract unless this step explicitly needs the field for tests.
- Keep aggregate goal count, score, and fixture result behavior unchanged.
- Add focused tests proving:
  - same seed produces same scorer sequence;
  - scorers come from the scoring side lineup;
  - generated goal counts still equal final score;
  - no scorer is assigned to non-goal events.

## What NOT to implement

- Do not add assists, shot creators, culprits, beaten defenders, goalkeeper attribution, cards, injuries, substitutions, or duel chains.
- Do not change opportunity rates, conversion probabilities, home advantage, or balance targets.
- Do not add season player-stat aggregation.
- Do not change CLI output yet except for focused debug/test needs.
- Do not change storage schemas.
- Do not add UI or rendered text.

## Allowed dependencies

- `packages/engine -> domain, shared`
- Tests may use local engine fixtures.

## Expected files

- `packages/engine/src/match-engine/goal-attribution.ts`
- `packages/engine/src/match-engine/goal-attribution.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/match-context.ts` only if player lookup data must be added to `MatchContext`.
- `packages/engine/src/match-engine/match-context.test.ts` only if `MatchContext` changes.
- `packages/engine/src/match-engine/index.ts` only if a new public engine helper must be exported.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Every goal event in the engine-local match simulation has exactly one scorer ID.
- Scorer IDs always belong to the scoring side lineup.
- Non-goal shot outcomes do not carry scorer IDs.
- Full-match deterministic golden tests are updated if the event shape changes.
- Existing season result and balance checks still pass.
- No full duel chain, assist system, UI, storage migration, or season player-stat aggregation is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only deterministic goal attribution for engine-local goal events. Keep aggregate scoring calibration unchanged. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
