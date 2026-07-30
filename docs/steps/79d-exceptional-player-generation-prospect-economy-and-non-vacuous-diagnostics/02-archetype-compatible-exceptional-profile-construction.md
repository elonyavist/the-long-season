# Step 02 - Archetype-Compatible Exceptional Profile Construction

## Status

Done.

## Goal

Replace the precedence bug and incompatible post-generation forcing with one
deterministic constructive path that preserves exceptional slot control while
respecting the intended current-star and potential-prodigy archetypes.

## Expected Files

- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-archetypes.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-allocation.test.ts`
- `packages/content/src/generators/generated-player-factory.ts`
- `packages/content/src/generators/generated-player-factory.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/content/src/index.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/02-archetype-compatible-exceptional-profile-construction.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add the failing joint-profile fixtures first, then correct the implementation
  inside this step.
- When an ID is both current-six and potential-six, select the current-star
  archetype lane before the potential-only prodigy lane.
- Preserve the intended `category_star` age contract for initial current-six
  players and the `rare_prodigy` contract for potential-only exceptional
  players.
- Replace Boolean-precedence ambiguity with one explicit exceptional-profile
  classification if that produces a clearer single owner.
- Construct current and potential attributes within the chosen lane; do not
  generate an incompatible profile and then blindly raise it.
- Any minimum-role-ability adjustment must remain bounded by:
  - the chosen archetype;
  - age/current-quality compatibility;
  - role hard caps;
  - potential-at-least-current;
  - deterministic termination.
- Preserve same-seed identity, role coherence, attribute range `1..20`, and
  existing division placement.
- Remove the unreachable branch or obsolete helper exposed by the correction;
  do not keep a compatibility path with no caller.

## What NOT To Implement

- No rarity-count reconciliation, annual intake wiring, valuation, asking
  price, AI, diagnostics gate, or UI change.
- No unbounded rejection sampling.
- No named player or seed-specific override.
- No new public rating scale or exact-potential output.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/generators/player-archetypes.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/player-current-profile-policy.test.ts \
  packages/content/src/generators/player-potential-allocation.test.ts \
  packages/content/src/generators/generated-player-factory.test.ts \
  packages/content/src/generators/player-generation-quality.test.ts
pnpm --filter @game/content run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- A forced current-six player cannot take the incompatible `15..18`
  potential-only prodigy lane.
- Potential-only prodigies remain young prospects rather than being made
  current champions.
- The joint age/current/potential fixtures pass across several fixed seeds.
- Construction terminates deterministically without a fallback that violates
  the selected archetype.
- No obsolete precedence branch or forcing helper remains.
