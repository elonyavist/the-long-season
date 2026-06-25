# 04 - CSS Variable Theme Application

## Goal

Apply the selected theme palette through CSS variables while preserving semantic
and football-surface colors.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- relevant focused tests, if needed
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Put the selected palette id on a stable root attribute such as
  `data-theme-palette`.
- Refactor themeable UI colors to use palette variables.
- Keep semantic variables separate and stable.
- Keep pitch variables separate and stable.
- Ensure existing screens still render if no palette attribute is present.

## What NOT To Implement

- Do not change layout or component hierarchy.
- Do not theme tactical pitch grass, `campo-calcio.svg`, suitability borders,
  fitness arrows, blocker severity, or success/error semantics.
- Do not add duplicate palette application paths.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm check
git diff --check
```

## Definition Of Done

- Themeable chrome responds to the selected palette.
- Non-themeable football/semantic colors are unchanged.
- The app still builds and tests cleanly.

