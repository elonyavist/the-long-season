# Phase 82A - Incoming Offers, Market Postures And Loans

## Status

**Draft.** Deferred behind Phase 81A and Phase 81B; this phase was previously
numbered 80B. Do not start Phase 82A.

The product contract was accepted before the phase order changed. Treat the
cross-phase requirements added on 2026-08-02
- the shared season boundary, the free-agent cycle this phase must not close -
as intent to re-verify rather than as frozen numbers. They will be revised
against what Phases 81, 81A and 81B actually measure.

## Goal

Complete the playable talent-market loop with durable sale/loan postures,
selected-club incoming offers, one final counterproposal, bidirectional
season-length loans, three-way wage sharing, real loan minutes/development,
Posta decisions, bounded diagnostics, and a clean competitive-market handoff.

The accepted product contract is:

- `docs/audits/PHASE_82A_INCOMING_OFFERS_MARKET_POSTURES_AND_LOANS_DESIGN_CONTRACT.md`

## Entry Gate

- Phase 80 and Phase 80A are Done. Phase 80A closes by carrying its unchanged
  `goals_per_match_avg` monitor failure to Phase 81, which owns match scoring.
- Phase 81 is Done, including its named squad-depth accessor. No production
  path composes a lineup by reading `club.playerIds` directly, so this phase
  redefines squad depth in one owner rather than across every reader.
- Phase 81A is Done, including its integrated tactical-agency checkpoint and
  its manager/AI information-parity contract.
- Phase 81B is Done and measured: contract expiry anchored to the season
  boundary through one named owner, offered terms expressed in months inside the
  accepted `18-30` band, an AI free-agent signing policy that drains the pool,
  background fixtures resolved in the selected club's division through
  `advanceCareerMonths`, the simulate-match command sharing the L1 producer,
  and Step 07's checkpointed `750 x 10` world-integrity report completed and
  replayed with exactly `7` workers.
- Market density has been measured against the frozen bands and the measurement
  is recorded. This phase is authorized on evidence that loans are the missing
  channel, not as an assumption.
- The public current/P50/upper assessment is canonical and shared with AI.
- Quarterly development, dynamic environment, player supply, and value exist.
- Incompatible beta saves have been deleted.
- Phase 79 Step 14 remains Reopened, paused, and unclaimed.

This entry gate is not satisfied while Phase 81A or Phase 81B is open. The
market-density measurement is a required input, not a formality: if
the measured density already sits inside the frozen bands, the loan channel is
re-argued before this phase starts rather than assumed.

## Locked Decisions

- `In vendita` and `Disponibile in prestito` are independent, combinable,
  durable selected-club flags.
- Unlisted players may receive unsolicited bids.
- At most five unresolved incoming permanent/loan offers exist together.
- The five-offer cap counts individual actionable incoming negotiations.
  Grouping several bids around one player never turns them into one capacity
  slot.
- The canonical per-`(buying club, player)` negotiation uniqueness stays
  unchanged and covers permanent and loan kinds together. Phase 82A must not
  tighten it into a global one-per-player rule: competing bids from different
  clubs are wanted football behaviour owned by Phase 82B.
- Phase 82A scheduling restriction: the AI scheduler must not create a second
  concurrent negotiation for a player who already has an unresolved one.
  Today's resolution evaluates negotiations independently, so parallel bids
  would be settled by processing order and losers could fail on
  `stale_ownership`. The restriction lifts only when Phase 82B adds competitive
  resolution.
- Same AI buyer cannot rebid for the rejected player in the same window.
- Permanent and loan proposals keep separate canonical negotiation states.
  `selectOpenPlayerNegotiations(...)` exposes discriminated references for the
  shared pair invariant, cap, and cooldown; neither state copies the other.
- The manager may make one final counterproposal; the immutable three-day
  stage deadline does not reset.
- Permanent and loan offers arrive through actionable Posta.
- Outgoing Market `Action available` means the manager may submit an approach;
  it does not guarantee seller willingness. A canonical
  `player_not_for_sale` reply remains valid and must be shown explicitly
  without recomputing willingness in React.
- Loans work in both directions and end at the current season's end. That
  boundary is the one named season-boundary owner introduced by Phase 81B, the
  same one contract expiry uses. This phase adds a consumer, never a second
  definition.
- No recall, extension, option/obligation, loan fee, resale share, bonus, or
  promised minutes.
- Borrowing-club wage share is exactly `0%`, `50%`, or `100%`.
- Original contract must cover the loan and remains with the parent club.
- `Club.playerIds` remains persisted ownership and is never changed by a loan;
  `ownedPlayerIds(...)` and derived `selectablePlayerIds(...)` make the two
  meanings explicit without duplicating stored rosters.
- The employment contract stays with the parent, while exactly one sporting
  registration moves to the borrower and returns deterministically. Cross-slice
  validation rejects ownership/contract/loan/registration disagreement.
- Selectable depth is `owned present + incoming loans - outgoing loans`;
  outgoing loans and autonomous AI permanent sales must retain `18` seniors
  and department floors `2 / 6 / 6 / 3`; this does not add a global block to a
  manager-accepted permanent sale.
- A loaned player cannot be sold or loaned again.
- AI uses real squad need and plausible rotation value; only real minutes and
  ratings produce development.
- A loan and a free-agent signing solve the same squad gap, so this phase is the
  first competitor to the channel Phase 81B calibrated. Step 07 re-measures that
  phase's free-agent cycle - peak, trough, and attributed drain - and repairs a
  shortfall in the loan need policy rather than in the free-agent policy or the
  frozen band. Loans add a channel; they may not quietly close another.
- Incompatible beta saves are deleted without migration.
- Phase 82A runs no longitudinal cohort. Phase 81 Step 15 ran the historical
  checkpointed `50 x 20`, and Phase 81A Step 16 closes the later contextual
  tactical engine. Phase 81B Step 07 adds a `750 x 10` over complete
  selected-division fixtures and the free-agent foundation, but still observes
  no loans or races. None can certify the completed competitive market. The
  checkpointed `50 x 20` over that market therefore remains Phase 82B's
  closeout. Phase 82A keeps shard/checkpoint/worker wiring working and
  bounded-exercised.

## Ordered Steps

1. `01-current-market-ownership-baseline-and-loan-contract.md`
2. `02-durable-sale-and-loan-availability-postures.md`
3. `03-ai-initiated-selected-club-permanent-offers.md`
4. `04-posta-final-counteroffer-workflow.md`
5. `05-canonical-loan-ownership-registration-and-return.md`
6. `06-loan-wage-sharing-and-finance-accounting.md`
7. `07-bidirectional-loan-market-ai-need-and-real-development.md`
8. `08-squad-market-and-posta-loan-ui.md`
9. `09-bounded-diagnostics-browser-persistence-and-beta-reset.md`
10. `10-phase-report-and-phase-82b-handoff.md`

## Validation Ladder

- Step 01 classifies every relevant direct `club.playerIds` read as ownership
  or selectability and freezes permanent-transfer, finance, Posta, and
  persistence seams before adding loans. It also freezes command eligibility
  and seller willingness as separate named facts.
- Step 02 adds only durable manager market postures.
- Steps 03-04 add incoming permanent offers and the final-counter Posta flow.
- Steps 05-07 add loan truth, finance, a separate loan-negotiation state,
  cross-kind open-negotiation queries, AI, and real development.
- Step 08 exposes existing commands through Squad, Market, and Posta.
- Step 09 runs bounded diagnostics, persistence, browser, and repository gates.
- Step 10 closes the phase on bounded evidence and hands off to Phase 82B. No
  Phase 82A step runs a longitudinal cohort.

## Mandatory Per-Step Documentation

- Before each step, reread
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` and preserve its constraints.
- After each completed step, mark that step Done in its own document, update
  the roadmap progress, and record adopted solution, verification, next
  action, blockers, and lessons in `docs/PROJECT_STATUS.md`.
- The roadmap and current step document are allowed expected files in every
  ordered step; this does not authorize unrelated roadmap scope.

## What NOT To Implement

- No player swaps, loan fees, options/obligations, resale clauses, recall,
  extension, or playing-time promise.
- No more than one counterproposal or five unresolved incoming offers.
- No hidden AI ceiling knowledge.
- No UI claim that an enabled outgoing action guarantees a willing seller.
- No separate loan navigation screen.
- No beta compatibility migration.
- No staff, scouting, facilities, advanced pyramid, or five-country topology.
- No longitudinal run anywhere in Phase 82A.

## Definition Of Done

- Selected-club postures persist and correctly attract AI.
- Incoming permanent and loan offers are actionable through Posta with one
  final counter and correct expiry.
- Loans never mutate `Club.playerIds`; derived selectable squads preserve
  temporary registration, original contract, wage shares, structural floors,
  real statistics/development, and deterministic season-end return.
- AI borrows/lends only for plausible needs and sees no stored ceiling.
- No duplicate ownership, finance, statistics, or history occurs, and the
  scheduler creates no concurrent negotiation for one player even though the
  domain permits it.
- JSON and SQLite/OPFS persistence, repository checks, build, Playwright,
  accessibility, diff, and Graphify pass.
- No longitudinal cohort is run or claimed; cohort infrastructure is proven
  working by a bounded run and handed to Phase 82B, which owns the second
  checkpointed `50 x 20` over the competitive market.
- Phase 82B is the only next phase, and Phase 79 Step 14 remains Reopened,
  paused, unrun, and unclaimed.
