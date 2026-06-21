# 03 - Career Save Adapter

## Goal

Persist and reload `CareerState` through the storage boundary.

This step makes career state durable without changing game simulation behavior.

## What to implement

- A storage adapter for career saves using the existing JSON-storage style.
- Save and load operations for a full `CareerState` snapshot.
- Deterministic JSON output where the project already enforces stable serialization.
- Tests proving:
  - a career state can be saved and loaded unchanged;
  - missing saves produce an explicit failure;
  - malformed saves fail clearly;
  - the adapter does not mutate the input object.
- TSDoc/JSDoc comments on new exported storage functions and types.

## What NOT to implement

- Do not add CLI commands.
- Do not add migration tooling beyond a version field validation if required.
- Do not apply transfers.
- Do not add multiple-save UI behavior.
- Do not introduce database storage.
- Do not add compression or encryption.
- Do not add market, lineup, tactic, or simulation behavior.

## Expected files

- `packages/storage/src/career-storage.ts`
- `packages/storage/src/career-storage.test.ts`
- `packages/storage/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/storage run typecheck`
- focused storage tests for career saves
- `pnpm check`
- `rg -n "from .*(engine|content|cli|i18n)" packages/storage/src`

## Definition of Done

- Career state can be saved and reloaded through the storage package.
- Storage remains independent from engine, content, CLI, and i18n.
- Tests prove round-trip behavior and clear failure behavior.
- `docs/PROJECT_STATUS.md` records the persistence adapter decision.

