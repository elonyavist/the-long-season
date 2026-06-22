# Step 03 - Strength Hierarchy Source Review

## Goal

Determine whether table compression is caused by the simulated strength
hierarchy becoming too flat.

## Context

If league tables are too compressed, the cause may be outside the match result
formula. It may come from:

- club initial strength bands;
- player generation variance;
- development and aging convergence;
- squad refresh and transfer turnover;
- youth refill and promotion quality;
- lineup strength after turnover.

This step reviews the source before tuning anything.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Compare failing worlds against passing worlds using available diagnostics.
- Identify whether strong clubs lose their advantage too quickly.
- Identify whether weak clubs gain too much parity too quickly.
- Identify whether draw/upset behavior is unusually high in failing worlds.
- If needed, add a compact strength-hierarchy diagnostic that reports factual
  aggregates without changing simulation behavior.
- Write the selected cause and rejected causes in the audit.

## What NOT to implement

- Do not tune code before the cause is selected.
- Do not widen thresholds.
- Do not lower draw rates or alter scoring probabilities by default.
- Do not change player generation or development unless the audit proves it is
  the source.
- Do not run the final 250x30 gate.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`
- `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`
- `git diff --check`

## Definition of Done

- The phase has one chosen source for the table-spread anomaly.
- Any rejected source is documented with evidence.
- No broad tuning is done without evidence.
- `docs/PROJECT_STATUS.md` points to the rework step.
