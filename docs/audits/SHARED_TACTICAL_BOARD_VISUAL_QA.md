# Shared Tactical Board Visual QA

Date: 2026-06-24
Phase: `57-shared-tactical-board-and-tactics-screen-foundation`
Step: `08-regression-visual-qa-accessibility-and-touch`

## Scope

Browser QA verified the shared tactical board inside the existing match
preparation screen. The test intentionally uses the real app flow:

1. new career;
2. dashboard;
3. match preparation;
4. explicit manager auto-fill action;
5. tactical-board drag/context-menu interactions;
6. narrow viewport check;
7. touch long-press check.

The test does not start a full Tactics page and does not implement live
matchday tactical changes.

## Screenshots

Screenshots were written outside the repository:

- `/tmp/the-long-season-phase57/shared-board-empty-desktop.png`
- `/tmp/the-long-season-phase57/shared-board-filled-desktop.png`
- `/tmp/the-long-season-phase57/shared-board-after-interactions-desktop.png`
- `/tmp/the-long-season-phase57/shared-board-narrow.png`
- `/tmp/the-long-season-phase57/shared-board-long-press-open.png`

## Automated Findings

- PASS: the match-preparation screen renders the shared tactical board.
- PASS: the empty board starts with 11 empty slots and 0 assigned tokens.
- PASS: the explicit `Auto` helper fills 11 board tokens.
- PASS: the vertical pitch remains visible on desktop.
- PASS: no horizontal overflow was detected on desktop or narrow viewport.
- PASS: the active movement zone appears during drag and disappears after
  release.
- PASS: a central midfielder is clamped outside the attacking third.
- PASS: the goalkeeper slot does not move when dragged.
- PASS: dragging `ED` forward exposes `AD`; selecting it updates the derived
  shape to `4-3-3`.
- PASS: changing role changes the token suitability border level.
- PASS: removing a player clears only `playerId` and keeps the slot role and
  position.
- PASS: empty-slot candidates exclude players already in the XI.
- PASS: the fixed goalkeeper can still open a replacement candidate menu.
- PASS: touch long press opens the context menu.
- PASS: touch movement past threshold cancels long press.
- PASS: formation, helper action, board slot, bench, tactic, and save controls
  are reachable by keyboard when the preparation is complete.

## Accessibility Notes

- Board tokens and empty slots are focusable SVG controls with accessible names.
- Context menu actions are native buttons.
- The goalkeeper remains locked for movement/role changes but replacement is
  still available from the assignment menu.
- The save button is naturally skipped by keyboard when disabled; QA validates
  save reachability only after a complete preparation makes it available.

## Residual Risk

- Non-blocking: the QA script dispatches pointer events directly for SVG drag
  precision. This validates the app's pointer contract and avoids false
  negatives from Playwright SVG hit-test variance, but manual browser review is
  still useful for the final tactile feel.
- Non-blocking: the visual style is now functional enough for Phase 57, but the
  future Tactics screen should still review spacing and affordances once the
  board becomes the primary tactical workspace.
