# Candidate Market Phase — Structured Transfer Deals

## Goal

Add only the complex deal structures that are useful and readable: one-player exchange and simple installments.

## Why this phase exists

Some market depth is valuable, especially for lower-division clubs with limited cash. But the game should avoid becoming a contract-law simulator.

## Possible Scope

- Single player exchange.
- Cash plus one player exchange.
- Simple installments:
  - upfront amount;
  - installment count;
  - amount per installment or total future commitment.
- Deal total-value validation.
- Future-budget commitment if the economy state supports it.
- Seller valuation of the exchanged player by value, potential, age, role, and usefulness.

## What NOT to include

- Multiple player exchanges.
- Sell-on percentages.
- Appearance bonuses.
- Goal bonuses.
- Agent fees.
- Buyback clauses.
- Loan-to-buy obligations/options.
- Complex payment schedules.

## Extension Points

- Installments should not exist before future-budget state can represent commitments safely.
- Exchange-player valuation must use the same valuation system as normal transfers.
- Anti-exploit tests are required: a low-value player must not make an unrealistic exchange pass.

## Phase Gate Question

Can a cash-plus-player deal work without making valuations exploitable or the UI impossible to understand?

## Manual Inspection Target

The user should be able to inspect:

- cash-only comparison;
- player-exchange comparison;
- rejected exploit exchange;
- installment impact on current and future budget.
