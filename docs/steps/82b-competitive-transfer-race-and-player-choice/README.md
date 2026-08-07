# Phase 82B - Competitive Transfer Race And Player Choice

## Status

**Draft.** The product contract is accepted, but Phase 81A, Phase 81B and Phase
82A now land in front of it. This phase was previously numbered 80C. Do not
start until Phase 82A is complete.

The cross-phase requirements added on 2026-08-02 - the shared season boundary,
the free-agent cycle the three-day player stage must not close - are intent to
re-verify, not frozen numbers. Revise them against the evidence the earlier
phases produce.

## Goal

Make contested signings real through one durable, extensible path: several
clubs may chase the same player, the manager can see and answer the relevant
rival transfer amount, the seller resolves bids together, and the player
chooses between qualified suitors.

The governing contract is:

- `docs/audits/PHASE_82B_COMPETITIVE_TRANSFER_RACE_DESIGN_CONTRACT.md`

## Entry Gate

- Phase 80, Phase 80A, Phase 81, Phase 81A, Phase 81B, and Phase 82A are Done.
- One season-boundary owner exists, introduced by Phase 81B. Race deadlines
  capped by a registration-window close read the same boundary as contract
  expiry and loan return.
- The contract's six accepted product decisions remain unchanged.
- Market cadence is staggered per club. Synchronized cadence would give every
  race a full participant set on day zero, so the late-joiner observation
  required by Step 08 could never occur.
- Canonical uniqueness remains per `(acquiring club, player)` across
  negotiation kinds; different acquiring clubs may target the same player.
- Phase 82A's temporary same-player scheduling restriction is in force.
- Owned/selectable accessors are in use by structural squad floors.
- Public value is club-independent; UI, valuation, willingness, and AI share
  one current/`P50`/upper assessment.
- Phase 79 Step 14 remains Reopened, paused, and unclaimed.

## Fixed Architecture

- Permanent, loan, and free-agent negotiation states remain separate
  aggregates.
- `PlayerTransferRace` is a small durable coordination aggregate over
  discriminated negotiation references. It never duplicates commercial facts.
- One and several participants use the same race lifecycle.
- A race has at most three active acquiring clubs; a closed participant frees a
  place before the deadline.
- Race state and persistence land before seller, raise, or choice behaviour.
- Club-stage resolution returns qualified, outbid, and rejected sets; it does
  not choose the transfer winner before the player stage.
- Only the highest seller-acceptable fee and exact matches qualify. Lower
  acceptable fees close as `outbid`.
- `outbid` means eliminated on the transfer amount; `lost_to_rival` means a
  qualified suitor lost the player's choice.
- One immutable shared clock per stage; late club-stage joiners inherit it, and
  the club-to-player transition opens exactly one new player-stage clock.
- Club and player stages each last exactly three in-game days, capped by the
  applicable registration-window close.
- A buyer can match, make a minimum-increment stale-safe raise, or withdraw;
  counters never reset a stage clock.
- The manager sees relevant rival transfer amounts, not rival contract terms.
- Only a winner reaches an existing atomic transfer/signing commit.
- Permanent transfers and free agents race in this release. Loans keep the
  serial Phase 82A lifecycle behind the same discriminated extension seam.
- A free agent always waits through the full shared player-stage window, even
  with one suitor. That wait slows every signing on the channel Phase 81B
  calibrated, so Step 06 re-measures that phase's free-agent cycle and repairs
  any shortfall through approach frequency and concurrent-pursuit limits, never
  by widening the frozen band.
- For a manager-owned player, accepting an offer records seller acceptability
  but does not close the race before its shared deadline.
- Tunable coefficients are versioned content; structural semantics remain typed
  code.
- Race diagnostics live in their own Module and cannot pass on zero
  observations.
- Step 09 closes Phase 82B and owns the second checkpointed `50 x 20`, run with
  exactly seven workers over the completed competitive market. Phase 81 Step 15
  ran the historical engine cohort, Phase 81A Step 16 closes the contextual
  engine, and Phase 81B Step 07 runs `750 x 10` over complete
  selected-division fixtures plus its free-agent foundation. None observes both
  loans and races, so none can prove the completed market. The market run
  remains an accepted cost of the phase order.

## Ordered Steps

1. `01-race-contract-policy-and-exhaustiveness-guard.md`
2. `02-durable-race-state-persistence-and-beta-reset.md`
3. `03-club-stage-clearing-and-competitive-resolution.md`
4. `04-raise-posta-visibility-and-ai-raise-policy.md`
5. `05-player-choice-between-qualified-suitors.md`
6. `06-free-agent-negotiation-and-race.md`
7. `07-market-squad-and-posta-race-ui.md`
8. `08-non-vacuous-transfer-race-diagnostics.md`
9. `09-bounded-phase-report-and-world-extension-handoff.md`

## Validation Ladder

- Step 01 freezes accepted decisions, types, policy coefficients, invariants,
  and exhaustive status handling without gameplay changes.
- Step 02 persists the durable race and resets incompatible beta saves.
- Step 03 resolves the selling-club stage into explicit qualification sets.
- Step 04 adds match/raise/withdraw actions, current Posta visibility, and
  bounded AI reactions.
- Step 05 compares qualified suitors and closes player-choice losers.
- Step 06 adds the missing durable free-agent negotiation through the same race
  path while preserving the atomic signing commit.
- Step 07 projects canonical race facts into Market, Squad, and Posta.
- Step 08 adds dedicated non-vacuous race diagnostics.
- Step 09 reruns bounded race/repository/browser gates, runs and replays the
  second checkpointed `50 x 20`, measures market density against the frozen
  bands, writes the phase report, and hands control to the world-extension work
  (L2 national divisions, then the calibrated aggregate producer for foreign
  countries).
- Only Step 09 runs a longitudinal cohort. Steps 01-08 run none.

## Mandatory Per-Step Loop

For every step:

- reread `docs/PROJECT_STATUS.md`, this README, the active step in full, and the
  constraints in `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- modify only the active step's Expected Files plus `docs/PROJECT_STATUS.md` and
  an explicitly permitted next-step lesson;
- run the step checks and fix failures before advancing;
- add useful JSDoc/TSDoc to new or materially modified exported functions and
  types;
- mark the active step `Done` with adopted solution, verification,
  blocker/lesson, and next action;
- keep later steps `Not started` until they become active.

## Phase-Level Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

The second checkpointed `50 x 20` runs only in Step 09, with exactly seven
workers, over the completed competitive market.

## What NOT To Implement

- No race outside canonical negotiation lifecycles.
- No optional-field super-aggregate for permanent, loan, and free-agent talks.
- No duplicate fee, terms, status, or second effective stage clock.
- No deadline reset, per-club race deadline, or duplicate effective clock.
- No rival contract-term disclosure or hidden AI information advantage.
- No generic ranking framework, strategy/plugin registry, participant
  hierarchy, or event bus.
- No durable bid history.
- No agents, playing-time contracts, swaps, resale clauses, or loan fees.
- No competitive loan race in this release.
- No longitudinal cohort before Step 09.
- No reuse of Phase 81 Step 15, Phase 81A Step 16 or Phase 81B Step 07 as
  completed-market evidence: none observed both loans and races.
- No Phase 79 Step 14 or Step 15 implementation.

## Definition Of Done

- Parallel buyers contest one player through canonical negotiations and one
  durable race without duplicate facts.
- Seller resolution is set-based and deterministic; processing order cannot
  select a winner.
- No race exceeds three active acquiring clubs; a pre-deadline withdrawal frees
  exactly one place.
- Only the highest seller-acceptable fee and its exact matches reach player
  choice.
- Matches and raises are deadline-preserving; raises are minimum-increment and
  stale-safe, and withdrawal affects only its participant.
- The player chooses only between qualified suitors; exactly one accepted path
  commits and every other terminal outcome is explicit.
- Free agents have a real negotiation state and use the same race path.
- One-suitor free agents still receive the fixed three-day player stage.
- UI and AI consume the same permitted facts.
- Race persistence round-trips losslessly and incompatible beta saves are
  deleted.
- Every diagnostic has a positive denominator or `not_evaluated`.
- Focused checks, browser QA, persistence, `pnpm check`, and bounded
  positive-denominator race diagnostics pass.
- The second checkpointed `50 x 20` completes and replays with 50 stable shards
  and exactly seven workers, and measured market density is recorded against
  the frozen bands whether or not it lands inside them.
- The world-extension work receives the handoff; Phase 79 Step 14 remains
  paused, unrun, and unclaimed.
