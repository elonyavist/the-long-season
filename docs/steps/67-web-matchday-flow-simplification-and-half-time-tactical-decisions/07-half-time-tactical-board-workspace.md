# 07 - Half-Time Tactical Board Workspace

## Goal

Expose half-time as a focused tactical workspace where the manager can change
formation, move players, and make substitutions before starting the second
half.

## Scope

Update the web half-time UI so:

- half-time renders a compact tactical-board workspace for the selected club;
- the manager can choose a different base formation;
- the manager can move slots within the existing role/zone constraints;
- the manager can change player roles through the existing tactical-board
  behavior;
- the manager can substitute players using the same bench/player selection
  logic as match preparation;
- selected-club tactical changes feed the contract from Step 06;
- the primary action remains "Start second half";
- validation problems are visible and localized;
- no opponent board or team-talk UI appears.

Reuse existing tactical-board and bench-board components where possible. Do not
fork a second tactical-board implementation.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/features/tactics-board/**`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not create a separate tactical-board copy.
- Do not add live tactical changes during first half or second half.
- Do not add team talks.
- Do not add opponent decisions.
- Do not make invalid half-time plans silently valid.
- Do not persist the half-time plan.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/features/tactics-board
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Half-time lets the manager change formation and selected-club tactical board.
- Half-time substitutions and tactical changes are one coherent decision.
- Starting the second half applies the explicit decision or blocks with visible
  structured reasons.
- The UI remains readable on desktop and narrow screens.
