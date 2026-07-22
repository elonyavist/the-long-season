# Step 06 - Player Contract Table And Atomic Transfer Completion

## Status

Ready.

## Goal

Complete the second transfer table with player terms, then commit the entire
move through one atomic career transition.

## User-Visible Outcome

After the seller accepts, the manager can offer the player a real contract.
The player may accept, reject, or counter within three days, and a successful
deal updates both clubs and the squad exactly once.

## Scope

1. Start a player-contract stage only from a valid accepted club agreement.
2. Reuse the Phase 78 demand and supported annual contract terms: annual base
   wage, status, signing bonus, appearance bonus, and role-relevant bonus.
3. Keep the player stage within its own immutable three-day deadline; counters
   do not reset it.
4. Evaluate willingness from age, ability, potential assessment, role,
   proposed status, wage, bonuses, division, reputation, and career context.
5. On acceptance, recheck window, ownership, both negotiations, cash, transfer
   budget, annual wage headroom, registration, and number availability.
6. Commit buyer ownership, seller agreement termination, buyer agreement,
   registration, shirt number, fee, signing bonus, ledger, contract history,
   transfer history, negotiation closure, and squad state atomically.
7. Reconcile any selected-club plan reference factually without silently
   replacing a player.
8. Make replayed completion idempotent and reject partial or stale state.

## Implementation Contract

- Extend the existing Phase 78 agreement and transfer commit seams.
- Annual wages remain annual commitments; no monthly conversion or posting is
  introduced.
- No state mutation occurs from UI render or read-model construction.
- A failed final recheck leaves the pre-transfer career unchanged and emits one
  structured failure outcome.

## Expected Files

- current contract demand/negotiation, permanent-transfer, finance, history,
  registration, and squad transition Modules/tests identified by Step 01
- focused player-stage orchestration and atomic-completion tests under
  `packages/engine/`
- package exports only where required
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No partial completion, compensating web write, or UI-owned transaction.
- No unsupported contract term, agent, promise, or monthly wage model.
- No hidden selected-club lineup replacement.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Inspect accepted, rejected, countered, expired, stale, and newly
  unaffordable player-stage stories.
- Compare both clubs, the player, the ledger, contracts, history, and selected
  plan before and after one completed deal.

## Completion Criteria

- A permanent transfer has two explicit, bounded stages.
- Completion is all-or-nothing, affordable, deterministic, and idempotent.
- Every canonical ownership and finance projection agrees after completion.
- Step 07 is the only next implementation step.
