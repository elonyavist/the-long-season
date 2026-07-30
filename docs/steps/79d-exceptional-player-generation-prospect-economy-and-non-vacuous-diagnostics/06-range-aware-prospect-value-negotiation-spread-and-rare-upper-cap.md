# Step 06 - Range-Aware Prospect Value, Negotiation Spread And Rare Upper Cap

## Status

Done after public-upper rework.

## Goal

Price the same public potential range shown to the manager as a calibrated,
risk-discounted football expectation, apply upper-tail compression to every
player, keep `€150m` as a rare display-safe final ceiling, and make the
configured AI offer/counter path observable without merging public value,
asking price, offered fee, or completed fee.

## Expected Files

- `packages/content/src/balance/player-market-calibration.json`
- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/test-fixtures/player-valuation-config.ts`
- `packages/engine/src/test-fixtures/market-behavior-config.ts`
- `packages/engine/src/market/seller-asking-price.test.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/simulation-tools/src/player-market-calibration-report.ts`
- `packages/simulation-tools/src/player-market-calibration-report.test.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/06-range-aware-prospect-value-negotiation-spread-and-rare-upper-cap.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

The rating-scale and asking-price assets plus shared engine fixtures were added
to this list when
implementation reached the explicit Step 05a-to-valuation dependency. The
rating asset removes the temporary Step 05b base-version bridge; the asking
asset advances only its exact valuation-version reference; the fixtures supply
the same required projection and AI-offer policies to isolated engine tests.
None of these changes adds another gameplay owner.

## Implementation Checklist

- Consume the Step 05a projection owner and version/schema-validate the
  valuation-specific uncertainty discount. Do not recreate age/role projection
  factors inside valuation.
- Keep engine free of content imports and implicit defaults.
- Preserve continuous current-quality interpolation.
- Compute one deterministic potential-expectation floor from:
  - the Step 05a expected role ability, which is bounded by the public
    lower/upper projection;
  - the corresponding continuous quality anchor;
  - public range width;
  - the versioned uncertainty discount.
- Use the larger of current-quality value and potential-expectation value
  before the shared context and upper-tail policy.
- Prove monotonic relationships for otherwise equal players:
  - a higher public lower estimate cannot reduce public value;
  - a higher upper ceiling with the same lower estimate cannot reduce the
    undiscounted expectation;
  - narrowing an otherwise-equal range cannot increase its risk discount or
    reduce public value;
  - progressing toward the same potential cannot reduce the current-quality
    component;
  - ordinary small gaps do not receive an extreme-prospect windfall.
- Do not use the raw ceiling or an unweighted lower/upper midpoint as expected
  outcome.
- Calibrate the result against the Step 01 development-outcome matrix,
  aggregate prospect market evidence, and existing First/Second/Third
  distribution tolerances. Keep game realization probabilities separate from
  sourced monetary facts.
- Apply upper-tail compression to all players, including eligible current
  six-star players.
- Quantize the final public value deterministically downward to whole euros
  before applying the final cap semantics used by the current whole-euro
  Market presentation.
- Keep exact `€150m` as the final clamp only:
  - an eligible cap hit remains exactly `€150,000,000`;
  - every non-eligible value is at least one displayed whole euro below it;
  - no non-eligible value can round to the exact cap label;
  - cap frequency is measured across a bounded multi-world sample and is not
    the routine six-star result.
- Preserve distinct seller asking price and final fee. Verify that their
  existing multipliers consume the corrected public value.
- Replace the AI's unconditional `offerFee = currentAskingPrice` with one
  deterministic, versioned, affordability-bounded offer policy expressed in
  the existing market-behavior configuration.
- Label its coefficients as game-design policy and calibrate them through the
  Step 01 baseline plus bounded Step 06 simulations; do not attribute them to
  Transfermarkt or choose them silently in implementation.
- Keep accepted-at-asking deals valid, but prove the seller reject/counter
  branches are reachable for AI offers and that accepted counters propagate
  their agreed fee unchanged into affordability, ledgers, and transfer history.
- Measure offered/asking and completed/asking ratios plus exact equality share;
  do not infer economic separation merely because the types have different
  names.
- Re-run affordability and AI workflow fixtures so the new prospect floor
  cannot bypass cash, wage, willingness, or squad constraints and so AI/user
  evaluation consume the same range-aware value.
- Keep public potential numeric values out of diagnostics intended for browser
  presentation.

## Rework Verification Contract - 2026-07-29

- Treat the Step 05b P90 public upper estimate as the only valuation upper
  input. The hidden stored ceiling remains a rarity fact and must not leak into
  price.
- Rerun all otherwise-equal monotonicity proofs after the narrower public
  ranges:
  - higher lower estimate cannot reduce value;
  - higher public upper estimate cannot reduce undiscounted expectation;
  - narrower range cannot increase uncertainty discount or reduce value;
  - current-quality progression remains monotone.
- Re-measure prospect values, division distributions, exact-cap frequency, and
  negotiation reachability before considering any coefficient change.
- Keep the already version-advanced prospect expectation identity. Change a
  coefficient only if the predeclared evidence gate fails and record the
  evidence before the change.
- Do not reinterpret a hidden six-star ceiling as public six-star upside merely
  to preserve old prices or cap frequency.
- Keep two diagnostic facts with explicit names: the stored generated ceiling
  drives rarity/allocation gates, while the public P90 upper drives valuation
  and its own displayed-frequency evidence. The same-seed stored-ceiling-six
  baseline must remain `302`; a change to the public upper must not shorten
  that rarity denominator.
- Treat `public upper <= stored ceiling` as a structural invariant. Step 07
  will measure outcomes above the public P90 symmetrically, while any outcome
  above the stored ceiling remains a hard failure.

## What NOT To Implement

- No fixed guessed `10%` or `15%` factor without Step 01/05a evidence.
- No contract, seller pressure, weekly form, or observer identity in public
  value.
- No proportional rescale of the entire economy merely to fit the cap.
- No wage formula derived from public value.
- No scouting, projection UI redesign, or observer-specific price.
- No forced counter in every negotiation, random unseeded bid, or offer chosen
  only to make a diagnostic non-zero.
- No save migration or compatibility reader.
- No live source lookup.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/engine/src/market/player-valuation.test.ts \
  packages/engine/src/market/seller-asking-price.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/simulation-tools/src/player-market-calibration-report.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- A teenager with a public range that reaches six-star upside cannot retain the
  pre-79D negligible valuation solely because current rating is low.
- A wide elite-upside range remains materially cheaper than a narrow,
  high-confidence elite projection with otherwise comparable facts.
- The prospect floor and uncertainty discount are versioned, evidence-linked,
  monotonic, and deterministic.
- Only eligible players render at the exact public-value cap; a non-eligible
  player cannot display the same `€150,000,000` label after quantization.
- The bounded deterministic sample observes seller acceptance, rejection, and
  counter outcomes; asking and completed fee are not structurally identical
  across every permanent transfer.
- Completed-after-counter fees remain coherent through affordability, finance,
  history, and AI.
- Existing division median/P90/P99/maximum tolerances remain credible or any
  evidence-backed revision is explicitly recorded.
- Upper-tail compression applies uniformly and exact cap hits are rare.
- Asking price, fee, affordability, and AI remain distinct and coherent.

## Completion Record

- Adopted solution: valuation consumes the Step 05a expected role ability,
  discounts it by the visible public-range width, and takes the larger of that
  expectation and current-quality value before shared context/compression.
  Whole-euro downward quantization reserves the exact `€150m` label for
  eligible current-six players. AI offers now use a versioned deterministic
  `70%..100%` affordability-bounded band, while seller counters split the
  offer/asking gap through a versioned concession.
- Verification: the exact required suite passed (`14` files / `135` tests);
  content, domain, engine, simulation-tools, CLI, and web typechecks passed;
  dependency-cruiser passed (`762` modules / `2,950` dependencies);
  `git diff --check` and Graphify passed.
- Bounded evidence: `20` deterministic initial worlds observed `52`
  potential-six players, including `19` low-current young prospects valued
  between `€5m` and `€27.01m`. The `100`-world initial baseline observed only
  `9` exact cap hits, all eligible, and zero ineligible cap-label collisions.
  One deterministic season observed `302` offers, `72` seller counters, `53`
  completed permanent transfers, `51` completed-after-counter paths, and only
  `2` offered/asking exact equalities.
- Lesson for Step 07: negotiation observations must retain seller and counter
  stage outcomes separately; a completion alone cannot prove that the counter
  path was exercised.

## Rework Completion - 2026-07-29

- Kept valuation on the public P90 projection while restoring the hidden
  generated ceiling as a separate diagnostic fact.
- The same `100` deterministic initial worlds retain exactly `302`
  stored-ceiling-six players; `151` currently expose public six-star P90
  upside. Allocation and rarity use the former, valuation uses the latter.
- `public upper <= stored ceiling` is checked structurally. The complete
  `1,170`-observation outcome matrix reports zero age-width violations with all
  observations retained.
- Required Step 06 suite passed (`14` files / `137` tests); six package
  typechecks, dependency-cruiser (`762` modules / `2,950` dependencies), and
  `git diff --check` passed. No gameplay coefficient changed and no `50 x 20`
  ran.
