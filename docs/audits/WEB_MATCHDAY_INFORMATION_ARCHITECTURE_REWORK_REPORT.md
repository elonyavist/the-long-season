# Web Matchday Information Architecture Rework Report

Date: 2026-07-08
Phase: `70-web-matchday-information-architecture-and-live-flow-rework`

## Result

Complete.

Phase 70 rebuilt the web matchday information architecture around one clear
manager flow:

1. pre-match confirmation;
2. first-half live review;
3. half-time tactical decision;
4. second-half live pressure;
5. full-time review.

The matchday screen is no longer a single report page with scattered panels.
It now separates live match information from half-time decisions and final
consequences, using only structured engine facts and browser-side presentation
state.

## What Changed

- Added `career-matchday-presenter.ts` to derive scoreboard facts, passive
  phase markers, one primary command, and event priority groups from structured
  matchday facts.
- Replaced button-like phase tabs with passive progress markers.
- Made pre-match a confirmation-only state with one `Start match` command.
- Added first-half and second-half live states instead of jumping directly from
  kickoff to half-time or full time.
- Rebuilt half-time around first-half tabellino, tactical-board decisions,
  bench decisions, selected-club watch-list players, and key contributors.
- Rebuilt full time so tabellino comes first, player ratings second, and
  post-match consequences after the review.
- Removed misleading duplicate matchday header status text that could display
  a stale phase during playback.
- Tightened localized matchday copy and accessibility labels for event cards,
  phase progress, fixture context, and player ratings.
- Added Playwright visual QA for the full five-state flow on desktop and narrow
  viewports.

## Intentionally Preserved

- Existing engine behavior and match probabilities.
- Existing staged matchday state and structured match facts.
- The shared tactical board and bench-board interaction model.
- In-memory browser adapter scope.
- No browser save lifecycle yet.
- No fake cards, injuries, penalties, extra time, or opponent tactical board.

## Verification

Visual QA report:

- `docs/audits/WEB_MATCHDAY_INFORMATION_ARCHITECTURE_VISUAL_QA.md`

Screenshots:

- `/tmp/the-long-season-phase70/pre-match-desktop.png`
- `/tmp/the-long-season-phase70/first-half-desktop.png`
- `/tmp/the-long-season-phase70/half-time-desktop.png`
- `/tmp/the-long-season-phase70/second-half-desktop.png`
- `/tmp/the-long-season-phase70/full-time-desktop.png`
- `/tmp/the-long-season-phase70/pre-match-narrow.png`
- `/tmp/the-long-season-phase70/first-half-narrow.png`
- `/tmp/the-long-season-phase70/half-time-narrow.png`
- `/tmp/the-long-season-phase70/second-half-narrow.png`
- `/tmp/the-long-season-phase70/full-time-narrow.png`

The Playwright script checks:

- pre-match has one job and no empty event/stat panels;
- first half and second half are visible live states;
- phase progress markers are not buttons or links;
- every phase exposes exactly one primary command;
- half-time is the only tactical decision workspace;
- full time renders tabellino before ratings before consequences;
- desktop and narrow viewports avoid horizontal overflow;
- primary matchday surfaces do not contain obvious clipped text.

## Remaining UX Risks

- The matchday flow is now coherent enough to preserve, but it is still a
  structured manager view, not an animated match viewer.
- Narrow half-time is long because it contains the board, bench, and player
  signals. That is acceptable for the MVP, but future responsive polish should
  keep this screen readable.
- The browser app is still in-memory. Refresh/load/continue are not durable.
- Future persistence must store structured facts and state, not rendered prose.

## Next Phase Recommendation

Proceed to exactly one next phase:

`Future Phase - Web Career Persistence And Save Lifecycle Foundation`

Reason:

The matchday flow is now coherent enough to keep. The next major product risk is
that `Nuova carriera` and `Continua carriera` are still prototype transitions:
the browser does not create, list, load, refresh, or continue durable career
saves. Starting Inbox/Posta, Squad, Market, Youth, Staff, Finance, or Archive
before persistence would create demo-only UI and increase dead-code risk.
