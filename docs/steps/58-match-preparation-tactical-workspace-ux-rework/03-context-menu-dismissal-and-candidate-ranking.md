# 03 - Context Menu Dismissal And Candidate Ranking

## Goal

Make the tactical-board menu behave like a real contextual menu and make player
assignment ordering football-useful.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-squad.ts`
- `apps/web/src/features/tactics-board/tactical-board-squad.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Close the tactical-board menu when:
  - the user clicks the pitch background;
  - the user clicks outside the menu;
  - the user presses `Esc`;
  - the user completes assign/remove/role-change actions.
- Preserve right-click and long-press opening behavior.
- Sort assignment candidates by:
  1. suitability for the target role;
  2. current ability;
  3. fitness/form;
  4. stable display name or player id.
- Keep the sort deterministic.
- Do not expose hidden auto-choice behavior; ordering helps the manager choose.

## What NOT To Implement

- Do not auto-select the first candidate.
- Do not change the `suitFor(player, role)` signature.
- Do not store suitability as mutable state.
- Do not alter the formation catalog.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- The menu never remains stuck open after a clear outside click or completed
  action.
- Candidate ordering is covered by deterministic tests.
- Role suitability is visibly the first ranking signal.
