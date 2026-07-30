# Step 03 - Division Generation Bands And World Rarity Budgets

## Status

Done.

## Goal

Make generated current quality, potential, club strength, squad placement, and
exceptional rarity produce the accepted global-star distributions before the
three-division world is assembled.

## Expected Files

- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-generation-bands.test.ts`
- `packages/content/src/generators/player-current-ability-bands.ts`
- `packages/content/src/generators/player-current-ability-bands.test.ts`
- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-allocation.test.ts`
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/index.ts`
- `packages/simulation-tools/src/player-market-calibration-report.ts`
- `packages/simulation-tools/src/player-market-calibration-report.test.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/03-division-generation-bands-and-world-rarity-budgets.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Use the validated Step 01 rating-scale JSON instead of duplicating
  thresholds, initial budgets, or intake budgets in generator code.
- Make current-ability rarity selection explicitly category- and club-tier-
  aware.
- Make potential rarity a separate allocation from current quality.
- Ensure first-team-ready distributions satisfy:
  - third division normally `1..3`, sporadic current `3.5`;
  - second division normally `2..3.5`, sporadic current `4`;
  - first division normally `3..5.5`, sporadic current `6`.
- Allow youth and reserves below those first-team ranges.
- Allow a rare lower-division potential outlier without making that player
  first-division ready immediately.
- Allocate `1..2` current six-star players and `2..4` potential six-star players
  across one complete initial world.
- Put current six-star players in strong first-division clubs and credible
  first-team positions.
- Permit at most one exceptional-potential player below the first division.
- Apply the separate annual world-level intake budget:
  - never reuse the initial-world `2..4` count per academy or season;
  - never allocate more than one potential-six player in one world intake;
  - allocate `2..4` across a deterministic ten-season intake cohort;
  - preserve stable allocation when unrelated clubs or players are added.
- Replace the reserve-slot preference that currently captures category stars
  and rare outliers.
- Ensure the exceptional senior lane has a real producer or remove it if a
  better single owner supersedes it.
- Preserve role coherence, attribute caps, deterministic stream keys, stable
  tie-breakers, and potential-at-least-current invariants.
- Report distributions separately for starters, reserves, and youth.
- Report initial stock separately from annual intake and active year-10 stock.

## What NOT To Implement

- No new world topology, competition, calendar, promotion, Market, valuation,
  finance, wage, AI, storage, or browser behavior.
- No blanket minimum star rating for every registered player in a division.
- No per-seed exception, forced named player, or exceptional count copied into
  each club/cohort.
- No inflated lower-division current ability merely to create an interesting
  prospect.
- No change to player development or match strength unless a failing invariant
  proves the generator contract is unreachable inside this step.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/generators/player-generation-bands.test.ts \
  packages/content/src/generators/player-current-ability-bands.test.ts \
  packages/content/src/generators/player-current-profile-policy.test.ts \
  packages/content/src/generators/player-rarity-budget.test.ts \
  packages/content/src/generators/player-potential-allocation.test.ts \
  packages/content/src/generators/generated-player-factory.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/career-intake-players.test.ts \
  packages/content/src/generators/player-generation-quality.test.ts \
  packages/simulation-tools/src/player-market-calibration-report.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Fixed seeds meet the accepted first-team division ranges.
- Youth/reserve lower tails remain credible and explicit.
- Current and potential exceptional budgets are independent and exact.
- Initial rarity, annual intake, and year-10 active stock are distinct
  diagnostics and remain inside their versioned bounds.
- Six-star current players appear only at credible strong first-division clubs
  and first-team slots.
- No rare-player reserve-allocation accident remains.
- Same-seed output is byte-identical.
