# 06 - Next Fixture Reactivity And Season Boundary Checks

## Goal

Prove that post-match form/morale changes matter safely after the match without
breaking season boundaries.

This step validates that the changed state can influence the next fixture
through existing team-strength state multiplier curves, and that season rollover
still resets/normalizes state as previously documented.

## Expected files

- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/audits/MATCH_CONSEQUENCES_REACTIVITY_REVIEW.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Add or extend focused tests proving:
   - form/morale changes can alter team strength when state multiplier curves
     are supplied;
   - career CLI progression builds the next fixture contexts from the copied
     post-match state;
   - season rollover still resets form and normalizes morale as intended.
2. Write `MATCH_CONSEQUENCES_REACTIVITY_REVIEW.md` explaining:
   - how the consequence feeds the next match;
   - why the effect is bounded;
   - why this improves user decisions;
   - what remains future work.
3. Keep this step mostly verification/refinement. Only make source changes if a
   test exposes a missing connection inside the Phase 64 scope.

## What NOT to implement

- Do not change multiplier curves just to make an effect larger.
- Do not tune match balance.
- Do not add UI.
- Do not add team-talk/personality/injury systems.
- Do not add fake detailed bench dissatisfaction.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts
pnpm exec vitest run packages/engine/src/career/player-season-rollover.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
test -f docs/audits/MATCH_CONSEQUENCES_REACTIVITY_REVIEW.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- reactivity proof;
- season-boundary proof;
- any source changes made;
- next action;
- blocker, if any.

