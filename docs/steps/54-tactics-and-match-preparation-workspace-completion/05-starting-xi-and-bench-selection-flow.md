# 05 - Starting XI And Bench Selection Flow

## Goal

Render the manager-facing flow for selecting the starting XI and 8 substitutes.

The user must manually choose who plays and who sits on the bench.

## Expected files

- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts`
- Focused i18n tests if labels are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add formation selection control to the match-preparation workspace.
- Render the pitch from the selected formation slots.
- Render XI slot selects with the existing suitability ordering.
- Add a visible 8-player bench section.
- Let the user manually assign bench players.
- Once the bench section is visible, always pass all 8 bench slots into the
  preparation read model so missing substitutes block saving.
- Show clear duplicate/missing blockers:
  - missing XI slot;
  - missing bench slot;
  - duplicate player;
  - player in both XI and bench.
- Ensure the squad table shows whether a player is:
  - selected in XI;
  - selected on bench;
  - available.
- Keep player detail available on row click/focus.
- Keep the UI dense, retro-football, and usable without horizontal overflow.

## What NOT to implement

- Do not auto-fill XI.
- Do not auto-fill bench.
- Do not add best-player hints.
- Do not add market/squad-needs warnings.
- Do not add match substitutions.
- Do not add a full squad screen.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n label tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The user can change formation.
- The user can select a full XI.
- The user can select an 8-player bench.
- Invalid preparation is visible and blocks saving.
- No automatic manager choices are introduced.
- `docs/PROJECT_STATUS.md` identifies Step 06 as the next action.
