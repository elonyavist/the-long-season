# Step 02 - Durable Sale And Loan Availability Postures

## Status

Not started.

## Goal

Let the selected club persist two independent player-market intentions without
changing player value or creating an offer.

## Accepted Semantics

- Independent flags: `In vendita`, `Disponibile in prestito`.
- Both may be active.
- Persist until manually changed.
- Clear on permanent transfer, loan departure, contract exit, or retirement.
- Listing affects AI candidate weight/seller willingness, never public value.
- Unlisted players remain eligible for unsolicited bids.

## What To Implement

- Add durable domain state and typed commands for both postures.
- Validate selected-club ownership and active-loan/contract constraints.
- Integrate automatic cleanup with ownership/contract/retirement paths.
- Persist through JSON and SQLite/OPFS.
- Expose framework-free Squad/Market facts; React UI comes in Step 08.
- Add useful TSDoc/JSDoc for lifecycle and non-value invariants.

## What NOT To Implement

- No incoming offer generation, loan entity, UI controls, or valuation change.
- No screen-local status store and no mutually exclusive enum.

## Expected Files

- `packages/domain/src/career/player-market-posture.ts`
- `packages/domain/src/career/player-market-posture.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/engine/src/career/player-market-posture.ts`
- `packages/engine/src/career/player-market-posture.test.ts`
- relevant transfer/contract/exit cleanup owners from Step 01
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-market-posture.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/player-market-posture.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/ui/src/career/career-squad-view.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/ui run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Flags are independent, durable, idempotent, and correctly cleared.
- Public value is unchanged by posture.
- No incoming offer or loan behavior exists yet.
- Step 03 is the only next action.
