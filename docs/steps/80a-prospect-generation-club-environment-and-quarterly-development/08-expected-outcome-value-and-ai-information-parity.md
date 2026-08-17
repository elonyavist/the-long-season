# Step 08 - Expected-Outcome Value And AI Information Parity

## Status

Done. Step 06 is reclosed on its ceiling-first joint generation owner and this
step now prices that final generated population through the accepted monotonic
current/P50/upper model. Step 09 is the only next action.

The previous `valuation-curves-v4` delivery remains useful historical
evidence for context invariance, free-agent fee separation, AI information
parity, and cap eligibility, but it is no longer the accepted valuation
contract. Step 09 and manual inspection exposed a structural sign error in
the prospect formula: at identical current quality and public P50, increasing
only the public upper estimate lowered the value. The v5 delivery below
removes that inversion and calibrates only global coefficients against the
final Step 06 population.

## Goal

Price proven quality fully, price the non-guaranteed public P50 only through a
bounded participation tranche, and give the public upper estimate positive but
limited option value. Preserve asking price and buyer-specific risk appetite as
separate facts, and prevent valuation or live AI from reading stored ceiling.

## Reopen Evidence And Frozen Economic Contract

- The fresh Step 09 closing sample contains `9,291` First Division
  observations. Its `€2,837,676` median is the only closing value-fit failure:
  it is below the predeclared accepted minimum of `€3,000,000`, while the First
  Division P90/P99/maximum and every Second/Third Division check pass.
- The visible prospect examples reproduce the current formula exactly:
  - Ivan Stanic, goalkeeper, age `16`: current `3`, public P50 `3.5`, public
    upper `6`, public value `€1,399,666`;
  - Dario Tadic, centre-back, age `18`: current `4`, public P50 `4`, public
    upper `6`, public value `€19,680,007`.
- With current and P50 held fixed, the v4 width haircut gives Ivan
  `€1,866,221` at upper `3.5`, `€1,679,599` at upper `4.5`, and `€1,399,666`
  at upper `6`. It gives Dario `€24,600,009` at upper `4`, `€22,140,008` at
  upper `5`, and `€19,680,007` at upper `6`. Better upside therefore has a
  negative marginal value. This is a model defect, not a display defect.
- The dated Transfermarkt samples already frozen in
  `player-market-calibration-transfermarkt-it-2026-07-28-v2` remain the
  monetary evidence. Ivan's value is already above the bounded Serie B U19
  sample maximum of `€1,000,000`; Dario lies between the Serie A U19 P90 of
  `€12,500,000` and P99 of `€27,750,000`. Those samples do not define game
  stars or realization probabilities, so they validate distributions rather
  than dictate tranche coefficients.
- The new public-quality owner is frozen as follows. Let `C`, `M`, and `U` be
  the continuous nonlinear curve values of public current ability, public P50
  ability, and public upper ability. Before age, position, shared upper-tail
  compression, quantization, and cap rules, derive:

  ```text
  expectedQualityValue =
    C
    + p50Participation * (M - C)
    + upperOptionParticipation * (U - M)
  ```

  Both participations are versioned integer basis points. Validation requires
  `0 < upperOptionParticipation <= p50Participation < 10,000`. Therefore
  current quality is never discounted, P50 remains non-guaranteed, every
  public tranche is bounded, and public upper has a positive option value
  without being priced as a certain outcome.
- The old global P50-to-upper uncertainty haircut is removed, not renamed or
  neutralized. Buyer-specific uncertainty tolerance already belongs to the
  separate AI risk-appetite policy; changing the intrinsic value must not
  silently retune seller multipliers, AI target weights, or AI risk appetite.

## What To Implement

- Make public value consume the canonical public assessment, age, and existing
  role/source-calibrated global curves frozen in Step 01. It must not derive a
  second potential projection from `Player`.
- Replace the v4 whole-P50 uncertainty haircut with the frozen `C`/P50/upper
  tranche formula. Use exact public abilities on the continuous money curve;
  do not reduce the calculation to half-star bucket widths.
- Replace the old prospect-expectation fields, component names, validation,
  fixtures, and tests in one beta-breaking edit. Do not retain
  `uncertaintyDiscountBasisPointsPerHalfStar`,
  `minimumUncertaintyMultiplierBasisPoints`, a multiplier fixed at `10,000`,
  or a compatibility branch.
- Keep all three quality terms non-negative and ordered through the canonical
  public-assessment invariant `current <= P50 <= upper`. Reject malformed
  policy or assessment input instead of clamping an invalid order silently.
- Calibrate the two global tranche participations only after Step 06 closes.
  Use the deterministic development-outcome matrix and the already frozen
  Transfermarkt prospect/division bands; do not select coefficients from the
  two screenshots or weaken a seed, denominator, percentile, or tolerance.
- Advance the immutable version chain together:
  - `valuation-curves-v5` owns the new tranche coefficients and removal of the
    old haircut;
  - `asking-price-curves-v4` changes only its valuation-version reference;
  - `market-behavior-calibration-v5` changes only its asking-price-version
    reference.
- Do not change any asking-price coefficient, seller rule, AI target weight,
  affordability coefficient, or AI risk-appetite coefficient merely because
  the two dependent assets receive reference-only version bumps.
- Treat old Step 09 checkpoints and beta saves as incompatible with the new
  calibration bundle. Reject them through the existing version boundary; do
  not add a compatibility reader or reuse old value observations.
- Keep full upper from being priced as guaranteed. Its contribution is the
  bounded `upperOptionParticipation` tranche and still passes through shared
  upper-tail compression and cap policy.
- Remove `marketContext` from the public-valuation domain/input path, config,
  schema, fixtures, adapters, reports, and call sites.
- Remove category/free-agent multipliers and per-context maximums completely;
  do not retain neutral coefficients, aliases, fallbacks, or compatibility
  branches.
- Preserve one rare, eligibility-gated global exact `€150m` public-value cap.
- Prove transfer, promotion/relegation, owner-category, expiry, and free-agent
  transitions alone do not change public value.
- Preserve exact zero free-agent transfer fee separately from unchanged,
  non-zero intrinsic public value.
- Keep contract, importance, seller finance, and willingness in asking price,
  not intrinsic value; category may influence asking price only.
- Replace live AI stored-ceiling target checks with the canonical public
  assessment plus club need, budget, and risk appetite.
- Make live AI squad selection consume caller-supplied dated public
  assessments for prospect rotation. Remove its direct role-potential read and
  manual `/365.25` age calculation; current-to-upper public room and the
  assessment's exact civil age own that bounded bonus.
- Replace the contract-demand snapshot's stored-ceiling-derived
  `reachablePotential` with an explicitly named public-assessment fact, and
  migrate every domain, engine, storage, CLI, UI-test, and browser fixture
  consumer in the same beta-breaking change. Do not retain the old field as an
  alias.
- Make willingness, contract demand, AI market ranking, and CLI roster/youth
  classification call the same completed-age/public-assessment owners instead
  of recomputing age or reading role potential directly.
- Keep stored ceiling inside generation, development hard caps, canonical
  public-projection derivation, and diagnostics only; do not pass it into
  public valuation or live AI decision inputs.
- Keep `derivePlayerValuation(...)` free of `CareerState`, owner, employment
  kind, seller posture, and stored ceiling; those facts belong to asking-price
  or market-action Modules.
- Prove the tranche formula directly for otherwise identical players:
  - `C = M = U` returns exactly the proven-current quality value before the
    shared age/position/tail pipeline;
  - increasing current with P50/upper fixed cannot reduce value;
  - increasing P50 with current/upper fixed cannot reduce value;
  - increasing public upper with current/P50 fixed cannot reduce value and has
    positive marginal value before an explicitly reached shared cap;
  - public upper never contributes its full curve delta as guaranteed value;
  - values stay continuous inside one public half-star interval.
- Re-run the unchanged context-invariance, free-agent, asking-price,
  affordability, AI-information-parity, upper-tail, and exact-cap matrices
  after the formula and version-chain change.
- Add absence tests/searches so live market paths cannot regain privileged
  ceiling access.

## What NOT To Implement

- No incoming selected-club offers, listing posture, loan, or Posta UI.
- No post-output threshold selection or division-specific intrinsic-value
  factor.
- No anchor-only patch intended to hide the negative-upper sign error.
- No global uncertainty haircut on the whole P50 value and no duplicate
  buyer-risk penalty inside intrinsic public value.
- No seller or AI behavior retuning as a side effect of reference-only asset
  version bumps.
- No compact values, transfer-fee policy change, or observer-specific stars.

## Expected Files

- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/market/index.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/test-fixtures/player-valuation-config.ts`
- `packages/engine/src/test-fixtures/market-behavior-config.ts`
- `packages/engine/src/career/career-market-catalog.ts`
- `packages/engine/src/career/career-market-catalog.test.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/preliminary-agreement.ts`
- `packages/engine/src/career/preliminary-agreement.test.ts`
- `packages/engine/src/career/selected-club-contract-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/apply-career-transfer.test.ts`
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/youth-promotion.ts`
- `packages/engine/src/career/youth-promotion.test.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-lifecycle.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/player-willingness.test.ts`
- `packages/engine/src/squad/public-player-assessment.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/engine/src/career/contract-negotiation-demand.ts`
- `packages/engine/src/career/contract-negotiation-demand.test.ts`
- `packages/engine/src/career/ai-contract-lifecycle.ts`
- `packages/engine/src/career/ai-contract-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/domain/src/career/contract-negotiation.ts`
- `packages/domain/src/career/contract-negotiation.test.ts`
- `packages/domain/src/career/preliminary-agreement.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `apps/cli/src/commands/career/roster-output.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/engine/src/market/player-valuation.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/career/career-market-catalog.test.ts \
  packages/engine/src/career/apply-career-free-agent-signing.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/market/player-willingness.test.ts \
  packages/engine/src/career/contract-negotiation-demand.test.ts \
  packages/engine/src/career/ai-contract-lifecycle.test.ts \
  packages/engine/src/career/progress-fixture.test.ts \
  packages/engine/src/team-selection/ai-squad-selection.test.ts \
  packages/engine/src/use-cases/simulate-season.test.ts \
  packages/domain/src/career/contract-negotiation.test.ts \
  packages/domain/src/career/preliminary-agreement.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/features/squad/career-squad-adapter.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Proven current quality is fully priced; P50 upside is partially priced and
  explicitly non-guaranteed; public-upper upside contributes positive bounded
  option value.
- The formula is non-decreasing independently in current, P50, and public
  upper, and the old negative-upper counterexamples are impossible.
- The whole-P50 uncertainty multiplier and its compatibility remnants no
  longer exist. Buyer-specific risk appetite remains separate and unchanged.
- `valuation-curves-v5`, reference-only `asking-price-curves-v4`, and
  reference-only `market-behavior-calibration-v5` form one validated immutable
  version chain.
- The unchanged Transfermarkt-derived prospect and division bands pass on the
  final Step 06 population without a division-specific intrinsic-value input
  or weakened tolerance.
- Public value is invariant under transfer, owner division, category change,
  expiry, and free agency.
- `marketContext`, its multipliers, and its per-context maximums no longer
  exist in production valuation paths.
- Asking price remains distinct.
- Exact `€150m` hits use one global cap and are rare and correctly eligible.
- AI and manager consume the same public assessment.
- Valuation, willingness, and AI cannot bypass the public-assessment Interface
  by calling projection helpers directly.
- No live AI target path reads stored ceiling.
- Step 06 is closed, this reopened owner passes its focused and bounded
  evidence, and Step 09 is the only next action.

## Completion Evidence

- `valuation-curves-v5` now derives intrinsic quality value as
  `C + 0.50 * (M - C) + 0.10 * (U - M)`. Proven current quality is fully
  priced, P50 remains a bounded participation tranche, and a better public
  upper has positive option value instead of reducing the result.
- The old whole-P50 uncertainty haircut, `marketContext`, owner/employment
  multipliers, per-context caps, and their compatibility paths were deleted.
  Asking price, buyer risk appetite, and the exact-zero free-agent fee remain
  separate facts.
- The immutable reference chain is `valuation-curves-v5` ->
  `asking-price-curves-v4` -> `market-behavior-calibration-v5`; the two
  dependent bumps change references only.
- The first fresh `20 x 2` v5 diagnostic preserved every structural economy
  invariant but measured a First Division median of `EUR 2,551,209.50`, below
  the frozen `EUR 3,000,000` minimum. A second fresh diagnostic increased P50
  participation to `0.80`; the median moved only to `EUR 2,562,722`, proving
  that the failure belonged to the achieved-quality curve rather than the P50
  tranche. That attempted coefficient was discarded and participation was
  restored to `0.50`.
- A read-only component audit then showed the median First Division player was
  already effectively at P50: a representative age-25 centre-back had current
  `12.786`, P50 `12.790`, and upper `12.801`. Following the Step 01 permission
  to calibrate global coefficients only after recording a failing diagnostic,
  the `3.5`-star and `4`-star anchors moved globally to `EUR 2.2m` and
  `EUR 22m`. No division input, threshold, seed, denominator, asking-price
  coefficient, seller rule, AI weight, or risk-appetite coefficient changed.
- The final fresh `20 x 2` / `20`-shard / `7`-worker evidence reports all
  Step 08-owned gates green with positive observations: public ordering
  `75,210 / 0` violations, stored-six value `188 / 0`, player-economy
  violations `0`, and First/Second/Third median values of
  `EUR 3,022,353.50`, `EUR 503,559`, and `EUR 117,568`. The two reported
  `table_points_spread_avg` world failures are outside this step's economic
  owner and do not mask an owned gate.
- Required verification on Node `24.19.0`: mandatory Vitest `291/291` across
  `24` files; all seven package typechecks; dependency cruise `782` modules /
  `3,100` dependencies with no violations; production absence scans; and
  `git diff --check`. No `50 x 20` ran.

## Historical Completion Record - Superseded By Reopen

The records below describe the earlier v4 delivery. They remain audit evidence
but do not satisfy the reopened tranche-model Definition of Done.

- Reopen resolution: `valuation-curves-v4` remains unchanged. Its owner matrix,
  cap, monotonicity, uncertainty discount, context invariance, and version
  bundle are green after the Step 06 population repair, so no evidence supports
  inventing a v5 before the canonical closing cohort.
- The absence audit found one live AI squad-selection bonus reading stored
  role potential and deriving age with `/365.25`. That owner now requires
  fixture-dated `PublicPlayerAssessment` rows, derives prospect opportunity
  from public current-to-upper room and exact civil age, and rejects missing or
  stale assessments. Season and career composition roots derive the safe facts
  on the fixture date; hidden ceiling differences cannot affect selection.
- The canonical three-division identity snapshot moved reproducibly from
  `a7f1f42d` to `f2cfaf40` after the intentional generation repair. The new
  value was reproduced twice before the expectation changed.
- Reopen verification on Node `24.19.0`: mandatory Vitest `232/232` across
  `20` files; added AI owner coverage `46/46` across `3` files; all seven
  package typechecks; focused ESLint; dependency cruise `782` modules / `3,085`
  dependencies with no violations; production absence scans; `git diff
  --check`; and `graphify update .`. No canonical cohort and no `50 x 20` ran.

- `PublicPlayerAssessment` now owns one date-stamped current/P50/upper fact set
  for valuation, willingness, contract demand, AI ranking, and browser/CLI
  adapters. Durable contract-demand snapshots store the explicitly named
  public P50 ability and no longer retain a stored-ceiling-derived alias.
- Intrinsic public value consumes only the public assessment, primary position,
  and `valuation-curves-v4`. The old `marketContext`, category/free-agent
  multipliers, per-context caps, and duplicate market-ability derivation were
  deleted. Asking price remains a separate seller fact; free-agent public value
  remains non-zero while transfer fee remains exactly zero.
- One global exact `€150m` cap is limited to rare, age-qualified current-six
  players. Public P50 is priced on the nonlinear curve and the P50-to-upper
  width supplies only an uncertainty discount.
- `market-behavior-calibration-v4` gives live AI a versioned, division-aware
  risk appetite over the same public range shown to the manager. Equal public
  assessments produce equal decisions regardless of stored ceiling; wider
  uncertainty ranks lower, with stricter lower-division tolerance.
- Verification on Node `24.19.0`: the expensive report file passed all
  unaffected tests (`20/20`) and its one intentionally changed deterministic
  market outcome passed after a focused fixture update; the remaining required
  suite passed `201/201` across `19` files; additional touched-owner coverage
  passed `101/101` across `11` files; seven package typechecks, dependency
  cruise (`782` modules / `3,077` dependencies), absence scans,
  `git diff --check`, and `graphify update .` pass. No `50 x 20` ran.
