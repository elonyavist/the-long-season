# Step 05 - Transfer Turnover Simulation MVP

## Goal

Add minimal deterministic player movement between clubs.

## Context

The world should not be static. This step is not a full market system; it creates enough simple turnover for long-run credibility and measurable squad movement.

## Expected files

- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add pure deterministic transfer-turnover simulation for end-of-season refresh.
- Move a controlled number of players between clubs based on broad fit, age, ability, club level, and player willingness basics.
- Keep top/downward-move logic consistent with current market MVP: strong players should not casually drop to weaker destinations.
- Record structured transfer-turnover events.
- Preserve squad-size and role-balance constraints.
- Add tests for determinism, no duplicate ownership, no missing player references, and plausible movement counts.

## What NOT to implement

- Do not implement negotiations.
- Do not implement loans.
- Do not implement wages, contract duration, agents, installments, or swap deals.
- Do not write persistent career saves from report tooling.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- focused transfer-turnover tests
- `pnpm check`

## Definition of Done

- Some players can move between clubs deterministically.
- Transfer turnover metrics are real.
- Roster ownership remains valid after movement.

