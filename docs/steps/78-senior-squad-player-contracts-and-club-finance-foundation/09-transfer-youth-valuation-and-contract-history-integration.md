# Step 09 - Transfer, Youth, Valuation And Contract-History Integration

## Status

Done.

## Goal

Make every current ownership-changing path preserve the active-contract,
registration, finance, and history invariants.

## User-Visible Outcome

Transfers, youth graduation, release, and valuation now agree with the
player's employer, shirt number, contract security, and club money.

## Scope

1. Terminate the seller contract and registration on a completed permanent
   transfer.
2. Credit/debit transfer money and create the buyer registration/contract in
   one atomic career result.
3. Assign a deterministic available shirt number at the buyer.
4. Make valuation use age, canonical ability/potential, division/reputation,
   form only where already supported, and remaining contract security.
5. Make willingness and feasibility consume wage/status/contract context.
6. Give promoted youth a valid senior registration and professional contract,
   or complete a structured release/free-agent transition.
7. Close youth contracts at the age/lifecycle boundary.
8. Append factual contract history for signing, renewal, transfer termination,
   expiry, and release.
9. Delete standalone ownership or budget mutations replaced by the atomic path.

## Implementation Contract

- One transaction changes ownership, active contract, registration, cash,
  budgets, and history together or changes nothing.
- Valuation remains an engine derivation and stores no duplicated market value.
- Current permanent-transfer behavior remains the only transfer type.
- Youth policy reuses the existing academy lifecycle and never creates a
  second youth system.

## Expected Files

- `packages/engine/src/career/apply-career-transfer.ts`
- focused transfer application tests
- current transfer turnover Modules/tests
- current market valuation/willingness/feasibility Modules/tests
- current youth promotion/release/intake Modules/tests
- current registration, contract, finance, and history Modules/tests
- current career-state validation/tests
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No Market browser, new transfer type, loan, installment, agent, auction, or
  scouting fog.
- No persisted market-value cache.
- No duplicate youth registration or automatic selected-club promotion.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Trace one transfer and one youth promotion from before to after, including
  both clubs, cash, budgets, number, contract, and history.
- Compare equivalent players with short and long contracts to verify value
  changes in the expected direction.

## Completion Criteria

- Every current ownership transition preserves all Phase 78 invariants.
- Valuation and willingness use real contract context.
- Replaced budget/ownership code is removed.
- Step 10 remains the only next implementation step.
