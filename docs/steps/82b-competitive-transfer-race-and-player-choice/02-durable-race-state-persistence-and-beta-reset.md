# Step 02 - Durable Race State, Persistence And Beta Reset

## Status

Not started.

## Goal

Make `PlayerTransferRace` a durable coordination aggregate before seller,
raise, or player-choice behaviour depends on it. Reloading a career must never
change who is participating or when the current shared stage clock expires.

## Expected Files

- `packages/domain/src/career/player-transfer-race.ts`
- `packages/domain/src/career/player-transfer-race.test.ts`
- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/career/player-transfer-race.ts`
- `packages/engine/src/career/player-transfer-race.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/steps/82b-competitive-transfer-race-and-player-choice/02-durable-race-state-persistence-and-beta-reset.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add races to canonical `CareerState`; a race stores only player ID,
  discriminated canonical negotiation references, current stage with its
  immutable shared clock, and outcome.
- Creating the first supported approach for a player creates its race. A later
  supported approach joins that race by reference and inherits the current
  club-stage deadline. One-participant and multi-participant deals therefore
  use the same path.
- Count active acquiring clubs, not historical references. Permit at most
  three; when all three places are occupied, reject another join with
  `race_participant_limit_reached`. A participant closed before the deadline
  no longer consumes capacity.
- The race never copies offered fee, contract terms, negotiation status, or
  per-negotiation clocks. A race participant has no second effective clock for
  the coordinated stage.
- Validate the race against referenced negotiations at the `CareerState` seam:
  known IDs, same player, no duplicate reference, no duplicate open race,
  at most three active acquiring clubs, supported negotiation kind, and stage
  clock within the applicable window.
- At this step, validate and persist the existing permanent-negotiation
  reference. Keep the reference discriminant total so Step 06 can add the
  canonical free-agent variant without changing the race shape or permanent
  path. Loan negotiations remain serial under Phase 82A and must not be
  admitted to an open race.
- Persist races losslessly in JSON and SQLite/OPFS with one schema/save-version
  bump. Delete incompatible beta saves through the canonical runtime/storage
  path; do not add a migration, dual reader, optional fallback, or synthetic
  default.
- Round-trip one- and multi-participant races and prove that participant order,
  current stage clock, stage, and outcome do not change.
- Cover one, two, and three active participants, rejection of a fourth, and
  capacity recovery after one canonical participant closes.
- Keep the existing public `ai-market-lifecycle` Interface, but split its
  internals into explicit targeting, scheduling, race-coordination, and
  resolution helpers instead of extending one monolithic function.

## What NOT To Implement

- No seller resolution, raise command, player comparison, UI, or diagnostics.
- No duplicate fee, terms, status, or effective stage clock.
- No second save path and no beta-save compatibility layer.
- No generic event bus, market participant hierarchy, or plugin registry.
- No competitive loan scheduling or resolution.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-transfer-race.test.ts \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/player-transfer-race.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Every permanent approach enters one durable race path from first submission;
  Step 06 extends that same path to free agents.
- Race state is a small coordination aggregate over canonical negotiation
  references, never a duplicate source of business facts.
- Reload preserves participants and the immutable current-stage clock exactly.
- The three-active-club limit and `race_participant_limit_reached` survive
  persistence without counting terminal participants as active.
- Incompatible beta saves are deleted, not migrated.
