# 02 - Inbox Domain Contract

## Goal

Introduce the smallest language-agnostic Inbox / Posta contract needed for
career attention events.

Inbox messages should be durable structured data, not rendered prose. Future
CLI and web adapters should render them through localization.

## Expected files

- `packages/domain/src/career/inbox.ts`
- `packages/domain/src/career/inbox.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define stable Inbox message IDs using the existing `type:value` convention.
- Define a `CareerInboxMessage` contract with:
  - message ID;
  - career date;
  - category key;
  - priority key;
  - status key;
  - title localization key;
  - body localization key or summary localization key;
  - action-required flag;
  - optional related entity IDs;
  - optional action IDs.
- Define bounded message statuses, for example:
  - unread;
  - read;
  - resolved;
  - expired.
- Define bounded priority levels, for example:
  - routine;
  - important;
  - urgent.
- Define only category keys needed by the current phase plus a narrow, tested
  extension path.
- Add validation helpers only when they are used by tests or later steps in
  this phase.
- Add TSDoc to every exported type/function so a junior developer understands
  how Inbox messages flow through the app.
- Keep the contract independent from engine, storage, UI, React, and
  localization rendering.

## What NOT to implement

- Do not generate messages from career state yet.
- Do not render messages.
- Do not add web components.
- Do not add storage persistence.
- Do not implement market, contracts, youth, economics, or staff message
  generation.
- Do not store rendered prose in domain objects.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- Focused tests for `packages/domain/src/career/inbox.test.ts`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Inbox messages have a stable, deterministic, localization-ready domain shape.
- The contract is small and useful for the current phase.
- No presentation or storage concern leaks into domain.
- `docs/PROJECT_STATUS.md` records Step 02 as complete or blocked.
