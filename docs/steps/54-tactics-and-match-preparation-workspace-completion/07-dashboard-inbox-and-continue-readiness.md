# 07 - Dashboard Inbox And Continue Readiness

## Goal

Confirm that the completed tactical workspace still fits the career loop:
dashboard -> Inbox/Posta or action -> preparation -> save -> Continue.

## Expected files

- `apps/web/src/App.tsx`
- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/career/*`
- Focused `apps/web` tests
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Verify dashboard action opens the workspace.
- Verify Inbox/Posta preparation action opens the workspace.
- Verify missing formation/XI/bench/tactic keeps Continue blocked.
- Verify saved preparation clears the dashboard blocker state.
- Verify saved preparation lets Continue reach the next valid stop.
- Keep the current Inbox/Posta rail as a rail, not a full decision center.
- Avoid adding generic mail-detail behavior in this phase.
- Add or update tests for the complete career UI loop.

## What NOT to implement

- Do not build Inbox/Posta Decision Center.
- Do not add read/unread mail.
- Do not add new stop categories.
- Do not add matchday playback.
- Do not persist saves.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The complete web preparation loop works with the new workspace.
- Continue remains tied to real preparation readiness.
- Inbox/Posta can still route to preparation without becoming the next section.
- `docs/PROJECT_STATUS.md` identifies Step 08 as the next action.
