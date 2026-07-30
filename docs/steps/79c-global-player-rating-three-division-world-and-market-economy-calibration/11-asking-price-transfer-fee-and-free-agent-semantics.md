# Step 11 - Asking Price, Transfer Fee And Free-Agent Semantics

## Status

Done.

## Goal

Make public value, seller asking price, offered/agreed fee, and completed fee
separate canonical facts throughout negotiation, completion, history,
persistence, diagnostics, and UI.

## Expected Files

- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/market/seller-asking-price.ts`
- `packages/engine/src/market/seller-asking-price.test.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/apply-career-transfer.test.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.test.ts`
- `packages/engine/src/index.ts`
- `packages/ui/src/career/career-market-view.ts`
- `packages/ui/src/career/career-market-view.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career/market-output.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/web/src/app/use-career-screen-presentations.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/11-asking-price-transfer-fee-and-free-agent-semantics.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add one pure seller-asking-price engine function requiring the validated JSON
  curves as an explicit input.
- Keep asking multipliers only in content JSON and propagate them through CLI,
  web, selected-club, AI, and monthly lifecycle composition.
- Limit asking inputs to supported facts: remaining contract, squad importance,
  replacement need, seller finance pressure, player desire, and negotiation
  context.
- Expose structured seller-reluctance reasons.
- Store public value, initial/current asking price, each offered/countered fee,
  agreed fee, and completed fee without overwriting one another.
- Settle exactly the agreed fee during permanent completion.
- Make free-agent transfer fee exactly zero in feasibility, signing, finance,
  history, diagnostics, and UI while retaining public value.
- Preserve supported signing bonus and wage costs for free agents.
- Label value, asking price, offered fee, counteroffer, agreed fee, and completed
  fee unambiguously in Market rows/detail/composer and CLI/report output.
- Preserve clocks, Posta decisions, pending exposure, window legality,
  affordability, and atomic completion.
- Persist all durable amounts through JSON and SQLite/OPFS and bump/migrate the
  schema only under the Step 04 beta-save policy.
- Test asking below/equal/above value, short/long contract, key/surplus player,
  pressured seller, and free agent.
- Remove any ambiguous duplicate fee/value path in this step.

## What NOT To Implement

- No new negotiation stage, auction, rival bidding UI, agent, installment, loan,
  player swap, or sell-on expansion.
- No public-value mutation based on offer/contract/seller state.
- No negative/non-integer money or hidden selected-club completion.
- No wage/budget/AI coefficient calibration; Steps 12-13 own that.
- No implicit asking-price default or engine import from content.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/market/seller-asking-price.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/apply-career-transfer.test.ts \
  packages/engine/src/career/apply-career-free-agent-signing.test.ts \
  packages/ui/src/career/career-market-view.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Public value, asking, offered, agreed, and completed amounts are structurally
  distinct everywhere.
- Seller circumstances affect asking/acceptance without rewriting value.
- Free-agent public value remains visible and transfer fee is exactly zero.
- Existing legal clocks, Posta, exposure, affordability, and atomic completion
  remain intact.
- Reload preserves every factual amount and version.

## Outcome

- Added one pure, explicitly configured seller-asking-price model whose
  contract, squad-importance, replacement-need, finance-pressure, player-desire,
  and negotiation-context factors remain separate structured reasons.
- Permanent negotiations now preserve public value, initial/current asking
  price, offered/countered/agreed fee, and completed fee as distinct immutable
  facts through seller replies, player terms, completion, history, CLI, web,
  JSON, and SQLite/OPFS.
- Permanent completion settles exactly the agreed fee. Free-agent history and
  UI keep the public value visible while recording an exact zero transfer fee;
  wage and signing-bonus costs remain unchanged.
- JSON envelope `8` and SQLite schema `17` form the new clean beta baseline,
  rejecting unsupported older saves rather than carrying compatibility paths.

## Verification

- The required focused suite passed after updating the CLI expectation:
  `203/204` tests passed in the combined run and the only changed expectation
  then passed in the isolated CLI rerun (`33/33`).
- i18n passed (`19/19`) and the complete web suite passed (`327/327`).
- Content, domain, engine, storage, simulation-tools, UI, i18n, CLI, and web
  typechecks passed.
- Dependency-cruiser passed (`748` modules / `2,854` dependencies) and
  `git diff --check` passed.
- No long-run cohort was executed.
