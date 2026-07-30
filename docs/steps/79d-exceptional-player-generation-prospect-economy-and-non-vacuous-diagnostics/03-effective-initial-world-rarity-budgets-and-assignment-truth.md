# Step 03 - Effective Initial-World Rarity Budgets And Assignment Truth

## Status

Done after execution-budget re-verification. The canonical assertions and
rarity bounds remain unchanged. The
100-world test timeout is `300s`: the isolated runtime is
`56.8s`, while full-suite contention reached `121.9s`, so the earlier `120s`
intermediate budget still had no stable operational margin.

## Goal

Make initial-world rarity limits describe the actual generated star ratings and
the archetype actually used, rather than only the IDs that received a forced
minimum.

## Expected Files

- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/generators/domestic-world.ts`
- `packages/content/src/generators/domestic-world.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/index.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/03-effective-initial-world-rarity-budgets-and-assignment-truth.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Keep the accepted complete-world initial bounds, measured from the internal
  effective current rating and potential ceiling rather than from a public
  lower estimate:
  - effective current six-star stock `1..2`;
  - effective potential six-star stock `2..4`;
  - at most one effective potential-six player below first division.
- Count actual canonical current ratings and upper-ceiling ratings after
  generation; do not equate allocation IDs with outcomes.
- Ensure ordinary/rare first-division lanes cannot silently create additional
  effective six-star profiles outside the world budget.
- Reconcile naturally qualifying compatible profiles before allocating or
  constructing any remaining required exceptional slots.
- Keep current-quality and potential rarity logically distinct even when one
  player belongs to both result sets.
- Store or return one truthful exceptional assignment per player, including the
  archetype/lane actually used.
- Remove stale per-division rarity metadata when a world-level exceptional lane
  supersedes it.
- Prove stable output when unrelated club/player iteration order changes.
- Add a bounded multi-seed test large enough to catch the pre-79D effective
  maximum of six potential-six seniors.

## What NOT To Implement

- No annual intake, development, valuation, asking-price, AI, browser, or
  persistence change.
- No post-hoc arbitrary demotion of a generated player without reconstructing a
  compatible deterministic profile.
- No global clamp that erases credible `5.5` outliers.
- No relaxation of the accepted initial bounds.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/generators/domestic-world.test.ts \
  packages/content/src/generators/player-rarity-budget.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/player-generation-quality.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Forced allocation and effective generated stock are separately measurable.
- Actual initial-world six-star counts meet the accepted bounds across the
  bounded multi-seed test.
- The lower-division exceptional limit applies to actual potential-ceiling
  ratings, not only the public conservative estimate.
- Assignment metadata matches the profile lane actually used.
- Same-seed output and stable ordering remain deterministic.
