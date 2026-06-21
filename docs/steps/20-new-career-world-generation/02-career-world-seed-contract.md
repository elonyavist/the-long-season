# 02 - Career World Seed Contract

## Goal

Add a small durable contract that separates a career world seed from one-off inspection or match simulation seeds.

A world seed defines the generated football world for a career. It must be saved once and reused when the career is loaded. It must not cause players to regenerate differently on every command.

## What to implement

- Add a language-agnostic domain contract for career world generation metadata, including:
  - world seed;
  - generator version;
  - creation mode or source key if useful;
  - enough metadata to reproduce and inspect the generated world.
- Integrate the metadata into career state only if the existing career state is the correct ownership boundary.
- Validate that the world seed is present, non-empty, and deterministic-friendly.
- Add focused tests for valid and invalid world metadata.
- Add TSDoc/JSDoc comments for every new exported type and helper.

## What NOT to implement

- Do not generate new players yet.
- Do not change fake league generation yet.
- Do not change match simulation RNG behavior.
- Do not add UI.
- Do not add youth intake, growth, scouting, staff, market AI, contracts, wages, loans, or transfer windows.
- Do not expose generated potential to the player.

## Expected files

- `packages/domain/src/state/career-world.ts` or the smallest existing domain state file that owns career generation metadata
- `packages/domain/src/state/career-world.test.ts` if a new file is created
- `packages/domain/src/state/career-state.ts` only if career state must persist the metadata
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/03-generated-player-archetypes.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- focused domain tests for career world metadata
- `pnpm check`
- `rg -n "from .*(engine|storage|content|cli|i18n)" packages/domain/src`

## Definition of Done

- Career world metadata exists as durable domain data.
- The contract is language-agnostic and presentation-free.
- A future career create command can persist the world seed without inferring it from match simulation state.
- `docs/PROJECT_STATUS.md` records the adopted contract.
