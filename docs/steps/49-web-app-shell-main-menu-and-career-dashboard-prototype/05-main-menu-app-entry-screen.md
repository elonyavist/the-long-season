# 05 - Main Menu App Entry Screen

## Goal

Build the real first app screen.

The app should open on a main menu with new career, continue career, and
settings. It must use the `@game/ui` app-entry contract rather than hardcoded
screen state.

## Expected files

- `apps/web/src/app/app-entry-view-model.ts`
- `apps/web/src/app/app-entry-view-model.test.ts`
- `apps/web/src/screens/AppEntryScreen.tsx`
- `apps/web/src/screens/AppEntryScreen.test.tsx`, if component tests are used.
- `apps/web/src/App.tsx` or `apps/web/src/app/App.tsx`
- `apps/web/src/styles/*.css`
- `packages/ui/src/app/*`, only if a narrow contract extension is needed.
- `packages/i18n/src/labels.ts`, for visible menu/settings labels.
- focused web/UI/i18n tests for touched files
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Build an app-entry view model from `@game/ui` contracts.
- Render:
  - New career;
  - Continue career;
  - Settings.
- Render settings controls for:
  - language;
  - currency.
- Keep continue-career behavior scoped to the prototype:
  - either unavailable until a demo career exists;
  - or routes to the same demo career if the active step documents it.
- Use localized labels.
- Keep layout dense, readable, and desktop-first.
- Avoid visible instructional copy about how the app works.

## What NOT to implement

- Do not implement a full save list.
- Do not implement real browser persistence.
- Do not implement account/login/sync.
- Do not implement economics.
- Do not implement a marketing landing page.
- Do not implement career dashboard details in this step.
- Do not parse CLI output.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/ui run typecheck` if `@game/ui` changes.
- `pnpm --filter @game/i18n run typecheck` if labels change.
- focused tests for touched files.
- `pnpm check`
- Manual visual inspection of the main menu at desktop and narrow viewport.
- `git diff --check`

## Definition of Done

- The app opens to a main menu.
- The main menu is localized.
- Language/currency controls are visible.
- New/continue/settings actions are structured and deterministic.
