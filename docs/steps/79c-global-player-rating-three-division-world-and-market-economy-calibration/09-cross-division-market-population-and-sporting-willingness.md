# Step 09 - Cross-Division Market Population And Sporting Willingness

## Status

Done.

## Goal

Make the existing Market inspect/filter the canonical fictional 54-club world
and make player availability reflect sporting level without a synthetic pool
or new value formula.

## Expected Files

- `packages/engine/src/career/career-market-catalog.ts`
- `packages/engine/src/career/career-market-catalog.test.ts`
- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/player-willingness.test.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/career/preliminary-agreement.ts`
- `packages/engine/src/career/preliminary-agreement.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/index.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/career/career-market-view.ts`
- `packages/ui/src/career/career-market-view.test.ts`
- `packages/ui/src/index.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/components.css`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/09-cross-division-market-population-and-sporting-willingness.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Derive targets from canonical active players owned by fictional in-world clubs
  plus the canonical free-agent pool.
- Exclude selected-club players from external-target rows while preserving their
  renewal route.
- Prove every target ID belongs to persisted career state and appears once.
- Carry source competition/tier, club, employment, contract horizon, global
  current/potential stars, and exact-current-detail availability through one
  read-model boundary.
- Add localized tier filtering/grouping suitable for the larger population.
- Keep list rows lightweight and resolve statistics/attributes lazily under the
  Phase 79B contract.
- Extend structural willingness inputs with current/destination tier, expected
  squad status, contract terms, and supported club reputation.
- Propagate those structural inputs through transfer feasibility, preliminary
  agreements, player-side transfer negotiation, selected-club workflow, and AI
  targeting; no caller may silently fall back to the old fact set.
- Make a first-tier six-star player generally unwilling to join an ordinary
  third-tier club; exceptions must arise from explicit supported facts, never a
  player ID.
- Keep inspection year-round and offer legality owned by canonical windows.
- Make AI targeting receive the same canonical catalog and deterministic order.
  Step 13 owns coefficient/economic calibration, not a second population.
- Preserve exact current attributes and hidden exact potential.

## What NOT To Implement

- No public-value formula, asking price, fee, wage, budget, or finance tuning.
- No scouting fog, assignment, knowledge score, or hidden current attribute.
- No new route, duplicate Market state, eager full-player statistics scan, or
  abstract external pool.
- No automatic selected-club bid or invisible recruitment command.
- No cross-country content.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/career/career-market-catalog.test.ts \
  packages/engine/src/market/player-willingness.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/career/preliminary-agreement.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  packages/ui/src/career/career-market-view.test.ts
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Market exposes the complete canonical fictional three-tier population with no
  synthetic or duplicate target.
- Tier facts/filters are localized and accessible; detail stays lazy.
- Elite-to-third-tier willingness is credibly difficult through explicit facts.
- Selected-club and AI paths consume the same catalog/willingness owners.
- No economic formula was changed.
