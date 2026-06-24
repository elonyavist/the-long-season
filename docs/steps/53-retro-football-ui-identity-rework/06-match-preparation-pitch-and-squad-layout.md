# 06 - Match Preparation Pitch And Squad Layout

## Goal

Rework match preparation around a football-first tactical layout:

- vertical realistic pitch/lavagna in the central area;
- compact squad list laterally;
- selected-player detail panel;
- tactic profile controls still available and clear.

This should keep the Phase 52 logic intact while making the screen feel like
match preparation rather than form filling.

## Expected files

- `apps/web/src/screens/CareerMatchPreparationScreen.tsx`
- `apps/web/src/career/*`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts` only if new visible labels are required
- Focused i18n tests if labels change
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a vertical tactical pitch representation for the selected lineup.
- Keep lineup slot selection explicit; no automatic best XI.
- Add compact squad-list presentation with:
  - name;
  - role;
  - age;
  - fitness/condition;
  - foot;
  - status.
- If the current demo data lacks one of those fields, add it only in the web
  demo adapter in a shape that can map to future real career state.
- Add selected-player detail panel for attributes/facts if the screen needs it
  to avoid overloading the list.
- Keep tactic profile selection visible and factual.
- Keep duplicate/missing/tactic blockers visible.
- Keep keyboard path with native controls or equivalent accessible controls.

## What NOT to implement

- Do not implement drag-and-drop unless a full keyboard equivalent is also
  implemented in this same step.
- Do not implement best XI.
- Do not implement player recommendations.
- Do not build a full squad screen.
- Do not add market/squad-needs advice.
- Do not persist preparation to browser storage or JSON saves.
- Do not simulate the match.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Match preparation clearly looks and behaves like a football tactical screen.
- The user can still choose lineup and tactic and save preparation.
- The pitch and squad list are useful, not decorative.
- `docs/PROJECT_STATUS.md` identifies Step 07 as the next action.
