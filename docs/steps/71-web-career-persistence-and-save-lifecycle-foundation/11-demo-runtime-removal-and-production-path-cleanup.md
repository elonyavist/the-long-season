# 11 - Demo Runtime Removal And Production Path Cleanup

## Goal

Remove the in-memory web lifecycle that persistence has replaced and leave one
readable production path from app entry to full time.

## Scope

- Search production web code for replaced:
  - `Demo*` types/functions;
  - `demo-*` files;
  - `WEB_DEMO_*` constants;
  - `hasDemoCareer`;
  - parallel in-memory career/preparation/matchday sources.
- Delete obsolete Modules, exports, tests, CSS, i18n keys, and imports.
- Move necessary deterministic sample builders into test-only fixtures with
  explicit names.
- Simplify `App`, Zustand store, runtime, and adapters after deletion.
- Apply the deletion test to pass-through wrappers introduced during migration.
- Update architecture documentation with the final source-of-truth path.

## What NOT to implement

- No new features or screens.
- No compatibility wrappers for deleted production demo APIs.
- No broad unrelated refactor.
- No removal of the intentional browser demo product target; only remove the
  disposable in-memory persistence implementation.

## Expected files

- `apps/web/src/app/App.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/runtime/*`
- `apps/web/src/features/app-entry/*`
- `apps/web/src/features/dashboard/*`
- `apps/web/src/features/match-preparation/*`
- `apps/web/src/features/matchday/*`
- `apps/web/src/test-fixtures/*`
- `apps/web/src/styles/*`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/12-storage-errors-migrations-and-accessible-recovery.md`

## Required checks

```bash
nvm use 24
rg -n "hasDemoCareer|DemoCareer|DemoMatch|WEB_DEMO_|demo-career|matchday-demo|match-preparation-demo" apps/web/src --glob '!**/*.test.*' --glob '!**/test-fixtures/**'
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
```

Any remaining production match must be justified in `docs/PROJECT_STATUS.md`
as real browser-demo product behavior, not transitional persistence code.

## Definition of Done

- One production lifecycle owns career state.
- Replaced demo persistence code is gone.
- Test fixtures are clearly isolated from production.
- No pass-through wrapper, orphan export, stale label, or unused style remains.

