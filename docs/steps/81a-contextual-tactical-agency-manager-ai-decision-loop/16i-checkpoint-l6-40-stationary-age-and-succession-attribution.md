# Step 16I - Checkpoint L6.40 Stationary Age And Succession Attribution

## Status

**Done - `OWNERS_IDENTIFIED` on 2026-08-14.** Amendment A13 was accepted and
this observation-first checkpoint changed no gameplay.

## User-Facing Reason

The current ten-season story has too many opening-generation veterans at the
top and too few later players replacing them. Before changing generation,
aging or transfer decisions again, this checkpoint must show how a club reaches
that state: who it began with, who declined or survived, which successors
existed, when the AI reacted and where a real acquisition/development story
ended.

Without that chain, another coefficient could improve an average while making
the club story less believable.

## Entry Gate

- code state begins from commit `74465fd`, where L6.39 is closed, every
  candidate is removed and `pnpm check` is green;
- Amendment A13 is accepted without changing the Big Five targets;
- the shipped L6.31 product is the only gameplay arm;
- no age-composition, aging, retirement, succession or target-scoring change
  may land in this step.

## Questions This Checkpoint Must Answer

1. How different are clubs at opening when every club samples the same age-
   archetype weights?
2. At seasons 1, 4, 7 and 10, how much high-quality stock comes from opening
   seniors, opening academy players and later career generation?
3. By role, when does current quality actually decline and how long do opening
   elites survive, move or retire?
4. Does the existing exact-role succession rule react early enough to an
   incumbent transition?
5. When a successor exists, is the remaining obstruction internal readiness,
   market availability, seller/willingness/finance, acquisition, retention,
   development or senior opportunity?
6. Does the exceptional-stock allocation loop suppress annual successors, or
   merely record the same scarcity produced elsewhere?

## Frozen Population

- one fresh current-product profile:
  `phase81a-stationary-age-succession-l6-40-7x10`;
- one untouched prefix:
  `phase81a-stationary-age-succession-l6-40-oos-v1`;
- seven worlds, ten complete seasons and exactly seven workers;
- one independent resumable shard per world;
- primary decision population: First Division at opening and after seasons
  `1`, `4`, `7` and `10`;
- Second and Third Division are recorded as structural/reconciliation
  guardrails, never judged against Big Five numeric bands;
- every active senior player at a snapshot is counted once under his current
  club; season participation remains attributed to the clubs in canonical
  fixture facts, so a transfer may legitimately appear for two clubs that
  season;
- player ID, club ID, competition ID, role and season are stable join keys;
  names are presentation only.

This population sees one fictional country and seven world seeds. It can
attribute the current generator and career pipeline; it cannot calibrate every
future country or prove a real lower-league age distribution.

## Frozen Observations

### A. Opening club-age structure

For every club, record and reconcile:

- active senior count, mean and median age;
- counts and shares in `<=21`, `22..24`, `25..29`, `30..32`, `33+`;
- the same bands by primary role and starter/reserve generation slot;
- current-quality mean plus counts at `>=15` and `>=16`;
- competition-wide totals and cross-club p10, median, p90 and range.

Also record the structural source: every club used the same archetype weight
table. Seeded sampling differences are reported as observed variance, never
renamed a club philosophy.

No opening-diversity number is a pass/fail gate in L6.40. A future content step
must freeze that gate against external club-level evidence before writing its
age-composition table.

### B. Stationary stock and annual successor flow

At each declared snapshot, split active players by:

- `opening_senior`, `opening_academy`, `annual_academy_intake` and
  `annual_senior_intake`; `unknown` is a reconciliation failure;
- age band, exact primary role and current-quality `>=15` / `>=16`;
- roster ownership, starts and minutes;
- opening-player survival, retirement, release, step-down and inter-club move;
- annual accepted intake, current/P50/upper public assessment and first senior
  season.

The national exceptional-stock ledger reports vacancies, allocations, missed
replacement, category placement and whether the allocated player later reaches
the quality and leadership rungs. Production inspection found no annual
"reconstructed candidate" branch: the allocator selects exceptional IDs before
generation and unselected slots follow ordinary generation. A pre/post ceiling
would therefore require a second hypothetical generator, forbidden by the
single-producer rule. L6.40 records the real stock/vacancy path and returns the
ceiling hypothesis as `not_evaluated`; it does not manufacture causality.

### C. Real role/age quality paths

For players observed in consecutive seasons, report per exact role and origin:

- age and role-current ability at both observations;
- current-15/current-16 entry and exit;
- starts, minutes, availability and exit reason;
- one- and two-season change distributions for ages `25..29`, `30..32`, `33+`.

The reader measures shipped role-current player facts. Production inspection
before implementation found that `summarizePlayerDevelopmentAbilities(...)`
does not expose canonical physical/technical/mental family summaries. L6.40
therefore does not invent those summaries in the CLI, copy
`agingMultiplier(...)` or simulate a hypothetical decline. A later role-aware
aging owner must introduce one typed canonical mapping if this checkpoint
authorizes it.

### D. Exact-role succession history

The existing AI lifecycle must expose enough structured, observation-only
facts to identify one unique `(world, season, club, role)` need episode:

- first evaluation date and first `role_succession` date;
- incumbent player, dated age and public current assessment;
- counts of current same-role internal alternatives plus the deterministic best
  ready and best development candidates with their public current/P50/upper
  assessments; complete candidate arrays are not copied into the fact;
- terminal target-pool stage already owned by
  `AI_SUCCESSION_TARGET_POOL_STAGES`;
- selected target, acquisition result and later retention;
- one- and two-season current-quality, minutes and club outcome for the acquired
  player;
- whether a sale, release, retirement or failed development path causes the
  role need to appear again.

Need-time values are carried from the canonical engine decision. The CLI may
not rebuild the old squad from an end-of-season roster. These extra facts are
diagnostic only: a paired one-world replay must prove unchanged RNG, matches,
transfers, contracts, squads and career hash before the profile opens.

### E. Transition timing

For every incumbent who subsequently exits, changes club or falls at least
`0.50` role-current quality from his first age-30-plus observation, record:

- seasons between first succession need and transition;
- whether an internal candidate already met the current public planning floor
  at least one season earlier;
- whether a market candidate met the floor on an earlier canonical search.
  When no search occurred, earlier market availability is `not_observed`, never
  reconstructed from a later catalog;
- whether a completed acquisition preceded the transition;
- the eventual successor, if any, without requiring him to be the first target.

`0.50` is the existing material role-quality floor used by L6.32 and the market
pipeline. It is not a new tuning number.

## Reconciliation And Reachability

The checkpoint stops before interpretation unless all hold:

- seven unique world shards, ten seasons and declared snapshots present;
- opening and every snapshot roster reconcile to canonical ownership;
- origin counts sum to the snapshot population with zero `unknown`;
- stock/flow and quality-threshold subtotals reconcile both directions;
- every market diagnostic count reconciles with the existing lifecycle facts;
- every successor acquisition links to one canonical transfer completion;
- observation-only replay is byte-identical outside the added report facts;
- real generated data reaches at least one transition with a prior need, one
  transition without a prior need, one qualified-candidate market obstruction,
  one completed successor acquisition and one reopened need. A missing branch
  is `not_evaluated`, never a pass and never filled with a synthetic fixture.

## Frozen Attribution Decision

This step changes no gameplay. It may return multiple demonstrated owners.

- `STOP_INSTRUMENT`: any purity, ownership, origin, stock, market or replay
  reconciliation fails.
- `OPENING_STOCK_RETENTION`: opening seniors are at least half of season-ten
  current-16 stock and this direction holds in at least `5/7` worlds.
- `SUCCESSOR_FLOW`: generated players are fewer than opening seniors at the
  current-16 rung in at least `5/7` worlds and the frozen generated-leader gate
  remains below `0.50`.
- `SUCCESSION_TIMING`: among reachable incumbent transitions with a viable
  internal candidate or an earlier canonical search that found a viable market
  candidate, fewer than half receive a need at least one complete season before
  the transition, coherently in at least `5/7` worlds.
- `MARKET_OR_DEVELOPMENT_FUNNEL`: succession timing is adequate, but at least
  half of those need episodes stop at one common canonical stage or fail after
  acquisition. The exact stage, not this umbrella label, owns the next step.
- `EXCEPTIONAL_STOCK_CEILING`: `not_evaluated` in this observation-only
  checkpoint. The shipped annual allocator owns no pre-allocation player
  ceiling to compare with the generated result. This owner may be reopened only
  by a separately preregistered paired generation experiment, never inferred
  from vacancy and outcome correlation.
- `SHARED`: more than one condition above holds without one downstream fact
  containing the whole support of the others.

The majority floors partition support; they are not new product targets. Each
branch must have a focused reachability test over real generated input before
the step can close.

Opening age variety is an already accepted product requirement from Amendment
A13, but L6.40 only records its current before-state. It is not mixed into the
late-career causal verdict.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test. Carry the
  non-derivable need-time incumbent/internal-candidate facts through the
  existing diagnostic row; no new decision reader, RNG call or market path.
- `packages/engine/src/index.ts`. Export the new structured diagnostic types
  through the existing engine boundary consumed by the CLI; no deep import.
- `packages/engine/src/career/advance-career-month.ts`,
  `advance-career-season.ts` and focused tests. Thread an observation-only
  succession-snapshot switch from the L6.40 profile to the market owner. The
  first full gate proved that building those snapshots for every ordinary
  career path more than doubled suite time; default paths must do no work.
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test.
  Capture opening and declared snapshot age/quality populations while canonical
  ownership is present.
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test. Extend the existing age/successor owner with stationary stock,
  linked quality paths and the total L6.40 decision; do not create a parallel
  age-statistics module.
- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test **(new)**. Own only L6.40's joins and aggregation. The existing
  succession module is already a 2,800-line family of adopted checkpoint
  readers; adding another unrelated block there would deepen that smell.
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  and test. Extend the existing market lifecycle/funnel join with unique need
  episodes and post-acquisition outcomes.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`,
  `career-sections.ts` and focused tests. Carry the new canonical observations
  through one current-product producer and one report section.
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`. Add one locked profile to the sole report
  entrypoint.
- `packages/i18n/src/labels.ts`. Profile name and description for all five
  languages.
- `docs/audits/PHASE_81A_CHECKPOINT_L6_40_STATIONARY_AGE_AND_SUCCESSION.md`
  **(new generated outcome)**, audit index, this step, phase README and status.

Before editing an additional file, add it here with its ownership reason.

## Explicitly Not Implemented

- opening age-composition deck;
- role-aware aging changes;
- retirement changes;
- prospective succession decisions or target preference;
- formation, lineup, goal or assist changes;
- new potential, resilience or club-philosophy state;
- HTML or a second report command.

## Required Checks

1. Graphify `explain`/`affected` for every shared owner before editing.
2. Focused real-data reachability, purity, join, reconciliation and decision
   tests.
3. One paired one-world observer-off/observer-on replay with identical gameplay
   facts and hashes.
4. Then, alone:

```sh
pnpm cli simulation-report \
  --profile=phase81a-stationary-age-succession-l6-40-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-stationary-age-succession-l6-40-7x10.json
```

The profile registry owns its versioned checkpoint directory. The single
report entrypoint intentionally rejects a caller-supplied `--checkpoint-dir`.

5. Rebuild from the completed cache to a second output path and require byte
   identity.
6. `git diff --check`, `graphify update .` and full `pnpm check` alone.

No HTML is generated: this is an attribution checkpoint, not an adopted game
candidate. The next implementation step is written only after its owner is
known and reviewed.

## Outcome

The fresh `7 x 10` completed with report `PASS`, zero reconciliation failures,
all five reachability lanes observed and an exact byte-identical cache rebuild.
The accepted artifact is
`simulation-out/phase81a-stationary-age-succession-l6-40-7x10.json`; the full
reading is in
`docs/audits/PHASE_81A_CHECKPOINT_L6_40_STATIONARY_AGE_AND_SUCCESSION.md`.

Two owners hold coherently in `7/7` worlds:

- `OPENING_STOCK_RETENTION`: season ten retains `91` opening current-16 seniors
  against `15` career-generated current-16 players. The one-year role-current
  median is exactly flat for every role at ages `30..32` and only about
  `0..-0.08` at `33+`.
- `SUCCESSOR_FLOW`: generated players occupy only `0.2071` of season-ten
  scorer/assist leader slots on average and remain below opening seniors at the
  current-16 rung in every world.

Succession timing is explicitly not an owner: `431/432` viable incumbent
transitions received at least one complete season of warning. `14,990` needs
produce `3,756` fulfilled acquisitions, while no terminal stage reaches the
`0.50` common-owner floor. Adding another AI anticipation rule is therefore
unauthorized.

The exceptional-stock counterfactual remains `not_evaluated`: production owns
no pre-allocation candidate ceiling, so the report refused to create a second
hypothetical generator. Step 16J opens only the demonstrated aging owner; the
successor-flow lane is remeasured after that independent correction.

The first complete verification attempt exposed a performance ownership bug:
the need-time snapshot was being derived on every ordinary career path even
though only L6.40 reads it. The facts are now opt-in from the locked profile,
attached only to `need_evaluated`, and all incumbent/alternative work sits
behind that switch. A normal call is tested to emit no snapshot and retains the
pre-step `Math.max(...)` gameplay path. Rebuilding L6.40 with the switch enabled
remains byte-identical (`REPORT_EXIT=0`, `CMP_EXIT=0`).

Final verification on the current tree: `pnpm check` exited `0`; `318` test
files and `2547` tests passed, `904` modules had zero dependency violations,
all four custom checks passed and typecheck passed. The suite took `2467.34s`.
That is recorded as current-suite timing, not attributed to this step: the
historical `772s` comparison covered only `286` files and `2192` tests, while
the ordinary Step 16I path is mechanically no-work and there is no paired
current-suite baseline.
