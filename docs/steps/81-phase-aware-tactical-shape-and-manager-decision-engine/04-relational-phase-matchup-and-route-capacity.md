# Step 04 - Relational Phase Matchup And Route Capacity

## Status

Not started.

## Goal

Compare two intrinsic profiles through own-chain bottlenecks and complementary
opponent capacities, without yet changing match outcomes.

## User-Facing Reason

A formation has strengths and weaknesses, but their match impact depends on
what the opponent presses, protects, concedes, and leaves open.

This remains a headless structural milestone. A green Step 04 proves that the
relational explanation is coherent, not that the user-visible match defect has
already been fixed.

## What To Implement

- Implement one pure relational tactical-matchup Module.
- Compare own build-up/progression/final-third chains and the opponent's
  pressing, channel coverage, box protection, counter threat, and rest
  defence.
- Produce named bounded route capacities for central, left, right, direct, and
  transition paths, or the exact route set frozen by Step 01.
- Keep attack and defence views complementary and deterministic under side
  reversal.
- Use explicit bottleneck/combination math from versioned policy; do not hide
  semantics inside a generic scoring registry.
- Add tests for ordinary symmetry, flank overload, `3-1-6`, `2-0-8`, `8-0-2`,
  coherent/incoherent pressing, stronger-team quality, and no `NaN`/negative
  or unclamped value.
- Expose matchup facts through the match explanation trace for diagnostics
  only; production opportunity behaviour remains unchanged until Step 06.

## Clean-Code Requirements

- Intrinsic shape never imports or calls relational matchup.
- One relational Module owns every attack-versus-defence comparison.
- Tests cross the public Interface; do not assert private arithmetic line by
  line when an invariant covers it.
- Remove any superseded diagnostic-only matchup calculation rather than
  retaining two owners.

## What NOT To Implement

- No chance-volume, quality, actor, score, UI, or AI behaviour change.
- No global formation ranking.
- No opponent data cached in intrinsic shape.
- No random value.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/match-engine/tactical-matchup.ts`
- `packages/engine/src/match-engine/tactical-matchup.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
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
  packages/engine/src/match-engine/tactical-matchup.test.ts \
  packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Intrinsic and relational Modules are separate and deterministic.
- Each supported route has a bounded named capacity.
- Own-chain bottlenecks and opponent resistance both affect matchup facts.
- Side/channel mirror invariants pass.
- Match results remain unchanged in this step.
- No end-to-end gameplay-fix claim is made before Step 06 consumes the matchup.
- Step 05 is the only next action.
