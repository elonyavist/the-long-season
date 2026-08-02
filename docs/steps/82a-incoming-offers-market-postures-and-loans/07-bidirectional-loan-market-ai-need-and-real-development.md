# Step 07 - Bidirectional Loan Market, AI Need And Real Development

## Status

Not started.

## Goal

Let selected and AI clubs request/offer loans in both directions only when the
move is financially, contractually, and sportingly plausible.

## Accepted Semantics

- Manager may lend to AI or borrow from AI.
- AI may request a listed selected-club player or offer an eligible AI player.
- AI needs a real department gap and plausible rotation use.
- No promised minutes and no automatic growth.
- Loan development consumes real borrower minutes/ratings through the
  quarterly system.
- Loan counterproposal changes only `0/50/100` wage share.

## What To Implement

- Add loan action eligibility to Market and AI lifecycle.
- Rank candidates using public assessment, age, contract, posture, department
  need, borrower selectable squad strength, risk appetite, and wage
  affordability.
- Use selectable rather than owned depth for lender departure safety, borrower
  need, useful rotation, lineup candidates, and squad maintenance.
- Reject implausible star-senior/downward and guaranteed-bench destinations.
- Add selected-club and AI submission/response commands.
- Add a canonical `LoanNegotiationState` rather than inserting optional loan
  terms into `TransferNegotiationState`.
- Deliver incoming loan requests through the Step 04 Posta/final-counter
  grammar.
- Feed borrower fixture participation into canonical statistics/development.
- Include loan offers in the combined five-open-offer cap and cooldown.
- Add `selectOpenPlayerNegotiations(...)` over discriminated permanent/loan
  references. It rejects a permanent/loan collision only for the same
  `(acquiring club, player)` pair; different buyers remain valid domain state.
- Keep loan scheduling serial by player in Phase 82A. Phase 82B may lift
  concurrency only for negotiation kinds it explicitly supports.
- Add direction, need, rotation, wage share, Posta, real minutes, bench
  zero-growth, and return tests.

## What NOT To Implement

- No synthetic loan appearances, abstract fourth-division development, playing
  promise, recall, option, fee, or second counter.
- No stored-ceiling AI knowledge.

## Expected Files

- `packages/domain/src/career/player-loan.ts`
- `packages/domain/src/career/loan-negotiation.ts`
- `packages/domain/src/career/loan-negotiation.test.ts`
- `packages/domain/src/career/open-player-negotiations.ts`
- `packages/domain/src/career/open-player-negotiations.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/career/inbox.ts`
- `packages/engine/src/career/player-loan.ts`
- `packages/engine/src/career/player-loan.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/career-market-catalog.ts`
- `packages/engine/src/career/career-market-catalog.test.ts`
- `packages/engine/src/career/career-inbox-lifecycle.ts`
- `packages/engine/src/career/career-inbox-lifecycle.test.ts`
- `packages/engine/src/career/player-participation.ts`
- `packages/engine/src/career/player-participation.test.ts`
- `packages/engine/src/career/player-development.test.ts`
- JSON and SQLite/OPFS schema/mapping/version owners
- simulation diagnostic owners from Step 01
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/loan-negotiation.test.ts \
  packages/domain/src/career/open-player-negotiations.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/player-loan.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/career-market-catalog.test.ts \
  packages/engine/src/career/career-inbox-lifecycle.test.ts \
  packages/engine/src/career/player-participation.test.ts \
  packages/engine/src/career/player-development.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Both loan directions complete through one canonical lifecycle.
- AI need/rotation/affordability prevent parking loans.
- Parent and borrower floor decisions use selectable rosters and retain
  `18` plus `2/6/6/3` after prospective moves.
- Real borrower facts drive development; bench cases receive no invented
  growth.
- Incoming loan decisions share the permanent-offer Posta grammar.
- Permanent and loan states remain separate while cap, cooldown, and pair
  uniqueness consume one discriminated query.
- Step 08 is the only next action.
