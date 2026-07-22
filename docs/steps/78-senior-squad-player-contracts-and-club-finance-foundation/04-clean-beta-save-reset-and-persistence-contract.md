# Step 04 - Clean Beta Save Reset And Persistence Contract

## Status

Ready.

## Goal

Persist registrations, contracts, histories, negotiations, and club finances
losslessly behind one intentionally incompatible beta save boundary.

## User-Visible Outcome

New careers reload with identical squad, contract, and finance facts. Old beta
careers receive a clear reset message instead of a generic storage error.

## Scope

1. Advance browser SQLite and CLI/JSON save contracts to one clean Phase 78
   baseline.
2. Persist ordered registrations, contracts, histories, negotiations, club
   finances, budgets, and ledger entries without precision loss.
3. Delete migrations and normalizers that would partially synthesize missing
   Phase 78 facts.
4. Make old beta browser data deliberately recreate/reset under the accepted
   beta policy.
5. Make old CLI/JSON saves fail with a typed outdated-beta result.
6. Remove outdated saves from the normal Continue path and present a localized
   New Career destination.
7. Prove refresh, manual save, 7/15-day autosave, and reload preserve the new
   facts.

## Implementation Contract

- No pre-Phase-78 career may load with invented contracts or finances.
- Schema handling remains owned by storage, while localized explanation stays
  in adapters/UI.
- Reset is explicit in tests and user copy; storage-access failures remain a
  distinct error.
- Existing session save cadence is unchanged.

## Expected Files

- `packages/storage/src/career-storage.contract.ts`
- focused storage contract tests
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- focused JSON/SQLite mapper/storage tests
- `apps/web/src/infrastructure/persistence/sqlite-career.worker.ts`
- current app-entry save listing/recovery adapters and focused tests
- current CLI career persistence adapters and focused tests
- current i18n catalogs/tests for the beta reset message
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No compatibility migration, optional fallback, synthesized placeholder, or
  dual schema path.
- No change to manual or 7/15-day autosave cadence.
- No contract lifecycle or React Squad screen.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/storage run test
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Open an intentionally old beta browser save and confirm the message is about
  beta incompatibility, not storage availability.
- Create, save, reload, and inspect a new career's numbers, contracts, and
  finances.

## Completion Criteria

- New facts round-trip losslessly in browser and CLI storage.
- Old saves cannot enter a partially upgraded career.
- No compatibility code remains.
- Step 05 remains the only next implementation step.
