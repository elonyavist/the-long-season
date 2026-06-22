# Step 07 - Youth Academy Refill Generator Rework

## Goal

Replace the Phase 32 youth underpopulation behavior with deterministic academy refill to exactly `11` youth players per club while using the new role-aware generation model.

## Context

The agreed academy model is not random annual overproduction. It is a stable pipeline:

1. players age and develop;
2. over-19 youth are resolved;
3. promotions, sales, and releases happen;
4. academy gaps are calculated;
5. missing players are generated;
6. reports show the refill.

After refill, every club has exactly `11` youth academy players.

## Expected files

- `packages/domain/src/**/*.ts`
- `packages/domain/src/**/*.test.ts`
- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `packages/i18n/src/**/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Implement academy refill after lifecycle exits, not before.
- Enforce exact post-refill composition:
  - `1` goalkeeper;
  - `4` defenders;
  - `4` midfielders;
  - `2` attackers.
- Generate missing players only.
- Generate refill ages almost always `15..17`, with rare `18`, and no `19` by default.
- Prefer department first, then balance specific roles inside the department.
- Use division-first quality:
  - club tier/reputation modifies odds but does not bypass division bands.
- AI club behavior:
  - automatically promotes only useful `high` or `elite` players;
  - sells or releases aged-out players as needed.
- User club behavior:
  - does not auto-promote, auto-sell, or auto-release as hidden manager action;
  - reports players requiring decisions.
- Make refill visible at least in reports:
  - generated count;
  - department/role breakdown;
  - age breakdown;
  - notable prospects without exposing exact hidden potential.
- Add tests:
  - every club has exactly `11` youth after refill;
  - no youth academy player is `20+`;
  - composition is exact;
  - same seed stable;
  - no youth overpopulation;
  - youth underpopulation after refill is a failure, not a warning.

## What NOT to implement

- Do not implement UI decision screens.
- Do not implement scouting or staff/facility modifiers.
- Do not auto-manage the user's youth decisions.
- Do not create unlimited youth players.
- Do not expose exact hidden potential.
- Do not tune match scoring.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- focused tests for touched domain/content/engine/simulation-tools/CLI/i18n files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Academy refill creates exactly the agreed youth structure.
- Youth underpopulation after refill cannot pass silently.
- Youth overpopulation remains impossible.
- Reports make refill behavior inspectable.
