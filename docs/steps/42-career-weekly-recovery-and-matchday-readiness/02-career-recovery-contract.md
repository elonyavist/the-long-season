# 02 - Career Recovery Contract

## Goal

Create a pure career recovery helper that applies deterministic day-based fitness recovery to a selected set of players.

## Expected files

- `packages/engine/src/career/career-weekly-recovery.ts`
- `packages/engine/src/career/career-weekly-recovery.test.ts`
- `packages/engine/src/index.ts`, only if a public export is required.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a pure helper for career recovery before a fixture.
- Reuse existing fitness recovery rules instead of duplicating formulas.
- Accept:
  - current players;
  - explicit player IDs to recover;
  - day count;
  - fitness rules.
- Return:
  - updated players;
  - per-player recovery summary;
  - day count used;
  - before and after fitness values.
- Preserve deterministic behavior.
- Preserve copy-on-write behavior.
- Treat zero or negative days as a no-op recovery summary, not an exception.
- Add TSDoc/JSDoc for every exported type and function useful to a junior developer.
- Test:
  - recovery increases fitness;
  - recovery caps at 100;
  - zero-day recovery is a no-op;
  - unrelated players are unchanged;
  - input arrays are not mutated;
  - same input returns same output.

## What NOT to implement

- Do not advance fixtures.
- Do not spend match condition.
- Do not pick a lineup.
- Do not add tactical effects.
- Do not add advice.
- Do not change recovery tuning unless a failing test proves the current contract is impossible.

## Required checks

- Focused tests for the new recovery helper.
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Career recovery has a reusable pure contract.
- The helper is tested independently from CLI output.
- The next step can apply the helper during career fixture advancement.

