# Step 04 - Conserved Tactical Contributions

## Status

Not started; requires Checkpoint A GO.

## Goal

Make every outfield role allocate the same total tactical budget instead of
creating more football because its weights sum higher.

## What To Implement

- Store one common role budget in the versioned calibration.
- Express task weights as allocations whose role sum is exact.
- Derive totals; never persist raw and normalized weights together.
- Keep the current scalar executor temporarily to isolate conservation.
- Prove algebraically: equal sums, positive reachable allocations, portiere
  isolation, and every increase paired with a decrease.
- Prototype per-role first; use phase sub-budgets only if the simple model
  analytically collapses on balanced saturation.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `05-contested-routes-and-lateral-focus.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/balance/match-tactics-calibration.test.ts
pnpm exec vitest run packages/engine/src/match-engine/tactical-shape.test.ts
pnpm exec vitest run packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement

No player task attributes, roster generation, AI, manager information, or
simulation-based excuse for a failed algebraic invariant.

## Definition Of Done

Conservation is exact and canonical, no derived duplicate exists, every new
branch is reachable on real roles, and Step 05 is the only next action.
