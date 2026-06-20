# Fitness Strength Impact

## Goal

Make low fitness affect team strength through explicit multiplier curves.

## Why we implement it this way

The engine already supports optional `PlayerStateMultiplierCurves` in `deriveTeamStrength`. This step should use that existing hook instead of adding a second strength-modifier path.

Fitness should be a light performance cost. A tired player should matter, but a strong tired player should not become worse than a much weaker rested player by default. The goal is to create management pressure without making fitness dominate ability.

This step should prove the strength impact in isolation before the season starts evolving player fitness.

## What to implement

- Add or expose fake content fitness multiplier curves for the current demo league.
- Wire current CLI team-context creation to pass the configured fitness curve when deriving team strength.
- Keep all current generated players at fitness `100`, so default output should remain unchanged unless a test intentionally lowers fitness.
- Add focused tests proving:
  - fitness `100` produces multiplier `1`;
  - lower fitness reduces role/team strength by a bounded amount;
  - only supplied curves affect strength;
  - missing player state still fails clearly when curves are supplied;
  - default fake content season output remains deterministic.
- Document the chosen curve bands in `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not spend or recover fitness during season simulation in this step.
- Do not add CLI condition output yet.
- Do not implement form, morale, injuries, staff, training, growth, aging, rotation AI, or tactical automation.
- Do not tune match scoring rates, conversion bands, calibration target ranges, or fake content ability spread.
- Do not change the existing `PlayerDynamicState` shape unless the step proves the current shape cannot support fitness.

## Allowed dependencies

- `content -> domain, shared`
- `engine -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `packages/content/src/generators/league-system.ts`
- `packages/content/src/generators/league-system.test.ts` only if content behavior needs focused tests.
- `packages/engine/src/match-engine/team-strength.ts` only if the existing curve behavior needs a small refinement.
- `packages/engine/src/match-engine/team-strength.test.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `apps/cli/src/commands/balance-report.ts`
- `apps/cli/src/commands/balance-report.test.ts` only if report wiring changes.
- `docs/PROJECT_STATUS.md`
- `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` only if the integration contract changes the next step scope.

## Required tests/checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched content, engine, and CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Fitness multiplier curves are configured explicitly.
- Current full-fitness default output stays stable or any unavoidable output change is documented with metrics.
- Low fitness has a bounded, tested effect on team strength.
- No fitness lifecycle or CLI condition view exists yet.
- `docs/PROJECT_STATUS.md` records the curve values and verification result.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Wire fitness into team-strength derivation through explicit multiplier curves only. Do not implement season fitness lifecycle or CLI condition output. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me whether default output changed, and stop.
