# Web Theme Palette Report

Date: 2026-06-24
Phase: `60-web-theme-palette-and-user-color-preferences`
Step: `08-phase-report-and-next-phase-decision`

## Summary

Phase 60 adds a bounded user color-preference system for the web app. It gives
the manager nine football-manager-friendly UI palettes while preserving the
visual rules that should not become user skins: the tactical pitch, semantic
status colors, role suitability colors, and form arrows.

The result is not a generic theme marketplace. It is a controlled display
preference for the app chrome, panels, tables, buttons, navigation, focus
surface, and non-semantic accents.

## Implemented Contract

- `apps/web/src/app/theme-palettes.ts` owns the web palette catalog.
- `classic-green` is the deterministic default and fallback.
- Palette ids are stable strings, not localized labels.
- Palette options expose localized label keys and swatches.
- The palette variable contract is intentionally small and limited to UI
  chrome.
- Pitch colors, semantic colors, suitability colors, and form colors are not
  part of the palette contract.

Supported palettes:

- `classic-green`;
- `nocturne-navy`;
- `dugout-navy`;
- `heritage-cream`;
- `azzurri-office`;
- `violet-director`;
- `programme-ivory`;
- `clubhouse-sage`;
- `touchline-stone`.

## Preference State

`apps/web/src/app/preferences.ts` now stores `themePaletteId` alongside language
and currency. Invalid raw ids resolve to the default palette, so future persisted
settings can be safely migrated without crashing the first screen.

The Zustand career UI store exposes `setThemePaletteId`, but it remains a web
display preference only. It does not touch career saves, match engine state,
economics, or football decisions.

## CSS Variable Application

`apps/web/src/app/App.tsx` applies the selected palette to
`document.documentElement.dataset.themePalette`.

`apps/web/src/styles/tokens.css` defines the nine palette blocks and maps the
existing retro-football visual foundation through theme variables. Existing CSS
keeps calling the familiar application tokens where useful, but those tokens now
route through the selected palette for themeable app chrome.

Themeable examples:

- app background;
- shell overlay;
- panels and cards;
- table rows;
- borders and dividers;
- non-semantic accent text;
- buttons;
- focus surface.

## Settings Picker

`apps/web/src/features/app-entry/AppEntryScreen.tsx` now renders a compact
localized radio picker in the app-entry settings area. Each option shows a
swatch and a translated palette name.

The picker is accessible by default because it uses a fieldset, labels, radio
inputs, and checked state. The selected palette is not communicated by color
alone.

## Non-Themeable Boundaries

`docs/audits/WEB_THEME_COLOR_EXCEPTIONS.md` records the stable exceptions:

- tactical pitch grass and markings;
- `campo-calcio.svg`;
- role-suitability colors;
- form arrows;
- semantic blocker/severity colors;
- bench football mini-surface colors.

These boundaries are deliberate. The user can change the office/managerial
tone, but football-state readability must stay stable.

## Hardcoded Color Cleanup

Themeable gold/accent usages in web chrome were routed through palette variables
where they represented visual identity rather than game state. Stable colors
were left in place only when they communicate football or semantic meaning.

This keeps future sections from copying old hardcoded accents while avoiding a
large visual rewrite.

## Visual And Accessibility Evidence

`apps/web/src/visual-qa/theme-palette.spec.ts` verifies all nine palettes across
desktop and narrow viewports for:

- app entry/settings;
- career dashboard;
- match preparation after automatic XI and bench filling.

The QA also checks:

- selected palette is applied to the document root;
- no horizontal overflow on tested screens;
- semantic red/green remain stable;
- tactical pitch grass remains stable.

Screenshot output:

```text
/tmp/the-long-season-phase60
```

`docs/audits/WEB_THEME_PALETTE_VISUAL_QA.md` records the command, screenshots,
assertions, accessibility findings, visual findings, and residual risks.

## Roadmap Section Review

### Dependency Review

The feature is correctly owned by `apps/web`. It is a browser display
preference, not a domain, engine, content, storage, or `@game/ui` rule.

`@game/i18n` owns the visible labels. `@game/ui` does not need to know about
palette ids because the palette is not a football read model.

### Code Quality Review

The palette contract is small and typed. The CSS variable layer prevents each
screen from needing its own palette logic. The app-entry picker is localized and
tested without creating a broad settings framework before one is needed.

The remaining CSS is still broad in `components.css`, but Phase 60 did not make
that worse. Future section work should continue extracting components when two
real screens share behavior.

### Architecture Review

The design is open to new palettes by adding one catalog entry and one CSS
override block, but closed against accidental football-state theming because
pitch, semantic, suitability, and form colors are documented exceptions.

This is the right level of abstraction for the current app: one catalog, one
preference value, one CSS variable boundary, and one visual QA script.

### UI/UX Review

The setting is available on the first screen where the user already expects
language and currency preferences. It does not interrupt the career loop.

The palettes change enough to make the UI feel personal while keeping the
managerial retro-football tone. They avoid turning the app into a decorative
skin system.

### Fun Review

This phase does not add gameplay decisions, but it supports long-session
comfort and player ownership of the experience. That matters before the game
adds more screens the user will revisit constantly.

The fun boundary is preserved: color choice should make the game feel more
personal, not make tactical or status information harder to read.

### Improvement Decision

No further work is needed inside Phase 60 before moving on. The palette set now
includes darker, mid-tone, and lighter manager-game options; the next meaningful
UX gain is making Inbox/Posta the structured decision center for career stops.

## Residual Risks

- The palette picker is currently only on the app-entry settings area. A later
  durable settings phase should expose the same preference from inside the
  career shell.
- Visual QA covers representative screens, not every future section. New web
  sections should inherit the palette variables and add their own screenshots.
- Browser persistence for preferences remains future scope; the current state
  is still an in-memory prototype.

## Next Phase Recommendation

Recommended next phase:

`Phase 61 - Inbox/Posta Decision Center`

Reason:

The visual palette foundation is now bounded. The strongest next step for user
fun and career flow is to make the left Inbox/Posta rail into the actual place
where advancement stops are explained and resolved.
