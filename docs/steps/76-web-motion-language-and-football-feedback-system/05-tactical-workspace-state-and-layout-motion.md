# Step 05 - Tactical Workspace State And Layout Motion

## Status

Done.

## Goal

Improve continuity when players enter, leave, or change tactical selections
while preserving the approved tactical board and its existing interaction
ownership.

## User-Visible Outcome

- Assigning or removing a player gives immediate visual confirmation.
- Formation changes settle players into their new valid slots coherently.
- Moving a player between XI and bench clearly removes the previous assignment
  and establishes the new one without a duplicate flash.
- Empty slots, validation, suitability, and role labels remain stable and
  readable.

## Scope

1. Add bounded presence/layout continuity to player assignment and removal on
   the tactical pitch and bench.
2. Add restrained formation-change continuity only after the canonical slot
   transformation has completed.
3. Preserve existing duplicate-prevention behavior when an assigned player is
   selected elsewhere.
4. Keep context menu and candidate picker opening/closing aligned with the
   shared modal/presence language where their semantics allow it.
5. Preserve drag zones, normalized coordinates, goalkeeper lock, suitability,
   long press, outside click, Escape, and keyboard behavior.
6. Ensure player tokens never animate outside the visible pitch/bench bounds.

## Implementation Contract

- Existing tactical state Modules remain authoritative.
- Motion does not own pointer movement, drag clamping, role changes, player
  ranking, auto-selection, or selection mutation.
- Do not replace the pitch SVG or animate its markings/background.
- Do not rely on one element existing simultaneously in XI and bench to produce
  a shared-layout effect.
- Player names and role labels retain stable dimensions throughout movement.
- Reduced motion applies assignments immediately with static confirmation.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
- focused tactical-board component tests
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- its focused test
- current Tactics-screen consumer if production-used
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No tactical-board rewrite, new board fork, new formation, role, tactic, or
  auto-selection rule.
- No Motion drag replacement in this phase.
- No modification of `campo-calcio.svg` or pitch-marking geometry.
- No animated suitability loop, bouncing empty slot, or attention pulse.
- No tactical state in the motion Module.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Assign, replace, remove, and reassign players between XI and bench.
- Change formation with full, partial, and empty selections.
- Exercise mouse drag, long press, keyboard, context menu dismissal, reduced
  motion, narrow layout, and 200% text.

## Completion Criteria

- Tactical state changes are easier to follow without altering football rules.
- No duplicate player, out-of-bounds token, interaction regression, or layout
  shift is visible.
- The approved tactical board remains recognizably unchanged.
