# Web UI Full Rebuild Report

Date: 2026-07-06
Phase: `69-web-ui-full-rebuild-around-tactical-board`

## Result

Complete.

Phase 69 reset the first-MVP web UI around the one approved visual anchor: the
shared tactical board. The web app now has a fixed product identity, a cleaner
app entry, a rebuilt career shell, a compact dashboard command centre, a
board-first match-preparation screen, and a more focused matchday path from
pre-match through half-time to full time.

The result is strong enough to resume first-MVP product work, with one important
condition: the web app is still an in-memory prototype. The next phase should
make career state durable before more sections expand the UI.

## What Changed

- Removed the user-facing theme/palette picker and returned to one controlled
  first-MVP visual language.
- Kept the tactical board as the visual and interaction anchor.
- Isolated tactical-board chrome so future app-shell changes do not accidentally
  damage the pitch surface.
- Rebuilt global layout around `AppShell`: left navigation, central content,
  and right Posta/context rail.
- Rebuilt dashboard as a command centre with one dominant next action.
- Rebuilt Posta as a compact attention rail, not a full mail client.
- Rebuilt match preparation around the shared tactical board and fixed bench
  board.
- Added squad/tactic/detail tabs so the preparation screen is dense without
  stacking low-value cards.
- Rebuilt matchday into a focused match centre:
  - pre-match broadcast frame;
  - half-time tactical-board decision workspace;
  - compact full-time result review.
- Removed dead legacy web UI modules and stale tests after the rebuild became
  the direct implementation.
- Added a Phase 69 Playwright QA gate covering desktop and narrow app entry,
  dashboard, match preparation, pre-match, half-time, and full time.

## Intentionally Preserved

- Tactical-board behavior, role model, normalized coordinates, drag zones,
  context menus, suitability coloring, bench board, and pitch SVG surface.
- Existing engine behavior.
- Existing `@game/ui` read-model contracts.
- In-memory demo adapter scope.
- Language and currency display preferences.

## Removed

- Rejected theme-palette module, labels, tests, and visual QA.
- Legacy `features/career-shell` bridge and compact Inbox panel.
- Unused legacy dashboard/action-list/report CSS selectors.
- Compatibility wrappers that no longer had active consumers.

## Verification

- Visual QA report: `docs/audits/WEB_UI_FULL_REBUILD_VISUAL_QA.md`.
- Screenshots:
  - `/tmp/the-long-season-phase69/app-entry-desktop.png`
  - `/tmp/the-long-season-phase69/dashboard-desktop.png`
  - `/tmp/the-long-season-phase69/match-preparation-desktop.png`
  - `/tmp/the-long-season-phase69/pre-match-desktop.png`
  - `/tmp/the-long-season-phase69/half-time-desktop.png`
  - `/tmp/the-long-season-phase69/full-time-desktop.png`
  - `/tmp/the-long-season-phase69/app-entry-narrow.png`
  - `/tmp/the-long-season-phase69/dashboard-narrow.png`
  - `/tmp/the-long-season-phase69/match-preparation-narrow.png`
  - `/tmp/the-long-season-phase69/pre-match-narrow.png`
  - `/tmp/the-long-season-phase69/half-time-narrow.png`
  - `/tmp/the-long-season-phase69/full-time-narrow.png`

The visual QA checks:

- app-entry landmarks and absence of rejected theme picker;
- career-shell landmarks and current navigation;
- keyboard focus for primary actions;
- no horizontal overflow on desktop or narrow viewport;
- no deleted legacy shell/dashboard/report surfaces;
- match preparation preserves tactical-board and bench-board anchors;
- matchday hides global Inbox/Posta and shell Continue during the match centre;
- half-time exposes the shared tactical-board decision workspace;
- full time separates result, key events, ratings, and consequences.

## Remaining UX Risks

- The visual language is now coherent enough to continue, but every future web
  section still needs browser review before moving on.
- The dashboard is a command centre, not a complete career hub yet. It should
  become richer only when persistent data, fixtures, squad, market, youth, and
  finances are real.
- Matchday is playable as a structured MVP slice, but it is not a live animated
  match viewer.
- The app cannot yet load or continue a durable browser career save.
- Narrow layout is usable, but the first MVP is still primarily desktop/tablet
  management UI.

## Next Phase Recommendation

Proceed to exactly one next phase:

`Phase 70 - Web Career Persistence And Save Lifecycle Foundation`

Reason:

The UI language has been reset. Adding more sections now without durable saves
would create screens that look more complete than the product actually is. The
next valuable manager experience is making `Nuova carriera` and `Continua
carriera` real: create, list, load, continue, and persist a career snapshot
without losing the current tactical-board flow.

Do not start Inbox/Posta, Squad, Market, Youth, or Finances before this. Those
sections need durable career state to avoid becoming decorative or demo-only.
