# Step 02 - Career Session And Save Policy Contract

## Status

Done.

## Goal

Introduce the smallest canonical contracts required for one working career
session and one per-career autosave policy, with real production callers.

## Scope

- Add a typed autosave policy with exactly three values: 7 in-game days, 15
  in-game days, and manual only.
- Default newly created careers to 7-day autosave.
- Add autosave policy to canonical per-career metadata and migrate JSON and
  SQLite storage deterministically.
- Add one narrow storage operation that updates autosave policy without saving
  the dirty working `CareerState`.
- Introduce `CareerSession` ownership for durable baseline, working state,
  dirty/clean status, selected policy, and last persisted game date.
- Derive dirty transitions through session operations rather than independent
  React booleans.
- Wire the session into the production runtime/store in the same step.
- Keep current action-level writes temporarily until Step 03 so this step does
  not leave gameplay partially migrated.

## Expected files

- `packages/storage/src/career-storage.interface.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/index.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/*` only where schema, migration, mapping, and
  contract coverage require it
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/infrastructure/persistence/sqlite-career.worker.ts`
- `apps/web/src/infrastructure/persistence/sqlite-worker-career-storage.ts`
- `apps/web/src/runtime/career-session.ts`
- `apps/web/src/runtime/career-session.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/03-session-owned-gameplay-commands-without-action-saves.md` only if a lesson changes future scope.

## Required contract behavior

- A loaded session begins clean and retains an immutable durable baseline.
- A gameplay replacement marks the session dirty without writing storage.
- A successful commit replaces the baseline and marks the session clean.
- A failed commit leaves working state and dirty status unchanged.
- Updating policy writes only the policy field/row.
- Date ownership uses canonical `GameDate`; no `Date.now()` cadence logic.
- Save compatibility is migration-owned and covered for current JSON/SQLite
  versions.

## What NOT to implement

- No autosave scheduler or controls yet.
- No loading UI.
- No second repository or browser persistence adapter.
- No wall-clock timer.
- No hidden checkpoint/recovery state.
- No broad store rewrite.

## Required checks

```bash
nvm use 24
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm exec vitest run packages/storage/src apps/web/src/runtime/career-session.test.ts apps/web/src/stores/career-ui-store.test.ts
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- The production runtime owns one real `CareerSession`.
- Storage round-trips all three policy values.
- Policy updates do not commit dirty gameplay state.
- Existing saves migrate deterministically to the 7-day default.
- No unused session or policy API remains.
- `docs/PROJECT_STATUS.md` records the adopted contract and Step 03 as next.
