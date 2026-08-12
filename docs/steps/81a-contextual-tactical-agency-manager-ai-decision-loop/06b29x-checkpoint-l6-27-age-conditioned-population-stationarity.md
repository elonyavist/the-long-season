# Step 06B29X — Checkpoint L6.27 Age-Conditioned Population Stationarity

## Status

Planned and active. Cached observation only; no gameplay correction.

## User-Facing Reason

L6.26 proves that too few career-generated players reach the quality rung, but
does not say whether their stored ceiling is already too low or whether enough
ceiling exists and development fails to realize it. This checkpoint compares
players at the same football age before choosing the owner.

## Frozen Population

- exact read-only L6.20 current-product cache;
- seven worlds, ten seasons, three competitions and ten roles;
- reference population: season-one `opening_senior` players aged `23..27`;
- replacement population: season-ten career-generated players aged `23..27`,
  generated no later than season six;
- comparison is within the player's observed competition and canonical role;
- goals, assists, opportunities, leader membership and origin-specific lineup
  decisions are not read.

The age window is frozen before output because it includes established and peak
career players while excluding teenage projection and veteran decline. Season
one and season ten are both closing snapshots from the same canonical observer.

## Frozen Reader

For each world, competition and role with at least three reference players,
derive the reference current-ability median. Every replacement player in that
cell enters exactly one state:

1. `stationary_ready`: current ability reaches the reference median;
2. `development_realization_gap`: stored ceiling reaches the reference median
   but current ability does not;
3. `ceiling_supply_gap`: stored ceiling is below the reference median;
4. `reference_not_observed`: the cell has fewer than three reference players.

Stored ceiling is the canonical `currentAbility + potentialRoom`; no public
rating, inferred growth curve or output-conditioned threshold is introduced.
Report counts by competition, role and world, plus reference/replacement p50
and p90 current ability for presentation.

## Frozen Decision

- any duplicate player-cell, unknown origin, invalid ability, fewer than seven
  worlds, fewer than 21 competition observations, or count mismatch is
  `STOP / RETHINK`;
- more than `10%` `reference_not_observed` replacement players is
  `STOP / RETHINK`: the comparator is too sparse;
- among classified non-ready players, an owner requires at least `0.50`
  aggregate share and the same owner in at least `5/7` worlds;
- majority `ceiling_supply_gap` -> `OWNER_IDENTIFIED: ceiling_supply`;
- majority `development_realization_gap` ->
  `OWNER_IDENTIFIED: development_realization`;
- no majority -> `MIXED`; no non-ready population -> `NOT_REPRODUCED`.

The `0.50` majority and `5/7` coherence are existing Phase 81A attribution
rules. The three-reference floor prevents a single incumbent from becoming a
role policy. No target is fitted to this checkpoint's output.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No engine, content, domain, persistence, web, HTML, coefficient, save change or
new report entrypoint.

## Required Checks

Focused tests, typecheck, two byte-identical cache-only report builds with
exactly seven workers, `git diff --check`, graphify update and `pnpm check`
alone.
