# Candidate Market Phase — Negotiation V1

## Goal

Replace one-shot accept/reject transfers with a small deterministic negotiation loop.

## Why this phase exists

Once permanent transfers, persistence, loans, wages, scouting, and AI behavior exist, a binary market becomes too rigid. Negotiation should add tension without becoming legal/financial overload.

## Possible Scope

- Initial offer.
- Seller counteroffer.
- Player wage counteroffer if Phase 19 exists.
- Acceptance thresholds.
- Rejection after too many failed offers.
- Deterministic response delays.
- Structured negotiation state.

## What NOT to include

- Agents as deep characters.
- Auctions between multiple clubs.
- Add-ons.
- Sell-on clauses.
- Appearance bonuses.
- Multiple-player exchanges.
- Deadline-day special rules.

## Extension Points

- Negotiation state should be serializable.
- Counteroffers should preserve structured reasons.
- Future agent personality can influence thresholds without changing the core contract.

## Phase Gate Question

Can a user make a better second offer after a rejection and understand why the deal moved?

## Manual Inspection Target

The user should be able to inspect:

- rejected initial offer;
- counteroffer;
- accepted improved offer;
- expired or failed negotiation.
