# Step 07 - Long-Run Youth Metrics

## Goal

Expose youth-academy population and lifecycle metrics in the long-run report.

## Context

The main risk of Phase 32 is overpopulation. The report must show whether youth rosters remain bounded and whether promotions/exits actually support senior squad health.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add long-run metrics for:
  - total active senior players;
  - total active youth players;
  - total active players;
  - youth players per club min/avg/max;
  - annual youth intake count;
  - youth age-out/release count;
  - youth promotion count;
  - selected-club youth size;
  - clubs above youth-size target;
  - clubs below youth-size minimum if any.
- Add anomaly checks for overpopulation and underpopulation.
- Keep warnings separate from failures.
- Localize all new report labels.
- Add tests for metric aggregation and anomaly scoring.

## What NOT to implement

- Do not add UI.
- Do not add youth match reports.
- Do not change match balance.
- Do not hide population problems by widening thresholds without evidence.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused simulation-tools/CLI/i18n tests
- `pnpm check`

## Definition of Done

- Long-run reports show whether the youth model is bounded.
- Youth population anomalies are machine-readable.
- The report is useful before any UI work starts.
