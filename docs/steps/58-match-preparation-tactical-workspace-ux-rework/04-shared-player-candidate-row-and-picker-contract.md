# 04 - Shared Player Candidate Row And Picker Contract

## Goal

Create one reusable candidate-row/picker visual language for XI slot assignment
and bench selection.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.test.ts`
- `apps/web/src/shared/ui/PlayerCandidateRow.tsx`
- `apps/web/src/shared/ui/PlayerCandidateRow.test.ts`
- `apps/web/src/shared/lib/match-preparation-labels.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add a reusable player candidate row component that can render:
  - shirt number;
  - surname;
  - natural/current role;
  - fitness as a compact `%` value without the word `Forma`;
  - foot when available;
  - suitability badge/color.
- Use it inside the tactical-board context menu.
- Keep candidate rows button-like and keyboard reachable.
- Keep visible labels localized and avoid hardcoded prose.

## What NOT To Implement

- Do not move engine logic into the row component.
- Do not make the row depend on the tactical-board store.
- Do not make an over-general table framework.
- Do not add scouting/attribute details here.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- XI context-menu candidates use the shared row.
- The row is dense enough for a football manager UI.
- Tests cover the important rendered facts and accessibility basics.
