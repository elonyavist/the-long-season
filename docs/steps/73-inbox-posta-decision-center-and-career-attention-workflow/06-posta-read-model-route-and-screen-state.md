# Step 06 - Posta Read Model, Route, And Screen State

## Status

Pending.

## Goal

Introduce one production Posta destination with pure list/detail read models and
minimal web-only selection/filter state.

## Scope

- Extend the shell section/screen contract with a real Posta destination.
- Build framework-free list and selected-message detail views from durable
  structured messages and current career facts.
- Expose exactly `all`, `to_handle`, and `unread` filters.
- Keep selected message ID and active filter as ephemeral Zustand UI state.
- Automatically select the highest-level message delivered on a Continue stop.
- Preserve selection when valid and choose a deterministic fallback when a
  message disappears after season reset.
- Derive functional source, subject, preview, metadata, football fact rows,
  blocker explanation, and primary action keys without localized prose.
- Make the compact rail navigate to Posta instead of executing the message's
  action directly.
- Add one visible but deliberately plain screen slice so the route can be tested
  before the visual rework in Step 07.

## Expected files

- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `packages/ui/src/career/career-shell-view.ts`
- `packages/ui/src/career/career-shell-view.test.ts`
- `packages/ui/src/index.ts`
- `apps/web/src/features/inbox/CareerInboxScreen.tsx`
- `apps/web/src/features/inbox/CareerInboxScreen.test.tsx`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/07-football-manager-style-posta-rail-list-and-detail.md` only if a lesson changes future scope.

## State ownership requirements

- Durable message lifecycle remains in `CareerState`.
- Selection and filter remain web UI state and are never written to the save.
- Read models do not import React, storage, engine, content, or i18n rendering.
- The route renders real loaded-career facts, not a demo fixture.

## What NOT to implement

- No final styling or calendar animation.
- No third detail/sidebar column.
- No browser history/router dependency unless already required by the app.
- No duplicate message state in React component hooks.
- No generic table/list abstraction created only for possible future screens.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-inbox-view.test.ts packages/ui/src/career/career-shell-view.test.ts apps/web/src/features/inbox apps/web/src/stores/career-ui-store.test.ts apps/web/src/app/app.test.tsx apps/web/src/features/app-shell/AppShell.test.tsx packages/i18n/src/labels.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Posta is a real central destination backed by the loaded career.
- List/detail/filter/selection facts have explicit ownership.
- Continue attention opens and selects the correct message.
- The compact rail routes to Posta.
- No demo, duplicate state, or dead route remains.
- `docs/PROJECT_STATUS.md` marks Step 06 Done and Step 07 active.
