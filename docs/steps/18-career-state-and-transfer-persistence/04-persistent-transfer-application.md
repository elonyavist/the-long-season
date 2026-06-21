# 04 - Persistent Transfer Application

## Goal

Apply an accepted Phase 17 permanent transfer to a `CareerState`.

This step converts the market MVP from inspection-only behavior into deterministic career-state mutation, while still keeping all save/write behavior outside the engine.

## What to implement

- An engine use case that accepts:
  - the current `CareerState`;
  - a permanent-transfer request compatible with Phase 17 market contracts;
  - deterministic inputs required by the existing market evaluation.
- If the transfer is accepted:
  - move the player from selling club to buying club in the career game snapshot;
  - deduct the buying club budget;
  - add the fee to the selling club budget if the Phase 17 market contract already supports that concept;
  - append a permanent-transfer history entry.
- If the transfer is rejected:
  - return the rejection result;
  - leave career state unchanged.
- Tests for accepted, rejected, insufficient-budget, and player-willingness-rejected transfers.
- TSDoc/JSDoc comments on exported use-case functions and result types.

## What NOT to implement

- Do not write files from the engine.
- Do not import storage from the engine.
- Do not add CLI behavior.
- Do not add loans.
- Do not add contracts or wages.
- Do not add transfer windows.
- Do not add AI bidding.
- Do not add player exchanges, installments, or advanced clauses.
- Do not change match or season simulation algorithms.

## Expected files

- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/apply-career-transfer.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- focused engine tests for persistent transfer application
- `pnpm check`
- `rg -n "from .*(storage|cli|i18n)" packages/engine/src`

## Definition of Done

- Accepted transfers mutate a copied career state deterministically.
- Rejected transfers do not mutate career state.
- Transfer history records the durable decision.
- Engine package boundaries remain clean.
- `docs/PROJECT_STATUS.md` records how transfer persistence works.

