# 05 - Dashboard, Inbox, And Continue State Update

## Goal

Make the playable matchday slice part of the actual web loop: dashboard or
Inbox/Posta opens matchday, matchday completion updates the career view, and
Continue moves to the next attention state.

## Scope

Wire existing screens and view models so that:

- dashboard attention opens matchday when the next blocking action is matchday;
- Inbox/Posta has a clear matchday item/action when relevant;
- the main Continue button routes to matchday instead of pretending the fixture
  is still only a blocker;
- after a played match, dashboard facts update from the changed in-memory career
  state;
- stale preparation blockers do not remain visible after a completed fixture;
- the user can continue from the result to the next attention state or back to
  dashboard.

This step is about flow correctness and user clarity.

## Expected files

- `apps/web/src/features/dashboard/build-demo-career-dashboard.ts`
- `apps/web/src/features/dashboard/continue-demo-career.ts`
- `apps/web/src/features/dashboard/dashboard-demo.test.ts`
- `apps/web/src/features/career-shell/CareerInboxPanel.tsx`
- `apps/web/src/app/App.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not redesign the full shell.
- Do not add new top-level sections.
- Do not implement persistent Inbox message history.
- Do not make the selected club auto-play without user action.
- Do not add fake table impact if the current state cannot compute it.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/dashboard/dashboard-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Tests cover dashboard-to-matchday, Inbox/Posta-to-matchday, play-result, and
  return-to-dashboard paths.
- The displayed dashboard after match is not stale.
- Continue stops on matchday only when a user action is required.
- The flow remains readable and does not create dead UI.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
