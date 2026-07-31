# Step 01 - Race Contract, Versioned Policy And Exhaustiveness Guard

## Status

Not started.

## Goal

Freeze the `PlayerTransferRace` contract, the accepted product decisions, its
versioned numeric policy, and the invariants that make competing bids safe,
before any resolution behaviour exists. This step adds types, schema,
validation, and tests only.

## Accepted Product Decisions

- Only the highest seller-acceptable permanent fee and exact matches qualify;
  lower acceptable fees close as `outbid`.
- Loans remain serial in the initial release; permanent and free-agent
  approaches are the supported race kinds.
- One race permits at most three active acquiring clubs. A closed participant
  frees a place before the deadline; a fourth active join is rejected as
  `race_participant_limit_reached`.
- A free agent always receives the shared three-day player stage, even with one
  suitor.
- A manager-owner's acceptance records seller acceptability but never closes
  the club stage early.
- Club and player stages each last exactly three in-game days, independently,
  capped by the applicable window close.

## Why This Step Exists Separately

Phase 79D proved the pattern: a headless contract step before integration makes
later expansion cheap and keeps the seam testable without a UI. It also keeps
the one dangerous behaviour change — the seller no longer accepting immediately
at the asking price — out of a step that is already introducing new types.

## Expected Files

- `packages/domain/src/career/player-transfer-race.ts`
- `packages/domain/src/career/player-transfer-race.test.ts`
- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/domain/src/index.ts`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/content/src/index.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/transfer-player-negotiation.ts`
- `packages/engine/src/career/transfer-player-negotiation.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/ui/src/career/career-market-view.ts`
- `packages/ui/src/career/career-market-view.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `apps/cli/src/commands/career/market-demo.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `docs/steps/80c-competitive-transfer-race-and-player-choice/01-race-contract-policy-and-exhaustiveness-guard.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Race Contract

- `PlayerTransferRace` groups canonical negotiations for one player through
  discriminated references such as `{kind, negotiationId}`. It stores the
  player, those references, current stage plus shared stage clock, and outcome.
- It must not store fees, contract terms, or negotiation status. The race owns
  the only effective clock for its coordinated stage; a referenced negotiation
  must not expose a second effective clock. One fact, one owner.
- A race is validatable from durable state alone; no UI flag and
  no presentation input may affect it.
- Validation rejects: a race with an unknown negotiation ID, negotiations for a
  different player, a duplicate negotiation ID, two open races for one player,
  more than three active acquiring clubs, an unsupported loan-race reference,
  and a deadline outside the applicable registration window.

## Shared Stage-Clock Invariants

- A stage clock is fixed when that stage opens and is immutable afterwards.
- A negotiation joining the club stage inherits its remaining deadline.
- Joining never extends the stage deadline or any participant's deadline;
  the locked rule that a counter never resets a deadline also binds here.
- The stage deadline never exceeds the earliest applicable window close when
  that negotiation kind is window-bound.
- The club-to-player transition creates one new shared player-stage clock.
  This is a new table; no counter within either stage may reset its clock.
- A free-agent race starts directly with a player-stage clock.
- Assert directly in this step, not only through a downstream gate:
  `deadline(join) == deadline(clubStageOpen)` for every late club-stage joiner,
  and exactly one clock is effective for each `(race, stage)`.

## Versioned Comparison Policy

Add one schema-validated policy to the existing market-behaviour calibration
asset. Engine consumes it explicitly; no content import and no implicit default.

- Minimum raise increment, expressed in integer basis points of the current best
  offer, with an absolute integer-minor-unit floor.
- Maximum active participants, fixed to `3`.
- Club-stage and player-stage response durations, each fixed to three in-game
  days and capped by applicable windows.
- Player-stage comparison weights for wage, contract length, promised squad
  status, and club standing.
- Every coefficient is labelled explicit game design, not sourced market
  evidence.
- Freeze diagnostic observation definitions and calibration bands before
  behaviour lands. Later diagnostic or cohort steps may report or fail them but
  may not choose thresholds after seeing results.

Declare the two domain-specific decision owners in this step as typed contracts
with tests, even though their behaviour lands later:

- `deriveClubStageResolution(...)`, returning named qualified, outbid, and
  rejected negotiation IDs rather than one premature winner;
- `rankPlayerSuitors(...)`.

Both take facts plus versioned policy and produce deterministic output with a
stable final tie-break where one winner is actually required. Configuration
owns tunable numeric coefficients; a future criterion with new semantics still
requires an explicit typed code change and must not be hidden in a generic
registry.

## Exhaustiveness Guard

`projectTransferNegotiation` in `selected-club-market-workflow.ts` is a `switch`
over negotiation status returning `ProjectedMarketMessage | undefined` with no
`default`, and `tsconfig.base.json` sets `strict` but not `noImplicitReturns`.

Future `outbid` or `lost_to_rival` statuses would therefore compile cleanly,
fall through, and produce no Posta message. The existing `withdrawn` status
also becomes a race transition with more consumers. Without total mappings the
manager could be left without an explanation of why the race ended.

- Inventory every negotiation-status consumer in domain validation, engine
  projection/resolution, storage mapping, UI projection, CLI reporting, and
  diagnostics before adding `outbid` or `lost_to_rival` and before extending
  existing `withdrawn` into race coordination.
- The current repository inventory already reaches the domain negotiation
  union, engine seller/player/AI resolution, SQLite mapper/schema, `@game/ui`
  market projection, web adapter/dialog, long-run finance diagnostics, the
  canonical CLI market demo, and CLI report projection. Those owners and their
  focused tests are therefore explicitly included in this step's Expected
  Files; discovering another production consumer requires documenting it here
  before modifying it.
- Add explicit `never` guards so an unhandled status fails typecheck at every
  exhaustive owner; do not guard only the one known switch.
- Replace `PENDING_NEGOTIATION_STATUSES.has(status) ? "pending" : "completed"`
  with source-specific total mappings. Set membership plus a fallback is not an
  exhaustiveness boundary.
- `CareerMarketNegotiationStatus` is intentionally a presentation union that
  merges transfer and preliminary-agreement statuses; do not assert that the
  whole union equals either domain union. Instead, define one total mapping
  satisfying `Record<TransferNegotiation["status"], ...>` and one separate
  total mapping satisfying `Record<PreliminaryAgreement["status"], ...>`, then
  project both into the merged presentation type.
- Make SQLite write/read mappings total and schema-validated. A raw
  `as TransferNegotiation["status"]` cast is not an exhaustiveness boundary.
- Replace the CLI market demo's terminal catch-all with a total transfer-status
  mapping. `outbid` and `lost_to_rival` must never be reported as
  `seller_contract_not_found`.
- Replace diagnostic catch-all classifications with total mappings. The legacy
  Phase 79D negotiation-spread collector must filter race-only terminal states
  `outbid` and `lost_to_rival` before calling its seller/counter outcome
  mappers. The filter narrows to the legacy-eligible negotiation union; the
  mappers remain total over that narrowed union and use a `never` guard. The
  filter itself must be exhaustive over the complete transfer-status union, so
  a future status cannot disappear silently. Do not classify race-only
  terminals as `accepted` or widen `PlayerGenerationSellerOutcome`. Phase 80C
  Step 08's dedicated `transfer-race-audit` owns those outcomes.
- Prefer the targeted guard over enabling `noImplicitReturns` repository-wide.
- Add a test that documents the intent, so the guard is not removed as noise.

## What NOT To Implement

- No change to seller acceptance, resolution order, or any negotiation
  behaviour; Step 03 owns that.
- No raise command, Posta category, AI policy, or UI.
- No new negotiation status yet; only the guard that will catch it.
- No duplicated fee, term, status, or effective stage clock.
- No registry, plugin, event bus, or abstract participant hierarchy.
- No policy field with a single possible value.
- No race-only outcome labels in `player-generation-economy-audit`; its legacy
  seller/counter spread remains separate from Step 08's race diagnostics.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-transfer-race.test.ts \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/transfer-player-negotiation.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/ui/src/career/career-market-view.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- `PlayerTransferRace` exists, validates its invariants, and stores no fee,
  term, clock, or status.
- Shared stage-clock inheritance and one-effective-clock invariants are asserted
  directly in this step.
- The comparison policy is versioned, schema-validated, explicitly passed, and
  has no implicit engine default.
- The participant maximum is `3`, both stage durations are `3`, and supported
  race kinds exclude loans in this release.
- `deriveClubStageResolution` and `rankPlayerSuitors` exist as typed contracts
  with deterministic outputs and tests.
- An unhandled negotiation status now fails typecheck instead of silently
  producing no Posta message.
- UI lifecycle, SQLite decoding, the canonical CLI market demo, and legacy
  diagnostic projection all handle each source status explicitly; race-only
  outcomes are filtered before the narrowed legacy mapper and remain owned by
  the dedicated Phase 80C audit.
- No gameplay behaviour changed in this step.
