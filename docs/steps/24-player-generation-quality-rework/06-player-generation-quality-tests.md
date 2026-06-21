# Step 06 - Player Generation Quality Tests

## Goal

Add broad quality tests that prevent regression in generated squads.

## Context

The generator should not rely only on unit tests for small helpers. This step should generate representative squads and assert product-level invariants: third-division players are not broadly overpowered, roles remain coherent, potentials are rare enough, and seeds are deterministic.

## Expected files

- `packages/content/src/generators/*.test.ts`
- `packages/content/src/identity/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add representative generated-league tests for at least two seeds.
- Assert same-seed stability and different-seed variation.
- Assert role-coherence limits in generated squads:
  - ordinary defenders do not exceed configured finishing caps;
  - ordinary attackers do not exceed configured defensive caps;
  - goalkeepers do not look like outfield all-rounders.
- Assert third-division high-current-ability counts are limited.
- Assert high-potential lower-division prospects are rare.
- Assert squad-level output still contains enough variety to be interesting.

## What NOT to implement

- Do not change production code unless a test exposes a real issue inside Phase 24 scope.
- Do not loosen tests just to pass.
- Do not test private implementation details when a public generator output can prove the invariant.
- Do not add snapshot walls that are too brittle to understand.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused content generation tests
- `pnpm check`
- `git diff --check`

## Definition of Done

- Product-level generation invariants are tested.
- Tests would catch a future return to broadly overpowered third-division squads.
- Tests would catch role-incoherent attribute spikes.
- Deterministic seed behavior remains covered.
