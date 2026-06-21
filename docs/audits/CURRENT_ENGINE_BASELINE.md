# Current Engine Baseline

Date: 2026-06-21
Phase: `26-project-cleanup-and-long-run-readiness`
Step: `04-current-engine-baseline`
Status: Complete

## Purpose

This report is the short current-state baseline before long-run work starts. It replaces reading many old audit reports when deciding what must exist before a credible 5-10 season simulation.

## Current Match Engine

- The match engine is deterministic from explicit seeds and stable IDs.
- Matches are simulated minute by minute through structured chance, shot, goal, save, miss, and block events.
- Player attribution is causal enough for the current layer: scorer, shooter, creator/assist, blocker, and goalkeeper are selected from the same chance context.
- Tactics, selected lineups, manual tactic switches, player condition, and lineup rotations can affect match context.
- Durable match reports use schema version `7` and contain structured, language-agnostic data for CLI/UI rendering.

Current limitations:

- There are no substitutions, injuries, cards, morale swings, weather, or richer set-piece phases yet.
- Manual match-day interaction exists as deterministic inspection/preparation, not as a full interactive match session.
- Player match ratings and staff/coach feedback are not implemented.

## Current Season Simulation

- The engine can generate and simulate one deterministic 18-club double round-robin season.
- Fixture results, league table, top scorer, top assist, goalkeeper saves, fixture detail, and balance reports are available.
- The current `calibration-v1` balance sample passes strict mode:
  - goals per match: `2.859`
  - home win rate: `0.413`
  - draw rate: `0.238`
  - away win rate: `0.349`
  - first-place points: `70.500`
  - last-place points: `25.500`
  - table points spread: `45.000`
  - upset proxy rate: `0.350`

Current limitations:

- A career does not yet complete a season and roll into the next one.
- There is no promotion/relegation, cup calendar, multi-division calendar, or historical season archive yet.
- The calendar is enough for one league season, but not yet enough to judge a long-running world.

## Current Career Persistence

- `CareerState` can be created, saved, loaded, inspected, summarized, and advanced by selected-club fixture.
- Accepted permanent transfers can be persisted into the career save.
- Match preparation can be saved: selected lineup and tactic are durable and required before selected-club advancement.
- Career advancement uses saved preparation for the selected club and deterministic defaults for non-user clubs.

Current limitations:

- Career advancement is fixture-by-fixture and does not yet detect season completion.
- There is no season archive, next-season generation, player aging rollover, or completed-season history.
- There is no long-run world loop that repeatedly advances seasons.

## Current Player Generation

- New career worlds generate deterministic fictional players from the world seed.
- Generated players include identities, expanded nationalities, role templates, division/tier ability bands, potential classes, prospect archetypes, and lower-division rarity budgets.
- The generator now protects role coherence better than the earlier fake-content model: off-role attributes are capped by role templates.
- Lower divisions can contain prospects and rare white-fly players, but high-current and high-potential exceptions are budgeted.

Current limitations:

- Player growth, decline, and potential realization across seasons are not implemented.
- Young prospects do not yet prove whether they can become second-division starters, first-division reserves, or rare top players over time.
- Youth intake, scouting fog, staff evaluation, and player personality are not implemented.

## Current Market MVP

- Permanent transfer inspection and persistence exist.
- The market layer can evaluate valuation, buying budget, player willingness, reputation/division mismatch, transfer feasibility, and roster preview/application.
- A strong player can reject a downward move; an affordable accepted transfer can be written to the career save.

Current limitations:

- There is no AI market behavior, transfer window flow, salary/contract negotiation, loans, free agents, or multi-season squad churn.
- Market effects are not yet simulated at world scale across 5-10 seasons.
- Squad-needs hints were intentionally removed from user-facing output because the manager should infer needs from formation/role fit.

## What Blocks A Credible 5-10 Season Simulation

The project is not ready for a meaningful ten-season report until these systems exist:

1. Season completion detection.
2. Next-season calendar generation.
3. Career season archive/history.
4. Player age and state rollover.
5. Player growth, potential realization, and decline.
6. City/club identity generation good enough to read multi-season reports without placeholder club codes.
7. A deterministic multi-season runner with explicit anomaly reporting.

## Phase 27-30 Minimum Path

- Phase 27 must make a career save finish a season, archive it, create the next calendar, and roll player age/state.
- Phase 28 must make players grow, decline, and realize potential with deterministic variance.
- Phase 29 must improve club identity and review calendar readability for long-run reports.
- Phase 30 must simulate roughly ten seasons and report whether the engine is credible enough before UI exploration.

## Conclusion

The one-season football engine is usable as a deterministic lab. The career loop is not yet a long-run career game. The correct next move is Season Rollover Foundation, not more isolated CLI inspection features.
