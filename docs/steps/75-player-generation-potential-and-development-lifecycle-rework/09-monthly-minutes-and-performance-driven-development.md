# Step 09 - Monthly Minutes-And-Performance-Driven Development

## Status

Done.

## Attempt Notes

- Replaced positive development with one monthly participation-ledger consumer:
  only open season/month rows with real minutes can produce growth.
- Added deterministic monthly policy helpers for opportunity, age, and bounded
  performance effects.
- Kept decline in the existing seasonal path because Step 11 owns the full
  aging/decline lifecycle.
- Closed processed participation months after development and reset completed
  season participation rows during season rollover.
- Updated focused development and rollover tests to build monthly minutes
  explicitly instead of relying on implicit seasonal growth.

## Goal

Replace once-per-season growth with one slow deterministic monthly development
application driven primarily by age, reachable room, and real minutes.

## Inspectable Outcome

- Development changes appear gradually month by month.
- Players with credible minutes realize more room than unused peers.
- Performance modifies the result by at most approximately `+/-15%`.
- Potential never increases and current ability never exceeds it.

## Scope

1. Replace `developPlayersForSeason` with one production-used monthly entry
   point; do not keep both systems.
2. Derive opportunity bands from real monthly minutes relative to realistic
   available minutes.
3. Use age, role relevance, current-to-potential room, and opportunity as the
   primary growth factors.
4. Derive one bounded performance modifier from rating sample and structured
   contribution facts already owned by the match engine.
5. Cap the performance effect near `+/-15%` and prevent one match from creating
   a visible attribute jump.
6. Keep growth deterministic per player, month, season, and world seed.
7. Close and archive the processed monthly ledger window atomically.
8. Update existing development summaries to report monthly and annual totals
   without duplicating formulas.
9. Delete seasonal-growth helpers and tests after all callers move.

## Expected Files

- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/career/player-development-policy.ts`
- `packages/engine/src/career/player-development-policy.test.ts`
- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `packages/engine/src/index.ts`
- `apps/cli/src/commands/career/development-output.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No daily growth, training, staff, personality, injury, morale, or facility
  modifier.
- No performance-only development.
- No potential increase or current-over-potential repair by raising potential.
- No old seasonal API retained as compatibility code.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-development-policy.test.ts packages/engine/src/career/player-development.test.ts packages/engine/src/career/player-season-rollover.test.ts apps/cli/src/commands/career.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm cli career --save=phase75-development --seed=phase75-development --new-world-preview
pnpm cli career --save=phase75-development --development-report
pnpm depcruise
git diff --check
```

## Completion Criteria

- One monthly API is the only positive-development path.
- Minute and performance bands pass slow-growth examples across ages and roles.
- Potential remains monotone non-increasing and above current.
- Step 10 is the single next action.
