# Step 02 - Global One-To-Six Half-Star Rating And Attribute Presentation

## Status

Done.

## Goal

Replace selected-club-relative stars and the separate elite flag with one
absolute current/potential `1..6` half-star assessment shared by every existing
surface, while preserving exact-current and hidden-potential rules.

## Expected Files

- `packages/engine/src/squad/public-club-player-assessment.ts` (delete)
- `packages/engine/src/squad/public-club-player-assessment.test.ts` (delete)
- `packages/engine/src/squad/public-player-assessment.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/engine/src/squad/index.ts`
- `packages/engine/src/index.ts`
- `packages/ui/src/career/career-player-rating.ts`
- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `packages/ui/src/career/career-player-profile-view.ts`
- `packages/ui/src/career/career-player-profile-view.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/index.ts`
- `apps/web/src/app/use-career-screen-presentations.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.test.tsx`
- `apps/web/src/features/squad/SquadLineupChoiceDialog.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.test.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/components.css`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/02-global-one-to-six-half-star-rating-and-attribute-presentation.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Rename the engine API to `PublicPlayerAssessment`; no club-relative input or
  club-relative name may survive.
- Require a validated `PlayerRatingScale` input in the pure engine derivation.
- Supply that input explicitly from the app composition boundary using the
  Step 01 content export. Engine and UI must not import content.
- Do not keep a duplicated engine default or copy thresholds into an adapter.
- Derive current stars from canonical current role ability and potential stars
  from canonical potential role ability.
- Implement every accepted half-open boundary exactly.
- Remove the selected senior-squad reference input and every caller-side
  reference calculation.
- Represent `1, 1.5, ... 5.5, 6` with the Step 01 domain value object.
- Remove `elite` from engine, UI, adapter, React, and test contracts.
- Derive champion presentation from `stars > 5`; do not persist a replacement
  Boolean.
- Render five ordinary gold slots plus:
  - one half dark-orange sixth star at `5.5`;
  - one full dark-orange sixth star at `6`.
- Keep the sixth marker out of danger-red semantic tokens.
- Localize accessible copy for every supported language and announce the full
  numeric rating without relying on color.
- Preserve exact current attributes and format every visible attribute with
  exactly one digit after the locale decimal separator.
- Preserve hidden exact potential: no tooltip, DOM attribute, accessible label,
  test ID, adapter field, or serialized read model may expose it.
- Test that the same player receives identical ratings with different selected
  clubs and on Squad, Market, lineup, and detail surfaces.
- Remove the relative calculation and elite branches in this step; Step 14
  audits absence but does not own deferred cleanup.

## What NOT To Implement

- No generation, rarity, valuation, asking-price, wage, budget, AI,
  multi-competition, or persistence change.
- No club-relative fallback, owner-relative Market baseline, rank percentile,
  compatibility elite flag, or implicit rating-scale default.
- No exact numeric potential or scouting fog.
- No visual redesign beyond the existing shared star and attribute components.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/squad/public-player-assessment.test.ts \
  packages/ui/src/career/career-squad-view.test.ts \
  packages/ui/src/career/career-player-profile-view.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Every scale boundary and half-star value is tested against the JSON config.
- The same player has the same current and potential stars everywhere.
- `5.5` and `6` use the accepted accessible dark-orange sixth-star language.
- No `elite`, club-relative baseline, misleading club-assessment API, or
  duplicated tuning remains.
- Exact current attributes show one decimal and exact potential remains absent.
