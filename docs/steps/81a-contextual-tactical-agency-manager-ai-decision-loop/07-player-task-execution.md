# Step 07 - Player Task Execution

## Status

Closed; Checkpoint B recorded `STOP / RETHINK` on 2026-08-08. The complete
combined action space produced only `2 / 198` effective best responses,
ubiquity `121`, no material cycle and one dominant row. Design Contract
Amendment A1 assigns league-level population ownership to Step 06A, the
longitudinal `100 x 10` to Checkpoint L1 / Step 06B, and the conditioned tactical
retry to Checkpoint B2 / Step 06C. This step must not start unless L1 and B2
record `GO` without moving the frozen targets.

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
