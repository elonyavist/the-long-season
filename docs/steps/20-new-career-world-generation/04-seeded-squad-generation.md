# 04 - Seeded Squad Generation

## Goal

Make generated squads depend on the career world seed so different new games can produce different players while the same seed remains reproducible.

This step should change the generated world, not match logic. Match and season results may change only because the generated players and squads changed.

## What to implement

- Wire the career/world seed into fake player and squad generation.
- Ensure the same world seed produces the same:
  - player IDs;
  - player identities;
  - nationalities;
  - generated abilities;
  - initial squad composition.
- Ensure different world seeds produce visibly different squads.
- Reduce repeated full names inside a club and across nearby generated squads where practical.
- Preserve stable ID namespace conventions.
- Add focused tests for same-seed reproducibility and different-seed variation.
- Add TSDoc/JSDoc comments on modified generation entrypoints.

## What NOT to implement

- Do not regenerate players on every match, fixture, or inspection command.
- Do not change engine algorithms.
- Do not change match scoring conversion probabilities.
- Do not add youth intake.
- Do not add growth/decline over time.
- Do not add scouting fog.
- Do not add market AI, contracts, wages, loans, transfer windows, or UI.
- Do not store SVG flag paths in domain or engine data.

## Expected files

- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/league-system.ts` only if the public generator entrypoint needs a world-seed option
- `packages/content/src/generators/league-system.test.ts` if league generation behavior changes
- `apps/cli/src/commands/simulate-season.test.ts` only if existing CLI expectations must adapt to new deterministic names
- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/05-potential-age-and-prospect-distribution.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused fake-player and league-system tests
- focused CLI tests only if CLI expectations change
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --identity-review`

## Definition of Done

- Generated squads vary by world seed.
- Same seed output is reproducible.
- Different seed output is visibly different.
- Players are not regenerated unpredictably inside an existing career.
- Repeated full names are reduced or explicitly recorded as a remaining limitation.
- `docs/PROJECT_STATUS.md` records the adopted seeded generation behavior.
