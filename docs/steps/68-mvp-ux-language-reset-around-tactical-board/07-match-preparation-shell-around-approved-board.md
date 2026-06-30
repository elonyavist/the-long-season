# 07 - Match Preparation Shell Around Approved Board

## Goal

Rework match preparation around the approved tactical board without replacing
the board.

## Scope

Implement the approved match-preparation direction:

- preserve tactical-board pitch, slot grammar, current-shape visual language;
- improve surrounding context, toolbar, blockers, tactic selection, squad list,
  and bench layout;
- remove clutter that competes with the board;
- make Save/Start flow visually clear;
- keep XI and bench behavior intact.

## Expected files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx`
- `apps/web/src/features/tactics-board/**`
- `apps/web/src/shared/**`
- `apps/web/src/styles/*.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not replace the tactical board.
- Do not alter formation/role rules unless a visual bug proves a documented
  board integration issue.
- Do not add persistence.
- Do not add new tactics engine behavior.
- Do not add hidden automatic choices.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx
pnpm exec vitest run apps/web/src/features/tactics-board
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
git diff --check
```

## Done when

- The approved tactical board still looks approved.
- Surrounding chrome supports the board instead of weakening it.
- Match preparation no longer feels like a generic form around a good pitch.
- Existing save readiness, XI, bench, and tactic behavior still pass.
