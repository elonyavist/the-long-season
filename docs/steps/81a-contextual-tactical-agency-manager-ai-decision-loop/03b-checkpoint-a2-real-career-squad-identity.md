# Step 03B - Checkpoint A2: Real-Career Squad Identity

## Status

Not started; requires Step 03A Done.

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
| catalog-reorder invariance | trivially held | **`100%` of selections** |
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

Re-run the Step 02 instrument unchanged: `pnpm cli tactical-agency-report`,
exactly `7` workers, same rounds, same denominators, both seed sets. The
instrument is not modified for this checkpoint; an instrument changed alongside
the thing it measures attributes nothing.

Catalog-reorder invariance is measured by selecting each squad twice, once with
`FORMATIONS` reversed, and comparing the chosen shape. It is asserted, not
inferred from `tiedAtBestCount`, because archetypes may reintroduce real ties.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_A2_SQUAD_IDENTITY.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/tactical-agency-report.ts`
- `apps/cli/src/commands/tactical-agency-report/agency-world.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `04-conserved-tactical-contributions.md`

## Required Checks

```bash
nvm use 24
pnpm cli tactical-agency-report --checkpoint --workers=7
pnpm check
git diff --check
```

The cohort and `pnpm check` run separately, each alone.

## Decision

- **GO:** every primary gate passes on both seed sets, the guardrails hold, and
  the archetype-mix counterfactual moves the chosen shape. Steps 04-16 open.
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

## Definition Of Done

The report records both seed sets, both evaluations, the frozen targets as
written here, the causality result, the guardrails, exactly `7` workers, cost,
and the decision. Step 04 is authorized only by a `GO`.
