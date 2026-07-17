# Step 03 - Session-Owned Gameplay Commands Without Action Saves

## Status

Done.

## Goal

Make every current gameplay command update the working `CareerSession` without
writing or reloading durable storage after the action.

## Scope

- Refactor Continue, match preparation confirmation, pre-match progression,
  first-half progression, half-time decisions, second-half/full-time
  progression, acknowledgment, and dashboard return to consume and replace the
  session working state.
- Preserve the same deterministic engine/domain command boundaries and screen
  results.
- Keep initial career creation and career load durable.
- Remove action-level `saveNamedCareer`, `saveAndReloadMatchday`, storage
  reloads, and equivalent write-through helpers when their last callers move.
- Ensure full-time consequences are applied exactly once to the working state,
  even though they are not yet durable.
- Add storage-spy tests that count writes across a complete match journey.
- Add reload tests proving unsaved actions disappear and the durable baseline
  is restored.

## Expected files

- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/runtime/career-session.ts`
- `apps/web/src/runtime/career-session.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/features/match-preparation/match-preparation-career-loop.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/04-manual-save-autosave-scheduler-and-safe-stops.md` only if a lesson changes future scope.

## Required behavior

- Creating a career writes exactly once.
- Loading a career writes zero times.
- Continue and preparation commands write zero times.
- Starting, progressing, changing, completing, and acknowledging matchday write
  zero times.
- The session is dirty after the first working-state change.
- Full-time repeat commands remain idempotent in memory.
- Reloading through a new runtime instance reconstructs the last durable state,
  not the dirty working state.

## What NOT to implement

- No manual-save or autosave UI yet.
- No policy scheduler yet.
- No persistent match checkpoint replacement.
- No alternate in-memory storage adapter in production.
- No change to engine simulation, ratings, or consequences.
- No compatibility wrapper around deleted write-through helpers.

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/runtime apps/web/src/app/app.test.tsx apps/web/src/features/match-preparation/match-preparation-career-loop.test.ts apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- All current gameplay commands use one session-owned working state.
- A complete match journey performs no durable write after the creation write.
- Removed write-through helpers have no production references.
- Current user-visible football behavior remains deterministic.
- `docs/PROJECT_STATUS.md` records write-count evidence and Step 04 as next.
