# 06 - Relational Career Systems And Match Checkpoint Round Trip

## Goal

Complete SQLite coverage for every currently durable career slice needed by the
web loop.

## Scope

- Add transactional relational mappings for currently present:
  - selected club and career-world metadata;
  - market budgets and transfer history;
  - youth academy state;
  - season history and final-table order;
  - saved match preparation;
  - active match checkpoint.
- Implement `saveCareer`, `loadCareer`, `listCareers`, and `deleteCareer`
  completely through SQLite.
- Validate reconstructed state with existing domain constructors.
- Add adapter contract tests shared with `JsonCareerStorage` where useful.
- Prove half-time checkpoint round trip and deterministic full-time resume.
- Prove delete/list behavior and metadata ordering.

## What NOT to implement

- No browser screen wiring yet.
- No new market, youth, archive, or Inbox features.
- No rendered text or view model persistence.
- No table for absent future state.
- No storage-side football calculations.

## Expected files

- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/career-storage.contract.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/infrastructure/persistence/sqlite-career.worker.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/07-web-new-career-save-list-and-load-flow.md`

Step 05 established that the worker owns only the SQLite connection while
package mappers own all SQL semantics. This step must extend that delegation,
not add worker-local career tables or a second reconstruction path. It must also
cover rich reports attached to played fixtures so completing the current
durable `CareerState` does not silently strip existing world data.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/storage/src
pnpm --filter @game/storage run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
pnpm exec playwright test apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts
git diff --check
```

## Definition of Done

- SQLite satisfies the complete canonical `CareerStorage` interface.
- Every current durable career field round-trips.
- Half-time resume remains deterministic after database reconstruction.
- No current career data silently falls back to web memory.
