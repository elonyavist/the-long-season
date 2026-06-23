# 04 - Left Inbox Rail Placement And Content Outlet

## Goal

Move Inbox/Posta from a dashboard-local panel into a left-side career attention
rail while keeping the selected screen in the central content area.

This step should make the Inbox feel like the career's persistent decision
surface.

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

- Place the Inbox/Posta component in the left shell rail.
- Keep the central content area focused on the selected screen.
- Preserve existing Continue behavior and Inbox messages.
- Make the Inbox rail visible enough to communicate urgency without crowding
  the central content.
- On narrow viewports, use an accessible stacked/collapsed layout if needed.
- Use semantic labels for the Inbox region.
- Ensure the Inbox action button remains reachable by keyboard.
- Avoid nested card-on-card layout.

## What NOT to implement

- Do not turn the Inbox into a full mail client.
- Do not add random news.
- Do not add market/contract/youth/economics messages.
- Do not implement message persistence.
- Do not implement match preparation.
- Do not hide the Inbox behind hover-only interaction.

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

- Inbox/Posta is positioned as a left attention rail on desktop.
- The dashboard remains the selected central content.
- Existing Continue and message rendering still work.
- Narrow layout remains usable and does not clip content.
- `docs/PROJECT_STATUS.md` identifies Step 05 as the next action.
