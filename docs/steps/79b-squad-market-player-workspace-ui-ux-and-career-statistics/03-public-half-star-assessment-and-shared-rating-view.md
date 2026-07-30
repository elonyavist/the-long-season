# Step 03 - Public Half-Star Assessment And Shared Rating View

## Status

Done.

## Goal

Replace coarse public level labels with a single accessible half-star contract
shared by Squad, Market, and player details.

## Adopted Formula

- `stars` is one of `1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5`.
- Reference baseline is the arithmetic mean of canonical current role ability
  across the selected club's senior squad.
- `rawStars = 3 + (assessedAbility - referenceBaseline)`.
- Clamp to `1..5` and round to the nearest `0.5`.
- Potential is evaluated against the same current-squad baseline.
- `elite` is true at canonical role ability `>= 17`; elite forces five ordinary
  stars and appends a sixth dark-orange marker.
- Public outputs contain no numeric current/potential ability.

## Expected Files

- `packages/engine/src/squad/public-club-player-assessment.ts`
- `packages/engine/src/squad/public-club-player-assessment.test.ts`
- `packages/ui/src/career/career-player-rating.ts`
- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `packages/ui/src/career/career-player-profile-view.ts`
- `packages/ui/src/career/career-player-profile-view.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/index.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/SquadLineupChoiceDialog.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/components.css`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## What NOT To Implement

- No exact hidden potential value, DOM data attribute, tooltip, or accessible
  leak.
- No rank-only formula, per-owner-club Market baseline, sixth linear numeric
  rating, or danger-red elite marker.
- No tabs, statistics archive, lineup swap, or action menu.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test -- public-club-player-assessment
pnpm --filter @game/ui run test
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
```

## Definition Of Done

- Boundaries, half rounding, clamping, selected-club baseline, potential
  baseline, duplicate/missing role failures, and elite threshold are tested.
- Squad and Market show comparable public ratings.
- All four browser surfaces use one star renderer.
- Screen-reader copy names the rating and elite marker without hidden ability.
