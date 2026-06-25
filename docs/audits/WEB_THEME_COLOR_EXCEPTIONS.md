# Web Theme Color Exceptions

Date: 2026-06-24
Phase: `60-web-theme-palette-and-user-color-preferences`
Step: `06-hardcoded-color-cleanup-and-non-theme-exceptions`

## Goal

Document the visible colors that intentionally stay outside the user palette
system. These exceptions are not dead styling: they carry football meaning,
semantic meaning, or pitch readability.

## Themeable Colors Now Routed Through Palette Variables

- App background and body overlay accents use `--tls-theme-app-background` and
  `--tls-theme-shell-overlay`.
- Panel, scoreboard, border, focus, text, muted text, button, and primary-action
  surfaces use the Phase 60 theme contract.
- Non-semantic gold-like UI accents now use `--tls-theme-accent` or
  `--tls-theme-accent-strong` in:
  - main menu buttons;
  - career shell navigation hover;
  - dashboard command-center accents;
  - Inbox/Posta message borders and actions;
  - match-preparation section counts, formation selector, selected squad row
    action, selected tactic card, save panel, and player-detail accent wash.

## Intentional Non-Theme Exceptions

### Tactical Pitch Grass And SVG

- `apps/web/src/features/tactics-board/components/TacticalBoardPitchMarkings.tsx`
  keeps the approved pitch stripes:
  - `#6b834c`;
  - `#637a44`.
- `apps/web/src/assets/campo-calcio.svg` keeps the same pitch stripe colors.
- These colors are football surfaces, not UI chrome. They should only change in
  a future pitch-art step, not when the user selects a UI palette.

### Pitch Markings

- Pitch markings continue to use field-specific light line colors for
  readability over the tactical board.
- Markings should not inherit palette accents because a navy, burgundy, or
  violet UI theme must not make the football field look artificial.

### Role Suitability

- Suitability remains stable:
  - natural: green;
  - accomplished: light green;
  - competent: gold;
  - unconvincing: orange;
  - makeshift: red.
- These colors are part of player-role evaluation. If they changed by theme, the
  user would lose consistent meaning across saves and screenshots.

### Fitness And Form

- Form arrows remain stable:
  - up: green;
  - flat: neutral/muted;
  - down: red.
- Form is a gameplay signal and must not become decorative.

### Blockers And Severity

- Readiness blockers, danger states, missing lineup/tactic states, and action
  required severity keep the red semantic family.
- Ready/positive states keep green semantic cues.
- These colors are accessibility and gameplay signals. They may be refined as
  semantic tokens later, but they are not palette colors.

### Football Mini-Surfaces

- The bench mini-board keeps a green football-surface treatment. It represents a
  football selection area rather than generic chrome.
- Its non-semantic counts and focus accents do respond to the palette.

## Remaining Hardcoded Colors

Remaining hardcoded color values in web CSS should fall into one of these
categories:

- stable pitch or pitch-like football surfaces;
- role suitability or form/severity semantics;
- opacity overlays tied to depth and readability;
- SVG-internal field drawing colors.

Future cleanup should not chase the raw number of hardcoded values. It should
only move a color when doing so improves user-facing consistency without
weakening football readability or semantic clarity.
