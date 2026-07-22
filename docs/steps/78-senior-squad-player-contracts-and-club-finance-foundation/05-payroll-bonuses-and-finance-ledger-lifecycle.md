# Step 05 - Payroll, Bonuses And Finance Ledger Lifecycle

## Status

Ready.

## Goal

Apply real contract costs and supported club income exactly once at canonical
career boundaries.

## User-Visible Outcome

Wages and performance bonuses matter. The club's cash and available budgets
change for football reasons the manager can inspect and trust.

## Scope

1. Add one idempotent annual payroll use case over active contracts at the
   canonical season boundary.
2. Charge signing bonus when a contract becomes active.
3. Charge appearance, goal, and clean-sheet bonuses from committed structured
   match facts at full-time publication.
4. Credit/debit transfer proceeds through the same ledger boundary.
5. Credit the competition-owned season distribution once per season.
6. Use stable transaction IDs or closed-period keys to prevent duplicate
   charges after reload or retry.
7. Derive committed annual wages and remaining wage budget after each contract
   lifecycle mutation.
8. Return typed affordability and ledger results for later commands/UI.

## Implementation Contract

- No finance mutation occurs per live minute, React render, or read-model build.
- Full-time bonus application joins only committed match facts and active terms.
- A due autosave retry cannot duplicate a transaction.
- Commands that cannot be funded return structured rejection and preserve the
  prior career state.
- All calculations use integer minor units.

## Expected Files

- new focused finance lifecycle Modules/tests under `packages/engine/src/career/`
- current season rollover Modules/tests
- current full-time career commit Modules/tests
- current transfer application Modules/tests
- current season rollover Modules/tests
- current career-state finance contracts/tests only where invariants require
  refinement
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No contract offer negotiation, AI renewal, UI, ticket/sponsor income, debt,
  or bankruptcy.
- No generic event bus or accounting framework.
- No mutable derived budget cache outside career state.

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

- Trace one annual wage run, one appearance, one goal, one clean sheet, one
  signing bonus, and one transfer in the ledger.
- Retry each boundary and confirm balances do not change twice.

## Completion Criteria

- Every supported income/cost has one canonical application boundary.
- Payroll and bonuses materially affect cash and budgets.
- Idempotency tests cover reload and retry.
- Step 06 remains the only next implementation step.
