# Step 05 - Save Career Tactic Selection

## Goal

Add a CLI path to save the manager's selected tactic into the career save.

## Context

Phase 8 and Phase 9 introduced demo tactic profiles and manual tactical switch inspection. This step persists the pre-match tactic choice for career progression. It does not add automatic in-match changes.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a save-writing career CLI mode, proposed flag: `--set-tactic-demo=<profile>`.
- Support at least:
  - `pro01-balanced`;
  - `pro01-attacking`;
  - `pro01-defensive`.
- Load the career save.
- Build the selected tactic from the selected demo profile.
- Validate it through the career-state preparation contract.
- Persist the updated career save.
- Print the saved tactic values and selected club.
- Localize all headings and labels.
- Ensure `--summary` and/or `--inspect` show the current saved tactic.

## What NOT to implement

- Do not add automatic tactic switching.
- Do not add multiple saved tactic slots.
- Do not add tactical familiarity.
- Do not add opponent-specific AI advice.
- Do not advance fixtures in this step.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused career CLI/i18n tests
- `pnpm cli career --save=phase25-tactic-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase25-tactic-world --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase25-tactic-world --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase25-tactic-world --summary`
- `pnpm check`

## Definition of Done

- A tactic choice is written to the career save.
- Reloading the save shows the saved tactic.
- The command is localized and deterministic.
- No automatic tactical decision is introduced.
