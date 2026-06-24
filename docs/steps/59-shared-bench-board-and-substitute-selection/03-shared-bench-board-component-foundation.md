# 03 - Shared Bench Board Component Foundation

## Goal

Create a reusable bench board component with fixed `S1`-`S8` slots and compact
football visuals.

## Expected Files

- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBenchSlotToken.tsx`
- `apps/web/src/features/tactics-board/tactical-board-bench.ts`
- `apps/web/src/features/tactics-board/tactical-board-bench.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add a framework-local shared bench board under `features/tactics-board`
  because it belongs to the tactical workspace family.
- Render exactly 8 fixed slots, ordered `S1` to `S8`.
- Render empty slots as a circular/compact `+` token.
- Render filled slots with:
  - shirt number;
  - surname;
  - natural/current role abbreviation.
- Use a compact green mini-board visual:
  - no pitch stripes;
  - subtle surface texture or panel treatment is allowed;
  - use existing design tokens;
  - keep sufficient contrast.
- Provide accessible button/focus behavior for every slot.
- Keep the component state-free: slot/player data and callbacks come from the
  caller.

## What NOT To Implement

- Do not wire it into match preparation yet.
- Do not add candidate menus yet.
- Do not add drag/drop.
- Do not duplicate the vertical pitch SVG.
- Do not hardcode visible labels.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- TacticalBenchBoard.test.ts tactical-board-bench.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- A reusable bench board renders 8 fixed slots from data.
- Empty and filled visual states are covered by tests.
- The component can be reused by match preparation and future tactics screens.
