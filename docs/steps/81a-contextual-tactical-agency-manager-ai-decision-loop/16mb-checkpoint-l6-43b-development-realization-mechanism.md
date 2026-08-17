# Step 16M-B - Checkpoint L6.43B Development-Realization Mechanism

## Status

**Complete. `OWNER_IDENTIFIED` - `expected_ceiling_below_16_at_intake`,
`173/173`, coherent in `7/7` worlds, zero reconciliation failures.** Diagnostic
and observation only: no gameplay behaviour, content coefficient, projection
policy, academy rule, selection rule, transfer rule, save schema or beta version
changed here.

The `7 x 15` reproduced the frozen baseline from a fifteen-season run - `716`
assignments, `424/292`, owner `development_realization` - through the ten-season
adapter, and the `7 x 10` replay held `baselineContinuityHash`
`5f1cad79889795de6d02ab31ba899396` with checkpoint purity on the final payload.

What the measurement established, in the order the evidence arrived:

| question | reading |
| --- | --- |
| was conversion the constraint | no - core attributes at `99.9%` of ceiling |
| was opportunity denied | no - exposure `p50 0.81`, all `173` above the frozen `0.50` |
| is the projection pessimistic | no - it **overstates** outcomes by `+1.55`, `139/154` |
| when is the ceiling lost | about age `19`; `152/154` before sustained exposure |
| how high was the ceiling | `16.01..16.49`, from current `~8` at intake |
| outcome | `69` reached `13`, `38` reached `14`, `10` reached `15`, **`0` reached `16`** |

**The correction this step was expected to open is not authorized, and Step
16M-C's five-star branches are withdrawn rather than blocked.** Five-star is a
rating band, `[16, 16.5)`, not a cohort the allocator chose badly: those ceilings
are the band's definition. The elite-capable tail exists in the same worlds and
same intakes as the **six-star lane**, ceilings `17.02..19.75`, which the frozen
L6.43A design excluded from attribution. This step therefore measured the one
population structurally incapable of reaching `16`.

Two further results are final and need no further run. `upperAbility` equals
`storedCeilingAbility` for `1298` of `1298` selected players, so the public
upper estimate carries no information. And the `99.9%` core realization is
permanently uninterpretable, because a mutable ceiling descends toward current
and no cohort can separate *reached* from *met*.

**Next work is report-only**: the six-star lane's outcomes, judged per world
against the `5/7` coherence rule, inside Step 00 of Phase 81B. No gameplay
change before that measurement. Findings and evidence are in
[`PHASE_81A_L6_43B_PREFLIGHT_FINDINGS.md`](../../audits/PHASE_81A_L6_43B_PREFLIGHT_FINDINGS.md),
Findings 1-13.

The first version of this step ran ten seasons over a four-mechanism taxonomy.
A read-only audit of the completed L6.43A artifact, performed before any
L6.43B run, showed that design cannot answer the question. The corrections are
recorded in
[`PHASE_81A_DEVELOPMENT_REALIZATION_RECOVERY_CONTRACT.md`](../../audits/PHASE_81A_DEVELOPMENT_REALIZATION_RECOVERY_CONTRACT.md)
and summarised under *Why This Step Was Revised*. No threshold moved after a
measurement, because no L6.43B measurement exists.

## User-Facing Question

Why do selected prospects who reach senior football and sustained minutes still
fail to become current-16 players? The answer must distinguish an unlikely
prospect, a ceiling that disappears, a career observed before it finished,
opportunity that was never sufficient, and a genuinely underpowered development
conversion.

## Why This Step Was Revised

Read-only facts from
`simulation-out/phase81a-successor-pathway-l6-43a-paired-7x10.json`, hash
`41ceb57e7f472fd3bd5e314b83d7abe6`:

1. **The ten-season horizon censors the cohort.** Age at season ten averages
   `23.26`; `97/173` are `<=23` and `163/173` are `<=25`. Evaluating maturity
   per group against `monthlyGrowthAgeMultiplier`
   (`player-development-policy.ts:91`), which first returns zero at `26`
   outfield, `27` midfield and `28` goalkeeper, only `10/173` have a closed
   window at ten seasons, distributed `[4,3,1,0,1,0,1]`. Two worlds contain
   zero mature players, so no `5/7` owner rule can be satisfied.

   At fifteen seasons `164/173` are evaluable, `[21,16,21,25,21,30,30]`, and
   `9` remain censored: `2` goalkeepers and `7` midfielders, exactly the groups
   whose window closes latest. Those nine stay in the censored state; a
   seventeen-season run to recover them is not authorized, because `164` pooled
   with a per-world minimum of `16` already clears the power floor.

2. **The withdrawn mechanism 3 was unreachable in this cohort.** It required
   `900` minutes to arrive while the age multiplier was zero. No selected
   player debuts at `>=26` (max `24`), and the median passes `900` inside his
   first senior season. Retaining it as a possible owner would have guaranteed
   an empty category; removing it after the run would have edited a frozen
   taxonomy post hoc.

3. **`900` cumulative minutes cannot measure opportunity quality.** It
   correctly separates the `39` players below it and is kept for that. Above
   it, the cohort ranges from `953` to `15940` minutes with p50 `3780`, so
   crossing the bar certifies only that opportunity began.

4. **The aggregate role-weighted margin cannot separate the mechanisms.**
   Growth is applied per attribute in proportion to role relevance
   (`1`, `0.35`, `0.08`, `0.02`) while ability is measured as a weighted
   average over the same weights. A low ceiling and an unconverged conversion
   produce the same aggregate.

5. **The exit end of the same loop is unobserved here.** First-Division
   age-33-plus top-ten share in the shipped control reaches `0.243` scorer and
   `0.329` creator by season six against the canonical `age33PlusScorerShare`
   and `age33PlusAssistShare` ceiling of `0.12`, and the `25..29` band
   collapses from `0.679` to `0.164` between seasons one and seven. A
   development correction that improves supply while worsening this is not an
   improvement.

6. **The judgement point must not move with a candidate curve.** A Step 16M-C
   candidate that extends technical and mental growth past `26` would reopen
   windows the control calls closed, so the arms would evaluate different
   populations. The outcome term is frozen at the control window-close age per
   group and never reads a candidate curve.

## Frozen Population

- the exact L6.43A candidate policy and seven world seeds;
- **fifteen seasons** and exactly seven workers;
- decision population: the `173` players classified `development_realization`
  by the frozen L6.43A evaluator at its season-ten boundary;
- stable player IDs, never names or final ownership;
- a fresh execution through the same canonical producer, because the completed
  annual cache cannot locate exact monthly development boundaries;
- current product development code is read, not changed.

Seasons `1..10` must reproduce every L6.43A headline fact exactly: `716`
assignments, `424/292` closed and open windows, the exclusive terminal counts,
the named owner and the six-star first-divergence facts. Seasons `11..15` are
new observation. Any drift inside the first ten seasons is `STOP_INSTRUMENT`,
not a new population to interpret.

Continuity is checked through a `seasonTenPrefixHash` computed over the
canonical season-`1..10` facts alone, identically by the ten-season and
fifteen-season runs. A fifteen-season report cannot share a ten-season report's
overall hash, so whole-report identity is not the check and was never
achievable.

Two different questions are asked by two different hashes, and conflating them
would make the replay fail for the one reason that carries no information.

- `seasonTenPrefixHash` - is *this whole report* unchanged through season ten.
  It covers every section the run produced, so a run that adds a diagnostic
  section changes it by construction.
- `baselineContinuityHash` - is the *earlier run's evidence* unchanged. It is
  computed by the same function over an explicitly declared list of baseline
  section ids, so evidence a later step adds is additive rather than a
  difference.

The gate for this step is the second. Its inputs are already known without
rerunning anything, because both are derivable from the completed artifact:

```
baselineSectionIds = ["season", "standings", "players", "transfers",
                      "formations", "economy", "development", "anomalies",
                      "tactical_agency", "tactical_shape"]

L6.43A baselineContinuityHash = 5f1cad79889795de6d02ab31ba899396
```

On L6.43A itself the two hashes coincide, because that run added no section.
They separate the moment L6.43B does.

The baseline id list is **declared and validated, never inferred**: a declared
section missing from a run throws rather than silently shrinking the
comparison, and duplicates are refused. A gate that quietly compares less than
it claims is worse than no gate.

One rule remains binding on the implementation, and it is narrower than a
first reading suggests: **the observation payload must not add or alter any row
carrying `seasonNumber` inside a baseline section.** Continuity would then fail
on instrumentation rather than on the engine.

It does **not** require a new report module. L6.43A's own checkpoint already
lives inside `development.data.checkpoint`, and its player rows are keyed by
`assignmentSeason` and `firstSeniorSeason` rather than `seasonNumber`, so they
are invisible to the prefix hash. Only `6` rows of that checkpoint carry
`seasonNumber` - the six-star first divergences - and those are unchanged
facts that must reproduce anyway.

The L6.43B payload may therefore extend the same checkpoint, provided its rows
name their season with an explicit field of their own rather than
`seasonNumber`. That avoids registering a new module id, new module labels and
a new `--include` value for a diagnostic that only one locked profile requests.

This must be verified, not assumed: the `7 x 10` replay's
`baselineContinuityHash` is exactly the test, and a mismatch means the payload
leaked a `seasonNumber` row into a baseline section.

The hash has two further failure modes and both are gated. Too narrow, it lets
a real season-`1..10` divergence through; too wide, it fails on counters that
legitimately span the whole horizon. It therefore must:

- include **only** canonical facts carrying `seasonNumber <= 10`, in a stable
  declared order, and no whole-horizon aggregate;
- be proven by negative tests: mutating one season-`1` fact **must** change the
  hash, and mutating only a season-`11` fact **must not**.

Without both tests the hash is an assumption rather than a check, and the
`7 x 10` replay that gates the main run would prove nothing.

## What To Implement

Extend the existing successor-pathway evaluator; do not create another funnel.
The engine already produces `PlayerMonthlyDevelopmentChange` from canonical
participation rows. Expose those existing facts only when the locked diagnostic
profile requests them, carry them through the season facts without rebuilding
their formulas, and discard non-selected IDs at the report boundary.

For each of the `173` IDs derive:

- assignment current, p50, upper and stored-ceiling ability;
- first senior registration and the exact month cumulative senior minutes
  reach `900`;
- **cumulative development exposure**, the running sum of
  `ageMultiplier * opportunityMultiplier` from the canonical
  `monthlyDevelopmentPolicy(...)` return value for each observed month, and
  `exposureShare` as that sum over the maximum exposure available from the
  player's **first eligible development month** to the group's window close,
  counting only months in which a development checkpoint actually ran. Months
  before that boundary are not in the denominator, and neither are months the
  lifecycle never closed: measured on a real world it runs eight a season, not
  twelve, so a calendar denominator charged every player a third of every year
  that existed for nobody. The recovery contract records the correction and the
  reading; the `0.50` fraction did not move;
- the player's group judgement age (`26` outfield, `27` midfielder, `28`
  goalkeeper) and the season in which he reaches it;
- canonical role-current and role-potential ability at the `900`-minute month,
  at the `exposureShare = 0.50` month, at the judgement age, and at the final
  observed month;
- **current and potential split by relevance bucket** (`coreForRole`,
  `secondaryForRole`, `allowedButLow`, `cappedOutOfRole`) at those same
  boundaries;
- the first month canonical role potential falls below `16`, if any, with
  `lossTiming` of `before_sustained_exposure` or `after_sustained_exposure`;
- age, broad position group, real minutes, total growth/decline and canonical
  policy multipliers at each boundary;
- whether the horizon ends before the judgement age, which decides censoring;
- maximum current ability, and whether current `16` was reached **at or before
  the judgement age**;
- one exclusive state from the ordered contract below.

### Elite Tenure, Reported With Its Own Censoring

The run measures how long players hold First-Division current `16`, over all
origins, across fifteen seasons. **Closed and open spells are reported
separately and are never pooled into one mean.** A spell still running at
season fifteen is right-censored exactly as the cohort was, so a mean taken
over observed spells alone understates true tenure. Required facts:

- closed-spell count and mean length;
- open-at-horizon spell count and mean observed length so far;
- the share of all spells that are open at the horizon.

This is a **diagnostic**. It cannot move the `0.20..0.50` conversion band,
which the recovery contract freezes as a declared product hypothesis precisely
because a censored tenure statistic cannot repair a censoring defect. No
reading from this step changes any threshold in this phase.

The evaluator calls the canonical monthly policy with the retained
participation row. It never copies age bands, role weights, performance,
opportunity or environment formulas. Annual public p50/upper projections remain
diagnostic context; exact ordering uses the engine's monthly facts.

### Coupled Age-Composition Observation

The same run additionally records, for each division:

- the canonical `HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS` age-composition
  readings in their own units and populations: `scorerMeanAge`,
  `assistMeanAge`, `age33PlusScorerShare`, `age33PlusAssistShare` as cohort
  aggregates, and `age33PlusStarts` / `age33PlusMinutes` **per age-33-plus
  player**;
- the same quantities broken out per season from six to fifteen, as a named
  diagnostic only;
- top-ten scorer and creator counts by age band and by origin;
- current-16 stock by age band and origin;
- `careerGeneratedLeaderShareSeasonTen` at its own season ten, unchanged, with
  the season-fifteen value beside it as a separate diagnostic.

These are observation only in this step. They exist so Step 16M-C can gate on
the exit end of the loop, which Step 16J proved cannot be corrected
independently of the supply end. No owner is computed from them here, and no
canonical band is restated, re-based or converted to a per-season requirement.

## Frozen Exclusive States

In this order, evaluability before mechanism:

1. `expected_ceiling_below_16_at_intake`;
2. `ceiling_lost_before_realization`, carrying `lossTiming`;
3. `right_censored_at_horizon`;
4. `sustained_opportunity_insufficient`;
5. `realization_under_viable_projection`;
6. `instrument_failure`.

Their exact definitions, the `0.50` exposure fraction, and the `5/7`, `0.20`,
`0.05` owner rule live in the recovery contract and are not repeated or relaxed
here.

State `2` spans the whole pre-judgement career. A potential that stays viable
past sustained exposure and is compressed before the judgement age is a real
row that a narrower definition would leave in no state at all, while being
neither censored nor an instrument failure. `lossTiming` preserves the
distinction without splitting one dated-potential owner in two, and its pooled
split selects the branch in Step 16M-C.

`right_censored_at_horizon` is never an owner and is excluded from every owner
denominator. It is reported in full with per-world counts and is never
redistributed across the other states.

Beside it sits one further non-failure outcome, `recovered_before_judgement`: a
member of the frozen cohort who reaches current `16` after the season-ten
baseline but still before his judgement age. He satisfies no loss state - he is
not censored, his ceiling held, his opportunity sufficed, and state `5` requires
that `16` was never reached - and he is not a failure, so he is excluded from
every owner denominator on the same ground that excludes a censored player.

It is an outcome, not a seventh loss state. **Every member of the frozen cohort
resolves exactly once: to one of the six loss states, to
`right_censored_at_horizon`, or to `recovered_before_judgement`.** Resolving to
none, or to more than one, is `instrument_failure`.

A pooled recovery share of zero is a valid baseline reading, not a failed gate.
The control arm is expected to read zero or near it; strict positivity is a
requirement on a Step 16M-C candidate seeking adoption, never on the measurement
that precedes it.

The report includes per-world counts, pooled shares over the evaluable
population, the owner margin and raw player rows. Raw rows show IDs plus
presentation names when available, but the decision never reads names.

## Decision

- **`OWNER_IDENTIFIED`**: exactly one state satisfies all frozen owner
  conditions over the evaluable population. Open only its conditional branch in
  Step 16M-C.
- **`MIXED`**: facts reconcile but no state satisfies the owner rule. Step
  16M-C's single-owner branches stay blocked and its pre-registered factorial
  opens instead.
- **`UNDERPOWERED`**: fewer than `10` evaluable players in any world or fewer
  than `100` pooled. Extend the horizon and repeat; never correct.
- **`STOP_INSTRUMENT`**: first-ten-season drift, missing/duplicate ID,
  non-exclusive state, missing boundary, copied policy or reconciliation
  failure. Fix only this step and repeat unchanged.

No result is a gameplay `GO`.

## Expected Files

- `packages/engine/src/career/player-development.ts`,
  `advance-career-month.ts`, `advance-career-season.ts` and their tests - expose
  already-produced per-player monthly changes only behind one typed
  observation request; no second formula and no default product payload. The
  relevance-bucket split is taken inside the monthly development loop, because
  the batch career state reflects up to three applied months and cannot
  attribute a value to one of them. `advance-career-season.ts` additionally
  publishes, under the same request, the development months its lifecycle
  actually closed. That list is the exposure denominator's month basis and it is
  not derivable anywhere else: the months in which development is possible are a
  property of the fixture calendar, and the alternative was for the report to
  rebuild that calendar and be wrong by a third of every year.
- `packages/engine/src/career/player-development-policy.ts` and test - becomes
  the single owner of `BroadPositionGroup`, `broadPositionGroup(...)` and the
  narrowed policy input. The evaluator must derive a player's development group
  and recompute the canonical multipliers without restating either. Two
  byte-identical private copies of the mapping already existed, and the type was
  redeclared a third time, so a report-side consumer would have added a fourth;
  the mapping therefore moves beside the age curve it feeds. The policy input
  narrows to the three participation facts the policy actually reads, so the
  observation retains those three numbers instead of a ledger row carrying
  fixture-idempotency bookkeeping no consumer uses, and any future widening of
  what the policy reads becomes a typed change every observer must answer.
- `packages/engine/src/career/player-exits.ts` - loses its duplicate copies of
  the same mapping and type. It is in this step only because deduplication has
  no meaning if one copy survives, and touching it is what makes the policy
  module a real single owner rather than a third location.
- `packages/engine/src/index.ts` - publishes `broadPositionGroup`,
  `MonthlyDevelopmentParticipationFacts` and
  `completedPlayerAgeAtDevelopmentMonth`. The last is deliberately semantic: the
  evaluator must age a player across months he never played, and exporting the
  raw month-end boundary instead would let the CLI place the checkpoint
  elsewhere, where a one-day disagreement moves a player across an age band and
  out of his growth window.
- `packages/domain/src/player/player-role-profile.ts` and test - owns the
  canonical ordered relevance-bucket vocabulary. The engine needs a runtime
  bucket list to record the split; declaring one in the engine would duplicate
  a vocabulary domain already owns, so the list lives here and replaces the
  order-sensitive object-key enumeration that previously recovered it.
- `packages/simulation-tools/src/modular-report/report-contract.ts`,
  `season-prefix-hash.test.ts` **(new)** and the `index.ts` export - own the
  `seasonTenPrefixHash`. It lives beside the canonical report hash and reuses
  it, so the prefix and full hashes cannot drift apart in serialization, and a
  second hashing primitive is never introduced. The test file is separate
  because it gates a cross-horizon claim rather than the report contract
  itself, and it must fail when the identity rule regresses.
- `docs/audits/PHASE_81A_L6_43B_PREFLIGHT_FINDINGS.md` **(new)** - the phase
  analysis artifact recording every finding established before this checkpoint
  runs, with the evidence and the falsification condition for each. It exists so
  the design decisions taken before measurement are reviewable independently,
  and so no finding can be quietly restated after a result.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and existing
  tests - forward the typed observation request through the canonical report
  producer, add the coupled age-composition facts, and prove observer-off
  results are byte-identical.
- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test - deepen the sole evaluator, own cumulative exposure and the
  per-bucket margins, and prove exhaustive exclusive states. It also gains the
  L6.43B baseline adapter. `evaluateSuccessorPathwayCheckpoint` is left exactly
  as L6.43A froze it - a ten-season instrument that refuses any other horizon -
  because making it horizon-aware would move the numbers the continuity replay
  exists to reproduce. The adapter cuts a longer run's facts back to seasons
  `1..10` and passes `min(seasonCount, 10)`, so a shorter run is not told it is
  the baseline either. At ten seasons it is a no-op, and that is precisely what
  the replay's byte-identity proves.
- `apps/cli/src/commands/simulation-report/career-sections.ts` - collect only
  selected IDs and require exact L6.43A continuity across seasons `1..10`.
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts` - one locked L6.43B profile on the L6.43A seeds,
  policy, versions, fifteen seasons and seven workers.
- `packages/i18n/src/labels.ts` - canonical profile discovery text in all five
  languages.
- generated L6.43B audit, audit index, this step, phase README, Step 16M-C,
  Step 16N and `docs/PROJECT_STATUS.md`.

Any additional file must be added here with its ownership reason before edit.

## Required Checks

1. Use `graphify explain` and `graphify affected --depth 2` on the evaluator,
   cache reader and canonical age policy.
2. The reachability corpus is frozen to all `716` selected IDs in the exact
   replay, while the decision denominator remains the `173` minus censored and
   recovered players. Focused tests must find real rows reaching every retained
   state and both `lossTiming` values; an unreachable state is removed before the
   run, not preserved as speculative code. The six loss states plus
   `right_censored_at_horizon` plus `recovered_before_judgement` must sum to
   `173`, each player resolving exactly once; owner, mixed, underpowered,
   censored and recovered outcomes are exercised from real rows, and corrupting
   one otherwise-real row must produce `STOP_INSTRUMENT`.
3. Prove first-ten-season determinism explicitly, through `seasonTenPrefixHash`
   and the named headline values, not whole-report identity. If season count
   feeds any RNG derivation this will fail, and that failure is
   `STOP_INSTRUMENT` on this step, not a licence to reinterpret. Take this
   reading on the `7 x 1` canary and on a `7 x 10` replay before committing to
   the long run.
4. Prove `exposureShare` uses a boundary-anchored denominator: a fixture
   assigned at `18` and one assigned at `16` with identical observed months must
   not receive the same share. Prove separately that the denominator counts only
   months the lifecycle closed - a fixture whose range spans an off-season must
   not be charged for it.
5. Prove the accumulated observation cohort is exactly right. The observed set
   is built during the run - each season's new assignments are added to the
   request for subsequent seasons - rather than read from a frozen ID list, so
   its correctness is a claim that must be tested, not a configuration:
   - the observed ID set equals exactly the union of the `716` assignments;
   - no monthly row earlier than a player's own assignment reaches the report;
   - every participation row after a player's assignment is captured;
   - no row is duplicated across seasons or across workers.

   The canonical season operation order places `monthly_lifecycle` before
   `youth_intake`, so a prospect assigned at season `N` has no season-`N`
   development to lose. That ordering is load-bearing for this design: if it
   ever changes, this step's cohort silently loses a season and the assertion
   above is what catches it.
6. Prove the `seasonTenPrefixHash` itself, before trusting any replay it
   gates. Mutating one season-`1` fact must change it; mutating only a
   season-`11` fact must not; sibling containers must not share a row path; and
   removing the identity rule must make these tests fail rather than pass
   vacuously.
7. Prove checkpoint purity directly, independently of any hash. The prefix hash
   deliberately ignores rows without `seasonNumber`, so it cannot see a change
   to the historical checkpoint facts - the `173` player rows key on
   `assignmentSeason` and `firstSeniorSeason` and are invisible to it by
   design. That property is what makes the hash safe for observation and is
   exactly why it is not sufficient alone. Two comparisons are required:

   - **observer off**: `development.data.checkpoint` from a fresh replay is
     byte-identical to the L6.43A artifact's, under canonical serialization;
   - **observer on**: the only difference against the observer-off checkpoint
     is the one declared L6.43B sub-field. Any other added, removed or altered
     key is `STOP_INSTRUMENT`, whatever the hashes say.

   **Non-vacuity first.** Both comparisons above are trivially satisfied when
   the observer collected nothing, so purity is only demonstrated once the
   payload is non-empty: `observedPlayerCount > 0` and `observedMonthCount > 0`
   in **every** world, and those counts reconciled against the retained seam
   rows. A zero payload is `STOP_INSTRUMENT`, never a pass.

   **Right population, not merely a populated one.** Non-emptiness says nothing
   about who was observed. The observed set must equal the five-star assignment
   set exactly, per world — never a superset. Accumulating from every accepted
   ceiling placement instead admitted the six-star lane, two to three players
   per world, a cohort the frozen `716` does not contain and which the pathway
   evaluator itself counts as a reconciliation failure. That lane is compared
   between arms for identity and is never attributed. A payload larger than the
   assignment set is `STOP_INSTRUMENT`, exactly like an empty one.

   **The exposure denominator must start where development can start.** A month
   with no participation produces no observed row, so the assignment-anchored
   denominator cannot be rebuilt from the rows alone: it needs the player's
   birth date and the first month he could develop at all. That boundary is
   recorded as `firstEligibleDevelopmentMonthKey`, never as the literal
   assignment month — intake runs after the season's monthly lifecycle, so the
   assignment month names a checkpoint already past, and anchoring there would
   charge a player for months in which no development was possible.

   The boundary is proved against the lifecycle rather than asserted from
   calendar arithmetic. A chronology test must show that an assigned player's
   earliest possible `change.monthKey` is at or after his recorded key, and that
   no month entering his denominator precedes the first checkpoint the lifecycle
   would actually process. Without it, summer and out-of-lifecycle months would
   be counted as lost opportunity, and `sustained_opportunity_insufficient`
   would absorb players who were never denied anything.

   **Three conditions gate the evaluator and every further run.** Exposure
   cannot be computed before all three exist, because each removes one way for a
   month to be miscounted:

   1. the chronology test above, proving the recorded boundary against the
      lifecycle rather than against calendar arithmetic;
   2. the cohort header forwarded through the projection into the checkpoint, on
      the same path the monthly rows already take;
   3. a reconciliation test binding the header set to the assignment set - one
      entry per five-star assignment observable at the horizon, no more and no
      fewer, under the same `<= 9` and `<= 14` bounds the row counts use.

   Building the evaluator first would produce an `exposureShare` that looks
   finished and cannot be trusted, which is the failure this checkpoint has
   already met four times.

   **All three are satisfied**, by one focused test on the real intake →
   lifecycle → participation-ledger path, and each was shown to fail before it
   was made to pass. They also found two defects that no earlier check could
   have seen.

   The first is the denominator's month basis. The lifecycle closes a
   development checkpoint only in months carrying a participation row; measured
   on a real world it closes eight a season, `2026-08 .. 2027-03` and
   `2027-08 .. 2028-03`, and nothing from April to July. The denominator
   therefore reads the engine's own closed-checkpoint record rather than the
   calendar. `advanceCareerOneSeason` publishes that record beside the rows, so
   the report never rebuilds the football calendar to find out which months
   existed.

   The second is the horizon. The header was being emitted for assignments made
   in the run's final season, who cannot accrue a development month at all -
   intake runs after the monthly lifecycle, and there is no season after the
   last. They would have reached the evaluator with a full denominator and an
   empty numerator and classified as denied opportunity. The header now stops at
   `seasonCount - 1`, which is the `<= 9` and `<= 14` bound stated above, and the
   reconciliation compares ids as sets so a swap fails as loudly as a surplus.

   This is not hypothetical. The first replay returned all three gates green
   with a zero payload, because the flag was threaded into the general
   league-diversity inspection builder while the paired successor-ceiling arms
   are configured by `successorCeilingProjectionInput`, which hardcodes its own
   flags. The observation never reached the candidate arm. Typecheck could not
   see it: both builders are valid, only one is used on this path.

   A later canary reported the same zero payload for an unrelated reason, and
   that one matters more. The career-world checkpoint cache matches a stored
   world on profile, seed, world index, world count, season count, detail and
   section ids only. No inspection flag is part of that identity, so a world
   cached with the observer off is replayed verbatim when it is turned on. Two
   correct fixes were measured as failures because nothing was simulated. The
   only lever is `CAREER_PROFILE_CACHE_SUFFIX`, bumped per profile by hand: any
   change that adds a field to a projection must retire the stored generation of
   every profile expected to carry it. A canary reporting zero must therefore
   also show a cache directory written by that run, or it is diagnosing an
   artifact rather than the code.

   Reachability is therefore proved by a `7 x 2` canary before the ten-season
   replay is spent. Not `7 x 1`: intake runs after the monthly lifecycle, so
   season one has no assignment to observe and a zero payload there would be
   correct and meaningless. The canary is itself backed by a focused two-season
   test that runs the real generation, intake, ledger and development path into
   a temporary checkpoint directory, where no stored world can be reused, and
   that fails when the projection forwarding is removed.

   A green `baselineContinuityHash` with a changed historical fact is the
   failure this check exists to catch, and no other check would.

   **This comparison runs on the paired `7 x 10` replay only.** On the `7 x 15`
   the checkpoint legitimately differs: more academy windows close, seasons
   `11..15` add assignments, and the terminal counts move with them. Applying
   byte-identity there would produce a `STOP_INSTRUMENT` that reports the
   horizon rather than contamination. The `7 x 10` replay is the arm where
   every fact is expected to be identical, which is exactly what makes it the
   arm that can prove purity.
8. Run a `7 x 1` observer-purity canary, then the fresh `7 x 15` alone with
   exactly seven workers. Rebuild from its completed facts to a distinct file
   and require byte-identical JSON and decision.
9. Run `graphify update .`, stale-symbol search, `git diff --check` and
   `pnpm check` alone.

```bash
nvm use 24.16.0
pnpm cli simulation-report \
  --profile=phase81a-development-realization-l6-43b-7x15 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-development-realization-l6-43b-7x15.json
```

## What NOT To Implement

- no growth, potential, aging, minutes, academy or market change;
- no copied current/potential, age, minutes or growth formula;
- no final-state reconstruction where a dated boundary exists;
- no interpretation when observation changes an L6.43A season-one-to-ten
  headline fact;
- no owner named from a censored player;
- no second simulator or report entrypoint;
- no Step 16M-C branch selection by qualitative inspection.

## Definition Of Done

All `173` players reconcile exactly once - to one of the six loss states, to
`right_censored_at_horizon`, or to `recovered_before_judgement` - the expected
`9` censored players and any recovered players are reported separately and both
are excluded from the owner denominator, a pooled recovery share of zero is
recorded as a valid baseline reading rather than a failure, the
coupled age-composition facts exist in canonical units, mean elite tenure is
measured, the checkpoint records `OWNER_IDENTIFIED`, `MIXED`, `UNDERPOWERED` or
`STOP_INSTRUMENT`, and only a demonstrated owner over an adequately powered
evaluable population can open a single-owner branch of Step 16M-C.
