# Season Rollover Foundation Report

Date: 2026-06-21
Phase: `27-season-rollover-foundation`
Status: Complete

## Summary

Phase 27 makes a persisted career save capable of crossing a season boundary.

The implementation is intentionally narrow: it does not develop players, move clubs between divisions, generate market AI, or simulate many seasons. It establishes the durable season boundary needed before those systems can be credible.

## Implemented Model

### Completion

`assessCareerSeasonCompletion` inspects only the current season.

It reads fixture IDs in deterministic save order, ignores fixtures from other seasons, and returns:

- `complete` when every current-season fixture has a played result;
- `incomplete` with the first unplayed fixture;
- `invalid` when fixture or club references are broken.

This keeps completion detection independent from CLI, storage, and future report tooling.

### Next Calendar

`generateNextSeasonCalendar` creates the next season calendar only after completion succeeds.

Current behavior:

- same competition;
- same club list;
- deterministic next season ID;
- next season starts 70 days after the latest current-season fixture;
- fixture IDs continue after the current maximum numeric fixture ID;
- no promotion or relegation yet.

### Season Archive

`CareerState.seasonHistory` now stores completed season summaries.

Each archive entry records:

- sequence number;
- season ID;
- competition ID;
- final table;
- champion club;
- selected-club finish;
- aggregate goals.

The archive is compact on purpose. It preserves long-run history without storing duplicate match reports or report prose.

### Player State Rollover

`rolloverPlayersForNextSeason` advances calendar season/date and resets short-term state:

- fitness -> `100`;
- form -> `50`;
- morale moves toward `50` by 10 points;
- abilities are unchanged;
- potential is unchanged;
- birth dates are unchanged;
- age remains derived from `GameDate`.

Player development and decline are deliberately left to Phase 28.

### Career CLI Smoke

The lab command is:

```sh
pnpm cli career --save=<saveId> --rollover-season
```

On success it:

- validates current-season completion;
- archives the completed season;
- appends the next season calendar;
- rolls player state forward;
- clears stale match preparation;
- writes the save.

On invalid or incomplete state it prints the reason and writes no save.

The deterministic completed-save smoke is covered by:

```sh
pnpm exec vitest run apps/cli/src/commands/career.test.ts -t "career command rolls a completed season into the next persisted season"
```

That test creates a career save, completes all fixtures deterministically inside isolated test storage, runs `--rollover-season`, reloads the save, and verifies next-season persistence.

Manual incomplete-state smoke:

```sh
pnpm cli career --save=phase27-manual --seed=world-a --new-world-preview
pnpm cli career --save=phase27-manual --rollover-season
```

Expected result: invalid rollover, reason `current season is not complete`, and no save mutation.

## Remaining Limitations

- There is no manual CLI command that completes an entire season in a career save.
- There is no multi-season runner yet.
- Promotion and relegation are not implemented.
- Player growth and aging decline are not implemented.
- Contracts, retirements, staff, youth intake, and market windows are not implemented.
- The next season reuses the same clubs and same competition.

These are acceptable for Phase 27 because the goal was the durable season boundary, not a full career simulation.

## Phase 28 Readiness

Phase 28 can start.

The next phase should implement deterministic player development and aging effects on top of the Phase 27 boundary:

- read current player age from `GameDate`;
- apply bounded growth toward potential;
- apply veteran decline;
- keep potential realization probabilistic and deterministic by seed;
- produce a development report without exposing hidden potential as exact UI knowledge.

Recommended active next step:

`docs/steps/28-player-development-and-aging-v1/01-development-model-spec.md`

## Verification

Required checks passed:

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused Phase 27 tests for domain, engine, storage, CLI, and i18n
- `pnpm check`

