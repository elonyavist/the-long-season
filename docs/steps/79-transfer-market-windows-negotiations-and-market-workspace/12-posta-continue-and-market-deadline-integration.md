# Step 12 - Posta, Continue And Market Deadline Integration

## Status

Ready.

## Goal

Make market replies and deadlines part of the existing day-by-day attention
workflow without turning all transfer activity into bureaucracy.

## User-Visible Outcome

Continue advances normally, then stops on a real offer response, counteroffer,
expiring decision, completed transfer, or failed agreement that needs the
manager. Posta explains what changed and opens the correct action directly.

## Scope

1. Add structured selected-club attention facts for club replies, player
   replies, counters, deadlines, completion, expiry, withdrawal, preliminary
   agreement, future activation, and unaffordable cancellation.
2. Mark only actionable selected-club replies and deadlines as blocking.
3. Keep AI transfers and routine completed facts informational and bounded;
   do not stop Continue for unrelated market traffic.
4. Batch same-date market facts through the existing stable attention order.
5. Route every actionable message to the exact Market negotiation or player
   detail state.
6. Resolve messages from underlying negotiation state, not from a UI flag.
7. Prevent duplicate messages across reload, repeated Continue, or idempotent
   resolution.
8. Preserve current-season Inbox reset and explicit save cadence.

## Implementation Contract

- Engine facts remain structured; Posta owns wording and hierarchy.
- Continue remains a canonical day-scanning use case and does not poll browser
  timers.
- A response may arrive within three days, but visual timing never controls
  game-date progression.
- Market messages extend the existing attention taxonomy; they do not create a
  second inbox.

## Expected Files

- current attention, Inbox, Continue, market progression, and selected-club
  workflow Modules/tests under `packages/domain/` and `packages/engine/`
- focused Market/Posta view-model updates and tests under `packages/ui/`
- current Posta route/components and runtime command adapters under `apps/web/`
- `packages/i18n/` labels/tests required by visible copy
- current SQLite/OPFS browser QA only where message durability is proved
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No generic news feed, rumor feed, transfer ticker, duplicated inbox, or stop
  for every AI action.
- No prose facts in domain/engine.
- No hidden selected-club decision or auto-resolution.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Advance through accepted, countered, rejected, deadline, completed,
  preliminary-agreement, and unaffordable-cancellation days.
- Confirm one click from an actionable message reaches the exact decision and
  that routine AI activity does not interrupt the manager.

## Completion Criteria

- Market attention is durable, deduplicated, correctly blocking, and routed.
- Continue stops only for real selected-club decisions.
- Posta and Market agree after reload and resolution.
- Step 13 is the only next implementation step.
