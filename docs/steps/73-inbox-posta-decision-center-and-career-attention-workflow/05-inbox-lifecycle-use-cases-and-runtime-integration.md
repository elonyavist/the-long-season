# Step 05 - Inbox Lifecycle Use Cases And Runtime Integration

## Status

Pending.

## Goal

Give reading, acknowledgement, resolution, and delivery one tested application
path inside the existing working career session.

## Scope

- Add narrow pure operations for delivering a message batch, opening a message,
  acknowledging important attention, and reconciling blocking resolution from
  current career facts.
- Mark a message read when opened without treating read as resolution.
- Acknowledge an important message after it is opened so it stops only once.
- Resolve a blocking message only when its structured resolution predicate is
  true.
- Deduplicate delivery by stable message ID and preserve deterministic order.
- Integrate the operations into `WebCareerRuntime` and `CareerSession` without
  direct React/storage access.
- Publish the updated working session through the Phase 72 command runner.
- Prove open/acknowledge/filter/selection work causes zero storage writes until
  manual or due autosave.
- Remove any current UI-only message lifecycle mutation replaced by this path.

## Expected files

- `packages/engine/src/career/career-inbox-lifecycle.ts`
- `packages/engine/src/career/career-inbox-lifecycle.test.ts`
- `packages/engine/src/index.ts`
- `apps/web/src/runtime/career-session.ts`
- `apps/web/src/runtime/career-session.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/app/use-career-command-runner.ts`
- `apps/web/src/app/use-career-command-runner.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/06-posta-read-model-route-and-screen-state.md` only if a lesson changes future scope.

## Lifecycle requirements

- Open is idempotent.
- Acknowledge is allowed only for important attention that has been opened.
- Blocking resolution is derived from current state, not trusted from UI input.
- Delivery never duplicates an existing stable ID.
- Equal message batches produce equal working state.

## What NOT to implement

- No React Posta screen yet.
- No generic command or event bus.
- No immediate storage write for lifecycle actions.
- No arbitrary `resolveMessage(messageId)` escape hatch.
- No hidden acknowledgement merely because Continue was clicked.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/career-inbox-lifecycle.test.ts apps/web/src/runtime/career-session.test.ts apps/web/src/runtime/web-career-runtime.test.ts apps/web/src/app/use-career-command-runner.test.ts apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Delivery, read, acknowledgement, and resolution have one production path.
- Blocking messages cannot be manually dismissed.
- Important messages stop only until opened/acknowledged.
- Lifecycle mutations remain dirty session changes with zero action writes.
- Replaced duplicate lifecycle code is deleted.
- `docs/PROJECT_STATUS.md` marks Step 05 Done and Step 06 active.
