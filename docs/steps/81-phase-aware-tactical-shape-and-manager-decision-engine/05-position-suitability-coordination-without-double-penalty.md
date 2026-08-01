# Step 05 - Position Suitability Coordination Without Double Penalty

## Status

Not started.

## Goal

Make natural/adapted/weak/invalid position suitability affect coordinated
tactical execution without applying a second blanket penalty to player quality.

## User-Facing Reason

A talented player used outside his natural position may still perform, but his
timing, coverage, and connection with teammates should be less reliable than a
natural specialist's.

This is the last headless structural milestone. It proves which derived
capacities suitability changes and that no double penalty exists; production
match outcomes remain unchanged until Step 06 consumes those capacities.

## What To Implement

- Derive destination-slot suitability once from player natural positions and
  the typed tactical slot.
- Pass the typed suitability fact into intrinsic shape contribution.
- Apply suitability only to coordination-owned capacities frozen by the
  contract: connection, positioning, pressing cohesion, coverage, and related
  execution/error facts.
- Preserve the existing role-score calculation against destination-role
  ability weights without multiplying its complete result again.
- Keep natural/adapted/weak/invalid exhaustive and ordered by explicit policy.
- Add equal-attribute comparisons, exceptional adapted-player cases,
  goalkeeper isolation, left/right cases, and double-penalty regression tests.
- Remove any duplicated suitability scoring/mapping exposed by integrating the
  canonical domain evaluator.

## Clean-Code Requirements

- `position-suitability.ts` remains the only classification owner.
- Shape policy owns only coordination coefficients, not a second natural-role
  catalog.
- Name affected capacities explicitly; no `applyPenalty(value, boolean)`
  helper.
- Exported comments explain the existing implicit role-weight effect and why
  this modifier is narrower.

## What NOT To Implement

- No universal out-of-position multiplier.
- No role familiarity/training progression.
- No UI warning yet.
- No chance-volume or outcome change except through the intrinsic facts that
  Step 06 will consume.

## Expected Files

- `packages/domain/src/tactics/position-suitability.ts`
- `packages/domain/src/tactics/position-suitability.test.ts`
- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/team-strength.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/tactics/position-suitability.test.ts \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/schemas/match-tactics-calibration.schema.test.ts \
  packages/engine/src/match-engine/tactical-shape.test.ts \
  packages/engine/src/match-engine/tactic-team-context.test.ts \
  packages/engine/src/match-engine/team-strength.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Suitability changes coordinated execution in the documented order.
- Destination-role attributes remain owned by role scoring.
- Tests prove no blanket double penalty.
- Strong adapted players can outperform weak natural players without becoming
  structurally identical.
- No duplicate suitability classifier remains.
- No gameplay-fix claim is made before Step 06 consumes the suitability-aware
  capacities.
- Step 06 is the only next action.
