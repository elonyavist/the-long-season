# Step 07 - AI Recruitment Intents And Role Succession

## Status

Blocked behind Checkpoint B GO.

## Goal

Give AI clubs one contextual recruitment policy that can buy ready upgrades,
medium backups and future successors using only public facts.

## What To Implement

- Graphify affected for `deriveAiMarketNeeds`, target score, lifecycle advance,
  market config and canonical transfer commands.
- Add exhaustive `AiRecruitmentIntent` to every actionable need.
- Derive intent from:
  - exact role/department depth;
  - incumbent current ability and public decline horizon;
  - existing successor public distribution/readiness;
  - injuries/contracts;
  - club competitive tier/objective and finances.
- Context rules:
  - title/promotion or clear role weakness may favor immediate upgrade;
  - structural shortage/injuries favor depth;
  - aging incumbent without plausible internal replacement favors succession;
  - low budget chooses best feasible compromise, not forced youth.
- Score candidates through total intent-specific weights:
  - upgrade emphasizes current ability/fit;
  - depth emphasizes useful current floor, reliability/price;
  - succession emphasizes public probability and timing.
- Feed owned-market players and free agents into that same scoring Interface.
  Availability channel may affect fee, contract and transaction command, but
  must not introduce a second need model or free-agent-only player ranking.
- Execute an AI free-agent signing only through the canonical career command.
  The policy must re-check exact role need, squad floor/ceiling, affordability,
  public assessment and deterministic tie-breakers at execution time.
- Record one terminal transition per unique free-agent candidate/club need.
  Repeated monthly evaluations are diagnostic events, never extra signings or
  extra denominator rows.
- Preserve canonical seller willingness, affordability, negotiation clocks,
  contracts, squad floors and selected-club protection.
- Emit one non-derivable intent fact through existing lifecycle diagnostics so
  a completed purchase can be attributed. Do not retain the whole candidate
  ranking.
- If a successor is sold, the next cycle re-derives the need from current state.
- Remove analysis-only Phase 81A market switches/oracles when their named
  removal owner is satisfied. Do not turn them into product flags.
- Prove intent reachability on real clubs and that a medium-quality depth
  purchase can outrank a young prospect or star for a depth need.

## What NOT To Implement

- No loans or transfer races.
- No season-boundary contract rewrite or free-agent negotiation lifecycle.
  Phase 81C owns the clock and Phase 82B owns competitive negotiation.
- No hidden trajectory access.
- No guaranteed successor purchase.
- No second AI planner or direct ownership mutation.
- No club-specific academy quality.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test
- `packages/engine/src/career/free-agent-pool.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts` and test
- `packages/engine/src/career/apply-career-transfer.ts` and test
- `packages/engine/src/career/career-market-catalog.ts` and test
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/advance-career-month.ts` and test only if intent
  facts require lifecycle forwarding
- `packages/engine/src/career/advance-career-season.ts` and test only if a
  season-boundary non-derivable fact is required
- `packages/engine/src/market/player-valuation.ts` and test
- `packages/engine/src/market/player-willingness.ts` and test
- `packages/engine/src/market/transfer-feasibility.ts` and test
- `packages/engine/src/career/contract-negotiation-demand.ts` and test
- `packages/domain/src/balance/player-economy-calibration.ts` and test
- `packages/content/src/balance/player-economy-calibration.ts` and test
- `packages/content/src/schemas/player-economy-calibration.schema.ts` and test
- `packages/content/src/balance/market-behavior-calibration.json`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- one existing or precisely named intent-attribution evaluator and test beside
  the canonical report files
- exact Phase 81A analysis-switch owners copied here from their removal
  contracts before deletion
- `packages/engine/src/index.ts` and content exports only if final public types
  require them
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only when the pre-edit code
  census changes ownership
- this step and Step 08; `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine test
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

Real-data reachability must find all three intents and terminal outcomes. A
fixture-only `depth` purchase does not close the step.

## Definition Of Done

- Every need has exactly one intent, independent of candidate ownership state.
- AI buys ready, medium-depth and succession candidates contextually.
- A reachable real-world free-agent need completes through the same policy, and
  the pool demonstrates non-zero attributed drain without a parallel planner.
- AI/manager information parity holds.
- No analysis switch/dead ranking payload remains.
- Step 08 is the only next action.
