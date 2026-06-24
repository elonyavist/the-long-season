# 04 - Pitch Markings Token And Player Token Integration

## Goal

Introduce the reusable visual board components using the supplied pitch
markings and the game's design system.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitchMarkings.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPlayerToken.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardEmptySlot.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardMenu.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Copy/adapt the supplied `PitchMarkings.tsx` behavior into the game.
- Preserve:
  - vertical pitch;
  - own goal at the bottom;
  - full field usage;
  - subtle green stripes;
  - regulatory markings;
  - penalty arcs protruding outward.
- Render 11 slot tokens across the full field.
- Token must show:
  - shirt number;
  - surname;
  - role code;
  - form arrow;
  - suitability border color.
- Render empty slots as assignable controls with role code and accessible label.
- Replace hardcoded colors with design-system CSS variables or semantic local
  variables backed by the design system.
- Add localized labels for:
  - tactical board;
  - base formation;
  - current shape;
  - change role;
  - remove from lineup;
  - assign player;
  - empty slot;
  - suitability labels.

## What NOT To Implement

- Do not add drag behavior yet.
- Do not add long press yet.
- Do not create a full Tactics screen.
- Do not keep visible hardcoded English/Italian labels inside components.
- Do not use the old `campo-calcio.svg` as a second overlapping field layer in
  this component.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
pnpm exec vitest run apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts packages/i18n/src/labels.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- The board renders 11 slots using the shared state contract.
- The board field is drawn by the adapted pitch-marking component.
- The token UI uses design-system-backed colors.
- The component has no hardcoded visible labels.
- The component remains reusable outside match preparation.
