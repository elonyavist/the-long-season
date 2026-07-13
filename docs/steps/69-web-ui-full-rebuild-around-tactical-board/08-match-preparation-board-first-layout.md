# 08 - Match Preparation Board-First Layout

## Goal

Rebuild match preparation around the approved tactical board.

The first useful viewport should show the field as the main object, with the
bench below and a right-side area reserved for tactical/squad decisions.

## Scope

- Rebuild `CareerMatchPreparationScreen` layout only.
- Field dominates the left side.
- Bench sits below the field.
- Right-side panel frame exists, starting with the most useful current content.
- Toolbar actions remain clear and near the board.
- Keep board/bench behavior unchanged.

## What NOT to implement

- No new tactical-board behavior.
- No matchday changes.
- No new tactic engine logic.
- No full tab polish yet; Step 09 completes the tabs/save flow.

## Expected files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx`
- `apps/web/src/styles/components.css`
- `apps/web/src/styles/layout.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx
pnpm exec vitest run apps/web/src/features/tactics-board
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Open match preparation.

Acceptance:

- the tactical board is the dominant visual object;
- bench is under the board;
- right-side content does not overlap the board;
- action buttons are fewer and readable;
- desktop and narrow width are usable.

Stop after this step for user approval before continuing.

## Definition of Done

- Match preparation has the approved board-first layout.
- Tactical-board tests still pass.
- Status and roadmap are updated.
