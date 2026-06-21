# World Calendar V1 Review

Date: 2026-06-21
Phase: `29-club-identity-and-world-calendar-v1`
Step: `04-world-calendar-v1-review.md`

## Goal

Decide whether the current calendar model is sufficient for the first ten-season engine report, without implementing new calendar code in this review step.

## Current Calendar Model

The current engine has a deterministic single-competition calendar:

- `generateRoundRobinCalendar` creates an even-club double round-robin schedule.
- Fixture order is deterministic from `seed`, `seasonId`, `competitionId`, and ordered club IDs.
- The algorithm uses a seeded Fisher-Yates shuffle plus Berger-style circle pairings.
- The second half mirrors the first half by swapping home and away sides.
- Every round is scheduled seven days after the previous round.
- For the current 18-club demo third division, this produces 34 rounds and 306 fixtures.
- Domain `Fixture` stores `competitionId`, `seasonId`, `roundNumber`, `date`, `homeClubId`, `awayClubId`, and optional result.
- `generateNextSeasonCalendar` can create the next season only after current-season completion, keeping the same clubs and competition for the MVP.
- Next-season fixture IDs are remapped to avoid overwriting existing fixture IDs.

## Sufficient For Phase 30

The current model is sufficient for the first ten-season report because Phase 30 is meant to test engine credibility, not complete real-world competition rules.

It supports:

- deterministic season replay;
- multi-season fixture progression;
- stable standings and result aggregation;
- selected-club fixture advancement;
- player development and aging over several seasons;
- readable club names after Phase 29;
- repeatable reports across seeds;
- basic home/away balance from mirrored fixtures.

For Phase 30, the report can inspect:

- champion points across seasons;
- selected-club points and finishing positions;
- goals per season;
- table spread;
- player growth/decline;
- roster continuity;
- anomalies caused by the current simplified world model.

## Known Limitations

These limitations are real but should not block Phase 30:

- no promotions or relegations;
- no playoffs;
- no playouts;
- no cups;
- no split groups;
- no transfer windows tied to dates;
- no fixture congestion;
- no midweek rounds;
- no international breaks;
- no weather or venue scheduling;
- no country-specific competition rule config;
- no multiple simultaneous competitions in one career season;
- no dynamic club list changes between seasons.

## Phase 30 Constraint

Phase 30 reports must explicitly state that long-run results are measured inside a closed single-division league. The report must not describe the output as a complete career pyramid simulation.

## Decision

No calendar code change is required before Phase 30.

The next phase can proceed with the current calendar if its ten-season report clearly labels the model as:

- closed-league;
- single competition;
- double round-robin;
- same clubs every season;
- no promotion/relegation yet.

## Recommended Future Phase

After Phase 30 identifies long-run behavior, a later phase should introduce the next calendar layer only if the report proves it is needed. The likely next calendar evolution is:

1. promotion/relegation contracts;
2. multi-division competition state;
3. transfer-window dates;
4. cup/calendar congestion.

