# 09 - Match Preparation Tabs And Save Flow

## Goal

Complete the match-preparation decision workspace around the board.

The user should be able to inspect the squad, tactic, and selected-player detail
without leaving the preparation screen, then save and go to match with one clear
primary action.

## Scope

- Add right-panel tabs:
  - Squad/Rosa;
  - Tactic/Tattica;
  - Detail/Dettaglio.
- Keep tab content backed by existing match-preparation read model facts.
- Keep save readiness and blockers clear.
- Preserve "Save and go to match" as the primary action when preparation is
  valid.

## What NOT to implement

- No new tactic engine values.
- No team talks.
- No opponent preview.
- No hidden auto-selection beyond existing helper actions.
- No matchday UI rebuild.

## Expected files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx`
- `apps/web/src/features/match-preparation/match-preparation-presenter.ts` only
  if a small tested presenter cleanup is needed.
- `apps/web/src/shared/ui/PlayerCandidateRow.tsx`
- `apps/web/src/shared/ui/PlayerFactPanel.tsx`
- `apps/web/src/shared/ui/SquadSelectionTable.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/match-preparation
pnpm exec vitest run apps/web/src/shared/ui
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Open match preparation and test the tabs.

Acceptance:

- Squad tab is useful for selection;
- Tactic tab is readable and not a wall of controls;
- Detail tab explains the focused player;
- Save and go to match is clear and not duplicated;
- blocker messages are near the action they block.

Stop after this step for user approval before continuing.

## Definition of Done

- Preparation workspace is complete enough for the MVP.
- No dead tab content exists.
- Status and roadmap are updated.
