# 06 - Half-Time Tactical Decision Contract

## Goal

Define and implement the structured contract needed for selected-club half-time
tactical decisions beyond one-for-one substitutions.

## Scope

Implement the smallest deterministic contract that can carry:

- selected-club second-half formation;
- selected-club second-half lineup slots;
- selected-club bench state after substitutions;
- selected-club role/position changes from the tactical board;
- explicit user-declared substitutions;
- validation facts for illegal duplicates, missing goalkeeper, more than the
  allowed number of substitutions, missing required XI slots, and invalid
  second-half tactical setup;
- second-half simulation input built from the declared half-time tactical plan.

The contract must preserve the current rule: no hidden automatic user-club
decisions.

## Expected files

- `packages/domain/src/match/half-time-tactical-decision.ts`
- `packages/domain/src/match/half-time-tactical-decision.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/match-engine/half-time-substitutions.ts`
- `packages/engine/src/match-engine/half-time-substitutions.test.ts`
- `packages/engine/src/match-engine/staged-match-progression.ts`
- `packages/engine/src/match-engine/staged-match-progression.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add team talks.
- Do not add opponent tactical changes.
- Do not add injuries/cards/extra time/penalties.
- Do not alter first-half results.
- Do not tune match balance to make tactical decisions look stronger.
- Do not persist the decision.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/match/half-time-tactical-decision.test.ts
pnpm exec vitest run packages/engine/src/match-engine/half-time-substitutions.test.ts
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
git diff --check
```

## Done when

- A selected-club half-time tactical plan can be validated as structured data.
- The second half can consume that plan without React/Zustand owning engine
  rules.
- Existing substitution-only behavior remains covered.
- Invalid plans return structured validation facts, not prose.
