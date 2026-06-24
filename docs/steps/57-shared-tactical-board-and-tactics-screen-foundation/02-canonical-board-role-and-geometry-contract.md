# 02 - Canonical Board Role And Geometry Contract

## Goal

Create the shared tactical-board contract around canonical roles and normalized
coordinates before rendering or interactions are changed.

## Expected Files

- `apps/web/src/features/tactics-board/tactical-board-types.ts`
- `apps/web/src/features/tactics-board/tactical-board-roles.ts`
- `apps/web/src/features/tactics-board/tactical-board-geometry.ts`
- `apps/web/src/features/tactics-board/tactical-board-formations.ts`
- `apps/web/src/features/tactics-board/tactical-board-types.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-roles.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-geometry.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-formations.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Add a web feature folder for the shared tactical board.
- Define display role codes:
  - `POR`;
  - `TD`;
  - `DC`;
  - `TS`;
  - `MED`;
  - `CC`;
  - `ED`;
  - `ES`;
  - `TRQ`;
  - `AD`;
  - `AS`;
  - `ATT`.
- Map each display role code to the Phase 56 canonical domain role.
- Define `TacticalBoardSlot` with:
  - stable `slotId`;
  - normalized `nx`;
  - normalized `ny`;
  - display role code;
  - canonical role;
  - `playerId`;
  - lock state.
- Keep `nx` and `ny` as the only state coordinates.
- Adapt `toSvg`, `toNorm`, `pointerToNorm`, and `clampToZone` around viewBox
  `0 0 800 1170`.
- Define role movement zones using the canonical role list.
- Define role options by field cell using canonical roles.
- Derive tactical shape from effective slot roles.
- Adapt base formation presets from the domain formation catalog instead of
  duplicating a separate permanent catalog.
- Remap reference-only roles:
  - `REG` to `MED` or `CC` by slot position;
  - `SP` to `TRQ` or `ATT` by slot position;
  - `PC` to `ATT`.

## What NOT To Implement

- Do not render the board.
- Do not import Zustand here.
- Do not use `SAMPLE_SQUAD`.
- Do not persist data yet.
- Do not introduce non-canonical role codes.
- Do not store pixel positions.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/features/tactics-board/tactical-board-types.test.ts apps/web/src/features/tactics-board/tactical-board-roles.test.ts apps/web/src/features/tactics-board/tactical-board-geometry.test.ts apps/web/src/features/tactics-board/tactical-board-formations.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Every board role maps to one canonical domain role.
- No reference-only role survives as a game role.
- Geometry helpers round-trip normalized coordinates.
- Drag clamps never return coordinates outside `0..1`.
- Derived shape returns expected values for `4-4-2`, `4-3-3`, and the ED-to-AD
  example.
