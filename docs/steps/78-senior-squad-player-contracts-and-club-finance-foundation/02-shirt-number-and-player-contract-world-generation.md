# Step 02 - Shirt Number And Player Contract World Generation

## Status

Done.

## Goal

Give every generated senior player a persistent club registration and one real
active contract from the moment the world is created.

## User-Visible Outcome

New careers have stable shirt numbers and credible contract facts instead of
index-based display values or absent employment terms.

## Scope

1. Add namespaced contract IDs and dependency-free domain contracts for senior
   registration, active player contract, contract type, agreed squad status,
   bonuses, and factual contract history.
2. Enforce one active contract per owned senior player and one club per active
   contract.
3. Enforce unique valid senior shirt numbers within each club.
4. Keep contracts separate from immutable player identity.
5. Generate shirt numbers deterministically from role, squad order, and stable
   tie-breaks.
6. Generate start/end dates, duration, annual wage, squad status, signing,
   appearance, goal, and clean-sheet bonuses from age, canonical current level,
   reachable potential, role, division/category, and club reputation.
7. Generate professional or youth contract type only where the current player
   lifecycle can consume it.
8. Wire generation into every current new-world path in the same step.

## Implementation Contract

- Money uses integer minor units and existing money value objects.
- Contract policy lives beside content world generation, not in a global
  balance package.
- Goal bonuses do not apply to goalkeepers; clean-sheet bonuses are limited to
  roles for which the match report can prove the fact.
- No generated term may exist without a later Phase 78 lifecycle consumer.
- Same seed and date produce byte-equivalent ordered registrations/contracts.

## Expected Files

- `packages/domain/src/types/ids.ts`
- focused ID tests
- new focused contract/registration Modules under `packages/domain/src/career/`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/state/career-state.ts`
- focused career-state tests
- current world-generation Modules/tests under `packages/content/src/`
- current career creation composition/tests in engine or app adapters only
  where required to consume the generated facts
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No negotiation, expiry, payroll charging, transfer integration, UI, or
  persistence migration.
- No agents, options, release clauses, loans, promotion clauses, or unused
  contract variants.
- No shirt number derived from React list order.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/content run test
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect at least five clubs from two world seeds and compare number, age,
  role, wage, duration, status, and bonus distributions.
- Confirm no player has a duplicate number or a second active employer.

## Completion Criteria

- Every new senior club member has one persistent registration and contract.
- Generated terms vary credibly with the locked inputs.
- There is no default/fallback contract path left for new careers.
- Step 03 remains the only next implementation step.
