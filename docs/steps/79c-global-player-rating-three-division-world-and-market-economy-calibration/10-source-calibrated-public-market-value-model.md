# Step 10 - Source-Calibrated Public Market Value Model

## Status

Done.

The user explicitly authorized every necessary propagation edit. The final
model uses a continuous role-ability curve between public star anchors, an
explicit owner-division market context, a neutral free-agent context,
progressive age/potential/position factors, upper-tail compression, and the
rare young six-star `€150m` ceiling. Observer, form, and contract facts cannot
change public value.

The three-world canonical fit passes every versioned First/Second/Third
Division median, P90, P99, and maximum tolerance. Club comparisons use only
the separately labeled normalized `22`-active-senior source comparator.
Focused tests (`97/97`), CLI (`33/33`), ten-season report regressions (`15/15`),
web (`327/327`), package typechecks, dependency boundaries (`745` modules /
`2,837` dependencies), diff, and Graphify pass. No final long-run cohort ran.

## Goal

Replace the linear, contract/form-contaminated valuation with one explicitly
injected deterministic public-value model that matches versioned tier
distributions and preserves a rare `€150m` young-champion ceiling.

## Expected Files

- `packages/content/src/balance/player-market-calibration.json`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/market/index.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/apply-career-transfer.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/player-market-calibration-report.ts`
- `packages/simulation-tools/src/player-market-calibration-report.test.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/simulate-season/market-demo-output.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/web/src/app/use-career-screen-presentations.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/10-source-calibrated-public-market-value-model.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Keep one pure canonical public-value function that requires validated market
  anchors and valuation curves as inputs.
- Remove `DEFAULT_PLAYER_VALUATION_CONFIG` and every implicit engine default.
- Keep all coefficients/bands in the two Step 01 JSON assets. Engine and
  simulation-tools must not import content or duplicate their values.
- Propagate the required config through transfer feasibility, selected-club
  negotiation, AI market lifecycle, monthly/season progression, diagnostics,
  Squad/Market presentation, and their app composition boundaries.
- Make CLI/web choose the exact version stamped in `GameMeta`.
- Use global current role ability, potential, age, position, and calibrated
  market context.
- Choose/document a nonlinear quality curve from measured distribution fit; do
  not preserve the old linear formula for compatibility.
- Remove weekly form, contract security, and seller pressure from public value.
- Ensure observing club identity cannot change public value.
- Define neutral owner market context for free agents without borrowing the
  selected club's tier/reputation.
- Match per-player tier median, P90, P99, and maximum tolerances against the
  Step 01 included-player population.
- Match club squad-value tolerances only against Step 01's separately labeled
  `22`-active-senior normalized comparator; never compare a game club directly
  with the raw full-roster source total.
- Use a progressive age curve:
  - age `<=25` may reach the cap only at six stars;
  - age `26..29` may remain near the tail but not easily hit the youth cap;
  - later decline is progressive.
- Compress only the upper tail above approximately `€80m`.
- Clamp to exactly `€150m` and prove ordinary players cannot reach it.
- Preserve integer minor-unit money and deterministic rounding.
- Emit structured diagnostic components without exposing exact potential.
- Delete the old formula/default in this step; Step 14 only verifies absence.

## What NOT To Implement

- No asking-price, seller acceptance, final-fee, wage, budget, or finance
  retuning.
- No fixed star-to-price lookup or proportional `150/220` rescale.
- No weekly-form, observer, or short-contract multiplier.
- No live source lookup, real-player fixture, or exact-potential presentation.
- No content import from engine/simulation-tools and no duplicated fallback
  coefficients.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/engine/src/market/player-valuation.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/apply-career-transfer.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/progress-fixture.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/simulation-tools/src/player-market-calibration-report.test.ts \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/web run test
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Fixed anchors and generated tiers meet the versioned tolerances.
- Third-tier values no longer cluster around millions; First Division has a
  credible long tail.
- Only a six-star player aged `25` or below can reach `€150m`.
- Free-agent and observer identity do not distort public value.
- Contract and weekly form no longer alter the public number.
- Every production/diagnostic caller receives the same explicit versioned
  config and the old default/formula is gone.
