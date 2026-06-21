# Candidate Market Phase — Career State And Transfer Persistence

## Goal

Make market actions persist in a career state instead of existing only as one command's in-memory preview.

## Why this phase exists

The first market MVP proves the market model. This candidate phase makes it useful for an actual run: squads, budgets, and transfer history must survive between commands and season transitions.

## Possible Scope

- Define a minimal `CareerState` or extend current `GameState` through a documented career slice.
- Persist club squads after transfers.
- Persist club budgets.
- Persist transfer history.
- Save/load market-modified state through the storage boundary.
- CLI command to create/load a demo career save.
- CLI command to apply one transfer to the loaded career state.

## What NOT to include

- Loans.
- Contracts and wages.
- Multi-season financial commitments.
- AI club transfer behavior.
- Transfer windows.
- Full UI.
- Complex save-slot management beyond what the phase needs.

## Extension Points

- Transfer history should store structured operation data, not rendered prose.
- Persisted market state should be migration-friendly.
- Budget state should leave room for future wage budget and installment commitments.

## Phase Gate Question

Can a transfer change persist and be inspected later without recomputing or losing the deterministic market state?

## Manual Inspection Target

The user should be able to:

- create a demo career;
- apply one transfer;
- reload;
- see the changed squad, changed budget, and transfer history.
