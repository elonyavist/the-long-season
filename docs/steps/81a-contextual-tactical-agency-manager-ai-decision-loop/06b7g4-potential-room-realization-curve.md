# Step 06B7G4 - Potential-Room Realization Curve

## Status

Done. The first square-root retry remained `REFINE`; removing the duplicate room
rate charge and raising the reachable monthly ceiling produced development
parity in `7/7` worlds without exceeding true potential.

## Goal

Let high-potential players close the last credible part of their development
gap before age feasibility compresses it, without changing their generated
ceiling or awarding growth without participation.

## Evidence And Owner

L4.6 observed strong opportunity and adequate accepted potential, but mature
P90 remained below the opening-senior median in `0/7` worlds. Pooled first-
division values were `15.13` accepted potential, `13.14` opening median and
`11.01` mature current. The linear `room / 5` multiplier made the final part
of every gap approach zero faster than the dated opportunity could realize it.
Replacing it with a square root improved ten-season opening-senior survival
from `0.6389` to `0.6159`, but left mature first-division current P90 at `11.02`
and development parity at `0/7`.

The retry exposed the narrower defect: remaining room was both a rate
multiplier and the ceiling in `Math.min(room, delta)`. Those are two charges for
one fact. The ceiling is sufficient to prevent overshoot; age, opportunity,
role relevance and deterministic variance already own the rate.

## What To Implement

- advance `MAX_SINGLE_MONTH_GROWTH` from `0.18` to `0.27`: at the canonical
  `270` academy minutes, the `0.75` opportunity and `0.85` core-youth age
  multipliers bound a fully relevant high-room attribute at `0.172` before
  environment and deterministic variance;
- remove remaining room from the rate calculation and retain it once as the
  exact `Math.min(room, delta)` ceiling;
- retain age, minutes, performance, environment, variance, role relevance,
  hard caps and true potential unchanged;
- prove zero room remains zero, ordinary room stops at its true potential and
  high-room growth remains bounded by the monthly rate;
- repeat L4.6 on a fresh cache.

## Expected Files

- `packages/engine/src/career/player-development.ts` and test;
- the linked beta content bundle (`player-rating-scale.json`,
  `valuation-curves.json`, `asking-price-curves.json`,
  `market-behavior-calibration.json`) and its schema/content tests. The move to
  `0.27` changes the complete potential-outcome matrix, so the v8 projection
  measured for `0.18` cannot remain stamped current;
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`, the
  matrix equality owner and academy-participation rollover assertion;
- `apps/cli/src/commands/career.test.ts`, `simulate-season.test.ts`, and
  `apps/web/src/runtime/web-career-runtime.test.ts`: CLI condition assertions
  consume the dated policy and CLI/web identity stamps move together;
- `apps/cli/src/commands/simulation-report/report-registry.ts`, fresh cache;
- this document, L4.6, phase README and `docs/PROJECT_STATUS.md`.

## Definition Of Done

The changed rate and ceiling contract are reachable in production development,
cannot exceed true potential, and the unchanged ten-season renewal targets are
remeasured.

## Recorded Result

- `MAX_SINGLE_MONTH_GROWTH = 0.27`; zero-room, exact-ceiling and bounded
  high-room tests pass;
- the independently derived `24`-cell potential-outcome matrix matches the
  shipped content exactly with unchanged structural denominators;
- one current beta chain replaces v8: rating scale `v9`, projection `v6`,
  valuation `v7`, asking price `v6`, market behaviour `v7`; no legacy reader,
  migration or fallback remains;
- CLI and web generate the same canonical world identity `958f692d`;
- fresh v9 L4.3 moves the owner downstream in `5/7` worlds. Integrated L5
  retains development parity at its `5/7` floor and keeps leaderboard renewal
  red, so no further growth increase is authorized.
