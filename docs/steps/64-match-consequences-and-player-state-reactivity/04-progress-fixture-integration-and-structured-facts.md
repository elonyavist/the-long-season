# 04 - Progress Fixture Integration And Structured Facts

## Goal

Wire the new post-match state consequences into the canonical selected-club
fixture advancement path.

`progressNextCareerFixture` should remain the one selected-club matchday entry
point and should return structured consequence facts alongside existing
condition changes.

## Expected files

- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/career/career-match-state-consequences.test.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Call the new form/morale consequence module from `progressNextCareerFixture`
   after the fixture result is applied and after existing condition spend has
   produced the current post-match player states.
2. Keep the order explicit:
   - simulate fixture;
   - create/apply match report;
   - apply selected-club condition spend;
   - apply selected-club form/morale consequences;
   - create copied `CareerState`;
   - return structured facts.
3. Extend the successful `ProgressCareerFixtureAdvanced` result with a
   language-agnostic consequence collection, for example:
   - `playerStateConsequences`;
   - aggregate counts and reason keys if useful.
4. Preserve existing `conditionChanges` for compatibility with current CLI
   output.
5. Update tests to prove:
   - selected starters can have changed form/morale after a played fixture;
   - fitness spend behavior from previous phases is unchanged;
   - explanation trace behavior is unchanged except for existing condition
     facts;
   - no fixture is simulated when validation fails;
   - deterministic sentinel remains stable after updating expected facts.

## What NOT to implement

- Do not add CLI rendering in this step.
- Do not change `advanceCareerOneSeason`.
- Do not alter recovery rules.
- Do not add state changes for unsupported bench/substitution facts.
- Do not change match balance.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- integration order;
- returned structured facts;
- preserved behavior;
- verification result;
- next action;
- blocker, if any.

