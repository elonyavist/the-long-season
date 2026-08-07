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

## Definition Of Done

The report records both seed sets, both evaluations, the frozen targets as
written here, the causality result, the guardrails, exactly `7` workers, cost,
and the decision. Step 04 is authorized only by a `GO`.
