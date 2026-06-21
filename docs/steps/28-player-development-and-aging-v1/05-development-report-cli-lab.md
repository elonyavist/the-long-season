# Step 05 - Development Report CLI Lab

## Goal

Expose a lab report that shows player development across multiple season rollovers.

## Context

This is not final UI. It is an inspection tool to decide whether the growth model feels credible before the ten-season report.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/parse-career-args.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a narrow lab report flag or extend the rollover lab output.
- Show aggregate development, not hidden exact potential.
- Include selected-club examples: biggest improver, biggest decline, prospects that stalled, veterans declining.
- Keep all user-facing labels localized.
- Do not write saves unless the command explicitly says it does.

## What NOT to implement

- Do not add a polished gameplay command.
- Do not expose exact hidden potential.
- Do not add UI.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- deterministic development report smoke command defined by this step.

## Definition of Done

- The project can inspect development outcomes before Phase 30.
- Output is useful for tuning without becoming UI scope.

