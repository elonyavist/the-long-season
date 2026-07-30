# Step 07 - Non-Vacuous Joint-Distribution And Market Gates

## Status

Done after the owning Step 05a/05b fix and Step 06 re-verification.

## Goal

Make the diagnostics reject impossible age/rating/range/value combinations and
prevent any projection, rarity, intake, cap, or market gate from passing with
zero relevant observations.

## Expected Files

- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.ts`
- `packages/simulation-tools/src/player-potential-outcome-audit.test.ts`
- `packages/simulation-tools/src/player-market-calibration-report.ts`
- `packages/simulation-tools/src/player-market-calibration-report.test.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/07-non-vacuous-joint-distribution-and-market-gates.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add explicit `observationCount` to every new or existing potential-range,
  exceptional rarity, intake, cap-hit, prospect-value, and negotiation-spread
  gate.
- Model zero observations as `not_evaluated` or failure according to whether the
  phase contract requires that population to exist.
- Add regression fixtures proving zero observations cannot produce `PASS`.
- Gate the following joint relationships:
  - current-six archetype/age compatibility;
  - potential-ceiling-six current-rating, public-range, and value distribution;
  - public lower/upper/width distribution by age and role;
  - `current <= lower <= expected <= upper ceiling` ordering;
  - deterministic projection coverage against the Step 01 outcome matrix;
  - non-widening age progression for otherwise-equivalent role bands;
  - effective initial counts versus configured bounds;
  - allocated/generated/accepted annual exceptional intake;
  - active year-10 current/potential/lower-tier caps;
  - exact `€150m` hits by eligibility and frequency;
  - non-eligible values that render at the exact `€150m` label;
  - public value versus asking price for exceptional populations.
  - offered/asking, counter/asking, agreed/asking, and completed/asking ratios;
  - exact asking/completed equality count and share;
  - seller accepted/rejected/countered outcomes;
  - counter accepted/rejected/expired and completed-after-counter outcomes.
- Required negotiation-spread checks cannot pass merely because permanent
  completions exist. A positive completion count with zero reachable counter
  observations must remain `not_evaluated`/failure for the counter-path gate.
- Treat accepted-at-asking transfers as valid individual outcomes; gate the
  structural all-population identity and unreachable branches, not every equal
  pair.
- Emit representative offending player IDs, names, ages, ratings, division,
  value, asking price, and season for actionable failures.
- Keep warnings for plausible rare stories distinct from structural failures.
- Treat a range miss as calibration evidence, not proof that the stored ceiling
  was violated: the public lower estimate is not a guarantee.
- Measure misses symmetrically against the public band:
  - outcomes above the public P90 upper are calibration evidence, with a
    predeclared acceptable aggregate rate of `5%..15%`;
  - outcomes above the stored generated ceiling are structural violations and
    fail unconditionally.
- Pool the public-upper exceedance rate by the same role-family/age-band
  granularity as the projection policy. Do not estimate P90 calibration from
  the five streams in one matrix cell.
- Keep stored-ceiling-six rarity/allocation counts and public-upper-six
  presentation counts as two explicitly named facts. On the same Step 03
  baseline seeds, stored-ceiling-six must remain `302`.
- Require positive observation counts for both
  `public_projection_non_widening_age` and the ceiling-rarity gates. A zero-row
  pass is invalid.
- Preserve deterministic aggregation order and compact report memory.
- Ensure all report text is derived from structured facts outside engine.

## What NOT To Implement

- No generation, valuation, asking-price, AI, or gameplay tuning.
- No automatic threshold relaxation, seed exclusion, or warning suppression.
- No pass inferred from maxima initialized to zero.
- No long-run cohort in this step.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  packages/simulation-tools/src/player-potential-outcome-audit.test.ts \
  packages/simulation-tools/src/player-market-calibration-report.test.ts \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  packages/simulation-tools/src/long-run/career-long-runner.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Every owned gate prints its observation count.
- Required exceptional/intake populations cannot pass with zero observations.
- Joint age/rating/value contradictions produce named actionable failures.
- Range ordering, age/role width, outcome coverage, and range-aware value
  relationships are measured with positive observations.
- Exact-cap display collisions and asking/offer/counter/completed-fee
  relationships have separate non-vacuous gates.
- Plausible football variance remains warning/story evidence rather than being
  removed to satisfy a number.
- No gameplay coefficient changed in this diagnostics-only step.

## Blocked Attempt - 2026-07-29

### Implemented diagnostics

- Every owned exceptional-generation, projection, market, negotiation, and
  contract-finance gate now carries an explicit observation count and an
  evaluation status.
- Required zero-observation populations cannot pass.
- The CLI records separate asking, offered, counter, agreed, and completed-fee
  facts, seller and counter outcomes, exact equality shares, annual intake,
  exact-cap eligibility, year-10 stock, and named offending observations.
- The potential-outcome audit checks the complete age/role/room/participation
  matrix and reports reproducible examples instead of suppressing failures.
- A bounded one-world, ten-season smoke produced positive observations for all
  ten player-economy gates and no owned market failure. It was diagnostic
  evidence only, not the reserved `50 x 20` cohort.

### Verification

- Required focused suite: `6` files / `43` tests PASS.
- `@game/simulation-tools` and `@game/cli` typechecks PASS.
- Dependency boundaries PASS (`762` modules / `2,950` dependencies).
- `git diff --check` and `graphify update .` PASS.
- The canonical potential matrix covers `1,170` observations across all
  `234/234` expected cells with five deterministic streams per cell. Coverage
  and projection ordering pass.

### Blocker

`public_projection_non_widening_age` fails with `6` violations from `1,170`
observations. All six are age-22, large-room cases across goalkeeper/outfield
and low/typical/high participation. Representative public ranges are
`1.5 -> 2.0 -> 6.0` for goalkeepers and `1.5 -> 1.5 -> 6.0` for outfield
players.

The versioned age factors currently decrease with age. Since the lower
projection is derived as current ability plus a fraction of the room while the
upper projection remains the stored ceiling, this moves the lower estimate
toward current ability and widens the visible range at the age transition.
That contradicts the binding product rule that uncertainty normally narrows
with age.

Step 07 forbids projection/gameplay tuning and does not list the versioned
rating asset or projection owner among its expected files. The owner was
therefore reopened and corrected before this step resumed. Step 08 and the
`50 x 20` remain unstarted until every resumed gate passes.

## Resumed Completion - 2026-07-29

- The complete matrix retains `1,170/1,170` observations and all `234/234`
  cells. Projection ordering, non-widening age, coverage, and stored-ceiling
  integrity pass with zero structural violations.
- Outcomes above the public P90 are measured against numeric role ability, not
  rounded stars: `65/1,170` (`5.56%`) exceed the public upper and none exceed
  the stored ceiling.
- Six older role-family/age bands remain below the predeclared `5%` lower
  tolerance because their deterministic outcomes contain large point masses at
  zero or minimal growth. They remain explicit `WARN` evidence with counts and
  examples; no threshold, seed, policy factor, or gameplay coefficient was
  changed after observing them.
- Stored-ceiling-six rarity remains exactly `302` on the same `100` seeds,
  while public-upper-six is reported separately as `151`.
- Required suite passed (`6` files / `45` tests); simulation-tools and CLI
  typechecks, dependency-cruiser (`762` modules / `2,950` dependencies),
  `git diff --check`, and Graphify passed.
