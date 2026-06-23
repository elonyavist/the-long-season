# 05 - Simulate Season Summary Renderer

## Goal

Move normal season summary rendering out of `simulate-season.ts`.

The base command output is the most common user-facing path:

- command heading;
- seed and competition;
- final table;
- top scorer;
- top assist;
- top goalkeeper saves;
- best defense;
- worst attack;
- optional round fixture list.

This output should be owned by a clear presentation module after the inspection
renderers have been extracted.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- new or existing file under `apps/cli/src/commands/simulate-season/`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/i18n/src/labels.ts` only if label access needs a small type-safe
  adjustment
- `packages/i18n/src/labels.test.ts` only if labels are touched
- `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read prior Phase 44 outcomes.
- Extract base season summary and round output rendering into a named module,
  likely `season-summary-output.ts`.
- Keep simulation execution in `simulate-season.ts`.
- Keep score/table/stat calculations from engine results, not from rendered
  text.
- Preserve all localized labels and table formatting.
- Remove old local helpers when they become unused.
- Add useful TSDoc to extracted exported functions/types.

## What NOT to implement

- Do not change table sorting.
- Do not change season simulation input.
- Do not change top-player selection logic.
- Do not change labels except for necessary key plumbing.
- Do not start long-run report cleanup in this step.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck` if labels are touched
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --round=1`
- `pnpm cli simulate-season --seed=world-a --lang=it`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Base season and round output have a clear CLI presentation module.
- `simulate-season.ts` is materially smaller and easier to scan.
- Existing normal season and round output remain stable.
- No duplicate or dead summary helpers remain.
- `docs/PROJECT_STATUS.md` points to Step 06 as the next active step.
