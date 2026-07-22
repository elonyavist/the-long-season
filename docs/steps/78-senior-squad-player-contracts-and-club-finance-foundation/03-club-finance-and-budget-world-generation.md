# Step 03 - Club Finance And Budget World Generation

## Status

Done.

## Goal

Create a coherent financial starting point for every club from its generated
contracts and sporting context.

## User-Visible Outcome

Every club begins with a meaningful cash balance, transfer budget, and wage
budget that can constrain future renewals and transfers.

## Scope

1. Add domain contracts for club cash, annual transfer budget, annual wage
   budget, committed annual wage, season totals, and ordered ledger entries.
2. Add typed ledger reasons only for Phase 78 consumers.
3. Validate currency consistency, non-negative budgets, ordered entries, and
   committed wages equal to active contract obligations.
4. Generate opening cash and budgets from category/division, reputation,
   roster value, and generated wage commitments.
5. Generate one competition-owned season distribution used by the current
   career rollover.
6. Ensure opening budgets can fund the generated squad while preserving
   meaningful lower-division pressure.
7. Wire finances into every new-world path and remove the old standalone
   transfer-funds owner once all callers move.

## Implementation Contract

- `ClubFinanceState` is career truth; UI and market code may not maintain a
  second budget cache.
- Opening capital and season distributions must be explainable from current
  structured inputs and covered by distribution tests.
- Committed wages are derived/validated from active contracts, not manually
  incremented by presentation code.
- Budget policy stays local to its world-generation owner.

## Expected Files

- new focused finance contracts under `packages/domain/src/career/`
- focused domain tests
- `packages/domain/src/state/career-state.ts`
- focused career-state tests
- current world/competition generation Modules and tests under
  `packages/content/src/`
- current career creation composition/tests required to consume finances
- active market state callers that currently own transfer funds
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No payroll transaction application, negotiation, broad Finances screen,
  ticketing, sponsor, stadium, debt, or bankruptcy.
- No decorative income categories.
- No second transfer-budget source retained for compatibility.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/content run test
pnpm --filter @game/engine run test
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Compare opening cash, transfer budget, wage budget, and committed wage for
  weak, average, and strong clubs in the playable division.
- Confirm the numbers create trade-offs without making generated squads
  insolvent on day one.

## Completion Criteria

- Every club has one validated finance state at world creation.
- Existing market funds consume that owner or are deleted.
- No generated club starts with unfunded committed wages.
- Step 04 remains the only next implementation step.
