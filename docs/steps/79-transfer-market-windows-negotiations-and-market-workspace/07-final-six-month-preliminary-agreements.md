# Step 07 - Final-Six-Month Preliminary Agreements

## Status

Done.

## Goal

Allow clubs to agree a future contract with an eligible player while keeping
current ownership and registration truthful until the existing deal expires.

## User-Visible Outcome

The manager can approach a player in the last six months of a contract,
negotiate terms, and secure a future arrival without paying a transfer fee.
The game clearly shows that the player has not joined yet.

## Scope

1. Add a future-agreement state that reuses the canonical contract terms but
   has a future start date and no active registration.
2. Permit submission only when six calendar months or less remain on the
   target's active agreement.
3. Allow this negotiation outside transfer windows.
4. Reuse the three-day player-negotiation clock, demand, counter, rejection,
   affordability, and selected-club decision rules.
5. Require future wage headroom and signing-cost affordability at agreement;
   revalidate at activation without double charging.
6. Keep the player owned, registered, selectable, and paid by the current club
   until the active agreement ends.
7. Enforce at most one future agreement per player and reject overlapping
   active/future date ranges.
8. Activate on the first valid date after current expiry through one atomic
   ownership, registration, number, contract, history, finance, and squad
   transition.
9. Cancel with a durable factual reason if activation becomes structurally
   impossible; never create dual ownership.

## Implementation Contract

- A future agreement is durable domain state, not a delayed callback or Inbox
  reminder pretending to be a contract.
- The universal final-six-month rule is the current game rule. Nation-specific
  legal exceptions wait until those competitions become playable.
- Activation uses canonical game-day advancement and is idempotent.
- No transfer fee is posted at agreement or activation.

## Expected Files

- current agreement, registration, history, finance, and career-state domain
  Modules/tests identified by Step 01
- focused preliminary-agreement negotiation/activation Modules and tests under
  `packages/engine/`
- current career day/month/season advancement callers only where activation is
  applied
- package exports only where required
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No transfer-fee negotiation, early move, loan-back, compensation rule,
  country exception, agent, or release clause.
- No ownership or plan mutation before activation.
- No second contract algebra or background timer.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Inspect eligibility at six months plus one day, exactly six months, one day
  before expiry, expiry day, and activation day.
- Verify current club selection remains valid before activation and the buyer
  sees a future arrival, not an owned player.

## Completion Criteria

- Eligibility, negotiation, persistence-ready state, and activation are
  deterministic and tested.
- No player can have overlapping or duplicate future agreements.
- Ownership, finance, registration, and history remain coherent across expiry.
- Step 08 is the only next implementation step.
