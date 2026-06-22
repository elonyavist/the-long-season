# Step 06 - Senior Generator Rework

## Goal

Rework senior player generation to use the new role identity, archetype, attribute classification, hard caps, division bands, and rarity budgets.

## Context

Senior squads are the base of the playable world. If they are incoherent, match results, market value, formation fit, and long-run career reports all become less meaningful.

This step changes senior generation only. Youth academy refill is handled in the next step.

## Expected files

- `packages/content/src/generators/*.ts`
- `packages/content/src/generators/*.test.ts`
- `packages/content/src/index.ts`
- `apps/cli/src/**/*.ts`
- `packages/i18n/src/**/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Route senior generation through the new role/archetype model.
- Apply division/current-ability bands before adding noise.
- Apply role hard caps after generation and before returning players.
- Preserve deterministic same-seed output.
- Ensure generated senior squads still cover formation/role needs.
- Remove obsolete generation helpers that are replaced by the new path.
- Update CLI/report labels only through i18n if user-facing output changes.
- Add focused tests for:
  - third-division senior squads;
  - same-seed stability;
  - different-seed variation;
  - role-coherent defenders, attackers, midfielders, and goalkeepers.

## What NOT to implement

- Do not rework youth academy refill in this step.
- Do not change development.
- Do not change match-engine algorithms.
- Do not change balance thresholds unless the report proves a real calibrated need.
- Do not leave old senior generator paths unused.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/cli run typecheck`
- focused tests for touched content/CLI/i18n files
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-b --player-generation-report`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Senior generation uses one coherent role-aware path.
- Senior squads remain deterministic and formation-playable.
- Third-division seniors are not broadly overpowered.
- No obsolete senior generation code remains undocumented.
