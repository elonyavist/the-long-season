# Step 07 - Selected-Club Contract Posta And Continue Workflow

## Status

Done.

## Goal

Connect selected-club negotiations and expiry deadlines to the canonical
Posta/Continue decision loop.

## User-Visible Outcome

The manager receives timely renewal reminders, responses, counteroffers, and
deadline decisions. Continue stops only when a real answer is required.

## Scope

1. Add stable structured attention identities for contract reminder,
   counteroffer, acceptance, rejection, and final expiry decision.
2. Warn when fewer than eight months remain without creating a blocker.
3. Deliver submitted-offer responses on their due career date.
4. Stop Continue for a counteroffer or mandatory deadline decision.
5. Let the manager accept, reject, revise, withdraw, renew, or explicitly
   release through typed commands.
6. Resolve Posta lifecycle facts only when the underlying negotiation or
   expiry state is resolved.
7. Keep message ordering and same-date batching deterministic.
8. Add localized concise football-management copy in presentation packages.

## Implementation Contract

- Posta derives from structured contract facts; it does not own negotiation
  truth.
- A reminder may be important but non-blocking; a due counter/final decision
  is blocking.
- The selected club never auto-accepts, auto-renews, or auto-releases.
- Continue and save cadence retain their current canonical owners.

## Expected Files

- current domain attention/inbox contracts and focused tests
- current engine Continue, attention, Posta, and career-day Modules/tests
- current selected-club contract command adapters/tests
- current `@game/ui` Posta read-model Modules/tests
- current i18n catalogs/tests
- current web Posta command/presentation Modules/tests only where needed to
  exercise the real workflow
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No Market, Youth, Staff, or generic finance message without its workflow.
- No prose-only message or duplicate notification for one state transition.
- No automatic decision when the manager ignores a blocking deadline.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Advance from an eight-month reminder to a delayed response, counteroffer,
  acceptance/rejection, and final expiry decision.
- Confirm Continue stops only at the locked decision boundaries.

## Completion Criteria

- Every selected-club negotiation state has one truthful Posta projection.
- Blocking and non-blocking attention are semantically correct.
- No selected-club contract decision occurs silently.
- Step 08 remains the only next implementation step.
