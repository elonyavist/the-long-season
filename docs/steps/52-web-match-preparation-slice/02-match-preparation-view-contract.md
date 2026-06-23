# 02 - Match Preparation View Contract

## Goal

Add a framework-free `@game/ui` read model for match preparation.

The contract must describe the preparation screen as structured data and action
state, not React components and not rendered prose.

## Expected files

- `packages/ui/src/career/*`
- `packages/ui/src/index.ts`
- Focused `packages/ui` tests
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define a match-preparation view contract with:
  - selected club context;
  - next fixture context;
  - preparation status;
  - lineup slots;
  - player options for slots;
  - tactic profile options;
  - current selected tactic;
  - save action availability;
  - blocker keys;
  - alert/summary keys.
- Keep labels as i18n keys, not prose.
- Keep IDs and values language-agnostic.
- Include enough state to render:
  - incomplete preparation;
  - complete preparation;
  - invalid/duplicate lineup selection;
  - missing tactic;
  - unavailable action state.
- Add focused tests for complete/incomplete/invalid states.

## What NOT to implement

- Do not import React, browser APIs, engine, content, storage, or i18n into
  `@game/ui`.
- Do not implement player sorting based on hidden recommendations.
- Do not add automatic lineup selection.
- Do not create market/squad-needs hints.
- Do not persist anything.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused `packages/ui` tests for the new contract/builder
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- `@game/ui` exposes a stable match-preparation read model.
- The model can represent the first useful lineup/tactic preparation screen.
- Tests cover blocked, complete, and invalid preparation states.
- No presentation text is hardcoded in the model.
- `docs/PROJECT_STATUS.md` identifies Step 03 as the next action.

