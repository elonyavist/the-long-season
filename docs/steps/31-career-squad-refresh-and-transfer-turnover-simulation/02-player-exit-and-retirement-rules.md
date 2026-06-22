# Step 02 - Player Exit And Retirement Rules

## Goal

Add deterministic end-of-season player exit rules so aging players can leave the active career world.

## Context

The current long-run failure is structural: players develop and age, but too many remain in squads forever. This step creates the first narrow exit mechanism.

## Expected files

- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a pure engine career use-case for end-of-season player exits.
- Consider age, current ability, broad position group, and deterministic seed/season keys.
- Produce structured exit records with reason keys such as retirement, released, or career_step_down.
- Copy-on-write career state; do not mutate input.
- Preserve explicit ordered player IDs.
- Ensure selected club players can exit, but do not auto-replace them in this step.
- Add determinism and boundary tests.

## What NOT to implement

- Do not generate replacement players.
- Do not simulate transfers.
- Do not implement contracts, wages, or negotiations.
- Do not delete players in a way that breaks club/player ID ordering.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- focused engine career exit tests
- `pnpm check`

## Definition of Done

- Player exits are deterministic and test-covered.
- Exit records are structured enough for later reports.
- Existing career saves remain valid.

