# JSON Storage Boundary

## Goal

Create the `GameStorage` interface and a simple JSON-backed implementation for Phase 0 and Phase 1 save/debug dumps.

## Why we implement it this way

The engine must not know how persistence works. Phase 1 uses JSON only; SQLite belongs to Phase 2. A storage interface now lets later persistence change without touching engine code. Real clock metadata is allowed in storage, not in engine game time.

## What to implement

- `GameStorage` interface with `saveGame`, `loadGame`, `listSaves`, and `deleteSave`.
- `JsonGameStorage` that persists full `GameState` snapshots as JSON.
- Save metadata with save ID, name, `createdAtISO`, `updatedAtISO`, and schema version.
- Basic migration function that currently acts as identity for version `1`.
- Clear error types for missing or unreadable saves.

## What NOT to implement

- Do not implement SQLite.
- Do not normalize storage schema.
- Do not import from `engine`.
- Do not implement replay-from-seed.
- Do not implement retention policy.
- Do not add browser OPFS, IndexedDB, or Tauri filesystem code.

## Allowed dependencies

- `packages/storage -> domain, shared`
- Node filesystem APIs are allowed only if this implementation runs in Node and remains outside engine.

## Expected files

- `packages/storage/src/game-storage.interface.ts`
- `packages/storage/src/json-game-storage.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/migrate-save.ts`
- `packages/storage/src/index.ts`
- `packages/storage/src/**/*.test.ts`

## Required tests

- Save then load returns the same `GameState` snapshot.
- `listSaves` returns metadata sorted deterministically.
- Loading a missing save returns or throws a typed storage error.
- Storage imports no engine code.

## Definition of Done

- Storage boundary exists.
- JSON storage works for debug saves.
- Save schema version exists.
- Engine is not imported.
- No SQLite or browser storage files exist.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the Phase 1 JSON storage boundary from `docs/steps/00-foundation/03-storage-json.md`. Keep storage independent from engine and do not add SQLite, OPFS, browser, or Tauri code.
