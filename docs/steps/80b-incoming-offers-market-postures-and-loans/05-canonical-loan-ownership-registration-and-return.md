# Step 05 - Canonical Loan Ownership, Registration And Return

## Status

Not started.

## Goal

Add one durable season-length loan lifecycle that keeps parent ownership
explicit, grants temporary sporting registration, and returns the player
deterministically.

## Accepted Semantics

- Parent club remains the owner.
- A loan never mutates parent or borrower `Club.playerIds`.
- Borrowing club alone may select the player during the active loan.
- Exactly one senior sporting registration moves to the borrower and returns
  to the parent deterministically; duplicate active registrations are invalid.
- The parent shirt number becomes available during the loan. Keep only the
  preferred return number needed by the active loan; reuse it if free at
  return, otherwise allocate the first canonical free number deterministically.
- Loan ends at current season end and returns before next market.
- Original parent contract must cover the term and may be renewed.
- No sale, second loan, recall, extension, option, obligation, or fee while
  active.

## What To Implement

- Add domain loan identity, parties, dates, status, and validated collection.
- Implement `ownedPlayerIds(...)` over persisted ownership and
  `selectablePlayerIds(...)` as
  `owned present + active incoming loans - active outgoing loans`; persist no
  duplicate selectable-roster array.
- Replace every Step 01-classified sporting-depth/lineup/maintenance read with
  the selectable accessor while preserving ownership reads for free-agent,
  seller, contract, and transfer validation.
- Extend squad/lineup/registration queries to recognize the borrowing club
  without duplicating ownership.
- Refactor the current registration-equals-owner assumption: the employment
  contract and `Club.playerIds` remain parent facts, while active senior
  registration names the current sporting club. Validate their agreement with
  active loan facts at the `CareerState` cross-slice seam.
- Remove an outgoing loanee from invalid parent lineup/preparation selections;
  do not auto-promote the player into the borrower's XI. Both sides consume the
  canonical selectable-player validator.
- Add preview/apply/return commands with window, contract, squad, and duplicate
  checks.
- Enforce prospective selectable floors for every outgoing loan and autonomous
  AI permanent-sale decision: `18` total, `2` goalkeepers, `6` defenders, `6`
  midfielders, and `3` attackers. Incoming loanees count for the borrower;
  outgoing loanees do not count for the parent. Do not add the AI protection
  as a global rejection rule for a manager-accepted permanent sale.
- Return active loans during rollover before next-window work.
- Preserve statistics/history facts under player identity.
- Round-trip through JSON and SQLite/OPFS.
- Add idempotency, save/reload, expiry, contract, unavailable action, and
  duplicate ownership tests.
- Bump the owning beta schema/config version and delete saves with incompatible
  loan/registration state; valid parallel-buyer negotiations are not a reset
  reason. Add no migration or silent repair.

## What NOT To Implement

- No wage share, AI willingness, Posta, UI, loan development bonus, or
  automatic loan placement.
- No reuse of permanent transfer history as fake loan state.

## Expected Files

- `packages/domain/src/career/player-loan.ts`
- `packages/domain/src/career/player-loan.test.ts`
- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/domain/src/career/transfer-negotiation.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/career/player-loan.ts`
- `packages/engine/src/career/player-loan.test.ts`
- `packages/engine/src/career/squad-maintenance.ts`
- `packages/engine/src/career/squad-maintenance.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- canonical senior-squad/lineup/registration query owners from Step 01
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-loan.test.ts \
  packages/domain/src/career/transfer-negotiation.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/player-loan.test.ts \
  packages/engine/src/career/squad-maintenance.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- One player has exactly one parent and at most one temporary club.
- Active loans leave both clubs' `Club.playerIds` unchanged.
- Only the borrower can select an active loanee.
- Exactly one borrower registration exists during the loan and one parent
  registration is restored at return.
- Shirt-number collision on return is deterministic and no registration
  history ledger is introduced.
- Selectable totals and `2/6/6/3` department floors protect sporting depth;
  owned totals remain separate.
- Return is automatic, idempotent, and reload-safe.
- Incompatible permanent/loan actions are blocked explicitly.
- Incompatible loan/registration state is rejected and incompatible beta saves
  are deleted.
- Step 06 is the only next action.
