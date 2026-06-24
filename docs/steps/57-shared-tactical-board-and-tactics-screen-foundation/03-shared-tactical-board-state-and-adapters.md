# 03 - Shared Tactical Board State And Adapters

## Goal

Build state and adapter functions for a reusable tactical board without
duplicating engine/domain rules in React components.

## Expected Files

- `apps/web/src/features/tactics-board/tactical-board-state.ts`
- `apps/web/src/features/tactics-board/tactical-board-state.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-adapters.ts`
- `apps/web/src/features/tactics-board/tactical-board-adapters.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Define a persistence-ready tactical-board draft with:
  - `baseFormationId`;
  - ordered slots;
  - derived shape selector.
- Add pure actions:
  - load base formation;
  - move slot;
  - change role;
  - clear slot;
  - assign player.
- Ensure assigning a player removes that player from any other XI slot first.
- Ensure changing base formation resets the slots but tries to preserve current
  players only when role fit remains valid enough and without hidden aggressive
  re-selection.
- Keep bench state outside the board state.
- Wire the current career UI store to hold the tactical-board draft instead of
  only select-grid slot state.
- Keep current match-preparation demo behavior passing until the board UI is
  swapped in a later step.

## What NOT To Implement

- Do not render drag-and-drop yet.
- Do not replace the visible match-preparation pitch yet.
- Do not save to real career storage yet.
- Do not put engine rules in Zustand.
- Do not auto-select a full XI unless the manager triggers an existing helper.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/features/tactics-board/tactical-board-state.test.ts apps/web/src/features/tactics-board/tactical-board-adapters.test.ts apps/web/src/stores/career-ui-store.test.ts apps/web/src/features/match-preparation/match-preparation-demo.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Board state is independent from React rendering.
- Slot/player separation is enforced.
- Player duplication across XI slots is impossible through board actions.
- Base formation changes preserve reasonable manager choices without hidden
  overreach.
- Bench and tactic state continue to work.
