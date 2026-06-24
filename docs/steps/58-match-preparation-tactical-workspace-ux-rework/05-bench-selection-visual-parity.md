# 05 - Bench Selection Visual Parity

## Goal

Make reserve selection feel like the same football workflow as XI assignment,
not like a separate native form section.

## Expected Files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `apps/web/src/shared/ui/PlayerCandidateRow.tsx`
- `apps/web/src/styles/components.css`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Replace or wrap the visible bench selection controls with the shared candidate
  row/picker language from Step 04.
- Keep 8 explicit bench slots.
- Keep duplicate validation between XI and bench.
- Bench candidate suitability should use option A from the product decision:
  show suitability based on the player's own natural/current role, not hidden
  squad-coverage logic.
- Keep the bench outside the pitch.
- Preserve current save readiness behavior.

## What NOT To Implement

- Do not add bench drag/drop.
- Do not add substitution logic.
- Do not add hidden bench auto-selection.
- Do not remove the 8-reserve requirement.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- Bench slots visually belong to the same UI family as XI candidate assignment.
- The user can see useful reserve facts without opening a separate table.
- Existing bench blockers still work.
