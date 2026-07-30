# Step 13 - Transfer Budgets, Affordability, Willingness And Market AI Calibration

## Status

Done.

## Goal

Complete the coupled economy by calibrating opening cash/transfer budgets,
asking behavior, affordability, sporting willingness coefficients, and AI
targeting against the value/wage model.

## Expected Files

- `packages/content/src/balance/player-market-calibration.json`
- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/wage-finance-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/generators/club-finance-world.ts`
- `packages/content/src/generators/club-finance-world.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/player-willingness.test.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/market/seller-asking-price.ts`
- `packages/engine/src/market/seller-asking-price.test.ts`
- `packages/engine/src/career/preliminary-agreement.ts`
- `packages/engine/src/career/preliminary-agreement.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/apply-career-transfer.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/career-finance-lifecycle.ts`
- `packages/engine/src/career/career-finance-lifecycle.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/simulate-season/market-demo-output.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/13-transfer-budgets-affordability-willingness-and-market-ai-calibration.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Use only Step 01 source-backed finance fields and explicit game-design
  affordability/willingness targets.
- Calibrate opening cash and transfer budgets by tier without changing the
  Step 12 wage-policy truth.
- Keep transfer budget, liquid cash, annual wage headroom, signing bonus, and
  pending exposure as distinct constraints.
- Require the exact versioned asking/wage/valuation/market-behavior configs
  throughout selected and AI workflows; no internal defaults.
- Keep observed market anchors in `player-market-calibration.json` and all
  willingness, affordability, and AI-selection coefficients in
  `market-behavior-calibration.json`; do not mix source facts with game-design
  tuning.
- Propagate the market-behavior policy through transfer feasibility,
  preliminary agreements, player-side transfer negotiation, selected-club
  completion, focused CLI market output, and AI targeting.
- Tune player willingness with source/destination tier, reputation, expected
  status, contract, age/quality, and explicit career facts.
- Ensure elite first-tier players are visible but normally unaffordable and
  unwilling for ordinary third-tier clubs.
- Tune seller asking/acceptance, buyer affordability, and AI target selection
  together without changing public value.
- Ensure AI never completes an unfunded transfer and does not repeatedly target
  implausible cross-tier moves.
- Preserve free agents as an important lower-tier route without making every
  club ignore permanent transfers.
- Preserve windows, clocks, preliminary agreements, squad floors, goalkeeper
  coverage, and atomic completion.
- Add per-tier/cross-tier diagnostics for budgets, pending exposure, attempts,
  completions, value/asking/fee, free agents, and rejection reasons.
- Evaluate quiet clubs/seasons as possible healthy stories before changing a
  threshold; do not force deals.
- Use fixed worlds and a small fixture cohort only; Step 14 owns `10 x 10`.

## What NOT To Implement

- No forced transfer quota, guaranteed deal, silent deletion, warning
  suppression, or selected-club automation.
- No public-value retune unless Step 10 evidence is demonstrably invalid; such
  a change must be recorded in the active step/status first.
- No Phase 80 finance screen or expanded revenue/crisis systems.
- No full multi-world long run.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/content/src/generators/club-finance-world.test.ts \
  packages/engine/src/market/player-willingness.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/market/seller-asking-price.test.ts \
  packages/engine/src/career/preliminary-agreement.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/apply-career-transfer.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/career-finance-lifecycle.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/i18n run test
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

- Opening cash/transfer budgets form credible, different tier distributions.
- Wage and transfer affordability cannot be confused or exceeded.
- Permanent and free-agent recruitment both remain useful.
- Cross-tier selected/AI activity is deterministic, funded, willing, and
  football-credible.
- Every willingness/affordability/AI coefficient is loaded from the stamped
  market-behavior calibration version; no engine hardcode or source-snapshot
  contamination remains.
- No quota, forced outcome, public-value distortion, or Phase 80 feature exists.

## Outcome

- Added one exact version-selected market-behavior policy for three-tier
  opening cash/transfer distributions, seller acceptance, player willingness,
  acquisition affordability, and AI need/target lifecycle coefficients.
- Generated clubs now open with distinct First/Second/Third cash and transfer
  distributions. Transfer room, cash reserve, annual-wage headroom, signing
  bonus, and pending exposure remain independent constraints.
- Selected-club, preliminary-agreement, transfer-player, free-agent, and AI
  acquisition paths receive the stamped policy explicitly. A move can complete
  only when its exact agreed fee, reserved cash, and annual wage fit; no
  internal production default or implicit content import remains.
- Sporting willingness now accounts for tier movement, reputation, expected
  status, wage, contract security, age, and role quality. Strong first-tier
  players remain inspectable but ordinarily reject and exceed the capacity of
  ordinary third-tier clubs, while credible same-tier and upward moves remain
  possible.
- AI need discovery, target scoring, talk limits, checkpoints, affordability,
  and lifecycle thresholds are configured together. Permanent transfers and
  free-agent recruitment remain separate useful routes without a deal quota.
- Long-run rows now expose per-tier cash, available transfer room, separate
  pending cash/wage exposure, permanent attempts/completions, free-agent
  signings, and cross-tier value/asking/fee/rejection diagnostics.

## Verification

- Required focused suite passed: `17` files / `158` tests.
- i18n passed (`19/19`) and the complete web suite passed (`327/327`).
- Content, engine, simulation-tools, CLI, and web typechecks passed.
- Dependency-cruiser passed (`751` modules / `2,901` dependencies);
  `git diff --check` and `graphify update .` passed.
- No multi-world or long-run cohort was executed; Step 14 retains sole
  ownership of the bounded `10 x 10`.

## Step 14 Gate Remediation

Step 14 reopened this owner step after the first bounded cohort found one
lower-division potential-six player still outside the accepted year-ten
location cap.

The adopted correction uses only existing versioned policy:

- a potential-six player rejects an implausible permanent downward move through
  the same rating-scale and tier facts as ordinary willingness;
- lower-tier potential-six players create a rare recruitment opportunity before
  ordinary department needs;
- credible first-division buyers are ordered by current role-aware squad
  strength and then reputation, so the strongest established destination sees
  the opportunity first;
- no transfer quota, identity exception, forced completion, or cap relaxation
  was added.

Focused willingness and AI lifecycle tests pass. The final Phase 79C `10 x 10`
has zero rating-cap violation worlds, maximum year-ten current-six stock `2`,
potential-six stock `4`, and lower-tier potential-six stock `1`.
