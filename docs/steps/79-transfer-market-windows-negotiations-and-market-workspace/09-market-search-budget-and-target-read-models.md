# Step 09 - Market Search, Budget And Target Read Models

## Status

Done.

## Goal

Project one truthful, framework-free Market model from canonical players,
contracts, windows, finances, and negotiations.

## User-Visible Outcome

The manager can compare known players, understand eligibility and cost, and see
actual budget beside possible pending exposure without hidden-potential leaks.

## Scope

1. Build a Market overview with competition window state, current date, close
   or next-open date, cash, transfer budget, committed annual wages, annual
   wage headroom, and pending exposure.
2. Build sortable/filterable target rows for generated players with name,
   club/free-agent state, age, canonical role, public current level, public
   potential assessment, value, contract expiry, availability, and action
   eligibility.
3. Support focused filters for role, age, club/free agent, contract horizon,
   value range, and action eligibility using shared sort/filter utilities.
4. Build a target detail with current public football facts, role fit, contract
   context, valuation, seller context, and allowed next command.
5. Build offer and counteroffer previews showing actual money, resulting
   headroom, and informational pending exposure separately.
6. Build selected-club negotiation summaries for club stage, player stage,
   preliminary agreement, deadlines, and outcome reasons.
7. Localize labels and format dates/money through current shared owners.
8. Resolve `P79-CF-01`: expose one truthful, reload-stable morale direction for
   the reused Squad/player-profile projection from the latest canonical
   morale consequence. If the audited state has no such fact, remove the
   unsupported directional contract and UI branches rather than deriving
   direction from component memory.
9. Resolve `P79-CF-02`: add one exported `@game/ui` contract-expiry alert
   policy/helper and make table/profile projections consume the same exact
   boundary instead of adapter-owned `244` literals.
10. Resolve `P79-CF-06`: build player-keyed contract-history and latest-valid-
    negotiation indexes once per presentation, then consume O(1) lookups while
    projecting each player. Add a long-history regression fixture that proves
    work grows with players plus history, not their product.

## Implementation Contract

- `@game/ui` consumes public engine queries; it does not import content or
  recalculate market policy.
- Exact hidden potential and internal willingness scores never enter browser
  models.
- Lists use stable IDs and deterministic sort tie-breakers.
- Empty, closed-window, pending, error, and completed states are first-class.
- Morale direction and expiry status are derived presentation facts over
  canonical inputs; React identity and duplicated web thresholds own neither.

## Expected Files

- focused Market view-model Modules/tests under `packages/ui/`
- current public player-assessment, contract, finance, and negotiation query
  owners only where a reusable projection is required
- current Squad/player-profile projection Adapter and focused tests only for
  `P79-CF-01`, `P79-CF-02`, and `P79-CF-06`
- `packages/i18n/` labels/tests required by the new public view models
- package exports only where consumed
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No React component, Zustand copy of market state, exact potential, fake scout
  certainty, rendered engine prose, or UI-owned affordability formula.
- No broad Finances read model.
- No dormant filter whose value is not displayed or consumed.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run test
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Read the overview as a manager: actual budget and pending risk must be
  unmistakably different.
- Inspect employed, free-agent, expiring, preliminary-agreement-eligible,
  unaffordable, and outside-window target rows.

## Completion Criteria

- Market, budget, target, detail, and negotiation models are truthful and
  framework-free.
- Every sort/filter/result is deterministic and covered.
- No hidden or duplicated business rule reaches presentation.
- Morale arrows cannot be permanently hardcoded, expiry alerts cannot diverge,
  and player projection performs no per-player full-history scan.
- Step 10 is the only next implementation step.

## Completion Notes

- `@game/ui` now owns framework-free Market target, detail, window, finance,
  pending-exposure, offer-preview, and negotiation models with deterministic
  filters, sorts, IDs, and first-class loading/error/empty/closed states.
- Browser-facing models expose only public categorical current/potential
  assessments; exact hidden ability, willingness, and affordability formulas
  remain outside presentation.
- Unsupported hardcoded morale direction was removed instead of being inferred
  from React memory.
- `CAREER_CONTRACT_EXPIRY_ALERT_DAYS` and
  `hasCareerContractExpiryAlert` now own the exact shared 244-day boundary used
  by both table and profile projections.
- Squad projection indexes contract history and latest valid negotiations once
  before the player loop. A property-access regression test proves history is
  read once per entry rather than once per player and entry.
- Verification: UI tests PASS (`16` files / `87` tests), UI typecheck PASS,
  focused web Squad adapter PASS (`6` tests), i18n tests PASS (`2` files / `18`
  tests), full `pnpm check` PASS (`220` files / `1331` tests; dependency cruise
  `661` modules / `2509` dependencies), `git diff --check` PASS, and
  `graphify update .` PASS.
