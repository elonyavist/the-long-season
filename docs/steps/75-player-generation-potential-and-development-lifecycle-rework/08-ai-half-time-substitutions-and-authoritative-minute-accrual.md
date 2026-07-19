# Step 08 - AI Half-Time Substitutions And Authoritative Minute Accrual

## Status

Done.

## Goal

Create credible substitute minutes and accrue one authoritative participation
record from committed structured match facts.

## Inspectable Outcome

- AI clubs may make bounded deterministic half-time substitutions.
- Starters, substitutes, unused bench players, ratings, and played roles receive
  exact factual participation rows.
- Reloading or recommitting the same fixture does not duplicate minutes.

## Scope

1. Add one pure AI half-time substitution decision for non-user-controlled
   sides.
2. Use fitness, provisional rating, role coverage, score context, and bench
   quality as bounded inputs.
3. Keep substitutions at half time only; do not build a minute-by-minute
   tactical AI.
4. Preserve selected-club half-time decisions when the user controls the club.
5. Derive exact minutes, starts, substitute appearances, average-rating inputs,
   and played roles from final staged-match facts.
6. Apply the contribution only when the fixture result/checkpoint is committed.
7. Use the Step 05 idempotency contract to reject duplicate accrual.
8. Cover no-substitution, one/multiple substitution, goalkeeper protection,
   unavailable candidate, and interrupted/reloaded match cases.

## Expected Files

- `packages/engine/src/team-selection/ai-half-time-substitution.ts`
- `packages/engine/src/team-selection/ai-half-time-substitution.test.ts`
- `packages/engine/src/team-selection/index.ts`
- `packages/engine/src/match-engine/staged-match-progression.ts`
- `packages/engine/src/match-engine/staged-match-progression.test.ts`
- `packages/engine/src/career/active-match-checkpoint.ts`
- `packages/engine/src/career/active-match-checkpoint.test.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `packages/engine/src/career/player-participation.ts`
- `packages/engine/src/career/player-participation.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No live tactical AI, injury substitutions, red-card reformation, or extra-time
  rules.
- No cosmetic minutes inferred by apps.
- No ledger write before fixture commit.
- No second rating formula.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/team-selection/ai-half-time-substitution.test.ts packages/engine/src/match-engine/staged-match-progression.test.ts packages/engine/src/career/active-match-checkpoint.test.ts packages/engine/src/career/progress-fixture.test.ts packages/engine/src/career/player-participation.test.ts
pnpm --filter @game/engine run typecheck
pnpm depcruise
pnpm check
git diff --check
```

## Completion Criteria

- AI half-time changes are deterministic, bounded, and role-valid.
- Every committed fixture accrues exact participation once.
- Selected-club user decisions remain authoritative.
- Step 09 is the single next action.

## Attempt Notes

- Implemented deterministic AI half-time substitution selection and application
  in `@game/engine`.
- Added authoritative fixture-participation accrual from committed structured
  facts: starters, substitutes, unused bench players, ratings, played roles, and
  fixture idempotency.
- Wired `progressNextCareerFixture` and `commitStagedCareerFixture` so fixture
  participation is accrued only when the fixture result is committed.
- Focused tests, engine typecheck, dependency-cruiser, diff checks, and full
  `pnpm check` pass after updating the affected deterministic CLI snapshots and
  giving the 100-world youth-academy rarity test a runtime budget aligned with
  the heavier Phase 75 generator.
