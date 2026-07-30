# Step 04 - Squad Lineup Select, Swap And Action Menu

## Status

Done.

## Goal

Make formation placement directly editable from each Squad row while replacing
the inline action cluster with one accessible contextual menu.

## Expected Files

- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/squad/career-squad-placement.ts`
- `apps/web/src/features/squad/career-squad-placement.test.ts`
- `apps/web/src/features/squad/SquadRowActionMenu.tsx`
- `apps/web/src/features/squad/SquadRowActionMenu.test.tsx`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add one sortable `Schieramento` column and keep a narrow `Azioni` column.
- Build deterministic select options from the current real XI and bench slots.
- Distinguish side-specific translated slot labels such as left/right striker.
- Implement a pure placement planner over existing synchronous lineup/bench
  callbacks.
- Cover XI↔XI, bench↔XI, unselected→XI, XI→bench, removal, full bench, and
  no-op choices.
- Keep weak legal tactical assignments; omit invalid ones.
- Portal the menu to `document.body`, clamp it to the viewport, and open upward
  when needed.
- Support menu focus entry, arrows, Home/End, Escape, outside click, scroll,
  resize, and trigger-focus restoration.
- Guard row pointer/keyboard activation from child controls.
- Keep `SquadLineupChoiceDialog` as the detailed alternative.

## What NOT To Implement

- No store, runtime, persistence, tactical-board, or formation-rule rewrite.
- No hidden autosave or new draft owner.
- No deletion of `SquadLineupChoiceDialog`.
- No restriction of legal makeshift assignments merely because profile detail
  hides weak positions.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
```

## Definition Of Done

- One select performs every valid direct placement and truthful automatic swap.
- One accessible menu owns secondary actions without clipping in the table
  scroll frame.
- Row activation never steals select/menu keyboard input.
- The resulting plan is visible unchanged in Tactics.
- Desktop and narrow browser tests prove first/last-row menus, focus restore,
  scroll close, swapping, no overflow, and 200% text.
