# Step 05 - Rarity Budget And White-Fly Rules

## Goal

Control rare lower-division outliers with deterministic league-level budgets.

## Context

The project wants memorable exceptions without making the exception normal. A lower-division league may contain a few unusually strong players, serious prospects, or late-career quality players, but the generator must budget them at league level.

## Expected files

- `packages/content/src/generators/*.ts`
- `packages/content/src/generators/*.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add deterministic rarity budgets by division and world seed.
- For a third-division league, target:
  - `1..4` white-fly current-ability exceptions;
  - a small number of serious future prospects;
  - extremely rare true prodigy output.
- Ensure the budget is league-level, not guaranteed per club.
- Allow almost every club to have interesting youth, but not guaranteed first-division future stars.
- Add tests proving the budget is stable for the same seed and bounded across representative seeds.

## What NOT to implement

- Do not add player development or future-season growth.
- Do not add scouting or market discovery logic.
- Do not force every club to receive a rare player.
- Do not expose hidden rarity labels to the user as truth.
- Do not change transfer willingness or valuation in this step.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused tests for touched content generator files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Rare lower-division exceptions are generated through an explicit deterministic budget.
- Same seed produces the same rarity allocation.
- Representative seeds stay inside configured rarity limits.
- The next step can turn these rules into broad regression tests.
