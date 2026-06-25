# Step 06 - Settings Picker Localization And Tests

## Goal

Make the skin picker reflect the final accepted skin system cleanly and
accessibly.

## Expected files

- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.test.tsx`
- `apps/web/src/features/app-entry/app-entry-view-model.ts`
- `apps/web/src/features/app-entry/app-entry-view-model.test.ts`
- `apps/web/src/app/theme-palettes.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

- Render only accepted skins in the picker.
- Keep the picker compact and serious.
- Use swatches that represent the final skin hierarchy, not arbitrary color
  chips.
- Ensure selected state is not communicated only by color.
- Confirm all visible labels come from i18n.
- Update focused rendering and view-model tests.

## What NOT to implement

- Do not add long marketing descriptions for skins.
- Do not add unsupported preview screenshots inside the picker.
- Do not introduce hardcoded labels.
- Do not touch field assets or tactical-board rendering.

## Required checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- AppEntryScreen.test.tsx app-entry-view-model.test.ts
pnpm --filter @game/i18n run test -- labels.test.ts
git diff --check
```

## Definition of Done

- The picker exposes only production-accepted skins.
- The picker is keyboard/screen-reader friendly.
- Labels are localized.
- Tests cover the final skin options.

