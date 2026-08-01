# Step 07 - National Exceptional Stock And Annual Youth Intake

## Status

Done after the second reopen caused by the canonical Step 09 `20 x 2`
evidence.

The deterministic `phase31-test-world-00002` evidence exposed one real stock
inflation path: opening/season-one stock stayed at `5 / target 5`, but the
second rollover generated one new ceiling-six intake while all five incumbent
age-15-to-20 players remained active, closing at `6 / target 5`. The corrected
selector now represents an unresolved promotion candidate as an explicit
club-associated `promotion_candidate` stock source before allocation. The
same player therefore reserves the slot until promotion resolves later in the
rollover; thresholds, seeds, and the immutable world target were not changed.

The canonical cohort then found that the placement and club-uniqueness gates
were measuring current registration after ordinary transfers, not allocation
at stock entry. All six counted violations came from market moves after valid
generation. This step must keep current placement visible as descriptive
evidence while making the binding generation gates evaluate opening allocation
and newly arriving stock only. It must not block realistic transfers or add
live stored-ceiling access to market decisions.

## Goal

Maintain credible exceptional-player stock and sustainable annual youth supply
without multiplying ceiling-six prospects per club, division, or intake.

## Accepted Semantics

- National stock: `2..3` established current-six players in credible
  first-team slots at strong Serie A clubs.
- Active age-15-to-20 stored-ceiling-six stock: `4..5`.
- The young count includes senior, academy, reserved promotion-candidate,
  free-agent, and loaned players. A promotion reservation carries a club
  association for allocation only; it is not senior ownership or academy
  registration.
- Opening allocation and each new stock arrival may leave at most one young
  ceiling-six player outside Serie A and may not introduce more than one at a
  club. Later transfers or annual tier changes are market/world facts, not
  generation violations; their current concentration remains observable.
- Annual intake tops up vacancies; it does not create four or five new
  ceiling-six players each season.
- A rollover with multiple simultaneous vacancies may allocate more than one
  replacement. The active `4..5` target and real eligible academy slots are
  the only annual bounds; no legacy one-player-per-season cap may leave the
  completed rollover below the deterministic target.
- Each complete stock snapshot carries that world's deterministic target. A
  target-five world closing at four is a failed replacement, not a valid use
  of the global `4..5` interval. The selected target is immutable across every
  snapshot of that world.
- The superseded fixed year-ten total-six cap is removed. Older ceiling-six
  players may remain active while the young `15..20` stock is replenished;
  year-ten totals remain descriptive evidence, while adjacent-season stock
  transitions own the no-inflation gate. A shorter run reports year-ten stock
  as unavailable instead of substituting its earlier closing checkpoint.
- No existing player is deleted/downgraded to meet the target.
- Academy age-out and annual stock reconciliation use the same incoming-season
  date; an outgoing calendar date must never hide a real refill slot.
- The frozen `3.5+` category bands are cohort-level calibration gates. Each
  world contributes an additive numerator and denominator, while the bounded
  cohort applies the band once; a zero cohort denominator never passes.
- Vacancy replacement is evaluated over every adjacent-season transition. A
  transition with no vacancy is a valid pass; the bounded evidence set must
  separately contain a positive real vacancy and completed replacement.
- Future five-country composition invokes this policy once per country.

## What To Implement

- Centralize one national exceptional-stock allocator across initial senior and
  academy generation.
- Reconcile the annual stock before per-club intake generation and allocate
  only eligible top-up slots.
- Make environment a bounded probability input for interesting/serious
  prospects while exceptional ceilings remain world-budgeted.
- Remove the superseded division-level elite budget fields and CLI row; the
  `rare_prodigy` archetype remains available only to the national allocator.
- Preserve exact academy size/refill, age-out, promotion, external movement,
  release, and retirement facts.
- Add explicit JSDoc at the national composition root describing future
  country reuse and forbidding multiplication by five inside the current
  one-country world.
- Add diagnostics/tests for full active-stock counting, stock-arrival
  placement, stock-arrival club uniqueness, current-placement drift,
  multi-season replacement, and no inflation.
- Feed complete opening and post-rollover stock snapshots from the canonical
  report composition root. Synthetic-only observations do not satisfy this
  step.
- Bump the resumable gate checkpoint schema to `3` and reject versions `1` and
  `2`; their serialized gate results use the superseded snapshot-wide
  placement semantics and cannot be resumed safely.

## What NOT To Implement

- No five-country runtime, youth league UI, facilities, staff, or guaranteed
  intake star.
- No routine rare prodigy outside the national allocation.
- No value/AI change and no `50 x 20`.

## Expected Files

- `packages/shared/src/date-utils.ts`
- `packages/shared/src/date-utils.test.ts`
- `packages/shared/src/index.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/generators/domestic-world.ts`
- `packages/content/src/generators/domestic-world.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/generators/player-potential-rarity.ts`
- `packages/content/src/generators/player-potential-rarity.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/youth-development-level.ts`
- `packages/content/src/generators/youth-development-level.test.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-intake.test.ts`
- `packages/engine/src/career/active-player-stock.ts`
- `packages/engine/src/career/active-player-stock.test.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/player-state/completed-player-age.ts`
- `packages/engine/src/player-state/completed-player-age.test.ts`
- `packages/engine/src/squad/player-potential-projection.test.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-checkpoint.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_DESIGN_CONTRACT.md`
- `docs/audits/PLAYER_ROLE_AND_ABILITY_GENERATION_SPEC.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/shared/src/date-utils.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/content/src/generators/domestic-world.test.ts \
  packages/content/src/generators/player-generation-quality.test.ts \
  packages/content/src/generators/player-potential-rarity.test.ts \
  packages/content/src/generators/player-rarity-budget.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/career-intake-players.test.ts \
  packages/content/src/generators/youth-development-level.test.ts \
  packages/engine/src/career/active-player-stock.test.ts \
  packages/engine/src/career/youth-intake.test.ts \
  packages/engine/src/career/youth-lifecycle.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/engine/src/player-state/completed-player-age.test.ts \
  packages/engine/src/squad/player-potential-projection.test.ts \
  packages/engine/src/squad/public-player-assessment.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  apps/cli/src/commands/simulate-season.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/shared run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/cli run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Initial and annual supply share one national stock owner.
- Young six-ceiling stock, category placement, and per-club uniqueness pass
  with positive observations.
- `3.5+` category bands remain plausible without fixed annual sameness.
- Academy refill sustains the population without world inflation.
- Step 08 is active for valuation-v4 re-verification; Step 09 remains paused.

## Completion Record

- Second-reopen resolution: binding placement and club-uniqueness diagnostics
  now measure opening allocation plus newly arriving stock, while later
  transfers and tier drift remain descriptive. The active-stock selector,
  immutable target, generation policy, seeds, and thresholds did not change.
- Checkpoint schema `3` rejects schemas `1` and `2`, malformed gate payloads,
  and intermediate v3 shards without the current stock-arrival keys. Cohort
  aggregation also rejects duplicate or unequal gate-key sets across worlds,
  so stale shards cannot silently contribute partial denominators.
- Second-reopen verification on Node `24.16.0`: mandatory Vitest `279/279`
  across `23` files; all seven package typechecks; focused ESLint;
  `git diff --check`; `graphify update .`; and an independent read-only review
  with no residual blocker. No canonical cohort and no `50 x 20` ran.

- Reopen resolution: `promotion_candidate` is now a first-class active-stock
  source with an explicit club association, distinct from both academy
  membership and senior ownership. Engine, content, CLI, and diagnostics use
  exhaustive mappings, so a future lifecycle or loan source requires an
  explicit policy decision instead of silently inheriting a fallback.
- A deterministic regression moves one real stored-ceiling-six academy player
  into the age-out-to-promotion interval and proves `active == target`, zero
  vacancy, zero allocation, and zero generated replacement. The bounded `2 x
  2` diagnostic now reports all five stock gates at zero violations, including
  positive vacancy evidence `1 / minimum 1`.
- Reopen verification on Node `24.16.0`: the full invocation passed `272`
  unaffected cases and exposed only the invalid small-sample exit-code
  expectation; the corrected case then passed in isolation, so all `273`
  cases have green evidence. All seven package typechecks, `git diff --check`,
  and `graphify update .` pass. No threshold, seed, canonical `20 x 2`, or
  deferred `50 x 20` changed or ran.

- Initial senior, academy, free-agent, and loan-aware observations now pass
  through one canonical active-stock selector with explicit source identity,
  duplicate-association rejection, and stable game-player ordering.
- One national allocator owns the deterministic `4` or `5` young
  stored-ceiling-six target, the `2..3` established current-six stock,
  first-division placement, one-per-club ownership, and multi-vacancy annual
  refill. The selected young target is immutable for the life of the world.
- Opening and post-rollover diagnostics use exact civil dates and adjacent
  season snapshots. Category shares aggregate additive cohort evidence, real
  replacement requires positive bounded evidence, and shorter runs report
  year-ten stock as unavailable instead of relabelling an earlier checkpoint.
- The obsolete fixed year-ten total-six cap and its rating-inflation gate were
  removed. Year-ten totals remain descriptive while active young-stock
  transitions own replacement and no-inflation truth.
- Verification on Node `24.16.0`: mandatory Vitest `264/264` across `23` files;
  domain, shared, content, engine, simulation-tools, i18n, and CLI typechecks;
  `git diff --check`; and `graphify update .` all pass. No `50 x 20` ran.
