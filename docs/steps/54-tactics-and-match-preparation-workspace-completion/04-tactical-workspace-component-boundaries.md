# 04 - Tactical Workspace Component Boundaries

## Goal

Harden the reusable tactical components so they can serve both match preparation
and the future full Tactics screen.

The goal is not generic abstraction for its own sake. Extract or adjust only
components that are already used by this phase.

## Expected files

- `apps/web/src/components/*`
- `apps/web/src/career/player-position-ordering.ts` if ordering needs extension
- Focused `apps/web` component tests
- `apps/web/src/styles/*`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Review current reusable components:
  - `TacticalPitchLineup`;
  - `SquadSelectionTable`;
  - `PlayerFactPanel`;
  - shared tactical label helpers.
- Ensure the pitch component can render different formation slot sets without
  overflow.
- Ensure player selects order:
  - natural fits first;
  - adapted fits next;
  - weak/emergency fits last;
  - deterministic tie-break by tactical position and name.
- Ensure squad table sorting by role uses tactical position order, not localized
  role label.
- Keep table height fixed and scrollable.
- Avoid putting formation/bench-specific logic inside the screen when it belongs
  in reusable components or adapter helpers.
- Update architecture docs with component responsibilities if they change.

## What NOT to implement

- Do not add unused components.
- Do not add a fake `TacticsScreen` just to justify abstraction.
- Do not duplicate pitch/list code in the screen.
- Do not add drag-and-drop.
- Do not move engine rules into React components.

## Required checks

- `pnpm --filter @game/web run typecheck`
- Focused component tests
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The tactical components are reusable by current match preparation and future
  tactics work.
- Component tests cover the important reusable behavior.
- The screen remains an orchestrator, not a tactical UI dumping ground.
- `docs/PROJECT_STATUS.md` identifies Step 05 as the next action.
