# Step 03 - Intrinsic Tactical Shape Profile And Diminishing Returns

## Status

Not started.

## Goal

Derive one deterministic intrinsic tactical-shape profile for a selected side,
with explicit phase/channel capacities and diminishing marginal contribution.

## User-Facing Reason

Adding a sixth attacker or an eighth defender should change what the team can
do, but it must not count like six independent full bonuses in the same space.

This is a headless structural milestone. A green Step 03 proves that the engine
can describe the shapes differently; it does not prove that match gameplay or
results changed.

## What To Implement

- Add one versioned, schema-validated match-tactics calibration asset for
  intrinsic contribution weights, diminishing-return bands, and capacity
  clamps. Step 01 froze their admissible mathematical constraints and product
  outcome bands, not arbitrary coefficient values.
- Add domain-owned calibration types consumed explicitly by content and engine.
- Implement one pure intrinsic tactical-shape Module from typed lineup facts,
  role contribution, current tactics where intrinsically relevant, and player
  quality/state inputs.
- Derive the locked in-possession, out-of-possession, and transition
  capacities without reading the opponent.
- Apply deterministic diminishing returns in stable slot order with explicit
  final tie-breaks where ordering matters.
- Preserve player quality: a better player contributes more within the same
  task, while the shape profile remains distinct from `TeamStrength`.
- Validate finite bounded values, policy version, complete union handling, and
  no empty/unknown capacity.
- Add invariants for monotonic positive contribution, decreasing marginal
  contribution, left/right mirror symmetry, goalkeeper isolation, and
  `3-1-6` versus `4-4-2` profile difference.

## Clean-Code Requirements

- One Module owns contribution and diminishing-return math.
- Content stores data only; it does not import engine or duplicate formulas.
- Avoid generic matrix/registry abstractions. Use named football capacities and
  total mappings.
- Delete any superseded local role-count helper or copied clamp discovered in
  the owned files.

## What NOT To Implement

- No opponent comparison, final opportunity multiplier, result, UI, or AI
  choice.
- No formation-specific condition.
- No public 15-zone Interface.
- No implicit default policy.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/domain/src/balance/index.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/schemas/match-tactics-calibration.schema.test.ts \
  packages/engine/src/match-engine/tactical-shape.test.ts \
  packages/engine/src/match-engine/match-context.test.ts \
  packages/engine/src/match-engine/tactic-team-context.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- One explicit policy produces finite bounded intrinsic capacities.
- Initial coefficients respect every Step 01 mathematical constraint and stay
  subordinate to its immutable product outcome bands.
- `3-1-6` and `4-4-2` produce different shape profiles at equal quality.
- Additional contributors help with strictly diminishing marginal value.
- Left/right mirrors are symmetric and no formation name is read.
- `TeamStrength` and shape remain separate concepts.
- No gameplay-fix claim is made: production opportunity and result behaviour
  is intentionally unchanged until Step 06.
- Step 04 is the only next action.
