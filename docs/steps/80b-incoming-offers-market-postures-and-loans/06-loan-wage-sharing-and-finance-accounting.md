# Step 06 - Loan Wage Sharing And Finance Accounting

## Status

Not started.

## Goal

Apply exact `0%`, `50%`, or `100%` borrowing-club wage contribution without a
second player contract or duplicate finance reservation.

## Accepted Semantics

- Share always means borrowing-club contribution.
- Original employment contract remains at the parent.
- Contribution is prorated by actual loan dates.
- It changes committed wage room for both clubs.
- No loan fee, bonus, second contract, or arbitrary percentage.

## What To Implement

- Add validated wage-share terms to the loan contract.
- Preview both clubs' prorated commitment before applying the loan.
- Reject unaffordable proposals atomically.
- Integrate the active share with annual wage commitment/headroom and finance
  reporting.
- Reconcile/clear the share exactly once on return or invalidation.
- Preserve accounting across quarterly advancement, rollover, JSON, and
  SQLite/OPFS reload.
- Add zero/half/full, summer/winter, rounding, insufficient budget,
  idempotency, and return tests.

## What NOT To Implement

- No loan fee, currency conversion, second wage contract, player wage
  renegotiation, AI, Posta, or UI.
- No floating-point money arithmetic.

## Expected Files

- `packages/domain/src/career/player-loan.ts`
- `packages/domain/src/career/player-loan.test.ts`
- `packages/engine/src/career/player-loan.ts`
- `packages/engine/src/career/player-loan.test.ts`
- `packages/engine/src/career/career-contract-capacity.ts`
- `packages/engine/src/career/career-contract-capacity.test.ts`
- `packages/engine/src/career/career-finance-lifecycle.ts`
- `packages/engine/src/career/career-finance-lifecycle.test.ts`
- `packages/engine/src/career/market-pending-exposure.ts`
- `packages/engine/src/career/market-pending-exposure.test.ts`
- storage owners modified by Step 05
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-loan.test.ts \
  packages/engine/src/career/player-loan.test.ts \
  packages/engine/src/career/career-contract-capacity.test.ts \
  packages/engine/src/career/career-finance-lifecycle.test.ts \
  packages/engine/src/career/market-pending-exposure.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- `0/50/100` shares are exact, affordable, prorated, and reload-safe.
- Only the original contract exists.
- No duplicate reservation or return credit occurs.
- Step 07 is the only next action.
