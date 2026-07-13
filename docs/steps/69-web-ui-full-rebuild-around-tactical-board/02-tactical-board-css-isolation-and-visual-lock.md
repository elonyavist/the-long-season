# 02 - Tactical Board CSS Isolation And Visual Lock

## Goal

Protect the approved tactical board by isolating its CSS before the rest of the
web UI is rebuilt.

The visible result should be the same tactical board, now backed by an isolated
stylesheet that can survive the full UI cleanup.

## Scope

- Extract tactical-board and bench CSS from the legacy global component sheet.
- Import the isolated tactical-board stylesheet from the web style entry.
- Preserve the visual board grammar approved by the user.
- Keep pitch markings, drag behavior, context menus, suitability, roles, bench,
  and board state unchanged.

## What NOT to implement

- No tactical-board behavior changes.
- No pitch SVG changes.
- No coordinate changes.
- No formation or role changes.
- No match-preparation layout rebuild yet.

## Expected files

- `apps/web/src/styles/index.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/styles/tactical-board.css`
- `apps/web/src/features/tactics-board/**/*.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

Do not edit `TacticalBoardPitchMarkings.tsx`.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/tactics-board
pnpm --filter @game/web run typecheck
git diff --check
```

## Visual check for the user

Open match preparation or the tactical-board screen and inspect:

- board proportions;
- pitch line treatment;
- empty slots;
- player tokens;
- bench board;
- context menu position;
- no overflow or clipping.

Acceptance:

- the board looks unchanged or only cleaner around the edges;
- drag/context-menu behavior still works;
- this step does not introduce the new shell yet.

Stop after this step for user approval before continuing.

## Definition of Done

- Tactical-board CSS is isolated.
- Tactical-board behavior tests pass.
- No tactical-board logic source was modified.
- Status and roadmap are updated.
