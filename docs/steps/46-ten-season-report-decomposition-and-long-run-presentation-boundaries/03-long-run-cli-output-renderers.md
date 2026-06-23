# 03 - Long-Run CLI Output Renderers

## Goal

Split ten-season report CLI rendering into section-owned modules.

The result should make it easy to find the code that prints each major report
section without changing the data, simulation, or diagnostic behavior.

## Expected files

- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report/*`
- Focused tests for touched CLI files.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Identify the report sections currently printed by the command.
- Move rendering into named section modules only when the module owns meaningful
  formatting locality.
- Keep command orchestration in the command entry point.
- Keep report data construction in the Step 02 data-builder boundary.
- Keep localized labels in the existing localization layer.
- Remove unused inline helpers after extraction.
- Preserve report output content unless a tiny ordering or whitespace change is
  documented and covered by tests.

## What NOT to implement

- Do not add new report sections.
- Do not change the underlying report facts.
- Do not tune warnings.
- Do not add CLI flags.
- Do not create generic pass-through renderers.
- Do not duplicate old and new render paths.

## Required checks

- Focused tests for touched CLI files.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`, if localized output is touched.
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=10 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=50 --seasons=10`
- `git diff --check`

## Definition of Done

- The command file is easier to scan.
- Major CLI output sections are owned by named modules.
- There are no duplicate render paths or dead formatting helpers.
- Existing smoke output still works.
