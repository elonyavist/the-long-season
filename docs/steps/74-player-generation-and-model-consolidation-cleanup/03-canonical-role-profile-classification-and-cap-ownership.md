# Step 03 - Canonical Role Profile, Classification, And Cap Ownership

## Status

Done.

## Goal

Move stable role attribute meaning and global hard caps to one domain-owned
source consumed by both generation and development.

## Inspectable Outcome

- Each canonical player role has one profile describing weighted attributes,
  classification buckets, and global caps.
- Content generation and engine development no longer maintain parallel role
  tables.
- Defenders, attackers, midfield variants, full-backs, wing-backs, and
  goalkeepers preserve the role-coherence rules established in Phase 33.

## Scope

1. Convert the existing role attribute classification/cap contract into a
   domain module aligned with `PlayerRole`.
2. Encode one exhaustive profile for every canonical role.
3. Keep generation-specific ranges and division/tier bands in content.
4. Migrate content role templates to consume domain profiles.
5. Migrate the development engine's duplicated role classification and caps to
   consume the same profiles.
6. Add exhaustive tests for role coverage, bucket disjointness, weights, cap
   bounds, and known defender/attacker/goalkeeper invariants.
7. Delete the replaced content/engine tables and obsolete exports.

## Implementation Contract

- Role profiles are stable football invariants; generation distributions are
  policies and remain outside domain.
- Every attribute must have a deliberate classification for each role.
- Weight normalization is explicit and identical for current and potential
  ability.
- Existing hard caps are preserved unless the Step 01 baseline proves a
  contradiction. Any intentional cap change requires before/after evidence in
  this step and must remain narrowly isolated.
- Tactical-board zones and role suitability behavior are out of scope.

## Expected Files

- `packages/domain/src/player/player-role-profile.ts`
- `packages/domain/src/player/player-role-profile.test.ts`
- `packages/domain/src/player/index.ts`
- `packages/domain/src/index.ts`
- `packages/content/src/generators/player-role-attribute-classification.ts`
- `packages/content/src/generators/player-role-attribute-classification.test.ts`
- `packages/content/src/generators/player-role-templates.ts`
- `packages/content/src/generators/player-role-templates.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No formation, position, tactical-board, or role-familiarity redesign.
- No current-ability band or rarity-budget tuning.
- No development-rate change beyond consuming the same profile/cap truth.
- No broad `Player` constructor change; Step 04 owns it.
- No duplicate compatibility table.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/player/player-role-profile.test.ts packages/content/src/generators/player-role-attribute-classification.test.ts packages/content/src/generators/player-role-templates.test.ts packages/content/src/generators/player-generation-quality.test.ts packages/engine/src/career/player-development.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

The phase may keep content-level generation ranges, but no second role
classification/cap truth may remain in content or engine.

## Completion Criteria

- Domain owns one exhaustive role profile/cap source.
- Content and engine consume it without forbidden dependencies.
- Existing role-coherence tests and fixed-seed generation evidence pass.
- Replaced tables/exports are gone.
- Step 04 is the single next action.
