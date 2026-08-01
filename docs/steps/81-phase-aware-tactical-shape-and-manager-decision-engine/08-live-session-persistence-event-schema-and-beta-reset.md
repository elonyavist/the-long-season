# Step 08 - Live Session, Persistence, Event Schema And Beta Reset

## Status

Not started.

## Goal

Route pre-match, manual, and live team changes through the same tactical seam,
persist the final Phase 81 match/event facts losslessly, and reset incompatible
beta saves once.

## User-Facing Reason

A formation or role change during the match must influence only the football
that follows and must survive refresh without rerolling or changing meaning.

## What To Implement

- Make pre-match preparation, manual schedule, substitutions, formation
  changes, role changes, and tactic changes rebuild the same typed team
  context, intrinsic shape, and policy stamp.
- Preserve the invariant that a confirmed change at completed minute `N`
  affects minute `N + 1`.
- Verify pre-match and live application of the same change produce the same
  structural delta.
- Finalize active-match state, match-report, event route, telemetry, and
  explanation persistence after Steps 02-07.
- Advance the supported beta save/schema/event versions as required and delete
  incompatible saves/databases through the canonical reset flow.
- Add JSON and SQLite/OPFS round-trip, resume, same-seed, no-reroll,
  idempotency, stale-policy rejection, and pre/post-command statistic tests.
- Remove old schema readers, optional legacy defaults, stale event cases, and
  fallback reconstruction.

## Clean-Code Requirements

- One context builder serves every driver and Adapter.
- Derived shape is either recomputed from canonical inputs or cached with an
  explicit validated policy stamp; there is no second career ledger.
- No persistence mapper casts an open string into a tactical or route union.
- Beta reset deletes compatibility code instead of adding migration branches.

## What NOT To Implement

- No AI or UI change.
- No retroactive statistic/event mutation.
- No separate live coefficient path.
- No beta migration, dual schema, or legacy fallback.

## Expected Files

- `packages/domain/src/entities/match.entity.ts`
- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/match-engine/manual-tactic-change.ts`
- `packages/engine/src/match-engine/manual-tactic-change.test.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/match-engine/match-context.test.ts \
  packages/engine/src/match-engine/progressive-match-session.test.ts \
  packages/engine/src/match-engine/manual-tactic-change.test.ts \
  packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts \
  packages/engine/src/match-engine/create-match-report.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts \
  packages/storage/src/career-storage.contract.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Pre-match, manual, and live changes use one tactical builder.
- Minute `N + 1`, same-delta, reload, and deterministic replay invariants pass.
- Final route/event/shape facts round-trip losslessly.
- Incompatible beta saves are explicitly deleted and fresh careers work.
- No migration, legacy reader, duplicate ledger, or fallback reconstruction
  remains.
- Step 09 is the only next action.
