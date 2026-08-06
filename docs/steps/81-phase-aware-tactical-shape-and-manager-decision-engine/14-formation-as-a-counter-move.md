# Step 14 - Formation As A Counter-Move

## Status

Not started. Step 09 unblocked the first prerequisite below: AI clubs now field
varied catalog shapes instead of one hardcoded `4-4-2`. The second prerequisite
is new, recommended by Step 10 and not yet met - a manager still cannot see what
the opponent's shape is doing to him, and a reward for countering blind measures
luck.

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

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `apps/cli/src/commands/tactical-shape-report.ts`
- `apps/cli/src/commands/tactical-shape-report.test.ts`
- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`
- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/04-relational-phase-matchup-and-route-capacity.md`
- `docs/PROJECT_STATUS.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli tactical-shape-report
pnpm cli ten-season-report
graphify update .
```

## Definition Of Done

- Opponents field varied formations, verified by reading the code that builds
  them and not by reading Step 09's intent.
- The audit reports a formation-versus-formation matrix with a best-response row
  per formation, mean and worst-case.
- Choosing the right counter is worth `~0.047` win share above an even contest,
  measured above the noise floor, and choosing the wrong one costs.
- No formation averages above `0.55` against the field.
- `bounded_structural_swing` still passes, unmoved.
- `goals_per_match_avg` is re-measured and handed to Step 15 with its reading.
- Step 15 is the only next action.
