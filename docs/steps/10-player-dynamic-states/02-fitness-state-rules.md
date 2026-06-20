# Fitness State Rules

## Goal

Create deterministic engine rules for spending and recovering player fitness.

## Why we implement it this way

`PlayerDynamicState.fitness` already exists in domain on a `0..100` scale. This step should define how that value changes without wiring it into match or season simulation yet.

Keeping the rules pure and isolated makes later integration easier to test. We should be able to prove that a player who appears in a match spends fitness, a player who rests recovers, values remain clamped, and the same inputs always produce the same state.

This step is about state transition rules only. It should not affect scores, tables, match reports, or CLI output yet.

## What to implement

- Add an engine-local player-state module for fitness rules.
- Define a minimal `FitnessRules` or equivalent config with:
  - base match fitness cost;
  - optional per-minute or full-match cost if needed;
  - daily recovery amount;
  - min/max clamp using the existing `StateValue` scale.
- Add pure helpers to:
  - spend fitness for an ordered list of player IDs;
  - recover fitness over a positive number of calendar days;
  - preserve unchanged state for players not included in the operation;
  - fail clearly or ignore explicitly when a player ID is missing, depending on the documented helper contract.
- Use explicit ordered player ID arrays for deterministic updates.
- Add focused tests for:
  - full-fitness player spends fitness after one match;
  - resting player recovers fitness over days;
  - values never leave `0..100`;
  - players outside the selected ordered IDs are unchanged;
  - repeated calls with the same input produce identical output.

## What NOT to implement

- Do not wire fitness into `simulateSeason`, `deriveTeamStrength`, `buildTacticTeamContext`, CLI, balance report, or fake content yet.
- Do not implement form, morale, injuries, training, staff, player growth, aging, match ratings, tactical familiarity, substitutions, or automatic lineup rotation.
- Do not add random variation to fitness spend or recovery.
- Do not mutate input state in place.
- Do not change existing match results, season output, or calibration behavior.

## Allowed dependencies

- `engine -> domain, shared`
- `domain -> nothing` only if a tiny exported helper is truly needed, but prefer existing `stateValue`.

## Expected files

- `packages/engine/src/player-state/fitness.ts`
- `packages/engine/src/player-state/fitness.test.ts`
- `packages/engine/src/player-state/index.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` only if the rule contract changes the next step scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/player-state/fitness.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Fitness spend/recovery rules exist as pure deterministic engine helpers.
- Inputs are not mutated.
- Fitness values are clamped through the existing domain `StateValue` scale.
- No season, match, CLI, or balance output changes in this step.
- `docs/PROJECT_STATUS.md` records the adopted rule values and next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only pure deterministic fitness spend/recovery rules. Do not wire them into season simulation or CLI yet. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what remains unchanged, and stop.
