# Phase 58 - Match Preparation Tactical Workspace UX Rework

## Goal

Make the match-preparation tactical workspace feel like a dense, useful
football-management screen instead of a loose dashboard with a tactical board
inside it.

This phase exists because Phase 57 made the shared board technically strong,
but the current match-preparation screen still has UX problems:

- too much empty vertical space in the match context and blocker sections;
- some first-viewport information is too verbose or not decision-oriented;
- the tactical-board context menu does not close when clicking the pitch/outside
  the menu;
- player candidates need to be ranked by suitability for the specific role;
- bench selection should visually match the XI candidate picker instead of
  feeling like a separate form control family;
- board spacing needs refinement when three `CC` or three `DC` tokens share the
  same line.

The target is a Championship Manager / Scudetto-style preparation desk: compact
match header, compact alert strip, tactical board, dense squad context, and
consistent player-picking controls.

## Product Decisions

- Replace the large match summary card with a compact match header:
  selected club, opponent, date, round, home/away, preparation status, selected
  XI count, selected bench count, and tactic state.
- Replace the large blocker card with a compact alert strip near the board.
- Move `Auto`, `Fill gaps`, `Clear`, and formation selection into a compact
  board toolbar.
- Keep the squad list visible on desktop, but make it secondary to the board and
  player picker.
- Left click on an on-pitch player should select/show player detail.
- Right click and long press should open the tactical menu.
- Clicking the pitch background, clicking outside the menu, pressing `Esc`, or
  choosing a menu action must close the menu.
- Candidate rows must show shirt number, surname, natural role, fitness as
  `%`, foot when available, and suitability for the target role.
- Candidate ordering must be role suitability first, then current ability, then
  fitness/form, then stable name/id.
- Bench selection uses the same candidate row visual language as XI slot
  assignment. Bench suitability is based on the player's own natural/current
  role, not hidden squad-coverage logic.
- Keep the bench as 8 explicit reserve slots outside the field. Do not add bench
  drag/drop in this phase.
- When a line contains three `CC` or three `DC`, increase horizontal spacing
  slightly so tokens do not feel cramped near the center circle or defensive
  arc.

## Ordered Steps

1. `01-current-ux-issue-audit-and-target-layout.md`
2. `02-compact-match-header-and-alert-strip.md`
3. `03-context-menu-dismissal-and-candidate-ranking.md`
4. `04-shared-player-candidate-row-and-picker-contract.md`
5. `05-bench-selection-visual-parity.md`
6. `06-board-spacing-density-and-toolbar-polish.md`
7. `07-responsive-accessibility-and-visual-qa.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not implement Inbox/Posta Decision Center.
- Do not implement the full Tactics screen route.
- Do not implement matchday/live tactical changes.
- Do not add opponent mirrored board.
- Do not add bench drag/drop.
- Do not add hidden automatic manager choices.
- Do not add market, finances, squad, youth, staff, or calendar features.
- Do not duplicate the tactical-board state model or formation catalog.
- Do not parse CLI output for web data.
- Do not make a decorative redesign that does not improve a real manager
  decision.

## Definition Of Done

- The first viewport is denser and clearly communicates what is missing before
  the manager can continue.
- The large match-context and blocker cards are replaced by compact,
  decision-oriented UI.
- The context menu closes correctly on outside click, pitch click, `Esc`, and
  completed actions.
- XI candidate ordering is deterministic and role-suitability-first.
- XI and bench player pickers share the same row/card language.
- Bench selection still validates 8 reserves and avoids duplicate XI/bench
  players.
- Three-player central lines have enough spacing on the board.
- Desktop and narrow Playwright screenshots prove no horizontal overflow and no
  broken first viewport.
- Keyboard and screen-reader behavior remains acceptable for WCAG-oriented
  development.
- The final report recommends exactly one next phase.
