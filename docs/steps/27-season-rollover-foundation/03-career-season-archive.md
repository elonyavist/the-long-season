# Step 03 - Career Season Archive

## Goal

Persist a compact completed-season archive inside career state.

## Context

Ten-season reports need historical results without recomputing everything from old transient output. The archive should be compact and language-agnostic.

## Expected files

- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/storage/src/career-storage.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a compact season archive shape to `CareerState`.
- Store season ID, competition ID, final table snapshot, champion, selected-club finish, and aggregate goals.
- Keep archived data structured, not rendered text.
- Ensure storage round-trips archives.
- Keep old saves without archives valid.

## What NOT to implement

- Do not store full rendered reports in the save.
- Do not implement multi-division history yet.
- Do not implement UI.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm exec vitest run packages/domain/src/state/career-state.test.ts packages/storage/src/career-storage.test.ts`
- `pnpm check`

## Definition of Done

- Completed-season history has a durable structured home.
- Existing saves remain compatible.

