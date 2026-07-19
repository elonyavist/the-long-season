# Step 04 - Validated Player Construction Contract

## Status

Done.

## Goal

Introduce one domain boundary that validates every newly created player before
the value can enter a game world or career intake.

## Inspectable Outcome

- Invalid attribute ranges, potential below current, incomplete role identity,
  and inconsistent natural-position/role combinations fail with typed reasons.
- Valid legacy-compatible and newly generated players are clearly
  distinguished.
- New producers have one obvious construction API rather than object literals
  spread across generator files.

## Scope

1. Define a validated player-construction input using existing domain types.
2. Validate IDs, identity fields, age/date assumptions available at
   construction, positions, role identity, current attributes, potential, and
   dynamic-state bounds.
3. Return a typed validation result or domain error; do not throw generic
   strings from normal validation.
4. Preserve a separate deterministic normalization boundary for supported
   historical saves, to be wired only in Step 10.
5. Add focused happy-path and invariant-failure tests.
6. Route one current generator path through the constructor to prove the
   contract while preserving exact output.
7. Document the constructor and validation flow for junior navigation.

## Implementation Contract

- The constructor validates; it does not generate names, attributes, roles,
  potential, or random values.
- No RNG is accepted by the constructor.
- Validation must not mutate its input.
- New construction requires complete role identity established by current
  generation rules.
- The public durable `Player` shape changes only if the Step 01 migration
  decision and Step 10 plan support it.
- Historical normalization may not guess through randomness.

## Expected Files

- `packages/domain/src/player/create-player.ts`
- `packages/domain/src/player/create-player.test.ts`
- `packages/domain/src/player/index.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/entities/player.entity.ts`
- `packages/domain/src/entities/player.entity.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No generated-player factory yet.
- No senior/youth/intake output change.
- No storage schema/version change.
- No recovery UI or localized validation copy.
- No abstract builder hierarchy or mutable `PlayerBuilder`.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/player/create-player.test.ts packages/domain/src/entities/player.entity.test.ts packages/content/src/generators/fake-players.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Remove the migrated producer's duplicate inline validation only after the
domain boundary covers it. Do not keep a permissive alternate constructor for
new generated players.

## Completion Criteria

- New player construction has one pure, validated domain entry point.
- Typed tests cover every invariant named by this step.
- The proving generator preserves deterministic output.
- Historical-save handling remains explicit and deferred to Step 10.
- Step 05 is the single next action.
