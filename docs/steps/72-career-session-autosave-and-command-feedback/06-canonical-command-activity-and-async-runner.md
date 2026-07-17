# Step 06 - Canonical Command Activity And Async Runner

## Status

Done.

## Goal

Replace invisible pending refs and duplicated Promise orchestration with one
typed, observable command-activity seam.

## Scope

- Define the current command IDs needed by real production actions only:
  create career, load career, Continue, manual save, autosave, policy update,
  confirm preparation, start match, play first half, apply half-time decision,
  play second half, and return to dashboard.
- Add one Zustand command-activity snapshot with active command, status label
  key, and optional bounded error code.
- Add one small application hook/helper that runs a Promise command, blocks
  duplicates, publishes pending state before work starts, and clears state on
  both success and failure.
- Migrate every existing asynchronous career action to that runner.
- Delete `preparationSavePendingRef`, `matchdayCommandPendingRef`, and duplicate
  Promise/finally chains when their last callers move.
- Keep command errors within the existing typed storage/runtime error model.

## Expected files

- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/use-career-command-runner.ts`
- `apps/web/src/app/use-career-command-runner.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/07-action-specific-loading-and-interaction-locks.md` only if a lesson changes future scope.

## Required behavior

- Pending state is published synchronously before the asynchronous operation.
- The same command cannot start twice while active.
- Conflicting commands cannot start while another career mutation is active.
- Success clears command activity after the new session snapshot is published.
- Failure clears pending state, preserves dirty working state, and exposes a
  typed recoverable error.
- Tests can hold a command Promise unresolved and assert the intermediate state.

## What NOT to implement

- No generic event bus, command pattern hierarchy, queue, or middleware stack.
- No multiple simultaneous mutation commands.
- No view-specific duplicate loading booleans.
- No fake timers or artificial delays in production.
- No visual spinner implementation yet.
- No dead command IDs for future screens.

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts apps/web/src/app apps/web/src/runtime/web-career-runtime.test.ts
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- One observable source owns asynchronous career command activity.
- All real career commands use the same runner.
- Duplicate-click protection is testable through rendered/store state.
- Obsolete refs and Promise orchestration are deleted.
- No generic framework or unused command type was introduced.
- `docs/PROJECT_STATUS.md` records Step 06 Done and Step 07 as next.
