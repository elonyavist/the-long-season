# Market Domain Contracts

## Goal

Add dependency-free domain contracts for the first permanent-transfer market slice.

## Why we implement it this way

The market needs a stable language before the engine evaluates value, willingness, and feasibility. These contracts are game data, not behavior, so they belong in `domain` and must stay serializable, deterministic, and language-agnostic.

The contracts should model only what Phase 17 actually uses. Do not add future-only loan or wage branches just to look complete.

## What to implement

- Add a domain market contract file for:
  - `ClubBudget` with transfer budget only;
  - `MarketState` with explicit ordered club budget IDs or an equivalent deterministic order contract;
  - `PermanentTransferIntent`;
  - `TransferFeasibilityStatus`;
  - `TransferRejectionReasonCode`;
  - `TransferRejectionReason`;
  - `TransferPreview` or equivalent structured result shape.
- Use existing `Money`, `ClubId`, and `PlayerId` types.
- Keep all reason codes structured and language-agnostic.
- Add focused tests for:
  - valid permanent transfer intent;
  - duplicate or missing budget order if an ordered market state is introduced;
  - invalid buyer/seller equality;
  - budget values using `Money`;
  - reason codes remaining data-only.
- Export the new contracts from `@game/domain`.

## What NOT to implement

- Do not add valuation logic.
- Do not add willingness logic.
- Do not add feasibility logic.
- Do not add source-code branches for loans, contracts, wages, agents, free agents, installments, player exchanges, sell-on clauses, transfer windows, registration, or scouting fog.
- Do not import engine, shared, content, storage, i18n, or apps into domain.
- Do not add user-facing prose to domain contracts.

## Allowed dependencies

- `domain -> nothing`

## Expected files

- `packages/domain/src/entities/transfer.entity.ts`
- `packages/domain/src/entities/transfer.entity.test.ts`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/17-market-mvp-permanent-transfers/03-player-valuation-v1.md` only if a domain contract decision changes valuation scope.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm exec vitest run packages/domain/src/entities/transfer.entity.test.ts`
- `pnpm check`
- `rg -n "loan|wage|contract|installment|exchange|sellOn|window|scout|agent|freeAgent" packages/domain/src/entities/transfer.entity.ts`

The final `rg` should return no future-only market branches unless the step explicitly documents why the match is harmless.

## Definition of Done

- Domain exposes minimal permanent-transfer contracts.
- Contracts use `Money` and stable ID types.
- Invalid or ambiguous market data is rejected by focused helpers where useful.
- No behavior, CLI output, storage, or simulation result changes.
- `docs/PROJECT_STATUS.md` records the contract shape and next action.

## Claude Code task prompt

Read the required project docs and this step document. Implement only dependency-free permanent-transfer domain contracts and focused tests. Do not add valuation, willingness, feasibility, CLI output, persistence, or future-only branches. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop unless executing the whole phase prompt.
