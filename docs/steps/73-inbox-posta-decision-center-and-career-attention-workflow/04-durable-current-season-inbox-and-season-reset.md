# Step 04 - Durable Current-Season Inbox And Season Reset

## Status

Pending.

## Goal

Persist only the current season's structured Inbox facts and lifecycle state
through the existing career save boundary.

## Scope

- Add one validated current-season Inbox slice to `CareerState`.
- Store message IDs, source/category/level facts, related entity IDs, lifecycle
  state, and structured payload needed to rebuild detail.
- Keep rendered text, React state, filters, selection, and animation out of the
  durable state.
- Add immutable SQLite migration and mapper support.
- Update JSON/save-envelope round trips and migration defaults.
- Prove old saves load with an empty current-season Inbox.
- Define and implement deterministic new-season reset ordering.
- Clear previous-season messages instead of creating an unowned archive table.
- Preserve the season summary according to the agreed ordering long enough to
  be delivered and acknowledged, without retaining the old Inbox afterward.
- Ensure message interaction remains a working-session mutation and does not
  add per-click writes.

## Expected files

- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/05-inbox-lifecycle-use-cases-and-runtime-integration.md` only if a lesson changes future scope.

## Persistence requirements

- SQLite/OPFS remains the only browser persistence owner.
- Save schema changes are forward-only and tested against legacy fixtures.
- Current-season message order round-trips exactly.
- Read/acknowledged/resolved facts survive save/load.
- Starting a new season clears the prior season's Inbox deterministically.

## What NOT to implement

- No historical Inbox archive or retention setting.
- No browser preference/localStorage fallback.
- No write after opening, selecting, or filtering a message.
- No rendered prose in save rows.
- No future-system tables or nullable columns reserved for imagined categories.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/state/career-state.test.ts packages/storage/src/career-storage.contract.test.ts packages/storage/src/json-career-storage.test.ts packages/storage/src/sqlite/career-state-mapper.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts packages/storage/src/sqlite/sqlite-career-storage.test.ts packages/engine/src/career/advance-career-season.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Current-season Inbox state round-trips through JSON and SQLite.
- Legacy saves migrate to an empty valid Inbox.
- Lifecycle state persists only at Phase 72 save boundaries.
- New-season reset is deterministic and tested.
- No historical archive or alternate persistence exists.
- `docs/PROJECT_STATUS.md` marks Step 04 Done and Step 05 active.
