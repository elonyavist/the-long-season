# Market MVP Report

Phase: `17-market-mvp-permanent-transfers`

Date: 2026-06-21

## Summary

Phase 17 adds the first constrained market loop for permanent transfers.

The feature is intentionally an MVP:

- manager-driven only;
- permanent transfers only;
- command-local/in-memory only;
- true-data valuation and willingness only;
- localized CLI inspection only;
- no career save writes;
- no loans, contracts, wages, transfer windows, registration, scouting fog, AI market behavior, installments, player exchanges, or free agents.

## Implemented Scope

### Domain

`packages/domain/src/entities/transfer.entity.ts` defines dependency-free market data:

- `ClubTransferBudget`;
- `MarketState`;
- `PermanentTransferIntent`;
- transfer feasibility status;
- structured rejection reason codes;
- `PermanentTransferPreview`;
- small validators and ordered lookup helpers.

The domain layer stays language-agnostic and has no dependency on engine, content, storage, CLI, or i18n.

### Engine

`packages/engine/src/market/` now owns pure deterministic market logic:

- `derivePlayerValuation`;
- `derivePlayerWillingness`;
- `evaluatePermanentTransfer`;
- `previewPermanentTransfer`.

The accepted preview path copies `GameState` and `MarketState`, moves the player from seller to buyer, subtracts buyer transfer funds, and adds seller transfer funds when that seller budget exists.

The rejected path returns the original state references and structured reasons.

### CLI

`pnpm cli simulate-season --market-demo=<profile>` is now a standalone inspection view.

Supported demo profiles:

- `pro01-affordable-permanent`;
- `pro01-star-rejected`.

The output shows:

- selected club;
- permanent transfer kind;
- buying club;
- selling club;
- target player;
- transfer value;
- buyer budget before/after;
- accepted/rejected status;
- localized rejection reasons;
- player willingness details when relevant;
- roster preview;
- explicit inspection-only statement.

All user-facing labels are routed through `@game/i18n` for `it`, `en`, `de`, `es`, and `fr`.

## Observed Demo Outputs

### Accepted Permanent Transfer

Command:

```sh
pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent
```

Observed result:

- buyer: `PRO01`;
- seller: `PRO18`;
- target player: `Player18 No10`;
- status: accepted;
- transfer value: `EUR 1529990.00`;
- buyer budget: `EUR 6000000.00 -> EUR 4470010.00`;
- buying roster size: `22 -> 23`;
- selling roster size: `22 -> 21`.

### Rejected Star Transfer

Command:

```sh
pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-star-rejected
```

Observed result:

- buyer: `PRO01`;
- seller: `PRO02`;
- target player: `Player02 No10`;
- status: rejected;
- transfer value: `EUR 9163200.00`;
- buyer budget remains `EUR 100000000.00`;
- rejection reason: player unwilling;
- willingness reasons:
  - destination sporting level is too low;
  - destination reputation drop is too large;
  - prime player rejects this downward move.

## Boundaries Kept

Phase 17 deliberately does not make transfers durable.

That means:

- squads are previewed inside one command;
- budgets are previewed inside one command;
- no save file is updated;
- no transfer history is created;
- no season calendar validation is performed;
- no registration eligibility changes exist;
- no other club initiates market activity.

This keeps the market model testable before career persistence is added.

## Residual Risks

1. Valuation is intentionally broad and fictional. It is good enough for affordability previews, not final economy balance.
2. Willingness uses true data and coarse club category/reputation. It should later accept visible/scouted data once that system exists.
3. CLI demos use deterministic fake scenarios. Real interactive selection is not implemented yet.
4. There is no durable career state, so accepted previews cannot be continued across commands.
5. Seller budget is credited only when the seller has a market budget entry in the provided market state.

## Recommendation

Recommended next phase: **Career State And Transfer Persistence**.

Reason:

The market MVP now proves the core permanent-transfer model. The next useful step is to make accepted transfer actions durable in a documented career state, including:

- selected club context;
- changed rosters;
- changed transfer funds;
- transfer history;
- save/load boundary through the existing storage layer or a documented career-state adapter.

Do not start loans, wages/contracts, transfer windows, scouting fog, AI market behavior, installments, or player exchanges before this persistence layer exists.

## Manual Inspection Commands

```sh
pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent
pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-star-rejected
pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it
```

