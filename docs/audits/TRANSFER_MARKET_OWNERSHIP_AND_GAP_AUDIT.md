# Transfer Market Ownership And Gap Audit

Date: 2026-07-23
Phase: `79-transfer-market-windows-negotiations-and-market-workspace`
Step: `01-current-market-ownership-and-gap-audit`

## Purpose

Record the current owner, the reuse/replace intent, and the test seam for every
transfer, valuation, willingness, contract, finance, turnover, Posta,
persistence, and browser path **before** Phase 79 extends the market. The audit
prevents a second transfer engine, a duplicate finance owner, or accidental
preservation of the temporary Phase 78 pending-reservation behavior. No
production code, schema, UI, calendar, offer, or policy changes here.

## Executive Conclusion

The permanent-transfer, valuation, willingness, contract-negotiation, and
club-finance seams already exist and are canonical. Phase 79 must **extend**
them, never fork them. The real gaps are structural and absent, not duplicated:

- no transfer-window date catalog (content) and no window vocabulary (domain);
- no window eligibility / out-of-window policy (engine);
- no explicit three-day negotiation clock separate from the current
  two-to-six-day renewal delay;
- no preliminary (future) agreement entity or activation path;
- no informational pending-exposure read model; today open offers are treated
  as **reserved** commitments (temporary behavior to replace);
- no Market route, Market UI read model, or durable market storage rows beyond
  transfer history.

Every Phase 79 step maps to exactly one current owner to extend or one proven
absent gap. No step needs a parallel implementation.

## Method

Evidence gathered from production callers and export surfaces, not filenames:
`packages/engine/src/market/index.ts`, the `career/*` transfer and contract
modules, `packages/domain/src/career/*`, `packages/domain/src/entities/`, and
the web runtime/adapters read during the Phase 78 review. Graphify query
`transfer market negotiation contract finance ownership` corroborated the
finance/negotiation clustering. Absence claims verified by empty greps
(`window`/`transferWindow` in `packages/content/src`, `window`/`preliminary`/
`futureAgreement` in `packages/storage/src`, and no `market` feature under
`apps/web/src/features/`).

## Current Ownership Trace

### 1. Permanent transfer (club → club)

| Concern | Current owner |
| --- | --- |
| Feasibility (fee + affordability) | `packages/engine/src/market/transfer-feasibility.ts` → `evaluatePermanentTransfer` |
| Shared affordability policy | `packages/engine/src/career/career-contract-reservations.ts` → `evaluateCareerContractCapacity` |
| Atomic career application | `packages/engine/src/career/apply-career-transfer.ts` → `applyCareerPermanentTransfer` |
| Squad/registration/number/departure staging | `packages/engine/src/career/senior-squad-transfer.ts` → `prepareSeniorSquadPermanentTransfer`, `prepareSeniorSquadSignings`, `prepareSeniorSquadDepartures` |
| Deterministic AI turnover | `packages/engine/src/career/transfer-turnover.ts` |
| Finance ledger posting | `packages/domain/src/career/club-finance.ts` (transaction + `postClubFinanceLedgerEntries`) driven by `packages/engine/src/career/career-finance-lifecycle.ts` |
| Contract history facts | `packages/domain/src/career/senior-squad.ts` |
| CLI presentation | `apps/cli/src/commands/career/market-output.ts` |

The transfer application already closes the seller agreement/registration,
creates the buyer agreement + deterministic shirt number, posts fee + signing
bonus, and appends history in one atomic result. **Retain and extend**; do not
re-implement completion in Phase 79.

### 2. Valuation and willingness

- `packages/engine/src/market/player-valuation.ts` → `derivePlayerValuation`,
  `DEFAULT_PLAYER_VALUATION_CONFIG` (age/role/potential/contract-security aware).
- `packages/engine/src/market/player-willingness.ts` → `derivePlayerWillingness`.

**Retain.** Phase 79 offer/AI code consumes these; it must not copy value or
willingness math into web or a new market Module.

### 3. Contract negotiation (renewal, selected + AI)

- Domain vocabulary/state: `packages/domain/src/career/contract-negotiation.ts`.
- Engine lifecycle: `packages/engine/src/career/contract-negotiation.ts`,
  `contract-negotiation-demand.ts`, `selected-club-contract-workflow.ts`,
  `ai-contract-lifecycle.ts`.
- Web command boundary: `apps/web/src/runtime/web-career-runtime.ts`
  (`applySelectedClubContractCommand`).

**Retain and extend.** Renewals already use a seeded two-to-six-day response
delay and a fourteen-day counter deadline. Phase 79 adds a **separate** explicit
three-day negotiation-stage clock for transfers/preliminary agreements; it must
not silently retune the existing renewal delay.

### 4. Club finance and affordability

- `packages/domain/src/career/club-finance.ts` — cash, transfer budget, annual
  wage budget, committed wage, ordered ledger, transactions.
- `packages/engine/src/career/career-finance-lifecycle.ts` — payroll/bonus/
  transfer settlement at canonical boundaries.
- `evaluateCareerContractCapacity` — one shared affordability policy reused by
  transfer, free-agent signing, youth promotion, and AI lifecycle
  (callers: `apply-career-transfer.ts`, `apply-career-free-agent-signing.ts`,
  `youth-promotion.ts`, `ai-contract-lifecycle.ts`, `senior-squad-replenishment.ts`).

**Retain the account/ledger/affordability owner.** See the reservation caveat
in section 8.

### 5. Game time, season, competition, calendar

- Game time: `packages/domain/src/value-objects/game-date.ts` (epoch-day).
- Round-robin + next-season calendar: `packages/engine/src/career/next-season-calendar.ts`
  (`generateNextSeasonCalendar`) and `generateRoundRobinCalendar`.
- Competition entity: `packages/domain/src/entities/competition.entity.ts` owns
  season distribution and **substitution** window limits — **no transfer-window
  dates**.

**Gap:** transfer-window dates have no owner. Step 02 adds a source-backed date
catalog in `@game/content`; domain adds window vocabulary; engine resolves and
consumes dates. Game time stays `GameDate` epoch-day.

### 6. Posta / Continue

- `packages/domain/src/career/inbox.ts`, `attention.ts`; engine
  `career-inbox-lifecycle.ts`, `continue-career.ts`,
  `advanceSelectedClubContractsToAttention` (web calls it via the runtime).

**Retain and extend.** Phase 79 adds transfer/preliminary Posta facts and market
deadline stops through the same lifecycle. No new attention framework.

### 7. Persistence

- `packages/storage/src/**` (career envelope v5, SQLite schema v11) persists
  registrations, contracts, contract history, finance accounts, ledger,
  negotiations, Inbox policy.

**Gap:** no window, transfer-negotiation-stage, pending-exposure, or
future-agreement rows. Step 13 owns one clean schema advance with lossless
JSON + SQLite/OPFS mapping. No compatibility branch; reject prior beta schema.

## Retain / Extend / Replace / Remove Table

| Area | Current owner | Phase 79 action | Owning step |
| --- | --- | --- | --- |
| Permanent-transfer feasibility | `evaluatePermanentTransfer` | Extend (window + stage gating) | 05, 06 |
| Atomic completion | `applyCareerPermanentTransfer` + `senior-squad-transfer` | Retain; call from new offer flow | 06 |
| Valuation / willingness | market `derive*` | Retain | 05, 08, 09 |
| Affordability policy | `evaluateCareerContractCapacity` | Retain; recheck at acceptance/completion | 04, 06 |
| Open-offer reservation projection | `deriveCareerContractOfferReservations` | **Replace** with informational pending exposure; delete reservation-as-spend | 04, 09 |
| Renewal negotiation | contract-negotiation engine/domain | Retain; add distinct 3-day transfer stage | 04, 05 |
| Contract history / registrations / numbers | `senior-squad.ts` | Retain | 06 |
| Finance ledger | `club-finance.ts` + finance-lifecycle | Retain | 06 |
| Posta / Continue | inbox/attention lifecycle | Extend with market facts | 12 |
| Transfer-window dates | none | **Add** content catalog + domain vocab | 02, 03 |
| Preliminary (future) agreement | none | **Add** entity + activation | 07 |
| AI market targeting | `transfer-turnover.ts` (turnover only) | **Add** targeting/protection using shared rules | 08 |
| Market storage rows | none (only transfer history) | **Add** durable market schema | 13 |
| Market UI read model | none | **Add** framework-free models | 09, 10, 11 |
| Market route / workspace | none | **Add** `apps/web` Market surface | 10, 11, 12 |
| CLI market output | `market-output.ts` | Extend as needed for gate | 14 |

## Temporary Pending-Reservation Replacement (locked)

`deriveCareerContractOfferReservations` (in `career-contract-reservations.ts`)
today projects every `awaiting_response` / `countered` offer as a **reserved**
wage raise + reserved signing bonus, so an unresolved offer reduces available
budget. Phase 79 locked rule: a submitted or countered offer consumes **no**
cash, transfer budget, signing bonus, or wage headroom; the UI derives labelled
**informational** pending exposure only, and affordability is rechecked at
acceptance/completion against current facts.

- **Replacement path:** Step 04 introduces the informational pending-exposure
  derivation and the acceptance/completion recheck; the reservation-as-spend
  contribution of `deriveCareerContractOfferReservations` is removed from the
  affordability inputs. `evaluateCareerContractCapacity` remains, but evaluates
  against committed facts plus the terms under evaluation, not against other
  open offers.
- **Deletion proof (deferred to owning step):** once Step 04/09 land, no caller
  may pass other-offer reservations into affordability. Step 15 proves the
  reservation-as-spend code path has no remaining caller.

## Carry-Forward Findings Verification (`P79-CF-01`..`08`)

Each was re-checked against its production caller, current tests, package
ownership, and reload/session behavior during the Phase 78 review.

| ID | Classification (confirmed) | Confirmed owner / caller | Deletion / fix target | Regression seam | Owning step |
| --- | --- | --- | --- | --- | --- |
| `P79-CF-01` | Functional/incomplete | `career-squad-adapter.ts:304,351` hardcodes `moraleDirection:"steady"`; consumed by `CareerSquadScreen` `MoraleDirection` (up/down never rendered) | Derive from latest canonical morale consequence, or remove up/down branches | `career-squad-adapter.test.ts` + a morale-direction fact test | 09 |
| `P79-CF-02` | Divergence risk | Two `remainingDays < 244` literals `career-squad-adapter.ts:321,358` | One exported `@game/ui` expiry-alert policy/helper; cover boundary once | new `@game/ui` policy test | 09 |
| `P79-CF-03` | Duplication | Three `Intl.NumberFormat` currency formatters in `CareerSquadScreen`, `CareerContractWorkspace`, `CareerPlayerProfileDialog` | One shared localized display formatter; keep 2-decimal editable form values separate | shared formatter unit test | 10-11 |
| `P79-CF-04` | Latent draft-loss | `CareerContractWorkspace.tsx` `formSeed`/`useEffect` reseed on `contract.activeContract` identity | Seed once on open; reseed only on explicit reset/cancel/success/player-change/close | workspace draft-persistence test | 11 |
| `P79-CF-05` | UX verification gap | No proof contract/market commands surface `CareerSessionStatus.dirty` | Reuse canonical `dirty`; prove unsaved warning reachable | runtime/session dirty test | 13 |
| `P79-CF-06` | Long-career perf | `presentCareerSquad` scans full `contractHistoryEntryIds` and all negotiations inside player loop (`career-squad-adapter.ts:278-289`, `negotiationForProfile`) | Pre-index history + latest negotiation by player before the loop | adapter perf/shape test | 09 |
| `P79-CF-07` | Type-safety | `as unknown as WebCareerState` in `web-career-runtime.ts:990` (`buildWebCareerState`) | Explicitly typed construction boundary; missing fields fail typecheck | web typecheck | 13 |
| `P79-CF-08` | Readability | Malformed switch indentation `applySelectedClubContractCommand` (`web-career-runtime.ts:415-422,457-466`) | Formatter-clean branches while runtime is touched | lint/format | 13 |

All eight map to exactly one owning step and one seam. None require a new
parallel state container; each is fixed inside the step that already owns the
boundary.

## Absent Capabilities (explicit, not implemented here)

- Transfer-window date catalog and domain window vocabulary.
- Window eligibility and out-of-window structured refusal + next-open date.
- Explicit three-day negotiation stage clock and pending-exposure derivation.
- Preliminary (future) agreement entity, one-future-agreement invariant, and
  activation.
- AI market targeting/squad protection built on shared valuation/affordability.
- Durable market storage rows.
- Market UI read models, Market route, and Market workspace.

## Completion

- Complete retain/extend/replace/remove table: present.
- All eight carry-forward IDs with one owning step and one test seam: present.
- No duplicate transfer, negotiation, finance, or storage owner proposed.
- Step 02 (`playable-competition-transfer-window-catalog`) is the only next
  implementation step.
