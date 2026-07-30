# Step 08 - 50x20, Browser QA, Phase Report And Phase 79 Handoff

## Status

Done by explicit product decision on 2026-07-30.

Implementation checks and browser QA pass. The direct `50 x 20` was stopped by
the user after roughly eight and a half hours, produced no report, and is not
claimed as passing evidence. The cohort is deliberately deferred to the end of
Phase 80 with resumable checkpoints and exactly `7` workers. Phase 80 Step 02
inventories the rework scope without inference.

## Entry Blocker

Cleared on 2026-07-29. The corrected matrix retains all `1,170` observations
and `234/234` cells; coverage, ordering, non-widening age, and stored-ceiling
integrity pass with zero structural violations.

The public-P90 calibration evidence is intentionally not suppressed:
`65/1,170` outcomes (`5.56%`) exceed the public upper, inside the predeclared
aggregate `5%..15%` tolerance. Six older role-family/age bands are conservative
because discrete zero/minimal-growth outcomes place their exceedance rate
below `5%`; they remain non-blocking `WARN` facts with positive counts. Zero
outcomes exceed the stored generated ceiling.

## Closeout Decision

- `pnpm check` passed with `252` files and `1,581` tests after bounding Vitest
  to two workers to avoid host-contention timeouts.
- The web production build passed; its existing large-chunk warning remains a
  Monitor item.
- Canonical Playwright QA passed `29/29`, including desktop/narrow/touch
  Squad/Market, full-screen profile scrolling, `200%` text, reduced motion,
  focus, negotiation, and SQLite/OPFS coverage.
- Manual browser inspection confirmed contextual action-menu focus recovery,
  one scrolling dialog owner, stable top/bottom profile recovery, public range
  accessible text, one-decimal exact current attributes, and role-appropriate
  attribute groups.
- The direct `50 x 20` was intentionally stopped. It did not write
  `EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_50X20_REPORT.md`;
  neither partial output nor a gate result exists.
- The user accepts Phase 79D as complete based on its implementation and
  bounded deterministic evidence. The missing longitudinal cohort remains an
  explicit future-rework obligation, not a retroactive pass.

## Goal

Close Phase 79D with one deterministic `50 x 20`, targeted Squad/Market browser
inspection, absence audits, and a truthful return to a Phase 79 release gate
that uses no more than twenty seasons per world.

## Expected Files

- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_REPORT.md`
- `docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_50X20_REPORT.md`
- `docs/audits/README.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/README.md`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/08-50x20-browser-qa-phase-report-and-phase-79-handoff.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

## Evidence To Record

- Initial effective current/potential six-star counts by world.
- Current-six age/archetype/club/slot distribution.
- Potential-ceiling-six age/current-rating/public-range/value/asking-price
  distribution.
- Public lower/upper range width by age and role plus non-vacuous projection
  coverage against the deterministic development-outcome matrix.
- Annual allocated/generated/accepted exceptional counts by season.
- Active year-10 and year-20 exceptional stocks by division.
- Exact `€150m` hit count and every hit's eligibility.
- Non-eligible exact-cap display-collision count; it must be zero after
  whole-euro quantization.
- First/Second/Third value median/P90/P99/maximum after the prospect floor.
- Offered/asking, counter/asking, agreed/asking, and completed/asking ratio
  distributions.
- Exact asking/completed equality count/share, seller
  accepted/rejected/countered counts, counter outcomes, and
  completed-after-counter count.
- Permanent/free-agent attempt, affordability, completion, and fee evidence
  sufficient to detect a regression from higher prospect values.
- Positive observation counts for every required Phase 79D gate.
- Same-seed replay proof without a second full cohort.

## Browser QA Checklist

- Open Market sorted descending by potential in several deterministic worlds.
- Inspect the leading teenager, leading current player, goalkeeper prospect,
  and one ordinary player.
- Confirm no current six-star row uses an incompatible child-prodigy age.
- Confirm a prospect whose public range reaches six-star upside does not show a
  negligible public value/asking price and is not priced like a proven
  champion when the range is wide.
- Confirm an ineligible near-cap player never renders the exact
  `€150,000,000` public-value label.
- Confirm current rating, public potential range, public value, asking price,
  and fee labels remain distinct.
- Confirm the potential range uses six stable slots, half-star boundaries,
  filled lower estimate, patterned uncertain upside, neutral outline, and the
  dark-orange exceptional sixth slot.
- Confirm accessible text states the localized lower/upper range and uncertain
  width without calling the lower estimate guaranteed.
- Confirm potential sorting places a narrower/higher conservative projection
  ahead of a wide low-floor lottery with the same upper ceiling.
- Inspect one accepted-at-asking story and one countered story. Confirm offered,
  current asking, counter/agreed, and completed fee are labeled from their
  actual facts rather than copied for presentation.
- Confirm exact current attributes remain one-decimal and numeric potential
  remains absent.
- Confirm the existing Squad/Market dialog, table scrolling, contextual action
  menu, keyboard focus restoration, narrow layout, `200%` text, and reduced
  motion do not regress.

## Absence Audit

- no potential-first archetype precedence for a current-six assignment;
- no incompatible post-generation floor that bypasses the selected archetype;
- no forced-count metric presented as effective stock;
- no production career rollover omitting the annual world allocation;
- no young-six branch bypassing shared upper-tail compression;
- no non-eligible public value rounding to the exact cap label;
- no required gate that passes with zero observations;
- no duplicated valuation or rarity formula in CLI, React, or simulation-tools;
- no AI `offerFee = currentAskingPrice` identity making the seller counter path
  unreachable;
- no report that claims asking/fee separation from independent types while
  omitting pairwise equality and counter observations;
- no persisted potential range/floor, observer-specific projection, or
  star-space uncertainty shortcut;
- no color-only potential uncertainty or singular youth ceiling presented as a
  guaranteed destination;
- no compatibility migration/default/dual reader for an incompatible beta
  save; the canonical delete/reset path is used;
- no live source dependency, raw real-player rows, or exact numeric potential
  output.

If an obsolete path remains, reopen its owning Phase 79D step and fix it there
before returning to Step 08.

## What NOT To Implement

- No new tuning during closeout.
- No threshold relaxation, seed exception, or report edit to manufacture a
  pass.
- No scouting or browser feature beyond the already documented range.
- No `750`-world run.
- No claim that `50 x 20` replaces the Phase 79 release gate.
- No claim that twenty seasons prove equilibrium beyond year 20.
- No Phase 80 implementation.

## Required Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm cli ten-season-report \
  --seed-prefix=phase79d-exceptional-economy-50x20 \
  --worlds=50 \
  --seasons=20 \
  --report-output=docs/audits/EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_50X20_REPORT.md
git diff --check
graphify update .
```

The historical direct command was started once and stopped by user decision.
Future rework documentation must use `--checkpoint-dir`, `--shards=50`, and
`--workers=7`; it must choose its final report path before execution.

## Twenty-Season Coverage Statement

- The cohort covers a representative age-15 to age-35 player arc, year-10 and
  year-20 active stocks, and twice the project's `10+`-season long-horizon
  minimum.
- With `54` clubs and `918` opening league fixtures per world, the later
  release gate chooses breadth across `750` deterministic worlds while keeping
  runtime operationally bounded.
- The report must state explicitly that it does not prove multi-generational
  economic equilibrium or any behavior after season 20.

## Definition Of Done

- Every focused Phase 79D invariant passes.
- The interrupted `50 x 20` has no result and is not claimed. The user
  explicitly deferred this longitudinal criterion to the final rework
  closeout.
- Browser evidence proves the Market stories that triggered the phase are
  corrected, the range remains accessible across Squad/Market/profile,
  and incompatible beta saves use reset/delete without UI regressions.
- `pnpm check`, web build, browser, dependency, diff, and Graphify gates pass.
- Phase 79D is marked Done; Phase 79 Step 14 remains paused until Phase 80 and
  its checkpointed `50 x 20` complete.
- Phase 79 Step 14 documents staged evidence ending at `750 worlds × 20
  seasons`, not `750 x 50`, and remains unclaimed until actually run.
- The final report explains both the full-player-arc/runtime rationale and the
  residual lack of evidence beyond twenty seasons.
