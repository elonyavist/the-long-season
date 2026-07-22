# Step 06 - Contract Demand, Offer And Negotiation Engine

## Status

Done.

## Goal

Implement a deterministic, time-based contract negotiation that produces
credible acceptance, rejection, and counteroffers from real career facts.

## User-Visible Outcome

A renewal is a football-management decision, not an instant form submission.
The player responds after days and may ask for different terms.

## Scope

1. Add typed draft offer, submitted offer, response-due date, negotiation
   state, response, counteroffer, acceptance, rejection, withdrawal, and expiry
   contracts.
2. Derive player demands from age, current level, reachable potential, role,
   agreed status, current wage, club reputation/category, remaining term, and
   free-agent leverage.
3. Evaluate duration, annual wage, squad status, signing, appearance, goal, and
   clean-sheet bonuses together.
4. Generate deterministic response delays and stable counteroffer terms.
5. Enforce club cash and wage-budget affordability before submission and again
   before acceptance.
6. Activate an accepted renewal at the correct boundary without overlapping
   active contracts.
7. Produce structured facts only for Posta and UI presentation.

## Implementation Contract

- The same negotiation use case serves selected and AI clubs.
- Negotiation randomness uses explicit seeded input and stable tie-breaks.
- There is no hidden personality or agent system.
- Repeated evaluation of the same state and seed returns the same result.
- Only terms with finance/lifecycle consumers are accepted by validation.

## Expected Files

- focused negotiation contracts/tests under `packages/domain/src/career/`
- focused negotiation demand/evaluation/application Modules/tests under
  `packages/engine/src/career/`
- current career-day/month lifecycle Modules/tests required to resolve due
  responses
- current finance affordability Modules/tests
- current career-state validation/tests
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No React UI, rendered prose, Posta delivery, agents, promises, transfer
  negotiation, or unsupported clause.
- No instant response shortcut for the selected club.
- No unseeded random decision.

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

- Compare offers to a young prospect, prime starter, veteran reserve, and free
  agent across weak and strong clubs.
- Confirm reasons and counteroffers follow real terms rather than opaque score
  thresholds.

## Completion Criteria

- Submit, wait, counter, accept, reject, withdraw, and expire are complete.
- Affordability and active-contract invariants cannot be bypassed.
- The engine emits no user-facing prose.
- Step 07 remains the only next implementation step.
