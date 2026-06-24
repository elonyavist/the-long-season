# Web Styling System Review

Date: 2026-06-24
Phase: `55-web-architecture-state-and-styling-foundation`
Step: `06-tailwind-foundation-and-css-reduction`

## Decision

Tailwind is now wired as the utility layer for common browser styling, while
the retro-football identity remains in project CSS.

This is intentionally not a full CSS rewrite. The current UI has bespoke
football-manager surfaces, pitch geometry, fixed tactical tables, shell chrome,
and retro textures that are clearer as named CSS than as long utility strings.

## Changed

- Added `apps/web/src/styles/index.css` as the single CSS entry imported by
  `main.tsx`.
- Kept Tailwind first in that CSS entry, followed by project tokens, base
  rules, layout rules, and component rules.
- Converted the app-entry/main-menu generic layout from custom classes to
  Tailwind utilities:
  - full-screen centered grid;
  - responsive padding;
  - simple entry grid;
  - simple action spacing;
  - unavailable-message margin, color, and text size.
- Removed the now-unused entry layout classes from `layout.css` and
  `components.css`.

## CSS That Stays Custom

- `tokens.css`
  Owns the retro palette, typography, shadows, borders, and surfaces. These are
  product identity tokens and should stay explicit.
- `base.css`
  Owns document-wide rules, focus ring, controls, and page texture.
- `layout.css`
  Owns complex shell layout, left Inbox/Posta rail placement, career header,
  responsive shell behavior, and panel sizing.
- `components.css`
  Owns bespoke football UI components: menu button skin, dashboard panels,
  Inbox/Posta cards, tactical pitch, slot cards, squad table, bench selector,
  tactic selector, and save-readiness surfaces.

## Guardrails

- Use Tailwind for obvious spacing, grid, flex, sizing, and one-off utility
  facts when it makes the JSX easier to read.
- Keep named CSS for the tactical pitch, fixed table behavior, retro skins,
  complex responsive shell rules, and any selector that carries football UI
  meaning.
- Do not replace readable CSS with very long utility strings.
- Do not introduce another styling library or component kit.

## Result

The web app now has Tailwind available in real UI code, but the premium retro
football identity remains centralized and understandable.
