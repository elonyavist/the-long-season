# Step 01 - Season Completion Contract

## Goal

Define how the engine knows a season is complete.

## Context

Long-run simulation needs a reliable season boundary. The engine must not rely on presentation output to decide when a season ended.

## Expected files

- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/career/season-completion.ts`
- `packages/engine/src/career/season-completion.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a pure engine function that checks whether all current-season fixtures are played.
- Return a typed result, not a boolean only.
- Keep season completion independent from storage and CLI.
- Add tests for complete, incomplete, and invalid fixture references.
- Document exported contracts with TSDoc.

## What NOT to implement

- Do not create the next season yet.
- Do not archive history yet.
- Do not age players yet.
- Do not implement promotions/relegations.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/season-completion.test.ts packages/domain/src/state/career-state.test.ts`
- `pnpm check`

## Definition of Done

- Season completion is a pure, tested engine concept.
- No storage or CLI code decides completion itself.

