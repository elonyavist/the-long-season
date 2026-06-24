# 04 - Bench Context Menu And Candidate Picker

## Goal

Give reserve slots the same contextual interaction quality as XI slots while
keeping bench rules simpler.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-squad.ts`
- `apps/web/src/features/tactics-board/tactical-board-squad.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.test.ts`
- `apps/web/src/shared/ui/PlayerCandidateRow.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Empty reserve slot:
  - click/keyboard opens the candidate menu;
  - menu action is add/select player.
- Filled reserve slot:
  - click/keyboard opens slot menu;
  - menu action is remove from bench.
- Use the same candidate row family as XI assignment.
- Candidate ordering:
  1. overall/current ability;
  2. fitness/form;
  3. position order;
  4. stable surname/name/id.
- Candidate list excludes players already selected in XI or bench.
- Menu closes on:
  - outside click;
  - board background click;
  - `Esc`;
  - completed add/remove action.
- Keep long-press optional only if it is easy to share safely; primary bench
  interaction can be click/keyboard because bench has no drag conflict.

## What NOT To Implement

- Do not add role-change options for bench.
- Do not add "promote to XI".
- Do not expose hidden squad-coverage recommendations.
- Do not auto-select the top candidate.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- TacticalBenchBoard.test.ts TacticalBoardMenu.test.ts tactical-board-squad.test.ts tactical-board-suitability.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Empty bench slots add players through a contextual candidate menu.
- Filled bench slots remove players through a contextual action.
- The candidate list is deterministic and excludes unavailable players.
- The menu cannot remain stuck open after clear user actions.
