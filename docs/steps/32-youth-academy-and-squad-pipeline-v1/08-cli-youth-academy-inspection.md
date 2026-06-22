# Step 08 - CLI Youth Academy Inspection

## Goal

Add a small CLI inspection mode for reviewing one club's youth academy.

## Context

Before UI work, the project needs a simple way to inspect generated youth rosters and verify that names, ages, roles, and broad quality feel credible. This is an inspection tool, not a manager automation feature.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a CLI inspection option for generated or saved youth academies.
- Show selected club youth roster count.
- Show youth player name, age, nationality, primary role, and broad development category.
- Show no exact hidden potential number.
- Show senior/youth totals so overpopulation is visible.
- Support localization through existing label keys.
- Add tests for output shape and no hardcoded presentation labels.

## What NOT to implement

- Do not add UI.
- Do not let CLI choose promotions for the user.
- Do not expose exact hidden potential.
- Do not implement youth match simulation.
- Do not create save writes unless explicitly documented for a career command.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused CLI/i18n tests
- `pnpm check`

## Definition of Done

- A developer/user can inspect youth rosters from CLI.
- Output is localized.
- Inspection does not mutate career state unless explicitly documented.
