# Phase 81B - Season-Anchored Contracts, Free-Agent Economy And Background Fixtures

## Status

**Draft.** Originally numbered Phase 81A by the 2026-08-02 phase-order
decision, then renumbered Phase 81B on 2026-08-07 when contextual tactical
agency became the immediate successor to Phase 81. Do not start until the new
Phase 81A is Done.

Phase implementation also requires the blocking findings in
[`00-pre-implementation-analysis-prerequisite.md`](00-pre-implementation-analysis-prerequisite.md)
to be resolved in their owning step contracts. That document is the mandatory
analysis gate before Step 01; it is not an implementation step and may not be
treated as satisfied merely because the phase remains Draft.

This document is a draft, not an accepted contract. Its numeric decisions - the
`5-7%` free-agent peak, the `2%` trough, the three-year contract ladder, the
drain requirement - were made before anything was measured, and Phase 81 changes
how matches are scored, which moves squad value, turnover, and market pressure.
Expect to revise them against Phase 81's evidence rather than implementing them
as written. The reasoning behind each number is recorded so the revision is an
argument, not a restart; Step 01 freezes the final values after measuring.

## Goal

Make the world the manager already plays in feel alive, without adding a single
market feature: contracts that expire when real contracts expire, a free-agent
pool that drains, a league table that fills in around the user, and a
simulate-match command. Then measure market density and let that measurement,
not an assumption, authorize Phase 82A.

The analysis, the measured evidence, and the accepted work order are in
`docs/the-long-season-mondo-vivo.pdf`, sections 6.3 and 11.

## Entry Gate

- The Phase 81B pre-implementation analysis prerequisite is closed: every
  blocking finding is resolved in the owning step, intermediate checkpoint
  decisions are explicit, and all simulation checkpoints require exactly `7`
  actual workers.
- Phase 80 and Phase 80A are Done, the latter having transferred its
  `goals_per_match_avg` monitor to Phase 81.
- Phase 81 is Done. Its Step 15 report records the four seams this phase
  consumes: the named squad-depth accessor, the context constructor taking an
  explicit squad, the non-selected club as an ordinary caller, and the match RNG
  keyed by `(worldSeed, fixtureId)`.
- Phase 81A is Done, including its integrated Checkpoint F. This phase must not
  overlap tactical-engine calibration, manager/AI tactical information or the
  post-match preparation loop.
- Phase 81's carried goal-rate monitor is inside its band, so background
  fixtures will not multiply a known scoring defect across a division.
- Phases 82A and 82B are Planned and not started. No loan, posture, or
  competitive-race behaviour exists, and no step here may assume it.
- Phase 79 Step 14 remains Reopened, paused, unrun, and unclaimed.

## The Problem This Phase Owns

Three findings from the consolidated analysis, all verified in source or in
recorded cohorts.

**Contract expiry is anchored to the signing anniversary, not to the season.**
`contractEndDate` computes `startsOn + durationYears * 365`, and world
generation adds `rng.nextInt(0, 121)` days of scatter on top. In European
football effectively every contract ends at the same season boundary. The
consequence is not cosmetic: expiries never cluster, so no summer window exists;
the "final six months" state never coincides with a transfer window; and
Phase 82A has already accepted that loans end at the current season's end, which
would leave contracts and loans on two different clocks.

**The offered term cannot express a short contract.** `durationYears` is
validated as an integer `1..5` and the constraint is repeated in three SQLite
tables. FIFA's own rule (RSTP art. 18.2) sets the minimum at "from entry into
force until the end of the season" and the maximum at five years: the code has
the ceiling exactly right and the floor wrong. Real winter signings run five or
six months, which is why `16%` of real contracts are under six months. The
stored contract is not the problem - `PlayerContract` already holds `startsOn`
and `endsOn` as `GameDate` and is day-precise.

This is a representation defect, not a length defect, and the distinction
matters because an earlier version of the analysis got it wrong. Contract length
was named as the main lever on market density; it is not. The current ladder
averages `2.75` years and the accepted target is about three, so terms get
marginally longer, not shorter. What is missing is the ability to offer a term
that ends at the current season's end. The dead market comes from the expiry
anchor and from an AI that never signs.

**The free-agent pool fills and never drains.** Recorded cohorts show a
free-agent share of `0.2124`, `0.2085`, and `0.2040` over ten seasons in Phase
79C, and a maximum of `0.2274` across Phase 79A's `50 x 20`. One player in five
is out of contract. The code path is complete - `free-agent-pool.ts` selects the
pool, the market catalog exposes `status: "free_agent"`, and
`applyCareerFreeAgentSigning` signs at zero fee - so this is AI signing policy,
not a missing feature.

The pool is cyclical, and that is how it is measured. It peaks at the season
boundary when contracts expire together, and reaches its trough once the summer
window closes and clubs have signed. The gate is the delta between those two
points, not the level either of them holds: a pool whose peak equals its trough
does not drain, and no band on the level can detect that. The frozen contract is
therefore a peak of `5-7%` of a competition's senior population, a trough of
roughly `2%`, and a drain achieved mostly by signings rather than by players
leaving football.

## Locked Decisions

- Contract expiry is anchored to the season boundary. Every contract ends on the
  same date within a season, and that date comes from the existing calendar
  rather than a new one.
- The offered term is expressed in months, with a floor of "to the end of the
  current season" and a ceiling of `60` months. Duration is the input; the
  anchor decides the stored `endsOn`.
- The accepted age ladder targets a mean near three years: `60` months for a
  high-potential player under `21`, `48` under `24`, `36` for `24-30`, `24` for
  `31-33`, and `12` above `33`. Young players commit longer; the drop starts
  after `30`. This is marginally longer than today's `2.75` year mean, and it is
  a deliberate choice against the real-football mean of `19.5` months: squads
  that turn over every eighteen months give a manager nothing to grow attached
  to.
- The consequence is accepted and declared. The `55-68%` contract-expiry share
  and `8-13` arrivals-per-club bands taken from FIFA and CIES assume real
  contract lengths and are unreachable with this ladder. Step 01 re-derives both
  from the ladder and freezes the reachable values, recording the sourced ones
  beside them. A band the product chose not to hit is labelled a choice, and is
  never reported later as a miss.
- The free-agent peak is held low, at `5-7%` of a competition's senior
  population. It is the largest exploit surface in the game: at the peak the
  manager studies every available player at leisure while the AI acts on a fixed
  cadence, so a large pool of free talent lets a human assemble a squad for
  nothing and makes paid transfers pointless.
- `PlayerContract` keeps `startsOn` and `endsOn` as `GameDate`. This phase does
  not add a duration field to a signed contract, and does not change the
  contracts table.
- The `0..120` day generation scatter is removed. It exists to spread expiries
  and the anchor replaces it.
- Loans, already accepted in Phase 82A as ending at the current season's end,
  use this same anchor and this same definition. One season boundary exists in
  the codebase, not two.
- Steps 02 and 03 land together in the same phase and neither closes the phase
  alone. Shortening contracts without an AI signing policy produces a larger
  warehouse, and would be measured as a regression.
- Background fixtures are resolved only inside `advanceCareerMonths`. No second
  advancement function and no second clock is introduced.
- Background fixture resolution is idempotent: an already-resolved fixture is
  skipped, never replayed, following the durable checkpoint discipline already
  used by `closedMonthKeys`.
- Background fixtures cover the selected club's own division only. Other
  divisions, other countries, cups, and the aggregate producer are out of scope
  and belong to the world-extension work.
- The simulate-match command uses the same producer as background fixtures. A
  systematic difference between an instant result and a simulated one is a
  measurable defect, not a design choice.
- Market-density bands are frozen in Step 01, before any behaviour changes, and
  are never adjusted to match what Step 06 measures.
- Incompatible beta saves are deleted without migration.
- Step 07 runs one checkpointed `750 x 10` world-integrity cohort with exactly
  `7` workers after background fixtures and the free-agent cycle both exist.
  It is the first long run that can show complete selected-division standings,
  player charts and the Phase 81B market foundation together. It does not
  observe loans or competitive races and therefore cannot replace Phase 82B
  Step 09's market cohort.
- Both Step 07 profiles use the canonical career fixture and club selector for
  every side. The legacy report fallback to fixed `4-4-2` is forbidden and
  counted as a fail-closed source violation.

## Ordered Steps

Prerequisite analysis: `00-pre-implementation-analysis-prerequisite.md`.

1. `01-expiry-free-agent-and-density-baseline.md`
2. `02-season-anchored-expiry-and-month-precision-terms.md`
3. `03-ai-free-agent-signing-policy.md`
4. `04-background-fixtures-in-the-selected-division.md`
5. `05-simulate-match-command-on-the-shared-producer.md`
6. `06-market-density-measurement-and-cohort-authorization.md`
7. `07-checkpointed-750x10-world-integrity-cohort-and-diagnostic-view.md`

## Validation Ladder

- Step 01 measures and freezes: current expiry-date distribution across the
  calendar year, current free-agent share and drain rate, current arrivals per
  club, and the density bands. It changes no behaviour and is the only step
  allowed to set a threshold.
- Step 02 anchors expiry to the season boundary and expresses the offered term
  in months. It is a representation change with a visible consequence: expiries
  cluster. It does not touch signing behaviour.
- Step 03 gives the AI a signing policy for free agents. Steps 02 and 03 are
  evaluated together against the Step 01 bands; neither is claimed as a fix on
  its own.
- Step 04 resolves the selected club's division inside `advanceCareerMonths`.
  Its acceptance criterion is that no second clock exists and that crossing an
  interval twice changes nothing.
- Step 05 adds the simulate-match command on the same producer and proves
  neutrality against simulated results at paired seeds.
- Step 06 measures density against the frozen bands, freezes the final cohort
  contract and decides whether the expensive run is authorized. If density is
  already inside band, that is a finding, and Phase 82A is re-argued rather
  than started by default.
- Step 07 runs and resumes the exact `750 x 10`, writes the canonical report,
  derives a local diagnostic view from that same report, closes the phase and
  hands off to Phase 82A only on a truthful `GO`.

## Mandatory Per-Step Loop

For every step:

- reread `docs/PROJECT_STATUS.md`, this README, the active step in full, and
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- modify only Expected Files plus `docs/PROJECT_STATUS.md` and a permitted
  next-step lesson;
- remove obsolete code and fixtures made redundant by the step;
- add useful JSDoc/TSDoc to new or materially modified exported functions and
  types;
- run focused checks, fix failures, update the step/status/roadmap, and only
  then advance;
- keep all later steps Not started.

## Phase-Level Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Clean-Code Gate

- One season boundary definition exists and every consumer reads it. Contracts,
  loans, market windows, and rollover do not each compute their own.
- No dead code, obsolete helper, duplicated formula, or redundant fixture
  remains undocumented. When a step removes a behaviour, the helpers, fixtures,
  translation keys, and tests that existed only to serve it go with it.
- No fallback stands in for a missing case. Domain unions are handled by total
  mappings with an exhaustiveness guard.
- No generic utility Module is introduced where a football concept owns the
  behaviour. "Season boundary" and "free-agent signing policy" are football
  concepts with names.
- The offered-term change migrates every caller in its own step; no optional
  compatibility field survives it.

## What NOT To Implement

- No loans, sale postures, incoming offers, competitive races, or free-agent
  negotiation lifecycle. Phases 82A and 82B own all of it. This phase changes
  when contracts end and whether the AI signs an already-available free agent.
- No second advancement function, second clock, or lazy after-the-fact
  simulation.
- No background fixtures outside the selected club's division; no cups, no
  foreign countries, no aggregate producer.
- No match-engine change. Phase 81A closed the current contextual engine before
  this phase starts.
- No contracts-table schema change: the signed contract already stores dates.
- No band adjusted after seeing a measurement.
- No longitudinal cohort before Step 07 and no second simulation producer.
- No Phase 79 Step 14/15 implementation.

## Definition Of Done

- Every contract in a generated world and every contract signed in play ends on
  a season boundary, and the generation scatter is gone.
- A winter signing can be offered a term that ends at the current season's end,
  and the term is expressed in months with a `60` month ceiling.
- Contracts and loans share one season-boundary definition with one owner.
- The free-agent share sits inside its frozen band and the pool demonstrably
  drains: signings per season are positive and recorded.
- Steps 02 and 03 are reported together, with the combined effect on arrivals
  per club, not as two independent claims.
- Background fixtures in the selected division resolve inside
  `advanceCareerMonths`, are idempotent across a repeated interval, and produce
  identical results regardless of resolution order at the same
  `(worldSeed, fixtureId)`.
- The user's league table is complete at every point in the season.
- The simulate-match command and background resolution share one producer, and
  paired-seed distributions show no systematic difference.
- Market density is measured against the frozen bands and every value is
  recorded, inside band or not.
- The checkpointed `750 x 10` completes with `750` stable one-world shards and
  exactly `7` workers; a no-work resume reproduces every ordered shard hash and
  the aggregate hash.
- Complete tables, scorer and assist charts, goal/assist production, transfer
  movements and tactical usage are reconciled from canonical facts, and the
  generated diagnostic view contains no independent calculation.
- Every world-integrity fixture reports the canonical selection source,
  fixed-shape fallback count is `0`, and the observed formation distribution
  evaluates the existing `distinct_formations >= 5` gate.
- Repository, build, browser, accessibility, persistence, dependency, diff, and
  Graphify gates pass.
- Phase 82A receives a handoff that states plainly whether the measured density
  still justifies the loan work.
