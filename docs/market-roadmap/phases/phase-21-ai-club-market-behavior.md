# Candidate Market Phase — AI Club Market Behavior

## Goal

Let non-user clubs perform simple deterministic market actions so the world evolves.

## Why this phase exists

A career world cannot stay static. Other clubs need to buy, sell, loan, and replace players in a limited but credible way.

## Possible Scope

- AI club market budget.
- Simple AI squad-depth assessment.
- Deterministic AI transfer intents.
- AI permanent transfers.
- AI loans if Phase 18 exists.
- Transfer log visible to the user.
- Batch balance checks for market churn.

## What NOT to include

- Auctions.
- Bidding wars.
- Deep negotiation.
- Hidden cheating.
- User-directed recommendations.
- Full media/news system unless a later phase opens it.

## Extension Points

- AI decisions should use the same validation engine as user actions.
- AI should not bypass player willingness or budget rules.
- AI market activity should be deterministic by season, date, and club.

## Phase Gate Question

Can the world perform simple transfers without destabilizing squads, budgets, or balance?

## Manual Inspection Target

The user should be able to inspect:

- market log;
- AI transfers by club;
- unchanged deterministic output for the same seed;
- no impossible top-player moves to tiny clubs.
