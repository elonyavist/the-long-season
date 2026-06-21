# Step 05 - Balance And Anomaly Scoring

## Goal

Add a scoring layer that highlights long-run anomalies.

## Context

The final report should not just print tables. It should call out suspicious outcomes that require tuning or new systems.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Score goals, points, table spread, and repeated dominance.
- Score top-assist plausibility and creator concentration.
- Score player-development anomalies.
- Score age-distribution anomalies.
- Score missing metric categories explicitly.
- Provide PASS/WARN/FAIL statuses with deterministic thresholds.

## What NOT to implement

- Do not tune engine values in this step.
- Do not hide failures by widening thresholds.
- Do not add UI.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- focused scoring tests
- `pnpm check`
- ten-season report smoke command defined by the phase

## Definition of Done

- The report can identify likely long-run design problems.
- Thresholds are documented and deterministic.
- Repeated top-assist values of `16+`, any top-assist value of `19+`, or excessive top-one/top-three creator share can produce WARN/FAIL without changing engine values in this step.
