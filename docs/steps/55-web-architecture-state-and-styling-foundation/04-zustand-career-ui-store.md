# 04 - Zustand Career UI Store

## Goal

Move existing browser UI state out of `App.tsx` into a focused Zustand store
without changing behavior.

The store is a browser adapter. It must not become a game engine or duplicate
`@game/ui` read-model logic.

## Expected files

- `apps/web/src/stores/*`
- `apps/web/src/App.tsx`
- `apps/web/src/**/*.test.ts`
- `apps/web/src/**/*.test.tsx`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create one focused store Module for the current career UI prototype state.
- Move existing state only:
  - current screen;
  - language/currency preferences;
  - demo career availability;
  - Continue result;
  - match-preparation draft state.
- Add action methods for existing user actions.
- Keep state transitions deterministic and testable.
- Keep `@game/ui` view builders outside the store unless they are already part
  of current web adapter behavior.
- Add focused store tests for main-menu, dashboard, match-preparation save, and
  Continue transitions.
- Reduce `App.tsx` to composition and wiring.

## What NOT to implement

- Do not add persistence.
- Do not add URL routing.
- Do not add new screens.
- Do not move engine rules into the store.
- Do not create multiple stores unless one store becomes objectively too broad.
- Do not leave duplicated React state and Zustand state for the same concept.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- `App.tsx` is smaller and easier to follow.
- Zustand owns the existing browser state.
- Existing web behavior is unchanged.
- `docs/PROJECT_STATUS.md` identifies Step 05 as the next action.
