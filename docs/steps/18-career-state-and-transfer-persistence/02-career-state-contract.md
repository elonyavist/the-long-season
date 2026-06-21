# 02 - Career State Contract

## Goal

Add the minimal domain contract for a durable career state.

The contract must represent the current playable career snapshot without introducing full economy, transfer-window, contract, or save-management systems.

## What to implement

- A domain career-state model that can hold:
  - a stable career/save identifier;
  - the selected club;
  - the current game snapshot needed to continue simulation;
  - transfer funds for clubs involved in the MVP market flow;
  - permanent-transfer history entries;
  - a schema/version field for future migrations.
- Domain helpers or constructors that validate:
  - non-empty stable identifiers;
  - selected club exists in the current game snapshot;
  - transfer funds are finite, non-negative integer-like money values;
  - transfer history entries reference existing clubs and players.
- Focused tests for valid and invalid career states.
- TSDoc/JSDoc comments on new exported types and helpers.

## What NOT to implement

- Do not implement storage.
- Do not implement CLI commands.
- Do not apply transfers.
- Do not add loans.
- Do not add contracts, wages, installments, player exchanges, or sell-on clauses.
- Do not add transfer windows or registration rules.
- Do not add AI market logic.
- Do not add UI.
- Do not make market decisions automatic.

## Expected files

- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- focused domain tests for career state
- `pnpm check`
- `rg -n "from .*(engine|storage|content|cli|i18n)" packages/domain/src`

## Definition of Done

- Career state exists in the domain layer.
- The contract is small, deterministic, and documented.
- Invalid career state input is rejected by focused tests.
- Domain package boundaries remain clean.
- `docs/PROJECT_STATUS.md` records the adopted career-state shape.

