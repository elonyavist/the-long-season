# 07 - Career Dashboard Screen Prototype

## Goal

Render the first post-load career dashboard screen in the web app.

The screen should make the save immediately understandable and actionable:
next fixture, preparation blockers, condition, table context, and available
actions.

## Expected files

- `apps/web/src/screens/CareerDashboardScreen.tsx`
- `apps/web/src/screens/CareerDashboardScreen.test.tsx`, if component tests are
  used.
- `apps/web/src/components/*.tsx`, only for reusable pieces needed by this
  dashboard.
- `apps/web/src/components/*.test.tsx`, for new reusable pieces where useful.
- `apps/web/src/career/*`
- `apps/web/src/App.tsx` or `apps/web/src/app/App.tsx`
- `apps/web/src/styles/*.css`
- `packages/i18n/src/labels.ts`, for visible dashboard labels not already
  present.
- focused web/i18n tests for touched files
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add navigation from app entry to career dashboard.
- Render a career dashboard from the demo adapter.
- Include these sections:
  - career header/context;
  - selected club;
  - next fixture;
  - match preparation;
  - condition summary;
  - compact table context;
  - recent match;
  - actions;
  - blockers.
- Display blocked actions clearly without auto-solving them.
- Use localized labels and structured status keys.
- Keep the UI dense, readable, and desktop-first.
- Ensure narrow viewport does not overlap text or controls.

## What NOT to implement

- Do not implement real fixture advancement from the web UI.
- Do not implement squad/tactic/lineup detail screens.
- Do not implement a match viewer.
- Do not implement market, youth, economics, or long-run reports.
- Do not show raw debug JSON.
- Do not parse CLI output.
- Do not add hidden recommendations.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm check`
- Manual visual inspection at desktop and narrow viewport.
- `git diff --check`

## Definition of Done

- The web app can move from main menu to career dashboard.
- The dashboard renders structured facts from the demo adapter.
- Blockers and available actions are clear.
- No gameplay behavior has changed.
