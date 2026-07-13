# 04 - Shared UI Primitives Rebuild In Place

## Goal

Rebuild the shared player/table/fact presentation units before replacing whole
screens.

The user should see a better squad list and player detail presentation inside
the existing reachable preparation flow.

## Scope

- Rebuild `PlayerCandidateRow`.
- Rebuild `PlayerFactPanel`.
- Rebuild `SquadSelectionTable`.
- Keep their inputs stable unless a test proves a small presentation-only prop
  is needed.
- Ensure rows are scrollable where appropriate and not oversized.
- Use real available data; no placeholder facts.

## What NOT to implement

- No new squad section.
- No new player attributes beyond existing facts.
- No tactical-board rewrite.
- No dashboard or shell rewrite.

## Expected files

- `apps/web/src/shared/ui/PlayerCandidateRow.tsx`
- `apps/web/src/shared/ui/PlayerCandidateRow.test.tsx`
- `apps/web/src/shared/ui/PlayerFactPanel.tsx`
- `apps/web/src/shared/ui/PlayerFactPanel.test.tsx`
- `apps/web/src/shared/ui/SquadSelectionTable.tsx`
- `apps/web/src/shared/ui/SquadSelectionTable.test.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts` only for changed visible labels.
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/shared/ui
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Open match preparation and inspect the squad/player-detail area.

Acceptance:

- table/list is readable and scrollable;
- row hierarchy is useful for selection;
- player detail is compact but informative;
- no duplicate or unclear button styling;
- no text clipping on narrow width.

Stop after this step for user approval before continuing.

## Definition of Done

- Shared primitives are cleaner and tested.
- No unused helper is introduced.
- Status and roadmap are updated.
