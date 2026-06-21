# Candidate Market Phase — Contracts And Wages

## Goal

Add the first economic layer that makes player willingness and squad building more realistic.

## Why this phase exists

Transfer fee alone is not enough. A club may afford a fee but fail on wages, and a player may reject a sporting downgrade unless the contract makes sense.

## Possible Scope

- Basic player contract data:
  - wage;
  - contract end date or remaining years;
  - owning club.
- Wage budget separate from transfer budget.
- Wage affordability validation.
- Player willingness affected by wage offer.
- Contract expiry visibility.
- Basic renewal preview if scoped.

## What NOT to include

- Bonuses.
- Agent fees.
- Release clauses.
- Sell-on clauses.
- Appearance/goal bonuses.
- Complex promises.
- Multi-round negotiation unless Phase 22 is active.

## Extension Points

- Contract terms should be structured and language-agnostic.
- Wage budget should support future financial reports.
- Player willingness should combine sporting level, role/minutes, wage, age, and ambition.

## Phase Gate Question

Can a transfer fail for wage reasons even when the fee is affordable, and can a player's acceptance become more credible without making the system too complex?

## Manual Inspection Target

The user should be able to inspect:

- transfer fee affordability;
- wage affordability;
- player willingness reasons;
- accepted/rejected cases with clear structured reasons.
