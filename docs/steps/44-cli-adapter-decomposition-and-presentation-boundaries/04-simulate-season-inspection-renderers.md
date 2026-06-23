# 04 - Simulate Season Inspection Renderers

## Goal

Move non-season-summary inspection renderers out of `simulate-season.ts`.

The command currently exposes several report-like inspections that are not the
normal season table:

- identity review;
- player-generation report;
- formation-fit inspection;
- market-demo inspection;

Some already have helper modules. This step should consolidate the remaining
inspection rendering ownership without changing behavior.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- existing helper modules under `apps/cli/src/commands/simulate-season/`
- optional new file under `apps/cli/src/commands/simulate-season/`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/i18n/src/labels.ts` only if label access needs a small type-safe
  adjustment
- `packages/i18n/src/labels.test.ts` only if labels are touched
- `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the Step 01 audit and prior Phase 44 outcomes.
- Identify inspection renderers still embedded in `simulate-season.ts`.
- Extract one or more coherent renderer modules only when they own real
  formatting locality.
- Keep existing `formation-fit-output.ts` and `market-demo-output.ts` if they
  are already the right seams.
- Preserve localization behavior and labels.
- Remove old local helpers when they become unused.
- Add useful TSDoc to extracted exported functions/types.

## What NOT to implement

- Do not add new inspection modes.
- Do not change report metrics.
- Do not change player generation, identity generation, or market logic.
- Do not move localized rendering into engine/content/simulation-tools.
- Do not create pass-through modules that only rename functions.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck` if labels are touched
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-a --formation-fit=4-2-3-1`
- `pnpm cli simulate-season --seed=world-a --market-demo=pro01-affordable-permanent`
- `git diff --check`

## Definition of Done

- Remaining inspection rendering is owned by named CLI modules.
- `simulate-season.ts` no longer embeds broad inspection presentation logic.
- Existing inspection output remains stable.
- No duplicate or dead renderer helpers remain.
- `docs/PROJECT_STATUS.md` points to Step 05 as the next active step.
