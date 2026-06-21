# New Career World Generation Report

Date: 2026-06-21

## Summary

Phase 20 makes new career creation seed-driven. A career can now be created from a world seed, persisted through the career storage boundary, and inspected later without regenerating a different world.

The core rule is:

- `GameState.meta.seed` can still drive runtime season/match simulation;
- `CareerWorldMetadata.worldSeed` identifies the generated fictional world stored inside a career save;
- generated players, names, nationalities, ages, archetypes, and potential must be stable once written to a career save.

## What Changed

- `domain` now has `CareerWorldMetadata` with `worldSeed`, `generatorVersion`, and `creationSourceKey`.
- `CareerState` can persist optional career-world metadata.
- `content` now has generated player archetypes:
  - first-team regular;
  - rotation player;
  - veteran;
  - prospect;
  - high-potential prospect;
  - rare wonderkid.
- Fake player generation now accepts a world seed through `createFakeLeagueSystem({ worldSeed })`.
- Stable player IDs are preserved, but generated names, nationalities, ages, current ability variance, and archetypes can vary by world seed.
- The standalone `simulate-season` CLI now passes `--seed` to both season simulation and fake world generation, so `--identity-review` visibly changes for `world-a`, `world-b`, and `world-c`.
- `pnpm cli career --save=<saveId> --seed=<worldSeed> --new-world-preview` writes a generated career world save.
- `pnpm cli career --save=<saveId> --inspect` shows world seed and generator version when present.
- `content` owns a flag asset mapping from `NationalityCode` to `assets/flags/<code>.svg`.

## World Seed And Persistence

The CLI creation path builds a fake league with the provided world seed, then writes the generated world into career storage.

Inspecting the same save loads persisted data. It should not call the generator again to create a different squad.

For the standalone, non-persisted `simulate-season` command, `--seed` is used as the temporary fake world seed as well as the season simulation seed. This keeps quick CLI inspection ergonomic:

```sh
pnpm cli simulate-season --seed=world-a --identity-review
pnpm cli simulate-season --seed=world-b --identity-review
pnpm cli simulate-season --seed=world-c --identity-review
```

Those commands should show different generated names and nationality mixes. Persisted careers still rely on `CareerWorldMetadata.worldSeed` in the save.

Observed command:

```sh
pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase20-world-a --inspect
```

Observed inspect result includes:

- `World seed: world-a`
- `Generator version: 1`
- selected club `PRO01`
- selected club roster size `22`

## Same Seed And Different Seed Behavior

The same seed is reproducible because generation uses deterministic RNG streams derived from the seed and stable keys.

Different seeds are visibly different. Observed samples:

`world-a` selected club summary:

- Argentinian: 1
- German: 2
- Italian: 19
- 21 or under: 5
- 22-29: 10
- 30 or older: 7
- Prospects: 5
- High-potential prospects: 0
- Rare wonderkids: 0

`world-b` selected club summary:

- Albanian: 1
- Colombian: 1
- French: 1
- Italian: 15
- Japanese: 1
- Serbian: 1
- Spanish: 1
- Turkish: 1
- 21 or under: 4
- 22-29: 11
- 30 or older: 7
- Prospects: 4
- High-potential prospects: 2
- Rare wonderkids: 0

This is enough variation for the current CLI-first career foundation.

## Names And Identity Quality

Phase 20 improved the repeated-name problem from Phase 19 by adding deterministic per-club duplicate avoidance.

The surname-variety rework then tightened the rule further:

- no duplicate full names inside a club;
- no repeated surname inside a club under normal pool capacity;
- no surname used more than twice in the generated league under normal pool capacity;
- if a surname appears twice in the generated league, the first names must differ.

Observed `demo-001` / `PRO01` identity review now shows 22 different surnames in the selected squad.

Current example:

- Ethan Walsh
- Nikola Knezevic
- Luca Sartori
- Giorgio Zaccaria
- Davide Cavallaro
- Enrico De Santis
- Enrico Savini
- Giorgio Verdi
- Matteo Vitale
- Luca Damiani
- Matteo Pini
- Nico Capra
- Luca Cambi
- Nico Morelli
- Enrico Borghetti
- Luca Pellegrini
- Matteo Biondi
- Giorgio Carnevali
- Giorgio Parisi
- Enrico Pellegrino
- Dario Radic
- Giorgio Raimondi

The Italian lower-league surname pool was expanded because a domestic-heavy 18-club league needs enough surname capacity to keep max-two league reuse realistic. The Balkan pool was also expanded after tests exposed overuse of `Jovanovic`.

Names remain generated content, not localization labels. They should not be translated.

## Nationality Distribution

The current third-division sample remains domestic-heavy, which matches the intended model:

- lower divisions: mostly domestic players, with some foreign players;
- higher divisions: more foreign players;
- stronger clubs in top divisions: can become more international.

Observed `demo-001` / `PRO01` nationality summary:

- Croatian: 1
- Italian: 19
- Serbian: 1
- Welsh: 1

This is credible for a third-division Italian-like demo club.

## Age, Potential, And Prospects

Archetypes drive the broad shape:

- regulars and rotation players anchor the current squad;
- veterans can be useful now but have less long-term upside;
- prospects and high-potential prospects create career planning decisions;
- rare wonderkids are possible but not guaranteed.

The CLI intentionally reports age/prospect bands, not exact potential. Exact potential should remain internal until a future scouting/fog-of-war phase decides how much the user can know.

## Flag Assets

Flags are presentation assets, not domain or engine data.

The adopted ownership rule is:

- `domain` stores `NationalityCode`;
- `content` maps `NationalityCode` to flag asset metadata;
- future UI/CLI presentation can use `flagAssetForNationality`;
- `Player`, `PersonIdentity`, `GameState`, `CareerState`, match reports, and engine logic must not store SVG paths.

All supported nationalities currently map to existing checked-in SVG files under `assets/flags/`.

## Balance And Regression Check

The final strict balance report still passes:

- goals per match: `2.863`
- home win rate: `0.417`
- draw rate: `0.234`
- away win rate: `0.349`
- first-place points: `70.350`
- last-place points: `23.950`
- table points spread: `46.400`
- upset proxy rate: `0.338`

The generation changes did not break the current calibration gate.

## Manual Commands

Create and inspect two generated career worlds:

```sh
pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase20-world-b --seed=world-b --new-world-preview
pnpm cli career --save=phase20-world-a --inspect
```

Review generated identities:

```sh
pnpm cli simulate-season --seed=demo-001 --identity-review
pnpm cli simulate-season --seed=world-a --identity-review
pnpm cli simulate-season --seed=world-b --identity-review
pnpm cli simulate-season --seed=world-c --identity-review
```

Review season output:

```sh
pnpm cli simulate-season --seed=demo-001
```

Check balance:

```sh
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

## Recommendation

Phase 20 is complete.

The recommended next phase is the first playable career loop foundation, not youth academy or deeper market systems yet.

Reason: the project can now create and persist a distinct world, but the user still does not have a minimal career loop where they select a club, inspect squad state, make choices, advance time, and see those choices persist. Youth and market depth will be more valuable after that loop exists.

Suggested next phase title:

`Phase 21 - Playable Career Loop MVP`

Suggested initial goals:

- create a new career save from a world seed;
- choose or confirm the selected club;
- inspect squad, formation fit, condition, and current budget from the career save;
- advance to the next fixture or next week deterministically;
- preserve generated world, condition, transfers, and selected setup across save/load;
- keep UI out of scope unless explicitly planned.
