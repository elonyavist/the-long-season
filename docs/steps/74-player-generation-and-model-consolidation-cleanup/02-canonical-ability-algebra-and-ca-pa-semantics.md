# Step 02 - Canonical Ability Algebra And CA/PA Semantics

## Status

Done.

## Goal

Give the domain one canonical 25-attribute vocabulary and one explicit algebra
for reading, traversing, validating, and deriving current/potential ability.

## Inspectable Outcome

- Content and engine can consume the same attribute keys without importing each
  other.
- Raw average, role current ability, and role potential ability have distinct
  names and types.
- Potential-at-least-current is implemented once.
- Unit tests explain every derived value and edge case on the `1..20` scale.

## Scope

1. Add a focused domain player-ability module with the canonical 25 keys.
2. Add typed read/map/fold helpers needed by current producers and consumers.
3. Add one bounded raw-average helper with an explicitly diagnostic name.
4. Add the role-weighted current/potential calculation contract, accepting a
   role profile supplied by the canonical role module completed in Step 03.
5. Add one potential-at-least-current operation and invariant checker.
6. Export the contract from the public domain entry point.
7. Migrate only the smallest existing domain/content callers needed to prove
   the API; broader ownership moves remain in later steps.

## Implementation Contract

- No floating-point rounding occurs inside the canonical calculation unless
  the consumer contract explicitly asks for presentation rounding.
- Current and potential calculations use identical role weights.
- Attribute traversal order is stable and tested because deterministic reports
  and persistence diagnostics may depend on it.
- Helpers are pure and never call RNG.
- The new module may not import content, engine, storage, UI, or app code.
- Step 02 must not move role classification/caps prematurely; Step 03 owns that
  semantic move.

## Expected Files

- `packages/domain/src/player/player-abilities.ts`
- `packages/domain/src/player/player-abilities.test.ts`
- `packages/domain/src/player/index.ts`
- `packages/domain/src/index.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No role table/cap relocation.
- No generator consolidation.
- No development, lifecycle, valuation, report, web, or storage migration.
- No band, rarity, or balance change.
- No compatibility alias with an ambiguous old name.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/player/player-abilities.test.ts packages/domain/src/entities/player.entity.test.ts packages/content/src/generators/fake-players.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Delete any migrated private attribute traversal or potential-clamp helper only
after exact replacement tests pass. Do not leave aliases for internal callers.

## Completion Criteria

- One domain module owns the canonical ability algebra.
- All four semantic concepts in the phase README remain distinguishable.
- The first migrated content path preserves its locked fixed-seed output.
- Dependency direction remains valid.
- Step 03 is the single next action.
