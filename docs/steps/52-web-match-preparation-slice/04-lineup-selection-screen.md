# 04 - Lineup Selection Screen

## Goal

Render the first practical lineup selection UI inside the Phase 51 career shell.

The user must be able to inspect and change the selected lineup slots without
the system choosing a best XI for them.

## Expected files

- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts`
- Focused `packages/i18n` tests if labels are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a match-preparation screen in the central shell outlet.
- Show next fixture context prominently.
- Show selected club context.
- Show lineup slots in a stable order.
- Let the user choose players per slot using accessible controls.
- Show player role/position/condition facts needed for selection.
- Show duplicate/missing slot blockers as structured status, not hidden
  validation.
- Ensure the screen is usable by keyboard.
- Keep the UI dense and manager-game appropriate.

## What NOT to implement

- Do not add drag-and-drop.
- Do not add automatic best XI.
- Do not add hidden player recommendations.
- Do not build a full squad-management screen.
- Do not show market/squad-needs advice.
- Do not add player development, contracts, or finances.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n label tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The match-preparation screen renders in the central shell outlet.
- The user can change lineup slot selections with accessible controls.
- Incomplete or duplicate lineup states are visible and block saving.
- The UI does not imply automatic recommendations.
- `docs/PROJECT_STATUS.md` identifies Step 05 as the next action.

