# Step 05 - Age-Aware P50, Upper And Shared Public Assessment

## Status

Done after reopening on 2026-08-01.

The first implementation correctly separated current, P50, public upper, and
stored ceiling, but pooled every age from 21 to 24 into one calibration cell.
That produces a discontinuous contraction on the twenty-first birthday and a
flat public-upside factor through age 24. This reopening keeps the accepted
product decision that public upper equals stored ceiling through age 20, while
replacing every post-20 multi-year factor with evidence derived at exact-age
and role-family granularity.

The completed implementation owns `24` explicit role-family/age bands and a
deterministic `1,620`-observation outcome matrix. It keeps P50 as an
independently observed median, narrows only the complete current-to-upper
envelope, and verifies the five actually selected outfield templates rather
than trusting declared fixture metadata.

## Goal

Complete the current/P50/upper assessment with deterministic exact-age
calibration after age 20, without changing the accepted full-upper-through-20
product contract or presenting either public estimate as a promised outcome.
UI, sorting, valuation, willingness, and later AI must continue to consume the
same shared public assessment.

## What To Implement

- Replace post-20 multi-year projection bands with one explicit calibration
  cell for every exact completed age in each role family. Outfield and
  goalkeeper curves remain separate because their development horizons are
  different.
- Derive each P50 and public-upper factor from the deterministic
  development-outcome matrix at that exact age and role-family cell:
  - the five outfield streams use a frozen representative 4-4-2 mix of two
    defenders, two midfielders, and one attacker instead of cloning the first
    non-goalkeeper five times; this preserves the existing five-stream cost
    while exercising the midfielder-only age-26 development branch;
  - P50 is the observed median realization ratio;
  - public upper is the observed P90 realization ratio, bounded by the stored
    ceiling;
  - every required cell has a positive observation count and reports its
    outcome distribution, rather than passing through a missing/default row;
  - the 750-world prevalence cohort must not be used to fit these causal
    realization factors because it mixes minutes, player quality, environment,
    aging, and team transitions.
- Correct the matrix's month alignment before deriving those factors. Its
  player starts on 1 August, so each age cycle must process twelve consecutive
  monthly checkpoints from August through the following July. It must not feed
  January-to-July rows that precede the opening birthday and silently evaluate
  them at `startAge - 1`.
- Keep full public upper through age 20 as an explicit product override. Start
  exact-age evidence-based narrowing at 21; do not infer a new age-20 factor
  from the post-20 matrix.
- Remove the flat 21-to-24 policy in both role families. The public-upper room
  factor must narrow at each adjacent exact age from 21 through 24. If raw
  fixed-point quantiles cannot satisfy that accepted progression, stop on a
  calibration/product conflict instead of inventing smoothing constants.
- Enforce:
  - `current <= P50 <= upper <= stored ceiling`;
  - no widening of the current-to-upper reachable-upside envelope with age
    between adjacent exact ages inside each role family; the separately
    calibrated visual `P50 -> upper` interval is evidence, not this
    monotonicity invariant;
  - outfield full upper through 20 and equality with current at 28+;
  - goalkeeper full upper through 20 and equality with current at 32+.
  These terminal ages are deadlines: a raw exact-age quantile may reach zero
  earlier and must then remain zero; no positive pre-terminal override may be
  invented merely to keep a star visible.
- Gate every exact-age/role-family calibration cell directly. Tests must cover
  exact birthdays, the declared 2/2/1 outfield template composition,
  August-to-July matrix alignment, positive denominators,
  P50/P90 provenance, adjacent-age
  monotonicity, the non-flat 21-to-24 progression, terminal equality, and the
  invariant that public upper never exceeds stored ceiling.
- Preserve the distinction between a probabilistic public estimate and an
  outcome promise: development may finish below P50 or above public upper, but
  can never finish above the real stored ceiling. Neither public bound is a
  guaranteed floor or destiny.
- Recompute projection from the latest player facts after each quarterly
  checkpoint; do not store a destiny or guaranteed floor.
- Advance the supported player-rating scale to `player-rating-scale-v7` and
  the nested projection policy to `player-potential-projection-v4`; update the
  valuation asset's scale reference without changing its valuation algorithm
  version in this step. Old beta careers stamped with v6 must be rejected, and
  Step 09 owns the canonical storage reset rather than a compatibility reader.
- Rename/read-model fields so no caller confuses P50, upper, or stored ceiling.
- Deepen `derivePublicPlayerAssessment(...)` into the only live-game Interface:
  UI, sorting, value, willingness, and AI consume its current/P50/upper facts
  and do not derive their own projection.
- Keep that Interface singular and explicit: collection callers map it over
  their own canonical order rather than retaining a second batch wrapper.
- Remove the deprecated/legacy unlabelled-ceiling overload. Keep stored ceiling
  accessible only to the projection implementation and explicit diagnostic
  adapters.
- Rename every affected read-model and presentation field from generic
  `lower`/`expected` language to `p50`; updating those compile-time consumers
  is part of this owning step, not a compatibility reason to retain aliases.
- Feed the Phase 80 three-band renderer and accessible copy.
- Keep all six half-star slots stable and preserve potential sorting's explicit
  policy.

## What NOT To Implement

- No generation, valuation coefficient, AI target, scouting, or save-history
  change.
- No factors fitted from the 750-world generated-population cohort, no
  hand-written interpolation, and no after-the-fact smoothing chosen by looking
  at the desired UI result.
- Do not keep the superseded Phase 79C division-value fit assertion green by
  retuning value here; Step 08 owns the new global value epoch and its gates.
- No “safe” potential claim and no exact ceiling in UI.
- No projection update countdown.

## Expected Files

- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/engine/src/squad/player-potential-projection.ts`
- `packages/engine/src/squad/player-potential-projection.test.ts`
- `packages/engine/src/squad/public-player-assessment.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/engine/src/player-state/completed-player-age.ts`
- `packages/engine/src/player-state/completed-player-age.test.ts`
- `packages/engine/src/player-state/index.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/test-fixtures/player-valuation-config.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `packages/ui/src/career/career-player-rating.ts`
- `packages/ui/src/career/career-player-rating.test.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/career/career-player-profile-view.test.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_DESIGN_CONTRACT.md`
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_BASELINE.md`
- `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/01-reproducible-baseline-and-calibration-contract.md`
- `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/engine/src/squad/player-potential-projection.test.ts \
  packages/engine/src/squad/public-player-assessment.test.ts \
  packages/engine/src/player-state/completed-player-age.test.ts \
  packages/engine/src/career/player-development.test.ts \
  packages/engine/src/market/player-valuation.test.ts \
  packages/simulation-tools/src/player-potential-outcome-audit.test.ts \
  packages/ui/src/career/career-player-rating.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  packages/ui/src/career/career-player-profile-view.test.ts \
  packages/ui/src/career/career-squad-view.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/features/squad/career-squad-adapter.test.ts \
  apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/cli run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Every post-20 factor is traceable to a positive deterministic-matrix cell for
  one exact age and one role family.
- Accepted age contracts and adjacent exact-age role-family monotonicity pass
  directly, with no shared 21-to-24 factor.
- A credible young prospect visibly exposes probable and uncertain upside.
- P50 and public upper are not labeled guaranteed; observed outcomes may miss
  either estimate while stored ceiling remains inviolable.
- UI/sort/value inputs use one named public assessment.
- Live AI and willingness inputs can consume the same safe assessment without
  gaining stored-ceiling access.
- Step 06 remains blocked until this exact-age projection contract and its
  calibration gates pass.
