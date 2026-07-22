# Step 04 - Three-Day Negotiation Clock And Pending Exposure

## Status

Ready.

## Goal

Replace open-ended and reservation-based pending behavior with deterministic
three-day negotiations and truthful informational exposure.

## User-Visible Outcome

Offers receive an answer quickly. Sending several offers does not freeze the
budget, but the manager sees the combined risk and cannot complete a deal that
the club can no longer afford.

## Scope

1. Give every club-stage and player-stage negotiation an immutable submitted
   date, response date, and deadline no more than three calendar days later.
2. Keep the deadline when a counteroffer is produced; a counter does not reset
   the stage clock.
3. Resolve due negotiations in stable submission-date and stable-ID order.
4. Remove actual cash, transfer-budget, signing-bonus, and annual-wage
   reservation from pending offers.
5. Derive aggregate pending transfer, signing, and annual-wage exposure without
   mutating finance accounts or ledgers.
6. Recheck current affordability when an acceptance is applied.
7. Cancel an unaffordable response with a stable factual reason no later than
   its deadline.
8. Make submission, repeated daily progression, reload, and resolution
   idempotent.
9. Replace and delete the temporary Phase 78 reservation helper after proving
   every production caller has migrated.

## Implementation Contract

- Pending exposure is a query result, never a second budget.
- Only completed commitments affect finance state and ledger entries.
- Time progression consumes canonical game dates and emits structured facts.
- The same rules apply to selected and AI clubs; only decision ownership
  differs.

## Expected Files

- current negotiation domain/engine Modules and tests identified by Step 01
- focused pending-exposure query and tests under `packages/engine/`
- current Phase 78 reservation helper and callers, removed after migration
- package exports only where required
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No shadow wallet, reserved-budget account, or pending ledger transaction.
- No counteroffer deadline reset or random wall-clock timer.
- No UI or Posta rendering yet.
- No silent cancellation without a durable outcome fact.

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

- Submit ten affordable offers and confirm actual budgets remain unchanged
  while pending exposure is correct.
- Complete enough deals to consume headroom, then inspect deterministic
  cancellation of later unaffordable outcomes by their deadline.

## Completion Criteria

- Every negotiation stage resolves or expires within three game days.
- Pending offers do not alter actual finance state.
- Acceptance is rechecked atomically and produces a durable reason when no
  longer affordable.
- The superseded reservation path has no production caller and is removed.
- Step 05 is the only next implementation step.
