# Step 14 - Formation As A Counter-Move

## Status

**Done 2026-08-06, with its central target recorded as not delivered.** Every
gate is green and the step built the instrument that decides the question. The
question came back no.

Read this before the rest of the document, which was written when the answer was
assumed: **there is no formation counter-move to reward, at any setting of any
coefficient this engine has.** The lever named below - raising the route chain
weighting - was built, swept over `57` configurations, and produces a strictly
transitive matrix in every one of them. What it moves is the size of one shape's
lead, not the existence of an answer to a shape. Details in *What Was Found*.

What the step does deliver: the formation-versus-formation matrix the audit
never had and the `no_dominant_formation` gate it makes possible, both measured
on two seed prefixes; the forced-shape crash Step 12 handed over, fixed; and a
named owner for the one axis where a counter-move could still be real.

### Adopted Solution

**The instrument.** `TacticalShapeFormationDominanceMatrix` runs every curated
formation against every other at equal quality on neutral tactics, over the
**whole `23`-shape catalog** rather than the eight axis-isolating shapes the
versus-reference table measures. A shape that beats the field from outside a
subset is invisible to that subset, and the strongest shape measured here -
`4-2-3-1` - is not one of the eight.

It has its own seed count, `formationPairedSeedCount`, defaulting to `250`, and
the reason is written where it is declared. Neither existing count fits: the
dominance breadth of `8` leaves a row mean unresolvable at `0.0719`, and the
scenario precision of `1050` over `253` played cells costs more matches than the
entire rest of the report. What the gate reads is a row *mean* over `22`
opponents, which resolves to `0.0129` at `250`.

**The counter-move reading is cross-validated, and that is the whole of why it
is believable.** The best response to each opponent is chosen on the matrix and
then **replayed on a separate seed stream** at scenario precision. A maximum
taken over `23` candidates and reported from the sample it was picked from is
biased upward by roughly the noise floor of that maximum - here about `0.06` per
cell, which is larger than the `0.047` target. Reporting the matrix cell would
have credited this step with a delivered reward manufactured entirely out of
sampling. The replay is what turns `13 of 23 distinct best answers` - which
looks like rich rock-paper-scissors - into `0.0064`, which is nothing.

**`no_dominant_formation`** reuses the existing `0.55`; no threshold was
introduced. It reads the mean against the field for the tactic gate's reason -
all `23` shapes are legal selections, so the mean is the expected value of
choosing one blind - and its detail line also reports how many formations never
fall below an even contest, because a shape with no counter at all is the
failure the mean is a proxy for.

**The forced-shape crash is fixed, in the engine.** `bestFieldedShape` filled a
caller-supplied formation only from candidates whose suitability was not
`invalid`, so a shape a squad could not fill threw `not_enough_players` and
ended the fixture - which is how the Step 12 inspection lost five of twenty
worlds. It now makes a second attempt with the `invalid` filter dropped and
nothing else changed, so the eleven that comes back is the cheapest way to fill
*that* shape rather than a different shape. This is the answer this file already
gives for a missing goalkeeper, generalised. It cannot fire on a shape the club
chose: `strongestCatalogShape` only returns one it has already filled from the
same lists.

**A club choosing freely can still refuse, and that is left as it was.** A squad
that fits no catalog shape at all - eleven centre backs, which the tests reach -
throws exactly as before. That is a different case with a different owner: Step
12 handed over the *forced* shape by name, and widening the search there would
change which system every AI club in the world fields, which is Step 09's.
Narrowing the error's meaning was still worth doing, so `not_enough_players` now
fires only when the roster really is short of players, and a test holds it to
that.

### What Was Found

Two seed prefixes, `phase81-tactical-shape` and `phase81-bounded`, identical in
everything else, as Step 13 required. Both exit `0`; all eight invariants pass on
both. Nine findings follow.

| Reading | default prefix | bounded prefix |
|---|---|---|
| strongest formation against the field | `4-2-3-1` at `0.5184` | `4-2-3-1` at `0.5210` |
| its worst matchup | `0.486` vs `5-3-2` | `0.478` vs `4-4-2` |
| formations never below an even contest | `0 of 23` | `0 of 23` |
| **counter-move mean gain** | **`0.0064`** | **`0.0117`** |
| counter-move worst opponent | `-0.0307` | `-0.0174` |
| distinct shapes used as an answer | `13 of 23` | `11 of 23` |
| resolvable above the cell floor `0.0295` | **no** | **no**  |
| row-mean floor | `0.0129` | `0.0129` |
| `bounded_structural_swing` | `0.1238` | `0.0377` |
| `incoherence_costs_a_division_tier` | `1.9246` | `1.9278` |

**F1 - The target is not delivered, and nothing was built that could deliver
it.** Taking the smaller of the two as Step 13 instructed, choosing the right
counter is worth **`0.0064`** win share against a target of `0.047` and a floor
of `0.0295`. It is not merely below target, it is unmeasurable. Neither prefix
resolves, and the two disagree by `0.0053` - itself most of the effect.

**F2 - Formation is not zero, and it is not a counter-move either.** `4-2-3-1`
tops both prefixes at `0.5184` and `0.5210`. Those differ by `0.0026`, far inside
the `0.0129` row-mean floor, so this **reproduces**, and both sit `0.018` to
`0.021` *above* an even contest, which is outside that floor. So there is a real
formation ordering worth roughly `1.5` league points a season to pick blind. It
is a property of the shape, not of the opponent, which makes it the one thing the
step's own *What NOT To Implement* forbids rewarding.

**F3 - The named lever cannot produce a counter-move at any setting.** Before
spending simulation time, the fix Step 04 described - give each route's defining
phase a declared share of the non-bottleneck part - was built as an analytic
model over the production capacities and swept: `chainBottleneckWeightBasisPoints`
`0` to `8000`, defining-phase emphasis `1` to `8` (normalised so `1` reproduces
today exactly), `routeSelectionSharpness` `1` to `6`, pressing contest weight `0`
to `7500`. **All `57` configurations produced a strictly transitive matrix, zero
3-cycles.** Emphasis saturates because the bottleneck weight caps what the
average part can ever be worth. `TACTICAL_ROUTE_DEFINITION` was therefore left
alone: the model change this step was permitted is one it measured to be wrong.

**F4 - The cause is upstream of the routes, and it is a missing trade-off.** Over
the `23` shapes the ranking by route advantage tracks the ranking by *mean
capacity* - `4-2-3-1` tops both, `3-3-3-1` bottoms both. A shape better at
attacking centrally is also better at defending centrally, because both are built
from the same eleven contributions through the same diminishing ladder. There is
nothing for a counter to exploit. A route model amplifies differences; it cannot
manufacture a trade-off that the capacities do not have.

**F5 - The instrument's own selection bias is larger than the effect it
measures.** `13 of 23` distinct best answers reads like rock-paper-scissors and
is not: a single matrix cell resolves to `0.0604`, so the argmax over `23`
candidates is mostly sampling. The replay is what says so. This is worth stating
because the naive version of this measurement - report the best cell - would have
returned roughly `+0.06`, cleared the `0.047` target, and been entirely false.

**F6 - The dominance question passes cleanly and is new information.** `0 of 23`
formations stay above an even contest against every opponent, on both prefixes.
Until this step the phase asserted "nothing is simply the right answer" for
compositions and for tactics and could not ask it of formations at all, because
the population had a versus-reference column and no matrix.

**F7 - nothing this step did moved a pre-existing measurement, and that is
proved twice over.**

`bounded_structural_swing` reads `0.1238` and `0.0377` on the two prefixes and
`incoherence_costs_a_division_tier` reads `1.9246` and `1.9278`. All four match
Step 13's stored reports **exactly**, on both prefixes - so the audit additions
are additive and the engine change is invisible to every row that existed
before. (The swing's own `0.1238`-against-`0.0377` split is Step 13's F1, the
population-specificity of a sub-floor row, unchanged and not this step's to fix.)

The engine change was then tested directly rather than argued from. The
long-run gate forces `4-4-2` on every club, so the forced-shape fallback *can*
reach it; a temporary switch disabled the second attempt and the same
`--worlds=2 --seasons=10` run was played both ways. **The two reports are
byte-identical**, partition hashes included, differing only in the output path
each one echoes. On that path the fallback never fires, because every generated
squad fills `4-4-2` without anyone out of position. The switch was removed and
both reports deleted.

That matters for the gate's exit code: `pnpm cli ten-season-report` exits `1`,
and the two red checks are `young_stored_ceiling_six_stock_arrival_category_
placement` on `17` of `20` worlds - already recorded as unowned - and
`contract_finance_structural_integrity` on one. Both are red with the fallback
switched off, so neither belongs to this step. The second is **new to the
record and unowned**: it is a Phase 79 check, and this step names it rather than
adopting it.

**F9 - the browser gate is timing-sensitive at one assertion, and it is not
this step's to fix.** `wide journey keeps every current football decision surface
coherent` failed once at `current-product.spec.ts:222`, waiting for the full-time
`Continue` button, on a run that had the machine to itself. The same test passes
alone in `30s` and the full suite passes `38/38` in `7.1m`. The assertion sits
after `advanceClockUntilPlaybackStage(page, "closing", "real")`, which waits on
**real** playback rather than a controlled clock, so the gate's verdict depends
on machine speed at that moment. Recorded rather than retried into silence: a
gate that fails once in two runs is weak evidence in both directions, and the
step that owns the live playback surface owns tightening it. Playwright stops the
suite at the first failure, so a flake here also hides the `33` tests behind it.

**F8 - `goals_per_match_avg` is in band, and Step 13's figure was mislabelled.**
Twenty worlds of ten seasons: mean `2.720`, p95 `2.810`, band `2.3..3.0`,
`20/0/0` - the monitor appears in no world's warn or fail column. Step 13
recorded `2.760`/`2.840` for a twenty-world run; a `--worlds=2` run of the same
command reproduces both figures exactly, so that reading was a two-world one
wearing a twenty-world label. In band either way, so A7's discharge stands - but
the scale belongs beside the number, and now is.

## Goal

Make choosing a formation against the opponent you are actually facing worth
about five league points a season, without creating a formation that is simply
the right answer.

## User-Facing Reason

A manager who sets his team up well should win something for it. Today he wins
nothing for his formation, and a game where the correct move is to leave the
default alone is a flat game whatever else is true about it.

## What Is Actually Flat, Measured

Step 07B put every decision on one scale at `2100` matches against a `0.0295`
noise floor. The result is more specific than "the game is flat", and the
specificity is the whole design brief:

| Decision | Best response gains | Against its own counter |
|---|---|---|
| tactic sliders (`flank_overload`) | `+0.0327` | `+0.0033` |
| department composition (`3-5-2`) | `+0.0312` | - |
| **formation** | **`~0`** | - |
| a standout attacker at equal quality | `+0.0098`, unresolved | - |

**Tactics and compositions already work.** A best response exists, it clears the
noise floor, it is worth roughly three and a half league points a season, and it
collapses to nothing against the setting that counters it. That last column is
rock-paper-scissors and it is good design, not a defect: it is what stops any
setting from being the answer.

**Formation is the outlier.** Seven of eight curated formations sit below the
reference and none is meaningfully above it, so the decision can cost `~0.0305`
and can gain nothing. It is the one manager decision with a downside and no
upside, and it is the most visible decision in the game.

### What Step 13 Found About This Table, 2026-08-06

**The `+0.0312` row is not the same kind of number as the rows around it, and
this step's verification has to account for that.**

Step 13 ran the same instrument on two seed populations at the same `1050`
scenario pairs, same code, prefix the only difference. The large effects agreed:
the division-tier edge `0.2521` both times, the `0-0-10` deficit `0.4852` and
`0.4860`, the quality hierarchy `0.926` and `0.9169`. The best structural shape
gain read **`0.0312` on one prefix and `0.0095` on the other** - it lost two
thirds of itself, and both readings sit at or under the `0.0295` floor.

Every measurement ever taken of it, in order: `0.0431` at Step 01, `0.0288` and
`0.0156` around Step 06's calibration, `0.0269`, `0.0095`, `0.0312` at Step 13.
Range `0.0095..0.0431`, a factor of `4.5`, never convincingly outside its own
noise floor. The shape identified as nearest-to-dominant also changes with the
prefix, `7-1-2` to `5-2-3`.

Two consequences for this step, neither of which changes the target:

- **`~0.047` is still the right target and still verifiable.** It was chosen to
  sit above the floor with margin precisely so a delivered reward could be
  proved, and Step 13's result is the argument for that choice, not against it.
  The `0.2521` tier and the `0.4852` deficit show that this instrument resolves
  an effect of that size to three decimals.
- **The measurement plan must change.** A single run cannot show that this step
  delivered `+0.047` rather than drew a friendly seed. Measure the counter-move
  reward on **at least two seed prefixes**, report both, and treat the smaller as
  the result. The same applies to the `~0.0305` downside this step is expected to
  produce, for the same reason.

Nothing about the before-state is restated as improvement: `~0` for formation is
a claim about a decision that has no mechanism yet, and Step 13 did not measure
it a second time.

## The Target

**Choosing the formation that counters the opponent's is worth `~0.047` win
share.** In the language a player thinks in, using the audit's own
`(wins + draws/2) / matches`:

| | points a season, over `38` matches |
|---|---|
| one division tier of squad quality | `~29` |
| **the counter-move target** | **`~+5`** |
| formation today, worst case | `~-3.5` |
| fielding a broken shape | `~-55` |

`0.047` is chosen against two things and not picked for feel. It sits above the
`0.0295` floor with margin, so the target is *verifiable* - a reward the
instrument cannot resolve is a reward nobody can prove was delivered, which is
the disease Step 07B spent its whole length curing. And it lands beside the
adjacent squad-quality gap of `0.0467`, which makes the design statement legible:
**setting up well against this opponent is worth about as much as having a
slightly better squad**, and nothing like as much as having a much better one.

## Why It Cannot Be "The Best Formation"

There is no target of the form "`4-3-3` gains `0.047`". If one formation has the
highest win share against the field, it is the answer, and `no_dominant_composition`
exists to forbid exactly that. Rewarding an absolute best formation would break a
frozen invariant of this phase.

The only coherent version is relational: a formation is correct **against the one
it is facing**. Football agrees - a back three is a problem for two strikers and
an invitation to a wide front three - and the engine already models it that way.
`deriveTacticalMatchup` is relational, routes are contested by the opponent's
capacities, and `TACTICAL_SHAPE_CAPACITY_MIRROR` is where "your left is their
right" is written down. The machinery is there. The reward and the measurement
are not.

So the target is: **the right counter gains `~0.047`, the wrong one costs, and no
formation averages above `0.55` against the field.** That is a goal a player can
chase and an invariant this phase can keep at the same time.

## First Prerequisite - Every Opponent In The Game Plays `4-4-2`

**Met on the career path only. NOT met on the measurement path.** An earlier
edit of this document claimed Step 09 had closed it outright; that was wrong and
Step 11 found it by reading the code.

Step 09 gave real shape choice to `selectCareerAiTeam(...)`, which serves career
play and the live web session. It did not touch `simulateSeason(...)`, whose own
comment says it deliberately *holds a shape and a tactic still in order to
measure one of them*, and which therefore takes the formation as a caller input.
Three report paths still hand it one fixed shape - the table below marks which.

**This is the path this step measures on.** Until a run varies the formations,
a counter-move reward would be tuned against a world where every opponent plays
`4-4-2`, which is precisely the trap the section was written to prevent. Step 12
owns supplying that variety.

Where the fixed `4-4-2` stood when this section was written, and where it still
stands after Step 09:

| Site | Then | Now |
|---|---|---|
| `matchday-adapter.ts` `defaultCanonicalRoleForSlot` | hardcoded `4-4-2` role order for every opponent | **gone** - `selectCareerAiTeam` picks the shape |
| `apps/cli career/progression.ts` | the same default opponent lineup | **gone**, same door |
| `ten-season-report/report-data.ts` | `FORMATION_CATALOG["4-4-2"]` | **still there**, line `4086`, plus identical `0.5` tactics for every club |
| `live-match-control-report-data.ts` | `FORMATION_CATALOG["4-4-2"]` | **still there** |
| `tactical-shape-report-data.ts` | `FORMATION_CATALOG["4-4-2"]` | **still there**, and deliberately so - it composes its own sides to measure shape |

Two of five closed. Formations vary in career play, on the manager's own
preparation screen, and in the audit's composed population - **not in the
long-run report this step and Step 15 both measure on.**

So a counter-move reward built today would have nothing to counter. It would be
tuned and measured as *"countering `4-4-2` is worth `0.047`"* - a single right
answer against the only opponent that exists, which is the dominant strategy this
phase forbids, arriving through a door the gates do not watch because they
measure compositions against each other rather than against the world.

And it would make the game **flatter**, not richer. Formation is nearly
irrelevant today but it is at least an open choice. Against one fixed opponent it
becomes a solved one: found once, set once, never thought about again.

Step 09 - AI whole-XI selection and shared tactical decisions - is where opponents
get real formations. Until its work is done and AI clubs demonstrably field
varied shapes, every number this step would produce describes a world that does
not exist.

### What Step 12 closed, and the seam it opened

Step 12 supplied the variety: `assignFormationsByClub(...)` gives each club a
curated shape derived from `(worldSeed, clubId)`, so the long-run report now
fields a full spread of formations instead of one. The prerequisite is met on the
measurement path, through a setup choice rather than a selector.

**It also found what forcing a shape costs, and this step inherits it.**
`bestFieldedShape(...)` uses `input.formation` when the caller supplies one and
never falls back; only when the formation is `undefined` does it search the
catalog for a shape the roster can fill. So a forced shape a thin squad cannot
fill throws `not_enough_players` and ends the fixture, where the career path
would simply have chosen differently.

This step is the one that intends to make formation a decision worth making. A
decision that can crash the fixture it is made for is not one, and a manager who
picks a shape his squad cannot fill deserves the answer football gives - somebody
plays out of position - not an exception. Whether that belongs here or in a
Phase 82A squad-depth rule is this step's call to make, but it may not be left
unowned.

## Second Prerequisite - A Manager Cannot Counter What He Cannot See

Recommended by Step 10, which built the surface but deliberately did not do
this.

Step 10's consequence panel reads **only the manager's own shape**, at half time
as well as before kick-off. Before kick-off that is correct: he must not see the
opponent's team sheet. At half time it is not - he has watched them play for
`45` minutes, and "they are loading my left" is what a real manager is thinking
when he walks into the dressing room.

Without it, this step's reward is unreachable in practice. Changing shape to
counter something you cannot see is guessing, and a reward for guessing right
measures luck rather than a decision. That is a likely part of why formation
sits at `0.0312` while a tactic best-response already reaches `+0.0327`: tactics
are chosen against something visible, formations against nothing.

The engine already holds it. Step 04's relational matchup compares one side's
phase chain against the opponent's complementary capacities, and Step 07's
`routeCounts` record which routes an opponent actually used - what their shape
*opened* and what they *took*. Neither reaches any screen.

Constraints if this step takes it:

- Half time and later only. Never pre-match, and never the opponent's XI - only
  what their shape has done on the pitch, which the manager has already watched.
- Through Step 10's existing read model and component. A second consequence
  surface is the duplicate copy path the phase contract forbids.
- Qualitative, like the rest: no capacity numbers, no recommended answer.

## What To Implement

- A formation-versus-formation matrix in the tactical-shape audit, matching the
  shape of `dominance` (`66 x 66`) and `tacticDominance` (`6 x 6`). Formations
  have only a versus-reference *column* today, so no measurement exists of
  whether countering pays.
- A best-response row per formation: mean win share against the field, and win
  share against its own worst matchup - the same two numbers `no_dominant_tactic`
  already reports, which is what makes rock-paper-scissors visible.
- The route chain weighting raised until the counter-move reward reaches the
  target, then re-measured. This is Step 04's frozen `TACTICAL_ROUTE_DEFINITION`
  and reopening it is this step's one model change.
- A re-measured `goals_per_match_avg`, because this step moves goal-relevant
  behaviour after Step 13's deadline for it.

## The Mechanism, And What It Will Cost

The recorded cause of the flatness is that a route's defining phase carries only
`11.7%` of its own chain, so a real flank difference between formations arrives
attenuated. Raising that weight is the lever.

**It is not an upside dial.** It amplifies both directions at once: the right
counter gains more and the wrong one loses more, roughly in proportion. Aiming at
`+0.047` should be expected to produce a downside near `-0.06`, and that has to be
accepted going in rather than discovered afterwards. For a management game it is
arguably the better trade - decisions that matter cut both ways - but it is a
decision, not a side effect.

Two frozen invariants will move with it and must be watched rather than adjusted:

- `incoherence_costs_a_division_tier` is at `1.9246` against a `1.0` minimum.
  Amplifying shape raises it further. It passes with room, but a step that
  doubles it should say so.
- `bounded_structural_swing` is at `0.1238` against a `0.75 x` tier-edge ceiling
  of `0.189`. The best structural gain rises with the same lever, and this is the
  invariant that can actually bind. If it does, **the ceiling stays and the target
  comes down**: structure may not outweigh squad quality, and that is the oldest
  promise in this phase.

## What NOT To Implement

- No absolute formation reward. The target is conditional on the opponent or it
  is a dominant strategy.
- No threshold moves. If the target cannot be reached under
  `bounded_structural_swing`, the target was wrong.
- No start before Step 09 has given AI clubs varied formations, verified by
  reading what they actually field rather than by intent.
- No cohort run. Step 15 owns the `50 x 20` and must run *after* this step,
  because this step changes the engine it measures.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts` - **not modified.**
  The model change it exists here for was measured to be the wrong one (F3).
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `apps/cli/src/commands/tactical-shape-report.ts`
- `apps/cli/src/commands/tactical-shape-report.test.ts`
- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`
- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/04-relational-phase-matchup-and-route-capacity.md`
- `docs/PROJECT_STATUS.md`
- this step document

Added during the step, with the ownership each one is claimed under:

- `packages/simulation-tools/src/index.ts` - the barrel must export the new
  matrix types or the CLI cannot render them.
- `apps/cli/src/commands/tactical-shape-report-data.ts` - owns the shipped seed
  counts, so the new one is declared beside the two it had to be distinguished
  from rather than in the command that parses its flag.
- `packages/engine/src/team-selection/ai-squad-selection.ts` and its test - the
  forced-shape crash Step 12 handed to this step by name. It lives here because
  the fix is what a *selector* does when the shape is not its choice, and it may
  not be left unowned.

## Required Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm cli tactical-shape-report
pnpm cli tactical-shape-report --seed-prefix=phase81-bounded
pnpm cli ten-season-report --report-kind=long-run-gate --worlds=20 --seasons=10
graphify update .
```

Three corrections to what was written here before the step ran.

**The report command must run twice**, on two seed prefixes. Step 13 established
that a small win-share row moves with the prefix, and this step's whole subject
is a small win-share row. One run cannot tell a delivered reward from a friendly
seed.

**`pnpm cli` writes relative output paths into `apps/cli/`**, not the repository
root, because `pnpm --filter` changes the working directory. The reports from
this step are in `apps/cli/simulation-out/`. `.gitignore` matches
`simulation-out/` at any depth, so nothing was committed either way, but a later
step looking for them at the root will not find them.

**The browser gate belongs in this block**, not only in the phase-level one.
Step 13 recorded that a gate written once at phase level runs once, at the end;
repeating that here is the point of having recorded it.

## Definition Of Done

| Line | Status |
|---|---|
| Opponents field varied formations, verified by reading the code | **met** - `formationForClub` picks from all `23` `FORMATION_KEYS` keyed by `(worldSeed, clubId)`, read rather than inferred |
| The audit reports a formation-versus-formation matrix with a best-response row per formation, mean and worst-case | **met** |
| Choosing the right counter is worth `~0.047`, measured above the noise floor, and choosing the wrong one costs | **NOT MET.** `0.0064` on the reported prefix, under a `0.0295` floor. F1/F3 record why, and no threshold was moved to make it read otherwise |
| No formation averages above `0.55` against the field | **met** - `0.5184` and `0.5210`, and `0 of 23` shapes are uncountered |
| `bounded_structural_swing` still passes, unmoved | **met** - `0.1238`, byte-identical to Step 13's default prefix |
| `goals_per_match_avg` re-measured and handed to Step 15 | **met** - `2.720` mean, `2.810` p95, `20/0/0`, in band; F8 |
| Step 15 is the only next action | **met** |

## Handoff, 2026-08-06

**Step 15** inherits an engine this step did not change in any way that moves a
result, and F7 is the evidence rather than the assurance: four invariants
reproduce Step 13's stored values exactly on both prefixes, and the long-run
gate plays byte-identically with the one production change switched off. The
forced-shape fallback can only fire where the previous behaviour was an
exception, so every fixture it affects is one that did not previously produce a
result at all.

It also inherits `goals_per_match_avg` at `2.720` mean / `2.810` p95 over twenty
worlds of ten seasons, `20/0/0`, inside the unchanged `2.3..3.0` band, and the
correction that Step 13's `2.760`/`2.840` was a two-world reading.

**The counter-move is not abandoned, it has an owner and a different first
step.** Whoever takes it owns two things *together*, and either alone is worse
than neither:

- **the lopsided population**, still open from Step 04's 2026-08-04 note. Left
  against right is the one axis where this model's capacities genuinely trade
  off, and the curated catalog is symmetric, so the model's only real counter
  axis has never been exercised.
- **the conservation question (F4)**. While one shape simply produces more total
  capacity than another from the same eleven, amplifying anything makes that
  shape win by more. Fixing the population without this would deliver a bigger
  dominant strategy.

**The second prerequisite was deliberately not taken.** A half-time read of what
the opponent's shape is doing is the delivery mechanism for a reward this step
measured does not exist; building it first would be building the door to an empty
room. It also has no Expected File here - it would touch `@game/ui`, five
locales, the web adapters and their tests - so taking it would have been a scope
decision made silently. It goes to the same owner as the two items above, after
them, not before.

**Left unowned by this step, deliberately:** nothing. The two findings Steps
12-13 left unowned - the seven-of-ten role generation and the Phase 80A
`young_stored_ceiling_six_stock_arrival_category_placement` check - are still
unowned and are still not this step's, but F4 now touches the first of them: a
world that cannot generate an `attacking_midfielder` cannot field `4-2-3-1`, the
shape that tops both prefixes here.
