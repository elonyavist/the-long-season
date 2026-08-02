# Phase 82A Incoming Offers, Market Postures And Loans Design Contract

## Status

Accepted on 2026-07-30 after direct product review. Amended the same day after
the ownership audit to separate permanent ownership from selectable
registration. Amended again after product review rejected a global
one-negotiation-per-player rule: competing bids from different clubs are a
wanted football behaviour and belong to Phase 82B, so Phase 82A keeps the
canonical per-buyer uniqueness and simply does not schedule concurrent bids
yet. Amended on 2026-07-31 to separate outgoing command eligibility from
seller willingness after the Phase 80 browser closeout exposed that semantic
boundary. This document owns the manager-facing market expansion that follows
Phase 80A.

## Player-Facing Goal

Complete the lower-division talent loop:

- a strong prospect at the selected club attracts larger AI clubs;
- the manager can list a player for sale or make them available for loan;
- the manager receives actionable permanent and loan offers through Posta;
- incoming offers can be accepted, rejected, or countered once;
- lower-division clubs can borrow young players from stronger clubs;
- loans produce real minutes, performances, development, wages, and automatic
  returns rather than synthetic growth.

## Entry Gate

- Phase 80 is complete.
- Phase 80A is complete with green bounded diagnostics.
- AI and manager use the same public current/P50/upper assessment.
- No production change remains pending before the market lifecycle work starts.
- Incompatible beta saves are deleted; no compatibility migration is required.

## Architecture Ownership

Phase 82A adds three domain-specific Modules and one cross-flow query. It does
not widen `TransferNegotiation` with optional loan fields.

- `PlayerMarketPostureState` owns only the selected club's durable sale/loan
  intentions and their cleanup.
- `PlayerLoanState` owns completed loan agreements, parent/borrower, dates,
  wage share, temporary registration, and return state. It is not negotiation
  history.
- `LoanNegotiationState` owns loan proposals and their one-final-counter
  lifecycle. Permanent offers remain in `TransferNegotiationState`.
- `selectOpenPlayerNegotiations(...)` returns discriminated permanent/loan
  references for capacity, cooldown, and cross-kind eligibility without
  copying either negotiation.

The cross-flow invariant is one unresolved negotiation per
`(acquiring club, player)` pair across permanent and loan kinds. Different
clubs may hold unresolved negotiations for the same player in durable state.
Phase 82A's scheduler temporarily declines to create that concurrency because
competitive resolution is not available yet; it does not reject a valid save
merely because two different buyers target the same player.

Persistence lands with each durable Module, not in a later diagnostic step.
Every incompatible beta schema change advances the supported version and
deletes unsupported saves through the canonical reset path; no migration or
compatibility default is retained.

## Outgoing Action Eligibility And Seller Willingness

`Action available` means the selected club may submit a canonical approach
under the current window, ownership, contract, and open-negotiation rules. It
does not promise that the selling club is willing to negotiate.

- `targetEligibility(...)` owns whether the manager may issue the command.
- `deriveSellerTransferWillingness(...)` remains the canonical seller-response
  owner and may answer `player_not_for_sale`, including for structural
  squad-depth reasons.
- The UI must not call command eligibility `available to negotiate` or imply
  guaranteed acceptance into a pending negotiation.
- A refusal is delivered as the seller's explicit structured response. It is
  not converted into a disabled action by duplicating seller-willingness logic
  in React.
- Phase 82A postures may influence seller resistance and AI interest, but do not
  collapse action eligibility and seller willingness into one Boolean.

This preserves the realistic ability to approach a club for an unlisted player
while keeping the outcome truthful and testable.

## Market Postures

The selected club can set two independent, combinable durable flags:

- `In vendita`;
- `Disponibile in prestito`.

Rules:

- both may be active on the same player;
- they persist until the manager changes them;
- they clear automatically on permanent transfer, loan departure, contract
  exit, or retirement;
- listing never changes public market value;
- `In vendita` lowers seller resistance and strongly increases permanent-offer
  candidate weight;
- `Disponibile in prestito` increases loan-offer candidate weight;
- unlisted players may still receive realistic unsolicited approaches;
- the flags never force acceptance or bypass squad/contract/finance rules.

The Squad contextual action menu owns these commands. No screen-local shadow
state may pretend a player is listed without persisting the canonical fact.

## Incoming Permanent Offers

- AI clubs may target selected-club players during valid transfer windows.
- Target selection uses public current/P50/upper, club need, budget, risk
  appetite, contract, and seller posture.
- Stored ceiling is forbidden from live target selection and pricing.
- The selected club may have at most `5` unresolved incoming permanent/loan
  offers combined. The cap counts individual actionable incoming
  negotiations, not grouped players or future races; outgoing approaches and
  rival offers for an external target do not consume it.
- The canonical domain uniqueness stays exactly as it is today: at most one
  unresolved negotiation per `(buying club, player)` pair. Phase 82A must not
  tighten this to one negotiation per player. Two different clubs negotiating
  for the same player is wanted football behaviour and is owned by Phase 82B.
- The same pair rule covers permanent and loan negotiations together through
  discriminated references: one club may not run a permanent and a loan
  approach for the same player at once.
- After rejection, the same AI club may not submit another offer for the same
  player in the same transfer window.
- Phase 82A scheduling restriction: while the domain permits parallel bids, the
  Phase 82A AI scheduler must not create a second concurrent negotiation for a
  player that already has an unresolved one. Permission and exercise are
  different. Today `advanceTransferNegotiations` resolves each due offer
  individually in ID order and `resolveSellerReply` evaluates only that offer
  through seller willingness. Parallel bids therefore are not compared as a
  set; one path can change ownership while a later path dies on
  `stale_ownership` rather than on merit. Phase 82B adds the competitive
  resolution that makes parallel bids safe; only then is this restriction
  lifted.
- Incoming permanent transfers remain two-stage: club fee first, player terms
  and player willingness through the existing canonical workflow where
  applicable.

## Posta And One Final Counter

Incoming offers are important/actionable Posta messages that stop Continue
according to the existing attention contract.

Permanent-offer flow:

`AI offer -> manager accept / reject / final counter -> AI final accept / reject`

Loan-offer flow:

`AI wage-share proposal -> manager accept / reject / final counter -> AI final accept / reject`

Rules:

- one manager counterproposal per negotiation;
- the existing immutable stage deadline remains at most three in-game days;
- a counter does not reset the deadline;
- no infinite bargaining loop;
- the UI shows original offer, manager counter when present, and a
  shape/text-visible `Controproposta finale` state;
- the action label is `Invia controproposta finale`;
- after submission the state reads `In attesa della risposta finale`;
- do not use a numeric “counters remaining” badge.

## Loan Directions And Duration

The canonical loan lifecycle supports:

- selected club lending a player to an AI club;
- selected club borrowing a player from an AI club;
- AI-initiated incoming loan requests for a listed player;
- selected-club-initiated loan requests through Market.

Every loan:

- starts only inside a valid registration/transfer window;
- ends at the end of the current season;
- lasts a full season when completed in summer and roughly half a season when
  completed in winter;
- returns automatically to the parent club before the next market opens;
- has no automatic renewal;
- has no early recall in Phase 82A;
- has no purchase option, purchase obligation, resale share, bonus, or loan
  fee.

## Ownership, Registration And Contract Safety

- `Club.playerIds` remains the sole persisted senior ownership list.
- Starting, completing, returning, or loading a loan never removes the player
  from or adds the player to either club's `Club.playerIds`.
- Parent-club ownership remains explicit and is never erased or duplicated by
  temporary registration.
- The player is selectable only by the borrowing club while the loan is
  active.
- Exactly one senior sporting registration moves temporarily to the borrowing
  club and is restored deterministically at return. A player never has two
  active senior registrations.
- The parent shirt number is released while the loan is active. The loan stores
  only the preferred return number needed by the pending lifecycle, not a
  registration-history ledger. At return it reuses that number if free;
  otherwise the canonical registration allocator selects the first valid free
  number deterministically.
- Parent lineup/preparation state must not retain an unavailable outgoing
  loanee, and the borrower never receives an invented automatic starter
  assignment. Both clubs reuse their canonical selectable-player validation.
- The original employment contract remains with the parent club.
- The original contract must cover the complete loan term.
- The parent club may renew that contract during the loan.
- A loaned player cannot be permanently transferred or loaned again until
  return.
- Return is deterministic, idempotent, and safe under save/reload.
- Squad floors, registration, shirt/lineup availability, finance reservations,
  and player statistics must use the correct temporary/parent relationship.

The canonical query language is:

- `ownedPlayerIds(...)`: exposes persisted parent ownership and is used by
  free-agent detection, seller/owner discovery, contract ownership, and
  `player_not_owned_by_selling_club` validation;
- `selectablePlayerIds(...)`: derives the senior sporting roster as
  `owned present + active incoming loanees - active outgoing loanees` and is
  used by lineup, fixture preparation, squad maintenance, AI sporting need,
  seller depth, and structural diagnostics.

`Club.playerIds`, the active employment contract, the active loan, and the
senior sporting registration are cross-slice facts with one required meaning:

- ownership and employer remain the parent club;
- active registration and selectability identify the borrowing club;
- return removes the temporary registration and restores one parent
  registration deterministically, preferring the departure shirt number when
  it is still free;
- `createCareerState(...)` or one equivalent cross-slice validator rejects any
  disagreement. An isolated squad-state constructor must not guess ownership
  without the loan facts it needs.

These are accessors over one ownership truth plus active loan facts, not two
persisted copies of a roster. Direct `club.playerIds` reads are classified in
Step 01 and remain only where ownership is deliberately required.

An outgoing loan and every autonomous AI permanent-sale decision are eligible
only if the prospective post-departure selectable roster retains:

- at least `18` senior players;
- at least `2` goalkeepers;
- at least `6` defenders;
- at least `6` midfielders;
- at least `3` attackers.

An active incoming loanee counts toward the borrowing club's selectable total
and department floor; an active outgoing loanee does not count toward the
parent club's selectable total. Owned headcount remains a separate diagnostic
and must never substitute for sporting depth. Seller willingness and automatic
squad-health gates use selectable depth, not ownership length. This does not
turn the AI protection into a new global rejection rule for a permanent
transfer explicitly accepted by the selected-club manager.

The archived pre-career loan roadmap is design history only. Phase 82A must
integrate the current canonical CareerState, contracts, Posta, transfer
windows, finance, participation, and SQLite/OPFS owners rather than reviving a
parallel legacy path.

## Wage Sharing

The original club contract is unchanged. The borrowing club reimburses one of
three exact shares of the wage during the loan:

- `0%`;
- `50%`;
- `100%`.

Rules:

- the share is defined as the borrowing club's contribution;
- cost and budget commitment are prorated over actual loan dates;
- no second player contract is created;
- both clubs' available wage room and committed wages reflect their share;
- accounting is idempotent across monthly/season rollover and save reload;
- the share is the only negotiable loan term in Phase 82A.

## Real Sporting Need And Development

- AI requests or accepts a loan only when it has a real departmental need.
- The candidate must plausibly enter the receiving club's useful rotation.
- There is no contractual playing-time promise in Phase 82A.
- There is no automatic loan-development bonus.
- Real committed minutes and ratings at the borrowing club feed the same
  quarterly development system as every other player.
- A badly chosen loan can yield little growth when the player does not play.
- AI lineup and squad-maintenance logic must recognize the loanee without
  corrupting parent ownership.

## UI Contract

Squad:

- contextual actions expose the two combinable market postures;
- visible, non-color-only state identifies listed/loan-available/loaned players;
- active-loan restrictions disable incompatible actions with an explanation.

Market:

- supports requesting a loan where eligible;
- shows parent club, temporary club when relevant, end-of-season return, and
  borrowing-club wage share;
- uses the existing player-detail workspace and transactional dialog rules.

Posta:

- renders incoming permanent and loan offers with exact locale-safe money;
- preserves keyboard operation, focus, expiry, and final-counter semantics;
- resolving a message executes one typed runtime command and persists once.

No separate loan-only navigation section is added in Phase 82A.

## Beta Save Policy

Loan ownership, market postures, and incoming negotiations change durable
career facts. Phase 82A therefore:

- bumps the canonical beta save/schema version;
- deletes incompatible beta saves;
- provides no legacy migration or fallback representation;
- proves new compatible saves round-trip through JSON and SQLite/OPFS.

State validation rejects more than one unresolved negotiation for the same
`(acquiring club, player)` pair across permanent and loan kinds. It accepts
different acquiring clubs targeting the same player. Existing beta saves are
deleted only when their schema or cross-slice ownership/registration/loan facts
are incompatible; valid parallel-buyer state is not a reset reason.

## Required Diagnostics

Bounded checks before the final cohort must report positive observations for:

- incoming permanent-offer candidate, affordability, submission, counter,
  accept, reject, and completion funnels;
- listed versus unsolicited offer frequency;
- five-open-offer cap counted by individual incoming negotiation and per-buyer
  negotiation uniqueness across permanent and loan kinds;
- zero concurrent negotiations scheduled for one player, proving the Phase 82A
  scheduling restriction holds while the domain still permits them;
- same-buyer rejection cooldown;
- outgoing and incoming loan creation;
- wage-share `0/50/100` affordability and accounting;
- selectable-squad and department-floor eligibility with positive incoming
  and outgoing loan observations;
- owned headcount reported separately from selectable headcount;
- squad-need/rotation eligibility;
- loan minutes, ratings, development, and zero-growth bench cases;
- deterministic season-end return;
- no loan mutation/duplication of `Club.playerIds` and no duplicate
  registration, finance, history, or statistics;
- registration belongs to the borrower during the loan and returns
  deterministically to the parent;
- public-assessment parity between manager and AI.

## Final Longitudinal Gate

Phase 82A does not own the checkpointed market cohort. Phase 82B Step 09 owns
it, once loans and competitive races both exist.

Running it here would certify a market that is about to gain competitive
resolution, repeating the mistake that invalidated Phase 79 Step 14 against the
Phase 79C economy. Phase 82A therefore closes on bounded diagnostics, browser,
persistence, and repository gates only.

The match engine is not part of this argument. Under the 2026-08-02 phase order
Phase 81 is already Done, so the engine observed by any run in this phase is
the accepted one. The Phase 81 Step 12 cohort remains valid engine evidence and
is not market evidence: it observed no postures, no loans, and no races.

Phase 82A must still leave the cohort runnable: shard, checkpoint, and worker
wiring stay intact and exercised by bounded runs, so Phase 82B starts from
working infrastructure rather than rebuilding it.

## Effect On The Free-Agent Channel

A loan and a free-agent signing solve the same squad gap, so this phase is the
first real competitor to the channel Phase 81A calibrated. That phase froze the
free-agent pool as a cycle - peak of `5-7%` of a competition's senior
population at the season boundary, trough near `2%` once the window closes, and
a drain between them attributed mostly to signings rather than to players
leaving football.

Step 07 re-measures that cycle once loans exist, with unchanged seeds and
denominators, and records it beside the Phase 81A values. If clubs now borrow
instead of signing and the pool stops reaching its trough, the correction
belongs to the loan need policy: a borrowed player occupies a rotation slot
temporarily, and preferring that over a permanent free signing for a structural
gap is the defect. Neither the free-agent policy nor the frozen band is adjusted
to accommodate it. Loans add a channel; they may not quietly close another.

## Explicit Non-Goals

- No loan fee, purchase option/obligation, recall, renewal, or playing-time
  promise.
- No player swaps or resale percentages.
- No scouting/fog-of-war market advantage.
- No more than one counterproposal.
- No more than five unresolved incoming offers.
- No tightening of the canonical per-buyer negotiation uniqueness into a global
  one-per-player rule.
- No shared optional-field negotiation aggregate for permanent and loan terms;
  each lifecycle keeps its own discriminated state and shares only clocks,
  money/value objects, Posta grammar, and cross-kind queries.
- No simultaneous competing bids, competitive resolution, raise loop, or
  player-chooses-between-suitors behaviour; Phase 82B owns all of it.
- No compatibility migration for beta saves.
- No longitudinal cohort in Phase 82A; Phase 82B Step 09 owns the market
  `50 x 20` once loans and competitive races both exist.
