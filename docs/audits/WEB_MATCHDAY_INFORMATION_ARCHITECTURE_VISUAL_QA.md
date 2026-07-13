# Web Matchday Information Architecture Visual QA

Date: 2026-07-08
Phase: `70-web-matchday-information-architecture-and-live-flow-rework`
Step: `10-playwright-visual-qa-fun-review-and-phase-report.md`

## Result

PASS.

The browser QA drove the accepted matchday path on desktop and narrow
viewports: pre-match, first half, half-time, second half, and full time.

## Checked

- desktop: Pre-match is a clean confirmation with one visible primary command and no empty event/stat panels.
- desktop: First half is a real live phase with event cards and one play-to-half-time command.
- desktop: Half-time puts the tabellino before the tactical-board decision workspace and keeps one restart command.
- desktop: Second half shows live events plus selected-club pressure without exposing tactical controls early.
- desktop: Full time starts with the tabellino, then ratings, then consequences, and returns to dashboard explicitly.
- narrow: Pre-match is a clean confirmation with one visible primary command and no empty event/stat panels.
- narrow: First half is a real live phase with event cards and one play-to-half-time command.
- narrow: Half-time puts the tabellino before the tactical-board decision workspace and keeps one restart command.
- narrow: Second half shows live events plus selected-club pressure without exposing tactical controls early.
- narrow: Full time starts with the tabellino, then ratings, then consequences, and returns to dashboard explicitly.

## Accessibility And Layout Notes

- Matchday uses one shell, one scoreboard, and one passive phase-progress list.
- Phase progress uses list items, not buttons or links.
- Every phase exposes one primary command and that command is keyboard focusable.
- Event cards expose visible event kind text and accessible event names.
- Player ratings tables have explicit accessible names.
- Desktop and narrow viewports have no horizontal overflow.
- The script checks common clipped-text candidates in primary matchday surfaces.

## Regression Guards

- Pre-match does not render empty event/stat panels.
- First and second half use card-based live phases, not tables.
- Half-time remains the only tactical decision workspace.
- Second half does not expose tactical controls or early full-time consequences.
- Full time renders tabellino before ratings before post-match consequences.
- Full time exposes `Return to dashboard`, not live progression commands.

## Screenshots

- desktop: `/tmp/the-long-season-phase70/pre-match-desktop.png`
- desktop: `/tmp/the-long-season-phase70/first-half-desktop.png`
- desktop: `/tmp/the-long-season-phase70/half-time-desktop.png`
- desktop: `/tmp/the-long-season-phase70/second-half-desktop.png`
- desktop: `/tmp/the-long-season-phase70/full-time-desktop.png`
- narrow: `/tmp/the-long-season-phase70/pre-match-narrow.png`
- narrow: `/tmp/the-long-season-phase70/first-half-narrow.png`
- narrow: `/tmp/the-long-season-phase70/half-time-narrow.png`
- narrow: `/tmp/the-long-season-phase70/second-half-narrow.png`
- narrow: `/tmp/the-long-season-phase70/full-time-narrow.png`

## Manual Review Focus

Review the screenshots in `/tmp/the-long-season-phase70`. The key subjective check is
whether the five-state flow now reads like a football match centre rather than
a debug log. If visual polish is still rejected, future work should adjust
composition and hierarchy, not reintroduce tables or fake match facts.
