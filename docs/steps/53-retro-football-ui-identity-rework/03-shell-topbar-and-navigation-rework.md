# 03 - Shell Topbar And Navigation Rework

## Goal

Rework the career shell so it feels like a club control room rather than a
generic web dashboard shell.

The top area should communicate club context, navigation, date/season context,
and Continue as the career heartbeat.

## Expected files

- `apps/web/src/App.tsx`
- `apps/web/src/components/*`
- `apps/web/src/screens/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts` only if new visible labels are required
- Focused i18n tests if labels change
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Rework `CareerShell` visual structure without changing package ownership.
- Keep:
  - top navigation;
  - left Inbox/Posta;
  - central outlet;
  - Main menu;
  - Continue.
- Make shell context feel like a club operations header:
  - selected club prominence;
  - date/current season if already available in screen facts;
  - compact navigation;
  - strong Continue placement.
- Add minimal functional icons only if they improve recognition and stay
  accessible.
- Keep disabled future sections understandable.
- Keep keyboard focus visible.
- Preserve Phase 52 journey.

## What NOT to implement

- Do not add route libraries.
- Do not add new career sections.
- Do not implement Inbox detail center.
- Do not implement matchday.
- Do not move engine rules into React.
- Do not hide Continue or Inbox/Posta.

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

- The shell feels like a football management control room.
- Existing navigation and Continue behavior still work.
- Left Inbox/Posta and central outlet remain structurally intact.
- `docs/PROJECT_STATUS.md` identifies Step 04 as the next action.
