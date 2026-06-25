# Step 03 - Palette Reduction And Preference Migration

## Goal

Replace the nine weak palette options with a smaller set of coherent
football-manager skins and keep old saved preferences deterministic.

## Expected files

- `apps/web/src/app/theme-palettes.ts`
- `apps/web/src/app/theme-palettes.test.ts`
- `apps/web/src/app/preferences.ts`
- `apps/web/src/app/preferences.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

- Reduce or replace the public skin ids using the target list from Step 01.
- Prefer five or six strong skins over nine weak options.
- Add deterministic migration/fallback for removed ids:
  - old `classic-green` should map to the new default;
  - removed decorative ids should map to the closest accepted skin;
  - unknown ids should map to the default.
- Update preference tests and store tests.
- Add localized labels for the accepted skins in Italian, English, German,
  Spanish, and French.
- Remove i18n keys for old ids only when no code references them.

## What NOT to implement

- Do not preserve weak skins for compatibility if fallback can handle old ids.
- Do not change gameplay or career save state.
- Do not touch `apps/web/src/assets/campo-calcio.svg`.
- Do not add unlocalized visible labels.

## Required checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- theme-palettes.test.ts preferences.test.ts career-ui-store.test.ts
pnpm --filter @game/i18n run test -- labels.test.ts
git diff --check
```

## Definition of Done

- Only accepted skins are exposed to the user.
- Removed ids have deterministic fallback.
- All skin labels are localized.
- No old visible palette option remains in the settings picker data.

