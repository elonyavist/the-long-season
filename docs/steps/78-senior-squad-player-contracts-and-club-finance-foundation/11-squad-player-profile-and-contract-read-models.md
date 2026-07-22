# Step 11 - Squad, Player-Profile And Contract Read Models

## Status

Done.

## Goal

Create framework-free read models and action contracts for the Senior Squad
table, full player profile, contract workflow, and canonical match plan.

## User-Visible Outcome

Later React screens can present exactly the agreed football facts without
deriving rules, exposing hidden potential, or duplicating sorting logic.

## Scope

1. Project the locked Squad columns, composite status, expiry alert, and row
   actions for every selected-club senior player.
2. Project exact current attributes by canonical family.
3. Project club-relative current-level and potential assessment without raw
   hidden ability/potential values.
4. Project roles, suitability, condition, morale, availability, value, shirt
   number, contract terms, bonuses, expiry, agreed status, and history.
5. Project club cash, remaining transfer budget, wage budget, and committed
   wages only where a contract command needs them.
6. Define deterministic default sort and reusable sort/filter keys.
7. Define explicit field/remove/replacement-choice and contract-draft action
   descriptors without React callbacks.
8. Localize labels through existing i18n ownership.

## Implementation Contract

- `@game/ui` imports domain/shared only and receives already-derived engine
  facts through explicit inputs where required.
- Raw hidden potential never appears in a public browser read model.
- Selection and availability remain separate fields even when rendered in one
  Status cell.
- Sort and filter behavior has one framework-free owner shared by table and
  tests.
- No read model mutates career state.

## Expected Files

- new focused Squad/player-profile/contract view Modules/tests under
  `packages/ui/src/career/`
- `packages/ui/src/career/index.ts`
- `packages/ui/src/index.ts` only for current direct public exports
- current engine derivation Modules/tests only if a missing canonical public
  assessment/value projection is required
- current i18n catalogs/tests
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No React, route, CSS, modal, persistence write, or duplicated valuation/
  suitability formula.
- No exact hidden potential, fake scout uncertainty, advice, or automatic
  lineup recommendation.
- No Market or broad Finance read model.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/ui run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Read one row/profile fixture for a selected injured player with an expiring
  contract and verify every fact has a clear owner.
- Confirm public serialized read models contain no raw potential value.

## Completion Criteria

- All locked Squad and profile facts have tested read models.
- Sort/filter and action contracts are reusable and framework-free.
- Hidden information remains hidden.
- Step 12 remains the only next implementation step.
