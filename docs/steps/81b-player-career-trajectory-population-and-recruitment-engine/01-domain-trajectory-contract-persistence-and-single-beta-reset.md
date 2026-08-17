# Step 01 - Domain Trajectory Contract, Persistence And Single Beta Reset

## Status

Not started.

## Goal

Replace the ambiguous persisted player potential with the final latent
trajectory contract, round-trip it through JSON/SQLite, and take exactly one
explicit beta reset for the whole phase.

## What To Implement

- Run `graphify update .` and `graphify affected` for `Player`,
  `createPlayer(...)` and storage mappers before edits; reconcile the affected
  set with Expected Files.
- Add one canonical `PlayerAbilityFamily` vocabulary/traversal in domain.
- Add final stable trajectory types with total typed mappings and exhaustive
  validation.
- Replace `Player.potential`; do not leave a deprecated alias.
- Decide and test the invariant between current and latent prime. Do not assume
  `latent >= current` merely because old potential required it.
- Update `createPlayer(...)` and every production construction root to require
  final truth.
- Advance career-state, career-envelope, SQLite and stamped player-model
  versions together.
- Replace SQLite `potential` scope with the final latent scope. Persist compact
  maturation/longevity/profile and career-damage facts once.
- Update JSON and SQLite round-trip and cross-storage equivalence.
- Delete incompatible beta saves through canonical runtime/storage behavior and
  create a fresh career. Test explicit rejection/reset.
- Remove old domain helpers/exports when the last caller is migrated; if later
  steps still need temporary compile-time adaptation, keep it inside their
  Expected Files with a named deletion owner and no production fallback.
- Add junior-facing JSDoc explaining why latent truth, reachable path and public
  forecast are distinct.

## What NOT To Implement

- No population distribution, forecast probability, development, AI or UI
  behavior.
- No migration/default/dual reader/writer.
- No second beta reset in later Phase 81B steps.
- No persisted reachable path or public forecast.

## Expected Files

- `packages/domain/src/entities/player.entity.ts`
- `packages/domain/src/entities/player.entity.test.ts`
- `packages/domain/src/player/player-abilities.ts`
- `packages/domain/src/player/player-abilities.test.ts`
- `packages/domain/src/player/create-player.ts`
- `packages/domain/src/player/create-player.test.ts`
- `packages/domain/src/player/index.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/testing/persistable-career-fixture.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- exact `Player` fixture/builders returned by the pre-edit Graphify/compile
  census, added here with their ownership reason before they are edited
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only if production truth changes
  the Step 01 manifest
- this step document and `docs/PROJECT_STATUS.md`

This is the minimum manifest. The final wide `Player` fixture set is generated
from Graphify before editing and reconciled against `git status` before the
step closes. Every added file gets an ownership explanation in this document.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain test
pnpm --filter @game/storage test
pnpm depcruise
pnpm check
git diff --check
```

Also prove:

- JSON -> state and SQLite -> state are equal;
- latent fields survive save/load exactly;
- old schema is rejected/reset, never interpreted;
- exactly one Phase 81B reset/version epoch exists;
- no `Player.potential` production declaration or storage scope remains.

## Definition Of Done

- One persisted latent trajectory Interface exists.
- Storage has no old potential scope or compatibility path.
- Fresh careers round-trip deterministically.
- One beta reset is recorded; later steps are forbidden to change the envelope.
- Step 02 is the only next action.
