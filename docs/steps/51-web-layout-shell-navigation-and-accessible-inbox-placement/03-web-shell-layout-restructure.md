# 03 - Web Shell Layout Restructure

## Goal

Restructure the web app shell so the career dashboard renders inside a stable
layout with top navigation and a central content area.

This step creates the structural shell but may leave the Inbox rail in its
current central/dashboard placement until Step 04 moves it.

## Expected files

- `apps/web/src/App.tsx`
- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts`
- Focused i18n tests, only if new label keys are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a reusable web shell component or screen structure only if it improves
  readability.
- Place global navigation at the top.
- Render the current dashboard as the active central content.
- Preserve:
  - main menu flow;
  - language and currency controls;
  - New career / Continue career behavior;
  - dashboard facts;
  - Continue action;
  - existing Inbox behavior, even if not moved yet.
- Use semantic landmarks where practical:
  - `header`;
  - `nav`;
  - `main`;
  - named region for career context if useful.
- Keep visible labels localized.
- Keep the retro-premium visual direction dense but readable.

## What NOT to implement

- Do not move the Inbox rail in this step unless it is inseparable from the
  shell structure.
- Do not add new active career sections beyond shell placeholders.
- Do not add route libraries.
- Do not implement match-preparation UI.
- Do not add browser save persistence.
- Do not duplicate dashboard readiness logic in React.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/i18n run typecheck` if i18n changes
- Focused i18n tests if i18n changes
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The dashboard renders inside a top-navigation shell.
- Existing Phase 49/50 behavior still works.
- The shell uses semantic landmarks and localized labels.
- `docs/PROJECT_STATUS.md` identifies Step 04 as the next action.
