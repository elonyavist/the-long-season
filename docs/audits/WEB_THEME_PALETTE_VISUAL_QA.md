# Web Theme Palette Visual QA

Date: 2026-06-24
Phase: `60-web-theme-palette-and-user-color-preferences`
Step: `07-contrast-visual-qa-and-accessibility`

## Command

```sh
nvm use 24
node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts
```

## Coverage

The browser QA script cycles through all nine supported palettes:

- `classic-green`;
- `nocturne-navy`;
- `dugout-navy`;
- `heritage-cream`;
- `azzurri-office`;
- `violet-director`;
- `programme-ivory`;
- `clubhouse-sage`;
- `touchline-stone`.

For every palette it captures desktop and narrow screenshots for:

- app entry and settings;
- career dashboard;
- match preparation after `Auto` fills the XI and bench.

Screenshot output directory:

```text
/tmp/the-long-season-phase60
```

## Automated Assertions

- `data-theme-palette` is applied to the document root after each palette
  selection.
- Desktop and narrow viewports have no horizontal overflow.
- Dashboard navigation and primary actions remain visible.
- Match preparation remains reachable and renderable.
- Tactical pitch grass stays stable with `#6b834c` and `#637a44`.
- Semantic red and green variables stay stable:
  - `--tls-color-red: #c35f43`;
  - `--tls-color-green: #6aae75`.

## Accessibility Findings

- Palette picker uses radio inputs inside a fieldset, so keyboard and screen
  reader users get one coherent setting group.
- The setting label and every palette name are localized through i18n.
- Focus rings remain visible because they use the palette accent with a stable
  ring shape rather than color alone.
- The selected palette is not communicated only by color: the checked radio
  state remains present.

## Visual Findings

- The nine palettes preserve the retro football-manager tone without changing
  the tactical field.
- Panel, table, navigation, button, and non-semantic accent colors respond to
  the selected palette.
- Pitch, suitability, form, and blocker/severity colors remain recognizable.

## Residual Risks

- This QA verifies representative screens, not every future section. New web
  sections should inherit the token contract and add their own screenshot
  coverage.
- The picker is currently exposed on the app-entry settings area only. A later
  durable settings phase may expose the same preference inside the career shell.
