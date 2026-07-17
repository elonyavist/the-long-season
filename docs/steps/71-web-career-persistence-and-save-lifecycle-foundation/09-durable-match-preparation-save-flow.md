# 09 - Durable Match Preparation Save Flow

## Goal

Persist the manager's XI, bench, formation, tactical-board positions, and tactic
through the existing match-preparation command.

## Scope

- Adapt the shared tactical-board draft to the domain-owned durable match
  preparation contract.
- Load preparation from `CareerState` when opening or reloading the workspace.
- Keep unsaved editing in Zustand, but commit only through the explicit
  preparation action.
- Persist the career before opening pre-match.
- Preserve XI/bench mutual exclusivity and all current validation.
- Replace `match-preparation-demo` production ownership with a loaded-career
  adapter and delete obsolete code after its final caller moves.
- Delete the demo owner only in the same change that migrates its final
  match-preparation callers; Step 08 intentionally kept it active to avoid a
  broken intermediate path.
- Prove save/load equality for formation, slots, coordinates, roles, XI,
  substitutes, and tactic.

## What NOT to implement

- No auto-save on every drag or selection.
- No duplicated tactical validation in storage or runtime.
- No UI-only tactical payload in the save.
- No tactical-board visual rework.
- No new tactic controls.

## Expected files

- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/career-storage.test.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/10-durable-matchday-checkpoints-and-full-time-commit.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/runtime apps/web/src/features/match-preparation apps/web/src/stores/career-ui-store.test.ts packages/domain/src/state/career-state.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/domain run typecheck
pnpm --filter @game/storage run typecheck
pnpm exec vitest run packages/storage/src
pnpm depcruise
git diff --check
```

## Visual check for the user

Prepare a team, save, refresh at pre-match, and reopen preparation.

Acceptance:

- the same XI, bench, roles, coordinates, formation, and tactic return;
- no player duplicates appear;
- unsaved edits are not falsely presented as saved;
- the tactical board remains visually unchanged.

## Definition of Done

- Preparation is durable career state.
- Refresh restores the exact saved preparation.
- The production match-preparation demo owner is removed when unused.
- No visual or validation regression is introduced.
