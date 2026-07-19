# Step 03 - Age-Aware Reachable Potential Allocation

## Status

Done.

## Goal

Derive a realistic per-attribute reachable ceiling from the completed current
profile and one age-aware total growth budget.

## Inspectable Outcome

- Age-26/27 players cannot carry impossible physical or technical jumps.
- Young high-potential players have a few strong growth lanes instead of
  inflated room across every attribute.
- Potential is always at least current, at most `20`, and age-feasible.

## Scope

1. Add one content-owned reachable-potential allocator.
2. Calculate one total growth budget from age band, role, division, club tier,
   and prospect rarity.
3. Allocate that budget deterministically across role-relevant attribute
   families with bounded variance.
4. Give physical attributes earlier maturation and near-zero room at ages
   `25..27`; allow only limited mental/technical refinement thereafter.
5. Keep a separate goalkeeper potential curve.
6. Assert representative boundaries, including age-26 pace `10` never reaching
   `18` and age-26 crossing `4.3` never receiving a multi-tier jump.
7. Route every current player producer through this allocator.
8. Remove independent potential rolls and superseded potential offsets in the
   same step.

## Expected Files

- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-allocation.test.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/content/src/generators/player-generation-bands.test.ts`
- `packages/content/src/generators/player-role-templates.ts`
- `packages/content/src/generators/player-role-templates.test.ts`
- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-archetypes.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No exact potential in UI or CLI user-facing career output.
- No independent future-value roll for each attribute.
- No potential increase during development; that belongs to engine invariants
  in later steps.
- No rarity-budget change; Step 04 owns rarity labels and allocation.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/player-potential-allocation.test.ts packages/content/src/generators/player-generation-bands.test.ts packages/content/src/generators/player-role-templates.test.ts packages/content/src/generators/player-archetypes.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/career-intake-players.test.ts packages/content/src/generators/initial-youth-academies.test.ts packages/content/src/generators/generated-player-factory.test.ts
pnpm --filter @game/content run typecheck
pnpm cli simulate-season --seed=phase75-potential-a --player-generation-report
pnpm cli simulate-season --seed=phase75-potential-b --player-generation-report
pnpm depcruise
git diff --check
```

## Completion Criteria

- All generated potential comes from current ability plus one bounded budget.
- Age/family acceptance examples pass.
- No superseded potential formula remains.
- Step 04 is the single next action.
