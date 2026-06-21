# Player Generation Quality Rework Report

Date: 2026-06-21
Phase: `24-player-generation-quality-rework`
Status: Complete

## Summary

Phase 24 resolves the core product risk raised by the user: generated lower-division players looked too strong, too generic, and too role-incoherent.

The generator is now credible enough for the current CLI-first career loop. Third-division squads are no longer compressed first-division squads. Current ability, potential, role identity, age, and rarity are separated into explicit deterministic content data.

## Before

The old generator used one broad base value for nearly every ability. Position logic added small offsets, but did not stop off-role spikes.

Confirmed issues:

- lower-division defenders could receive high finishing, penalties, free kicks, and goalkeeper reflexes;
- attackers could receive high tackling too often;
- goalkeepers and outfield players shared too much of the same base profile;
- high-potential players were tied too closely to broad current ability;
- rare lower-division exceptions were not controlled by a league-level budget;
- there was no CLI report to inspect generation quality across seeds.

## Adopted Model

The new generator is built from five explicit layers:

1. Division and club-tier bands

   `player-generation-bands.ts` defines current and potential ranges by division and generated club tier. Third-division title clubs, mid-table clubs, and survival clubs now start from different quality bands.

2. Role templates

   `player-role-templates.ts` builds the full 25-attribute shape from position-specific templates. Off-role values are capped so a defender does not become a strong finisher by accident, an attacker does not become a strong tackler by accident, and non-goalkeepers do not inherit goalkeeper-level reflexes.

3. Age and potential archetypes

   `player-archetypes.ts` separates ordinary senior players, category starters, category stars, veteran drop-downs, normal youth, good prospects, serious prospects, and rare prodigies. Archetypes now include a broad `potentialClass` for tests and quality reports.

4. Rarity budgets

   `player-rarity-budget.ts` assigns rare cases at league level, by seed. Budget-controlled archetypes cannot leak through ordinary weighted selection.

5. Product-level quality tests

   `player-generation-quality.test.ts` now protects seed stability, seed variation, role-coherence caps, rare high-current players, serious/elite prospect bounds, and prospect coverage per club.

## Current Evidence

`world-a` player-generation report:

- clubs: `18`
- players: `396`
- current ability distribution:
  - `0-8`: `105`
  - `9-11`: `166`
  - `12-14`: `122`
  - `15+`: `3`
- potential distribution:
  - limited: `0`
  - category: `250`
  - interesting: `143`
  - serious: `2`
  - elite: `1`
- rarity budget usage:
  - white-fly players: `1 / 1`
  - serious prospects: `2 / 2`
  - rare prodigies: `1 / 1`
- clubs with prospects: `18 / 18`
- role-coherence warnings: `none`

`world-b` player-generation report:

- clubs: `18`
- players: `396`
- current ability distribution:
  - `0-8`: `96`
  - `9-11`: `170`
  - `12-14`: `127`
  - `15+`: `3`
- potential distribution:
  - limited: `0`
  - category: `246`
  - interesting: `146`
  - serious: `3`
  - elite: `1`
- rarity budget usage:
  - white-fly players: `1 / 1`
  - serious prospects: `3 / 3`
  - rare prodigies: `1 / 1`
- clubs with prospects: `18 / 18`
- role-coherence warnings: `none`

The result matches the intended lower-division fantasy: every club can have prospects, but serious/elite cases are scarce, and only a few current players reach the `15+` role-peak bucket.

## Manual Inspection Commands

Use these commands when reviewing generated worlds:

```bash
pnpm cli simulate-season --seed=world-a --identity-review
pnpm cli simulate-season --seed=world-b --identity-review
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

## Verification

Passed:

- `pnpm --filter @game/content run typecheck`
- focused content generation tests
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused CLI/i18n tests
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-b --identity-review`
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-b --player-generation-report`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

Latest strict balance sample after the rework:

- goals per match: `2.859`
- home win rate: `0.413`
- draw rate: `0.238`
- away win rate: `0.349`
- first-place points: `70.500`
- last-place points: `25.500`
- table points spread: `45.000`
- upset proxy rate: `0.350`
- status: `PASS`

## Score

Current player-generation quality score: `93 / 100` for current project maturity.

Why not `100` yet:

- only the fake third-division league is exercised end to end;
- first- and second-division generation bands exist, but full multi-division career worlds are not implemented yet;
- player growth/regression is still missing, so potential is a stored future ceiling, not an observed multi-season development curve;
- scouting fog and UI presentation are not implemented yet;
- transfer-market behavior uses the improved data, but long-term squad building is still early.

## Next Phase Decision

Recommended next phase: `Phase 25 - Career Match Preparation Persistence`.

This resumes the previous post-Phase-23 direction, but under a new phase number because Phase 24 was correctly used to harden player generation first.

Reason:

- the playable loop can already create a save, summarize it, apply a manual transfer, and advance a fixture;
- Phase 24 makes the generated player pool credible enough to build on;
- the next missing gameplay layer is durable match preparation: selected lineup, selected tactic, and manual match choices should persist into career progression instead of staying as standalone CLI demos.

Do not start youth academy or deeper market phases before this persistence step. Those systems need the same durable preparation layer to feel coherent.
