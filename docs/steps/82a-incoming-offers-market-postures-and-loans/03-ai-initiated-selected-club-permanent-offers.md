# Step 03 - AI-Initiated Selected-Club Permanent Offers

## Status

Not started.

## Goal

Allow AI clubs to submit credible unsolicited or listing-driven permanent
offers for selected-club players through the canonical transfer-negotiation
state.

## Accepted Semantics

- AI uses the Phase 81B public probability assessment, need, budget, contract,
  posture, and risk
  appetite; stored ceiling is forbidden.
- At most five unresolved incoming permanent/loan offers combined.
- At most one unresolved negotiation per `(buying club, player)` pair.
- Different buyers are valid in domain state, but the Phase 82A scheduler does
  not create a second concurrent negotiation for the same player.
- Same buyer/player cannot rebid after rejection in the same window.
- Different buyers may compete in sequence.
- Offers occur only inside canonical windows and must be affordable.

## What To Implement

- Remove/replace selected-club target protection only for the new incoming
  offer path.
- Add deterministic candidate ranking and offer construction.
- Make `In vendita` a strong bounded weight/willingness signal.
- Add combined unresolved-offer capacity and buyer/player/window cooldown.
- Preserve buyer/player-pair uniqueness. Add only the Phase 82A scheduler guard
  that defers a second buyer until the existing same-player negotiation closes;
  do not encode that temporary restriction in domain validation.
- Reuse canonical money, window, negotiation clock, affordability, and atomic
  completion owners.
- Emit structured lifecycle facts for later Posta and diagnostics.
- Prove no live path reads stored ceiling.
- Prove a domain fixture with different buyers for one player remains valid,
  while the Phase 82A scheduler produces zero such concurrent cases.

## What NOT To Implement

- No Posta actions, manager counter command, loan, UI, or new player-contract
  rules; Step 04 owns interaction.
- No offer outside windows or hidden AI information.

## Expected Files

- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/market-pending-exposure.ts`
- `packages/engine/src/career/market-pending-exposure.test.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/json-career-storage.test.ts`
- beta-save deletion/runtime tests identified by Step 01
- `packages/simulation-tools` diagnostic owners named by Step 01
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/market-pending-exposure.test.ts \
  packages/storage/src/json-career-storage.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Listed and credible unlisted selected-club players can receive offers.
- Five-open, per-buyer-pair, scheduler-serialization, cooldown, window, budget,
  and determinism gates pass.
- Alternative buyers compete serially only after the prior state closes.
- AI consumes only public assessment.
- No Posta/UI/loan behavior is implemented early.
- Step 04 is the only next action.
