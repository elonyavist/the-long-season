# 05 - Feature-First Folder Migration

## Goal

Move `apps/web/src` files into the documented feature-first structure without
behavior changes.

This step is about locality and navigation, not new features.

## Expected files

- `apps/web/src/app/*`
- `apps/web/src/shared/**/*`
- `apps/web/src/features/**/*`
- `apps/web/src/stores/*`
- `apps/web/src/visual-qa/*`
- `apps/web/src/**/*.test.ts`
- `apps/web/src/**/*.test.tsx`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Move files according to `WEB_FOLDER_STRUCTURE_PLAN.md`.
- Update imports.
- Keep tests beside or near the Modules they verify.
- Keep visual QA scripts under `visual-qa/`.
- Remove empty folders created by the migration.
- Add short JSDoc/TSDoc comments to new folder-level Modules and exported
  functions/types where useful for a junior developer.
- Update `docs/ARCHITECTURE.md` with the new web map.

## What NOT to implement

- Do not change product behavior.
- Do not create generic wrappers just to satisfy the folder map.
- Do not create unused future-feature folders.
- Do not use barrels that hide ownership unless the step proves they improve
  readability.
- Do not leave old duplicate files behind.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Web files live in folders whose purpose is clear.
- No duplicate old files remain.
- `docs/ARCHITECTURE.md` documents the new structure.
- `docs/PROJECT_STATUS.md` identifies Step 06 as the next action.
