# Career Continue And Inbox Visual QA

Date: 2026-06-23
Phase: `50-career-continue-and-inbox-foundation`
Step: `08-playwright-continue-and-inbox-qa`
Status: Complete

## Command

```sh
node --experimental-strip-types apps/web/src/visual-qa/continue-inbox.spec.ts
```

The script starts the Vite web app on `http://127.0.0.1:5174/`, drives
Chromium through Playwright, and saves screenshots outside the repository.

## Screenshots

- `/tmp/the-long-season-phase50/continue-inbox-desktop.png`
- `/tmp/the-long-season-phase50/continue-inbox-narrow.png`

## Flow Covered

- Main menu loads.
- `New career` opens the career dashboard.
- Dashboard shows selected club and next fixture.
- `Continue` stops on missing match preparation.
- Attention stop panel appears.
- Inbox / Posta panel appears with one action-required message.
- Desktop viewport inspected.
- Narrow viewport inspected.

## Visual Findings

- Desktop layout is readable and dense without overlapping panels.
- Narrow viewport stacks sections correctly.
- Continue button remains visible near the top of the dashboard.
- Attention stop is clear and not confused with general blockers.
- Inbox / Posta panel shows unread and action-required counts.
- The message card is readable and uses the existing retro-premium palette.
- No blank screen, clipped title, clipped button text, or broken navigation was
  observed.

## Product Notes

- The Inbox / Posta is useful as a compact dashboard panel.
- It should not become the main navigation center; the dashboard remains the
  career hub and `Continue` remains the heartbeat.
- The next useful product slice is still match preparation, because the first
  Inbox message now correctly asks the manager to prepare the match.

## Blockers

None.
