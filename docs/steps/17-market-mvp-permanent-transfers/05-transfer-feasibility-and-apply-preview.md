# Transfer Feasibility And Apply Preview

## Goal

Combine ownership, budget, valuation, and willingness into permanent-transfer feasibility and in-memory apply preview.

## Why we implement it this way

The market MVP becomes useful only when it can answer two questions:

1. Can this transfer happen under current MVP rules?
2. What would the squads and transfer budget look like if the manager applied it?

This must remain in-memory. The step proves the market contract without creating a career save or pretending persistence exists.

## What to implement

- Add a pure engine market Module for permanent-transfer feasibility.
- Validate:
  - buying club exists;
  - selling club exists;
  - buying club and selling club are different;
  - target player exists;
  - selling club currently owns the target player through `Club.playerIds`;
  - buying club does not already own the target player;
  - transfer budget can cover valuation;
  - player willingness accepts the move.
- Return structured rejection reasons for every failure.
- Add an in-memory apply-preview helper that:
  - returns the unchanged original state plus a copied preview state or a preview result shape;
  - removes the player from the selling club ordered `playerIds`;
  - appends or inserts the player deterministically into the buying club ordered `playerIds`;
  - subtracts transfer fee from buyer budget and adds it to seller budget if the market state models both budgets;
  - does not mutate the original `GameState` or `MarketState`.
- Add focused tests for:
  - accepted transfer;
  - insufficient budget;
  - player not owned by seller;
  - buyer equals seller;
  - unwilling player rejection;
  - copy-on-write state preservation;
  - deterministic roster order after preview.
- Export the feasibility/apply-preview Module from `@game/engine`.

## What NOT to implement

- Do not persist transfer results.
- Do not call `GameStorage`.
- Do not write files.
- Do not add transfer history persistence.
- Do not add loans, contracts, wages, agents, windows, registration, scouting, AI, installments, player exchanges, or negotiation.
- Do not run a season after the transfer.
- Do not auto-pick targets from squad fit.
- Do not add CLI output in this step.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/market/index.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/17-market-mvp-permanent-transfers/06-cli-market-inspection.md` only if the preview output changes CLI scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/market/transfer-feasibility.test.ts packages/engine/src/market/player-valuation.test.ts packages/engine/src/market/player-willingness.test.ts`
- `pnpm check`
- `rg -n "@game/storage|fs|writeFile|readFile|JsonGameStorage|saveGame|loadGame" packages/engine/src/market`
- `rg -n "loan|wage|contract|agent|installment|exchange|window|registration|scout|fog|negotiation" packages/engine/src/market/transfer-feasibility.ts`

The storage scan must return no matches.

## Definition of Done

- Engine can determine whether one permanent transfer is feasible.
- Engine can produce an in-memory preview state/result without mutation.
- Structured rejection reasons cover ownership, budget, and willingness failures.
- No persistence, storage, CLI, loans, contracts, wages, scouting, AI, or windows are introduced.
- `docs/PROJECT_STATUS.md` records the adopted feasibility/apply-preview shape and next action.

## Claude Code task prompt

Read the required project docs and this step document. Implement only permanent-transfer feasibility and in-memory apply preview in engine with focused tests. Do not add persistence, CLI, storage, loans, contracts, wages, scouting, AI, windows, registration, or negotiation. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop unless executing the whole phase prompt.
