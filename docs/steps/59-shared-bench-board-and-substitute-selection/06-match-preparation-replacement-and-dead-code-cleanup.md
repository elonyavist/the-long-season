# 06 - Match Preparation Replacement And Dead Code Cleanup

## Goal

Replace the current bench grid in match preparation with the shared bench board
and remove obsolete bench picker code.

## Expected Files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/match-preparation/BenchSelectionPanel.tsx`
- `apps/web/src/features/match-preparation/BenchSelectionPanel.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
- `apps/web/src/styles/components.css`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Replace inline `BenchSelectionGrid`/`BenchSlotPicker` logic with
  `TacticalBenchBoard`.
- Either delete obsolete `BenchSelectionPanel` and its test, or turn it into an
  active thin wrapper around `TacticalBenchBoard`.
- Keep player detail focus behavior when a bench player is selected.
- Keep duplicate and blocker display behavior unchanged except for the new
  missing-goalkeeper rule.
- Update architecture docs if component ownership changes.

## What NOT To Implement

- Do not keep two unrelated bench selection UIs.
- Do not move all match-preparation logic into the board component.
- Do not add route-level changes.
- Do not change the XI tactical board.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- CareerMatchPreparationScreen.test.tsx TacticalBenchBoard.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Match preparation uses the shared bench board.
- No obsolete bench picker path remains undocumented.
- The screen is easier to follow for a junior developer than before this phase.
