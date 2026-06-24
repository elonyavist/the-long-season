# 07 - Match Preparation Replacement And Persistence

## Goal

Replace the current match-preparation pitch with the shared tactical board while
preserving bench, tactic, save readiness, dashboard, Inbox rail, and Continue
behavior.

## Expected Files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-career-loop.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Mount the shared tactical board inside match preparation.
- Remove the old select-card pitch from the visible match-preparation screen.
- Keep the bench panel separate and unchanged in concept.
- Persist/restorable preparation draft must include:
  - `baseFormationId`;
  - pitch slots with normalized coordinates and role/player assignment;
  - existing bench player IDs;
  - selected tactic profile.
- Save readiness must still require:
  - 11 selected XI players;
  - 8 selected substitutes;
  - no duplicate XI player;
  - no duplicate bench player;
  - no player in XI and bench;
  - selected tactic.
- Base formation selector remains schema of departure, not the current shape.
- Current shape displayed by the board is derived from actual slot roles.
- Existing helper actions `Auto`, `Fill gaps`, and `Clear` must still work with
  board slots and bench state.
- Dashboard and Inbox/Posta rail should still clear the match-preparation
  blocker after saving.

## What NOT To Implement

- Do not build a separate Tactics page.
- Do not implement real storage writes beyond existing demo/save preparation
  paths unless already required by current state contracts.
- Do not remove bench validation.
- Do not make base formation equal derived shape.
- Do not hide manager decisions.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/ui run typecheck
pnpm exec vitest run apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts apps/web/src/features/match-preparation/match-preparation-demo.test.ts apps/web/src/features/match-preparation/match-preparation-career-loop.test.ts apps/web/src/stores/career-ui-store.test.ts packages/ui/src/career/career-match-preparation-view.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Match preparation uses the shared tactical board.
- Bench and tactic flows still work.
- Save preparation still clears dashboard/Continue blockers.
- Board slots persist through the current web draft flow.
- Derived shape updates when a role changes.
