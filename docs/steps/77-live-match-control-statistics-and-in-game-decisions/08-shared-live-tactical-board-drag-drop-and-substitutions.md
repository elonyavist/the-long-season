# Step 08 - Shared Live Tactical Board Drag, Drop And Substitutions

## Status

Done.

## Goal

Extend the approved shared tactical board into a complete paused-match decision
surface without creating a second formation, role, suitability, bench, or drag
implementation.

## User-Visible Outcome

- While paused, a manager can drag a substitute onto a starter to propose a
  substitution, exchange starter positions, change formation/roles, and adjust
  existing team instructions.
- The board explains natural, adaptable, and unsuitable zones during drag.
- A substituted player becomes visibly unavailable on the bench and cannot
  return.
- Equivalent click/tap/keyboard controls provide the same decisions.

## Scope

1. Add an explicit editable/view-only mode to the shared tactical board while
   preserving all current match-preparation consumers.
2. Project live number, surname, role, current condition, and live rating onto
   pitch tokens; keep bench tokens compact with the same essential facts.
3. Support bench-to-starter and starter-to-bench drag as a pending
   substitution, preserving the incoming player's bench slot for the outgoing
   player.
4. Support starter-to-starter drag as a tactical slot/role exchange, never a
   substitution.
5. Keep outgoing substituted players disabled/grey with explicit `uscito` or
   equivalent status and prevent re-entry.
6. Add a compact `Fuori` area for dismissed players and forced-off players with
   no replacement.
7. Permit non-goalkeeper drag beyond the current role zone during a pause.
8. Show natural/compatible/strongly-unsuitable destination zones in green,
   amber, and red with role text and suitability labels.
9. On cross-role drop, open one compact anchored popover above the token with
   sensible roles, suitability, consequence, confirm, and cancel.
10. Keep the goalkeeper fixed to its role/area while allowing replacement.
11. Let the formation selector transform canonical slots through the existing
    formation Module and preserve compatible players conservatively.
12. Expose the existing pressing/risk/width/directness controls in the paused
    match only.
13. Add undo/cancel for all pending tactical changes before apply.
14. Add click/tap/keyboard substitution fallback: select outgoing, then select
    eligible incoming; expose errors and availability without drag dependency.
15. Add bounded lift, destination, drop, confirmation, and cancellation motion
    through the shared Motion system.

## Implementation Contract

- The existing board remains the single visual and interaction owner used by
  preparation, tactics, and Matchday.
- Normalized coordinates, pitch SVG, role catalog, formation catalog,
  suitability, clamping, duplicate prevention, and player ranking remain under
  their current owners.
- Live board edits produce typed pending match commands; they do not mutate the
  durable career tactic or call the engine directly.
- Suitability shown by the board and suitability applied by the engine share
  canonical role facts; web must not invent a second scoring formula.
- Popover focus is trapped only as needed, returns to the triggering token,
  closes on outside click/Escape, and works with touch long-press/click.
- Color is supplemental; labels and shapes communicate every zone/status.

## Expected Files

- `apps/web/src/features/tactics-board/tactical-board-types.ts`
- `apps/web/src/features/tactics-board/tactical-board-state.ts`
- `apps/web/src/features/tactics-board/tactical-board-interactions.ts`
- `apps/web/src/features/tactics-board/tactical-board-geometry.ts`
- `apps/web/src/features/tactics-board/tactical-board-formations.ts`
- `apps/web/src/features/tactics-board/tactical-board-roles.ts`
- `apps/web/src/features/tactics-board/tactical-board-squad.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.ts`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPlayerToken.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBenchSlotToken.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.tsx`
- new focused anchored role/adaptation and outside-area components under the
  same feature
- focused tactical-board tests
- Matchday components/presenter/adapter needed to consume pending commands
- existing match-preparation/tactics consumers and regression tests only where
  the shared Interface changes
- `apps/web/src/styles/components.css` and feature-owned styles/tokens
- existing shared motion Modules only when a production-used preset is needed
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No second board, alternate pitch SVG, pixel coordinates in state, free-form
  role catalog, persistent default-tactic mutation, or direct engine call from
  a token.
- No drag-only command, central modal, invisible role conversion, or color-only
  suitability.
- No re-entry, red-card replacement, substitution-window UI, or bench sorting
  that changes fixed slot identity.
- No opponent tactical board or broad tactics-screen redesign.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- During a manual and automatic pause, perform bench-to-XI substitution,
  starter exchange, formation change, cross-role adaptation, cancel, apply,
  and a second substitution.
- Confirm the outgoing player occupies the correct bench slot, is disabled,
  and cannot re-enter.
- Confirm a red-card player appears in `Fuori` and the XI remains at ten.
- Repeat every command with keyboard and click/tap without drag.
- Verify preparation and the normal tactics surface still use the same board
  correctly at desktop, narrow, 200% text, and reduced motion.

## Completion Criteria

- The shared board supports every locked paused-match command.
- Drag/drop and accessible fallback produce identical typed pending commands.
- Role adaptation is explained before confirmation and affects the canonical
  engine suitability after application.
- No duplicate board/rule/suitability implementation or dead interaction path
  remains.
- Step 09 remains the only next implementation step.
