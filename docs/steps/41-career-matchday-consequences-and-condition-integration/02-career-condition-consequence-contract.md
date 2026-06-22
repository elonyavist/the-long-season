# Step 02 - Career Condition Consequence Contract

## Goal

Define the deterministic condition consequence contract for one played career
fixture before wiring it into progression.

## Context

The game already has simple fitness rules from earlier phases. This step should
make the career-specific contract explicit: who pays condition, when recovery is
applied, what gets returned to the CLI, and what remains out of scope.

## Expected files

- `packages/engine/src/career/career-condition-consequences.ts`
- `packages/engine/src/career/career-condition-consequences.test.ts`
- `packages/engine/src/index.ts`, only if a public export is needed
- `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Add a pure engine helper that applies condition consequences for one fixture.
- Reuse existing player-state/fitness concepts where possible.
- Require explicit selected lineup player IDs from the caller.
- Spend match fitness only for selected starters.
- Preserve copy-on-write state behavior.
- Return a small structured summary suitable for CLI output:
  - player ID;
  - before fitness;
  - after fitness;
  - delta;
  - whether the player started.
- Keep recovery rules explicit but do not apply cross-day recovery unless this
  step proves the existing career date transition requires it.
- Add focused tests for starter spend, non-starter preservation,
  determinism, and no mutation.
- Update the audit and status.

## What NOT to implement

- Do not wire into `career --advance-next-fixture` yet.
- Do not add injuries, morale, form, or medical rules.
- Do not auto-rotate players.
- Do not change match outcomes.
- Do not store rendered text.

## Required checks

- `pnpm exec vitest run packages/engine/src/career/career-condition-consequences.test.ts`
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The condition consequence contract is pure, deterministic, and tested.
- The helper does not mutate input career/player state.
- The helper does not choose players.
- The next action is Step 03.
- `docs/PROJECT_STATUS.md` is updated.
