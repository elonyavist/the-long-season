# Step 07 - AI Pre-Match Squad Selection And Rotation

## Status

Done.

## Goal

Make AI clubs choose credible match squads across a season so minutes are
distributed by football need instead of reusing one fixed XI forever.

## Inspectable Outcome

- AI clubs select one valid XI and bench from their current roster.
- Selection balances role coverage, current role ability, fitness, recent use,
  and prospect opportunity through bounded deterministic rules.
- The user-selected club's saved lineup is never silently replaced.

## Scope

1. Add one pure AI squad-selection entry point.
2. Require valid goalkeeper, defensive, midfield, and attacking coverage for
   the selected formation.
3. Rank candidates by role current ability and familiarity, then apply bounded
   fitness, recent-minutes, and prospect-opportunity adjustments.
4. Prefer a strong adaptable player over a much weaker natural player when the
   canonical suitability contract supports the role.
5. Rotate without making the AI intentionally field implausible teams.
6. Keep stable player-ID tie-breaking and deterministic formation inputs.
7. Integrate the selector into season simulation and AI sides in career match
   context construction.
8. Return structured selection reasons for diagnostics only.

## Expected Files

- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `packages/engine/src/team-selection/index.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/index.ts`
- `packages/simulation-tools/src/long-run/player-evolution.ts`
- `packages/simulation-tools/src/long-run/player-evolution.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No manager auto-selection change for the selected club.
- No transfer, contract, injury, training, or tactical-learning AI.
- No hidden result optimization or opponent-specific cheating.
- No half-time substitution; Step 08 owns that decision.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/team-selection/ai-squad-selection.test.ts packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/career/progress-fixture.test.ts packages/simulation-tools/src/long-run/player-evolution.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm cli simulate-season --seed=phase75-rotation-a
pnpm cli simulate-season --seed=phase75-rotation-b
pnpm depcruise
git diff --check
```

## Completion Criteria

- AI season and career match paths use one selector.
- Role coverage, fitness protection, selected-club ownership, and deterministic
  ordering pass.
- One-season squad-use evidence shows credible rotation without random teams.
- Step 08 is the single next action.

## Completion Notes

- Added one deterministic AI squad-selection module in `@game/engine`, including
  structured diagnostics, stable tie-breaking, role suitability scoring,
  fitness/recent-use/prospect modifiers, and a match-context builder.
- Integrated the selector into season simulation and non-selected career match
  contexts while preserving user ownership of the selected club lineup.
- Verified focused team-selection, season, fixture, and long-run tests; engine
  and simulation-tools typechecks; two fixed-seed season simulations;
  dependency-cruiser; and whitespace checks.
