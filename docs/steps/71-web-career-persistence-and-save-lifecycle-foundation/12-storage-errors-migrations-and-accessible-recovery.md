# 12 - Storage Errors Migrations And Accessible Recovery

## Goal

Make persistence failures and schema upgrades explicit, localized, and safe for
the manager.

## Scope

- Cover typed errors for:
  - unavailable OPFS/cross-origin isolation;
  - database initialization failure;
  - unreadable/corrupt save;
  - unsupported future schema;
  - failed write/quota condition;
  - missing save during load/delete;
  - concurrent/busy database state when applicable.
- Add deterministic database migration tests from the first committed schema.
- Ensure failed writes preserve the last valid save transactionally.
- Add accessible error and retry states to app entry and current career shell.
- Keep the user on a safe screen after failure.
- Add all visible text to the five supported locales.
- Verify focus movement and screen-reader announcements for asynchronous errors.

## What NOT to implement

- No silent fallback storage.
- No destructive automatic reset of corrupt or future-version saves.
- No cloud recovery or export/import.
- No raw SQL/browser exception shown as user-facing prose.
- No new gameplay feature.

## Expected files

- `packages/storage/src/game-storage.interface.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/infrastructure/persistence/sqlite-career.worker.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.test.tsx`
- `apps/web/src/features/app-entry/app-entry-view-model.ts`
- `apps/web/src/features/app-entry/app-entry-view-model.test.ts`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/13-playwright-refresh-qa-architecture-and-phase-report.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/storage/src/sqlite apps/web/src/runtime apps/web/src/features/app-entry apps/web/src/features/app-shell packages/i18n/src/labels.test.ts
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
pnpm depcruise
git diff --check
```

## Visual check for the user

Inspect unavailable-storage, corrupt-save, and failed-write states.

Acceptance:

- messages explain the action the manager can take;
- focus lands on the relevant error/retry surface;
- no save is shown as successful after a failed transaction;
- existing valid saves are not deleted automatically.

## Definition of Done

- Persistence failures are typed and localized.
- Migration and rollback behavior is tested.
- Recovery UI meets the current WCAG 2.2 AA target.
- No hidden fallback or destructive recovery exists.
