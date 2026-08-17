# L6.43B Preflight Findings — For Independent Review

## What This Document Is

A self-contained record of findings established **before** Checkpoint L6.43B
runs, written so a reviewer without repository access can check the reasoning
and tell us where it is wrong.

Every number below is either read from a completed simulation artifact or
produced by a reproducible experiment described in place. Nothing here is a
simulation result of L6.43B itself, which has not run.

**What we want from a reviewer:** challenge the inferences, not the arithmetic.
Each section ends with what would falsify it.

---

## Background: The System And The Question

The project is a deterministic football-management simulation. Player ability
is 25 attributes on a 1–20 scale. A player has a *current* value and a
*potential* value per attribute.

A player's headline quality is a **role-weighted average**: each role assigns
every attribute a relevance weight from `{1, 0.35, 0.08, 0.02}`, and current
ability is `Σ(weight × current) / Σ(weight)`. "Elite" is defined as this
weighted average reaching **16**.

Monthly growth per attribute is

```
delta = 0.27 × ageMultiplier × opportunityMultiplier × performanceModifier
             × environmentMultiplier × relevance × variance
```

capped by remaining room to (hard-capped) potential. Growth is therefore
**proportional to the same weight** used to measure the result.

Age multipliers (outfield, non-midfield): `16 → 0.25`, `17–20 → 0.85`,
`21–23 → 0.65`, `24–25 → 0.35`, `26+ → 0`. Midfielders additionally get `0.2`
at 26. Goalkeepers run on a separate curve to 27.

**The product problem.** A prior checkpoint (L6.43A) ran 7 worlds × 10 seasons
and tracked 716 elite-ceiling youth prospects deliberately injected into the
world. Of the 424 whose academy window closed, **zero** ever reached current
ability 16. The largest single category — 173 players — reached senior
football and at least 900 career minutes but never reached 16. That category
was named `development_realization` and a follow-up step (L6.43B) was designed
to find out which mechanism inside it is at fault.

---

## Finding 1 — Most Of The Ten-Season Cohort Is Not Yet Judgeable

**Claim.** At the ten-season horizon most of the 173 are still inside a
positive-growth age window, so the measurement ended before their development
window closed.

**This does not say they are not failures.** Some may already have exhausted
their reachable potential margin at 22 and would fail at any horizon. The
claim is only that the ten-season horizon cannot tell the two apart, so the
category as measured cannot support naming an owner. Which of the two each
player is, is exactly what the per-bucket margin observation in L6.43B exists
to establish.

**Evidence**, read directly from the completed L6.43A artifact
(hash `41ceb57e7f472fd3bd5e314b83d7abe6`):

| fact | value |
| --- | --- |
| mean age at season 10 | `23.26` |
| age ≤ 23 at season 10 | `97 / 173` |
| age ≤ 25 at season 10 | `163 / 173` |
| observed senior seasons ≤ 3 | `73 / 173` |
| growth window actually closed by season 10 | `10 / 173` |
| per-world distribution of those 10 | `[4, 3, 1, 0, 1, 0, 1]` |

The classifier assigns `development_realization` to any player who passed 900
cumulative senior minutes without reaching current 16 *within the observed
horizon*. At the ages above, the growth multiplier is still positive. The
category therefore mixes "finished below 16" with "not finished".

**Consequence for the owner rule.** The step's attribution rule requires a
category to be the largest in ≥5 of 7 worlds. With 10 mature players spread
`[4,3,1,0,1,0,1]` — two worlds empty — no such rule can be satisfied. Running
the step as originally designed would have consumed a full 7×10 simulation to
produce a foregone `UNDERPOWERED`.

**Why the horizon was set to 15.** Maturity must be evaluated per position
group, because the growth window closes at different ages: 26 for non-midfield
outfield, 27 for midfielders, 28 for goalkeepers. Applying the real policy:

| horizon | evaluable | censored | per world |
| --- | --- | --- | --- |
| 10 seasons | `10 / 173` | `163` | `[4,3,1,0,1,0,1]` |
| 15 seasons | `164 / 173` | `9` | `[21,16,21,25,21,30,30]` |
| 17 seasons | `173 / 173` | `0` | `[21,16,23,27,25,30,31]` |

15 seasons was chosen over 17: 164 evaluable with a per-world minimum of 16
clears the power floor, and the 9 who remain censored (2 goalkeepers, 7
midfielders — exactly the late-closing groups) stay in an explicit censored
category rather than justifying a 13% longer run.

**What would falsify this.** Evidence that the growth multiplier is effectively
zero for these players well before their nominal window close — for example if
their remaining potential room is already exhausted at 22. That is precisely
what L6.43B's per-bucket margin observation is designed to measure, and it
could overturn this finding.

---

## Finding 2 — Preliminary Evidence That Season Count Does Not Leak

**Claim, and its exact scope.** Within the first two seasons, changing the
requested season count changes nothing. This is **preliminary evidence**, not a
general proof that a 15-season run reproduces a 10-season run. A rule that
activates only at a longer horizon — a contract, ageing or lifecycle boundary
after season 3 — would be invisible to this experiment.

The general claim is settled only by the 7×10 continuity replay, which is a
required gate before the 7×15 run and is not yet done.

**Why it was in doubt.** World seeds are `${seedPrefix}-world-${index}` with no
season count, but that only rules out seed contamination. Any AI or planner
that reads "seasons remaining" would still make the runs diverge.

**Experiment.** Two runs on the same seed prefix, 2 worlds, identical settings,
differing only in season count (2 vs 3). Every object carrying a
`seasonNumber ≤ 2` was extracted from both reports and compared as a unit.

```
season-1–2 rows collected:  226  vs  226
divergent rows:               0
```

**Result: zero divergence over the range tested.**

**Secondary finding.** A whole-report comparison *does* differ, because
cumulative counters legitimately span the full horizon — total transfers read
`102` in the 2-season run and `131` in the 3-season run. The continuity check
must therefore hash **season-indexed rows only**, not whole report subtrees.
An earlier draft of the step required "all world hashes equal", which is
unachievable and would have produced a false `STOP_INSTRUMENT`.

**What would falsify this.** The 7×10 continuity replay failing to reproduce
L6.43A's season-1–10 prefix hash. Until that replay runs, this finding
justifies proceeding with the design; it does not license skipping the gate.

---

## Finding 3 — Growth Is Relevance-Proportional But Quality Is A Weighted Mean

**Claim.** Because per-attribute growth is multiplied by the same relevance
weight used to average the result, low-relevance attributes converge toward
their potential far more slowly than core attributes, while still occupying
denominator weight.

Relevance takes four values: `1`, `0.35`, `0.08`, `0.02`. A `0.08`-relevance
attribute therefore grows at one twelfth the rate of a core attribute, and a
`0.02` attribute at one fiftieth, toward the same target.

**Consequence.** The aggregate role-weighted margin between current and
potential cannot distinguish two very different failures:

- a player whose ceiling was simply too low; and
- a player with an adequate ceiling whose non-core attributes could never
  converge in a career.

These are the two mechanisms L6.43B must tell apart, and the aggregate the
existing report records cannot do it. This is why the step now records current
and potential **split by relevance bucket** at each boundary.

**Status: this is a mechanism hypothesis, not a measured result.** An
exploratory simulation of the production formula suggested the gap is
significant under a flat potential profile but largely disappears when
potential is shaped the way the generator actually shapes it. The exploratory
model was too crude to settle it — which is the reason the real measurement
was added rather than the conclusion assumed.

**What would falsify this.** L6.43B showing core, secondary and low-relevance
buckets all at or near their effective potential at the judgement age. Then the
ceiling, not the conversion, is the constraint.

---

## Finding 4 — Hard Caps Bound Growth, They Do Not Clamp Values

**Claim.** A role's hard cap on an out-of-role attribute limits how far that
attribute may *grow*; it does not lower a value the player was generated with.

Discovered while asserting an invariant that turned out to be false: a
`cappedOutOfRole` attribute can legitimately hold a current value **above** its
effective potential. The growth loop computes
`room = min(potential, hardCap) − current` and skips the attribute when room is
non-positive; it never writes the value down.

**Why it matters for the diagnostic.** A per-bucket margin of zero or negative
in the capped bucket is normal and is not evidence of a lost ceiling. Any rule
that reads "potential below current" as ceiling loss would misclassify these
players. The L6.43B classifier must read dated role-weighted potential, not
per-attribute sign.

**What would falsify this.** Nothing — this is a direct reading of the
production code path, confirmed by a failing test assertion that encoded the
opposite invariant.

---

## Finding 5 — The Exit End Of The Loop Is Already Failing A Frozen Target

**Claim.** The succession problem and an age-composition problem are the same
defect observed at two ends, and the age target is already red in the shipped
product.

The project's canonical target register freezes, for the First Division:

```
scorerMeanAge            25.5 .. 28.5
assistMeanAge            25.0 .. 28.5
age33PlusScorerShare     0 .. 0.12
age33PlusAssistShare     0 .. 0.12
```

Measured on the shipped control arm of L6.43A:

| season | scorer 33+ share | creator 33+ share | age 30+ combined | age 25–29 share |
| ---: | ---: | ---: | ---: | ---: |
| 1 | `0.029` | `0.043` | `0.114` | `0.679` |
| 3 | `0.014` | `0.071` | `0.329` | `0.643` |
| 6 | `0.243` | `0.329` | `0.586` | `0.329` |
| 8 | `0.200` | `0.343` | `0.636` | `0.150` |
| 10 | `0.329` | `0.257` | `0.479` | `0.179` |

From season 6 the 33+ share runs 2–3× over the frozen `0.12` ceiling. The
target was applied to a candidate in an earlier step, that candidate was
rejected, and the target was removed along with it — so it exists, is red, and
is currently unwatched.

**The shape.** The `25–29` band collapsing from `0.679` to `0.150` while `30–32`
and then `33+` rise is not gradual ageing; it is the opening cohort moving
through the age bands intact. Nobody new reaches the elite rung — consistent
with zero of 716 prospects reaching 16 — and nobody leaves it early enough to
create vacancy.

**Why this constrains the remedy.** Two candidate fixes are already falsified
in isolation:

| attempted fix | isolated owner | measured result |
| --- | --- | --- |
| raise prospect ceiling supply | supply | conversion `0/7` worlds; rejected |
| bring ageing decline forward | exit | opening elite stock `91 → 98`, generated `15 → 10`; rejected |

Raising supply while exit holds means the new supply never reaches the rung;
accelerating exit while supply holds means the vacated rung refills from the
same opening cohort. Any adopted correction must be gated on both ends
simultaneously.

**Note on a withdrawn proposal.** Extending the growth window past 26 was
proposed during design — the engine's own ageing policy reserves reachable
potential room up to age 34 that the development policy can never deliver,
making ages 26–31 a dead zone with neither growth nor decline. It was withdrawn
before implementation: it would raise the population's peak age and push
scorer and creator age upward, which is the exact direction already measured as
a failure. If it returns it must be **family-conditioned** — mental and
technical growth continuing, physical closing — not a uniformly later curve.

**What would falsify this.** A demonstration that the two ends are separable —
for example a supply-only change that improves conversion without worsening
age composition. The pre-registered factorial is designed to test exactly that.

---

## Finding 6 — A Cached World Cannot Be Invalidated By An Inspection Flag

**Claim.** The career-world checkpoint cache matches a stored world on profile
id, world seed, world index, world count, season count, detail and section ids,
and on nothing else. No inspection flag is part of that identity. Turning an
observer on therefore does not invalidate a world cached with it off: the run
reuses the stored projection verbatim and produces no observation rows, while
every other gate reads the same numbers as before and stays green.

**Evidence.** The `7×2` canary was run three times. The first run wrote
`saves/long-run-checkpoints/…-canary-7x2-facts-v1/{candidate,control}` and
reported zero observed players in all seven worlds. Two forwarding defects were
then found and fixed in the projection and in the `CareerWorldFacts` interface.
The third run reported zero again — and the cached candidate files still carried
their original write time, unchanged by that run, with zero occurrences of
`monthlyDevelopmentObservations` in their payload. The run had not simulated
anything; it had replayed a world recorded before the seam reached the
projection. The `7×10` replay artifact was written from the same generation of
cache and carries the same limitation.

**Why this matters beyond one lost afternoon.** This is the fourth occurrence in
this chain of a gate that was green for the wrong reason, and the first whose
cause lies entirely outside the code being tested. It also means a diagnosis
performed *against a cached artifact* can prove nothing about the current code.
Two correct fixes were measured as failures because the measurement never ran.

**The lever that does exist.** `CAREER_PROFILE_CACHE_SUFFIX` is per profile and
is the only way to retire a stored generation. The three L6.43B profiles were
moved to `-facts-v2`, and to `-facts-v3` once Finding 7 changed the cohort those
worlds were simulated with. This is a manual discipline, not an invariant: any future
change that adds a field to a projection must bump the suffix of every profile
that should carry it, because the cache itself will not notice.

**What would falsify this.** A canary that still reports zero rows after the
suffix bump, with a freshly written cache directory. That would move the cause
back inside the observation path.

**Independent confirmation.** A focused two-season test that runs the real
generation, intake, ledger and development path in a temporary checkpoint
directory — so no stored world can be reused — delivers non-zero observed
players and months. Removing the projection forwarding makes it fail. The
pipeline was already correct when the third canary reported it broken.

---

## Finding 7 — The Observed Cohort Was Wider Than The Cohort Under Attribution

**Claim.** Accumulating the observation request from every accepted ceiling
placement included both assignment lanes. The L6.43A pathway cohort this step
exists to explain is exactly the `minimumRating === 5` lane; the six-star lane
is compared between arms for identity and never attributed, and the pathway
evaluator counts a six-star ceiling among its assignments as a reconciliation
failure. Observing both lanes measured a population the frozen `716` does not
contain.

**Evidence.** In the first canary that delivered rows, every world observed more
players than it had season-one five-star assignments: `12/10`, `14/11`, `12/11`,
`10/8`, `12/10`, `13/11`, `14/11`. The surplus is the six-star lane, two to
three players per world. At ten seasons that is a cohort inflated by roughly a
fifth, and every share the evaluator computes — conversion, exposure, owner
margin — would have carried it.

**Why the earlier checks did not see it.** The non-vacuity gate asks whether the
payload is non-empty, not whether it is the right population. Typecheck cannot
distinguish two lanes of the same type. Nothing in the chain compared the
observed set against the assignment set, because that assertion was
pre-registered for the ten-season replay and the canary was scoped to
reachability.

**What would falsify this.** An observed count that still exceeds the season-one
five-star assignment count after the lane filter, or a demonstration that the
L6.43A cohort was never five-star-only.

**How it is now caught.** The focused two-season test asserts equality against
the checkpoint's own season-one assignments rather than `> 0`. Widening the
filter back to both lanes makes it fail `14 !== 10`. The canary was re-run on a
retired cache, because a stored world cannot notice a changed cohort either.

---

## Finding 8 — A Third Of The Exposure Denominator Did Not Exist

**Claim.** The frozen opportunity measure divides observed development exposure
by the maximum available from a player's first eligible month to his growth
window close. The contract computed that maximum as twelve months a year. The
simulation runs eight. A third of every denominator was months in which no
player could develop, because no development checkpoint existed in them.

**Why.** A development batch is selected from participation rows. A month with
no participation row anywhere — no senior fixture, and therefore no derived
academy fixture either — closes no checkpoint. The football calendar has an
off-season; the growth calendar has nothing in it.

**Evidence.** One real two-season world driven through the actual intake →
lifecycle → participation-ledger path
(`phase81a-l6-43b-observation-world-00001`, ten five-star assignments), reading
the engine's own record of the months it closed:

```
2026-08 2026-09 2026-10 2026-11 2026-12 2027-01 2027-02 2027-03
2027-08 2027-09 2027-10 2027-11 2027-12 2028-01 2028-02 2028-03
```

Eight per season. April, May, June and July close nothing. All ten assignees
carry a boundary of `2027-08` — the first month of their second season — and
produced exactly one row in each of the eight months after it: `80` rows, no
remainder, so no month is missing, partial or double-counted.

**Consequence.** Under a calendar denominator, a player with the maximum
opportunity multiplier in every month that actually existed would score
`exposureShare = 0.667`. The frozen `0.50` insufficiency threshold would then
read "below three quarters of the opportunity that existed" rather than "below
half the development career available to him", and
`sustained_opportunity_insufficient` — a category that selects a Step 16M-C
product branch — would have absorbed players who were never denied anything.

**What was changed, and what was not.** The `0.50` fraction is unchanged and
stays frozen. The denominator's month basis is now the engine's own
closed-checkpoint list for that world, intersected with the player's range. No
months-per-year constant appears anywhere in the implementation, so a world with
a different calendar is measured on its own.

**What would falsify this.** A demonstration that development can occur in a
month the lifecycle does not close — which would make the closed-checkpoint list
an undercount rather than the true availability set. An engine test now asserts
the opposite directly: every retained observation row falls in a month present
in that list.

---

## Finding 9 — The Final Season's Assignments Are Not A Cohort, They Are A Horizon

**Claim.** A player assigned at the end of the run's last season has no season
left to develop in. He is outside the population under attribution, not a zero
inside it.

**Evidence.** The first run of the reconciliation gate failed by including him.
On the two-season world the header carried both season-one and season-two
assignments, while the season-two entries could not produce a single row by
construction — intake runs after the monthly lifecycle, and there is no season
three.

**Why it would have been invisible.** The earlier non-vacuity check compared
observed players *with rows* against the assignment set, and season-two
assignees have no rows, so they never appeared in that comparison. They would
have appeared in the evaluator, with a full denominator and an empty numerator,
and classified as `sustained_opportunity_insufficient`. The count is not small:
at fifteen seasons it is one whole intake class.

**How it is now caught.** The header is emitted only for assignments at or
before `seasonCount - 1`, and the reconciliation test compares header ids
against assignment ids as sets rather than as counts, so a swap is caught as
well as a surplus. This is the same bound the replay gates already carry:
`assignmentSeason <= 9` at ten seasons, `<= 14` at fifteen.

**What would falsify this.** Evidence that an assignment made in the final
season can still accrue a development month — which would mean intake no longer
runs after the monthly lifecycle, and would break the cohort accumulation
design at its root.

---

## Finding 10 — The Baseline Evaluator Refuses Any Horizon But Ten

**Claim.** The L6.43B design reuses the L6.43A checkpoint verbatim and adds one
sub-field. The L6.43A checkpoint cannot be run at fifteen seasons at all: it is
hard-gated to exactly ten.

**Evidence**, read from the evaluator rather than from its description:

- its first reconciliation term is `Number(seasonCount !== 10)`, so any other
  horizon is an instrument failure before a single player is examined;
- it expects `11 - assignmentSeason` season boundaries per player, and a
  fifteen-season run produces `16 - assignmentSeason`;
- it reads season ten by name for First-Division retention and for top-ten
  leader membership;
- it requires the assignment count to equal the sum of every observed intake
  season's five-star assignments, which at fifteen seasons includes five intake
  classes the frozen `716` does not contain.

**Consequence, and why it matters now.** The `7 x 15` profile is registered and
has never been exercised. Run as wired, it would have returned `STOP_INSTRUMENT`
with a reconciliation failure per player, after paying for a full seven-world
fifteen-season simulation — the most expensive way possible to learn something a
reading of the code gives for free.

**Resolution.** The evaluator is **not** changed. It stays the ten-season
instrument L6.43A froze, because teaching it about fifteen seasons would move
the very numbers a continuity replay exists to reproduce. An adapter in front of
it cuts a longer run's facts back to the baseline: assignments, boundaries, owner
player-seasons and intake seasons are filtered to `seasonNumber <= 10`, and the
season count is passed as `min(actual, 10)` — so a run *shorter* than the
baseline is not told it is the baseline, and the legacy evaluator still reports
that itself.

At ten seasons every filter is a no-op, which is what makes the `7 x 10`
replay's byte-identity a proof rather than a coincidence. At fifteen it is what
keeps the population the frozen `716` instead of five further intake classes
wearing the same name.

**How it is proved.** The fifteen-season fixture is the ten-season one *plus* an
extension, so the extension is the only difference between them:

- at ten seasons the adapter returns its input unchanged;
- a fifteen-season input reduces to the ten-season input — compared at the
  **input**, not at the decision, so a surplus fact cannot ride along unread;
- the legacy verdict through the adapter is still `OWNER_IDENTIFIED` with the
  same pooled closed-window count, and deep-equals the ten-season decision;
- the same fifteen-season facts handed to the legacy evaluator *directly* return
  `STOP_INSTRUMENT`, so the adapter is load-bearing rather than decorative;
- each of the four filters was removed in turn and each removal failed the
  suite, so no filter is carried without evidence.

**What would falsify this.** A `7 x 10` replay whose checkpoint stops being
byte-identical to the L6.43A artifact after the bound is introduced. That would
mean the truncation is not a no-op at ten seasons and is changing the baseline
rather than preserving it.

---

## Finding 11 — The Intake Projection Is Already Optimistic, Not Pessimistic

**Claim.** L6.43B names `expected_ceiling_below_16_at_intake` for all `173`. The
obvious remedy - make the median projection less pessimistic so credible elite
candidates exist - is refused by the data. The projection is not understating
these players. It is **overstating** them.

**Evidence**, from the `7 x 10` replay on cache `v4`, over all `173`:

| quantity | reading |
| --- | --- |
| `p50Ability` at intake | min `13.78` · p50 `14.38` · max `15.05` |
| best role-weighted ability actually reached | p10 `11.37` · p50 `12.71` · p90 `14.48` · max `15.31` |
| signed error, projection minus realized | p10 `+0.27` · p50 `+1.63` · p90 `+2.70` |
| players whose projection exceeded what they reached | `166 / 173` |

The horizon is ten seasons and `168/173` have not reached their judgement age,
so realized ability is a lower bound and the true error is smaller than `+1.63`.
The direction is not in doubt: the projection sits above the outcome for
`96%` of the cohort.

**The five closed windows are the most informative rows in the run**, because
for them realized ability is final:

```
p50 14.90 -> 14.76      p50 15.05 -> 15.11
p50 14.42 -> 13.80      p50 13.78 -> 10.73
p50 13.94 -> 11.02
```

The projection tracks well at the top and fails badly at the bottom. This is not
a uniform bias that a scalar could correct; it is a **variance** failure. The
projection cannot tell who will stall, and a stalled player misses it by three
points.

**What this rules out.** Raising the `p50` factor - conditioning it on remaining
window, or any other reshaping that lifts the median - would move an already
optimistic forecast further from the outcome. It would relabel a `14.4` player
as a `16` player without changing what he becomes, exactly the failure mode of
renaming rather than repairing. Any candidate touching the projection must
therefore be judged on **calibration against realized outcomes**, never on the
projected number, and must reduce error rather than shift it upward.

**What this leaves.** If the projection flatters the cohort and the cohort still
fails, then the population contains no elite-capable member to find. The defect
is upstream of selection: either the generated young tail has no credible
member, or the conversion path cannot deliver one from any plausible starting
point. Those are different owners with different corrections, and the
`bucketMargins` already retained in the payload are what separate them.

**What would falsify this.** A fifteen-season reading in which the closed-window
population reaches abilities at or above their intake projection, making the
observed gap an artifact of censoring rather than a calibration error.

---

## Finding 12 — Five-Star Means A Ceiling Of `16.2`, Reached From `8`

**Claim.** The allocator does not select improbable brilliance. It selects the
**thinnest possible qualification** for elite, and then the career has to be
perfect.

**Evidence**, `7 x 15` on cache `v4`, the frozen `173`, read from the canonical
intake projections and not from anything the report persists:

```
                    min     p10     p50     p90     max
current at intake  6.31    6.79    8.09    9.88   10.78
p50 projection    13.78   14.00   14.38   14.76   15.05
upper projection  16.01   16.06   16.25   16.43   16.49
stored ceiling    16.01   16.06   16.25   16.43   16.49

reaching >= 16:  p50 0/173 · upper 173/173 · stored 173/173
```

Every one of the `173` has a hidden ceiling above `16`, and the **highest
ceiling in seven worlds is `16.49`**. Their current ability at intake is about
`8`. To reach elite, such a player must convert essentially the whole eight-point
gap and arrive with no margin at all - while `Finding 11` shows the ceiling is
compressed below `16` at a median age of about nineteen.

This resolves the two allocation cases the cross-tab was built to separate. It
is not "no elite-capable tail is generated": the tail exists by the register's
own definition. It is "the tail qualifies by `0.01` to `0.49`", which is a
five-star badge meaning *could theoretically touch* `16.2`, not *is a credible
elite prospect*. It also explains the shape of the outcome: with a population
ceiling near `16.2`, any loss at all puts a player under the bar, which is why
`10` reached `15` and `0` reached `16`.

**Open, not yet a finding.** `upper projection` and `stored ceiling` are
identical at all five quantiles. If they are equal per player, the public
high-upside estimate carries no information beyond the hidden ceiling and the
projection has no real upper band. Distributions were measured, per-player
equality was not, so this needs its own check.

**A defect caught by the population being written down.** The first run of this
diagnostic reported `n = 255` for a `173`-player cohort. Player ids derive from
club and season rather than from the seed, so the same id exists in all seven
worlds, and pooling ids into one set matched assignments from worlds the player
never played in. Fixed by keying the population per world; `n` is now `173` and
the `p50` distribution reproduces the independently measured values exactly,
which is what confirms the fix. Nothing but the expected population made the
wrong number visible.

**What would falsify this.** A stored-ceiling distribution with real headroom -
players at `17` or `18` - failing anyway. That would move the owner back to the
conversion or compression path.

---

## Finding 13 — Five-Star Is A Band, And The Elite-Capable Tail Is The Lane Next Door

**Claim.** `Finding 12` reported that the selected cohort's ceilings sit in
`16.01..16.49` and read it as an allocation defect. That reading was wrong.
Five-star is not a cohort the allocator chose badly; it is a **rating band**.
Five stars *is* `[16, 16.5)`. The ceilings are what they are by definition of
the band, and no selection rule over that band could have produced an elite
player.

**Evidence**, read from the cached `7 x 15` world projections, all intake
seasons, both lanes:

| lane | n | ceiling min | ceiling p50 | ceiling max | rating |
| --- | ---: | ---: | ---: | ---: | ---: |
| five-star | `1092` | `16.01` | `16.26` | `16.49` | `5` |
| six-star | `206` | `17.02` | `18.34` | `19.75` | `6` |

The generator **does** produce elite-capable youth - `206` of them, to `19.75` -
in the same worlds, in the same intakes. The frozen L6.43A cohort deliberately
excluded that lane: it is compared between arms for identity and never
attributed. So this phase measured the one population structurally incapable of
reaching `16` and never observed the one with headroom.

The allocator was also not supply-starved. Over `105` world-seasons it left `8`
five-star vacancies unfilled against `1815` target slots, making `1092`
assignments with `580` club-cap refusals. It had candidates and placed them.

**Consequence.** Correcting five-star selection or five-star projection would
correct the wrong lane. The question that decides which Module changes is what
becomes of the **six-star lane**: whether it reaches `16`, fails despite real
headroom, or never receives minutes. Those point at succession working, at
development and the aging ratchet, and at opportunity respectively.

`206` players is roughly `29` per world across fifteen seasons, so per-world
power is thin and any attribution over it must be judged against the `5/7`
coherence rule rather than pooled alone.

**Also settled, per player rather than distributionally.**
`upperAbility === storedCeilingAbility` for **`1298` of `1298`** selected players
across both lanes. The public high-upside estimate is exactly the hidden
ceiling, so the projection carries two independent values wearing a three-value
interface, and `upperAbility` adds no information to any decision reading it.

**Also settled: the `99.9%` core realization is permanently uninterpretable.**
Potential is rewritten each month toward `current + room(age)`, so a current
that meets its potential cannot be distinguished from a potential that came down
to meet it. No further cohort resolves this; only a fixed ceiling would.

**What would falsify this.** A six-star lane whose members also stall in
`16.01..16.49` despite ceilings near `18`, which would move the owner back to
development and make the band structure irrelevant.

---

## Method Commitments Made Before Any Result

Recorded here so a reviewer can check we did not move them afterwards.

1. **Six exclusive states**, evaluability resolved before mechanism:
   intake ceiling below 16 · ceiling lost before realization · right-censored at
   horizon · sustained opportunity insufficient · realization under viable
   projection · instrument failure.
2. **Censored players never name an owner** and are excluded from every owner
   denominator.
3. **Judgement age is frozen to the control curve** (26 / 27 / 28 by group). A
   candidate that extends growth cannot move the moment it is judged.
4. **Opportunity is measured as cumulative exposure**,
   `Σ(ageMultiplier × opportunityMultiplier)`, normalised by the maximum
   available from the player's **first eligible development month** to his
   window close, counting only months in which a development checkpoint
   actually ran. Unobserved pre-assignment months and months that existed for
   nobody are not charged as lost opportunity. Insufficient below `0.50`; that
   fraction has not moved, only the denominator's month basis, and the reason is
   Findings 8 and 9.
5. **The 900-minute gate is a guardrail, not the discriminant.** It correctly
   separates 39 players below it; above it the cohort ranges 953–15,940 minutes
   (median 3,780), so crossing it certifies only that opportunity began.
6. **The `0.20..0.50` conversion band is frozen** as a declared product
   hypothesis. A candidate outside it returns `REFINE` or `STOP_RETHINK`, never
   a moved band. The `0.50` ceiling is a design claim about credibility and is
   not derivable from any measurement; an earlier attempt to derive the floor
   from measured elite tenure was withdrawn because that statistic is
   right-censored by the same horizon, and correcting a censoring defect with a
   censored statistic is not a correction.
7. **Two distinct conversion measures**, never conflated: the national rate over
   all matured selected assignments (which reads the band), and the recovery
   share of the frozen 173 (which carries no band, because that cohort was
   selected for having already failed).
8. **Continuity is a season-1–10 prefix hash**, not whole-report identity.

---

## Implementation State

Complete and verified:

- **Engine observation seam.** Monthly development rows already exist and are
  discarded at the summary boundary; a typed request retains them for named
  players. An unobserved result is structurally identical to one produced
  before the seam existed. The per-bucket split is taken inside the monthly
  development loop, because the batch career state reflects up to three applied
  months and could not attribute a value to one of them.
- **Canonical bucket vocabulary** now has a single owner, replacing an
  order-sensitive object-key enumeration.
- Domain and engine suites: `126` files, `1098` tests, all passing.
- **Report-side observation pipeline**, proved reachable end-to-end by a focused
  two-season test on the real generation, intake, ledger and development path,
  in a temporary checkpoint directory so no stored world can be reused. The test
  fails when the projection forwarding is removed and fails again when the lane
  filter is widened, so neither half of its green is vacuous.
- **`7 x 2` canary**, on a retired cache so the run had to simulate. Observed
  players equal season-one five-star assignments exactly in all seven worlds —
  `10, 11, 11, 8, 10, 11, 11` — at eight months each with no remainder, so no
  row is duplicated or partial.

  The canary's own checkpoint decision is `STOP_INSTRUMENT` with
  `pooledClosedWindowCount: 0`. That is the reused L6.43A checkpoint evaluated at
  two seasons, where no development window can close for a cohort assigned at
  seventeen. It is not evidence about the L6.43B seam in either direction, and
  the canary is not reported as a green checkpoint: the one thing it establishes
  is reachability on the right population.

- **`7 x 10` paired replay**, on the retired cache. Ten gates, all held:

  - `baselineContinuityHash` over the ten L6.43A sections through season ten is
    `5f1cad79889795de6d02ab31ba899396` for both the baseline artifact and the
    replay. The frozen value was re-derived from the baseline rather than
    trusted, so the comparison is anchored to a measurement.
  - Checkpoint purity: `developmentRealization` is the only added key, and the
    checkpoint with that key removed serializes identically to the baseline's.
  - Headline facts unchanged: `716` assignments, `424` closed / `292` open,
    owner `development_realization`, `0` reconciliation failures.
  - Cohort: observed players equal assignments with `assignmentSeason <= 9`
    exactly, in all seven worlds — `74, 79, 108, 90, 99, 105, 83`, totalling
    `638` of the `716`; the missing `78` are season-ten assignments, whose first
    observable season is eleven. Roughly `21,000` monthly rows retained.
  - No `seasonNumber` anywhere in the added payload, so the rows stay invisible
    to the season-prefix hash by construction rather than by luck.

  Turning the observer on therefore changes nothing an earlier run established.

- **Cohort header and denominator basis**, proved on the same real two-season
  path. One header per selected five-star assignment observable at the horizon,
  carrying identity, birth date, natural position and first eligible development
  month, and emitted whether or not the player ever plays. Beside it, the
  engine's own list of the development months that world closed. Four negative
  mutations, each run alone, each caught by exactly one assertion:

  | mutation | assertion that failed |
  | --- | --- |
  | boundary anchored at the assignment season's start | no closed month precedes the boundary |
  | cohort not forwarded through the projection | header ids `[]` against ten assignment ids |
  | closed-month record not forwarded | no closed month precedes the boundary |
  | month record emitted without an observation request | unobserved payload is no longer structurally identical |

  The final-season inclusion of Finding 9 was itself caught by the gate before
  it was fixed, so that one is evidenced by an observed failure rather than by a
  constructed mutation.

Not yet built: the six-state evaluator, the `7 x 15` run. The `7 x 15` profile is
registered but unexercised. The `-facts-v3` cache generation predates the cohort
header and the closed-month record and is superseded as evidence for the final
payload; it is retained on disk and must not be read as a gate for it.

The `7 x 10` replay artifact produced before both corrections carried no
observation rows and a cohort widened by the six-star lane. It was superseded by
the run described above and must not be read as evidence. It was deleted rather
than marked superseded, which was the wrong way to retire it: an artifact is
withdrawn from evidence in the record, not from the disk.

**One design decision not specified by the step documents.** The observed player
set is accumulated during the run — each season's new prospect assignments are
added to the observation request for subsequent seasons — rather than read from
a frozen list of the 173 IDs. This keeps the step self-contained, matches the
step's own instruction to freeze the reachability corpus to all 716 selected
IDs, and needs no external fixture. Exposure is anchored at assignment, so
pre-assignment months are not required.

**Why accumulating loses no development, verified rather than assumed.** The
canonical season operation order places `monthly_lifecycle` before
`youth_intake`. A prospect assigned at season *N*'s intake therefore did not
exist in the state during season *N*'s monthly lifecycle, and his first
academy participation accrues in season *N+1*. Beginning observation at *N+1*
loses no real development.

An engine test proves the retention rule this depends on: months closed before
the observation request was made never appear retroactively in the payload,
every month closed while observing is captured, and no month is captured
twice.

Four further assertions require the report pipeline and are pre-registered as
required checks in the step rather than assumed here: that the observed set
equals exactly the union of the 716 assignments, that no monthly row earlier
than a player's own assignment reaches the report, that every participation row
after assignment is captured, and that no row is duplicated across seasons or
workers.
