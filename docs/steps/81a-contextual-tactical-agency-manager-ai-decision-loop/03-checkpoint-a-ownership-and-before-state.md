# Step 03 - Checkpoint A: Ownership And Before-State

## Status

**Done 2026-08-07. Decision: STOP / RETHINK.**

Report:
[`PHASE_81A_CHECKPOINT_A_BEFORE_STATE.md`](../../audits/PHASE_81A_CHECKPOINT_A_BEFORE_STATE.md).

The next authorized action is **not** Step 04. It is
[`03a-squad-archetypes-and-primary-role-reachability.md`](03a-squad-archetypes-and-primary-role-reachability.md),
followed by
[`03b-checkpoint-a2-real-career-squad-identity.md`](03b-checkpoint-a2-real-career-squad-identity.md).
Steps 04 onward stay closed until Checkpoint A2 records a GO.

## Goal

Decide whether the documented causes describe production before any structural
behaviour changes.

## Experiment

Run alone:

- Step 01 paired before/after replay;
- two independent real-career cohorts from Step 02;
- static role-weight totals;
- uniform `23 x 23` formation matrix;
- paired `low_block`/neutral xG baseline.

Preregister population, seed prefixes, throughput, exactly `7` workers, matches,
wall clock, metrics, intervals, and GO/REFINE/STOP before reading output.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_A_BEFORE_STATE.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/tactical-agency-report.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `04-conserved-tactical-contributions.md`

## Required Checks

```bash
nvm use 24
pnpm cli tactical-agency-report --checkpoint=a --workers=7
pnpm check
git diff --check
```

The simulation command and `pnpm check` run separately.


## Outcome

Run alone. Four readings, one decision.

- **Ownership replay: equivalent.** The intended paired replay was impossible -
  `controlWeight(...)` has no injection point, and both an engine legacy switch
  and a second minute loop are refused. The authorized fallback ran instead:
  `legacyPhase81ControlWeightReference(...)` against the migrated asset over the
  complete `0..1` knob space, `390625` points, **`0` differing**. The gate is
  non-vacuous: a one-basis-point drift and a flipped direction are each caught.
  A golden hash was not needed - the other four Step 01 changes provably cannot
  reach a match, so the report carries a proof rather than a witness.
- **Uniform matrix: reproduced**, cited from the Phase 81 report rather than
  regenerated, since Step 01 is proven to have moved nothing.
- **No material contextual response: reproduced.** One deterministic best answer
  to all `23` opponents; counter-move gain below its own noise floor.
- **Tie bias: falsified.** `tieDecidedShare` is `0.0000` on `378` real
  selections. `4-2-4` wins `92.86%` by a mean structural margin of `0.7610`.

`GO` is impossible with a preregistered signal falsified, and rewriting the
signal after reading output would be relaxing a threshold whatever the intent.
`REFINE` is excluded: the instrument is sound. `STOP / RETHINK` is adopted on the
clause's stated purpose - update the diagnosis before touching the model.

The report records explicitly that the STOP clause's *literal* wording
anticipated the opposite population, so no future reader concludes that stable
variety was observed.

## Lesson That Changes Future Work

The remedy direction survives; its mechanism does not. Work scoped to **break
ties** becomes work to **make the winning shape depend on the squad**. Adding the
three missing roles to every club would trade a `4-2-4` monoculture for a
`4-2-3-1` one.

## Decision

- **GO:** ownership replay is equivalent and production reproduces the diagnosed
  roster/tie/non-countering defects.
- **REFINE:** repair only Steps 01-02 and repeat A.
- **STOP / RETHINK:** production already contains a materially different cause;
  rewrite the next-step premise before changing behaviour.

## Definition Of Done

The report records the decision, cost, before-state xG, population limitations,
and the only authorized next action.
