# Web Retro Premium Visual Direction

Date: 2026-06-23
Phase: `49-web-app-shell-main-menu-and-career-dashboard-prototype`
Step: `04-retro-premium-visual-foundation`
Status: First visual layer added

## Direction

The web prototype should feel like a premium desktop football manager from the
early 2000s, but with modern readability.

The interface is not a marketing landing page. It should feel like the manager
has opened the club office: dense, tabular, deliberate, and ready for repeated
use.

## Palette

- Deep ink background for app chrome.
- Clubhouse green for primary panels.
- Aged paper for titles, table surfaces, and important text.
- Muted olive borders for retro screen structure.
- Restrained gold for focus, primary emphasis, and selected states.
- Red for blockers/warnings.
- Green for available/positive states.
- Blue as a small secondary signal so the app does not become a single-hue
  green/navy theme.

## Typography

- Dense UI stack: `Trebuchet MS`, `Aptos`, `Segoe UI`, sans-serif.
- Display stack: `Georgia`, `Times New Roman`, serif.
- Monospace stack reserved for compact numeric tables and future stat rows.
- Font sizes use fixed `rem` tokens. No viewport-width scaling is used.
- Letter spacing stays at `0`.

## Density And Chrome

- Panels use small radii, visible borders, and controlled shadows.
- The app background uses CSS texture and line treatment only, not imagery.
- Controls are sized for desktop use but stay readable on narrow viewports.
- Reusable spacing and radius tokens are intentionally small to support future
  table-heavy screens.

## Allowed Visual Assets Now

- CSS tokens.
- CSS-only texture/line treatments.
- Small panel chrome.
- State colors for available, warning, blocker, and emphasis.

## Left For Later Art Phase

- Custom logo treatment.
- Club crests and competition marks.
- Pixel/bitmap font asset.
- Matchday visual modules.
- Full theme pack support.
- Advanced animations or transition system.

## Verification Notes

The current shell remains intentionally simple. Main menu and dashboard screens
will consume this visual layer in later Phase 49 steps.
