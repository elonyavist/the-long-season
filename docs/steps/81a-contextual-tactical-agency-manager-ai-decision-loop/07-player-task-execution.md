# Step 07 - Player Task Execution

## Status

Closed. Checkpoint B2 recorded `REFINE`: conditioned real formations produce
material local cycles and no universal response, but response ubiquity remains
`6.0026 / 6.3095` against `<= 4`, and two out-of-sample league rows fail local
formation concentration. Step 06C1 attributes those findings before any
gameplay change. This step must not start unless the unchanged B2 gates later
record `GO`.

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
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/engine/src/match-engine/tactical-task-execution.ts`
- `packages/engine/src/match-engine/tactical-task-execution.test.ts`
- `packages/engine/src/match-engine/team-strength.ts`
- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `08-squad-identity-and-lateral-execution.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/tactical-task-execution.test.ts
pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts
pnpm exec vitest run packages/engine/src/match-engine/tactical-shape.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The new executor is canonical rather than shadow, mappings are exhaustive,
`TeamStrength` output remains semantically unchanged, reachability is real, and
Step 08 is the only next action.
