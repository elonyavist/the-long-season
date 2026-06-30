# Matchday Flow Simplification Report

Date: 2026-06-30
Phase: `67-web-matchday-flow-simplification-and-half-time-tactical-decisions`
Step: `09-section-quality-review-and-next-phase-decision.md`

## Result

PASS.

Phase 67 made the web matchday path simpler and safer to persist later. The
flow now has one primary action per moment, hides unrelated shell regions while
the user is inside match preparation or matchday, and turns half-time into a
real tactical decision stop instead of a small substitution form.

## Baseline Flow Vs Final Flow

Baseline from Step 01:

```text
Dashboard
  -> action/inbox/continue ambiguity
  -> Match preparation
  -> Save preparation
  -> Dashboard bounce
  -> Continue or dashboard action
  -> Matchday
  -> Play/phase controls mixed with shell controls
  -> Half-time substitution form
  -> Full time
  -> duplicate/unclear return actions
```

Main baseline problems:

- duplicate ways to continue;
- dashboard actions marked available without useful screens;
- preparation saved back to dashboard instead of opening pre-match;
- Inbox/Posta and global Continue remained visible during matchday;
- full-time consequences and navigation competed for attention;
- half-time was not a meaningful manager workspace.

Final accepted flow:

```text
Dashboard
  -> Prepare match
  -> Auto/manual XI and bench, tactic
  -> Save and go to match
  -> Pre-match
  -> Start match
  -> Half-time
  -> tactical-board changes and bench decisions
  -> Start second half
  -> Full time
  -> Continue
  -> clean Dashboard
```

Measured browser flow:

- Desktop: 8 clicks from new career to dashboard after full time.
- Narrow: 8 clicks from new career to dashboard after full time.
- Gate: 8 clicks or fewer.

## Button And Action Changes

Removed:

- dashboard lower action list with inert inspect actions;
- disabled future navigation as clickable buttons;
- match-preparation bottom duplicate save section;
- matchday header Dashboard button;
- global shell Continue inside preparation and matchday modes;
- Inbox/Posta rail during matchday;
- duplicate full-time return action;
- old half-time two-select substitution panel when the tactical workspace can
  mount.

Renamed or made contextual:

- preparation save is now `Save and go to match`;
- pre-match exposes only `Start match`;
- half-time exposes only the current decision CTA after tactical edits;
- full time exposes only `Continue`;
- dashboard exposes only the next useful career action:
  `prepare_match` when preparation is incomplete, or
  `advance_next_fixture` when the saved setup can open matchday.

## Shell Modes

`packages/ui/src/career/career-shell-view.ts` now models shell display modes:

- `standard`: full career shell, Inbox/Posta rail, global Continue when useful;
- `preparation`: focused preparation workspace, global Continue hidden;
- `matchday`: focused match centre, Inbox/Posta and global Continue hidden.

The web shell consumes these flags in
`apps/web/src/features/career-shell/CareerShell.tsx`. Future sections may remain
visible in navigation, but disabled items render as non-interactive text with
semantic disabled state instead of available-looking buttons.

## Dashboard Primary Action

`packages/ui/src/career/build-career-dashboard-view.ts` owns dashboard action
availability. The dashboard no longer advertises future sections as usable
actions. It emits one real primary action at a time:

- `prepare_match` if lineup, bench, or tactic blockers exist;
- `advance_next_fixture` if preparation is complete and matchday can open.

`apps/web/src/features/dashboard/CareerDashboardScreen.tsx` renders that as the
single manager CTA in the dashboard header.

## Preparation To Matchday

`apps/web/src/stores/career-ui-store.ts` exposes
`savePreparationAndOpenMatchday`. It saves only complete preparation drafts and
opens the explicit pre-match state. It does not auto-start the match.

`apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
places the action in the top workspace header so the user does not have to find
a second save panel below the board.

## Pre-Match And Full-Time Actions

`packages/ui/src/career/career-matchday-phase-view.ts` derives one phase action:

- pre-match: `Start match`;
- half-time: `Start second half` when validation passes;
- full time: `Continue`.

`apps/web/src/features/matchday/CareerMatchdayScreen.tsx` renders these actions
inside the match centre, while `apps/web/src/app/App.tsx` wires full time back
to a clean dashboard by clearing stale matchday attention.

## Half-Time Tactical Decisions

The selected club can now change the second-half setup through the shared
tactical board:

- formation changes;
- lineup assignments;
- bench assignments;
- slot movements;
- role changes;
- slot clearing;
- validation before the second half starts.

The structured contract lives in
`packages/domain/src/match/half-time-tactical-decision.ts`. Engine application
lives in `packages/engine/src/match-engine/half-time-substitutions.ts` and
`packages/engine/src/match-engine/staged-match-progression.ts`.

The web adapter builds the decision from the current board and bench in
`apps/web/src/features/matchday/matchday-demo.ts`. The screen mounts the shared
XI and bench surfaces from `apps/web/src/features/tactics-board/**`.

## Junior Developer Entry Points

Start here when debugging the simplified web matchday path:

1. `packages/ui/src/career/career-shell-view.ts`
   Shell modes and visibility rules.
2. `packages/ui/src/career/build-career-dashboard-view.ts`
   Dashboard primary action selection.
3. `packages/ui/src/career/career-match-preparation-view.ts`
   Preparation blockers and save-action readiness.
4. `packages/ui/src/career/career-matchday-phase-view.ts`
   Pre-match, half-time, and full-time phase actions.
5. `packages/domain/src/match/half-time-tactical-decision.ts`
   Structured half-time tactical decision validation.
6. `packages/engine/src/match-engine/staged-match-progression.ts`
   Staged match progression and second-half continuation.
7. `packages/engine/src/match-engine/half-time-substitutions.ts`
   Application of validated second-half selected-club decisions.
8. `apps/web/src/app/App.tsx`
   Screen routing and store-to-screen wiring.
9. `apps/web/src/stores/career-ui-store.ts`
   Browser adapter state and manager actions.
10. `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
    Save-and-go-to-match screen behavior.
11. `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
    Match centre and half-time tactical workspace.
12. `apps/web/src/features/matchday/matchday-demo.ts`
    In-memory matchday adapter until real web persistence exists.
13. `apps/web/src/visual-qa/matchday-flow-simplification.spec.ts`
    Browser proof of the accepted flow.

## Playwright Findings

Browser QA result: PASS.

Checked on desktop and narrow viewports:

- no dashboard bounce after `Save and go to match`;
- no matchday Inbox/Posta rail;
- no global matchday Continue;
- no dead dashboard action buttons;
- one pre-match `Start match`;
- shared tactical board and fixed 8-slot bench at half-time;
- old two-select substitution form absent when tactical workspace mounts;
- one full-time `Continue`;
- dashboard after match has no stale matchday attention;
- primary actions are keyboard focusable;
- no horizontal overflow.

Screenshots were written to `/tmp/the-long-season-phase67/`:

- `dashboard-desktop.png`
- `preparation-desktop.png`
- `pre-match-desktop.png`
- `half-time-desktop.png`
- `full-time-desktop.png`
- `dashboard-after-match-desktop.png`
- `dashboard-narrow.png`
- `preparation-narrow.png`
- `pre-match-narrow.png`
- `half-time-narrow.png`
- `full-time-narrow.png`
- `dashboard-after-match-narrow.png`

## Residual UX Risks

- Web career state is still in-memory. Refreshing loses the run.
- Matchday decisions are not yet backed by real browser save persistence.
- The match centre is staged, not a live minute-by-minute replay.
- Team talks, quick instructions, opponent tactical view, injuries, cards,
  extra time, penalties, and cup rules remain out of scope.
- Half-time tactical workspace is functionally correct, but should be
  re-reviewed with persisted careers and longer real save histories.
- The web build still emits a non-blocking Vite chunk-size warning; it does not
  block Phase 67 but should be watched before production packaging.

## Closeout Boundary Fix

The final `pnpm check` caught a package-boundary regression: the web matchday
demo adapter imported half-time tactical decision types directly from
`@game/domain`. The closeout fix re-exported those engine-accepted input types
from `@game/engine` and moved the web import to that allowed boundary. No
gameplay behavior changed.

## Next Phase Decision

Proceed to `Phase 68 - Web Career Persistence And Save Adapter`.

Reason:

- The click flow is now understandable enough to make durable.
- Dashboard, preparation, matchday, half-time, and full-time each have a clear
  primary action.
- The remaining largest product risk is not another button pass; it is that the
  web career still disappears on refresh and demo adapters still own state that
  should become save-backed.

Do not start Phase 68 until its documentation and step files are created.
