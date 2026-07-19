# Step 08 - Career Lifecycle Consumer Alignment

## Status

Done.

## Goal

Align exits, youth lifecycle, promotion, and squad turnover with explicit
canonical player ability semantics instead of private unweighted formulas.

## Inspectable Outcome

- Every lifecycle decision states whether it needs role current ability, role
  potential, age, rarity class, squad need, or a raw diagnostic average.
- High/elite AI youth promotion, interesting-player handling, release, and
  turnover remain deterministic and explainable.
- User-club youth decisions remain reported rather than silently automated.

## Scope

1. Migrate `player-exits`, `youth-lifecycle`, `youth-promotion`, and
   `transfer-turnover` to the canonical derived measures classified in Step 01.
2. Preserve each module's ownership and public decision contract.
3. Replace ambiguous local `averageAbilities` helpers with explicit semantic
   calls.
4. Add boundary tests where raw average and role current/potential would choose
   different outcomes.
5. Verify goalkeeper and specialist roles are not penalized by irrelevant
   attributes.
6. Verify user/AI club behavior, academy age-out, promotion, sale/release, and
   squad-size invariants.
7. Delete replaced local helpers and stale exports.

## Implementation Contract

- Do not create one god `playerScore` used for every career decision.
- Each decision names the minimum football facts it needs.
- Existing thresholds remain unchanged unless their units were proven
  semantically wrong; any conversion must preserve the decision boundary or be
  supported by before/after samples and long-run evidence.
- No market valuation change occurs in this step.
- No user-club automatic promotion is introduced.

## Expected Files

- `packages/engine/src/career/player-exits.ts`
- `packages/engine/src/career/player-exits.test.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-lifecycle.test.ts`
- `packages/engine/src/career/youth-promotion.ts`
- `packages/engine/src/career/youth-promotion.test.ts`
- `packages/engine/src/career/transfer-turnover.ts`
- `packages/engine/src/career/transfer-turnover.test.ts`
- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No transfer-market feature expansion.
- No new AI squad-building strategy.
- No youth academy population or rarity change.
- No economy, contracts, wages, staff, or facilities.
- No universal score that hides decision-specific meaning.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-exits.test.ts packages/engine/src/career/youth-lifecycle.test.ts packages/engine/src/career/youth-promotion.test.ts packages/engine/src/career/transfer-turnover.test.ts packages/engine/src/career/player-season-rollover.test.ts
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Remove each local scalar helper when its decision tests prove the canonical
replacement. Do not retain a wrapper with the old ambiguous name.

## Completion Criteria

- Every lifecycle consumer uses an explicit canonical semantic measure.
- Goalkeepers and role specialists receive coherent decisions.
- AI/user behavior and structural squad/youth invariants remain intact.
- No migrated lifecycle duplicate remains.
- Step 09 is the single next action.
