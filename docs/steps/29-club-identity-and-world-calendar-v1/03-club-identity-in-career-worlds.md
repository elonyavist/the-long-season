# Step 03 - Club Identity In Career Worlds

## Goal

Make career creation and inspection use generated club identity consistently.

## Context

Club names must show up where the user inspects saves and long-run lab reports. IDs remain technical; display names become meaningful.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Ensure new-world preview prints readable selected club and competition club names.
- Ensure simulate-season table uses generated display names when available.
- Keep technical IDs available only where useful for debugging.
- Localize headings and labels.
- Add tests for English and Italian if user-facing output changes.

## What NOT to implement

- Do not add UI.
- Do not add real club names.
- Do not change match outcomes.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`

## Definition of Done

- Career and simulation outputs are readable enough for Phase 30 reports.
- Club IDs remain stable machine data.

