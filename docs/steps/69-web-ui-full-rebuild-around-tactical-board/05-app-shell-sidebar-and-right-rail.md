# 05 - App Shell Sidebar And Right Rail

## Goal

Introduce the new persistent career shell: sidebar on the left, main content in
the center, right rail for Continue and manager attention.

This step should show all major sections in the sidebar, including inactive
future sections, without pretending those sections are implemented.

## Scope

- Add `features/app-shell/AppShell.tsx`.
- Route career screens through the shell while keeping app entry outside.
- Sidebar shows all requested sections:
  Dashboard, Squad, Tactics, Calendar, Fixtures, Market, Finances, Youth, Staff,
  Archive.
- Inactive sections are visible but inert/disabled with accessible names.
- Right rail shows Continue, next action context, and Posta/attention summary.
- Keep current screen content mostly unchanged inside the shell.

## What NOT to implement

- No real future section pages.
- No fake navigation success for inactive sections.
- No persistence.
- No matchday redesign yet.
- No tactical-board logic changes.

## Expected files

- `apps/web/src/app/App.tsx`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/stores/career-ui-store.ts` only if routing adapter state needs
  a small, documented presentation action.
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/app-shell/AppShell.test.tsx
pnpm exec vitest run apps/web/src/app/App.test.tsx
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Start a career and inspect the shell.

Acceptance:

- sidebar is persistent and readable;
- all sections are visible;
- inactive sections do not look clickable like real pages;
- right rail does not feel like clutter;
- central content is not squeezed or overlapped;
- keyboard focus order is sensible.

Stop after this step for user approval before continuing.

## Definition of Done

- New shell exists and is reachable.
- App entry remains outside the shell.
- Inactive sections are accessible and honest.
- Status and roadmap are updated.
