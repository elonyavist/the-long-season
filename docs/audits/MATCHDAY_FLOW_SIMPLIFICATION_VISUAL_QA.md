# Matchday Flow Simplification Visual QA

Date: 2026-06-30
Phase: `67-web-matchday-flow-simplification-and-half-time-tactical-decisions`
Step: `08-click-count-playwright-accessibility-and-flow-qa.md`

## Result

PASS.

The browser QA drove the accepted dashboard-to-full-time path on desktop and
narrow viewports. The flow now uses one primary action per screen, saves
preparation directly into pre-match, stops at a tactical half-time workspace,
and returns to a clean dashboard after full time.

## Click Count

- Desktop: 8 clicks.
- Narrow: 8 clicks.
- Gate: <= 8 clicks from new career to dashboard after full time.
- Actual max: 8 clicks.

## Checked

- No dashboard bounce after `Save and go to match`.
- Matchday shell hides Inbox/Posta and global Continue.
- Dashboard does not expose dead available actions.
- Pre-match exposes one `Start match` action.
- Half-time exposes the shared tactical board and fixed 8-slot bench.
- The old two-select substitution panel is not shown when the tactical
  workspace is available.
- Full time exposes one `Continue` action.
- Dashboard after match does not retain stale matchday attention text.
- Primary actions are keyboard focusable.
- Desktop and narrow viewports have no horizontal overflow.

## Screenshots

- desktop: `/tmp/the-long-season-phase67/dashboard-desktop.png`
- desktop: `/tmp/the-long-season-phase67/preparation-desktop.png`
- desktop: `/tmp/the-long-season-phase67/pre-match-desktop.png`
- desktop: `/tmp/the-long-season-phase67/half-time-desktop.png`
- desktop: `/tmp/the-long-season-phase67/full-time-desktop.png`
- desktop: `/tmp/the-long-season-phase67/dashboard-after-match-desktop.png`
- narrow: `/tmp/the-long-season-phase67/dashboard-narrow.png`
- narrow: `/tmp/the-long-season-phase67/preparation-narrow.png`
- narrow: `/tmp/the-long-season-phase67/pre-match-narrow.png`
- narrow: `/tmp/the-long-season-phase67/half-time-narrow.png`
- narrow: `/tmp/the-long-season-phase67/full-time-narrow.png`
- narrow: `/tmp/the-long-season-phase67/dashboard-after-match-narrow.png`

## Manual UX Note

The half-time screen is now a real manager stop instead of a bureaucratic
substitution form. The next product risk is visual density: the board is
functionally correct, but after persistence the matchday screen should still be
reviewed with real club data and longer fixture histories.
