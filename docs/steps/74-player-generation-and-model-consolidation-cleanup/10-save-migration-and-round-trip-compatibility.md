# Step 10 - Save Migration And Round-Trip Compatibility

## Status

Done.

## Goal

Make the consolidated player model safe for existing JSON and SQLite/OPFS
careers through the explicit migration decision recorded in Step 01.

## Inspectable Outcome

- Supported previous saves load deterministically.
- New saves round-trip all canonical player role and ability facts.
- Historical players missing optional role metadata are normalized through one
  documented deterministic rule or produce typed recovery.
- No migration is added when the durable shape did not change.

## Scope

1. Execute the Step 01 migration decision without reopening player semantics.
2. If durable shape changed, bump the relevant envelope/schema version and add
   one forward migration from the immediately supported previous version.
3. If durable shape did not change, add compatibility/round-trip proof only.
4. Map all player abilities, potential, role identity, familiarity, dynamic
   state, and academy membership without loss.
5. Add JSON and SQLite/OPFS fixtures for legacy-minimal and current-complete
   players.
6. Verify save-load-save equality, idempotent migration, and deterministic
   normalization.
7. Verify current browser career load and match-preparation read model still
   consume restored players.
8. Delete temporary migration scaffolding and obsolete mapper branches after
   supported compatibility is proven.

## Implementation Contract

- Migration never calls RNG.
- Persisted IDs and current/potential attributes never change merely because a
  save is loaded.
- A missing historical role identity is derived only from persisted
  position/ability facts under a documented stable rule.
- Typed recovery is preferable to silently inventing contradictory data.
- SQLite/OPFS remains the browser persistence authority; no second store or
  localStorage mirror is introduced.

## Expected Files

- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No empty schema bump.
- No backwards write format.
- No random or time-dependent normalization.
- No localStorage/IndexedDB alternative persistence path.
- No user-facing persistence redesign.
- No permanent dual mapper for old/new player models.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/storage/src/career-storage.contract.test.ts packages/storage/src/json-career-storage.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Load a supported prior career and inspect senior/youth role identity and
  attributes before and after save.
- Refresh the browser career and confirm the same players, preparation, and
  current fixture remain available.
- Confirm no migration writes merely from reading a valid current save.

## Cleanup Boundary

Keep only the migration required by the supported version policy and the
current mapper. Delete temporary fixtures/helpers and obsolete branching after
round-trip coverage passes.

## Completion Criteria

- The migration/no-migration decision is implemented exactly as documented.
- JSON and SQLite/OPFS compatibility and round trips pass.
- No persisted player fact is lost or randomized.
- No second persistence path or compatibility residue remains.
- Step 11 is the single next action.
