# 05 - Tactic Selection And Save Flow

## Goal

Add tactic selection and the first complete save-preparation flow.

The user must be able to select a tactic profile, combine it with a valid
lineup, and save the match preparation.

## Expected files

- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/career/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts`
- Focused `packages/i18n` tests if labels are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Render tactic profile options from structured data.
- Show tactic values clearly:
  - mentality;
  - pressing;
  - directness;
  - width;
  - risk.
- Let the user select one tactic profile.
- Add a save-preparation action.
- Save only when lineup and tactic are both valid.
- Show success state after save.
- Keep any compatibility/status messages factual, not prescriptive.

## What NOT to implement

- Do not add a full tactic editor.
- Do not add automatic tactic switching.
- Do not add a "best tactic" control.
- Do not add tactical recommendations or hidden bonuses.
- Do not simulate the fixture.
- Do not persist to browser storage or JSON saves.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n label tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The user can select a tactic profile.
- Saving is blocked until lineup and tactic are valid.
- Successful save is visible and accessible.
- No hidden recommendation logic was added.
- `docs/PROJECT_STATUS.md` identifies Step 06 as the next action.

