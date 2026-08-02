# Step 01 - Current Market Ownership Baseline And Loan Contract

## Status

Not started.

## Goal

Freeze current permanent-transfer, club ownership, active registration,
contract, wage, Posta, window, participation, season-rollover, and persistence
owners before introducing incoming offers or loans.

## What To Implement

- Trace permanent-transfer commands and durable negotiation states.
- Trace outgoing Market `targetEligibility(...)` separately from
  `deriveSellerTransferWillingness(...)`. Record that `Action available` means
  the manager may submit an approach, while the seller may still return the
  structured `player_not_for_sale` response.
- Trace selected-club protection in AI market targeting.
- Inventory every production direct read/write of `Club.playerIds` in domain,
  engine, UI, simulation, and storage owners. Classify each as:
  - ownership truth, which remains on persisted `Club.playerIds`;
  - selectable sporting truth, which must use the future derived accessor;
  - unrelated ordered player input/youth roster, which is explicitly left
    unchanged.
- Trace senior squad state, active contracts, registration, lineup,
  statistics, free-agent detection, seller discovery, seller-depth decisions,
  squad maintenance, squad-health gates, and finance reservations.
- Freeze two canonical accessor contracts:
  - `ownedPlayerIds(...)` exposes persisted parent ownership;
  - `selectablePlayerIds(...)` derives
    `owned present + active incoming loans - active outgoing loans`.
- Freeze the invariant that loans never mutate either club's
  `Club.playerIds`; no second selectable-roster array is persisted.
- Freeze the cross-slice registration contract: ownership and employment stay
  with the parent; exactly one senior sporting registration moves to the
  borrower; return restores one parent registration deterministically.
- Freeze selectable departure gates for outgoing loans and autonomous AI
  permanent-sale decisions at `18` seniors plus department floors `2`
  goalkeepers, `6` defenders, `6` midfielders, and `3` attackers. Preserve the
  existing explicit manager permanent-transfer boundary rather than making the
  AI protection global.
- Trace Posta attention/delivery/resolution and immutable stage clocks.
- Trace JSON and SQLite/OPFS save mapping/version deletion behavior.
- Record the retain/extend/replace/remove decision for the archived loan-roadmap
  concepts.
- Freeze definitions and positive denominators for incoming-offer and loan
  diagnostics.
- Freeze the copy/read-model contract: do not describe command eligibility as
  seller availability, do not hide a valid refusal, and do not duplicate
  seller-willingness rules in React.
- Record that the current buyer/player negotiation key permits parallel buyers
  for one player and freeze it unchanged. Phase 82A must not tighten it: two
  clubs competing for one player is wanted football behaviour owned by Phase
  82B. Record instead the Phase 82A scheduling restriction and the exact reason
  it exists — `advanceTransferNegotiations` resolves due offers individually in
  ID order and `resolveSellerReply` evaluates only one offer through seller
  willingness, so concurrent bids are never compared as a set and a later path
  can fail on `stale_ownership` instead of losing on merit.
- Freeze separate permanent and loan negotiation owners plus one discriminated
  `selectOpenPlayerNegotiations(...)` query. Do not grow
  `TransferNegotiation` into an optional-field permanent/loan aggregate.
- Freeze that the five-open cap counts individual incoming negotiations and
  that valid parallel buyers are never a beta-save deletion reason.
- Narrow later expected-file lists when the audit proves a more precise owner.

## What NOT To Implement

- No posture, incoming offer, loan, finance, UI, save-schema, or AI behavior
  change.
- Do not restore archived loan code or create a parallel ownership model.
- No long run.

## Expected Files

- `docs/audits/PHASE_82A_INCOMING_OFFERS_AND_LOANS_OWNERSHIP_BASELINE.md`
- `docs/audits/PHASE_82A_INCOMING_OFFERS_MARKET_POSTURES_AND_LOANS_DESIGN_CONTRACT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- Step 02 document only when the ownership audit narrows its expected files

## Required Checks

```bash
nvm use 24
test -f docs/audits/PHASE_82A_INCOMING_OFFERS_AND_LOANS_OWNERSHIP_BASELINE.md
git diff --check
graphify update .
```

No production implementation or long run belongs to this step.

## Definition Of Done

- Every direct `Club.playerIds` production access is classified, and parent
  ownership plus derived temporary selectability have one canonical owner
  each.
- The accessor and `18` plus `2/6/6/3` floor contracts are frozen without
  persisting a duplicate roster.
- Ownership, employment, loan, and sporting-registration meanings are explicit
  and have one cross-slice validation owner.
- Every permanent/loan/Posta/finance/persistence seam has a retain/extend/
  replace/remove decision.
- Command eligibility and seller willingness have distinct owners, terms, and
  regression fixtures.
- Later step scopes do not overlap.
- Step 02 is the only next action.
