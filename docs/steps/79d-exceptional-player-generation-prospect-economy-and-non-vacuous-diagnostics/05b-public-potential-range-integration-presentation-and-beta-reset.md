# Step 05b - Public Potential Range Integration, Presentation And Beta Reset

## Status

Done after rework.

## Goal

Adopt the Step 05a projection once across production content, public
assessments, framework-free read models, Squad/Market/profile presentation, and
the explicit beta-save reset boundary without changing development or economy.

## Expected Files

- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `packages/engine/src/squad/public-player-assessment.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/ui/src/career/career-player-rating.ts`
- `packages/ui/src/career/career-player-rating.test.ts`
- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/career/career-player-profile-view.ts`
- `packages/ui/src/career/career-player-profile-view.test.ts`
- `packages/ui/src/index.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx`
- `apps/web/src/styles/components.css`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.test.tsx`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/05b-public-potential-range-integration-presentation-and-beta-reset.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Production Integration

- Add and schema-validate the one production projection policy calibrated in
  Step 05a, then advance the existing rating/configuration version rather than
  changing an immutable asset behind the old version.
- Advance linked valuation, asking-price, and market-behavior asset identities
  mechanically when their immutable references change. Step 06 still owns all
  behavioral valuation/negotiation verification and any evidence-backed
  coefficient change.
- Calibrate P10/P50/P90 from deterministic outcomes pooled at the policy's
  actual granularity: role family plus age band. Five streams in one matrix
  cell are not an admissible standalone P90 sample.
- Emit the pooled authoring-time calibration as compact structured evidence.
  The goalkeeper `28+` band has no starting-age matrix observations and may
  use zero only because the canonical development policy has zero positive
  growth from age 28; do not present it as an observed P90.
- Keep engine free of content imports and implicit defaults. CLI/web
  composition supplies the selected policy and current game date.
- Replace singular `potentialRating` at the public/read-model boundary with one
  lower/public-upper projection. Do not expose the separate stored ceiling as
  a parallel public truth.
- Keep current rating singular and exact current attributes visible with one
  locale-aware decimal. Exact numeric current/potential role ability remains
  absent.
- Re-derive the range from each current career snapshot. Development and aging
  already change current ability and compress remaining room; do not persist or
  mutate a display range.
- Squad, Market, and profiles consume the same projection. The engine owner is
  also the only supported input for Step 06 manager/AI valuation.
- Potential sorting is deterministic and conservative:
  - lower estimate descending;
  - public upper estimate descending;
  - current rating descending;
  - player ID ascending.
- A wide `2..6` lottery ticket must not outrank a narrower `4..5.5`
  projection merely because both have elite upside.

## Accessible Presentation

- Render exactly six stable potential slots:
  - filled shape through the conservative lower estimate;
  - patterned/hatched shape through uncertain upside;
  - neutral outline beyond the public upper estimate;
  - preserve the dark-orange exceptional sixth slot.
- Support half-star lower and upper boundaries.
- Pattern, shape, DOM state, and localized accessible text must carry the
  distinction; no meaning may depend on color alone.
- Accessible copy exposes the complete fact, for example:
  `Potenziale stimato da 3,5 a 5 stelle. Fascia incerta: 1,5 stelle.`
- Never call the lower estimate safe, certain, guaranteed, or minimum achieved.
- Never call the public upper estimate the stored ceiling, guaranteed maximum,
  or hard development limit. An outcome above the public P90 remains possible
  while the hidden stored ceiling remains absolute.
- When lower and upper are equal, render one singular potential assessment
  without an empty uncertainty band.
- Preserve dense table height, keyboard semantics, narrow layouts, `200%` text,
  reduced motion, and the existing dialog scroll/focus correction.

## Beta Save Contract

- Add no persisted player-potential field and no projection migration.
- When the new stamped rating/configuration version makes an existing beta save
  incompatible, CLI and web delete/reset that exact save through the canonical
  storage/runtime interface and require a new career.
- Do not add compatibility defaults, dual readers/writers, legacy projection
  fields, or partial reconstruction.
- Prove that a compatible current-version save still loads and that only the
  explicitly incompatible save is removed.

## Rework Product Decision - 2026-07-29

- The public sixth potential star appears only when the modeled public P90
  upper estimate maps to six stars.
- A hidden stored six-star ceiling does not guarantee a visible sixth star.
- This deliberate product change makes public six-star upside rare and
  realistic; it must be covered in the shared six-slot and accessible-copy
  tests rather than accepted as an undocumented side effect.
- Advance the projection/rating configuration version again and use the
  existing beta reset/delete path. Do not add compatibility behavior.

## Rework Completion - 2026-07-29

- Production P10/P50/P90 factors exactly match pooled deterministic
  realized-room observations for every covered role-family/age band.
- The ten observed bands contain `90..135` observations each. Goalkeeper
  `28+` is explicitly `not_evaluated` by the starting-age matrix and uses zero
  because canonical positive growth is zero from age 28.
- Rating/projection, valuation-link, asking-link, and market-behavior asset
  identities advanced atomically without changing unrelated coefficients.
- A stored six-star ceiling is covered as distinct from a lower public upper
  estimate; the public sixth star appears only when P90 maps to six.
- Verification: exact required suite plus pooled-calibration coverage PASS
  (`16` files / `150` tests); seven package typechecks, dependency boundaries
  (`762` / `2,950`), diff, and Graphify PASS.

## What NOT To Implement

- No persisted potential floor/range, schema compatibility migration, or
  duplicated public/save truth.
- No scouting staff, knowledge percentage, observation mission, hidden current
  attributes, or observer-specific estimate.
- No change to generation, development, aging, minutes, performance, or
  realization RNG.
- No valuation, asking-price, fee, rarity-budget, or long-run tuning.
- No new position/lineup information where potential is not currently shown.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/simulation-tools/src/player-potential-outcome-audit.test.ts \
  packages/engine/src/squad/public-player-assessment.test.ts \
  packages/ui/src/career/career-player-rating.test.ts \
  packages/ui/src/career/career-squad-view.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  packages/ui/src/career/career-player-profile-view.test.ts \
  packages/i18n/src/labels.test.ts \
  apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx \
  apps/web/src/features/squad/CareerPlayerProfileDialog.test.tsx \
  apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx \
  apps/web/src/features/squad/career-squad-adapter.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts \
  apps/cli/src/commands/career.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Young potential is a truthful, accessible lower-to-upper projection wherever
  public potential is currently shown.
- Current level remains singular; potential ranges support half stars and the
  exceptional sixth slot without color-only meaning.
- Squad, Market, profiles, and deterministic potential sorting consume one
  framework-free projection with no singular-potential compatibility field.
- Exact numeric potential remains hidden and no development/economy behavior
  changed.
- Incompatible beta saves are deleted/reset instead of migrated; compatible
  current saves remain intact.
