# Step 07 - Turnover And Age Distribution Metrics

## Goal

Extend long-run reports with enough metrics to judge whether squad refresh works.

## Context

The final gate needs measurable evidence, not anecdotes. This step exposes age, exits, intake, transfer movement, squad size, and role-balance metrics.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/*.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Track exits per season and by reason.
- Track intake count per season.
- Track transfer-turnover count per season.
- Track league and club age buckets: under 21, 22-29, 30+.
- Track squad size min/avg/max.
- Track clubs below minimum squad size.
- Track clubs without natural goalkeeper coverage.
- Track role/department coverage warnings.
- Add anomaly scoring for refresh-specific failures.

## What NOT to implement

- Do not widen thresholds to make the report pass.
- Do not tune match engine.
- Do not add UI or visual dashboards.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- focused metric/scoring tests
- `pnpm check`
- long-run report smoke command

## Definition of Done

- The report can explain whether squad refresh succeeded or failed.
- The previous age distribution failure can be measured directly.
- Missing-system warnings are replaced by real turnover metrics.

