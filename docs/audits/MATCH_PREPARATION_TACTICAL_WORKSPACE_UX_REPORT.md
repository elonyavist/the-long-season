# Match Preparation Tactical Workspace UX Report

Date: 2026-06-24
Phase: `58-match-preparation-tactical-workspace-ux-rework`
Status: Complete

## Goal

Phase 58 reworked the match-preparation tactical workspace before the project
continues to Inbox/Posta. The purpose was to fix the user-reviewed weaknesses:
too much empty space, weak football-manager hierarchy, sticky context menu,
inconsistent XI and bench assignment, unclear candidate ordering, and cramped
three-player central lines.

## What Changed

- The oversized match context and blocker card became a compact match strip plus
  compact alert strip. The first useful viewport now shows what matters: club,
  fixture, XI count, bench count, tactic state, and blockers.
- Formation, `Auto`, `Fill gaps`, and `Clear` moved into a board-local toolbar
  above the tactical board. The controls now belong to the workspace they affect.
- Tactical-board context menus now close on outside click, pitch-background
  click, `Esc`, and completed actions.
- Assignment candidates are ordered by role suitability, current ability,
  fitness, and stable identity. The manager still chooses manually; the UI just
  stops burying sensible options.
- A shared dense player-candidate row now renders XI assignment candidates and
  bench candidates with the same language: shirt number, surname, role, compact
  fitness percent, foot where known, and suitability.
- The 8-player bench is no longer a visually separate weak control. It uses
  explicit slots and candidate rows, while still avoiding drag/drop and hidden
  automatic bench choices.
- Three `CC` and three `DC` lines receive extra horizontal spacing without
  changing two-player lines or storing pixel coordinates.
- Browser QA was extended for desktop, narrow viewport, keyboard reachability,
  long press, context-menu dismissal, candidate ordering, bench parity, and
  central-line spacing.

## Quality Findings

The visual QA found one real issue during Step 07: shared player-candidate rows
could overflow narrow viewports when the meta cluster contained `100%`, foot,
and suitability. This was fixed with a narrow responsive CSS rule that puts the
meta cluster below the player identity instead of forcing a third column.

This is a useful lesson for future web sections: shared dense rows must be
designed for constrained surfaces from the start, because Inbox/Posta, Squad,
Market, and Youth will reuse similar list patterns.

## Architecture Review

- Game rules remain outside React. The screen still consumes structured
  match-preparation view data and board callbacks.
- Tactical-board state still stores normalized coordinates only.
- Suitability remains derived, not saved as mutable player state.
- `PlayerCandidateRow` is presentational and does not import feature stores or
  engine code.
- Match preparation still owns the bench-specific click workflow; the shared
  tactical board owns XI board interaction.
- No Inbox/Posta decision center was started during this phase.

## UI/UX Review

The section is stronger than the Phase 57 baseline:

- critical blockers are no longer buried in large low-density panels;
- board actions are close to the board;
- menu dismissal matches user expectations;
- bench and XI candidate selection now feel like one coherent preparation
  language;
- narrow viewport overflow is actively checked and fixed;
- three-player central lines are less cramped.

The screen still is not the final premium tactical product. The next Tactics
section should eventually deepen role instructions, tactical mentality, and
saved tactical profiles. That is future scope, not a blocker for Inbox/Posta.

## Fun Review

The phase improves manager agency rather than adding decorative UI. The manager
can see why progression is blocked, make lineup/bench/tactic decisions in one
place, and choose players from lists ordered by football usefulness. This makes
the future Inbox/Posta loop more fun because attention messages can route into a
screen that already feels like a real pre-match decision surface.

## Verification

Required checks passed:

```sh
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
test -f docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_VISUAL_QA.md
test -f docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_UX_REPORT.md
pnpm check
git diff --check
graphify update .
```

Screenshots were generated under:

```text
/tmp/the-long-season-phase58
```

Vite still reports a non-blocking production chunk-size warning over 500 kB.
This already existed as a bundling consideration and is not a Phase 58 blocker.

## Residual Risks

- The tactical workspace is still backed by a demo in-memory career adapter, not
  real save persistence.
- The board has keyboard-open support and `Esc` dismissal, but the future full
  Tactics section should revisit richer screen-reader copy.
- Candidate ordering now covers role suitability first; richer tactical
  instruction fit is future scope.
- Bench assignment is click-based by design. Drag/drop bench behavior remains
  out of scope.

## Next Phase Recommendation

Recommended next phase: `Phase 59 - Inbox/Posta Decision Center`.

Reason: the tactical preparation destination is now strong enough. The next
highest-value user loop is to make the left Posta/Inbox rail a real decision
center that explains why time stopped and routes the manager to the right
screen.
