# Step 07 - Football Manager-Style Posta Rail, List, And Detail

## Status

Pending.

## Goal

Replace the decorative Posta summary with a dense, readable manager decision
workspace while preserving the accepted retro-premium visual identity.

## Scope

- Move/confirm the compact Posta awareness rail on the left side of standard
  career screens.
- Make the rail show useful counts and the highest-level current subject without
  embedding full message actions.
- Build the full wide-screen two-column Posta layout:
  - fixed practical message list around `340-380px`;
  - flexible central detail;
  - no permanent third column.
- Render dense list rows with subject, functional source, game date, one-line
  preview, unread marker, and restrained attention-level accent.
- Avoid repeated textual badges where position, weight, and one accessible
  label communicate the state.
- Render structured football fact groups and one primary action in detail.
- Keep the primary action reachable during detail scrolling without hiding
  focused content.
- On narrow viewports show list then detail with an explicit Back command.
- Implement selected, hover, focus-visible, read/unread, blocking, important,
  informational, empty, and no-filter-result states.
- Use existing design tokens and Lucide icons where an icon has real meaning.

## Expected files

- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/app-shell/AppShellPostaRail.tsx`
- `apps/web/src/features/app-shell/AppShellPostaRail.test.tsx`
- `apps/web/src/features/inbox/CareerInboxScreen.tsx`
- `apps/web/src/features/inbox/CareerInboxScreen.test.tsx`
- `apps/web/src/features/inbox/InboxMessageList.tsx`
- `apps/web/src/features/inbox/InboxMessageList.test.tsx`
- `apps/web/src/features/inbox/InboxMessageDetail.tsx`
- `apps/web/src/features/inbox/InboxMessageDetail.test.tsx`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/08-unified-matchday-message-action-and-resolution-flow.md` only if a lesson changes future scope.

## UX requirements

- The screen reads as a football-management workspace, not webmail or SaaS.
- The message list remains scannable at normal desktop zoom.
- Technical IDs and raw localization keys are never visible.
- Long club/player names wrap or truncate deliberately without horizontal
  scrolling.
- Priority is not communicated by color alone.
- List/detail keyboard navigation and visible focus are first-class.

## What NOT to implement

- No dashboard redesign.
- No third-column context rail.
- No card-per-message composition.
- No fake portraits, staff avatars, or decorative mail illustrations.
- No action execution directly from compact rail.
- No hover-only essential information.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/app-shell apps/web/src/features/inbox packages/i18n/src/labels.test.ts
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Standard shell has a useful compact left Posta rail.
- Full Posta uses the approved two-column desktop and list/detail narrow flow.
- Every lifecycle/attention state is readable and keyboard accessible.
- Layout has no horizontal scroll or clipped essential copy.
- The old decorative action-card rail is removed.
- `docs/PROJECT_STATUS.md` marks Step 07 Done and Step 08 active.
