# Web Visual Identity System Report

Date: 2026-06-24
Phase: `61-web-visual-identity-system-rework`
Status: Complete

## Why This Phase Was Necessary

Phase 60 made theme preferences technically work, but the result was visually
rejected. The problem was not only individual hex values. The previous system
had too many weak palette options, generic token names, dark-theme assumptions
inside light skins, and screenshot QA that proved stability rather than product
quality.

Phase 61 corrected the foundation before more web sections inherit weak visual
decisions.

## Accepted Skins

The public skin set is now:

- `floodlight-navy`
- `club-office`
- `press-room`

`floodlight-navy` is the default.

## Removed And Migrated Skins

The previous Phase 60 ids are no longer visible options. They remain supported
only as deterministic preference migration inputs:

- `classic-manager-dark` -> `club-office`
- `classic-green` -> `club-office`
- `nocturne-navy` -> `floodlight-navy`
- `dugout-navy` -> `floodlight-navy`
- `heritage-cream` -> `club-office`
- `azzurri-office` -> `club-office`
- `violet-director` -> `press-room`
- `programme-paper` -> `club-office`
- `programme-ivory` -> `club-office`
- `clubhouse-sage` -> `club-office`
- `touchline-stone` -> `press-room`
- `archive-sepia` -> `press-room`

Unknown ids fall back to `floodlight-navy`.

## Token Taxonomy

The skin contract now describes UI responsibilities:

- app background;
- shell surface;
- panel surface;
- elevated panel surface;
- table header surface;
- table row surface;
- table alternate row surface;
- selected row surface;
- border;
- strong border;
- text;
- muted text;
- heading text;
- primary action surface;
- primary action hover;
- primary action text;
- secondary action surface;
- focus ring;
- shell overlay.

Old broad CSS variables still exist only as compatibility aliases where current
component CSS consumes them. They are not the public skin contract.

## Non-Themeable Proof

This phase did not change `apps/web/src/assets/campo-calcio.svg`.

The following remain outside the user skin contract:

- tactical pitch grass and stripe colors;
- tactical pitch markings;
- football-surface foreground text;
- role suitability colors;
- fitness arrows;
- danger, success, and warning semantic colors.

The Playwright visual QA still checks stable tactical grass colors:

- `#6b834c`
- `#637a44`

## Accessibility And Visual QA

Verified:

- i18n typecheck;
- web typecheck;
- web test suite;
- web production build;
- all accepted skin labels translated in Italian, English, German, Spanish, and
  French;
- desktop and narrow screenshots for all accepted skins;
- no horizontal overflow in visual QA;
- stable semantic colors;
- stable tactical pitch grass;
- visible hierarchy between primary action, table header, rows, and selected
  rows.

Screenshot directory:

```text
/tmp/the-long-season-phase61
```

## What Improved

- The default dark skin now reads as a coherent retro football-manager control
  room rather than a generic green dashboard.
- Gold is concentrated on selected navigation, primary actions, counters, and
  focused emphasis.
- Table headers, rows, alternate rows, and selected rows are separated by
  explicit tokens.
- Light skins now use programme/archive surfaces instead of copied dark-theme
  assumptions.
- Field and bench text remain readable across light and dark skins because
  football-surface foreground colors are stable.

## Residual Risks

- Some CSS aliases remain as migration bridges. They should be removed only
  when component CSS no longer consumes them.
- The light skins should be reviewed again once Inbox/Posta and Squad screens
  stress larger message/table surfaces.
- The visual system is now credible enough to continue, but the final product
  will still need club crests, stronger typography choices, and deeper section
  art direction later.

## Next Phase Recommendation

Proceed with exactly one next phase:

`Phase 62 - Inbox/Posta Decision Center`

Reason: the visual foundation is now stable enough. The next valuable product
step is to make career advancement stops feel like real manager decisions in a
left Inbox/Posta rail and central detail flow.
