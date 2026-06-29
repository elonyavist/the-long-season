# 03 - Engine Post-Match Player State Module

## Goal

Implement a pure engine module that applies bounded post-match form and morale
consequences from structured match facts.

This step creates the rule in one place. It must not wire CLI output yet.

## Expected files

- `packages/engine/src/career/career-match-state-consequences.ts`
- `packages/engine/src/career/career-match-state-consequences.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Add a new engine module, tentatively:
   - `packages/engine/src/career/career-match-state-consequences.ts`
2. Export only the useful public types/functions from `packages/engine/src/index.ts`.
3. Implement one pure function, exact name to choose during implementation, with
   responsibilities:
   - accept player states, selected-club id, fixture, match report, selected
     starter IDs, and player/club lookup facts needed for deterministic
     consequences;
   - return copied player states and structured consequence facts;
   - never mutate input;
   - never render labels or prose.
4. Preserve existing fitness helper ownership:
   - do not move or rewrite `applyCareerFixtureConditionConsequences`;
   - form/morale consequences are a companion rule, not a replacement.
5. Add focused tests proving:
   - same input gives same output;
   - input is not mutated;
   - win/loss/performance facts can move form/morale in bounded ways;
   - unrelated/non-starter players do not receive unsupported v1 changes;
   - final values clamp to `0..100`;
   - reason keys are stable.
6. Add TSDoc comments to exported types/functions where useful for a junior
   developer.

## What NOT to implement

- Do not call this module from `progressNextCareerFixture` yet.
- Do not change CLI output.
- Do not change save schema.
- Do not add injuries, team talks, personality, training, or staff effects.
- Do not change match engine probabilities.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- module path;
- adopted function name;
- covered facts;
- verification result;
- next action;
- blocker, if any.

