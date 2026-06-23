# 06 - Dashboard And Inbox Preparation Resolution

## Goal

Wire saved match preparation back into the dashboard and Inbox/Posta flow.

After the user saves lineup and tactic, the dashboard should stop showing
preparation blockers, and Continue should be able to move to matchday-ready
behavior in the current web prototype.

## Expected files

- `apps/web/src/App.tsx`
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

- Add navigation from dashboard actions to match preparation.
- Add navigation from Inbox/Posta action to match preparation.
- After successful save:
  - update dashboard preparation facts;
  - clear missing-lineup/missing-tactic blockers;
  - make Continue available for the current prototype state.
- Ensure `Attention required` and `Blockers` are not buried at the bottom when
  they are the primary current-state issue.
- Preserve the left Inbox/Posta rail.
- Keep the central outlet as the selected screen area.
- Add tests for:
  - before-save dashboard blocker state;
  - after-save dashboard blocker state;
  - Inbox action opens preparation;
  - Continue no longer stops on missing preparation after save.

## What NOT to implement

- Do not play the match.
- Do not write a career save.
- Do not add real calendar advancement beyond the existing prototype Continue
  behavior.
- Do not implement a full Inbox decision center.
- Do not add unrelated dashboard cards.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n label tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Dashboard and Inbox/Posta can open match preparation.
- Saving valid preparation clears the visible dashboard blockers.
- Continue reaches matchday-ready behavior rather than missing-preparation
  behavior after save.
- Critical blockers/attention state are visible in the first useful viewport.
- `docs/PROJECT_STATUS.md` identifies Step 07 as the next action.

