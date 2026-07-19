# Step 06 - Beta Save Baseline Reset And Lifecycle Persistence

## Status

Done.

## Goal

Establish one new beta save baseline that persists the participation ledger and
explicitly rejects every older career without carrying compatibility code.

## Inspectable Outcome

- JSON and SQLite/OPFS round-trip every participation and development-checkpoint
  fact.
- A pre-Phase-75 save is classified as unsupported with typed recovery.
- No old save is silently migrated or partially loaded.

## Scope

1. Bump the JSON envelope and SQLite schema to the next baseline version.
2. Persist participation rows, monthly checkpoints, fixture idempotency facts,
   and played-role minutes losslessly.
3. Reject all earlier beta versions through one explicit unsupported-baseline
   result.
4. Delete old migration branches and compatibility fixtures that no longer
   serve the supported baseline.
5. Keep load read-only and deterministic.
6. Update browser storage recovery so unsupported beta careers can be reset
   without a frozen or partially restored session.
7. Recreate CLI and browser test careers under the new baseline.
8. Prove JSON and SQLite/OPFS save-load-save equality.

## Expected Files

- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/career-storage.contract.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/index.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No migration from an old beta save.
- No dual reader/writer, legacy mapper, localStorage mirror, or IndexedDB
  alternative.
- No gameplay, coefficient, or presentation redesign.
- No destructive reset without typed user-visible recovery at the adapter
  boundary.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/storage/src/career-storage.contract.test.ts packages/storage/src/json-career-storage.test.ts packages/storage/src/sqlite/career-state-mapper.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run visual:qa
pnpm depcruise
git diff --check
```

## Completion Criteria

- The new baseline round-trips all lifecycle facts.
- Older careers fail through one intentional recovery path.
- All superseded migration/compatibility code is deleted.
- Step 07 is the single next action.
