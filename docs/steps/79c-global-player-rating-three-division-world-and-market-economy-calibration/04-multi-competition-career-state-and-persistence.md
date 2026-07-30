# Step 04 - Multi-Competition Career State And Persistence

## Status

Done.

## Goal

Replace the single-competition career-state assumption with one ordered
domestic competition registry and persist the complete topology/calibration
version contract without changing generated content or season behavior.

## Expected Files

- `packages/domain/src/career/competition-world.ts`
- `packages/domain/src/career/competition-world.test.ts`
- `packages/domain/src/entities/competition.entity.ts`
- `packages/domain/src/entities/competition.entity.test.ts`
- `packages/domain/src/state/game-state.ts`
- `packages/domain/src/state/game-state.test.ts`
- `packages/domain/src/state/career-world.ts`
- `packages/domain/src/state/career-world.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/index.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/testing/persistable-career-fixture.ts`
- `docs/ARCHITECTURE.md`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/04-multi-competition-career-state-and-persistence.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add an explicit ordered competition-ID array plus lookup for the playable
  domestic world.
- Keep one canonical membership owner and derive the selected club's current
  competition from it.
- Validate:
  - unique competition IDs;
  - unique club membership across the three domestic tiers;
  - every member club exists;
  - every fixture references a known competition and member clubs;
  - deterministic competition and club order.
- Define the minimal history facts needed to preserve a club's tier and season
  result across later movement.
- Add one immutable metadata bundle containing:
  - topology decision ID;
  - player rating scale version;
  - player market calibration version;
  - valuation curves version;
  - asking-price curves version;
  - market-behavior calibration version;
  - wage/finance calibration version.
- Store the version bundle exactly once on `GameMeta`, the requirements-owned
  canonical owner; do not copy it into `CareerWorldMetadata`, UI state, or a
  competition.
- Round-trip registry, membership, history, and version bundle through JSON and
  SQLite/OPFS.
- Bump the career save/schema version if required and document the beta-save
  policy. Prefer the project's explicit clean-reset boundary to permanent
  compatibility branches when no shipped-save promise requires migration.
- Reject unsupported saved calibration/topology versions explicitly at the app
  composition/load boundary in a later bootstrap step; storage only preserves
  facts.
- Keep money, contracts, registrations, players, and clubs under existing
  canonical owners.
- Add junior-readable TSDoc to every new exported type and helper.

## What NOT To Implement

- No first/second-division generation, new club/player, calendar,
  promotion/relegation, Market, rating, valuation, wage, budget, AI, or web
  behavior.
- No duplicate `currentDivision` fact when membership already owns it.
- No unordered object iteration for simulation order.
- No silent partial migration, automatic tuning substitution, or compatibility
  path without an active test.
- No cup or continental competition abstraction.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/competition-world.test.ts \
  packages/domain/src/entities/competition.entity.test.ts \
  packages/domain/src/state/game-state.test.ts \
  packages/domain/src/state/career-world.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/sqlite/world-state-mapper.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Career state represents multiple ordered domestic competitions with one
  membership truth.
- Invalid duplicate/missing membership fails at construction and load.
- JSON and SQLite/OPFS preserve registry, membership, history, and every
  required `GameMeta` version losslessly, with no duplicate version owner.
- The migration/reset and unsupported-version policies are explicit and leave
  no dead compatibility branch.
- No generated world or gameplay behavior changed.
