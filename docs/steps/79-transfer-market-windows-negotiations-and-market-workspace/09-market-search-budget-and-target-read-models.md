# Step 09 - Market Search, Budget And Target Read Models

## Status

Ready.

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

## Implementation Contract

- `@game/ui` consumes public engine queries; it does not import content or
  recalculate market policy.
- Exact hidden potential and internal willingness scores never enter browser
  models.
- Lists use stable IDs and deterministic sort tie-breakers.
- Empty, closed-window, pending, error, and completed states are first-class.

## Expected Files

- focused Market view-model Modules/tests under `packages/ui/`
- current public player-assessment, contract, finance, and negotiation query
  owners only where a reusable projection is required
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
- Step 10 is the only next implementation step.
