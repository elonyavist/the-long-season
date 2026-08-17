# Step 04 - Canonical Probability Forecast And Market Consumers

## Status

Blocked behind Checkpoint A GO.

## Goal

Replace mutable-room P50/upper projection with one absolute probability
forecast and migrate every AI/market/contract consumer without hidden truth.

## What To Implement

- Run Graphify affected for `derivePlayerPotentialProjection`,
  `derivePublicPlayerAssessment` and `derivePlayerValuation`.
- Replace old projection policy schema with the Step 00 probability policy.
- Derive absolute outcome probabilities from current ability, age, role/family,
  latent trajectory and public uncertainty policy inside the narrow forecast
  owner. Only this Module may inspect latent truth.
- Use integer basis points; sum exactly `10_000` with deterministic residual
  assignment and stable band order.
- Derive half-star projected/optimistic summaries from the vector through one
  function/table.
- Preserve current public rating.
- Remove `storedCeilingAbility/Rating` and old P50/upper factor fields after
  diagnostic migration.
- Keep `PublicPlayerAssessment` free of hidden data.
- Migrate valuation, willingness, transfer feasibility, contract demand,
  preliminary agreements, free agents, youth lifecycle/promotion and AI team
  selection to the new public Interface.
- Define consumer semantics explicitly:
  - value uses expected absolute outcome plus uncertainty/risk;
  - wage demand uses expected career value, not hidden prime;
  - willingness and feasibility use public facts;
  - team selection remains mostly current ability/condition, not future stars.
- Prove same player/date produces byte-equivalent public assessment across web,
  CLI, AI and market adapters.
- Delete old policy keys, schemas, fixtures and exports in the same step.

## What NOT To Implement

- No development/aging behavior.
- No AI recruitment-intent change.
- No scouting/fog/observer variance.
- No persisted forecast.
- No parallel compatibility assessment.

## Expected Files

- `packages/engine/src/squad/player-potential-projection.ts` and test
- `packages/engine/src/squad/public-player-assessment.ts` and test
- `packages/engine/src/squad/index.ts`
- `packages/engine/src/index.ts`
- `packages/domain/src/balance/player-economy-calibration.ts` and test
- `packages/content/src/balance/player-economy-calibration.ts` and test
- `packages/content/src/schemas/player-economy-calibration.schema.ts` and test
- the selected versioned content asset if its schema changes
- `packages/engine/src/market/player-valuation.ts` and test
- `packages/engine/src/market/transfer-feasibility.ts` and test
- `packages/engine/src/career/ai-contract-lifecycle.ts` and test
- `packages/engine/src/career/ai-market-lifecycle.ts` and test
- `packages/engine/src/career/apply-career-free-agent-signing.ts` and test
- `packages/engine/src/career/apply-career-transfer.ts` and test
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/career/contract-negotiation.ts` and test
- `packages/engine/src/career/preliminary-agreement.ts` and test
- `packages/engine/src/career/selected-club-market-workflow.ts` and test
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/transfer-negotiation.ts` and test
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/youth-lifecycle.ts` and test
- `packages/engine/src/career/youth-promotion.ts` and test
- `packages/engine/src/use-cases/simulate-season.ts` and focused test
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career/roster-output.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/web/src/features/market/career-market-adapter.ts` and test
- `apps/web/src/features/squad/career-squad-adapter.ts` and test
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts` and
  focused test
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only when the pre-edit Graphify
  census changes this ownership list
- this step, Step 05 if final Interface changes it, `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine test
pnpm --filter @game/content test
pnpm depcruise
pnpm check:localized-text
pnpm check
git diff --check
graphify update .
```

Focused proof includes probability conservation, class reachability on real
generated players, adjacent overlap, ordered elite probability, public parity,
and mutation tests for hidden-field leakage.

## Definition Of Done

- One public probability forecast exists.
- All public consumers use it; none reads latent trajectory.
- Old P50/upper room-scaling config/code has no active caller or residue.
- Step 05 is the only next action.
