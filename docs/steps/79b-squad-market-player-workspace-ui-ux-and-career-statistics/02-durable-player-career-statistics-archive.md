# Step 02 - Durable Player Career Statistics Archive

## Status

Done.

## Goal

Preserve truthful per-player season totals before rollover clears the current
participation ledger, and expose one deterministic selector for current-season
and career totals.

## Adopted Data Contract

- Persist `playerId`, starts, substitute appearances, minutes,
  `ratingTotal`, `ratingSamples`, goals, assists, and saves.
- Derive appearances and average rating.
- Store participation and event coverage as `complete`, `partial`, or
  `unavailable`.
- Make `playerStatistics` optional only as a save-compatibility seam; normalize
  its absence to unavailable coverage.
- Build the archive before player exits and participation reset.
- Keep archived rows player-keyed and ordered by `playerId`; do not require the
  player to remain active.
- Add SQLite schema `15` incrementally after baseline `14`; version `0` applies
  both, version `14` applies `15`, and unsupported beta versions `1..13` remain
  rejected.
- Keep JSON envelope `7` because the addition is optional and additive.

## Expected Files

- `packages/domain/src/career/player-statistics.ts`
- `packages/domain/src/career/player-statistics.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/career/player-statistics.ts`
- `packages/engine/src/career/player-statistics.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/index.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## What NOT To Implement

- No UI, labels, CSS, table, dialog, or rating work.
- No clean sheets, xG, cards, club split, competition split, or inferred
  historic backfill.
- No foreign key from archived statistics to active `players`.
- No participation-reset change and no second match-event aggregator.
- No destructive beta reset for an existing schema-14 database.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-statistics.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/player-statistics.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/storage/src
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm exec playwright test \
  apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts \
  --workers=1 --reporter=line
git diff --check
```

## Definition Of Done

- A completed season archives truthful player totals before reset.
- Current-season and career aggregation use the same deterministic contract.
- Weighted rating and coverage semantics are test-proven.
- JSON and SQLite/OPFS round-trips preserve the archive.
- Schema 14 upgrades to 15 without deleting the career.
