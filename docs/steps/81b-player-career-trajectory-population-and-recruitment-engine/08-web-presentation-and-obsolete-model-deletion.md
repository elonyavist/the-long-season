# Step 08 - Web Presentation And Obsolete Model Deletion

## Status

Blocked behind Step 07.

## Goal

Expose the new absolute uncertain forecast consistently in Squad and Market,
then delete every obsolete potential model artifact before long-run gates.

## What To Implement

- Update UI read models to carry one public probability-derived presentation.
- Rework `PlayerPotentialRangeRating` only as needed to show current,
  projected and optimistic absolute stars. Keep six stable slots.
- Squad table/profile and Market table/dialog consume the same read-model type.
- Update accessible/localized copy in `it/en/de/es/fr`; public facts must remain
  understandable without relying on color or motion.
- Keep diagnostic HTML scope separate: it may be English/desktop-only, but
  shipped web remains WCAG/viewport compliant.
- Prove market/squad/AI assessment parity for same player/date.
- Remove all obsolete:
  - `potential` fields and helpers;
  - P50/upper room-factor configs;
  - special rarity lanes/top-ups;
  - potential-compression events/diagnostics;
  - legacy exports, fixtures, labels, profiles and report code;
  - analysis-only seams whose removal owner is now satisfied.
- Use `rg` plus Graphify to produce a deletion manifest. Every retained
  similarly named symbol gets an active caller and ownership explanation.
- Run web visual QA desktop/narrow and keyboard/focus checks.

## What NOT To Implement

- No scouting fog.
- No new player-profile page.
- No decorative redesign unrelated to forecast semantics.
- No hidden exact ability/probability debug data in production DOM.
- No compatibility label or adapter for old P50/upper names.

## Expected Files

- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `packages/ui/src/career/career-player-detail-view.ts`
- `packages/ui/src/career/career-player-detail-view.test.ts`
- `packages/ui/src/career/career-player-profile-view.ts` and test
- `packages/ui/src/career/career-market-view.ts` and test
- `packages/ui/src/career/index.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts` and test
- `apps/web/src/features/market/career-market-adapter.ts` and test
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx` and test
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx` and test
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx` and test
- `apps/web/src/features/squad/CareerSquadScreen.tsx` only if its public props
  change
- `apps/web/src/features/market/CareerMarketScreen.tsx` only if its public props
  change
- `packages/i18n/src/labels.ts` and test
- `apps/web/src/visual-qa/current-product.spec.ts`
- every obsolete source/config/export/fixture/profile/i18n key named with an
  exact path in `docs/audits/PHASE_81B_OBSOLETE_MODEL_DELETION.md` before edit
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only if the deletion census
  changes ownership
- `docs/audits/PHASE_81B_OBSOLETE_MODEL_DELETION.md`
- this step and Step 09; `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm check:localized-text
pnpm --filter @game/web test
pnpm web:visual:qa
pnpm check:single-report-entrypoint
pnpm depcruise
git diff --check
graphify update .
```

Also run repository searches proving old production vocabulary has no live
owner. Tests/history docs may retain it only when explicitly historical.

## Definition Of Done

- Manager sees one coherent absolute forecast in Squad/Market.
- AI/value/UI parity is tested.
- No dead old-model code/config/export/label remains.
- Web visual/accessibility checks pass.
- Checkpoint C is the only next action.
