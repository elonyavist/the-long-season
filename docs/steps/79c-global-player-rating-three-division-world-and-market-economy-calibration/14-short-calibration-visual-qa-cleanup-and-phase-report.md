# Step 14 - Short Calibration, Visual QA, Cleanup And Phase Report

## Status

Done.

## Goal

Close Phase 79C with focused distribution evidence, one bounded `10 x 10`
three-division run, complete Squad/Market browser inspection, absence audits,
and a truthful return path to Phase 79.

## Expected Files

- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.test.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.test.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_REPORT.md`
- `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/README.md`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/14-short-calibration-visual-qa-cleanup-and-phase-report.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

## Evidence To Record

- Current/potential star histograms by tier and starter/reserve/youth status.
- Initial and annual exceptional allocations plus active year-10 `5.5`/`6`
  stock and club/slot locations.
- Value median/P90/P99/maximum and squad values by tier.
- Public value/asking/completed-fee distributions.
- Free-agent public value and exact zero-fee proof.
- Wage, transfer budget, utilization, and headroom distributions by tier.
- Cross-tier target/attempt/completion/rejection flows.
- Promotion/relegation counts, closed Third boundary, calendar integrity, and
  selected-club continuity.
- Contract/finance/registration/squad-floor/goalkeeper structural failures.
- Complete topology/calibration version bundle and a focused same-seed replay
  hash proving deterministic composition without repeating the full cohort.

## Browser QA Checklist

- Squad and Market ratings at ordinary, half-star, `5.5`, and `6`.
- Five gold plus half/full dark-orange sixth-star rendering.
- Accessible full rating and no color-only champion meaning.
- Exact current attributes with one decimal in goalkeeper/outfield detail.
- No exact potential leak.
- Cross-tier Market filters/result counts.
- Distinct value, asking, offered, agreed, and free-agent zero-fee labels.
- Desktop, narrow, keyboard, touch, `200%` text, reduced motion, modal scroll,
  sticky table, contextual menu, and focus restoration.
- No recurrence of the Squad/Market scroll-container document-height glitch.

## Absence Audit

Earlier owner steps must already have removed their obsolete paths. This step
only proves absence; it does not reopen implementation scope:

- no club-relative rating calculation or reference-squad field;
- no `elite` Boolean/presentation branch;
- no production single-league career bootstrap;
- no implicit/default linear valuation;
- no ambiguous value/asking/fee field;
- no first-object-key competition/fixture traversal;
- no engine/simulation-tools import from content;
- no unversioned production tuning.

If an obsolete path still exists, reopen its owning Phase 79C step and fix it
there before returning to Step 14.

## What NOT To Implement

- No new gameplay feature/threshold during closeout.
- No warning suppression, target relaxation, seed exception, or report edit to
  manufacture a pass.
- No cleanup of owner files outside Expected Files; reopen the owning step.
- No `50 x 20`, `750 x 50`, or `10,000 x 50`.
- No claim that `10 x 10` replaces Phase 79's full gate.
- No Phase 80/81, scouting, or next phase.

## Required Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm cli ten-season-report \
  --seed-prefix=phase79c-three-division-short \
  --worlds=10 \
  --seasons=10 \
  --report-output=docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md
git diff --check
graphify update .
```

The `10 x 10` command runs once in this step only.

## Definition Of Done

- Every focused requirement/tolerance passes.
- The single `10 x 10` cohort has zero owned structural failure and no year-10
  rating/value/wage inflation breach; a focused same-seed replay test proves
  deterministic hashing without executing a second full cohort.
- Browser evidence proves global stars, sixth-star semantics, one-decimal
  attributes, cross-tier facts, and distinct value/asking/fee labels.
- Every absence audit passes without Step 14 editing owner files.
- `pnpm check`, browser, build, diff, and Graphify gates pass.
- Phase 79C is Done and control returns to the documented Phase 79 closeout
  path without claiming a full long run.

## Outcome

- Closed the source-backed global `1..6` rating, canonical three-division
  world, public-value/asking/fee separation, and coordinated wage/budget/
  willingness/AI calibration described by the earlier owner steps.
- Reopened Steps 12 and 13 only for failures reproduced by the bounded gate:
  rare-player location/willingness and one exhausted-pool squad floor. Their
  step documents record the adopted owner corrections.
- Kept structural squad repair deterministic and canonical: hard floors share
  the free-agent pool before optional depth, and a lazy bounded reserve enters
  the world only when the existing pool is insufficient.
- Added non-vacuous free-agent diagnostics for canonical replenishment without
  persisting a duplicate transfer history or changing gameplay decisions.
- Completed the browser and absence audits and wrote
  `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_REPORT.md`.
- Returned control to Phase 79 Step 14. No Phase 79 staged gate or Phase 80
  implementation was started.

## Verification

- `pnpm check`: PASS (`247` files / `1,532` tests).
- Dependency-cruiser: PASS (`751` modules / `2,906` dependencies).
- All workspace typechecks: PASS.
- `pnpm --filter @game/web run build`: PASS; only the existing non-blocking
  main-chunk size warning remains.
- Current-product plus SQLite/OPFS visual QA: PASS (`29/29`). No frontend or CSS
  file changed after that browser run.
- Bounded `10 x 10`: PASS (`10` worlds / `100` seasons, `0` failed worlds,
  minimum squad `18`, `0` structural violations, `0` rating-cap violation
  worlds, `3,882` measured free-agent signings, `0` non-zero free-agent fees).
- Absence audit: PASS. Remaining `elite` text is limited to the distinct
  content-generation potential class or test labels/IDs, not a public rating
  Boolean or presentation branch.
- `git diff --check`: PASS.
- `graphify update .`: PASS.

## Residual Warnings

- All ten bounded worlds retain monitor warnings for role-depth counts,
  active-player population movement, and wage pressure. Eight also monitor
  goals-per-match variance; two retain a champion-streak football story.
- No warning was suppressed and no accepted threshold was relaxed.
- Phase 79's `50 x 10`, `250 x 30`, and `750 x 50` sequence remains required
  against the new world/economy and is deliberately unrun here.
