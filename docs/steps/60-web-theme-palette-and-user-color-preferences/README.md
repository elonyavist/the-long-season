# Phase 60 - Web Theme Palette And User Color Preferences

## Goal

Let the user choose the visual color tone of the web game without breaking the
premium retro football-manager identity.

This phase creates a controlled theme-palette system for UI chrome, panels,
navigation, buttons, alerts, tables, cards, and accents. It intentionally keeps
football surfaces whose meaning depends on realism out of the preference system:
the tactical pitch grass, pitch markings, role-suitability colors, fitness
arrows, blocker severity colors, and semantic status colors must not become
arbitrary user theme colors.

The target is not a generic "skins" feature. The palettes should feel like
variants of a classic football-management game: readable, grounded, mature,
not too dark, and not decorative for its own sake.

## Product Decisions

- The theme preference is a user display preference, not gameplay state.
- The default theme remains the current retro green clubhouse identity.
- At least six manager-game palettes are supported:
  1. `classic-green` - current green clubhouse baseline;
  2. `nocturne-navy` - premium nocturne navy plus gold;
  3. `dugout-navy` - restrained blue dugout tone, not near-black;
  4. `heritage-cream` - light archive/programme cream and gold;
  5. `azzurri-office` - lighter blue/teal Italian football-office tone;
  6. `violet-director` - muted violet executive tone, not purple gradient;
  7. `programme-ivory` - brighter fixture-programme paper tone;
  8. `clubhouse-sage` - light clubhouse green/sage tone;
  9. `touchline-stone` - light neutral touchline stone tone.
- The tactical pitch grass and `apps/web/src/assets/campo-calcio.svg` are not
  user-themable.
- Suitability borders, alert danger colors, success colors, and fitness arrows
  remain semantic and stable.
- The UI exposes a compact palette picker with swatches and localized names.
- The selected palette must apply immediately and remain readable on desktop
  and narrow layouts.
- If persistence is not yet real-save backed, the browser/Zustand preference is
  enough for this phase.

## Ordered Steps

1. `01-current-color-token-and-hardcoded-audit.md`
2. `02-theme-palette-contract-and-boundaries.md`
3. `03-theme-preference-state-and-read-model.md`
4. `04-css-variable-theme-application.md`
5. `05-settings-palette-picker-ui.md`
6. `06-hardcoded-color-cleanup-and-non-theme-exceptions.md`
7. `07-contrast-visual-qa-and-accessibility.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not implement Inbox/Posta Decision Center.
- Do not implement market, squad, youth, finance, staff, calendar, or matchday
  features.
- Do not make the tactical pitch grass user-themable.
- Do not theme role-suitability colors.
- Do not theme blocker/severity semantics into arbitrary colors.
- Do not add image backgrounds, gradients, blobs, or decorative skins.
- Do not introduce one-off CSS variables outside the documented theme contract.
- Do not create color palettes that fail readable contrast in normal text,
  buttons, tables, or navigation.
- Do not store color preference in career save state unless a later persistence
  phase explicitly moves browser preferences to durable settings.

## Definition Of Done

- The project has one documented web theme-palette contract.
- Six football-manager-friendly palettes are available.
- The user can choose a palette from settings/main-menu reachable UI.
- The palette affects app chrome, panels, navigation, tables, buttons, and
  non-semantic accents.
- The tactical pitch, pitch SVG, suitability borders, fitness arrows, and
  blocker semantics remain stable.
- No visible UI labels are hardcoded outside i18n.
- Desktop and narrow Playwright screenshots prove each palette is readable and
  free from layout regressions.
- The final report recommends exactly one next phase.
