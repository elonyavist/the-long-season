# 05 - Player Identity Generation

## Goal

Use the identity contracts, name pools, and nationality distribution model to generate credible fictional player identities for fake content.

After this step, generated players should no longer appear as `PlayerXX NoYY` in normal CLI output.

## What to implement

- Integrate deterministic person identity generation into fake player generation.
- Replace placeholder `firstName`/`lastName` values with generated fictional names.
- Preserve stable player IDs and deterministic output for the same seed/content context.
- Keep player identity separate from localized labels.
- Ensure generated names remain compatible with:
  - season summaries;
  - fixture detail;
  - market inspection;
  - career market apply;
  - career save inspect.
- Tests that:
  - generated player IDs remain stable;
  - generated display names are not placeholder patterns;
  - the same input generates the same names;
  - a third-division fake squad is mostly domestic;
  - stronger/higher-profile test contexts can produce more international players if such context exists in the implemented content model.

## What NOT to implement

- Do not rename clubs, competitions, or saves.
- Do not add staff generation in this step.
- Do not add UI.
- Do not add real player names.
- Do not add market recommendations.
- Do not change match outcomes or balance tuning.
- Do not change transfer willingness based on nationality yet.

## Expected files

- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/league-system.test.ts` if fake league snapshots need updates
- `apps/cli/src/commands/simulate-season.test.ts` if CLI golden expectations need identity-safe updates
- `apps/cli/src/commands/career.test.ts` if career CLI expectations need identity-safe updates
- `docs/PROJECT_STATUS.md`
- `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/cli run typecheck`
- focused fake-player/content tests
- focused CLI tests affected by player names
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`
- `pnpm cli career --save=career-demo --inspect`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Generated players have credible fictional display names.
- Names are deterministic and do not affect player IDs.
- Current CLI output no longer reads like a placeholder prototype.
- Match, market, career, and balance behavior remain stable except for displayed names.
- `docs/PROJECT_STATUS.md` records the adopted player identity generation approach.
