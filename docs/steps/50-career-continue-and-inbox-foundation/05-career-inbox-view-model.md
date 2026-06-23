# 05 - Career Inbox View Model

## Goal

Expose Inbox / Posta data through a UI-facing read model that web and CLI smoke
renderers can consume without parsing engine data or rendering domain prose.

## Expected files

- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `packages/ui/src/career/index.ts`
- `packages/ui/src/index.ts`
- Existing dashboard/action view files only if they need to reference Inbox
  counts or attention status.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define a `CareerInboxView` contract with:
  - ordered message summaries;
  - unread count;
  - action-required count;
  - highest priority key;
  - empty state key.
- Define `CareerInboxMessageView` using:
  - message ID;
  - date;
  - category key;
  - priority key;
  - status key;
  - title localization key;
  - summary localization key;
  - action labels as localization keys;
  - related entity labels only when already available as explicit input.
- Add a pure builder that accepts domain Inbox messages plus explicit display
  facts and returns the view model.
- Sort messages deterministically by:
  - action required first;
  - priority;
  - date;
  - stable ID.
- Add TSDoc to every exported type/function.
- Keep the package free from React, storage, engine, CLI, and browser APIs.

## What NOT to implement

- Do not render a web panel.
- Do not add engine continuation behavior.
- Do not generate Inbox messages.
- Do not add full message body screens.
- Do not add read/resolved mutation behavior.
- Do not add market, contracts, youth, or economics UI.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused tests for `packages/ui/src/career/career-inbox-view.test.ts`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Inbox data can be represented as a UI-facing read model.
- The read model is localization-ready and deterministic.
- Existing dashboard contracts remain compatible.
- `docs/PROJECT_STATUS.md` records Step 05 as complete or blocked.
