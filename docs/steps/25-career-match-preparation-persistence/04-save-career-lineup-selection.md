# Step 04 - Save Career Lineup Selection

## Goal

Add a CLI path to save the manager's selected lineup into the career save.

## Context

The first implementation can use deterministic demo lineup profiles because there is no UI yet. The important part is the persistence contract: the saved lineup must become the manager's current explicit choice and be visible after reload.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a save-writing career CLI mode, proposed flag: `--set-lineup-demo=<profile>`.
- Support at least:
  - `pro01-first-team`;
  - `pro01-rotated`.
- Load the career save.
- Build the selected lineup from the selected club roster.
- Validate it through the career-state preparation contract.
- Persist the updated career save.
- Print the saved lineup, selected club, and whether it applies to the next selected-club fixture.
- Localize all headings and labels.

## What NOT to implement

- Do not add a free-form player-ID parser unless required by the step implementation.
- Do not auto-pick the "best" lineup.
- Do not change player condition in this step.
- Do not advance the fixture.
- Do not add tactic persistence in this step unless the contract requires an existing tactic placeholder.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused career CLI/i18n tests
- `pnpm cli career --save=phase25-lineup-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase25-lineup-world --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase25-lineup-world --inspect`
- `pnpm check`

## Definition of Done

- A lineup choice is written to the career save.
- Reloading the save shows the saved lineup.
- The operation is deterministic and localized.
- The system still does not choose a lineup automatically.
