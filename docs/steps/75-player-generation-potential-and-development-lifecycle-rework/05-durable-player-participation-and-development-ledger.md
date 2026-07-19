# Step 05 - Durable Player Participation And Development Ledger

## Status

Done.

## Goal

Add the minimum durable structured facts required to develop players from real
career participation instead of assumed seasonal activity.

## Inspectable Outcome

- Career state can answer how many minutes, starts, substitute appearances,
  ratings, and played-role minutes each player accumulated in the current
  development month and season.
- The ledger is validated, ordered, deterministic, and presentation-free.
- Reapplying the same fixture contribution cannot count it twice.

## Scope

1. Define one player participation row keyed by player and season/month.
2. Track starts, substitute appearances, minutes, rating sample/count, and
   minutes by canonical played role.
3. Track applied fixture IDs or an equivalent deterministic idempotency key.
4. Add pure create, accrue, close-month, and reset-season operations.
5. Keep match ratings as structured source facts; do not store prose or UI
   labels.
6. Validate non-negative minutes, known players/roles, stable order, and no
   duplicate fixture accrual.
7. Attach the ledger to `CareerState` without yet changing development rates.
8. Document exactly which facts Step 08 will supply and Step 09 will consume.

## Expected Files

- `packages/domain/src/career/player-participation.ts`
- `packages/domain/src/career/player-participation.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/index.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`

## What NOT To Implement

- No growth, decline, selection, storage mapping, report rendering, or UI.
- No per-minute ability mutation.
- No duplicate event log containing facts already owned by match reports.
- No speculative training/staff/personality fields.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/career/player-participation.test.ts packages/domain/src/state/career-state.test.ts
pnpm --filter @game/domain run typecheck
pnpm depcruise
git diff --check
```

## Completion Criteria

- The ledger contract is complete and used by `CareerState`.
- Duplicate fixture application is impossible through the public API.
- No development behavior changed yet.
- Step 06 is the single next action.
