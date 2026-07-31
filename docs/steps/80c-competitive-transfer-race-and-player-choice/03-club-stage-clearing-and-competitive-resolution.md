# Step 03 - Club-Stage Clearing And Competitive Resolution

## Status

Not started.

## Goal

Make the selling club compare competing offers at the shared club-stage
deadline and produce an explicit qualification set instead of allowing
processing order to choose the transfer.

## The Behaviour Being Corrected

`advanceTransferNegotiations` currently resolves each due negotiation
individually in sorted ID order. `resolveSellerReply` evaluates only that single
offer through seller willingness. It cannot compare rival bids, so a race would
still be decided by processing order rather than by competitive resolution.

## Expected Files

- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/player-transfer-race.ts`
- `packages/engine/src/career/player-transfer-race.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/transfer-player-negotiation.test.ts`
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
- `docs/steps/80c-competitive-transfer-race-and-player-choice/03-club-stage-clearing-and-competitive-resolution.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Resolve due negotiations grouped by race, not one at a time.
- Inside a race the seller waits for the shared club-stage deadline and
  resolves all club offers together through `deriveClubStageResolution(...)`.
- Return named `qualifiedNegotiationIds`, `outbidNegotiationIds`, and rejected
  IDs. Do not encode a single winner before the player stage.
- Mark seller acceptability first, then qualify only the highest acceptable
  transfer fee and every exact match at that amount. Lower acceptable offers
  close as `outbid`; an offer below seller willingness is rejected and cannot
  qualify merely because every offer is poor. A sole acceptable offer
  qualifies.
- For an AI-owned seller, derive qualification from canonical willingness and
  fee facts. For the selected-club seller, consume only explicit
  accept/reject/counter decisions recorded on each negotiation. Accepting marks
  that offer seller-acceptable but never closes the race early. The manager may
  accept more than one offer before the shared deadline; only the highest
  accepted fee and exact matches qualify. Do not let AI decide for the manager.
- Every permanent approach already enters a race through Step 02, including a
  one-participant case. Negotiation kinds explicitly excluded by the Step 01
  product scope retain their Phase 80B lifecycle unchanged.
- Negotiations eliminated on price close as `outbid`; qualified negotiations
  remain open for the player stage.
- Opening the player stage creates exactly one new shared player-stage clock;
  every qualified negotiation uses it and has time to submit contract terms.
- Resolve at most the stage that was open when advancement began. A
  window-capped player stage created with a deadline of today must not be
  resolved or expired in the same transition that created it.
- A highest-price tie produces several qualified clubs. Do not destroy the
  player choice with an arbitrary club-stage tie-break.
- No eliminated negotiation may reach the atomic completion boundary and fail
  on `stale_ownership`.
- Advancement stays idempotent: replaying the same date changes nothing.
- Add `outbid` to the negotiation union and let the Step 01 guards force every
  required consumer to handle it. The additional Expected Files above may
  change only to add the exhaustive `outbid` case and its focused regression
  evidence; they do not authorize unrelated presentation, storage, CLI, or
  diagnostic behaviour.
- In the legacy Phase 79D negotiation-spread projection, classify `outbid` as a
  race-only exclusion before the narrowed seller/counter mapper. Record it in
  the Phase 80C race diagnostics later; never relabel it as a legacy
  `accepted`, `countered`, or `rejected` seller outcome.
- Test, at minimum: no acceptable offer, one acceptable offer, several
  acceptable offers with one highest, an exact highest-fee tie, lower accepted
  manager offers becoming `outbid`, and manager acceptance not resolving
  before the deadline.

## What NOT To Implement

- No raise command, visibility, Posta copy, or AI raise policy; Step 04 owns
  them.
- No player-stage comparison; Step 05 owns it.
- No free-agent path; Step 06 owns it.
- No change to the atomic completion boundary.
- No player-contract scoring or contract-clock reset.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/player-transfer-race.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/transfer-player-negotiation.test.ts \
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

- The club stage returns the accepted qualification set at its shared deadline;
  processing order no longer selects the transfer.
- Only the highest seller-acceptable fee and its exact matches qualify; lower
  acceptable fees are explicitly `outbid`.
- A manager-owned seller may accept several offers, but cannot close the shared
  stage early by accepting one.
- Excluded negotiation kinds are unchanged and covered by retained tests; there
  is no second permanent single-offer resolution path.
- Price losers close as `outbid`; qualified clubs remain available to the
  player stage.
- Every Step 01 status boundary handles `outbid` explicitly, and the legacy
  Phase 79D spread collector excludes it before its narrowed total mapper.
- Exactly one player-stage clock opens for the qualification set.
- Deadline-day compression cannot skip the manager-visible player table.
- No eliminated negotiation produces a `stale_ownership` completion failure.
- Same-seed replay is identical and advancement is idempotent.
