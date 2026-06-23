# 05 - World Generation Module Deepening

## Goal

Make generated career worlds easier to reason about by clarifying the top-level content generation entry point.

The project should make it obvious where a new career world gets:

- club identities;
- generated squads;
- youth academies;
- nationality mix;
- league system;
- calendar-ready clubs;
- deterministic seed/version metadata.

## Expected files

- `packages/content/src/generators/league-system.ts`
- `packages/content/src/generators/fake-clubs.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- optional new private helper under `packages/content/src/generators/`
- `packages/content/src/index.ts`
- focused content tests for touched files
- `apps/cli/src/commands/career/scenarios.ts`
- focused CLI tests only if scenario composition changes
- `docs/audits/ARCHITECTURE_WORLD_GENERATION_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read:
  - `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md`
  - `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- Inspect current world generation composition.
- Document current entry points and internal generator responsibilities.
- Decide whether to:
  - keep current entry point and improve documentation/tests;
  - create one deeper generator facade inside content;
  - narrow exports only if no active caller needs the internal helper.
- Preserve deterministic outputs unless the audit proves an existing bug.
- Preserve stable club IDs.
- Preserve current player-generation quality gates.
- Keep content free from engine imports.
- Add TSDoc to any new exported generation interface.
- Remove redundant old generator wrappers if they become unused.

## What NOT to implement

- Do not tune generated player attributes.
- Do not change rarity budgets.
- Do not change club naming patterns unless a naming bug blocks the refactor.
- Do not add new countries.
- Do not add new divisions.
- Do not implement promotions, cups, or playoffs.
- Do not move content generation into engine.
- Do not leave duplicate public generation paths.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/initial-youth-academies.test.ts packages/content/src/generators/league-system.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli career --save=phase43-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase43-world --summary`
- `git diff --check`

## Definition of Done

- The world generation flow has one obvious top-level path or a documented reason why the current structure is already sufficient.
- Internal generator responsibilities are documented.
- Deterministic world output remains stable unless an intentional cleanup difference is documented.
- Content package dependency rules remain intact.
- `docs/PROJECT_STATUS.md` points to Step 06 as the next active step.
