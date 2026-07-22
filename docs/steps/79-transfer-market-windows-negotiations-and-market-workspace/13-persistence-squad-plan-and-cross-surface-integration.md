# Step 13 - Persistence, Squad Plan And Cross-Surface Integration

## Status

Ready.

## Goal

Persist every market fact losslessly and make completed or future moves appear
coherently across Squad, Tactics, preparation, Matchday, Dashboard, Market,
Posta, and finance projections.

## User-Visible Outcome

A transfer survives refresh and explicit save, appears in the correct squad
with the correct contract and number, changes budgets once, and never silently
repairs the manager's formation. A future arrival remains visibly future until
its activation date.

## Scope

1. Persist competition-window identity, open negotiations, deadlines,
   outcomes, and preliminary agreements losslessly in JSON and SQLite/OPFS.
2. Bump the beta storage baseline only if Step 01 proves durable schema needs
   it; if bumped, reject/reset the current beta baseline cleanly without a
   compatibility mapper.
3. Round-trip every negotiation state and future agreement with stable IDs and
   dates.
4. Prove pending exposure is recomputed after reload and actual finance remains
   unchanged until completion.
5. On completed incoming transfers, update Squad and selection candidates but
   never insert the player into XI or bench automatically.
6. On completed outgoing transfers, preserve the manager's plan as visibly
   stale/invalid until explicit correction, following Phase 78 eligibility
   rules.
7. On preliminary agreement, show future arrival in Market/player profile but
   not current Squad; on activation, apply the same incoming-transfer squad
   behavior.
8. Reconcile Dashboard budget, Posta facts, player profile, contract history,
   annual payroll, and full-time/season lifecycle after reload.
9. Keep manual and 7/15-day save cadence unchanged; no action-level autosave.

## Implementation Contract

- Storage persists canonical facts, not derived exposure, rendered labels,
  table filters, modal state, or browser timers.
- Schema evolution is one clean beta boundary with no fallback defaults.
- Cross-surface projections read one working session; they do not synchronize
  through component effects.
- Transfer completion and future activation remain engine transactions before
  persistence observes them.

## Expected Files

- current career save envelope, JSON mapper, SQLite schema/migrations/mappers,
  storage contracts, and tests under `packages/storage/`
- current career-state domain contract/tests only where durable facts require
  an explicit field
- current web SQLite worker/runtime/session tests
- focused Squad, Tactics, preparation, Matchday, Dashboard, Market, Posta, and
  profile integration tests only where affected
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No derived exposure persistence, action autosave, UI filter persistence,
  compatibility mapper, silent plan replacement, or partial transfer recovery.
- No second web career store or event bus.
- No broad Finances route.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/storage run test
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Refresh at every negotiation state and before/after a completed transfer and
  preliminary-agreement activation.
- Inspect outgoing selected player, incoming player, future arrival, budget,
  contract, number, history, plan blocker, and Posta state.

## Completion Criteria

- Market state round-trips losslessly through current storage adapters.
- Every cross-surface projection agrees after completion and reload.
- No action-level autosave, derived duplicate state, or compatibility path is
  introduced.
- Step 14 is the only next implementation step.
