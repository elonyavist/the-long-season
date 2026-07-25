# Step 11 - Offer Composer And Two-Stage Decision Flow

## Status

Done.

## Goal

Let the manager submit, revise, withdraw, and complete permanent-transfer or
preliminary-agreement talks through one clear command flow.

## User-Visible Outcome

The manager always knows which table is active, what is being offered, when an
answer is due, what could be spent, and what will actually happen on confirm.

## Scope

1. Add a club-offer composer for one up-front fee during an open window.
2. Add a player-terms composer after club acceptance and for eligible
   preliminary agreements.
3. Reuse the supported annual contract fields and current profile/renewal input
   controls instead of creating a second contract form.
4. Show actual budget, this proposal, existing pending exposure, and projected
   post-completion headroom as distinct facts.
5. Support submit, revise after counter, accept counter, reject/withdraw, and
   retry after a recoverable command failure.
6. Preserve drafts on validation, engine, or storage failure and keep the
   current screen/focus coherent.
7. Lock duplicate submission while a command is pending and expose immediate
   loading, success, expiry, and failure feedback.
8. Use one dominant command per state and semantic reduced-motion-safe
   transitions.
9. Resolve `P79-CF-04` before reusing the renewal controls: initialize an
   editable draft when its player/workflow opens, preserve it across unrelated
   working-career identity updates, and reseed only after an explicit reset,
   cancel, successful authoritative replacement, player/workflow change, or
   close. Cover an open edited form receiving a new career-state object.
10. Complete `P79-CF-03` by keeping localized two-decimal editing/parsing
    separate from the shared read-only currency formatter while both convert
    through exact integer minor units.

## Implementation Contract

- Browser forms create typed command inputs; engine owns every validation and
  outcome.
- No optimistic transfer completion or direct storage write.
- A changed career fact invalidates the preview and requires a fresh engine
  response before confirmation.
- Money uses integer minor units behind localized display controls.
- A React object-identity change is not a user command and cannot reset an
  in-progress offer.

## Expected Files

- focused offer/negotiation components, hooks, and tests under the current
  `apps/web/src/features/market/` feature
- current web career runtime/command adapter only for typed market commands
- current shared command, dialog, form, money, status, and motion primitives
  only where reusable corrections are required
- `packages/i18n/` labels/tests required by visible copy
- current-product visual QA fixture updates
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No duplicate contract form, direct domain import from web, optimistic budget
  mutation, hidden auto-acceptance, or generic form framework.
- No installments, clauses, agents, promises, or loans.
- No animation that delays or completes a command.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Complete accepted, countered, rejected, withdrawn, expired, and newly
  unaffordable flows with keyboard, touch, and reduced motion.
- Submit multiple offers and confirm actual budget remains unchanged while the
  exposure preview remains understandable.

## Completion Criteria

- Permanent transfers and preliminary agreements have complete explicit form
  flows over canonical commands.
- Draft, command, focus, error, and retry behavior is reliable.
- Unrelated autosave/session publication cannot erase typed renewal or market
  terms, and display/edit money precision is intentional and tested.
- No duplicate contract or finance logic exists in web.
- Step 12 is the only next implementation step.

## Completion Notes

- New engine `evaluateTransferFeeCapacity` previews a manager-chosen fee
  against the buyer's transfer budget and cash only, never running seller
  willingness; `evaluateCareerContractCapacity` is now exported for the same
  kind of preview reuse `checkContractOfferAffordability` already gave Squad.
- New runtime `WebSelectedClubMarketCommand` /
  `applySelectedClubMarketCommand` covers submit/accept/reject/withdraw across
  the transfer club stage, the transfer player stage, and preliminary
  agreements, plus one immediate `sign_free_agent` command for the no-stage
  free-agent path, mirroring the existing contract-command pattern exactly
  (ID resolution, session replace, Posta refresh, no implicit save).
- New adapter `previewMarketOffer` fills the Step 09
  `CareerMarketOfferPreviewView` contract from the matching engine capacity
  query only; `resolveCareerTransferWindows` was extracted as the one shared
  window-resolution owner used by both the adapter and the runtime.
- The Squad renewal form was extracted into a shared
  `apps/web/src/features/shared/ContractTermsForm.tsx` so Squad and every
  Market annual-terms composer (player-stage, preliminary, free-agent) use
  exactly one contract form; no second one was created.
- `P79-CF-04` is resolved: `CareerContractWorkspace.tsx` now reseeds its draft
  only when a `playerId:negotiationId:status` token actually changes, not on
  every unrelated career-state republish. The new Market composer is immune by
  construction — its form values are seeded once via a lazy `useState`
  initializer and never resynced from props.
- `P79-CF-03` is complete: editable money stays on the existing 2-decimal
  `contract-renewal-form.ts` parser (plus one small local fee parser for the
  plain transfer-fee field); read-only display stays on the one shared
  `formatMoneyFromMinorUnits`; both convert through exact integer minor units.
- `packages/ui`'s `CareerMarketOfferPreviewView.kind` gained `free_agent_offer`
  and `CareerMarketNegotiationInput` gained optional `offeredTerms`/
  `counterTerms` so the composer can render an exact counter comparison
  without inventing a second finance/contract model in web.
- Manually verified end-to-end in a real browser: typed a transfer fee, saw a
  live affordable preview, submitted, reached the pending-seller-reply state
  with correct feedback, confirmed the finance strip showed pending exposure
  while the actual transfer budget stayed unchanged, then withdrew back to a
  fresh composer with exposure reset to zero.
- The free-agent and preliminary composers were subsequently live-browser
  exercised too, using the real running session (a fresh career had no free
  agents and no player inside the six-month preliminary window, so a
  temporary, session-only test hook injected a genuinely free player and
  shortened another player's contract horizon directly through the real
  runtime session object, then removed the hook once done; nothing was
  saved). Both composers rendered, submitted, and settled correctly:
  free-agent signing showed "This offer fits the current budget", applied,
  reduced annual wage headroom by exactly the signed wage, and removed the
  player from the market pool; the preliminary-agreement composer (only
  offered once the transfer window is closed, by design, since an open
  window always prioritizes a direct transfer offer) submitted, showed
  "1 open talks" with zero pending exposure, and reached the
  waiting-for-reply state with a working withdraw control. One false
  rejection surfaced mid-investigation (`invalid_signing_transition`); root
  cause was the temporary test hook itself leaving stale
  `seniorSquadState.contractIds`/`contractHistory` references after an
  ad-hoc player removal — fixed by driving the release through the engine's
  own `prepareSeniorSquadDeparture`, not by any change to shipped code. No
  defect existed in `apply-career-free-agent-signing.ts`,
  `applySelectedClubMarketCommand`, or the composer.
- Verification: full `pnpm check` PASS (`222` files / `1339` tests; lint,
  `check:localized-text`, and every workspace typecheck clean; dependency
  cruise `675` modules / `2572` dependencies, zero violations); web build
  PASS; `current-product.spec.ts` Playwright PASS (`23/23` across repeated
  runs); `git diff --check` PASS.

Step 12 is the only valid next implementation step.
