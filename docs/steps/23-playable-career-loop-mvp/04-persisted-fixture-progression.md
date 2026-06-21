# Step 04 - Persisted Fixture Progression

## Goal

Apply one selected-club fixture simulation result to career state in a deterministic, testable way.

## Context

This step connects the existing match/season primitives to a persisted career state update. It should still be implemented as reusable logic, not as a CLI-only shortcut.

## Expected files

- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Simulate the next selected-club fixture from loaded career state.
- Apply the resulting `MatchReport`/fixture result to the saved `GameState` copy.
- Preserve deterministic seed usage.
- Return a compact progression result for CLI formatting.
- Keep the save write itself outside the pure progression function where practical.

## What NOT to implement

- Do not simulate the full season.
- Do not advance unrelated fixtures unless the step explicitly proves it is required.
- Do not create a general calendar/season transition system.
- Do not add automatic lineup/tactic/market decisions.
- Do not change match-engine scoring algorithms.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- focused progression/career CLI tests
- `pnpm check`

## Definition of Done

- One next selected-club fixture can be simulated and applied to an in-memory career state.
- The operation is deterministic and tested.
- No CLI command writes the change yet unless this step's implementation documents that as necessary.
