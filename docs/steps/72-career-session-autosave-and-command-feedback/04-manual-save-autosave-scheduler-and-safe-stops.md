# Step 04 - Manual Save, Autosave Scheduler, And Safe Stops

## Status

Done.

## Goal

Add the only two post-creation gameplay commit paths: explicit manual save and
due autosave at safe in-game stops.

## Scope

- Add one runtime `saveCareerNow` operation that validates and commits the full
  working session.
- Add a pure autosave-due calculation from last persisted `GameDate`, current
  `GameDate`, and selected policy.
- Evaluate autosave only after a command reaches a documented safe stop.
- Run due autosave at dashboard, Posta/attention, or preparation before live
  matchday.
- Mark a due autosave as postponed while the active screen is pre-match,
  first half, half-time, second half, or full-time review.
- Commit the postponed autosave on the first subsequent safe stop.
- Keep manual-only policy free of scheduled writes.
- Preserve dirty state and current screen when a commit fails.
- Add exact write-count and date-boundary tests.

## Expected files

- `apps/web/src/runtime/career-session.ts`
- `apps/web/src/runtime/career-session.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/05-save-controls-policy-settings-and-unsaved-exit-guard.md` only if a lesson changes future scope.

## Required boundary cases

- 7-day policy is not due after 6 days and is due after 7.
- 15-day policy is not due after 14 days and is due after 15.
- Manual-only is never due.
- Multiple date-advancing commands before a safe stop cause one commit, not one
  write per command or elapsed day.
- A due save during matchday does not write until dashboard/attention return.
- A successful save updates baseline, last persisted game date, and clean state.
- A failed save updates none of those values and keeps the working state.

## What NOT to implement

- No `setInterval`, `setTimeout`, service worker, or wall-clock scheduler.
- No save rotation or additional autosave slot.
- No mid-match write.
- No hidden retry loop.
- No save buttons or exit dialog yet.
- No new storage backend.

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/runtime apps/web/src/stores/career-ui-store.test.ts apps/web/src/app/app.test.tsx
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Manual save and due autosave share one validated commit implementation.
- Day-based cadence is pure, deterministic, and fully boundary-tested.
- Matchday postponement is explicit and tested.
- No action-level or wall-clock save path exists.
- Failed writes preserve the manager's unsaved work.
- `docs/PROJECT_STATUS.md` records the adopted safe-stop matrix and Step 05 as next.
