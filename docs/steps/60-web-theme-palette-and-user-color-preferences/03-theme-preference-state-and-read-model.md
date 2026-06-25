# 03 - Theme Preference State And Read Model

## Goal

Add the selected theme palette to the existing web preference state without
creating a new app-wide state system.

## Expected Files

- `apps/web/src/app/preferences.ts`
- `apps/web/src/features/app-entry/app-entry-view-model.ts`
- `apps/web/src/stores/career-ui-store.ts`
- relevant focused tests
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Extend the existing web display preferences with a `themePaletteId`.
- Default to `classic-green`.
- Expose palette options through the app-entry/settings view model.
- Add store actions to update the selected palette.
- Keep the preference browser-local/in-memory for now, consistent with current
  prototype preferences.
- Make invalid theme ids fall back to `classic-green`.

## What NOT To Implement

- Do not persist the theme into career saves.
- Do not add localStorage unless the existing preference pattern already uses
  it.
- Do not make the theme affect gameplay state or engine inputs.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- app-entry-view-model.test.ts career-ui-store.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Theme choice is part of web display preferences.
- The app-entry/settings read model can render the available palettes.
- Invalid ids are safe and deterministic.

