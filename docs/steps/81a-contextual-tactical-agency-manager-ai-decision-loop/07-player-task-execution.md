# Step 07 - Player Task Execution

## Status

Done: implementation accepted, B2 remains `REFINE`. The original entry order assumed the
scalar executor could prove the complete tactical ceiling before player-task
execution existed. Steps 06C1-06C12A repaired diversity and canonical
ownership; 06C13 then proved both result stages coherent while complete-row xG
separation remained small. Keeping this step closed would require tuning a
resolver that has been causally absolved. The frozen B2 gates do not move: this
planned structural mechanism must now face them after implementation.

## Goal

Make attributes decide how well a player executes each tactical task while
`TeamStrength` continues to describe department quality.

## What To Implement

Create one typed, total tactical-task executor. Version the attribute weights for
build-up, wide progression, pressure, transition cover, box entry, and
finalization behind a small Interface. Multiply task execution by the conserved
allocation; do not create a second team-strength field.

Prove equal department strength with different attributes changes expected
tasks; swaps relocate route performance without free strength; no player is best
at everything; and every branch is reachable on generated players.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/domain/src/player/player-abilities.ts`; reuse its existing typed,
  ordered player-ability vocabulary instead of adding a task-only copy;
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/content/src/generators/gameplay-config.ts` and
  `league-system.ts`; delete their mirrored ability-key union and consume the
  domain vocabulary;
- `packages/content/src/generators/fake-players.test.ts`; prove task
  specialization is reached by real generated footballers, not only fixtures;
- `packages/engine/src/match-engine/tactical-task-execution.ts`
- `packages/engine/src/match-engine/tactical-task-execution.test.ts`
- `packages/engine/src/match-engine/team-strength.ts`
- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts` and test; the one
  canonical context builder derives department and task facts in one lineup
  pass;
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts` and
  `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`;
  calibration contract fixtures gain explicit non-shipped task weights;
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`; its
  direct shape producer must use the same task evaluation as production;
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test; rerun the unchanged B2 causal gate on the new executor;
- `packages/simulation-tools/src/index.ts` only if the task-quality diagnostic
  crosses the explicit barrel;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` and
  `report-registry.ts` only if the existing locked profile must forward the
  post-execution decision;
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts`; its
  single generated world no longer reaches the unchanged `500 bp` asymmetry
  branch after task specialization, so the reachability search uses the
  canonical seven-world population without lowering the threshold;
- `docs/audits/PHASE_81A_PLAYER_TASK_EXECUTION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`
- this step document
- `08-squad-identity-and-lateral-execution.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/tactical-task-execution.test.ts
pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts
pnpm exec vitest run packages/engine/src/match-engine/tactical-shape.test.ts
pnpm cli simulation-report --profile=phase81a-b2-downstream-replication \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-player-task-execution.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The new executor is canonical rather than shadow, mappings are exhaustive,
`TeamStrength` output remains semantically unchanged, reachability is real, and
the unchanged B2 gate decides whether Step 08 opens or another attribution is
required.

## Result

One canonical lineup pass now retains the unchanged role-weighted department
score and derives task execution from real attributes. Each task ability row
conserves `10,000` basis points, real generated players invert ordering between
tasks, and removing the task field reproduces old slot scores exactly.

The locked `28`-world checkpoint keeps all `84/84` population rows and Phase 1
green. Mean xG-differential range improves from `0.15434/0.13221` to
`0.16429/0.14743`; optimistic ceiling becomes `+0.02258/+0.02162`, still below
`+0.045`. This is valid football identity, not permission to inflate task
weights. Step 08 owns the remaining lateral execution.
