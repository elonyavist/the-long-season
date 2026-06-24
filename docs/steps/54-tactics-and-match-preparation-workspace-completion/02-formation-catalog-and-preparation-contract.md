# 02 - Formation Catalog And Preparation Contract

## Goal

Extend the framework-free match-preparation read model so it can represent
formation selection, formation-specific slots, and substitute bench requirements.

This must happen in `@game/ui` before the web screen adds controls.

## Expected files

- `packages/ui/src/career/*`
- `packages/ui/src/index.ts`
- Focused `packages/ui` tests
- `packages/i18n/src/labels.ts` only if new visible labels are required by the
  contract smoke tests
- Focused i18n tests if labels are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a formation catalog/read-model shape with:
  - formation id;
  - label key;
  - ordered slot list;
  - pitch slot keys;
  - role/position expectations;
  - selected formation id.
- Support at least:
  - `4-4-2`;
  - `4-3-3`;
  - `4-2-3-1`;
  - `4-3-1-2`;
  - `3-5-2`;
  - `3-4-3`;
  - `5-3-2`;
  - `4-1-4-1`.
- Extend blocker/status derivation for:
  - missing formation;
  - missing starting XI slot;
  - duplicate starting XI player;
  - missing bench player;
  - duplicate bench player;
  - player selected in both XI and bench;
  - missing tactic.
- Keep values language-agnostic and label-key based.
- Add tests for:
  - default formation;
  - alternate formation slot count/order;
  - valid XI + bench + tactic;
  - duplicate across XI and bench;
  - missing bench blocks save.

## What NOT to implement

- Do not import React, browser APIs, engine, content, storage, or i18n into
  `@game/ui`.
- Do not implement web controls.
- Do not add automatic lineup or bench selection.
- Do not add hidden tactical recommendations.
- Do not add drag-and-drop.
- Do not add market/squad-needs advice.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused `packages/ui` tests for the formation/preparation contract
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The read model can represent selected formation, XI, bench, tactic, and save
  readiness.
- Tests cover the new blocker and valid states.
- No presentation prose is hardcoded in the model.
- `docs/PROJECT_STATUS.md` identifies Step 03 as the next action.
