# Step 05 - Club-To-Club Permanent-Transfer Negotiation

## Status

Ready.

## Goal

Create the first explicit transfer table: a deterministic up-front fee
negotiation between buyer and seller.

## User-Visible Outcome

The manager can offer a fee for an employed player and receive a clear
acceptance, rejection, or counteroffer from the selling club within three game
days.

## Scope

1. Extend the canonical transfer entity with one club-negotiation lifecycle,
   stable IDs, parties, target, up-front fee, dates, state, and outcome reason.
2. Validate ownership, player eligibility, window eligibility, duplicate open
   talks, and positive integer-minor-unit money at submission.
3. Derive seller willingness from value, contract security, squad status,
   current squad depth, club finances, and deterministic football policy.
4. Support submitted, accepted, rejected, countered, expired, withdrawn, and
   unaffordable-cancelled outcomes.
5. Keep an accepted club agreement provisional until player terms complete.
6. Preserve the original three-day stage deadline through counteroffers.
7. Ensure repeated resolution cannot emit duplicate facts or mutate twice.

## Implementation Contract

- Extend the existing permanent-transfer and valuation owners; do not build a
  market-only transfer model.
- Club acceptance does not transfer ownership or spend money.
- Reasons are structured and presentation-neutral.
- All policy inputs come from canonical career facts.

## Expected Files

- current transfer entity, valuation, willingness, feasibility, and tests
  identified by Step 01
- focused club-negotiation use case and tests under `packages/engine/`
- package exports only where required
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No installments, bonuses, loans, swaps, auction, bidding war, agent, or
  release-clause path.
- No player contract negotiation or transfer completion in this step.
- No selected-club auto-acceptance or hidden fee adjustment.

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

- Inspect strong seller, weak seller, short-contract, long-contract, surplus,
  and structurally important player stories.
- Verify accepted club terms still leave ownership and finance unchanged.

## Completion Criteria

- Club negotiations use one three-day lifecycle and factual outcomes.
- Seller behavior is deterministic and football-coherent.
- No ownership or budget commits before player terms.
- Step 06 is the only next implementation step.
