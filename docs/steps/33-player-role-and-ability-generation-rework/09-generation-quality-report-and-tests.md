# Step 09 - Generation Quality Report And Tests

## Goal

Add or rework quality reports and tests so player generation and development coherence can be inspected across seeds.

## Context

The project needs evidence, not intuition. The user should be able to inspect generated squads and long-run player development to answer:

- Are third-division players too strong?
- Are roles coherent?
- Are young players promising but not already complete?
- Are high/elite prospects rare enough?
- Are academy refills bounded and useful?
- Are creators/scorers/assist leaders plausible?

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `packages/i18n/src/**/*.test.ts`
- `docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Extend player-generation report output with:
  - role-coherence anomalies;
  - out-of-role cap violations;
  - current ability distribution by division/role/age;
  - potential band distribution;
  - high-current lower-division outliers;
  - youth refill counts by department/role/age;
  - aged-out youth actions;
  - report-only user-club youth decisions.
- Extend long-run report metrics with:
  - cap violations after development;
  - clubs with academy size not equal to `11` after refill;
  - creator/assist concentration tracking;
  - role coverage warnings before and after the rework.
- Keep user-facing text localized.
- Add tests that fail on:
  - defender finishing cap violations;
  - attacker defensive cap violations;
  - goalkeeper outfield profile violations;
  - youth academy post-refill size different from `11`;
  - potential rarity inflation.

## What NOT to implement

- Do not change product rules just to make reports green.
- Do not expose exact hidden potential as a normal user-facing value.
- Do not add UI.
- Do not start a new market/scouting/facility system.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused tests for touched simulation-tools/CLI/i18n files
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-b --player-generation-report`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Reports expose the generation problems this phase is meant to solve.
- Tests protect the new model from regression.
- User-facing report text remains localized.
