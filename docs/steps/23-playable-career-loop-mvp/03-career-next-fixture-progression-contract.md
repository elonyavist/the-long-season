# Step 03 - Career Next Fixture Progression Contract

## Goal

Create a pure contract for finding and preparing the next selected-club fixture progression.

## Context

The playable loop needs to advance from persisted state. Before writing save changes, the engine/application layer needs a deterministic way to identify the next fixture involving the selected club and prepare the inputs required to simulate it.

## Expected files

- `packages/domain/src/**/*.ts`
- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add or reuse a pure function that identifies the next unplayed fixture for the selected club.
- Return a typed result for `next fixture found`, `no fixture available`, and invalid state.
- Keep the function independent from CLI and storage.
- Do not mutate `GameState`.
- Add focused tests for deterministic fixture selection and edge cases.

## What NOT to implement

- Do not simulate the fixture yet.
- Do not persist changes.
- Do not create CLI output.
- Do not add season transitions.
- Do not add automatic lineup or tactic decisions.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- focused engine/domain tests
- `pnpm check`

## Definition of Done

- The next selected-club fixture can be found deterministically from saved state.
- Edge cases are explicit and typed.
- No persistence or CLI behavior has been added in this step.
