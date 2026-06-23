# 02 - Simulate Season Fixture Detail Module

## Goal

Move fixture-detail rendering out of `simulate-season.ts` into a dedicated CLI
module.

Fixture detail is a high-value extraction because it is a complete output
family: fixture header, events, player stats, causal fields, and optional
explanation trace. It is also a future UI candidate, so its presentation seam
should be easy to find.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- new or existing file under `apps/cli/src/commands/simulate-season/`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/i18n/src/labels.ts` only if existing label access needs a small
  type-safe adjustment
- `packages/i18n/src/labels.test.ts` only if labels are touched
- `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the Step 01 audit.
- Extract fixture-detail output into a named module, likely
  `fixture-detail-output.ts`.
- Keep the module CLI-local:
  - it may import i18n types;
  - it may use domain/engine/content types already consumed by CLI;
  - it must not introduce gameplay decisions.
- Keep current output stable for:
  - plain `--fixture`;
  - `--fixture --fixture-explanation`;
  - `--fixture --lineup-demo`;
  - `--fixture --setup-demo --manual-tactic-switch`.
- Remove old local helper functions from `simulate-season.ts` when they become
  unused.
- Add useful TSDoc to the extracted exported function/type.

## What NOT to implement

- Do not change match report structure.
- Do not change event wording except through existing localization keys.
- Do not add new fixture detail sections.
- Do not move engine-derived player-stat calculation into CLI rendering.
- Do not leave duplicate fixture renderers.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck` if labels are touched
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --lineup-demo=pro01-rotated`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `git diff --check`

## Definition of Done

- Fixture-detail rendering has a clear module.
- `simulate-season.ts` no longer owns fixture-detail formatting internals.
- Current fixture-detail output remains stable.
- No duplicate or dead fixture rendering helpers remain.
- `docs/PROJECT_STATUS.md` points to Step 03 as the next active step.
