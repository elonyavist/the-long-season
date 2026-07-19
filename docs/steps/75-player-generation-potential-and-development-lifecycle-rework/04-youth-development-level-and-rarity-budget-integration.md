# Step 04 - Youth-Development Level And Rarity-Budget Integration

## Status

Done.

## Goal

Give every club one explicit `1..5` youth-development level while keeping
division strength as the primary constraint on generated youth quality.

## Inspectable Outcome

- The same club context always derives the same level.
- Better lower-division academies produce more interesting prospects, not
  first-division-ready squads.
- Division-wide high and elite counts remain inside strict budgets.

## Scope

1. Add a validated `YouthDevelopmentLevel` value contract from `1` to `5`.
2. Derive the level from division first and club reputation second.
3. Feed the level into current-profile variance and reachable-potential budget
   only through bounded content policy.
4. Keep four labels: ordinary, interesting, high, elite.
5. Preserve strict division-wide budgets: elite `0..1`, high rare, ordinary
   majority.
6. Prove a third-division level-5 academy remains bounded by third-division
   current-ability rules.
7. Apply the same policy to initial academy and seasonal intake.
8. Expose the level to diagnostics as a structured derived fact, not rendered
   gameplay prose.

## Expected Files

- `packages/domain/src/state/youth-academy-state.ts`
- `packages/domain/src/state/youth-academy-state.test.ts`
- `packages/domain/src/index.ts`
- `packages/content/src/generators/youth-development-level.ts`
- `packages/content/src/generators/youth-development-level.test.ts`
- `packages/content/src/generators/player-potential-rarity.ts`
- `packages/content/src/generators/player-potential-rarity.test.ts`
- `packages/content/src/generators/player-rarity-budget.ts`
- `packages/content/src/generators/player-rarity-budget.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No facilities, coaches, staff hiring, training, money, or academy UI.
- No per-club elite guarantee.
- No reputation override that bypasses division limits.
- No fifth prospect label.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/state/youth-academy-state.test.ts packages/content/src/generators/youth-development-level.test.ts packages/content/src/generators/player-potential-rarity.test.ts packages/content/src/generators/player-rarity-budget.test.ts packages/content/src/generators/initial-youth-academies.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm cli simulate-season --seed=phase75-youth-a --player-generation-report
pnpm cli simulate-season --seed=phase75-youth-b --player-generation-report
pnpm depcruise
git diff --check
```

## Completion Criteria

- Every generated club has one deterministic youth-development level.
- Division remains the primary quality boundary.
- Four-label rarity and division budgets pass across at least 100 seeds.
- Step 05 is the single next action.
