# 02 - Career Shell Navigation Contract

## Goal

Add a small UI-facing contract for the career web shell navigation, if the scope
review confirms that the shell needs shared structure outside React.

The contract should describe navigation items, current selected section, Inbox
rail state, and central content identity without storing rendered prose.

## Expected files

- `packages/ui/src/app/*`
- `packages/ui/src/career/*`
- `packages/ui/src/index.ts`
- Focused `packages/ui` tests
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Reuse existing `@game/ui` patterns from app-entry, dashboard, actions, and
  Inbox view models.
- Add the smallest useful career shell/navigation contract.
- Use stable action/section keys, not rendered labels.
- Include enough structure for:
  - top navigation items;
  - active section;
  - left Inbox rail summary;
  - central content section key;
  - disabled/unavailable future sections when useful.
- Keep `@game/ui` dependency-free.
- Add focused tests for ordering, active section, disabled state, and stable
  keys.

## What NOT to implement

- Do not import React, browser APIs, i18n, engine, content, storage, or domain
  into `@game/ui`.
- Do not add real screen behavior.
- Do not add match-preparation data.
- Do not add full mail-client state.
- Do not add hardcoded visible labels.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused `packages/ui` tests for the new contract
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The web shell can consume a stable UI read model for navigation and layout
  state.
- The contract is small, deterministic, and label-key based.
- Existing app-entry/dashboard/Inbox tests still pass.
- `docs/PROJECT_STATUS.md` identifies Step 03 as the next action.
