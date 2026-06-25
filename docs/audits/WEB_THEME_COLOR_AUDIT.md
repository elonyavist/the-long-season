# Web Theme Color Audit

Date: 2026-06-24
Phase: `60-web-theme-palette-and-user-color-preferences`
Step: `01-current-color-token-and-hardcoded-audit`

## Goal

Record the current web color ownership before adding user-selectable UI
palettes. This audit separates colors that may become themeable from colors that
must stay stable because they communicate football meaning or semantic state.

## Current Color Owners

### `apps/web/src/styles/tokens.css`

- Owns the current retro-green baseline:
  - app background: `--tls-color-ink`;
  - panel surfaces: `--tls-color-office`, `--tls-color-clubhouse`,
    `--tls-color-scoreboard`, `--tls-color-scoreboard-dark`;
  - text and lines: `--tls-color-paper`, `--tls-color-paper-muted`,
    `--tls-color-text`, `--tls-color-text-muted`, `--tls-color-line`,
    `--tls-color-line-soft`, `--tls-color-line-strong`;
  - accent: `--tls-color-gold`, `--tls-color-gold-dark`,
    `--tls-color-club-accent`;
  - semantic/support colors: `--tls-color-red`, `--tls-color-green`,
    `--tls-color-blue`;
  - football pitch surface: `--tls-color-pitch`, `--tls-color-pitch-dark`,
    `--tls-surface-pitch`.
- The file also owns reusable surface gradients, borders, shadows, focus rings,
  fonts, spacing, and radii.

### `apps/web/src/styles/base.css`

- Uses app background and text colors for the global document.
- Contains hardcoded decorative overlay colors in the body background:
  `rgba(209, 161, 58, ...)`, `rgba(240, 227, 189, ...)`, and
  `rgba(106, 174, 117, ...)`.
- These overlays are themeable UI chrome because they are part of the app shell
  mood, not gameplay state.

### `apps/web/src/styles/layout.css`

- Uses current baseline colors for shell panels, crest, navigation, context
  facts, and preference controls.
- Themeable groups:
  - shell header and panel surfaces;
  - menu/nav borders;
  - selected-club accent;
  - preference labels and controls.
- Non-themeable detail:
  - the crest still references pitch color as a football brand motif. It can use
    stable football color or a later club-identity color, but should not become a
    user theme control in this phase.

### `apps/web/src/styles/components.css`

- Contains the largest color surface:
  - menu buttons;
  - tactical board wrapper and active zones;
  - player tokens;
  - bench board;
  - squad tables;
  - player detail panels;
  - dashboard cards;
  - Inbox/Posta panel;
  - match-preparation panels and blockers.
- Themeable groups:
  - app panels and cards;
  - table header/rows;
  - non-semantic button surfaces;
  - non-semantic gold accent usage in headings, counts, selected navigation, and
    control borders;
  - generic muted-line overlays.
- Non-themeable groups:
  - tactical pitch wrapper and field SVG colors;
  - role-suitability colors;
  - form arrows;
  - warning/blocker/severity colors;
  - semantic success/error states.

### Tactical Board SVG/React Markings

- `apps/web/src/features/tactics-board/components/TacticalBoardPitchMarkings.tsx`
  hardcodes the approved pitch stripe colors:
  - `#6b834c`;
  - `#637a44`.
- `apps/web/src/assets/campo-calcio.svg` uses the same approved stripe colors.
- These are football-surface colors and must stay outside the user palette
  system. They may be refined by a future pitch-art step, but not by a display
  preference.
- Pitch markings currently use `var(--tls-color-paper-muted)` and the vignette
  uses `var(--tls-color-ink)`. Later theme work must avoid accidentally changing
  pitch readability when changing app text or surface tokens.

## Classification

### Themeable UI Chrome

- App background and non-gameplay shell overlays.
- Panel, raised-panel, table, menu, navigation, and button surfaces.
- Generic UI borders and muted dividers.
- Non-semantic accent color for selected nav, action focus, headings, counts,
  and primary buttons.
- Main text and muted text on app chrome.

### Semantic Colors

Keep stable and do not route through user palettes:

- `--tls-color-red` for blockers, danger, missing readiness, and invalid state.
- `--tls-color-green` for success, positive form, natural suitability, and
  positive readiness.
- Warning/highlight states that communicate attention independently from the
  selected theme.
- Any future error/success/warning role should use semantic variables, not theme
  palette variables.

### Football-Surface Colors

Keep stable and do not route through user palettes:

- Tactical pitch grass and stripe colors in React and SVG.
- `apps/web/src/assets/campo-calcio.svg`.
- Pitch markings when they are tied to field readability rather than app chrome.
- Bench mini-surface may remain football-green in this phase because it visually
  represents a football area, not generic chrome.

### Role Suitability And Fitness Colors

Keep stable and do not route through user palettes:

- suitability border colors:
  - natural: green;
  - accomplished: light green;
  - competent: gold;
  - unconvincing: orange;
  - makeshift: red;
- form arrows:
  - up: green;
  - flat: muted/neutral;
  - down: red.

### One-Off Colors To Remove Or Route

Later steps should reduce these where they are app chrome:

- hardcoded primary-button top color `#e0bd64`;
- repeated gold overlay values such as `rgba(209, 161, 58, ...)`;
- repeated paper overlay values such as `rgba(240, 227, 189, ...)`;
- repeated dark transparent surfaces such as `rgba(8, 15, 17, ...)`;
- panel-specific green overlays that are not pitch or bench surfaces.

## Files That Need Source Changes Later

- `apps/web/src/app/theme-palettes.ts` for the typed palette contract.
- `apps/web/src/app/preferences.ts` for display preference state.
- `apps/web/src/features/app-entry/app-entry-view-model.ts` for settings
  palette options.
- `apps/web/src/stores/career-ui-store.ts` for preference update actions.
- `apps/web/src/app/App.tsx` for a stable `data-theme-palette` root attribute.
- `apps/web/src/features/app-entry/AppEntryScreen.tsx` for the palette picker.
- `packages/i18n/src/labels.ts` for visible palette labels.
- `apps/web/src/styles/tokens.css`, `base.css`, `layout.css`, and
  `components.css` for CSS-variable application and hardcoded UI cleanup.
- `apps/web/src/visual-qa/theme-palette.spec.ts` for browser screenshots and
  non-themeable pitch checks.

## Design Constraint For Later Steps

The palette system must be small and intentionally boring from a data-model
perspective: it should theme UI chrome, not become a generic skin engine. The
football field, player suitability, readiness severity, and fitness meanings
must remain recognizable in every palette.
