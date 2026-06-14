# Team Strength

## Goal

Calculate deterministic `TeamStrength` from a lineup, player abilities, player dynamic states, and role-weight data supplied by the caller.

## Why we implement it this way

The first match engine must use rich player data without reading all details directly as bespoke logic. `requirements.md` says role weights are data, not engine constants, and the engine imports only `domain` and `shared`. This keeps tuning outside engine code while preserving deterministic, testable strength calculation.

## What to implement

- `TeamStrength` type with `attack`, `midfield`, `defense`, `goalkeeper`, and `overall`.
- `RoleWeightProfile` and `LineupSlot` input types if they are not already in domain.
- `deriveTeamStrength(input)` in engine.
- Role-score calculation as weighted sum of ability values.
- Department aggregation by explicit ordered lineup slots.
- Fitness, form, and morale multipliers only if their curve data is supplied as input.
- Deterministic tie-free calculations with no random calls.

## What NOT to implement

- Do not hardcode role weights in engine.
- Do not import `content`.
- Do not generate lineups.
- Do not implement tactical familiarity, out-of-position penalties, role-variant fit, match events, shots, or goals unless already required by this step.
- Do not use RNG.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/team-strength.ts`
- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/index.ts`
- Domain files only if a shared type clearly belongs in `domain`.

## Required tests

- Stronger ability values produce higher strength.
- Department weights affect the correct department.
- Input arrays are not mutated.
- Missing player or missing role weight fails with a typed error.
- Repeated calls with the same input return the same result.

## Definition of Done

- `deriveTeamStrength` is pure and deterministic.
- Engine imports no content.
- Role weights are passed in as data.
- Tests cover strength ordering and immutability.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only team strength calculation from `docs/steps/01-match-engine/01-team-strength.md`. Keep weights as input data and keep engine imports limited to domain and shared. Do not implement match simulation.
