# 05 - UI Read Model Derives From Domain Catalog

## Goal

Remove the independent match-preparation formation catalog from `@game/ui` and
derive UI formation facts from the domain catalog.

## Expected Files

- `packages/ui/package.json`
- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `.dependency-cruiser.cjs`
- `docs/PROJECT_RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Decide whether `@game/ui -> @game/domain` is now allowed for read-model
  formation contracts.
- If allowed, update dependency rules and dependency-cruiser explicitly.
- Replace duplicated UI formation arrays with an adapter over domain formations.
- Expose enough read-model state/actions for manager-triggered selection
  helpers: `Auto`, `Fill gaps`, and `Clear`.
- Keep `@game/ui` framework-free and language-agnostic.
- Preserve current match-preparation view behavior for the web adapter.

## What NOT To Implement

- Do not import React, i18n, content, engine, storage, CLI, or web into
  `@game/ui`.
- Do not parse CLI output.
- Do not hardcode rendered role names in UI contracts.
- Do not duplicate the domain formation catalog in `@game/ui`.
- Do not put automatic-selection scoring rules only in React components.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/ui run typecheck
pnpm exec vitest run packages/ui/src/career/career-match-preparation-view.test.ts
pnpm depcruise
pnpm check
git diff --check
```

## Definition Of Done

- `@game/ui` no longer owns a drifting formation catalog.
- Package dependency rules explicitly document the chosen boundary.
- Tests prove UI selected slots match domain formation facts.
- Tests prove helper actions remain explicit manager actions and preserve
  manager-selected players when using `Fill gaps`.
- No framework or localization dependency enters `@game/ui`.
