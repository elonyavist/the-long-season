# 04 - Inbox Rail Football Decision Rework

## Goal

Make the left Inbox/Posta rail feel like a real Football Manager-style decision
surface, while staying within the current compact rail scope.

This is a visual/interaction rework of the rail, not the full Inbox/Posta
Decision Center phase.

## Expected files

- `apps/web/src/components/CareerInboxPanel.tsx`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts` only if new visible labels are required
- Focused i18n tests if labels change
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Rework the rail into a compact message-list feel:
  - clear Inbox/Posta title;
  - unread/action-required counts;
  - message rows;
  - priority/status treatment;
  - action button placement.
- Keep action-required messages visually distinct without relying only on color.
- Make `Prepare match` feel like a decision action, not a generic button.
- Preserve existing action callback behavior.
- Keep keyboard access and named complementary region.
- On narrow viewport, keep the rail reachable and readable.

## What NOT to implement

- Do not build full message detail view.
- Do not implement read/unread persistence.
- Do not add generic news feed.
- Do not add new attention categories.
- Do not add market/contract/youth/staff messages.
- Do not bury urgent actions in hover-only UI.

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

- Inbox/Posta reads as a football decision rail, not a generic panel.
- The current `Prepare match` action still opens match preparation.
- Desktop and narrow layouts remain usable.
- `docs/PROJECT_STATUS.md` identifies Step 05 as the next action.
