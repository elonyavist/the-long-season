# Step 03 - Checkpoint A: Ownership And Before-State

## Status

Not started.

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

## Decision

- **GO:** ownership replay is equivalent and production reproduces the diagnosed
  roster/tie/non-countering defects.
- **REFINE:** repair only Steps 01-02 and repeat A.
- **STOP / RETHINK:** production already contains a materially different cause;
  rewrite the next-step premise before changing behaviour.

## Definition Of Done

The report records the decision, cost, before-state xG, population limitations,
and the only authorized next action.
