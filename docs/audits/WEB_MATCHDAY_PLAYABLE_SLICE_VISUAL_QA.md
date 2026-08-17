# Web Matchday Playable Slice Visual QA

Date: 2026-06-29
Phase: `65-web-matchday-playable-slice`
Step: `06-playwright-accessibility-and-visual-qa`

## Scope

This QA verifies the first browser-playable loop:

1. open the web app;
2. start a demo career;
3. prepare the next fixture;
4. return to the dashboard;
5. Continue until matchday attention;
6. open matchday from Inbox/Posta;
7. play the fixture through the real engine-backed demo adapter;
8. inspect result, key events, player stats, and consequences;
9. return to the dashboard and confirm the stale attention event is gone.

## Command

```bash
source ~/.nvm/nvm.sh && nvm use 24 && node --experimental-strip-types apps/web/src/visual-qa/matchday-playable-slice.spec.ts && CI=true pnpm --filter @game/web run typecheck && git diff --check
```

Result: PASS.

Note: the shell selected Node `v24.19.0`; pnpm still reported its known nested
engine warning for `v24.14.0`, but the visual QA, web typecheck, and diff check
completed successfully.

## Screenshot Evidence

Screenshots were written to:

```text
/tmp/the-long-season-phase65
```

Generated files:

- `dashboard-start-desktop.png`
- `preparation-saved-desktop.png`
- `dashboard-matchday-reached-desktop.png`
- `matchday-result-desktop.png`
- `dashboard-after-match-desktop.png`
- `dashboard-start-narrow.png`
- `preparation-saved-narrow.png`
- `dashboard-matchday-reached-narrow.png`
- `matchday-result-narrow.png`
- `dashboard-after-match-narrow.png`

## Accessibility And Interaction Checks

- The desktop and narrow flows both completed without horizontal overflow.
- The dashboard can reach match preparation from the current attention state.
- The match preparation keyboard path reaches the first actionable preparation
  control after the dashboard handoff.
- The saved lineup, bench, and tactic unlock Continue.
- Continue creates a matchday attention event.
- Inbox/Posta opens the matchday screen.
- The Play Match action advances the fixture once.
- After the match is played, Inbox/Posta has no stale action-required message.
- Returning to the dashboard shows the played match as recent context and
  removes the selected-club next fixture for the one-fixture demo.

## Findings

Concrete layout bugs found and fixed during QA:

- The matchday event card stretched its content to the bottom of a tall grid
  cell, making the result report feel broken. The fix sets the matchday card
  grid content alignment to the top.
- The final next-action row could wrap or clip awkwardly beside the Dashboard
  action. The fix allows the value text to wrap normally and gives the action
  a bounded flex width.

The current matchday report is usable and factual, but dense. This is acceptable
for Phase 65 because the phase is about proving the playable web payoff loop,
not building a live match viewer. A later phase should improve the hierarchy of
long consequence lists once persistence and more repeated matchdays exist.

## Verdict

Step 06 PASS. The web app can complete the full prepare-to-matchday-to-dashboard
flow in desktop and narrow browser viewports, with no major accessibility or
layout blocker left in this phase scope.
