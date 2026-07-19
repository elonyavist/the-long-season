# Step 05 - Senior And Career-Intake Generation Pipeline Consolidation

## Status

Done.

## Goal

Make initial senior squads and later-career intake assemble players through one
deterministic content-owned pipeline while retaining their distinct policies.

## Inspectable Outcome

- One generated-player factory assembles identity, age, role identity, current
  attributes, potential, and dynamic state into the validated domain
  constructor.
- Initial senior generation and later-career intake no longer fork construction
  invariants.
- Division, tier, age, archetype, nationality, and seed behavior remain
  inspectable and deterministic.

## Scope

1. Add one content-local generated-player assembly module.
2. Define a small explicit policy input for values that genuinely differ
   between senior world generation and later-career intake.
3. Route `fake-players.ts` and `career-intake-players.ts` through the shared
   assembly boundary.
4. Keep world/squad orchestration in the existing public generators.
5. Use canonical domain ability/profile/construction contracts.
6. Preserve existing identity pools, bands, rarity budgets, archetypes, player
   IDs, lineup composition, and random draw order where current behavior is
   valid.
7. Add fixed-seed equality and invariant tests for both producer types.
8. Delete duplicated private assembly and potential-clamp helpers.

## Implementation Contract

- The factory is not a generic dependency-injection framework.
- Policy inputs are concrete football-generation facts, not callbacks for every
  field.
- Initial senior and career-intake differences remain named and tested.
- A deterministic output change is allowed only if Step 01 classified an
  existing invariant violation; it must be isolated and recorded with
  before/after evidence.
- No youth path migrates in this step.

## Expected Files

- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/career-intake-players.ts`
- `packages/content/src/generators/career-intake-players.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No youth migration or academy refill change.
- No development, lifecycle, valuation, or storage change.
- No new role, archetype, rarity, or band.
- No random retry loop that changes draw count unpredictably.
- No retained old generator branch.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/generated-player-factory.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/career-intake-players.test.ts packages/content/src/generators/player-generation-quality.test.ts
pnpm --filter @game/content run typecheck
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Once both producer suites pass, delete their duplicate construction and
potential-clamp implementations. Keep public orchestration functions only when
they still own a real current use case.

## Completion Criteria

- Senior and career-intake players use one assembly pipeline.
- Producer-specific policies remain explicit.
- Fixed-seed and role-coherence evidence match the baseline except for any
  isolated documented invariant correction.
- No duplicate construction helper remains in either producer.
- Step 06 is the single next action.
