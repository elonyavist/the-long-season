# 04 - SQLite WASM OPFS Worker And Schema Bootstrap

## Goal

Introduce the real browser storage adapter and prove one SQLite/OPFS write/read
through the same interface the application will use.

## Scope

- Run `nvm use 24` before dependency changes.
- Install the official `@sqlite.org/sqlite-wasm` package and Comlink with pnpm.
- Configure Vite development/preview headers required by the adopted OPFS VFS.
- Create a dedicated browser worker that initializes SQLite directly; do not
  use the deprecated Worker1/Promiser API.
- Implement the first production `SqliteCareerStorage` adapter surface.
- Create the schema-version and migration ledger tables from Step 01.
- Use one database name and one connection coordinator for the current app.
- Add a browser integration test that opens OPFS, writes a minimal validated
  career, closes/reopens the adapter, and reads it back.
- Fail visibly and with a typed storage error when SQLite or OPFS is unavailable.

## What NOT to implement

- No IndexedDB/localStorage/sessionStorage fallback.
- No in-memory production fallback.
- No React lifecycle wiring yet.
- No deprecated SQLite Worker1/Promiser wrapper.
- No unused SQL abstraction or generic query builder.
- No schema tables for future gameplay systems.

## Expected files

- `package.json`
- `pnpm-lock.yaml`
- `packages/storage/package.json`
- `packages/storage/src/sqlite/sqlite-career-storage.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/index.ts`
- `packages/storage/src/index.ts`
- `apps/web/package.json`
- `apps/web/vite.config.ts`
- `apps/web/src/infrastructure/persistence/sqlite-career.worker.ts`
- `apps/web/src/infrastructure/persistence/create-web-career-storage.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/05-relational-world-state-round-trip.md`

## Required checks

```bash
nvm use 24
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
pnpm exec playwright test apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts
git diff --check
```

## Manual inspection

Inspect the browser test output and DevTools storage:

- SQLite database exists in OPFS;
- closing/reopening retains the row;
- no localStorage or IndexedDB career data is created;
- failure diagnostics are typed and do not claim a save succeeded.

## Definition of Done

- The SQLite adapter has a real browser caller and persistence proof.
- OPFS survives adapter recreation.
- No fallback or unused worker wrapper exists.
- Schema migration versioning starts with the first committed database schema.

