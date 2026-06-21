# Candidate Market Phase — Market MVP Permanent Transfers

## Goal

Create the first manual transfer-market loop: inspect available players, preview a permanent transfer, apply it deterministically in memory, and inspect the updated squad/formation fit.

## Why this phase exists

The current game can show that a squad does or does not fit a formation, but the manager cannot yet act on that information. This phase turns squad-fit facts into the first manual squad-building action without adding contracts, scouting fog, loans, or persistence complexity too early.

## Core Design

Permanent transfers must be validated through three separate checks:

- buying club capacity: budget and squad limits;
- selling side availability: player can be acquired from the market pool or selling club;
- player willingness: player accepts the destination.

Player willingness is required in the MVP. A strong first-division striker must not accept a third-division club just because the fee is paid.

## Possible Scope

- `MarketState` for current in-memory market data.
- `TransferIntent` for user-declared buy/sell actions.
- `TransferFeasibility` with structured accept/reject reasons.
- `PlayerValuation` based on ability, potential, age, role value, and reputation.
- Basic `ClubBudget`.
- Deterministic transfer pool generated from seed.
- Permanent transfer validation.
- Permanent transfer application in memory.
- CLI market list/inspect command.
- CLI transfer preview/apply demo command.
- Formation-fit inspection after a transfer.

## What NOT to include

- Loans.
- Contracts and wages.
- Installments.
- Player exchanges.
- AI club bids.
- Transfer windows.
- Scouting fog.
- Career persistence.
- Automatic recommendations.
- Hidden best-buy logic.

## Extension Points

- `TransferKind` should be shaped so `loan` can be added later.
- `TransferFeasibilityReason` should be structured and language-agnostic.
- `MarketState` should separate budgets, player availability, player ownership, and transfer history.
- Valuation should be deterministic and testable, not embedded in CLI formatting.

## Phase Gate Question

Can the manager manually change the squad through a believable permanent transfer while the game clearly explains affordability, seller acceptance, and player willingness?

## Manual Inspection Target

The user should be able to inspect:

- available players;
- why a transfer is accepted or rejected;
- a rejected top-player move to a much lower category;
- updated PRO01 squad/formation fit after a valid transaction.
