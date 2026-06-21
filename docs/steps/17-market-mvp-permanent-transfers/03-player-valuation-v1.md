# Player Valuation V1

## Goal

Add deterministic true-data player valuation for the market MVP.

## Why we implement it this way

The first market needs a price anchor before budget feasibility can exist. Phase 16 allows true-data valuation for the MVP, but the valuation must sit behind a replaceable Interface so future scouting can introduce perceived value without rewriting transfer feasibility.

Valuation is engine behavior, not domain data. Domain should only own the contracts and value objects.

## What to implement

- Add a pure engine market Module for player valuation.
- Valuation input should include:
  - player;
  - current club;
  - optional buying club if useful;
  - valuation config/curves supplied by the caller or test fixture;
  - current date or season context only if needed to derive age from `birthDate`.
- Valuation output should include:
  - `Money` value;
  - structured valuation components useful for tests/debug;
  - no rendered prose.
- The first formula may be simple, but it must consider at least:
  - current ability;
  - potential;
  - age/career-stage approximation;
  - position/role scarcity or position family;
  - club category/reputation.
- Add deterministic tests for:
  - stronger players valued higher than weaker players;
  - higher potential increases value;
  - very old players are not valued like prime players;
  - first-division/reputation context changes value predictably;
  - same input returns same `Money`.
- Export the market valuation Module from `@game/engine`.

## What NOT to implement

- Do not add perceived/scouted value.
- Do not add scouting knowledge.
- Do not add wage, contract, release clause, free-agent, or installment logic.
- Do not add transfer feasibility or apply-preview logic.
- Do not add CLI output.
- Do not add content data files unless the current implementation cannot remain testable without them.
- Do not show true value as user-facing UI text in this step.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/market/index.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/17-market-mvp-permanent-transfers/04-player-willingness-v1.md` only if valuation output changes willingness scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/market/player-valuation.test.ts`
- `pnpm check`
- `rg -n "Math\\.random|Date\\.now|new Date|crypto\\.randomUUID|performance\\.now" packages/engine/src/market`
- `rg -n "scout|fog|wage|contract|loan|installment|exchange|agent|window" packages/engine/src/market/player-valuation.ts`

The final `rg` should return no out-of-scope logic unless the match is an explanatory comment in this step document or a harmless test description.

## Definition of Done

- Engine can derive deterministic true-data `Money` valuation for a player.
- The valuation helper is pure and tested.
- No feasibility, transfer application, persistence, scouting, wage, or CLI behavior is introduced.
- `docs/PROJECT_STATUS.md` records the adopted valuation shape and next action.

## Claude Code task prompt

Read the required project docs and this step document. Implement only deterministic true-data player valuation v1 in engine with focused tests. Do not add willingness, feasibility, CLI, persistence, scouting, wages, contracts, loans, or windows. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop unless executing the whole phase prompt.
