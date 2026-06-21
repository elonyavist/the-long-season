# 10 - Simulate Season Identity World Seed Rework

## Goal

Fix the CLI inspection mismatch where `simulate-season --seed=<value> --identity-review` printed the same generated names for different seeds.

The standalone `simulate-season` command currently uses `--seed` for the runtime season/match simulation, but it still creates fake content with the default world seed. For CLI inspection, this is misleading: a user expects `--seed=world-a` and `--seed=world-b` to show different generated identities.

## What to implement

- Pass the parsed simulate-season seed into `createFakeLeagueSystem({ worldSeed: parsed.seed })`.
- Preserve deterministic same-seed output.
- Add a focused CLI test proving different seeds show different identity-review names.
- Keep career save semantics unchanged: persisted careers still store `CareerWorldMetadata.worldSeed`.
- Update the Phase 20 report/status with the clarified CLI rule.

## What NOT to implement

- Do not add new CLI flags.
- Do not add UI.
- Do not change balance-report behavior.
- Do not change career save generation.
- Do not start Phase 21.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused simulate-season CLI tests
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-b --identity-review`

## Definition of Done

- Different `simulate-season --seed` values produce visibly different identity-review names.
- Same seed remains reproducible.
- Phase 20 status and report explain the standalone CLI seed behavior.

