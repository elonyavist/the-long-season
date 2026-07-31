# Step 05 - Squad Age, Placement Order And Debounced Search

## Status

Done.

## Goal

Expose player age in Squad, put Placement next to Role, and prevent
player-name search from rebuilding the table on every keypress.

## Accepted Semantics

- Desktop column order is `#`, `Role`, `Placement`, `Player`, `Age`,
  `Condition`, `Morale`, `Status`, `Value`, `Level`, `Potential`, `Action`.
- Age is the canonical integer age already available to the Squad adapter and
  is sortable.
- Player-name search applies after `250 ms`.
- Department and availability selects remain immediate.
- Placement changes remain immediate commands and do not wait for search.

## What To Implement

- Add age to the Squad input/row contract and sortable column set in
  `@game/ui`.
- Map the existing canonical age from the Squad adapter.
- Reorder the shared column contract and React cells.
- Reuse Step 04's debounce helper for the text query.
- Update desktop widths and narrow/card labels without hiding age or
  placement.
- Preserve row action-menu focus and selected-lineup behavior.

## What NOT To Implement

- No age calculation in React.
- No selection, automatic swap, tactic, eligibility, or squad-size rule
  change.
- No duplicated debounce helper or delayed select/placement commands.
- No persisted column or filter preferences.

## Expected Files

- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/shared/lib/use-debounced-value.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/05-squad-age-placement-order-and-debounced-search.md`

## Required Checks

```bash
pnpm exec vitest run \
  packages/ui/src/career/career-squad-view.test.ts \
  apps/web/src/features/squad/career-squad-adapter.test.ts \
  apps/web/src/shared/lib/use-debounced-value.test.ts \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web exec playwright test \
  src/visual-qa/current-product.spec.ts \
  --grep "Squad exposes age placement and delayed search" \
  --workers=1
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- Age is visible and sortable in both desktop and narrow Squad layouts.
- Placement immediately follows Role without breaking its command behavior.
- Search applies once after `250 ms`; selects and placement remain immediate.
- Action-menu focus restoration and table/dialog scrolling do not regress.
- Required checks pass and Step 06 is the only next action.
