# Step 16K - Checkpoint L6.42 Current-16 Lifecycle Owner

## Status

**Done - `STOP_INSTRUMENT` on 2026-08-15.** Observation only; no gameplay value
changed. The strict terminal-reachability rule correctly blocked the verdict.

## User-Facing Question

Step 16J proved that changing aging alone can simultaneously preserve more
opening elites and destroy generated elites. This checkpoint follows the same
real players through the current L6.40 product and identifies the first stage
where First-Division replacement fails.

It must answer two separate questions:

1. Why do opening senior players still occupy `91` current-16 places in season
   ten?
2. Why do career-generated players occupy only `15`?

No new coefficient, AI preference, age malus or candidate policy is allowed.

## Frozen Population

- read only the completed
  `phase81a-stationary-age-succession-l6-40-7x10` cache;
- exact L6.40 seed prefix, seven worlds, ten seasons and seven-worker metadata;
- First Division is resolved from each player's entry club at generation,
  using the canonical opening club-to-competition map;
- generated cohort: `annual_academy_intake` and `annual_senior_intake` players
  generated in seasons `1..6` for a First-Division club;
- opening cohort: opening First-Division seniors, without selecting players by
  later output;
- names are presentation only; player, club, competition, origin and season are
  the join keys.

Missing entry-club ownership, duplicate player-season rows, unknown origins or
an unreconciled club-to-competition join are structural failures.

## Test A - Generated Current-16 Funnel

Every generated player enters exactly one terminal stage, in this order:

1. `no_senior_observation`: no canonical senior player-season fact exists;
2. `observed_ceiling_below_16`: the maximum observed
   `currentAbility + potentialRoom` never reaches `16`;
3. `development_realization`: an observed ceiling reaches `16`, but current
   ability never does;
4. `active_retention`: current ability reaches `16`, but the player has no
   season-ten active row;
5. `first_division_retention`: the player is active in season ten outside the
   First Division;
6. `quality_retention`: the player remains in the First Division but has fallen
   below current `16`;
7. `active_first_division_current16`: successful replacement stock.

The report also counts which successful current-16 players occupy a canonical
season-ten scorer or creator top ten. Leadership is conditional output after
stock success; it is never allowed to redefine an earlier lifecycle stage.

The limiting owner is the largest failure stage only when it owns `>= 0.50` of
all failed players and is the largest stage in `>= 5/7` worlds. Otherwise the
funnel is `MIXED`. The existing Phase 81A majority and world-coherence rules are
reused; no threshold comes from this output.

## Test B - Opening Elite Retention

Opening seniors are split by their true opening current ability. For the
opening-current-16 cohort, record exactly one season-ten state:

- no longer active;
- active outside the First Division;
- active in the First Division below current `16`;
- active in the First Division at current `16+`.

Also count season-ten First-Division current-16 opening seniors who began below
`16`. This prevents the report from calling all `91` players survivors when
some may have reached the rung later.

`OPENING_ELITE_RETENTION` is identified only when at least half of the opening
current-16 cohort remains First-Division current-16 in `>=5/7` worlds.

## Test C - Like-Aged Stationarity Replay

Run the already frozen, outcome-independent L6.27 reader on the L6.40 current
product:

- season-one opening seniors aged `23..27` are the reference;
- season-ten generated players aged `23..27` are replacements;
- within exact competition and role, classify `stationary_ready`,
  `development_realization_gap` or `ceiling_supply_gap`;
- no goals, assists, minutes or leader membership enters the comparator.

This test tells whether L6.31 actually closed the former ceiling-supply owner
on the later current product. The old L6.27 result is historical and cannot be
silently reused.

## Decision

- `OWNER_IDENTIFIED`: Test A has a majority/coherent owner, Test B reports its
  independent retention result, Test C reconciles, and every declared terminal
  stage is reached on the real cached population;
- `MIXED`: all joins and stages are valid but Test A has no majority owner;
- `STOP_INSTRUMENT`: missing worlds, joins, categories or reconciliation make
  the diagnosis unreadable.

The checkpoint names evidence. It does not authorize a gameplay correction;
the next step can open only the owner actually identified here.

## Expected Files

- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test. Own the two new mutually exclusive lifecycle tests beside L6.40's
  existing player-level joins.
- `apps/cli/src/commands/simulation-report/career-sections.ts`. Invoke the
  evaluator against the canonical cached world facts; no new simulator.
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`. Add one read-only profile pointing at the completed
  L6.40 cache.
- `packages/i18n/src/labels.ts`. Localize the profile name and description in
  all five supported languages.
- `docs/audits/PHASE_81A_CHECKPOINT_L6_42_CURRENT16_LIFECYCLE.md` **(new)**,
  audit index, this step, phase README and `docs/PROJECT_STATUS.md`.

No engine, content, domain, storage, web, HTML, save, beta version or gameplay
file is in scope.

## Required Checks

1. Focused tests prove mutual exclusion, count reconciliation, every decision
   branch and the distinction between current-16 stock and leadership.
2. The cache-only profile runs through `pnpm cli simulation-report` with exactly
   seven workers and writes two byte-identical JSON reports.
3. Every terminal stage must be reached on the real cached population; a
   fixture is insufficient reachability evidence.
4. `git diff --check`, Graphify update and `pnpm check` run alone.

## Outcome

The cache-only report reconciled with zero join failures, but returned
`STOP_INSTRUMENT`: `active_retention`, `first_division_retention` and
`quality_retention` were not reached. Raw diagnostic counts are retained but
are not promoted to the checkpoint verdict:

- generated First-Division cohort: `1,885`;
- no senior observation: `844`;
- maximum observed ceiling below current `16`: `1,019`;
- ceiling `16` observed but never realised: `9`;
- season-ten First-Division current `16`: `13`, of whom `4` are leaders;
- the three post-current-16 loss stages: all `0`;
- opening-current-16 cohort retained as First-Division current `16`: `71/447`;
- season-ten opening current-16 stock: `91`, including `20` who began below
  `16`;
- the independent like-aged replay still identifies `ceiling_supply`:
  `780/928` non-ready replacements (`0.8405`), coherent in `7/7` worlds.

The failed reachability premise was topological: a progressive funnel must not
require positive losses after a stage reached by only thirteen players. Step
16K1 replaces the mutually exclusive terminal gate with conditional stage
denominators; it does not change the majority threshold or reinterpret this
run as a pass.
