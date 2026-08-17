# Step 16M-C - Development-Realization Owner Correction And Paired Checkpoint

## Status

**`superseded_not_executed`.** No branch of this step ever opens, and none is
waiting on a condition that could still arrive.

L6.43B returned `OWNER_IDENTIFIED: expected_ceiling_below_16_at_intake`, which
points at this step's allocation branch. That branch is then **withdrawn by the
same measurement**: five-star is a rating band `[16, 16.5)`, so the cohort's
`16.01..16.49` ceilings are the band's definition rather than a selection
defect, and no allocation rule over that lane can produce an elite player. The
`MIXED` factorial does not open either - the result was a named owner, not a
tie - and the remaining branches were conditioned on owners the measurement did
not return.

The structural answer moves to **Phase 81B**, which replaces the mutable
`Player.potential` and the special five/six-star generation lanes rather than
correcting a selection rule over them. This document is kept as the frozen
pre-registration it was: it records what would have been allowed before any
output existed, which is what makes the withdrawal checkable rather than
convenient.

Nothing here was executed. No candidate code, seam, profile or fixture from
this step exists to remove.

## User-Facing Goal

Create believable successor stories: sustained football plus credible upside
must sometimes produce a top-level senior player, while most prospects may
still fail, move or settle below elite level. The same correction must not
achieve this by keeping the opening cohort at the top for longer, nor by
removing older players so fast that the elite rung is refilled by the next
opening cohort instead of by new ones.

## Why A Single-Owner Correction May Not Be Available

Four corrections have now been attempted on this loop, each isolating one
owner, each falsified:

| step | isolated owner | result |
| --- | --- | --- |
| 06B7F / 06B7G4 | potential-room realization rate | parity reached, elite supply unchanged |
| 16G | premature potential compression | `STOP_RETHINK`; successor tail fell, leaderboards aged |
| 16J | late-career aging onset | `STOP_RETHINK`; opening stock `91 -> 98`, generated `15 -> 10` |
| 16L / 16M | five-star ceiling supply | `STOP_RETHINK`; conversion `0/7` worlds |

The pattern is consistent and informative. Supply, opportunity, growth, elite
stock and exit form one loop. 16L raised supply while exit held, and the new
supply never reached the rung. 16J accelerated exit while supply held, and the
vacated rung was refilled from the same opening cohort, which made succession
worse rather than better.

L6.43A shows both ends of that loop simultaneously in the shipped product:
zero of `716` selected prospects reach current `16`, while First-Division
age-33-plus top-ten share reaches `0.243` scorer and `0.329` creator by season
six against the `<=0.12` ceiling frozen by Step 16J, and the `25..29` band falls
from `0.679` to `0.164` between seasons one and seven.

A fifth single-owner attempt is therefore permitted only when L6.43B returns
`OWNER_IDENTIFIED` over an adequately powered evaluable population. On `MIXED`
the factorial below opens instead, and it is pre-registered here so it cannot
be designed after seeing an output.

## Conditional Scope

Exactly one of these may open:

- `expected_ceiling_below_16_at_intake` -> successor allocation/aptitude
  contract;
- `ceiling_lost_before_realization` -> dated projection/ceiling owner, with the
  pooled `lossTiming` split selecting which: `before_sustained_exposure` points
  at the projection/ceiling policy, `after_sustained_exposure` at
  `remainingReachableRoom` compression. The split is read once, before the
  branch is written;
- `sustained_opportunity_insufficient` -> academy-to-senior progression owner;
- `realization_under_viable_projection` -> shared canonical development
  conversion owner, under the branch frozen below;
- `MIXED` -> the pre-registered factorial;
- `UNDERPOWERED` -> no correction; extend the horizon and repeat 16M-B.

The detailed branch meanings live once in
[`PHASE_81A_DEVELOPMENT_REALIZATION_RECOVERY_CONTRACT.md`](../../audits/PHASE_81A_DEVELOPMENT_REALIZATION_RECOVERY_CONTRACT.md).

No branch may read career origin, successor assignment, club future need or
report membership inside engine gameplay. The Step 16L stock remains an
analysis candidate until this checkpoint passes.

## Frozen Branch For `realization_under_viable_projection`

The engine currently holds three age-conditioned policies that disagree with
each other:

| policy | belief about late development |
| --- | --- |
| `monthlyGrowthAgeMultiplier` | growth ends at `26` outfield, `27` for midfielders; one scalar, blind to attribute family |
| `remainingReachableRoom` | reachable room persists to `34`: `<=27` gives `1.5` non-physical, `<=31` gives mental `1.0`, `<=34` gives mental `0.6` and technical `0.25` |
| `agingMultiplier` | outfield decline does not begin before `32`, and technical/mental decline not before `34..36` |

Ages `26..31` are therefore a dead zone: no growth, no decline, and reachable
potential room reserved by one policy that another policy can never deliver.
The potential generator's own `familyWeight` already asserts the football model
the development policy ignores, raising mental weight with age while physical
collapses.

**The admitted correction is to make the development age curve family-aware and
consistent with the room the aging policy already reserves.** Mental and
technical growth continue past `26` at a materially reduced rate; physical
growth closes at or before the current boundary. The curve stays a single
shared rule applied to every player carrying the same age and family facts.

This candidate extends growth past the control's window close, so it would
reopen the window for players the control calls closed. That is exactly why the
judgement age is frozen to the control's constants and never reads a candidate
curve: both arms are scored on the same population at the same moment. Later
growth under the candidate is reported as a separate fact and is visible in the
age-composition gates, where it counts against the candidate if it pushes the
elite rung older.

**The following is explicitly not admitted, and is recorded because it was
proposed and withdrawn during design:** extending the existing
family-blind curve past `26` as an undifferentiated scalar. It would raise the
peak age of the whole population and push scorer and creator age upward, which
is the exact direction Step 16J measured as failure (`30.30 / 30.13` mean age,
both red). A shape change that is only a later scalar is the forbidden generic
growth increase under another name.

## One File Holds Two Owners, And No Arm May Move Both

`player-aging-policy.ts` contains both halves of the age model, which makes a
combined correction look economical. It is refused, because the two halves are
different mechanisms with different effects:

| mechanism | what it does | which state it produces |
| --- | --- | --- |
| `remainingReachableRoom` | rewrites potential to `current + room(age)` every month, irreversibly, blind to opportunity | `ceiling_lost_before_realization` |
| `monthlyGrowthAgeMultiplier` | ends positive growth at `26`/`27`/`28` | `realization_under_viable_projection` |

A ceiling taken away and a ceiling never converted are not the same failure and
do not have the same remedy. `lossTiming` already splits the first by whether
compression arrived before or after sustained exposure.

**No arm changes both.** An arm that moves the growth curve *and* softens
compression explains nothing whether it passes or fails, because either half
could have carried the result. Sharing a source file is not sharing an owner.

## Pre-Registered Factorial For `MIXED`

**Pre-registered, not scheduled.** It opens only if L6.43B actually returns
`MIXED`. A clear owner opens that owner's branch alone: running the factorial
regardless would discard the reason the evaluator exists, which is to name the
mechanism before gameplay changes.

Two arms, crossed, one paired run:

- **arm S (supply/conversion)**: the family-aware development curve above, and
  **only** that curve. It does not touch `remainingReachableRoom`;
- **arm X (exit)**: the Step 16J role-aware aging-onset **policy**, restored
  from that step's removed candidate with its coefficients unchanged. Its
  acceptance readings are not restored with it; every cell in this factorial is
  judged by the gates above, which come from the canonical register.

If L6.43B names `ceiling_lost_before_realization`, the compression owner opens
instead, as its own single-owner branch under the same rules - never folded into
arm S.

Four cells: control, S only, X only, S+X. Same seven fresh seeds, fifteen
seasons, seven workers, one typed decision seam per arm.

The factorial exists because both single arms are already measured and both
failed alone. Its purpose is to test the interaction, not to re-measure the
main effects. The pre-registered reading is:

- if S+X passes every gate while S and X alone do not, the loop is confirmed
  coupled and S+X is adopted as one indivisible change;
- if no cell passes, the phase records that this loop cannot be corrected
  inside the current model and hands the redesign to a new phase. It does not
  retry coefficients.

## Frozen Paired Cohort

- fresh control and candidate arms on seven new seeds;
- fifteen seasons, exactly seven workers;
- identical players, calendars, competitions, AI, fixtures and market before
  the one typed candidate decision per arm;
- independent resumable caches and immutable manifests;
- all L6.43A pathway facts plus every integrated current-product gate;
- a `7 x 1` paired canary before the full run.

## Frozen GO Gates

All must pass.

Every success is measured at the frozen judgement age - `26` outfield, `27`
midfielder, `28` goalkeeper - never at a candidate's own window close. Growth
after that age may exist under a candidate and is reported, but it cannot
convert a failure into a success in any gate below.

**Succession**

1. `overall_matured_selected_conversion` is inside `0.20..0.50`, pooled. The
   band is frozen as a declared product hypothesis and does not move for any
   reading from L6.43B or from this step;
2. `frozen_failure_cohort_recovery_share` over the evaluable members of the
   frozen `173` is strictly positive and reported per world and pooled. It
   carries **no band**: that cohort was selected because it had already failed,
   so it cannot be held to a whole-population rate. Strict positivity binds
   **here, on a candidate seeking adoption**, and never on the L6.43B baseline,
   where a reading of zero is a valid measurement of the shipped product;
3. every evaluated world contains at least one selected current-16 success and
   at least one selected evaluable failure;
4. generated season-fifteen current-16 stock reaches opening-senior stock in
   `>=5/7` candidate worlds;
5. candidate generated current-16 stock exceeds control in `>=5/7` worlds;
6. `careerGeneratedLeaderShareSeasonTen` is `>=0.50`, read at its own season
   ten under its canonical definition.

**Age composition, from the canonical register verbatim**

Taken from `HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS` in
`apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`,
with the register's own formulas, units and cohort-aggregate populations. They
are not re-expressed as per-season requirements.

7. `scorerMeanAge` in `25.5..28.5` and `assistMeanAge` in `25.0..28.5`;
8. `age33PlusScorerShare` and `age33PlusAssistShare` each `<=0.12`;
9. `age33PlusStarts` in `12..17` and `age33PlusMinutes` in `1100..1500`, **per
   age-33-plus player**;
10. at least one real age-33-plus player remains in a scorer or creator top
    ten, so exceptional longevity stays possible.

The per-season profile from season six to fifteen is recorded as a named
diagnostic beside these gates, because a cohort aggregate can hide the
trajectory the shipped control shows. Whether that trajectory needs its own
gate is decided after the first L6.43B reading, by adding a new gate with its
own derivation - never by re-basing a canonical one.

**Integrity**

11. selected players remain below five-star current ability at intake and never
    exceed true potential or role hard caps;
12. candidate season-fifteen total current-16 stock never exceeds the opening
    stock in the same world;
13. six-star allocation IDs/counts remain paired-identical;
14. every existing tactical, formation, upset, league, workload, injury,
    transfer, finance, age and exceptional-veteran gate remains binding;
15. zero cache, pathway, projection, participation or population
    reconciliation failure.

Gates `7..10` are canonical register gates. They are not new thresholds and
they are not "reinstated" 16J candidate readings: Step 16J applied them to its
own candidate and removed them with it, but the register kept them. This step
makes them binding on the product arm. The shipped control already exceeds the
`0.12` share ceiling from season six onward. That is a pre-existing red, not a
regression introduced here, and a candidate that leaves the cohort aggregate
red cannot pass.

`0.20..0.50` is a band, not an optimization target. A value above `0.50` fails
because a successor stream where most prospects become elite is not credible.

## Decision

- **`GO`**: all gates pass. Adopt the one correction, or the indivisible S+X
  cell, and open Step 16N.
- **`REFINE`**: the owner moves materially and no unrelated regression occurs,
  but one primary successor gate remains red. Reopen only the chosen owner with
  every target unchanged.
- **`STOP_RETHINK`**: no coherent improvement in `5/7`, instant-star leakage,
  excess conversion, six-star drift, population inflation, age-composition
  regression, origin/assignment special casing or unrelated regression. Remove
  the candidate completely.
- **`STOP_INSTRUMENT`**: paired population, cache or reconciliation failure.
  Fix only measurement and repeat unchanged.

## Expected Files

**Not authorized until L6.43B completes.** At that point this section must name:

- the single production owner, or both factorial seams, and focused tests;
- the one typed analysis seam per arm and its removal owner;
- linked versioned content assets only when the demonstrated owner changes
  their trajectory;
- canonical simulation-report evaluator/profile/tests and five-language
  discovery labels;
- generated audit, audit index, this step, phase README, Step 16N and status.

No implementation begins while this list is conditional prose.

## Required Checks

- real-data reachability of the chosen rule in the direction every gate reads;
- product-default equivalence when the analysis arms are disabled;
- paired `7 x 1`, then fresh paired `7 x 15`, alone on exactly seven workers;
- byte-identical rebuild from completed canonical facts;
- CLI/web product identity and beta reset where version stamps change;
- Graphify, stale-symbol search, `git diff --check` and `pnpm check` alone.

## What NOT To Implement

- generic growth-cap increase;
- an undifferentiated later age curve;
- guaranteed stars or protected participation;
- direct current/potential clamp;
- selected-cohort or origin bonus;
- more than one owner outside the pre-registered factorial;
- a green report obtained by relaxing L6.43/L6.43A/16J targets;
- any Step 16N HTML before this checkpoint records `GO`.
