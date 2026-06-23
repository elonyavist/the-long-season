# 06 - Presentation Boundary Review

## Goal

Review the new simulate-season CLI module shape and document what is now ready
for future UI-facing view models.

This step should not add UI or create a formal UI package. It should answer:

- which current modules are pure CLI renderers;
- which modules build structured facts that could later feed UI;
- which modules still mix building and rendering;
- which remaining hardcoded presentation risks exist;
- whether `career/format.ts` or `ten-season-report.ts` should be the next
  decomposition target.

## Expected files

- Phase 44 source files touched so far
- `docs/audits/CLI_PRESENTATION_BOUNDARY_REVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Inspect the post-extraction `simulate-season.ts` and helper modules.
- Confirm command responsibilities are discoverable from file names and exports.
- Identify:
  - CLI-only renderers;
  - builder-like modules;
  - output families that could become future UI view models;
  - remaining presentation hotspots.
- Update `docs/ARCHITECTURE.md` only where the module map changed.
- Do not change source unless a small comment/TSDoc fix is clearly needed.

## What NOT to implement

- Do not create UI view models yet.
- Do not create `apps/web` or UI packages.
- Do not move code only because a future UI might exist.
- Do not change localized labels unless a source edit requires it.
- Do not start `ten-season-report.ts` or `career/format.ts` decomposition.

## Required checks

- `pnpm --filter @game/cli run typecheck` if source is touched
- `pnpm --filter @game/i18n run typecheck` if labels are touched
- `pnpm check`
- `git diff --check`

## Definition of Done

- Presentation boundaries are documented after the simulate-season split.
- `docs/ARCHITECTURE.md` reflects any new important CLI modules.
- Remaining CLI hotspots have a concrete recommendation.
- `docs/PROJECT_STATUS.md` points to Step 07 as the next active step.
