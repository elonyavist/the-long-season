# Step 04 - Club And Market Stability Metrics

## Goal

Add club, squad, and market stability metrics to the ten-season report.

## Context

Even a good match engine fails if squads freeze forever or market turnover becomes absurd. This step measures that behavior before adding deeper market systems.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Track champions and repeated dominance.
- Track selected-club league finishes.
- Track squad age and turnover when available.
- Track transfer count/value when market simulation is available.
- Mark metrics unavailable instead of faking them.
- Keep missing-market-depth limitations explicit.

## What NOT to implement

- Do not implement advanced market AI in this metrics step.
- Do not fabricate transfer metrics if the engine does not have the data.
- Do not add UI.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- focused long-run metric tests
- `pnpm check`

## Definition of Done

- The report makes club dominance and squad stability visible.
- Missing systems are reported as missing, not hidden.

