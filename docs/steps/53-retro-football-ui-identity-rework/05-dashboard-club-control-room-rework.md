# 05 - Dashboard Club Control Room Rework

## Goal

Rework the dashboard so it feels like the selected club's control room.

The dashboard should be dense, football-specific, and action-oriented. It
should not look like isolated SaaS cards.

## Expected files

- `apps/web/src/screens/CareerDashboardScreen.tsx`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts` only if new visible labels are required
- Focused i18n tests if labels change
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Rework dashboard layout around football control-room priorities:
  - attention/blockers near top;
  - next fixture prominent;
  - preparation state clear;
  - selected club context;
  - condition summary;
  - actions;
  - compact table/recent-match facts.
- Reduce generic card feel.
- Use table/list strips where they make scanning easier.
- Keep visual hierarchy dense but understandable.
- Preserve dashboard action behavior.
- Keep blockers visible in the first useful viewport.
- Keep all visible labels localized.

## What NOT to implement

- Do not add new dashboard data that is not backed by existing read models.
- Do not add economics, staff, youth, market, or squad detail widgets.
- Do not add fake charts.
- Do not hide blockers to make the screen cleaner.
- Do not duplicate dashboard readiness logic in React.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The dashboard reads as a club control room.
- The user understands the next action immediately.
- Phase 52 dashboard blocker resolution still works.
- `docs/PROJECT_STATUS.md` identifies Step 06 as the next action.
