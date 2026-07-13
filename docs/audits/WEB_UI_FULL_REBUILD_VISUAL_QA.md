# Web UI Full Rebuild Visual QA

Date: 2026-07-06
Phase: `69-web-ui-full-rebuild-around-tactical-board`
Step: `14-visual-qa-accessibility-and-phase-report.md`

## Result

PASS.

The browser QA drove the rebuilt first-MVP web flow on desktop and narrow
viewports: app entry, dashboard, match preparation, pre-match, half-time, and
full time.

## Checked

- desktop: App entry has a main landmark, action navigation, no theme picker, and no horizontal overflow.
- desktop: Dashboard uses the rebuilt app shell, current navigation, one primary action, and no legacy dashboard action list.
- desktop: Match preparation keeps the tactical board as the approved anchor and exposes the bench board.
- desktop: Pre-match uses a focused match centre frame without Inbox/Posta or global Continue noise.
- desktop: Half-time is a real decision stop with tactical board, bench, validation, and one primary continuation action.
- desktop: Full time separates result, key events, ratings, and consequences without falling back to a raw log table.
- narrow: App entry has a main landmark, action navigation, no theme picker, and no horizontal overflow.
- narrow: Dashboard uses the rebuilt app shell, current navigation, one primary action, and no legacy dashboard action list.
- narrow: Match preparation keeps the tactical board as the approved anchor and exposes the bench board.
- narrow: Pre-match uses a focused match centre frame without Inbox/Posta or global Continue noise.
- narrow: Half-time is a real decision stop with tactical board, bench, validation, and one primary continuation action.
- narrow: Full time separates result, key events, ratings, and consequences without falling back to a raw log table.

## Accessibility And Layout Notes

- App entry exposes one `main` landmark and an action navigation.
- Career screens expose one shell, one main content landmark, a left navigation
  rail, and a right context/attention rail.
- Exactly one navigation item uses `aria-current="page"` on career screens.
- Primary actions are keyboard focusable on dashboard, preparation, pre-match,
  half-time, and full time.
- Desktop and narrow viewports have no horizontal overflow.
- Matchday hides global Inbox/Posta and shell Continue while the manager is
  inside the match centre.

## Regression Guards

- No rejected theme-palette picker or root `data-theme-palette` attribute.
- No deleted legacy career-shell bridge selectors.
- No old dashboard action-list/grid.
- No old matchday raw-report layout.
- Half-time uses the shared tactical board and fixed 8-slot bench board.
- Full time separates result review, key events, ratings, and consequences.

## Screenshots

- desktop: `/tmp/the-long-season-phase69/app-entry-desktop.png`
- desktop: `/tmp/the-long-season-phase69/dashboard-desktop.png`
- desktop: `/tmp/the-long-season-phase69/match-preparation-desktop.png`
- desktop: `/tmp/the-long-season-phase69/pre-match-desktop.png`
- desktop: `/tmp/the-long-season-phase69/half-time-desktop.png`
- desktop: `/tmp/the-long-season-phase69/full-time-desktop.png`
- narrow: `/tmp/the-long-season-phase69/app-entry-narrow.png`
- narrow: `/tmp/the-long-season-phase69/dashboard-narrow.png`
- narrow: `/tmp/the-long-season-phase69/match-preparation-narrow.png`
- narrow: `/tmp/the-long-season-phase69/pre-match-narrow.png`
- narrow: `/tmp/the-long-season-phase69/half-time-narrow.png`
- narrow: `/tmp/the-long-season-phase69/full-time-narrow.png`

## Manual Review Focus

Review the screenshots in `/tmp/the-long-season-phase69` and the running app. The current
implementation is strong enough to resume MVP product work if the visual
language is accepted, but it is still an in-memory prototype: persistence,
section depth, and real career saves remain future work.
