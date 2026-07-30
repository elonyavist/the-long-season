# Step 12 - Source-Backed Wage And Contract Calibration

## Status

Done.

## Goal

Calibrate generated wages, supported bonuses, renewal/free-agent demands,
annual wage budgets, and contract capacity from the independent Step 01 source
without deriving wages from public value.

## Expected Files

- `packages/content/src/balance/wage-finance-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/generators/senior-squad-world.ts`
- `packages/content/src/generators/senior-squad-world.test.ts`
- `packages/content/src/generators/club-finance-world.ts`
- `packages/content/src/generators/club-finance-world.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/career/contract-negotiation-demand.ts`
- `packages/engine/src/career/contract-negotiation-demand.test.ts`
- `packages/engine/src/career/career-contract-capacity.ts`
- `packages/engine/src/career/career-contract-capacity.test.ts`
- `packages/engine/src/career/selected-club-contract-workflow.ts`
- `packages/engine/src/career/contract-negotiation.ts`
- `packages/engine/src/career/contract-negotiation.test.ts`
- `packages/engine/src/career/preliminary-agreement.ts`
- `packages/engine/src/career/preliminary-agreement.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.test.ts`
- `packages/engine/src/career/apply-career-transfer.ts`
- `packages/engine/src/career/apply-career-transfer.test.ts`
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/youth-promotion.ts`
- `packages/engine/src/career/youth-promotion.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/ai-contract-lifecycle.ts`
- `packages/engine/src/career/ai-contract-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/career-finance-lifecycle.ts`
- `packages/engine/src/career/career-finance-lifecycle.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/web/src/app/use-career-screen-presentations.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.test.tsx`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `packages/ui/src/career/career-player-profile-view.ts`
- `packages/ui/src/career/career-player-profile-view.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/12-source-backed-wage-and-contract-calibration.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Refuse numeric implementation if the independent wage/finance source audit is
  missing or unresolved.
- Require validated wage policy as explicit input to engine contract-demand,
  renewal, AI contract, monthly lifecycle, and capacity paths.
- Propagate that required input through preliminary agreements, player-side
  transfer negotiation, permanent/free-agent completion, AI squad
  replenishment, and youth promotion. No capacity or demand caller may retain
  an implicit wage default.
- Keep all bands/coefficients in `wage-finance-calibration.json`; no engine
  default or fixed market-value ratio.
- Calibrate annual wages and supported bonuses by tier, age, global quality,
  squad status, and contract context only where supported by the audit.
- Calibrate opening annual wage budgets/headroom with the same source contract
  so generated squads start solvent.
- Do not change opening cash or transfer budgets in this step.
- Preserve annual-money semantics, integer minor units, and exact affordability
  arithmetic.
- Recompute renewal/free-agent demands and contract capacity from one wage
  policy.
- Keep utilization above `1.0` a hard structural failure; distinguish pressure,
  exact contact, and headroom diagnostics from overspend.
- Preserve expiration, preliminary agreement, signing bonus, squad floors,
  goalkeeper coverage, and selected-club approval.
- Propagate the exact stamped wage-policy version through CLI/web composition
  without engine/simulation-tools importing content.
- Add per-tier wage median/P90/P99, bonuses, committed wages, utilization, and
  headroom diagnostics.
- Use fixed fixtures and single-world samples only.

## What NOT To Implement

- No wage inferred from value, invented target, or decorative number.
- No opening cash/transfer-budget retuning, seller behavior, willingness,
  transfer affordability, or market AI change.
- No Phase 80 finance UI, revenue, tickets, sponsors, stadium, facilities,
  bankruptcy, or board budget negotiation.
- No selected-club automation or multi-world run.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/content/src/generators/senior-squad-world.test.ts \
  packages/content/src/generators/club-finance-world.test.ts \
  packages/content/src/generators/career-intake-players.test.ts \
  packages/engine/src/career/contract-negotiation-demand.test.ts \
  packages/engine/src/career/career-contract-capacity.test.ts \
  packages/engine/src/career/contract-negotiation.test.ts \
  packages/engine/src/career/preliminary-agreement.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/apply-career-free-agent-signing.test.ts \
  packages/engine/src/career/apply-career-transfer.test.ts \
  packages/engine/src/career/youth-promotion.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/ai-contract-lifecycle.test.ts \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/career-finance-lifecycle.test.ts \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  packages/ui/src/career/career-player-profile-view.test.ts \
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

- Generated wage/bonus distributions and wage budgets are traceable to the
  independent versioned source.
- Contract demand, renewal, free-agent, and capacity paths use one explicit
  policy.
- Every generated club starts at or below the hard annual wage ceiling.
- Wage pressure remains possible and visible without structural overspend.
- Opening cash, transfer budgets, willingness, and market AI remain unchanged.

## Outcome

- Added one schema-validated wage/contract policy selected from the exact
  career-stamped rating and wage versions. Annual base wage is derived from
  global role quality, division, squad status, age, potential gap, and contract
  context without accepting public market value as an input.
- Generated contracts, renewals, free-agent demands, preliminary agreements,
  transfer player terms, AI lifecycle, squad replenishment, youth promotion,
  monthly progression, and final affordability now receive the same required
  policy explicitly.
- Opening annual wage budgets use the independently sourced First/Second/Third
  targets and deterministic `70%..95%` utilization. Every generated club begins
  solvent; production opening cash and transfer-budget formulas were not
  retuned.
- Single-world diagnostics now retain per-division wage P50/P90/P99, supported
  bonus medians, committed-wage P50/P90/P99, utilization P50/P90/P99, and
  headroom P10/P50 without inflating future large-run retention.
- Repaired the CLI market-demo fixture so extra demo liquidity is represented
  by an idempotent opening-capital ledger fact instead of an account-only
  mutation.

## Verification

- Required focused suite passed: `22` files / `193` tests.
- i18n passed (`19/19`) and the complete web suite passed (`327/327`).
- Content, engine, simulation-tools, CLI, and web typechecks passed.
- Dependency-cruiser passed (`750` modules / `2,881` dependencies);
  `git diff --check` and `graphify update .` passed.
- No multi-world or long-run cohort was executed.

## Step 14 Gate Remediation

Step 14 reopened this owner step when the bounded cohort reproduced one
second-division club-season at 17 players. The club had sufficient cash,
transfer room, and wage headroom; the actual blocker was an exhausted
free-agent pool after canonical exits.

The adopted correction keeps normal market behavior unchanged:

- every requested club reaches the hard 18-player and zero-department floor
  before any club consumes shared free agents for optional depth;
- hard repairs rank candidates by exact minimum wage/signing-bonus demand so an
  early club does not consume the budget or pool with avoidably costly depth;
- a lazy adapter reserve materializes only the smallest validated number of
  unattached players required when the existing pool cannot cover the hard
  floor;
- unused generated candidates never enter the durable world;
- every accepted reserve still passes canonical contract, registration,
  finance, wage-budget, and tier-maximum validation;
- replenishment emits bounded season-scoped signing facts so long-run
  diagnostics measure free-agent activity without inventing persisted transfer
  history.

Focused replenishment/season/report checks pass, including regressions for
shared-pool fairness, a completely exhausted pool, preservation of every broad
department, and whole-floor wage affordability. The final Phase 79C `10 x 10`
records minimum squad `18`, no missing goalkeeper, zero contract/finance
structural violation, `3,882` measured free-agent signings, and zero non-zero
free-agent fee.
