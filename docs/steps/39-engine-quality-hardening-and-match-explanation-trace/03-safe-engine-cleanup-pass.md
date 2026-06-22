# Step 03 - Safe Engine Cleanup Pass

## Goal

Apply only the narrow cleanup items approved by Step 02 while preserving
simulation behavior.

## Context

Cleanup is valuable only if it makes the engine easier to reason about without
changing the game. This step should remove local ambiguity, dead code, or
duplication that Step 02 proved real.

## Expected files

- `packages/engine/src/match-engine/simulate-match.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
- `packages/engine/src/match-engine/step-match.ts`
- optional new private engine helper under `packages/engine/src/match-engine/`
- focused tests for touched engine files
- `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Implement only these Step 02 cleanup items:
  - extract the duplicated full-match loop shared by `simulateMatch` and
    `simulateMatchWithManualTactics`;
  - update stale match-engine comments that still describe durable match reports
    as a future step.
- Remove redundant helpers instead of keeping compatibility leftovers.
- Keep public contracts stable unless Step 02 explicitly proves a redundant
  export can be removed safely.
- Add or update focused tests for any touched behavior.
- Prove fixed-seed behavior remains stable with representative CLI commands.
- Record exactly what changed and why it does not alter gameplay.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add explanation trace yet.
- Do not tune config values.
- Do not optimize loops unless Step 02 proved a blocker.
- Do not rewrite aggregate chance resolution.
- Do not split `simulate-season.ts`.
- Do not split CLI modules.
- Do not move or rename gameplay calculator weights.
- Do not keep old wrappers or aliases unless they still have active callers.
- Do not start Step 04.

## Required checks

- `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Approved cleanup items are implemented or explicitly deferred with reason.
- No dead compatibility leftovers are introduced.
- Fixed-seed behavior remains stable or any difference is justified by a proven
  bug fix.
- `docs/PROJECT_STATUS.md` points to Step 04 as the next active step.
