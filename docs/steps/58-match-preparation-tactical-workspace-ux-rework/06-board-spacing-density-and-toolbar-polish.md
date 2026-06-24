# 06 - Board Spacing Density And Toolbar Polish

## Goal

Polish the tactical board density and toolbar so the screen feels intentional
and football-specific.

## Expected Files

- `apps/web/src/features/tactics-board/tactical-board-formations.ts`
- `apps/web/src/features/tactics-board/tactical-board-formations.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/styles/components.css`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Move `Auto`, `Fill gaps`, `Clear`, and formation selection into a compact
  board toolbar.
- Preserve explicit manager-triggered helper actions.
- Improve spacing for lines containing three `CC` or three `DC` slots:
  - keep all slots inside the pitch;
  - add slightly more horizontal separation;
  - do not break two-player or four-player lines.
- Reduce dead space around the board without making controls cramped.
- Keep the squad list readable and scrollable.

## What NOT To Implement

- Do not change canonical formation meanings.
- Do not add new formations.
- Do not make helper buttons automatic.
- Do not hide formation selection.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- Three central midfielders and three center backs have visibly better spacing.
- The toolbar reads as part of the tactical board, not a detached dashboard
  control group.
- No tested formation overflows the pitch.
