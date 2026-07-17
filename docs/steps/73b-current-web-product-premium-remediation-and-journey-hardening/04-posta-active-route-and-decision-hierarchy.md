# Step 04 - Posta Active Route And Decision Hierarchy

## Status

Done.

## Goal

Make Posta a dense football decision workspace while removing repeated shell
awareness when the manager is already inside the dedicated route.

## Findings Closed

- `Q-P1-03` narrow task priority on the Posta route.
- `Q-P1-05` flattened Posta hierarchy.
- `Q-P2-01` duplicated awareness and message facts.
- `Q-P2-09` active-route shell noise.

## User-Visible Outcome

- Posta opens as a two-column list/detail football workspace on desktop.
- The active route suppresses the compact left awareness rail; every other
  current route keeps it.
- On narrow screens the list comes first, a selected message opens a focused
  detail view, and one explicit Back control returns to the list.
- Message level, lifecycle, subject, football context, and one real destination
  are visually distinct without repeating the same count or subject.
- Empty filters, loading, error, read, acknowledged, resolved, blocking,
  important, and informational states retain clear hierarchy.

## Scope

1. Pass the current route to the shell and suppress only the active Posta rail.
2. Recompose the existing list/detail screen around one selected message and
   one primary destination.
3. Keep filters compact and secondary to the message task.
4. Preserve deterministic default selection and lifecycle opening through the
   existing command path.
5. Preserve the current narrow list-to-detail transition and make focus return
   explicit.
6. Remove duplicate counts, subjects, and detail facts from the shell and route
   once the new composition is covered.

## Implementation Contract

- Dashboard may expose the same real destination because it is the operational
  home; Posta explains why attention exists and does not become a mandatory
  detour.
- Message lifecycle, current-season reset, ordering, persistence, and save
  cadence do not change.
- Market, contract, finance, youth, and staff messages remain documentation-only
  future obligations until their workflows exist.
- The rail remains awareness-only and never executes a football action.
- All new or changed visible copy belongs to typed i18n labels.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
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
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new message category, producer, lifecycle state, or storage schema.
- No third permanent Posta column.
- No rail action button or forced Inbox-first journey.
- No future workflow destination or placeholder content.
- No Dashboard, preparation, or Matchday redesign beyond active-route framing.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Capture desktop and narrow Posta list, detail, empty filter, loading, and
  recoverable error states.
- Verify the awareness rail is absent only while Posta is active.
- Verify keyboard order, focus transfer into detail, Back focus restoration,
  200% text, and no horizontal page overflow.
- Verify blocking, important, informational, read, acknowledged, and resolved
  states remain understandable without color alone.
- Verify opening and acting on a message still update the dirty career session
  without an immediate storage write.

## Cleanup Boundary

Remove the active-route duplicate rail branch, duplicate count/subject markup,
and selectors or CSS used only by that duplicate presentation. Do not remove
durable lifecycle or deterministic selection behavior.

## Completion Criteria

- Posta has one clear decision hierarchy on desktop and narrow screens.
- The active route contains no duplicate awareness framing.
- One selected message owns one visible primary destination.
- Existing lifecycle, save, persistence, and Continue behavior are unchanged.
- No dead active-route branch, selector, style, or test remains.
