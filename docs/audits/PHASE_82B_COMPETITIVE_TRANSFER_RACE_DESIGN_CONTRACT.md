# Phase 82B - Competitive Transfer Race Design Contract

## Status

Accepted on 2026-07-31 after product review and a repository-level architecture
audit. The architectural ownership, invariants, and six product decisions below
are fixed before Step 01 becomes active.

Product review rejected the Phase 82A proposal to allow only one unresolved
negotiation per player. Several clubs chasing the same player, the manager
learning about a rival bid, and the player choosing where to sign are intended
football behaviours, not edge cases.

## Player-Facing Goal

The manager bids `€1m` for a target. A rival club bids `€2m`. The manager finds
out and may raise, match, or walk away. Clubs that clear the selling-club stage
may then compete on contract terms, and the player decides where to sign using
wage, duration, promised squad status, and sporting standing.

This must not happen on every deal. It must occur often enough that desirable
targets feel contested and losing a signing is a real, explainable event.

## Entry Gate

- Phase 80, Phase 80A, and Phase 82A are Done.
- Canonical per-`(acquiring club, player)` uniqueness permits different buyers
  to approach the same player.
- Phase 82A's scheduler still avoids creating those parallel approaches; Phase
  82B lifts that scheduling restriction only for explicitly supported kinds.
- Owned and selectable squad accessors exist and structural floors use the
  selectable Interface.
- Public value is club-independent and UI, valuation, willingness, and AI use
  the same public current/`P50`/upper assessment.
- Phase 79 Step 14 remains Reopened, paused, and unclaimed.

## Verified Starting Facts

Checked against the repository before this amendment:

1. Domain validation already enforces uniqueness per
   `(buyingClubId, playerId)`, not globally per player.
2. `advanceTransferNegotiations` resolves due negotiations independently in
   sorted ID order; offers are never compared as one set.
3. `resolveSellerReply` evaluates one offer at a time through
   `deriveSellerTransferWillingness`; therefore it has no way to choose between
   rival bids at shared stage deadlines.
4. `advanceTransferPlayerNegotiations` also evaluates contracts independently.
   Two accepted paths would be decided by clock order, and the later completion
   can fail on `stale_ownership` instead of losing on merit.
5. `applyCareerFreeAgentSigning` is an immediate atomic commit. There is no
   canonical free-agent negotiation state.
6. `projectTransferNegotiation` is one known non-exhaustive status switch, but
   storage, UI, AI, CLI, and diagnostics contain other status consumers that
   must be inventoried before new terminal states are added.

Facts 2 to 5 are behaviour owned by Phase 82B. Fact 6 is a compile-safety gate
owned by Step 01.

## Architecture Ownership

### 1. Negotiations own commercial facts

Permanent, loan, and free-agent negotiations are separate canonical aggregates.
They may share small value objects and selectors, but they do not become one
optional-field-heavy state.

- `TransferNegotiationState` owns permanent transfer fee and contract stages.
- `LoanNegotiationState` owns the loan proposal and wage-share path.
- `FreeAgentNegotiationState` owns a free agent's contract approach.
- Each state owns its own offered terms, status, and clock.

### 2. The race owns coordination only

`PlayerTransferRace` is a durable coordination aggregate over discriminated
canonical references such as `{kind, negotiationId}`. It owns:

- player ID;
- participating negotiation references;
- current race stage and its one immutable shared stage clock;
- terminal outcome.

It never copies fees, contract terms, or negotiation statuses. While an
approach participates in a race, the race clock is the only effective clock for
that coordinated stage; a second negotiation-level effective clock is invalid.
This keeps a single owner for every fact and lets another supported negotiation
kind join later without changing existing aggregates.

```text
canonical approaches
        -> durable race coordination
        -> club-stage qualification set
        -> player choice between qualified suitors
        -> exactly one atomic completion
```

### 3. One and many participants use the same path

The first supported approach creates the race and later approaches join it.
There is no separate "instant signing command" business workflow; one and many
participants use the same state machine. An uncontested free agent waits
through the same full player-stage response window as a contested free agent.

### 4. Persistence lands before behaviour depends on it

Race state is added to `CareerState`, JSON, SQLite/OPFS, and validation in Step
02. Seller resolution, raises, and player choice cannot depend on ephemeral
reconstruction. Incompatible beta saves are deleted at that seam, with no
migration, dual reader, or fallback default.

### 5. The AI lifecycle remains a stable Interface

`ai-market-lifecycle` remains the composition Interface but its Implementation
is split by responsibility: targeting, scheduling, race coordination, and
resolution. Phase 82B does not add another top-level lifecycle or a generic
event bus.

## Cross-Flow Invariants

- At most one unresolved negotiation exists per `(acquiring club, player)`
  across permanent, loan, and free-agent kinds.
- Different acquiring clubs may have unresolved approaches for the same player.
- At most one open race exists per player.
- One negotiation reference belongs to at most one open race.
- At most three acquiring clubs may be active in one race. A participant that
  withdraws or otherwise closes before the club-stage deadline frees one place;
  a fourth active participant is rejected with
  `race_participant_limit_reached`.
- A race reference resolves to a known negotiation for the same player.
- A negotiation's commercial facts have exactly one canonical owner.
- A stage deadline never changes after that stage opens and never exceeds the
  earliest applicable transfer-window deadline.
- A late club-stage joiner inherits the existing club-stage deadline and does
  not reset any clock.
- Transitioning from the club stage to the player stage creates exactly one new
  shared player-stage clock. It is a new table, not a counter or reset.
- Exactly one accepted path may reach an atomic transfer/signing commit.
- Losing or rejected participants never reach completion and therefore never
  rely on `stale_ownership` as ordinary control flow.

## Club Stage

The seller waits until the shared club-stage deadline and evaluates all
permanent offers as one set through:

```ts
deriveClubStageResolution(facts, policy)
```

The result names `qualifiedNegotiationIds`, `outbidNegotiationIds`, and rejected
IDs. It does not return one premature transfer winner. Clubs eliminated on
price close as `outbid`. Among seller-acceptable offers, only the highest fee
qualifies; every offer that exactly matches that highest fee also qualifies.
Lower seller-acceptable offers close as `outbid`. When there is only one
seller-acceptable offer, it qualifies.

For an AI seller, acceptability comes from the canonical willingness owner. For
the selected-club seller, accepting an incoming offer records that offer as
seller-acceptable but never closes the race early. The manager may accept,
reject, or counter each canonical offer until the shared deadline. At the
deadline the same highest-fee rule applies to all manager-accepted offers.

This function is deliberately domain-specific. A generic `rankClubOffers`
would hide the important distinction between "seller rejects", "price loses",
and "player may choose".

## Raise Semantics

- Participants see the current best transfer amount and may match it exactly or
  raise above it until the immutable club-stage deadline.
- Matching the current best is a distinct valid action. A true raise must clear
  a versioned relative increment with an absolute integer-minor-unit floor;
  `€2m + €1` is not automatically meaningful.
- The command carries the best amount observed by the caller. If it is stale,
  the engine rejects deterministically and returns the new minimum rather than
  applying last-write-wins.
- The manager may respond once to each newly observed rival best amount. They
  cannot repeatedly raise against their own leading bid without a new rival
  fact.
- AI evaluation is bounded to once per `(club, race, in-game day)`, respects
  budget and squad need, and consumes the same visible race facts as the
  manager.
- A buyer may walk away before the deadline. Its canonical negotiation closes
  as `withdrawn`; the race and other participants continue.
- Posta exposes one current actionable race conversation. It does not persist a
  message or bid-history entry for every raise.

## Player Stage

Only club-stage-qualified negotiations are compared simultaneously through:

```ts
rankPlayerSuitors(facts, policy)
```

- Existing willingness and contract evaluation remain the single-offer
  Implementation.
- Club-stage qualification opens one shared player-stage clock so every
  qualified club has time to submit its contract terms. Contract counters do
  not reset that clock.
- Comparison adds timing and ordering; it does not create a second preference
  model.
- Wage, contract duration, promised squad status, and club standing/reputation
  are the current criteria.
- Qualified losers close as `lost_to_rival`.
- If every suitor is unacceptable, the race closes without a transfer. There is
  no silent runner-up retry.
- Free agents enter this stage without a selling-club stage.
- The player stage always lasts the fixed three in-game days owned by policy,
  including when only one free-agent suitor exists. There is no separate
  instant-signing business workflow.

## Deadline-Day Ordering

Window capping may make a newly opened player stage due on the same game date.
That must not make the second table vanish inside the transition that created
it.

- One advancement transition resolves at most the stage that was open at its
  start.
- A player stage created during club-stage resolution is not evaluated or
  expired in that same transition, even when its capped deadline is today.
- If the selected club must act, canonical actionable Posta is projected before
  another lifecycle pass may resolve the stage.
- AI-only terms may be submitted deterministically on that date, but player
  choice still occurs through a later idempotent lifecycle pass.
- This is deadline-day compression, not a deadline reset or hidden grace day.

## Atomic Boundaries

`applyCareerFreeAgentSigning` and permanent-transfer completion remain atomic
commit Interfaces. They do not become negotiation machines. Race resolution
happens before them and exactly one winner may call the relevant commit.

## Visibility And Information Parity

- The manager sees the exact current rival transfer amount only when the
  selected club is a participant or owns the player.
- Rival contract terms remain private; the player compares them internally.
- Uninvolved AI-to-AI races are not exposed to the manager.
- Participating AI receives no hidden stored ceiling or race fact unavailable
  to the manager.
- State is communicated with labels and structure, never by colour alone.

## Versioned Policy Boundary

Schema-validated content assets own tunable numeric coefficients:

- minimum raise basis points and absolute floor;
- maximum active acquiring clubs per race, fixed to `3` for this release;
- club-stage and player-stage response durations, each fixed to three in-game
  days and capped by the applicable window;
- bounded AI raise coefficients;
- player-stage comparison weights;
- diagnostic calibration thresholds frozen before execution.

Structural semantics such as which bids qualify, which negotiation kinds may
race, and what a terminal state means remain explicit typed code and documented
product decisions. They must not be disguised as arbitrary data fields or a
generic strategy registry.

The initial supported race kinds are permanent transfers and free-agent
approaches. Loan negotiations remain on the serial Phase 82A lifecycle. Race
references stay discriminated so a later documented phase can add competitive
loan races without changing permanent, loan, or free-agent aggregates.

## Exhaustiveness

Before adding `outbid` or `lost_to_rival`, and before the existing `withdrawn`
status becomes a race transition, Step 01 inventories all status consumers
across domain validation, engine projection/resolution, storage, `@game/ui`,
web, CLI, and diagnostics. Every exhaustive owner gets a `never` guard or an
equivalent total mapping. Enabling `noImplicitReturns` repository-wide is not
required.

Set membership followed by a default classification is not a total mapping.
The Market presentation union intentionally merges transfer and
preliminary-agreement statuses, so exhaustiveness is enforced independently at
each source boundary with mappings satisfying
`Record<TransferNegotiation["status"], ...>` and
`Record<PreliminaryAgreement["status"], ...>`, not by equating the merged UI
union to either source union.

The canonical CLI market demo must also map every transfer terminal explicitly;
a race loss cannot fall through to `seller_contract_not_found`. Legacy Phase
79D seller/counter-spread collection filters race-only `outbid` and
`lost_to_rival` outcomes before invoking total mappers narrowed to the
legacy-eligible union. The exclusion classifier is itself exhaustive over the
full transfer-status union. Race-only outcomes are never relabelled; the
dedicated Phase 82B race audit is their diagnostic owner.

## Dedicated Diagnostics

Transfer competition gets a dedicated `transfer-race-audit` Module rather than
deepening `player-generation-economy-audit`. Every metric carries an
`observationCount`; zero is `not_evaluated` or failure, never `PASS`.

Structural hard failures include:

- mutable or invalid shared deadlines;
- duplicate effective clocks or a stage transition that creates more than one
  next-stage clock;
- duplicate/open-race invariant breaks;
- more than one atomic completion;
- a race loser reaching completion;
- a stage created and resolved/expired in the same transition;
- `stale_ownership` used to dispose of a race loser;
- missing manager-visible terminal projection.

Calibration evidence includes race frequency, participant counts, matches,
raises, withdrawals, price ties, player choices, and free-agent races. Its
bands are documented before the final run and are not weakened after observing
the result.

Race introduction changes the denominator of the legacy Phase 79D
seller/counter-spread metric because `outbid` and `lost_to_rival` leave that
population. Step 08 reports canonical negotiation count, legacy-eligible count,
and race-only exclusion count separately. Rates from before and after this
boundary are labelled non-comparable unless they are recomputed with the same
eligibility definition.

## Longitudinal Gate

Phase 82B Step 09 closes on bounded non-vacuous race evidence and owns the
checkpointed market `50 x 20`, run and replayed with exactly seven workers over
50 stable shards.

This is the second such cohort, and the duplication is deliberate. Under the
2026-08-02 phase order the accepted Phase 81 tactical match-engine rework lands
first, so its Step 12 cohort ran against a world with no postures, no loans, and
no races. That run is valid engine evidence and cannot serve as market evidence:
the behaviour it would need to observe did not exist when it ran. Reusing it
here would certify a competitive market the cohort never saw.

Step 09 also measures market density against the frozen bands and records every
measured value, inside band or not. The bands are frozen before the run; a miss
is reported and assigned to a named owner, never absorbed by adjusting the band.

It additionally re-measures the free-agent cycle calibrated in Phase 81A - peak
at the season boundary, trough once the window closes, and the drain between
them attributed between signings and exits. Two changes in this release act on
that channel: the mandatory three-day player stage slows every free-agent
signing, and loans introduced in Phase 82A compete for the same squad gaps.
Contract expiry drives `62.5%` of real movements, so a channel that quietly
stops draining would undo the largest gain of the earlier work while every gate
here stayed green. The cycle is therefore reported beside its Phase 81A values,
and a shortfall is repaired in the mechanism that caused it.

Phase 79 Step 14 remains paused, unrun, and unclaimed.

## Accepted Product Decisions

1. **Club-stage qualification:** only the highest seller-acceptable transfer
   fee qualifies, including every exact match at that amount. Lower acceptable
   offers close as `outbid`; a sole acceptable offer qualifies.
2. **Loan competition:** loans stay serial in the initial Phase 82B release.
   Discriminated references preserve the later extension seam without adding
   unused loan-race behaviour now.
3. **Maximum participants:** one race permits at most three active acquiring
   clubs. A pre-deadline withdrawal or closure frees a place; a fourth active
   join is rejected as `race_participant_limit_reached`.
4. **Free-agent response window:** a free agent always uses the shared
   three-day player stage, even with one suitor.
5. **Manager-owned seller:** accepting an incoming bid marks it
   seller-acceptable but never closes the race early. The manager may qualify
   several bids; only the highest accepted amount and its exact matches advance
   when the shared club-stage deadline expires.
6. **Stage duration:** club and player stages each last exactly three in-game
   days, independently, capped by the applicable registration-window close.
   Deadline-day compression keeps the one-transition ordering rule.

## Explicit Non-Goals

- No auction outside canonical negotiation lifecycles.
- No second source of truth for fee, terms, status, or effective stage clock.
- No deadline extension, reset, per-club race deadline, or simultaneous
  negotiation/race clock for the same coordinated stage.
- No exact rival contract-term disclosure.
- No agents, playing-time contracts, swaps, resale clauses, or loan fees.
- No competitive loan race in the initial Phase 82B release.
- No change to atomic transfer or free-agent signing commits.
- No generic ranking framework, strategy/plugin registry, event bus, or
  abstract market-participant hierarchy.
- No durable bid history.
- No longitudinal cohort before Step 09, and no reuse of the Phase 81 Step 12
  cohort as market evidence.
