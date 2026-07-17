# 05 - Relational World State Round Trip

## Goal

Persist and reconstruct the ordered world portion of `CareerState` without data
loss or opaque snapshot shortcuts.

## Scope

- Implement transactional relational mappings for:
  - save metadata;
  - career root and game metadata/calendar;
  - clubs and deterministic club order;
  - players, identities, abilities, roles/positions, and player order;
  - player dynamic states;
  - fixtures, results, and deterministic fixture order.
- Preserve namespaced IDs and explicit order columns.
- Enable and test foreign keys.
- Replace all rows for one save atomically without affecting another save.
- Reconstruct a validated `CareerState` world snapshot.
- Add representative generated-world round-trip and multi-save isolation tests.
- Add migration coverage for the schema introduced in Step 04.

## What NOT to implement

- No market, youth, season history, preparation, or active-match rows yet.
- No React or Zustand changes.
- No opaque full `CareerState` JSON column.
- No SQL querying for unimplemented UI screens.
- No cache that duplicates SQLite state.

## Expected files

- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `apps/web/src/infrastructure/persistence/sqlite-career.worker.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/06-relational-career-systems-and-match-checkpoint-round-trip.md`

The Step 04 browser proof established two implementation constraints for this
step: the worker must delegate world persistence to the package mapper instead
of accumulating a second SQL mapping, and the existing version-1 migration must
remain immutable while the expanded world schema is introduced as version 2.
SQLite identifiers that overlap keywords, including `current_date`, must remain
quoted in all mapper queries.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/storage/src/sqlite/world-state-mapper.test.ts
pnpm --filter @game/storage run typecheck
pnpm depcruise
pnpm exec playwright test apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts
git diff --check
```

## Definition of Done

- Generated world state round-trips exactly and deterministically.
- Ordered ID arrays are reconstructed from explicit order columns.
- Two saves are isolated.
- A failed write rolls back without corrupting the previous snapshot.
- No unused table or generic payload blob is introduced.
