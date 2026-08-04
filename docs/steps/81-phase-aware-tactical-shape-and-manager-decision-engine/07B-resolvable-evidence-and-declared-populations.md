# Step 07B - Resolvable Evidence And Declared Populations

## Status

Done 2026-08-04. See the handoff note at the end of this document.

## Goal

Make this phase's evidence answer the question it is being read as answering:
attribute each movement to the step that caused it, resolve the formation number
instead of reporting it as unresolved, and measure the decision a manager makes
every single match - which players he fields.

## User-Facing Reason

Phase 81 decides whether the match engine is fun and believable. Every number it
has produced is currently read as a verdict on what a manager's decisions are
worth, and three of them cannot carry that reading. This step is measurement
only: no model, no threshold, no calibration changes.

## Why This Step Exists

Three measurements were taken in one day and all three passed their gates, and
all three answered a narrower question than the one they were read as answering:

- `pnpm cli balance-report` measured football in which no player had attributes.
- `pnpm cli ten-season-report` moved `2.74` to `2.78` across **two** steps and
  the movement was attributed to one of them.
- `tactical-shape-audit.ts` measures a population of clones - `synthesizePlayer`
  builds `uniformAbilities`, and line `1151` says so deliberately - so the
  decision table it produces is structurally silent about which players you pick.

None was a bug. That is the point: a wrong number announces itself and a
correctly-measured number answering a narrower question does not. This step fixes
the three readings and then writes down the rule that prevents a fourth.

## Block 1 - Attribute The Monitor Movement To A Step

`2.74` was recorded at Step 06's commit `05a505c`. The `2.78` reading was taken
after Step 07A. Between them sit Steps 07 and 07A, and neither ran the report, so
`+0.04` belongs to both and to neither.

This is not bookkeeping. A7's rule is that Step 11 is the deadline and, if the
monitor is out of band there, **the fix is reopening Step 06**. Step 07 put actor
edges on a path that already carried player attributes, so it can have moved the
goal rate, and reopening Step 06 for a movement Step 07 caused would reopen the
wrong thing.

Two runs of `pnpm cli ten-season-report`:

| Commit | What it isolates |
|---|---|
| `a62ced4` - Step 07 not yet committed | Step 06's recorded state, re-confirmed today |
| `c1f3bda` - Step 07 committed, 07A not | **Step 07's own delta** |

With Step 07A's own reading already taken, those two give all three deltas.

Run them in a `git worktree`, not by stashing or checking out in place: nothing
in the working tree should move to take a measurement. The worktree needs its own
`pnpm install`, which is the cost of not touching the tree.

Record all three readings in `docs/PROJECT_STATUS.md` under A7, and in Step 07's
document, which currently claims season aggregates were identical - true of the
season golden, which is on the profile-less path, and never measured here.

## Block 2 - Resolve The Formation Number Instead Of Reporting It Unresolved

The decision table says formation moves win share by `0.030` against a noise
floor of `0.0477`, and the phase reads that as "formation is inside the noise".

That floor is `2.7 * 0.5 / sqrt(matches)` at `scenarioPairedSeedCount = 400`,
which is `800` matches: `1.35 / sqrt(800)` = `0.0477`. So the measurement says
**not resolved**, not "worth nothing". Those are different findings and only one
of them is a reason to reopen Step 04.

Resolving it is arithmetic. `1.35 / sqrt(n) < 0.030` needs `n > 2025` matches, so
`DEFAULT_TACTICAL_SHAPE_SCENARIO_PAIRED_SEEDS` goes from `400` to `1050`. That is
roughly `2.5x` the report's runtime, which is the honest price of an answer.

**The experiment is decisive in both directions**, which is why it is worth
running rather than arguing:

- if the difference holds at `0.030` with the floor now at `0.0300`, formation
  counts and the phase has been under-reporting a real manager decision;
- if it shrinks toward `0`, formation genuinely does not matter at this route
  model, and Step 04's reopen has its evidence.

**A lower floor makes every gate stricter, never looser.** If an invariant that
passes at `400` seeds fails at `1050`, it was passing on resolution rather than
on merit, and that is a finding to record and hand on - not a reason to put the
seed count back. No threshold moves in this step.

Leave the audit *test* at its current small seed counts. It gates behaviour, not
balance, and it is already the slowest test in the suite.

## Block 3 - Measure The Decision A Manager Makes Every Match

The audit's clones are correct for isolating shape and wrong for everything else.
Because every player in a lineup is identical, Step 07's actor edges are exactly
`0` in it - an edge is a deviation from the pool, and a pool of clones has none -
so the audit has never measured what the engine's newest causal machinery does.

Two different questions hide behind "does picking players matter", and only the
first is already answered:

1. **Does fielding better players win more matches?** Yes, and it is measured:
   one division tier of squad quality is worth `0.255` win share. Department
   strength prices this through the role-weighted scoring pass.
2. **Within one squad of a given overall quality, does *who* takes the shots
   matter?** Unmeasured. This is precisely what Step 07's actor edges do, and
   nothing in this phase has ever produced a number for it.

Question 2 is the one to add. Field two elevens of the **same mean quality** and
the same department composition, differing only in distribution: one flat, one
concentrated - a standout attacker among ordinary team-mates. Same formation,
same tactics, paired seeds, venues swapped.

Add the result as a row of the decision table, against the same noise floor as
every other row. If concentration is worth nothing, Step 07's actor edges are
decoration and that should be known before Step 11 rather than after release. If
it is worth something, the phase can finally say what squad building is for.

Keep the clone population exactly as it is. It answers question one about shape
and it must not be replaced; this is a second population beside it, and both
declare what they can and cannot see.

## Block 4 - A Measured Number Declares Its Population

The rule that would have caught all three of today's readings, in
`docs/PROJECT_RULES.md` beside the other rules for specific kinds of work:

> Every measured number records the population it was measured on and what that
> population cannot see. A number whose population is not stated is not evidence.

Apply it to the numbers this phase already carries: the decision table says it is
measured on uniform-ability clones and therefore cannot see player selection; the
A7 readings say which commit each was taken at; the balance report says which
paths carry player attributes.

## What To Implement

- Two `ten-season-report` runs in a worktree, at `a62ced4` and `c1f3bda`, with
  all three A7 readings recorded and attributed.
- `DEFAULT_TACTICAL_SHAPE_SCENARIO_PAIRED_SEEDS` from `400` to `1050`, the report
  re-run, and the formation question answered either way.
- A second, non-clone audit population that varies attribute *distribution* at
  constant mean, and one new decision-table row for what it measures.
- The population rule in `docs/PROJECT_RULES.md`, applied to the numbers already
  recorded in `docs/PROJECT_STATUS.md`.

## Clean-Code Requirements

- The new population is a second explicit input, not a flag that quietly changes
  what the existing one means. Both are named for the question they answer.
- No fixture invents a player: the concentrated eleven is built from the same
  synthesizer with an explicit per-slot quality, so the mean is checkable.
- The new decision-table row carries its own noise floor, computed the same way
  as every other row.

## What NOT To Implement

- No model change. `TACTICAL_ROUTE_DEFINITION`, the chain weighting, the actor
  edges, the calibration and every `TACTICAL_SHAPE_THRESHOLDS` value are frozen
  for this step.
- No tuning of any number this step measures, in either direction.
- No cohort run. Step 12 owns the `50 x 20`.
- No UI, storage, or schema work.

## Expected Files

- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `apps/cli/src/commands/tactical-shape-report-data.ts`
- `apps/cli/src/commands/tactical-shape-report.test.ts`
- `docs/PROJECT_RULES.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/07-route-quality-causal-actors-and-explanation-facts.md`
- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/04-relational-phase-matchup-and-route-capacity.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli tactical-shape-report
pnpm cli ten-season-report
graphify update .
```

Plus the two worktree runs of `ten-season-report` from Block 1, which are the
measurement rather than a formality.

## Definition Of Done

- Each of the three A7 readings names the commit it was taken at, and Step 07's
  own effect on the monitor is a number rather than an assumption.
- The formation question has an answer at a noise floor below the effect being
  measured, and that answer is recorded whichever way it came out.
- The decision table has a row for what fielding a differently-distributed eleven
  is worth, measured on a declared non-clone population.
- Every number in `docs/PROJECT_STATUS.md` states the population behind it.
- Nothing was tuned, and any gate that turned red at higher resolution is
  recorded as a finding with its owner.
- Step 08 is the only next action.

## Verification

```text
pnpm check                                    EXIT_REALE=0
Test Files  273 passed (273)
     Tests  1987 passed (1987)
```

### Block 1 - The Monitor Movement Belongs Entirely To Step 07

| Commit | `goals_per_match_avg` | `table_points_spread_avg` |
|---|---|---|
| `a62ced4` - before Step 07 | `2.74` | `42.0` |
| `c1f3bda` - Step 07 committed | `2.78` | `40.1` |
| `465013c` - Step 07A committed | `2.78` | `40.1` |

`a62ced4` reproduces Step 06's recorded `2.74` and `42.0` exactly, which is what
makes the other two rows trustworthy: the command, the seeds and the world are
stable across three months of commits, so a difference between rows is a change
in the engine rather than in the measurement.

**Step 07 owns all of it. Step 07A moved the monitor by zero**, to two decimals -
expected, because this path supplies `aiSelection` and therefore always carried
player attributes, so Block 1 had nothing to add there, and an emergency
goalkeeper is too rare to shift a ten-season aggregate.

**This breaks a live rule and the fix is not this step's to make.**
`docs/PROJECT_STATUS.md` says: *"if Step 11 finds it still out of band, the fix is
reopening Step 06."* That was written because Step 06 owns opportunity volume and
conversion, and it was right at the time. The step that actually last moved the
goal rate is **Step 07**, through actor edges. Reopening Step 06 for a Step 07
movement would reopen the wrong thing, which is precisely the failure the
attribution existed to prevent. Recorded for the phase contract to decide; no
rule was rewritten here.

### Block 2 - Formation Is Resolved, And It Costs Without Paying

At `1050` scenario pairs the win-share noise floor is `0.0295`, down from
`0.0477`. Each row is `2100` matches.

| Formation | Win share against `4-4-2` | Distance from even |
|---|---|---|
| `4-4-2` (the reference, playing itself) | `0.5002` | `0.0002` |
| `4-5-1` | `0.5021` | `0.0021` |
| `4-2-4` | `0.4926` | `0.0074` |
| `5-4-1` | `0.4886` | `0.0114` |
| `3-5-2` | `0.4874` | `0.0126` |
| `3-4-3` | `0.4829` | `0.0171` |
| `4-3-3` | `0.4729` | `0.0271` |
| `4-3-2-1` | `0.4695` | **`0.0305`** |

The largest effect clears the floor by `0.001`. That is resolved at the stated
`2.7` standard errors and it is *barely* resolved; anyone acting on the margin
rather than on the shape of the result should raise the sample again.

The shape of the result is the finding. **Seven of eight curated formations sit
below the reference and none is meaningfully above it**, so formation choice can
cost a manager and cannot pay him - the same one-sided pattern this phase already
documents for tactic settings. "Formation is inside the noise" was never the
finding; it was the absence of one.

**Every frozen invariant still passes at the lower floor**, so none of them was
passing on resolution rather than on merit: `bounded_structural_swing` `0.1238`,
`no_dominant_composition` `0.375`, `no_dominant_tactic` `0.5327`,
`incoherence_costs_a_division_tier` `1.9246`,
`quality_hierarchy_survives_extreme_shape` `0.926`.

### Block 3 - A Standout Attacker Is Worth `0.0098`, Which Is Unresolved

| Measurement | Value |
|---|---|
| Concentrated side win share | `0.5098` |
| Distance from an even contest | `0.0098` |
| Noise floor | `0.0295` |
| Resolved above the floor | **no** |
| Attack strength, flat / concentrated | `14.547` / `14.547` |
| Matches | `2100` |

The premise held exactly: both sides field the same attack department, so this
measured distribution and not squad quality. Had those two numbers differed the
row would have quietly become a quality comparison and its win share would mean
something else.

By this step's own rule, **below the floor is unresolved and not "worth
nothing"**. The sign is positive and consistent; the magnitude is a third of what
this sample can see. Resolving `0.0098` needs `1.35 / sqrt(n) < 0.0098`, so over
`19000` matches - about `9500` pairs, nine times this run.

**It is also the expected size**, which is why nothing was tuned. The shooter
edge is capped at `0.10` of quality and the shooter is drawn from a weighted pool
where attackers carry `5` against a midfielder's `3`, so a standout is on the end
of only some of his side's chances and moves each of them a little.

And it is the *residual*, not the phenomenon. A real star striker also raises
`strength.attack`, which is priced separately and heavily; this experiment held
that constant on purpose. "Does signing a better striker matter" is answered
elsewhere and is large. "Does concentrating the same attacking quality in one man
matter" is what `0.0098` answers.

### What Every Manager Decision Is Worth, On One Scale

The artefact this step exists to produce. Every row measured in the same run at
`2100` matches against the same `0.0295` floor, on uniform-ability clones except
where the row says otherwise.

| Decision | Edge over an even contest |
|---|---|
| fielding a broken shape (`0-0-10`) | `0.4852` |
| one division tier of squad quality | `0.2521` |
| a modest squad-quality gap | `0.1886` |
| the tactic sliders, best setting against worst | `0.0858` |
| an adjacent squad-quality gap, two top clubs | `0.0467` |
| the best structural shape gain (`3-5-2`) | `0.0312` |
| the worst curated formation (`4-3-2-1`) | `0.0305` |
| a standout attacker at equal squad quality | `0.0098`, unresolved |

**One ratio in that table is a product decision nobody has taken.** An adjacent
squad-quality gap is worth `0.0467` and the formation decision is worth `0.0305`,
so between two comparable top clubs *how a manager sets up* is worth about
two-thirds of *having better players*. For a management game that may be exactly
right - it is the genre's promise - but it should be a decision on the record
rather than a ratio that emerged. Raised for the phase contract.

### 2026-08-04 - docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/07B-resolvable-evidence-and-declared-populations.md

- Status: Done
- Outcome: the carried monitor's movement is attributed to Step 07 alone; the
  formation question is resolved and answered; what a standout player is worth at
  equal squad quality has a number for the first time; and every manager decision
  now sits on one scale against one noise floor.
- Adopted solution: measure rather than argue - two worktree runs at past
  commits, `1050` scenario pairs so the floor sits below the effects being read,
  and a second audit population that varies attribute distribution at a mean the
  test asserts is unchanged.
- Verification: `pnpm check` green at `1987/1987`; every frozen invariant still
  passes at the lower noise floor.
- Follow-up: two decisions raised in the phase contract and neither taken here.
  `## Carried Goal-Rate Monitor` now carries the three-commit attribution and
  asks whether Step 06 is still the right thing to reopen when Step 07 is the
  mover. `### The Yardstick` now carries the one-scale table and asks what
  setting up should be worth against having better players, and whether a good
  decision should ever pay rather than only be spared a cost. The yardstick
  itself was refreshed from `0.255` to `0.2521` at the higher resolution; the
  thresholds are fractions of it and the audit reads the measured value in the
  same run, so nothing required an amendment.
- Next action: Step 08.
