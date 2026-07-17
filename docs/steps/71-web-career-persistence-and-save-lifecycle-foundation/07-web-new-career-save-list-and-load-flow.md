# 07 - Web New Career Save List And Load Flow

## Goal

Make the main menu operate on real local career saves instead of
`hasDemoCareer`.

## Scope

- Add a small `WebCareerRuntime` application Module that coordinates existing
  world generation/use cases with `CareerStorage`.
- Build a new career through existing content/domain/engine Modules using an
  explicit persisted seed; do not duplicate the demo world in React.
- Save the validated career before opening the dashboard.
- Load save metadata asynchronously at app startup.
- Present bounded app-entry states:
  - storage loading;
  - no saves;
  - saves available;
  - selected save loading;
  - typed storage error.
- Let `Continua carriera` load the selected real save.
- Keep language/currency preferences outside the career snapshot.
- Remove `hasDemoCareer` and any app-entry branch made obsolete in this step.
- Add localized accessible loading/error/save-list labels in all five languages.

## What NOT to implement

- No multiple-profile manager system.
- No save export/import, rename, duplicate, or cloud sync.
- No localStorage/IndexedDB career data.
- No fake save list.
- No broad menu redesign.

## Expected files

- `apps/web/package.json`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/infrastructure/persistence/create-web-career-storage.ts`
- `apps/web/src/features/app-entry/app-entry-view-model.ts`
- `apps/web/src/features/app-entry/app-entry-view-model.test.ts`
- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.test.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/08-loaded-dashboard-continue-and-posta-rehydration.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/runtime apps/web/src/features/app-entry apps/web/src/stores/career-ui-store.test.ts packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/i18n run typecheck
pnpm depcruise
git diff --check
```

## Visual check for the user

Inspect the main menu before and after creating a career.

Acceptance:

- loading does not look like a disabled broken menu;
- new career opens only after the durable write succeeds;
- Continue reflects real saves;
- save rows fit desktop and narrow layouts without horizontal overflow;
- a storage error explains the problem and does not pretend a career exists.

## Definition of Done

- App entry no longer depends on `hasDemoCareer`.
- New Career and Continue call the real runtime/storage path.
- The first browser-visible save lifecycle is usable and localized.
- No obsolete app-entry demo branch remains.

