# Step 06 - Market Player Profile Exact Attributes, Statistics And Offer

## Status

Done.

## Goal

Give Market targets the same coherent player-inspection language while keeping
the canonical eligibility and offer composer as the third-tab decision.

## Expected Files

- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `apps/web/src/shared/ui/PlayerProfileTabs.tsx`
- `apps/web/src/shared/ui/PlayerRoleChips.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.tsx`
- `apps/web/src/shared/ui/PlayerStatisticsPanel.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Supply exact current abilities and current/career statistics through the
  Market adapter and framework-free detail view. Build this detail lazily for
  the opened target; do not precompute archive statistics for every row in the
  Market table.
- Reuse the shared natural/adapted roles, role-aware attributes, statistics,
  tabs, and star renderer.
- Add exactly `Attributi`, `Statistiche`, and `Contratto e offerta`.
- Keep eligibility, employment, contract horizon, finance preview, and the
  offer composer together in the third tab.
- Keep the offer composer mounted while hidden so draft terms survive.
- Reset to Attributes only when the inspected player changes.
- Guard row activation from tab/menu/form child controls.

## What NOT To Implement

- No scouting skill, report, fog, observation time, attribute range, hidden
  placeholder, or staff dependency.
- No second offer form, eligibility formula, finance preview, or negotiation
  state.
- No exact numeric potential.
- No change to market actions or AI.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
```

## Definition Of Done

- Market detail shows exact current attributes and truthful statistics without
  a scouting fiction.
- The third tab preserves and operates the existing canonical offer workflow.
- Squad and Market share the same player-detail primitives without duplicating
  policy.
- Desktop/narrow, keyboard, touch, 200% text, reduced motion, draft retention,
  row bubbling, and dialog scrolling pass.
