# Step 10 - Calendar Transition And Continue Feedback

## Status

Done.

## Goal

Make calendar advancement feel alive and understandable without introducing
fake engine progress or another asynchronous command system.

## Scope

- Reuse the Phase 72 command runner as the only owner of pending, failure, and
  interaction-lock state.
- After the engine has completed deterministic advancement, animate the visible
  game date from the start date to the stop date.
- Show ordinary days at approximately `100-140ms` each.
- Accelerate after seven displayed days and cap the full transition at roughly
  `1.5-2 seconds`.
- Skip intermediate dates when the user prefers reduced motion and present the
  final date immediately.
- Keep the current club context visible and keep button geometry stable during
  the transition.
- Open Posta only after the visible date reaches the stop date, with the
  highest-priority message selected.
- When no blocking or important attention exists, finish on the dashboard at
  the returned game date.
- Treat zero-day advancement and same-date attention as immediate transitions.
- Make the date-sequence and duration calculation pure and independently
  tested with canonical game dates.
- Announce the final advancement result once through the existing polite live
  region; do not announce every intermediate day.

## Expected files

- `apps/web/src/features/inbox/calendar-advance-transition.ts`
- `apps/web/src/features/inbox/calendar-advance-transition.test.ts`
- `apps/web/src/features/inbox/CalendarAdvanceTransition.tsx`
- `apps/web/src/features/inbox/CalendarAdvanceTransition.test.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.test.tsx`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/11-accessibility-playwright-cleanup-and-phase-report.md` only if a lesson changes future scope.

## Interaction contract

- Engine work completes first; animation only presents elapsed game time.
- One Continue command causes one transition and one final destination.
- The user cannot trigger conflicting career commands during advancement.
- The transition never displays a fabricated percentage or progress estimate.
- Browser focus moves only when the destination screen changes, not on each
  displayed date.

## What NOT to implement

- No second queue, Promise runner, interval owner, or command-activity store.
- No wall-clock career advancement.
- No per-day engine calls from React.
- No fake loading bar, fake simulation percentage, or random delay.
- No animation that exceeds the documented cap merely because many days pass.
- No route to Posta before the engine result and visible date are coherent.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/inbox/calendar-advance-transition.test.ts apps/web/src/features/inbox/CalendarAdvanceTransition.test.tsx apps/web/src/stores/career-ui-store.test.ts apps/web/src/app/AppShell.test.tsx apps/web/src/app/app.test.tsx packages/i18n/src/labels.test.ts
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Short advancement visibly moves day by day.
- Longer advancement accelerates and remains below the practical duration cap.
- Reduced motion skips intermediate animation.
- Attention opens Posta only at the coherent stop date.
- No-attention advancement returns to the dashboard.
- Phase 72 command locking remains the sole asynchronous control path.
- `docs/PROJECT_STATUS.md` marks Step 10 Done and Step 11 active.
