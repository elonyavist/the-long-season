# Step 11B - Formation As A Counter-Move

## Status

Not started. **Blocked on Step 09** - see the prerequisite below, which is not a
formality and cannot be worked around.

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

## Prerequisite - Every Opponent In The Game Plays `4-4-2`

**This step must not start before Step 09.** Not for tidiness: starting earlier
produces the opposite of its goal.

Every AI-controlled club in the shipped game fields a fixed `4-4-2`:

| Site | What it does |
|---|---|
| `matchday-adapter.ts` `defaultCanonicalRoleForSlot` | hardcoded `4-4-2` role order for every opponent |
| `apps/cli career/progression.ts` | the same default opponent lineup |
| `ten-season-report/report-data.ts` | `FORMATION_CATALOG["4-4-2"]` |
| `live-match-control-report-data.ts` | `FORMATION_CATALOG["4-4-2"]` |
| `tactical-shape-report-data.ts` | `FORMATION_CATALOG["4-4-2"]` |

Formations vary in exactly two places: the human manager's own preparation
screen, and the audit's measurement population.

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
  behaviour after Step 11's deadline for it.

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
- No cohort run. Step 12 owns the `50 x 20` and must run *after* this step,
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
- `goals_per_match_avg` is re-measured and handed to Step 12 with its reading.
- Step 12 is the only next action.
