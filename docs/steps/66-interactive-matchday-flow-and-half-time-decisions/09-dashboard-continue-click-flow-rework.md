# 09 - Dashboard Continue Click-Flow Rework

## Goal

Reduce friction: when Continue reaches matchday, the user should have an
obvious direct route into the match centre.

## Scope

Rework dashboard/Inbox flow so:

- Continue can route directly to the match centre when matchday is reached, or
  produce a top-level dashboard action that is impossible to miss;
- Inbox/Posta still records the attention event, but does not feel like a
  bureaucratic extra stop;
- dashboard primary action says the equivalent of "Go to match" when the next
  required decision is matchday;
- match preparation blockers still route to match preparation;
- full-time return still updates dashboard state.
- the app shell passes the phase-aware matchday view, half-time substitution
  panel, and first-half/second-half/substitution callbacks into the match
  centre so the browser route uses the Step 08 decision UI.

Use the existing UI read models where possible. Add or revise action state only
if current contracts cannot express the direct matchday action.

## Expected files

- `packages/ui/src/career/career-dashboard-view.ts`
- `packages/ui/src/career/build-career-dashboard-view.ts`
- `packages/ui/src/career/career-dashboard-view.test.ts`
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/build-demo-career-dashboard.ts`
- `apps/web/src/features/dashboard/build-demo-career-dashboard.test.ts`
- `apps/web/src/features/dashboard/continue-demo-career.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not build persistence.
- Do not remove Inbox/Posta.
- Do not hide action-required states.
- Do not create UI-only fake dashboard actions.
- Do not start Squad, Market, Finance, Youth, Staff, or Archive sections.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-dashboard-view.test.ts
pnpm exec vitest run apps/web/src/features/dashboard/build-demo-career-dashboard.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- The user can reach the match centre with fewer and clearer clicks.
- Inbox/Posta remains accurate but is not the only obvious route.
- Dashboard primary action reflects matchday attention.
- Tests cover preparation blocker route, matchday route, and post-full-time
  dashboard state.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
