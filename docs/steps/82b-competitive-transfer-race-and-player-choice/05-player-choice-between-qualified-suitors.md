# Step 05 - Player Choice Between Qualified Suitors

## Status

Not started.

## Goal

When more than one club clears the club stage, let the player compare their
offers simultaneously and choose, instead of answering each offer in isolation.

## The Behaviour Being Corrected

`advanceTransferPlayerNegotiations` evaluates each contract offer independently.
Two clubs that both reach club agreement are therefore resolved by clock order,
and the second completion fails on `stale_ownership`. The result is
first-to-resolve, not player choice.

## Expected Files

- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/transfer-player-negotiation.test.ts`
- `packages/engine/src/career/player-transfer-race.ts`
- `packages/engine/src/career/player-transfer-race.test.ts`
- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/player-willingness.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/index.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/ui/src/career/career-market-view.ts`
- `packages/ui/src/career/career-market-view.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `docs/steps/82b-competitive-transfer-race-and-player-choice/05-player-choice-between-qualified-suitors.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Collect only the Step 03 qualified negotiation IDs and compare them at the
  shared player-stage deadline through `rankPlayerSuitors` and the versioned
  weights.
- Assert that every compared permanent suitor either holds the highest
  seller-acceptable fee or exactly matches it; a lower accepted offer must
  already be terminal `outbid`.
- Reuse `derivePlayerWillingness` and `evaluateContractOffer` for per-offer
  scoring. This step adds comparison and timing, not a new preference model.
- Compare wage, contract length, promised squad status, and club standing.
- Exactly one accepted suitor wins; every other qualified negotiation closes
  atomically as `lost_to_rival` in the same transition.
- Emit, with each `lost_to_rival` closure, a structured reason drawn from the
  same facts the comparison used: the dimensions on which the winner was
  preferred, ordered by how much they mattered. Losing a player you outbid is
  realistic and is the most frustrating outcome in the phase; without a reason
  it reads as arbitrary, and a manager who cannot see why he lost cannot play
  better next time. The reason is football vocabulary - wage, contract length,
  squad status offered, club standing - never a score or a weight.
- The reason must be derived inside the comparison, not reconstructed
  afterwards. A narrative assembled after the fact can disagree with the actual
  decision, and that is worse than no explanation: it teaches the manager a rule
  the game does not follow.
- Do not disclose rival contract terms through the reason. Naming the dimension
  that decided it is permitted; quoting the rival's wage is not.
- Add `lost_to_rival` to the negotiation union and let the Step 01 guards force
  every required consumer to handle it. The additional Expected Files above
  may change only to add the exhaustive `lost_to_rival` case and its focused
  regression evidence; they do not authorize unrelated behaviour.
- In the legacy Phase 79D negotiation-spread projection, classify
  `lost_to_rival` as a race-only exclusion before the narrowed seller/counter
  mapper. It belongs to the dedicated race diagnostic and must never inflate a
  legacy accepted-seller count.
- A player may still reject every suitor; that closes the race without an
  atomic transfer and without silently falling back to a runner-up.
- A contract counter never resets the shared player-stage clock.
- The winner alone reaches the existing atomic completion boundary.
- Preserve determinism: same facts, same date, same policy produce the same
  winner, with a stable final tie-break.
- Evaluate only a player stage that existed before the current advancement
  transition; do not consume a same-day stage in its creation pass.

## What NOT To Implement

- No new preference model, agent, or playing-time contract.
- No change to the atomic completion boundary.
- No free-agent path; Step 06 owns it.
- No UI.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/transfer-player-negotiation.test.ts \
  packages/engine/src/career/player-transfer-race.test.ts \
  packages/engine/src/market/player-willingness.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/ui/src/career/career-market-view.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Only club-stage-qualified suitors are compared simultaneously, and exactly
  one wins when at least one is acceptable to the player.
- A permanent-transfer comparison cannot contain a lower accepted fee that
  failed the highest-fee qualification rule.
- Losers close as `lost_to_rival`; no loser reaches completion and fails on
  `stale_ownership`.
- Every `lost_to_rival` closure carries a structured reason produced by the
  comparison itself, expressed in football terms and naming the dimensions that
  decided it without disclosing rival contract terms. A test asserts the reason
  agrees with the decision on a case where the loser offered the higher fee.
- Every Step 01 status boundary handles `lost_to_rival` explicitly, and the
  legacy Phase 79D spread collector excludes it before its narrowed total
  mapper.
- Rejecting every suitor remains a valid, tested terminal outcome with no
  automatic runner-up retry.
- The choice is deterministic with a stable tie-break.
