# 02 - Engine Staged Match Progression Contract

## Goal

Add a deterministic engine contract for progressing a match by phase instead of
only advancing the selected fixture in one opaque full-time action.

## Scope

Introduce the smallest engine/domain contract needed to represent:

- match phase:
  - `pre_match`;
  - `first_half`;
  - `half_time`;
  - `second_half`;
  - `full_time`;
- future period placeholders as data types only:
  - `extra_time`;
  - `penalties`;
- current minute boundary;
- partial match simulation state;
- first-half report/snapshot;
- final full-time report.

The contract must let the caller:

1. start from prepared match contexts;
2. progress deterministically to half-time;
3. inspect first-half facts;
4. later continue from the stored staged state to full time.

Prefer reusing existing `stepMatch`, `simulateMatchWithManualTactics`, match
state, and report creation primitives. Add new abstractions only where existing
ones cannot express a half-time stop cleanly.

## Expected files

- `packages/domain/src/match/match-phase.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/match-engine/staged-match-progression.ts`
- `packages/engine/src/match-engine/staged-match-progression.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not implement active extra time or penalties.
- Do not add web UI.
- Do not add substitutions yet.
- Do not add player ratings yet.
- Do not change match balance thresholds.
- Do not persist staged state to storage.
- Do not duplicate full simulation logic if existing step/simulation primitives
  can be reused.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
git diff --check
```

## Done when

- Tests prove the same seed and setup produce deterministic half-time and
  full-time staged results.
- Tests prove progressing to half-time does not secretly simulate full time.
- Tests prove continuing from half-time reaches a valid full-time result.
- Extra-time/penalty values exist only as inactive future-safe phase values,
  with no fake behavior.
- Exported functions/types have TSDoc where useful for a junior developer.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
