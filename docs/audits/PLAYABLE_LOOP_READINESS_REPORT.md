# Playable Loop Readiness Report

Date: 2026-06-21
Phase: `18-career-state-and-transfer-persistence`
Status: Ready for a first playable career-loop phase, not yet a complete playable game.

## Summary

Phase 18 closes the main blocker left by the in-memory market MVP: accepted permanent transfers can now become durable career state.

The project can now prove this loop:

1. create a deterministic career save;
2. apply one supported permanent-transfer decision;
3. persist changed roster ownership, transfer funds, and transfer history;
4. reload the same career save;
5. inspect the durable result from CLI.

This is enough to start evaluating a first playable career loop, because the user can make one meaningful squad-building decision and see that it survives across commands. It is not yet enough to call the game broadly fun, because the loop is still split across inspection commands and lacks a cohesive day-to-day career shell.

## What Is Now Playable

- Deterministic season simulation from fictional content.
- Fixture inspection with structured events, scorers, assists, shots, saves, and player match stats.
- Formation fit inspection against the selected squad, showing natural/adapted/weak coverage without telling the manager what to buy.
- Manual tactic profiles and manual in-fixture tactic switching for the selected club.
- Manual lineup rotation for a selected fixture.
- Player condition lifecycle inspection.
- Permanent-transfer market inspection for accepted and rejected demo transfers.
- Career market apply command for supported permanent-transfer demos.
- Career save inspection after a persisted transfer.

The most important playable decision now is narrow but real: the manager can make a permanent-transfer action and then verify that the squad and budget changed durably.

## What Is Now Durable

- `CareerState` is the durable wrapper around the current playable world.
- The selected club is persisted.
- The current `GameState` snapshot is persisted.
- Transfer budgets are persisted through `MarketState`.
- Accepted permanent-transfer roster changes are persisted.
- Permanent-transfer history is persisted with buyer, seller, player, fee, sequence number, and in-world date.
- Rejected transfers do not mutate or write the career save.
- Career saves are stored through the storage boundary, not directly by engine code.

## What Is Still Inspection-Only

- `simulate-season --market-demo=...` remains an inspection preview and does not write a save.
- Formation fit remains a factual inspection and does not create market advice or actions.
- Manual lineup/tactic demos remain deterministic CLI inspection flows.
- Condition demo remains an inspection view over deterministic fitness spend/recovery.
- There is no full career home command yet that loads one save and routes all manager actions through that save.
- There is no multi-step career calendar advancement command.

## What Is Missing Before A Real First Playable Loop

The next loop needs cohesion more than depth.

Required before calling it first playable:

- A single career command flow that starts from an existing career save instead of rebuilding demo state each time.
- A clear selected-club career screen or CLI summary: squad, budget, formation fit, recent transfers, next fixture.
- A way to apply a transfer from a loaded save and then inspect the same save without relying on a demo bootstrap path.
- A way to simulate at least one fixture or round from a loaded career save and persist the updated world.
- A consistent manual loop: inspect squad, choose formation/lineup/tactic, inspect market, apply action, save, reload.
- A small set of deterministic fixture/season progression commands that do not silently recompute from scratch.
- A playability checklist focused on whether the manager has understandable choices, consequences, and continuity.

Nice-to-have, but not required for first playable:

- richer market search/listing;
- UI;
- loans;
- contracts and wages;
- transfer windows;
- scouting fog;
- AI club market behavior;
- youth intake;
- player exchanges or installments.

## Manual Commands To Run

Run the persistence loop:

```sh
pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent
pnpm cli career --save=career-demo --inspect
```

Check that:

- the apply command writes `Career save written: yes`;
- PRO01 roster goes from `22 -> 23`;
- PRO18 roster goes from `22 -> 21`;
- the inspect command shows PRO01 roster size `23`;
- PRO01 transfer funds are `EUR 4470010.00`;
- transfer history contains `Player18 No10: PRO18 -> PRO01`;
- PRO18 budget is credited.

Run the rejected-transfer guard:

```sh
pnpm cli career --seed=demo-001 --save=career-demo-rejected --apply-market-demo=pro01-star-rejected
```

Check that:

- status is rejected;
- `Career save written: no`;
- the reasons explain player unwillingness.

Run current gameplay and balance checks:

```sh
pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Check that:

- localized market inspection still reads correctly;
- the balance report still passes strict `calibration-v1`.

## Recommended Phase 19

Recommended next phase: **Phase 19 - First Playable Career Loop MVP**.

Reason: market depth can wait. The project now has enough core pieces to test whether the game loop feels coherent:

- selected club;
- squad and formation facts;
- manual lineup/tactic control;
- player condition;
- permanent-transfer action;
- durable save/load;
- deterministic match/season output.

The best next step is to connect these existing pieces into one narrow career loop before adding more market depth, scouting, youth, contracts, or AI. If the loop is not understandable or satisfying with the current pieces, adding deeper systems will hide the problem instead of solving it.

Phase 19 should not be a UI phase yet unless explicitly decided. A CLI-first loop is enough to validate continuity and decision quality.

## Known Risks

- The apply command still bootstraps a deterministic demo career before writing; future career actions must operate on the loaded save.
- There is no persistent fixture/round progression command yet.
- The market currently has only demo profiles, not a general player search/list/apply flow.
- The match engine remains aggregate-first and not a live possession engine.
- No transfer windows or registration rules exist, so market actions are intentionally unconstrained by calendar.
- Player willingness is true-data based; scouting fog and perceived value are not implemented.
- Save migration is minimal because career schema version is still `1`.

## Non-Goals Confirmed

- No loans.
- No contracts or wages.
- No transfer windows.
- No scouting fog.
- No AI club market behavior.
- No youth systems.
- No installments.
- No player exchanges.
- No UI.
- No automatic lineup, tactic, or market decisions.

## Decision

Phase 18 passes as a persistence bridge.

The project should proceed to a first playable career-loop phase before market-depth work. The next phase should answer one question:

Can a manager start from one career save, inspect the squad, make one manual football decision, persist the consequence, and continue from the changed state without mental bookkeeping?
