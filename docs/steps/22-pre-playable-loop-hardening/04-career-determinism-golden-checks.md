# Step 04 - Career Determinism Golden Checks

## Goal

Add focused deterministic checks for career creation, inspection, and persisted market application before Phase 23 introduces progression.

## Context

Phase 21 manually verified world-seed variation and persisted career metadata. Phase 23 should not rely only on manual smoke commands. It needs focused tests that catch regressions when save-driven progression is added.

## Expected files

- `apps/cli/src/commands/career.test.ts`
- `packages/storage/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add tests proving the same career world seed produces stable career creation/inspection output.
- Add tests proving different world seeds produce different generated career-world summaries where expected.
- Add tests proving an accepted permanent transfer persists across save reload.
- Keep test snapshots or golden values compact and intentional.
- Prefer deterministic assertions over large brittle full-output snapshots.

## What NOT to implement

- Do not change command behavior unless a deterministic bug is found.
- Do not add a career progression command.
- Do not add new market features.
- Do not add broad fixture-output snapshots that will make normal balancing work painful.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/storage run typecheck`
- focused career/storage tests
- `pnpm check`

## Definition of Done

- Career creation and inspection determinism is covered by automated tests.
- Permanent-transfer persistence is covered by automated tests.
- The tests are stable and narrow enough to support future Phase 23 changes.
