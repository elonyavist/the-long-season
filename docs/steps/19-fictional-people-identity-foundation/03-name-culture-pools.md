# 03 - Name Culture Pools

## Goal

Create deterministic fictional name pools for the main cultures needed by generated football content.

Name pools are content, not localization. They should let generated squads feel credible while avoiding real-player databases.

## What to implement

- Content-owned name culture pools for at least:
  - Italian;
  - English;
  - Spanish;
  - German;
  - French;
  - Portuguese/Brazilian;
  - Argentinian/Spanish American;
  - Dutch;
  - Balkan;
  - West African;
  - Central/Eastern European.
- A small content helper to retrieve a deterministic pool by name culture key.
- Tests that:
  - every supported name culture has first and last names;
  - pools are non-empty;
  - names are fictional content entries, not localized labels;
  - no pool lookup depends on object iteration order.
- TSDoc/JSDoc comments on exported content helpers.

## What NOT to implement

- Do not assign nationalities to players yet.
- Do not generate player identities yet.
- Do not add real-world player or staff names.
- Do not add staff gameplay.
- Do not add localization labels for names.
- Do not add UI.

## Expected files

- `packages/content/src/identity/name-cultures.ts`
- `packages/content/src/identity/name-cultures.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused content name-culture tests
- `pnpm check`
- `rg -n "from .*(engine|storage|cli|i18n)" packages/content/src`

## Definition of Done

- Name culture pools exist in the content package.
- Names are deterministic content data, not localization keys.
- The first pool set is broad enough for third, second, and first division identity variety.
- Content package boundaries remain clean.
- `docs/PROJECT_STATUS.md` records the adopted pool scope.
