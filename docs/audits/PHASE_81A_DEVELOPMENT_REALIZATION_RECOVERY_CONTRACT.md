# Phase 81A Development-Realization Recovery Contract

## Status

**Active design contract after L6.43A, revised before Step 16M-B executes.**
Step 16M-B owns an observation-only fifteen-season mechanism replay. Step 16M-C
is blocked until that result names one owner. Step 16N remains the final
current-product JSON/HTML checkpoint.

The first version of this contract was written against a ten-season horizon and
a four-mechanism taxonomy. Both were corrected before any run, after a
read-only audit of the completed L6.43A artifact showed the ten-season cohort
cannot answer the question. The correction is recorded here rather than
silently applied; no threshold moved after seeing a new measurement, because no
new measurement exists.

## Thesis

The game needs uncertain, legible succession. A young player with real upside,
a credible club environment and sustained football should have a meaningful
chance to become a senior reference. He may still stall, move, lose his place
or fall short; failure is part of the football story. What is not credible is a
system in which a national stream of selected prospects produces no closed-
window current-16 player at all.

L6.43A traces `716` exact-five assignments. `424` have a closed academy window
and `292` are still open. Among the closed cohort:

- `173` reach senior use and at least `900` minutes but never current ability
  `16`;
- `124` do not reach senior registration;
- `88` register but make no senior appearance;
- `39` remain below `900` senior minutes;
- zero reach current `16`.

`development_realization` is the largest exclusive loss in `6/7` worlds,
owns `0.4080` of the closed cohort and leads the next owner by `0.1156`. This
authorizes investigation of the canonical potential-to-current path. It does
not yet prove which fact inside that path is wrong.

## The Ten-Season Horizon Is An Instrument Defect

Read-only audit of `phase81a-successor-pathway-l6-43a-paired-7x10.json`, hash
`41ceb57e7f472fd3bd5e314b83d7abe6`:

| fact | value |
| --- | --- |
| age at first senior season | `20` for `139/173`; max `24`; none `>=26` |
| cumulative senior minutes | p25 `2315`, p50 `3780`, p90 `8501`, max `15940` |
| senior minutes per observed season | p50 `1157`, p90 `1790` |
| age at season ten | mean `23.26`; `<=23` for `97/173`; `<=25` for `163/173` |
| observed senior seasons | `<=3` for `73/173` |
| growth window closed by season ten | `10/173`, per world `[4,3,1,0,1,0,1]` |

The classifier at
`stationary-age-succession-attribution.ts:1236` names
`development_realization` whenever a player passes `900` cumulative senior
minutes without reaching current `16` inside the observed horizon. At the ages
above, `monthlyGrowthAgeMultiplier(...)` is still positive
(`player-development-policy.ts:100`). The category therefore mixes two
different populations: players whose development finished below `16`, and
players whose development had not finished at all.

This is right-censoring, not a development failure. Naming an owner on the
censored population, and correcting a shared engine rule from it, would
calibrate a population-wide change on unfinished careers.

The growth window does not close at the same age for everyone.
`monthlyGrowthAgeMultiplier` (`player-development-policy.ts:91`) returns its
first zero at age `26` for non-midfield outfield players, `27` for midfielders
and `28` for goalkeepers. Maturity must be evaluated per group, never at a
single age.

Applying the real policy at a fifteen-season horizon:

| | value |
| --- | --- |
| evaluable | `164/173`, per world `[21,16,21,25,21,30,30]` |
| still censored | `9/173`: `2` goalkeepers, `7` midfielders |

Two consequences follow, and both are frozen here:

- the L6.43B horizon is **fifteen seasons**, not ten. `164` evaluable players
  with a minimum of `16` per world clears the power floor below; the remaining
  `9` stay in the censored state rather than justifying a seventeen-season run;
- no owner may be named from a censored player, under any mechanism.

## The Loop Is Coupled: Supply And Exit Are One Defect

The same L6.43A artifact shows the exit end of the loop, in the shipped
control, First Division top-ten membership:

| season | scorer age-33-plus | creator age-33-plus | age-30-plus combined | age `25..29` share |
| ---: | ---: | ---: | ---: | ---: |
| 1 | `0.029` | `0.043` | `0.114` | `0.679` |
| 3 | `0.014` | `0.071` | `0.329` | `0.643` |
| 6 | `0.243` | `0.329` | `0.586` | `0.329` |
| 8 | `0.200` | `0.343` | `0.636` | `0.150` |
| 10 | `0.329` | `0.257` | `0.479` | `0.179` |

Step 16J froze `scorer and creator age-33-plus shares are each <= 0.12`. The
shipped product exceeds that ceiling by two to three times from season six
onward. The gate was written for 16J's candidate and removed with it on
`STOP_RETHINK`, so the target exists, is red, and is currently unwatched. Step
16M-C reinstates it as a product gate.

The `25..29` collapse identifies the shape: this is not gradual aging, it is
the opening cohort sliding intact through `25..29`, `30..32` and `33+`. Nobody
new arrives at the elite rung and nobody leaves it early enough to matter.

Four corrections have been attempted on this loop, each isolating one owner:

| step | isolated owner | result |
| --- | --- | --- |
| 06B7F / 06B7G4 | potential-room realization rate | parity reached, elite supply unchanged |
| 16G | premature potential compression | `STOP_RETHINK`; successor tail fell, leaderboards aged |
| 16J | late-career aging onset | `STOP_RETHINK`; opening stock `91 -> 98`, generated `15 -> 10` |
| 16L / 16M | five-star ceiling supply | `STOP_RETHINK`; conversion `0/7` worlds |

16L raised supply while exit held and the supply never reached the rung. 16J
accelerated exit while supply held and the vacated rung refilled from the same
opening cohort, making succession worse. Any correction adopted from L6.43B
must therefore be gated on both ends simultaneously, and `MIXED` opens a
pre-registered factorial rather than a fifth isolated attempt.

## The `900`-Minute Gate Keeps Its Real Job

`900` cumulative senior minutes correctly separates the `39` players who never
received enough senior football from the rest. It is retained unchanged as that
guardrail.

It is not retained as the opportunity discriminant. `900` is a career-cumulative
bar that the median player in this cohort passes inside his first senior
season, so crossing it certifies that opportunity began, never that opportunity
was sufficient or timely. The discriminant is cumulative monthly exposure,
defined below.

## Why Another Generic Growth Increase Is Forbidden

The canonical owner is already `developPlayersFromParticipationRows(...)`.
Positive growth derives from age, real minutes, performance, club environment,
deterministic variance, role relevance and remaining potential. True potential
and role hard caps remain final ceilings.

This phase already changed `MAX_SINGLE_MONTH_GROWTH` from `0.08` to `0.18` and
then `0.27`, and removed the duplicate multiplication by remaining room. The
fresh L6.43A result was measured with that current implementation. Raising the
same scalar again would repeat a rejected class of remedy and could inflate the
entire player population to make one selected cohort pass.

Reshaping the age or opportunity curve as an undifferentiated scalar is the
same remedy under another name and is forbidden on the same grounds. A shape
change is admissible only when it is conditioned on a football fact the engine
already models elsewhere, and only when it applies to every player carrying
that fact.

No engine rule may read `career-generated`, `successor assignment`, a report
cohort or an expected future club need. Any adopted development rule must apply
to every player with the same football facts.

## Cumulative Development Exposure

The frozen opportunity measure is

```
exposure = sum over observed months of ( ageMultiplier * opportunityMultiplier )
```

with both factors taken from the canonical `monthlyDevelopmentPolicy(...)`
return value for that exact player-month. The evaluator calls that policy with
the retained participation row; it never restates age bands or minute bands.

The denominator is **available** exposure, not lifetime exposure. A player
assigned at `18` was not observed at `16` and `17`, and those unobserved months
must not be charged to him as lost opportunity. The frozen ratio is therefore

```
exposureShare = observed exposure / maximum exposure available
                from the player's first eligible development month
                to the group's window close
```

with the maximum computed by summing the same policy's `ageMultiplier` at
`opportunityMultiplier = 1` over every month in that range **in which a
development checkpoint actually ran**. Window close is per group: age `26` for
non-midfield outfield, `27` for midfielders, `28` for goalkeepers.

Two things in that sentence are corrections, and both were made before any
L6.43B evaluator existed rather than after seeing one.

**The anchor is the first eligible development month, not the assignment
month.** Intake runs after the season's monthly lifecycle, so the assignment
month names a checkpoint already past. Anchoring there would charge a player
for months in which no development was possible for him.

**The month basis is the lifecycle's own record, not the calendar.** An earlier
draft of this section computed the denominator as `12` months a year and gave
`12 * (0.25 + 4*0.85 + 3*0.65 + 2*0.35) = 75.6` outfield, `78.0` midfield and
`79.2` goalkeeper. That arithmetic assumed every calendar month carries a
development checkpoint. It does not. A development batch is selected from
participation rows, and a month with no participation row anywhere closes no
checkpoint at all.

Measured on a real two-season world through the intake, lifecycle and
participation-ledger path (`phase81a-l6-43b-observation-world-00001`, one world,
seasons one and two, ten five-star assignments): the lifecycle closed
`2026-08 .. 2027-03` and `2027-08 .. 2028-03`. **Eight development months per
season, not twelve**; April to July close nothing. Every one of the ten
assignees produced exactly one row in each of the eight months following his
boundary, `80` rows with no remainder.

Under the withdrawn calendar denominator a player with maximum opportunity in
every real month would have scored `8/12 = 0.667`, so the frozen `0.50`
insufficiency threshold would have meant "below three quarters of the
opportunity that existed" rather than "below half the development career
available to him". `sustained_opportunity_insufficient` would have absorbed
players who were never denied anything, which is the failure this contract most
needs to avoid, because that category selects a Step 16M-C branch.

The `0.50` fraction is unchanged and stays frozen. What changed is the
denominator it divides, which now counts only months development could happen
in - exactly what the word *available* was always asserting. The corrected
illustration for a player assigned at `16` and observed to window close, at
eight checkpoints a year, is `8 * 6.30 = 50.4` outfield, `8 * 6.50 = 52.0`
midfield and `8 * 6.60 = 52.8` goalkeeper. These remain illustrations: the
implementation never multiplies by a months-per-year constant. It reads the
closed-checkpoint list the engine reports for that world and intersects it with
the player's own range, so a world whose calendar differs is measured on its own
calendar.

Opportunity is **materially insufficient** below `exposureShare = 0.50`. The
fraction is the single free parameter in this contract. It is frozen at `0.50`
before any L6.43B run, on the stated ground that below half of the development
career actually available to him, a player did not receive a development career
at all. It is not tuned afterwards, and no result may move it.

## One File, Two Mechanisms, Two Owners

`player-aging-policy.ts` holds both halves of the age model, and reading them
together makes a combined correction tempting. It is refused.

- `remainingReachableRoom` rewrites stored potential every month to
  `max(current, min(previousPotential, current + room(age)))`. It is a ratchet:
  a ceiling once compressed never returns. This mechanism can **take a ceiling
  away before it is realized**, and it is opportunity-blind - it charges a
  player for time he may never have been given.
- `monthlyGrowthAgeMultiplier` ends positive growth at `26` outfield, `27`
  midfield, `28` goalkeeper. This mechanism can **prevent realization while the
  ceiling is still valid**.

Same file, same constants table, two different causes with two different
effects, and the taxonomy already separates them: a compressed ceiling lands in
`ceiling_lost_before_realization`, an unconverted viable one in
`realization_under_viable_projection`, and `lossTiming` splits the first by
whether the compression arrived before or after sustained exposure.

**No candidate arm may change both at once.** An arm that moves the growth curve
*and* softens compression tells us nothing when it passes and nothing when it
fails, because either half could have carried the result. That is precisely the
mistake four previous single-owner attempts were designed to avoid, arriving
this time disguised as thoroughness.

## The Judgement Point Must Not Depend On The Candidate Curve

Step 16M-B decides censoring from the current growth curve. A Step 16M-C
candidate that extends technical and mental growth past `26` would reopen the
window for players the control calls closed, so the two arms would evaluate
different populations and the paired comparison would be void.

The outcome term is therefore frozen independently of any candidate curve. A
selected player is judged at his **control window-close age** - `26` outfield,
`27` midfielder, `28` goalkeeper - and the question is whether he reached
current `16` at or before that age. Growth after that age may still exist under
a candidate and is reported, but it can never move the moment of judgement and
never converts a failure into a success.

Censoring in L6.43B uses the same constants, so a player is censored exactly
when the horizon ends before his control judgement age.

**Freezing the age is not enough; the curve itself must be frozen.** The
evaluator's first implementation read `monthlyGrowthAgeMultiplier` at runtime to
derive the judgement age, to decide which months enter the growth window, and to
weight the exposure denominator. All three would then have moved with a
candidate that reshapes growth, and the arms would have been scored on different
instruments while appearing to share one.

The evaluator therefore holds a **frozen snapshot** of the control curve and
reads nothing else for judgement, window or denominator - the runtime policy is
not even imported. The numerator is priced the same way: opportunity comes from
the canonical policy recomposed from the retained facts, so no minute band is
restated, but the age weight comes from the frozen curve. A candidate that pays
more at an age must not thereby award itself more exposure against a control
denominator.

A test binds the snapshot to the shipped curve age by age, so it cannot be a
transcription error. **When a candidate diverges that test is expected to
fail**, and the failure is the intended signal: it is answered by asserting the
divergence, never by editing the snapshot to follow the candidate.

The exposure price of a month is the header's birth date, never an age a row
restates about itself. A fixture whose rows all claim twenty-one while the
player ages from twenty to twenty-five produces the control exposure unchanged;
pricing from the row's own policy instead fails that test today, so the
protection is measured rather than asserted.

## Per-Bucket Realization Margin

Growth is applied per attribute in proportion to role relevance, which takes
exactly four values: `1`, `0.35`, `0.08`, `0.02`
(`ROLE_ATTRIBUTE_WEIGHTS` in `player-role-profile.ts`). Current and potential
ability are then measured as weighted averages over the same weights
(`roleCurrentAbility` / `rolePotentialAbility`).

The aggregate role-weighted margin therefore cannot show where growth stops. A
player whose core attributes reached potential while his secondary attributes
did not, and a player whose ceiling was simply low, produce the same aggregate.
Distinguishing `expected_ceiling_below_16_at_intake` from
`realization_under_viable_projection` is the entire purpose of Step 16M-B, and
the aggregate cannot do it.

Every observed boundary therefore records current and potential split by
`coreForRole`, `secondaryForRole`, `allowedButLow` and `cappedOutOfRole`.

## Step 16M-B - Evaluability Before Mechanism

Every player in the frozen decision population receives exactly one ordered
state. Evaluability is resolved before any mechanism is considered:

1. `expected_ceiling_below_16_at_intake` - stored ceiling is five-star but the
   assignment-time p50 is below current ability `16`;
2. `ceiling_lost_before_realization` - assignment p50 is at least `16`, but
   canonical role potential falls below `16` at any month before the judgement
   age. The exact loss month is recorded, together with a required
   `lossTiming` fact of `before_sustained_exposure` or
   `after_sustained_exposure`, measured against `exposureShare = 0.50`;
3. `right_censored_at_horizon` - the horizon ends before the player's control
   judgement age. Not a failure, never an owner, and excluded from every owner
   denominator;
4. `sustained_opportunity_insufficient` - judgement age reached, potential
   never lost, but `exposureShare` at judgement is below `0.50`;
5. `realization_under_viable_projection` - p50 at least `16` at assignment,
   role potential at least `16` at every month through the judgement age,
   `exposureShare` at or above `0.50`, judgement age reached, yet current `16`
   never reached;
6. `instrument_failure` - missing boundary, contradictory projection,
   duplicated ID or impossible non-monotone participation.

State `2` deliberately spans the whole pre-judgement career rather than only
the pre-exposure part. A potential that stays viable past sustained exposure
and is then compressed before the judgement age is a real football outcome and
a real row; under a narrower definition it would fall through every state while
being neither censored nor an instrument failure. `lossTiming` keeps that
distinction visible without splitting one dated-potential owner into two
competing categories.

The ordered vocabulary is versioned before reading the output. States are
exclusive and must reconcile to the full frozen population.

`sustained_opportunity_insufficient` replaces the withdrawn
`opportunity_after_growth_window`. The withdrawn definition required `900`
minutes to arrive while the age multiplier was zero. That is not impossible in
principle, but it is unreachable in this cohort: no selected player debuts at
`>=26` and the median passes `900` in his first senior season. Retaining it as
a possible owner would have guaranteed an empty category, and removing it after
seeing the output would have edited a frozen taxonomy post hoc.

## The Baseline Checkpoint Is Evaluated At Its Own Season Ten

The frozen decision population is "the `173` players classified
`development_realization` by the frozen L6.43A evaluator **at its season-ten
boundary**". That evaluator is not horizon-agnostic, and reading its code rather
than its description shows how strongly: it refuses any run whose season count
is not exactly ten, expects `11 - assignmentSeason` season boundaries per
player, and reads season ten by name for First-Division retention and leader
membership.

Run unchanged at fifteen seasons it therefore returns `STOP_INSTRUMENT` before
evaluating anything, and a `7 x 15` would have bought that answer at full price.

L6.43B reuses it **verbatim by bounding its inputs to seasons `1..10`**,
whatever the horizon: assignments, season boundaries, owner player-seasons and
intake seasons are all truncated at ten before the evaluator sees them. At ten
seasons the truncation is a no-op, which is what makes the `7 x 10` replay's
byte-identity the proof that nothing moved. At fifteen it is what keeps the
population identical instead of silently growing by five intake classes.

Bounding is not a relaxation of the ten-season requirement. It is the only way
to satisfy it from a longer run: the alternative is not "verbatim", it is a
different cohort wearing the same name.

## A Member Of The Frozen Cohort May Recover, And That Is Not A Loss State

The `173` never reached current `16` **within ten seasons**. Nothing prevents
one of them reaching it in seasons `11..15` and still before his judgement age.
Such a player satisfies none of the six states: he is not censored, his ceiling
did not disappear, his opportunity was sufficient, and
`realization_under_viable_projection` requires that current `16` was never
reached.

He is not a failure, and he is counted the way this contract already counts the
other non-failure. He resolves to **`recovered_before_judgement`**: reported per
world and pooled, excluded from every owner denominator on exactly the ground
that excludes `right_censored_at_horizon`, and entering no loss state.

`recovered_before_judgement` is an **outcome, not a seventh loss state.** The six
loss states remain frozen and exclusive; the two non-failure outcomes sit beside
them. Every member of the frozen cohort resolves exactly once, to one of the six
loss states, to `right_censored_at_horizon`, or to
`recovered_before_judgement`. That is the reconciliation identity, and any player
resolving to none or to more than one is `instrument_failure`.

Its pooled count is the numerator of `frozen_failure_cohort_recovery_share`,
which this contract already defines.

**A baseline reading of zero is a valid result, not a failure.** In the control
arm the share is expected to be zero or near it - L6.43A measured zero of `716`
reaching current `16` in ten seasons - and zero is a measurement about the
shipped product, reported as such. Strict positivity is required only of a
**candidate seeking adoption** in Step 16M-C, where it means the correction
actually recovered somebody. Reading the candidate requirement back onto the
baseline would turn a diagnostic into a gate the control cannot pass and never
had to.

## Owner Rule

The owner denominator is the **evaluable** population: frozen-population players
excluding both `right_censored_at_horizon` and `recovered_before_judgement`.
Neither is a failure, so neither may name the owner of a failure, and neither is
redistributed across the loss states. Both are reported in full, with counts per
world.

One owner is named only when a state is the largest evaluable category in at
least `5/7` worlds, owns at least `0.20` of the pooled evaluable population and
leads the second state by at least `0.05`.

- fewer than `10` evaluable players in any world, or fewer than `100` pooled,
  is `UNDERPOWERED`. The required response is a longer horizon, never a
  correction. The fifteen-season projection is `164` pooled with a per-world
  minimum of `16`, so the floor is expected to clear; it is stated as a rule,
  not as a prediction;
- facts reconcile but no state meets the rule: `MIXED`;
- any instrument failure: `STOP_INSTRUMENT`.

## Step 16M-C - Conditional Product Correction

Only the L6.43B owner may open a product change:

- `expected_ceiling_below_16_at_intake`: change the one successor allocation
  contract to count credible expected senior ceiling, not merely an upper-tail
  stored ceiling. Keep aptitude and outcome uncertainty; never set current
  ability or guarantee one prospect per club.
- `ceiling_lost_before_realization`: correct only the owner that makes a dated
  viable projection disappear before the judgement age. The pooled `lossTiming`
  split selects which owner that is - `before_sustained_exposure` points at the
  projection/ceiling policy, `after_sustained_exposure` at
  `remainingReachableRoom` compression - and is read once, before the branch is
  written. Do not remove aging or clamp potential after the fact.
- `sustained_opportunity_insufficient`: correct only the academy-to-senior
  progression that determines how much football a credible prospect receives
  inside his growth window. Do not award protected appearances, synthetic
  minutes or a selected-cohort bonus.
- `realization_under_viable_projection`: reshape the shared canonical
  age/opportunity/potential conversion, under the pre-registered branch frozen
  in Step 16M-C. Do not raise the global monthly cap and do not read player
  origin or assignment status.
- `MIXED`: no product correction. Pre-register a factorial that separates the
  tied states.
- `UNDERPOWERED`: no product correction. Extend the horizon and repeat.

The chosen branch, exact formula and reachability thresholds are written into
Step 16M-C before implementation. A branch cannot be substituted after seeing
its output.

## Frozen Outcome Bands

The correction must make succession possible without making it automatic.

### Two Different Quantities

The superseded derivation divided `71` season-ten opening current-16 survivors
by `424` closed academy windows and read `0.1675` as the replacement need.
Those quantities are not comparable: `71` is a stock at one instant and `424`
is a flow over ten seasons. On the evaluable population the same ratio gives
`71/31 = 2.29` at ten seasons and `71/142 = 0.50` at twelve, which is the
ceiling this contract declares not credible. The ratio is withdrawn.

Two distinct measures replace it, and they are never conflated:

- **`overall_matured_selected_conversion`** - of all selected assignments that
  reach their judgement age inside the horizon, the share reaching current
  `16`. This is a national supply rate, and it is the only measure the
  `0.20..0.50` band reads.
- **`frozen_failure_cohort_recovery_share`** - of the evaluable members of the
  frozen `173`, the share resolving to `recovered_before_judgement`. This is a
  recovery diagnostic on a cohort selected *because* it had already failed, so
  it is conditioned on failure and its natural value is far below the national
  rate. It is reported per world and pooled and carries **no band**.

  It is measured on the **baseline** too, where a reading of zero is a valid
  result about the shipped product rather than a failed gate. Strict positivity
  is required only of a candidate seeking adoption, where it is the difference
  between a correction that recovered somebody and one that merely moved
  numbers.

Reading the national band against the frozen failure cohort would demand that a
population selected for failure converts at the rate of the whole population.
That is not the same claim, and no gate may make it.

### The Band Is A Frozen Product Hypothesis, Not A Derivation

`0.20..0.50` is **frozen now and does not move after any run.**

An earlier draft derived a `0.21` floor from an assumed "approximately eight
seasons" of mean elite tenure. That was a product assumption presented as
arithmetic and it is withdrawn. A later draft replaced it with a measurement of
tenure taken from L6.43B, and declared the band provisional until that reading
existed. That is also withdrawn, for two reasons:

- **the measurement is censored the same way the cohort was.** Many players
  holding current `16` at season fifteen are still holding it when the horizon
  ends, so their spells are open. A mean over observed spells systematically
  understates true tenure, and a floor derived from it would be
  systematically too high. Correcting one censoring defect with a statistic
  carrying the same defect is not a correction;
- **half the band is not derivable at all.** The `0.50` ceiling encodes a
  design claim - that a successor stream where most prospects become elite is
  not credible football - and no measurement of tenure, stock or flow can
  produce it.

A band that is half design judgement and wholly uncertain in its inputs is
frozen as a declared hypothesis, not chased with a calculation. "The band moves
if the result puts the requirement outside it" is exactly the practice every
other threshold in this phase is protected against, and it is not granted here.

Both bounds are therefore product decisions of record:

- `0.20` - a floor set above the range that any plausible replacement
  arithmetic produced during design, so a passing candidate cannot leave the
  elite population shrinking;
- `0.50` - a ceiling that keeps failure the majority outcome for a selected
  prospect.

**A band failure is a verdict, never a recalibration.** A candidate landing
below `0.20` or above `0.50` returns `REFINE` or `STOP_RETHINK` under the
normal decision rules. It may not return a moved band, a re-derived floor, a
re-scoped denominator or a "the band was wrong" note. This is what makes the
checkpoint falsifiable: a threshold that can be revised by the output it judges
decides nothing.

If a future phase concludes the band is conceptually wrong, that opens a new
contract and a new phase. It needs a censoring-aware tenure estimator and its
own preregistered calibration step, completed and frozen **before** any
candidate runs. That step does not exist, Step 16M-B does not begin it, and
Step 16M-C does not create it.

The paired candidate must satisfy all of these:

- `overall_matured_selected_conversion` inside the frozen `0.20..0.50` band,
  pooled;
- `frozen_failure_cohort_recovery_share` strictly positive, reported without a
  band;
- at least one selected success and one selected evaluable failure in every
  evaluated world;
- generated season-ten current-16 stock reaches opening-senior stock in
  `>=5/7` worlds;
- generated current-16 stock exceeds paired control in `>=5/7` worlds;
- pooled career-generated scorer/creator leader share is `>=0.50`;
- no instant five-star senior at intake and no total current-16 inflation above
  the opening world;
- six-star rarity/allocation identity, all existing football/economy/tactical
  gates and the exceptional-veteran reachability gate remain unchanged;
- the canonical age-composition gates, unchanged in formula, unit and
  population, from `HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS` in
  `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`.

### Age Composition Uses The Canonical Register Verbatim

| register key | band | population and unit |
| --- | --- | --- |
| `scorerMeanAge` | `25.5..28.5` | First-Division top-ten scorers, cohort aggregate |
| `assistMeanAge` | `25.0..28.5` | First-Division top-ten creators, cohort aggregate |
| `age33PlusScorerShare` | `0..0.12` | cohort aggregate |
| `age33PlusAssistShare` | `0..0.12` | cohort aggregate |
| `age33PlusStarts` | `12..17` | **per age-33-plus player**, not per world-season |
| `age33PlusMinutes` | `1100..1500` | **per age-33-plus player**, not per world-season |

These are the existing gates and they are reused exactly: aggregate over the
cohort, in the register's own units, not re-expressed as a per-season
requirement. An earlier draft of this contract restated `assistMeanAge` as
`25.5`, converted starts and minutes to a world-season basis, and required the
bands to hold in every season from six onward. All three were unintended
changes to frozen gates and are withdrawn.

The per-season profile from season six to fifteen is recorded as a **named
diagnostic**, not a gate. It exists because the shipped control shows
age-33-plus top-ten share rising to `0.243` scorer and `0.329` creator by
season six while the `25..29` band falls from `0.679` to `0.164`, and a cohort
aggregate can hide that trajectory. Whether the trajectory needs its own gate
is decided after the first L6.43B reading, by adding a new gate with its own
derivation - never by relabelling a canonical one.

`careerGeneratedLeaderShareSeasonTen` reads season ten by name. At a fifteen-
season horizon it is evaluated at its own season ten, unchanged, and the
season-fifteen value is reported beside it as a separate diagnostic.

The canonical age-composition gates are already red in the shipped product from
season six onward. That is a pre-existing failure, not a regression introduced
by a candidate, and a candidate that leaves the aggregate red cannot pass.

The `0.20` floor sits just below the restated replacement need. The `0.50`
ceiling guarantees that failure remains the majority outcome; it is not a
target to maximize.

## Execution And Clean-Code Contract

- `pnpm cli simulation-report` remains the only report entrypoint;
- every locked run uses exactly seven workers;
- L6.43B uses the exact L6.43A seeds over fifteen seasons. A fifteen-season
  report cannot share a ten-season report's hash, and requiring "all world
  hashes equal" was an unrealisable earlier draft. Continuity is instead a
  `seasonTenPrefixHash`: a hash over the canonical season-`1..10` facts only,
  computed identically by both runs and compared directly. The `716`
  assignments, `424/292` windows, exclusive terminal counts, named owner and
  six-star first-divergence facts are compared as values beside it. Any
  mismatch is `STOP_INSTRUMENT`;
- L6.43C uses fresh paired control/candidate worlds and independent caches;
- product and analysis arms differ at one typed decision seam;
- any analysis flag, rejected branch, superseded profile, fixture and i18n key
  is removed by Step 16N;
- CLI and web use the same product default;
- Graphify, byte-identical rebuild, `git diff --check` and `pnpm check` are
  mandatory.

## What Must Not Be Implemented

- another global growth-cap increase;
- an undifferentiated age- or opportunity-curve rescale;
- direct current/potential clamps or post-generation repair;
- origin-, assignment- or club-need-based development bonuses;
- guaranteed stars, protected lineups or synthetic participation;
- a second development formula in a report;
- a second report command;
- an owner named from a censored player;
- threshold relaxation after output.
