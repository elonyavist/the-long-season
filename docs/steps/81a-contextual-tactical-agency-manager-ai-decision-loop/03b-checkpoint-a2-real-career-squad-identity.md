# Step 03B - Checkpoint A2: Real-Career Squad Identity

## Status

**Done - conditional `GO` recorded 2026-08-08.** Steps 03C-03D are inserted next
to consolidate report tooling before more checkpoint entrypoints exist. The
engine sequence then opens 04-05; Step 06 and everything after it remain closed
until Step 05 restores the low-block band on both seed sets. Report:
`docs/audits/PHASE_81A_CHECKPOINT_A2_SQUAD_IDENTITY.md`.

All seven frozen gates passed on **both** seed sets, the guardrails were
evaluated, and the archetype-mix counterfactual moved `6` of `6` clubs at
constant squad quality. One guardrail broke out-of-sample; A2.1 excluded the
chart component as its demonstrated cause without claiming to reconstruct the
complete pre-81A population - see *Checkpoint A2.1*.

| Gate | Before | In-sample | Out-of-sample | Target |
|---|---:|---:|---:|---|
| `topFormationShare` | `0.9286` | `0.2063` | `0.2222` | `<= 0.50` |
| `distinctFormationCount` | `3` | `12` | `11` | `>= 6` |
| primary roles positive | `7`/`10` | `10`/`10` | `10`/`10` | `= 10` |
| distinct modal shapes | n/a | `7` | `7` | `>= 3` |
| reorder invariance | trivial | `1.0000` | `1.0000` | `= 1` |
| `meanOutOfPositionSlots` | `0.0000` | `0.0000` | `0.0000` | `<= 0` |
| identities observed | n/a | `8`/`8` | `8`/`8` | `= 8` |

The out-of-sample set is the load-bearing column. Those seven seeds were never
used for selection, tuning or inspection, and they land within `1.6` points of
the in-sample set. A result fitted to seeds does not do that.

**The causality debt is discharged.** Checkpoint A recorded "the absent roles
cause the monoculture" as an *inference*. The counterfactual holds each club's
twenty-two footballers - abilities, ages, condition, contracts - and re-roles
them onto each identity's chart. Every one of the six clubs tested changed
shape, one of them producing eight distinct shapes from eight identities.
Observing new roles and new shapes together would not have shown this.

**This checkpoint does not replace Checkpoint A and does not erase its
`STOP / RETHINK`.** It is a post-correction checkpoint with its own report. The
Checkpoint A before-state stays frozen and is the denominator of every delta
below.

## Goal

Decide whether squad identity made the shape a consequence of the footballers,
without buying variety with an artificial quota.

## Preregistered Targets

**Frozen before Step 03A is implemented.** Nothing here may be moved after
reading output; a target that stops passing at higher resolution was passing on
resolution.

### Primary gates

| Gate | Before-state | Target |
|---|---:|---|
| `topFormationShare` | `0.9286` | `<= 0.50` |
| `distinctFormationCount` | `3` of `23` | `>= 6` |
| primary roles with a positive count | `7` of `10` | **`10` of `10`** |
| archetypes whose modal shape differs | not applicable | `>= 3` distinct modal shapes |
| catalog-reorder invariance | trivially held | **`100%` of selections** (see *Method Correction*) |
| `meanOutOfPositionSlots` | `0.0000` | `<= 0.0000` |
| squad identities present in **both** seed sets | not applicable | **all `8`** |

### Two different elevens are called out of position, and only one is gated here

`meanOutOfPositionSlots` is `0.0000` in the before-state, and Step 03A found
that four of every eleven were played at `weak` or `invalid` suitability. Both
are true, because they are not the same eleven.

- **This gate counts the eleven the AI selects.** `selectCareerAiTeam(...)`
  scores every candidate against every slot, so it does not field a footballer
  out of position unless the squad leaves it no choice. `0.0000` says the
  selector was working, and it must stay `0.0000`.
- **Step 03A's four were the opening eleven content *built***, from a chart in
  which `positionForSlot(...)` and `canonicalRoleForSlot(...)` were two
  different tables. That eleven was never selected by anything; it was asserted
  into existence by a disagreement, and it is now derived through
  `naturalCanonicalRoleForPosition(...)`.

Without this distinction the two documents read as contradicting each other.
They do not: the selector was never the defect.

### Coverage, and what it costs A2

**Every one of the eight squad identities must appear in both seed sets.** An
identity that no club drew in a set has no modal shape in that set, and a modal
shape computed from zero clubs is not a weak result - it is an absent one.

Where an identity is missing, its modal-shape row is recorded
`not_evaluated`, and **`not_evaluated` is not a pass**: the
`>= 3 distinct modal shapes` gate may not be cleared using rows that were never
observed, and **A2 cannot record `GO`** while any identity is unevaluated in
either set. The remedy is more seeds, never a smaller identity table.

`0.50` is not a variety quota dressed up as a gate. It is the point at which no
single shape is the answer for a majority of the world, which is the smallest
statement that falsifies "one skeleton, one answer". A number chosen to be
comfortably reachable would measure the archetype count rather than the
football.

### What is deliberately not gated

**`meanBestMinusSecond` has no target and may rise.** A squad with a clearly
better shape is healthy football. The defect was never that the margin is large;
it was that almost every squad has the *same* large margin. Gating the margin
down would push generation toward squads that fit nothing well, which is a worse
world than the one being fixed.

`4-2-4` is not the problem and is not banned. It may remain the most frequent
shape provided it is no longer the answer for nearly everybody.

### Out-of-sample

Every gate above is evaluated twice:

1. on the **same seven world seeds** as the Checkpoint A before-state;
2. on a **second set of seven seeds never used** for selection, tuning or
   inspection.

A gate that passes only on the first set is a gate that measured the seeds.
Both sets are declared in the report before it is read.

### Non-regression guardrails

These were already passing in the before-state. They may **never** be cited as
evidence that this step improved anything; they exist so it cannot make anything
worse.

- `concededExpectedGoalsReduction >= 0.08` and
  `ownLossPerConcededReduction <= 2.0`.
- Squad size, division quality bands, age distribution, rarity budgets and the
  exceptional-player allocation unchanged.
- `no_dominant_composition`, `no_dominant_tactic` and `no_dominant_formation`
  keep their original readers and `0.55`.

### Causality, still owed

Checkpoint A recorded that "the absent roles cause the monoculture" is an
inference. This checkpoint is where it is either demonstrated or withdrawn:
**changing only the archetype mix must move the chosen shape**, with squad
quality held constant. Observing new roles and new shapes together is not the
same claim and does not discharge it.

## Experiment

Re-run the Step 02 population through its locked migrated Interface:
`pnpm cli simulation-report --profile=phase81a-a2`,
exactly `7` workers, same rounds, same denominators, both seed sets. The
instrument is not modified for this checkpoint; an instrument changed alongside
the thing it measures attributes nothing.

### Method Correction Made Before Execution: Reorder Invariance Is Proved, Not Replayed

**Written before any A2 output existed. No target moves; `100%` stands.**

This paragraph used to say invariance was "measured by selecting each squad
twice, once with `FORMATIONS` reversed… asserted, not inferred from
`tiedAtBestCount`". The code does not allow it and does not need it.

`FORMATIONS` is a module-level `readonly Formation[]`
(`packages/domain/src/tactics/formations.ts:164`), imported statically by
`ai-squad-selection.ts:3` and walked at line `479`. **There is no seam to inject
a reordered catalog**, so "select with `FORMATIONS` reversed" would mean editing
the engine selector - the thing under test, and not in this step's
`Expected Files`. An instrument changed alongside the thing it measures
attributes nothing; a *subject* changed to be measured is worse.

It is unnecessary because invariance here is a theorem, not an inference.
`strongestCatalogShape(...)` keeps the **first strict maximum**:

- `tiedAtBestCount === 1` - the maximum is unique, so no permutation of the
  catalog can change which shape wins. Invariant, provably.
- `tiedAtBestCount >= 2` - the winner is the first tied entry in catalog order.
  Reversal makes the winner the *last* one instead, which is a different shape
  whenever two or more are tied. Not invariant, provably.

So **invariant iff `tiedAtBestCount === 1`**, and
`reorderInvariantShare = 1 - tieDecidedShare` **exactly**, not approximately.
The engine says the same thing at `ai-squad-selection.ts:444-452` - "this number
*is* the catalog-order sensitivity rather than a proxy for it" - and warns
against precisely the second copy the old wording asked for, "where a second copy
would be free to disagree with the shape clubs actually line up in".

The gate is not weakened. The document's own worry - that archetypes may
reintroduce real ties - is exactly what makes this falsifiable: any real tie
puts `tieDecidedShare > 0`, `reorderInvariantShare < 1`, and the gate **fails**.
It also removes a second full selection pass over every squad, which would have
doubled the checkpoint's cost to re-derive a number the first pass already
determines.

## Checkpoint A2.1: The One Broken Guardrail, Chart Component Isolated

`ownLossPerConcededReduction` read `2.8051` against `<= 2.0` on the out-of-sample
seeds. Two things had to be established before that could mean anything.

**First, the instrument was too weak to carry the decision.** The low block read
`worldSeeds[0]` only - one world, two clubs. Between the two seed sets it swung
`1.5932` to `3.7039`, a spread one world cannot distinguish from the population
moving. It now pools all seven worlds per set, with the **goals added and the
ratios re-derived from the totals**, never the ratios averaged: the exchange rate
is a quotient whose denominator can approach zero, so a world that saved almost
nothing would dominate a mean of ratios while contributing almost no football to
it. The band was not touched; only the denominator under it grew.

Widening did not rescue the reading. Out-of-sample settled at `2.8051` and
in-sample rose to `1.8938` - closer to the edge, not further from it. **It was
not noise.**

**Second, a broken non-regression guardrail needs its tested component named.**
A2.1 re-runs it with the pre-Phase-81A chart over the same seeds, clubs and
twenty-two footballers per club - same abilities, ages and contracts. The arms
differ only in the chart they are re-roled onto.

That is a chart ablation, not the old population. `fakePlayer(...)` passes the
generated `primaryRole` into `buildContextualProspectJointProfile(...)`, so both
arms retain ability vectors produced from Phase 81A roles. Reconstructing the
complete legacy population would need a coupled legacy role-conditioned ability
generator. A2.1 therefore establishes whether the **chart component** caused
the failure; it cannot absolve the whole Step 03A generation change.

| Set | pre-81A skeleton | Phase 81A identities | Attribution |
|---|---:|---:|---|
| out-of-sample | `3.0411` | `2.8051` | `legacy_chart_also_fails` |
| in-sample | `1.7141` | `1.8938` | `not_reproduced` (both held) |

**The legacy chart does not restore the guardrail out-of-sample; it fails worse
on the current ability vectors.** This rules out an adverse chart effect on that
set. The opposite signed differences between the two pooled sets are recorded
without being called noise: two aggregate ratios do not estimate a noise floor.

The primary A2 result remains `GO`, but its authorization is conditional. A
`step_03a_chart` attribution still forces `REFINE`; `legacy_chart_also_fails`
opens tooling Steps 03C-03D and then engine Steps 04-05. It does not encode
`pre_existing`, because that would claim a population the experiment did not
reproduce.

**The band is still violated by both chart arms, and that is escalated to Step
05** - which exists to repair the low block's trade-offs. Step 06 and everything
after it stay closed until Step 05 meets the same band on both seed sets. Two
corrections belong on the record with it: the
`<= 2.0` guardrail had only ever been checked against a one-world reading, and
an earlier note in this session framed the failure as "a scope line blocking
thirteen steps". The value is a real finding; only its ownership was in doubt.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_A2_SQUAD_IDENTITY.md`
- `docs/audits/PHASE_81A_CHECKPOINT_A2_1_LOW_BLOCK_ATTRIBUTION.md` **(new,
  generated)** - A2.1's raw arms. Written by the command, never hand-edited.
- `apps/cli/src/commands/tactical-agency-report/checkpoint-a2.ts` **(new)** -
  gate evaluation, guardrails and the decision. Separate from the Step 02
  command because A2 is a *decision* document and the before-state is a
  measurement: this file says pass or fail, which the before-state deliberately
  never does.
- `apps/cli/src/commands/tactical-agency-report/checkpoint-a2.test.ts` **(new)** -
  pins the chart-only attribution vocabulary, conditional authorization and
  data-derived rendering.
- `packages/simulation-tools/src/index.ts` - four new exports.
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts` -
  removes a stale `7_000` per-test timeout that predates and overrides the
  canonical `30_000` full-suite budget in `vitest.config.ts`; the isolated test
  passes unchanged in `5.36s`.
- `apps/cli/src/commands/tactical-agency-report.ts`
- `apps/cli/src/commands/tactical-agency-report.test.ts` - injects the canonical
  checkpoint result so command wiring never re-simulates the cohort in a unit
  test.
- `apps/cli/src/commands/tactical-agency-report/agency-world.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `README.md` - records the conditional authorization in the phase sequence.
- `../README.md` - points the global step index at active Step 03C rather than
  the long-completed Step 01.
- `03c-canonical-modular-simulation-report-foundation.md` **(new)** - the next
  tooling step, inserted before more checkpoint entrypoints are added.
- `03d-report-module-migration-and-single-cli-entrypoint.md` **(new)** - closes
  the migration and deletes every superseded report command surface.
- `04-conserved-tactical-contributions.md`
- `05-contested-routes-and-lateral-focus.md` - owns the live low-block repair
  that conditions A2's downstream authorization.
- `06-checkpoint-b-structural-ceiling.md` - stays closed until Step 05 proves
  the low-block band on both seed sets.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-a2
pnpm check
git diff --check
```

The cohort and `pnpm check` run separately, each alone.

## Decision

- **GO:** every primary gate passes on both seed sets and the archetype-mix
  counterfactual moves the chosen shape. Steps 03C-03D consolidate the report
  tooling first. All guardrails holding then opens Steps 04-16;
  `legacy_chart_also_fails` opens only 04-05 until Step 05 restores the
  low-block band on both seed sets.
- **REFINE:** reopen only Step 03A. Targets do not move; the checkpoint repeats.
- **STOP / RETHINK:** squad identity does not change the chosen shape, or variety
  arrives only through a quota, a formation hint, or degraded squads. Record the
  cause and rewrite the premise again rather than opening structural work.

## Deferred To This Checkpoint's Numbers: Formation-Named Blueprints

Raised while 03A was open, deliberately **not** acted on before A2 runs.

The proposal is to name each squad identity after a primary formation - `4-3-3`,
`3-5-2`, `4-2-3-1` - and generate the squad from it, plus one or two compatible
shapes so an injury or an opponent cannot make the squad unusable.

**Most of it is already built.** The eight identities are squads, not abstract
role bags, and they already map onto formation families: `wide_midfield_stock`
is a `4-4-2` exactly, `winger_stock_and_strike_pair` is a `4-2-4`,
`wing_back_pairing` a `3-4-2-1`, `holder_heavy_low_build_up` a `5-4-1`,
`holding_pair_and_strike_pair` a `4-3-1-2`. What the proposal adds is the
*name*, which is a real gain in legibility for whoever reads content next, and
no change in behaviour.

Three things must be settled by measurement rather than by preference, which is
why it waits for this checkpoint:

1. **Two identities already collide.** `creator_and_wingers` and `creator_trio`
   are both `4-2-3-1` families. If A2 shows they select the same shape, an
   explicit primary formation is the right way to separate them - and A2 will
   have said why. If they select differently, there is nothing to fix.
2. **Catalog-reorder invariance cannot police this.** It proves the selector
   does not break ties by catalog order. It says nothing about whether a squad
   built for one shape always produces that shape, because there the label acts
   *through the footballers*, which is the intended design. Naming formations
   without a new gate would replace one global monoculture with many local ones
   and leave every existing test green. The gate that would be needed - how
   often the chosen shape differs from the blueprint - only becomes measurable
   once squads have drifted through transfers, injuries and growth, so it is
   career work and not generation work.
3. **Compatible shapes cost depth the budget does not have.**
   `MINIMUM_CAREER_DEPARTMENT_DEPTH` reserves `17` of `22`. Requiring a `4-3-3`
   squad to also field `4-2-3-1` and `4-1-4-1` means stocking wingers *and* a
   creator *and* a holding pair, and squads converge. Today's variety lives
   mostly in **absence** - `wing_back_pairing` owns no full-back at all,
   `winger_stock_and_strike_pair` no creator - which is exactly what Step 03A's
   second rule protects.

**Decide after this checkpoint reports, never before.** Changing generation now
would re-freeze the before-state this checkpoint exists to measure against.

## Verification

- Canonical checkpoint: exit `0`, exactly `7` workers, both reports regenerated
  from one `CheckpointA2Report`; A2.1 reuses each current low-block arm and runs
  only the additional legacy-chart arm.
- Focused path: `31` tests passed across command, checkpoint decision and
  tactical-agency audit; lint, dependency cruise and localized-text check pass.
- Full `pnpm check`: `292` files, `2260` tests, `854` modules, exit `0`.
- The first full run exposed a stale local `7_000` timeout in
  `tactical-shape-audit.test.ts`. The unchanged file passed alone in `5.36s`;
  removing that pre-`vitest.config.ts` override restored the canonical `30_000`
  full-suite budget. The same isolated file then passed `37`/`37` in `5.20s`.

## Lessons

- **The primary gates were never the risk; the guardrails were.** Every headline
  number passed by a wide margin, and the checkpoint still came back `REFINE`
  twice before it came back `GO`. Reading the seven gates and stopping would
  have opened thirteen steps over an unexamined `2.8051`.
- **An instrument that samples one world cannot carry a decision.** The low
  block had been read on `worldSeeds[0]` since Step 02, and its band was fitted
  against that. Widening it changed both numbers and, more importantly, made the
  question answerable at all.
- **Name the component a counterfactual actually changes.** A2.1 holds current
  abilities fixed and changes the chart, so it can clear or implicate the chart
  component. Calling that arm the old population would overstate its evidence.

## Definition Of Done

The report records both seed sets, both evaluations, the frozen targets as
written here, the causality result, the guardrails, exactly `7` workers, cost,
and the decision. This `GO` authorizes tooling Steps 03C-03D, then engine Steps
04-05; Step 06 remains closed until Step 05 restores the low-block guardrail on
both seed sets.
