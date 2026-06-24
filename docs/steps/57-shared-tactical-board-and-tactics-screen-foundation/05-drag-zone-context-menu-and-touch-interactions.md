# 05 - Drag Zone Context Menu And Touch Interactions

## Goal

Implement the tactical-board interactions: constrained drag, contextual role
changes, removal, assignment, goalkeeper lock, and touch long press.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-interactions.ts`
- `apps/web/src/features/tactics-board/tactical-board-interactions.test.ts`
- `apps/web/src/styles/components.css`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Add pointer drag for non-goalkeeper occupied slots.
- Show only the active slot's movement zone during drag.
- Hide the movement zone on release/cancel.
- Clamp movement to the slot role's movement zone.
- Keep goalkeeper fixed:
  - no drag;
  - no role change;
  - assignment still allowed.
- Add context menu for occupied player tokens:
  - change role;
  - remove from lineup.
- Add context menu for empty slots:
  - list available players;
  - show fitness;
  - show suitability for the slot role.
- Generate role-change options from the slot's current normalized position.
- Ensure ED dragged forward into attacking-right area can expose AD as a role
  option.
- Add touch long press for occupied and empty slots:
  - opens the same menu as right-click;
  - cancels when pointer movement exceeds a small threshold;
  - cancels on pointerup/pointercancel before timeout.
- Preserve keyboard access through focusable controls and menu buttons.

## What NOT To Implement

- Do not implement opponent mirror.
- Do not implement live matchday changes.
- Do not make drag the only way to perform a role change.
- Do not allow goalkeeper role changes.
- Do not store pixel values.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/features/tactics-board/tactical-board-interactions.test.ts apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- Drag zone appears only during drag.
- CC cannot be moved into the attacking third.
- Goalkeeper does not move and cannot change role.
- ED forward plus context role change can become AD.
- Remove clears only `playerId`.
- Empty slot assignment lists only non-XI players.
- Long press opens the menu and respects movement cancellation.
