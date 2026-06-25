# 05 - Settings Palette Picker UI

## Goal

Let the user choose the palette from settings without making the app feel like a
generic theme demo.

## Expected Files

- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/career-shell/CareerShell.tsx` if settings are exposed
  inside career shell
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- relevant web tests
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add localized palette names and one compact setting label.
- Render swatches for the nine palettes.
- Use accessible radio/segmented-control behavior.
- Show the current selected palette clearly.
- Apply changes immediately.
- Keep the UI compact and manager-game appropriate.

## What NOT To Implement

- Do not add large marketing descriptions for palettes.
- Do not add images, previews, or decorative cards unless needed for clarity.
- Do not hardcode visible palette labels outside i18n.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- The user can select all nine palettes.
- Palette labels are localized.
- The picker is keyboard reachable and screen-reader understandable.
