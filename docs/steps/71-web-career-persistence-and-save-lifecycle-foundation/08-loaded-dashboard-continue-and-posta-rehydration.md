# 08 - Loaded Dashboard Continue And Posta Rehydration

## Goal

Power dashboard, Continue, and the existing Posta rail from the loaded durable
career rather than production demo builders.

## Scope

- Build dashboard inputs from loaded `CareerState` through existing UI read
  models/presenters.
- Invoke the canonical Continue engine use case against loaded state.
- Persist career changes before publishing the updated UI snapshot.
- Rebuild the existing structured attention/Posta view after load and Continue.
- Ensure dashboard return after a loaded full-time state remains coherent.
- Delete `build-demo-career-dashboard` and `continue-demo-career` production
  Modules when their final callers are removed.
- Move any still-useful deterministic builders into explicit test fixtures.

## What NOT to implement

- No new Posta categories, full message centre, or flavor news.
- No UI-owned date advancement.
- No direct SQL calls from React or Zustand.
- No duplicate dashboard calculation in the web app.
- No compatibility wrapper for removed demo builders.

## Expected files

- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/dashboard/build-career-dashboard.ts`
- `apps/web/src/features/dashboard/build-career-dashboard.test.ts`
- `apps/web/src/features/dashboard/build-demo-career-dashboard.ts`
- `apps/web/src/features/dashboard/continue-demo-career.ts`
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx`
- `apps/web/src/features/app-shell/AppShellPostaRail.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/09-durable-match-preparation-save-flow.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/runtime apps/web/src/features/dashboard apps/web/src/features/app-shell apps/web/src/stores/career-ui-store.test.ts packages/engine/src/career/continue-career.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
```

## Visual check for the user

Create a career, refresh, load it, and inspect dashboard/Posta.

Acceptance:

- club, date, next fixture, blockers, and Posta are unchanged after refresh;
- Continue stops at the same manager-relevant event;
- no technical save/seed/debug facts reappear in the dashboard;
- there remains one clear primary action.

## Definition of Done

- Dashboard/Continue/Posta use loaded career state.
- Replaced production demo builders are deleted.
- Continue persists state before UI confirmation.
- Existing Posta behavior survives without scope expansion.

