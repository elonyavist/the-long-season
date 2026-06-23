# 02 - Long-Run Report Data Builder Boundary

## Goal

Separate long-run report facts from CLI text rendering.

This step should introduce or clarify a data-building boundary that returns
structured report facts. The CLI should still own localized prose and terminal
layout.

## Expected files

- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report/*`
- `packages/simulation-tools/src/long-run/*`, only if the structured facts
  belong in simulation-tools rather than CLI.
- Focused tests for touched files.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Use the Step 01 audit to choose the smallest useful data-builder boundary.
- Extract report fact construction without changing simulation execution.
- Keep localized strings and terminal formatting out of the data builder.
- Prefer descriptive types that a junior developer can follow.
- Add TSDoc/JSDoc for new exported types and functions where useful.
- Preserve existing CLI output unless import ordering or section composition
  requires a documented no-op structure change.
- Do not leave old helpers behind if they are no longer used.

## What NOT to implement

- Do not change gameplay behavior.
- Do not change warning or fail thresholds.
- Do not change report status semantics.
- Do not add new report sections.
- Do not add UI-facing package contracts.
- Do not move presentation text into `@game/simulation-tools`.

## Required checks

- Focused tests for touched CLI or simulation-tools files.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`, if simulation-tools is
  touched.
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase46-builder --worlds=10 --seasons=10`
- `git diff --check`

## Definition of Done

- The report data-builder boundary is visible and named.
- The CLI can still render the same ten-season report.
- Structured report facts do not depend on localized output text.
- `docs/PROJECT_STATUS.md` records the adopted boundary.
