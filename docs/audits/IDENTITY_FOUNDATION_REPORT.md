# Identity Foundation Report

Date: 2026-06-21

## Summary

Phase 19 replaces technical placeholder player display names with deterministic fictional identities.

The current fake league now generates:

- stable `player:` IDs for engine, market, career, and persistence references;
- generated first and last names for player-facing output;
- primary nationality;
- optional second nationality;
- birth country;
- name-culture key.

The supported nationality set was expanded after the initial Phase 19 pass to include Colombia, Mexico, Ivory Coast, Wales, Scotland, Russia, South Korea, Albania, Turkey, and the already-present Serbia/USA coverage. The stable USA key remains `american` for compatibility with existing generated content.

Names are generated content, not localization labels. Labels around those names, including nationality and name-culture display values, are localized through the i18n catalog.

## What Changed

- `domain` now has a reusable `PersonIdentity` contract for football people.
- `content` owns fictional name-culture pools.
- `content` owns deterministic nationality distribution profiles.
- Fake player generation now writes generated first/last names instead of `PlayerXX NoYY`.
- CLI season, fixture, market, and career output now show generated names.
- `simulate-season --identity-review` can inspect one generated squad's identity metadata.

## Nationality Distribution

Nationality is selected deterministically from seed, league nation, club category, club reputation, and player key.

The intended shape is:

- third division: mostly domestic players, with a small foreign minority;
- second division: still domestic-heavy, but more mixed;
- first division: more international;
- strong first-division clubs: can become majority international.

The demo third-division sample for `demo-001` and `PRO01` should remain mostly domestic, but exact foreign nationalities can change when the nationality catalog expands.

After the expanded-nationality rework, the model can generate:

- Colombia and Mexico through the Latin American name-culture path;
- Ivory Coast through the West African path;
- Wales and Scotland through the English-language name-culture path;
- Russia through the Central/Eastern European path;
- South Korea through a Korean name-culture path;
- Albania and Serbia through the Balkan path;
- Turkey through a Turkish name-culture path.

After the expansion, the observed `demo-001` / `PRO01` sample is:

- Italian: 19
- Croatian: 1
- Serbian: 1
- Welsh: 1

This matches the current design: lower leagues are mostly domestic, not fully domestic.

## Staff Readiness

`PersonIdentity` is suitable for future staff, scouts, presidents, agents/procuratori, and AI managers as shared identity metadata.

Future staff phases must keep these concepts separate from identity:

- staff role;
- rating;
- specialization;
- assignment;
- wages/contracts;
- persona/tendencies;
- gameplay effects.

This prevents the identity model from becoming a staff gameplay model too early.

## Known Limitation

The first content pools are intentionally small. They are enough to remove placeholder names, but they can produce repeated full names inside one squad.

Observed example in the current `PRO01` identity review: some Italian full names repeat. This is not a blocker for the foundation, but before a richer playable career loop the project should either expand name pools or add deterministic per-club duplicate avoidance.

## Manual Commands

Review generated season output:

```sh
pnpm cli simulate-season --seed=demo-001
```

Review one fixture:

```sh
pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006
```

Review identities directly:

```sh
pnpm cli simulate-season --seed=demo-001 --identity-review
pnpm cli simulate-season --seed=demo-001 --identity-review --lang=it
```

Refresh and inspect a career save:

```sh
pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent
pnpm cli career --save=career-demo --inspect
```

Check balance did not regress:

```sh
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

## Recommendation

Phase 19 can be considered complete as an identity foundation.

Before the first playable career loop, review whether the repeated-name limitation should be handled immediately. If the next phase is intended to be user-facing career-loop work, a small cleanup step for larger pools or duplicate avoidance is recommended first.
