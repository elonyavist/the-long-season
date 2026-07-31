# Step 05 - Age-Aware P50, Upper And Shared Public Assessment

## Status

Not started.

## Goal

Replace the compressed/public-lower model with one calibrated, age-aware
current/P50/upper assessment consumed identically by UI, sorting, valuation,
and later AI.

## What To Implement

- Extend the versioned projection policy with separate P50 and upper factors by
  outfield/goalkeeper age band.
- Calibrate factors from deterministic development-outcome matrices at the
  policy's exact role-family/age-band granularity.
- Enforce:
  - `current <= P50 <= upper <= stored ceiling`;
  - no uncertainty widening with age inside each role family;
  - outfield full upper through 20 and equality with current at 28+;
  - goalkeeper full upper through 20 and equality with current at 32+.
- Recompute projection from the latest player facts after each quarterly
  checkpoint; do not store a destiny or guaranteed floor.
- Rename/read-model fields so no caller confuses P50, upper, or stored ceiling.
- Deepen `derivePublicPlayerAssessment(...)` into the only live-game Interface:
  UI, sorting, value, willingness, and AI consume its current/P50/upper facts
  and do not derive their own projection.
- Remove the deprecated/legacy unlabelled-ceiling overload. Keep stored ceiling
  accessible only to the projection implementation and explicit diagnostic
  adapters.
- Feed the Phase 80 three-band renderer and accessible copy.
- Keep all six half-star slots stable and preserve potential sorting's explicit
  policy.

## What NOT To Implement

- No generation, valuation coefficient, AI target, scouting, or save-history
  change.
- No “safe” potential claim and no exact ceiling in UI.
- No projection update countdown.

## Expected Files

- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/schemas/player-rating-scale.schema.test.ts`
- `packages/engine/src/squad/player-potential-projection.ts`
- `packages/engine/src/squad/player-potential-projection.test.ts`
- `packages/engine/src/squad/public-player-assessment.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.test.ts`
- `packages/ui/src/career/career-player-rating.ts`
- `packages/ui/src/career/career-player-rating.test.ts`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/schemas/player-rating-scale.schema.test.ts \
  packages/engine/src/squad/player-potential-projection.test.ts \
  packages/engine/src/squad/public-player-assessment.test.ts \
  packages/simulation-tools/src/player-potential-outcome-audit.test.ts \
  packages/ui/src/career/career-player-rating.test.ts \
  apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Accepted age contracts and role-family monotonicity pass directly.
- A credible young prospect visibly exposes probable and uncertain upside.
- P50 is not labeled guaranteed and upper never exceeds stored ceiling.
- UI/sort/value inputs use one named public assessment.
- Live AI and willingness inputs can consume the same safe assessment without
  gaining stored-ceiling access.
- Step 06 is the only next action.
