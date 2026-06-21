# Phase 23 - Playable Career Loop MVP

## Goal

Create the first cohesive save-driven career loop from existing systems.

The player should be able to create or load a career, inspect the current situation, make at least one durable manual choice, advance a fixture or round, persist the changed state, and reload the save to inspect the consequences.

## Product intent

This is not the full game. It is the first playable loop that proves the core manager fantasy:

- the world is generated once per career and then loaded from the save;
- the user, not the system, makes manager decisions;
- decisions persist;
- time advances;
- fixture results and player consequences can be inspected after advancing;
- the loop is deterministic and offline.

## Step order

1. `01-phase-22-output-review.md`
2. `02-career-summary-from-save.md`
3. `03-career-next-fixture-progression-contract.md`
4. `04-persisted-fixture-progression.md`
5. `05-career-advance-cli.md`
6. `06-durable-decision-continuity.md`
7. `07-playability-audit-and-next-phase-decision.md`

## Phase constraints

- Do not add UI.
- Do not add youth intake, scouting, loans, contracts, wages, staff, facilities, or advanced economy.
- Do not add automatic lineup, tactic, market, or squad-need decisions.
- Do not regenerate the world after save creation.
- Do not change the match engine for the sake of progression unless a documented blocker is found.
- Keep CLI/user-facing text localized through the existing i18n layer.
- Keep every persisted state change deterministic and tested.
- Keep implementation narrow enough that future UI can reuse the same domain/engine/storage contracts.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched files;
- `pnpm check`;
- `pnpm cli career --save=phase23-loop-world --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase23-loop-world --summary`;
- `pnpm cli career --save=phase23-loop-world --advance-next-fixture`;
- `pnpm cli career --save=phase23-loop-world --inspect`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- A user can operate a narrow career loop from one save-driven CLI surface.
- Career summary reads from the save.
- Career advancement updates and persists state.
- Reloading the career shows the advanced state.
- At least one manual durable decision remains visible after advancing.
- A playability report records what is fun enough, what is missing, and the recommended next phase.
