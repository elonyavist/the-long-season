# Shared Bench Board Visual QA

Date: 2026-06-24
Phase: `59-shared-bench-board-and-substitute-selection`
Step: `07-responsive-accessibility-and-visual-qa`

## Scope

This audit records the browser QA evidence for the shared substitute bench board
inside the match-preparation tactical workspace.

The goal was to verify that the bench is now a real tactical selection surface:
eight fixed reserve slots, compact football styling, contextual add/remove
behavior, deterministic candidate ordering, goalkeeper validation, helper-action
integration, and keyboard/pointer access.

## Browser QA Command

```sh
nvm use 24
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
```

Result: PASS.

## Screenshots

Generated under `/tmp/the-long-season-phase59`:

- `/tmp/the-long-season-phase59/shared-bench-empty-desktop.png`
- `/tmp/the-long-season-phase59/shared-bench-filled-desktop.png`
- `/tmp/the-long-season-phase59/shared-bench-after-interactions-desktop.png`
- `/tmp/the-long-season-phase59/shared-bench-narrow.png`
- `/tmp/the-long-season-phase59/shared-bench-long-press-open.png`

## Verified Behavior

- The shared bench board is visible below the tactical board.
- Exactly eight reserve slots are rendered.
- Empty slots expose a compact `+`.
- Filled slots show shirt number, surname, and role code.
- Filled reserve slots open a remove-only tactical-board menu.
- Empty reserve slots open the shared candidate-row assignment menu.
- Bench assignment candidates exclude starting XI players.
- Bench assignment candidates exclude already-selected substitutes.
- Candidate rows include compact fitness percentage and suitability metadata.
- Candidate ordering is deterministic by ability/form/football-position fallback.
- Removing one reserve keeps the slot and clears only the player assignment.
- Filling the reserve goalkeeper slot with an outfield candidate triggers the
  `bench needs a goalkeeper` blocker.
- `Auto` fills starting XI first and then the full bench.
- `Fill gaps` fills both XI and bench gaps.
- `Clear` clears both XI and bench selections.
- Desktop and narrow viewports have no horizontal overflow.
- The shared pitch remains visible and does not intrude into the squad column.
- Keyboard focus reaches formation, helper buttons, board slots, bench slots,
  tactic controls, save action, and bench menu actions.
- Touch long-press still opens the tactical-board menu, while moved long-press
  cancels before opening.

## Accessibility Notes

- Bench slots are native buttons with stable accessible labels such as `S1`,
  number, surname, and role, or the empty-slot label.
- The add/remove actions reuse the existing tactical-board menu buttons, keeping
  keyboard and screen-reader behavior consistent with starting XI slot actions.
- The tested keyboard path reaches both bench slots and menu actions.
- Escape closes the active bench menu.
- Pointer-down outside the bench, including on the pitch, closes the bench menu.

## Visual Notes

- The bench reads as a compact tactical surface rather than a separate form list.
- The fixed `S1`-`S8` layout keeps reserve selection scannable.
- The board remains close enough to the tactical pitch to feel connected, while
  still avoiding bench drag/drop or role-change complexity.

## Residual Risks

- The current bench still does not show a dedicated goalkeeper warning inside
  the bench board itself; the blocker strip owns that feedback.
- The bench candidate menu uses a generic suitability tone for substitutes
  because substitute slots do not have a target role. This is acceptable for
  Phase 59, where bench ordering is overall/form driven, but future tactical
  bench planning may need role-specific reserve slots.
- The narrow layout is verified for overflow and reachability, but future
  mobile UX should revisit whether the bench should collapse into a drawer once
  the real tactics screen grows.

