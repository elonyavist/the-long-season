# Step 05 - Career Advance CLI

## Goal

Add the first save-writing career progression command.

## Context

After this step, the user should be able to load a career save, advance the selected club's next fixture, write the updated save, and inspect the persisted result.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add `pnpm cli career --save=<saveId> --advance-next-fixture`.
- Load the career save.
- Advance the selected club's next fixture using the progression contract.
- Persist the updated career state.
- Print the fixture result, next action, and save confirmation.
- Localize new user-facing text.

## What NOT to implement

- Do not advance a full round unless no narrower selected-club path is feasible.
- Do not add calendar month/week simulation.
- Do not add AI transfer activity.
- Do not add automatic lineup/tactic changes.
- Do not add UI.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused career CLI/i18n tests
- `pnpm cli career --save=phase23-advance-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase23-advance-world --summary`
- `pnpm cli career --save=phase23-advance-world --advance-next-fixture`
- `pnpm cli career --save=phase23-advance-world --inspect`
- `pnpm check`

## Definition of Done

- The career save changes after advancing.
- Reloading the same save shows the fixture as played.
- The command output is localized and deterministic.
