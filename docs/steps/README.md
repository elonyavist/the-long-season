# Implementation Steps

## Goal

Provide an open, incremental, and iterative execution guide for the project: one active step at a time, verified before moving on, with the ability to add or refine the next step group after current milestones are complete.

## Why we implement it this way

`requirements.md` requires scope discipline, not a dead end. The step system keeps implementation narrow while allowing the project to continue after `00-foundation`, `01-match-engine`, and `02-season-simulation`. Each step is a feedback loop: implement a small slice, test it, adjust the next step based on what was learned, then continue. Future work should become a documented step before code starts, without changing `docs/PROJECT_RULES.md`.

## What to implement

- Follow the mandatory execution loop:
  1. Read `docs/PROJECT_STATUS.md`.
  2. Choose the active step.
  3. Implement only that step.
  4. Run its required tests.
  5. If something is wrong, fix the current step or update the next relevant step document.
  6. Update `docs/PROJECT_STATUS.md` in a short entry with result, adopted solution, verification, and next action.
  7. Move to the next documented step only when the Definition of Done is satisfied.
- When the current sequence is complete, add the next numbered step group under `docs/steps/`.
- Whenever a step creates or generates domain IDs, use the shared `type:value` namespace convention and the specific domain constructor for that ID type.

## What NOT to implement

- Do not implement multiple step groups at once.
- Do not treat `99-future` as a permanent ban list.
- Do not change `docs/PROJECT_RULES.md` just to move to the next phase.
- Do not start code for a future feature before creating its step document.
- Do not carry a known broken assumption forward without updating the relevant step document.
- Do not expand the active step because a future step looks convenient.
- Do not leave project state only in chat messages; put it in `docs/PROJECT_STATUS.md`.

## Allowed dependencies

- None. This is documentation only.

## Expected files

- `docs/steps/README.md`
- Future step groups under `docs/steps/NN-step-name/` when their phase gate is reached.

## Required tests

- No tests.

## Definition of Done

- The project has a clear rule for continuing beyond the current step groups.
- The project still identifies exactly one active step at a time.
- The project has an explicit implement-test-learn-adjust loop.
- The mandatory execution loop is documented and short enough to follow during every step.
- Future steps know that domain IDs use the `type:value` namespace convention.
- `docs/PROJECT_STATUS.md` explains the current active step and project state to a new LLM or junior developer.
- Future phases can start without changing `docs/PROJECT_RULES.md`.

## Current State

- `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/`
- Status: Blocked pending the recorded ownership decision. Steps 05, 06, and 08
  are reclosed. Step 09 completed the exact `750 x 3` fresh/resume proof with
  `750` one-world shards, exactly `7` workers, and an identical aggregate hash.
  All `32` player-model gates pass; the report remains `FAIL` only because
  `goals_per_match_avg` records `36/634/80` pass/warn/fail with every failure
  high.
- The 2026-08-02 decision resolves it: match scoring is outside this phase's
  player-model scope, so the monitor transfers unchanged to Phase 81, which owns
  the match engine. Threshold, denominator, and severity class all stay as they
  are. Phase 80A closes on that transfer; it does not close by weakening the
  gate.
- Phase 81 is the next phase. The market work is deferred behind it and the
  Phase 81A, and is renumbered Phase 82A and Phase 82B.
- `docs/steps/80-graphical-and-structural-rework/`
- Status: Done. All nine steps are complete and the phase handed control to
  Phase 80A on 2026-07-31.
- Steps 04-07 delivered the remaining four accepted reworks: Market pagination
  with a `250 ms` typed-filter delay and bounded `15..40` age selects; Squad
  canonical age, Placement next to Role, and a delayed player search; one shared
  exact locale money presentation with an integer-safe editable parser; and an
  explicit dialog dismissal policy that keeps a transfer-offer draft alive.
- Step 08 closed every repository, build, dependency, and browser gate on the
  pinned Node `24.16.0` toolchain, including Playwright `34/34`, and recorded
  `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_REPORT.md`.
- Step 09 closed the phase without running any longitudinal cohort.
- Step 01 established one repository-wide simulation execution policy:
  multi-work-item batches default to `min(7, work items)` and cannot exceed
  seven workers; explicit overrides may only reduce concurrency.
- Step 02 accepted five bounded items and created Steps 03-09: shared
  achieved-versus-upside stars; Market pagination/debounced typed filters/age
  selectors; Squad age/order/debounced search; exact locale-aware money;
  transfer-offer dialog stability; integrated QA; phase closeout.
- Step 03 completed the shared achieved-versus-upside renderer correction.
  Product review then exposed a separate player-generation/projection issue;
  Phase 80A owns that model work so Phase 80 does not duplicate it in React.
- Phase 79D delivered archetype-compatible exceptional generation, effective
  rarity budgets, production annual intake allocation, a derived public
  potential range, range-aware discounted prospect value, display-safe
  upper-cap semantics, observable negotiation spread, and non-vacuous joint
  diagnostics.
- Focused checks, `pnpm check`, build, Playwright `29/29`, and manual browser
  QA pass. Its attempted direct `50 x 20` was stopped, wrote no report, and is
  not claimed as evidence.
- Two longitudinal cohorts exist under the 2026-08-02 phase order, each with
  `50` stable shards and exactly `7` workers. Phase 81 Step 12 runs the first
  over the accepted match engine; because the market work now follows, that run
  observes no loans and no races and is not market evidence. Phase 82B Step 09
  runs the second over the completed competitive market. Neither substitutes for
  the other, and no other step in Phases 80, 80A, 81, 82A, or 82B runs one.
- The Phase 80A contract removes public-valuation `marketContext`, all
  owner-category/free-agent multipliers, and all per-context maximums in favor
  of one global model/cap and a new source-backed calibration epoch.
- The Phase 82A contract keeps `Club.playerIds` as immutable-under-loan
  ownership truth, derives selectable squads through named accessors, and
  protects `18` plus `2/6/6/3` floors. Product review rejected its proposed
  global one-negotiation-per-player rule: the canonical per-buyer uniqueness
  stays, and Phase 82A only restricts its own scheduler from creating
  concurrent bids.
- The Phase 82B contract owns competing bids as a wanted football behaviour:
  durable `PlayerTransferRace`, one immutable shared clock per stage,
  club-stage qualification sets, exact rival-fee visibility with a versioned
  minimum raise increment, and player choice between qualified suitors.
- Phase 79 Step 14 remains Reopened and paused without a release-gate claim.
  Do not resume it until Phase 81 and its final `50 x 20` are complete.
- The user-requested Phase 79B browser/product interposition is Done after all
  seven steps and returned control to Phase 79 before the later 79C/79D
  interpositions. It did not run, replace, weaken, or claim Phase 79 Step 14's
  release gate.
- Phase 79A is Done after a repeated `50 x 20` with zero owned structural
  failure. It does not replace or claim Phase 79 Step 14's release gate.
- Entry-gate deviation: Phase 79 was started by explicit user decision while
  Phase 78 Step 15 was still open. Phase 78 Step 15's obligations remain
  outstanding and are tracked in `docs/PROJECT_STATUS.md`.

## Paused Parent Phase

- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/`
- Status: In progress. Steps 01-13 are Done, Step 14 is Reopened but paused
  through Phases 80, 80A, 82A, 82B, and 81, and Step 15 is not started.
- No Phase 79 staged cohort has been run or claimed against the post-79C
  economy.

## Completed Corrective Phase

- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/`
- Status: Done. All nine ordered documents are closed.
- The stopped direct `50 x 20` remains explicitly unclaimed; the replacement
  cohort belongs to Phase 81 Step 12 and must use checkpoints, `50` stable
  shards, and exactly `7` workers.

## Planned Rework Continuation

- `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/`
- Status: Blocked. Steps 01-08 are Done/reclosed; Step 09 completed its exact
  deterministic fresh/resume execution but cannot close while the frozen
  report-wide match-goal monitor remains `FAIL`.
- It owns dynamic club tier/reputation/environment, quarterly development,
  current/P50/upper projection, contextual prospect supply, national
  exceptional stock, annual intake, expected-outcome value, and fair AI
  information.
- It deleted/rejected incompatible beta evidence and completed a compact
  checkpointed `750 worlds x 3 seasons` player-development diagnostic with
  exactly `7` workers and a zero-new-world resume proof, but no `50 x 20`.

- `docs/steps/81a-season-anchored-contracts-free-agent-economy-and-background-fixtures/`
- Status: Planned. Created by the 2026-08-02 phase-order decision as the
  playable-MVP work between Phase 81 and the market phases.
- It owns three measured defects and two features. Contract expiry is anchored
  to the season boundary through one named owner, replacing
  `startsOn + durationYears * 365` and the `0..120` day generation scatter; the
  offered term becomes months with a season-end floor and a `60` month ceiling,
  which is what FIFA's own minimum requires and what the `18-30` band needs; and
  the AI gets a free-agent signing policy, because the pool sits at a measured
  `20-23%` share and does not drain. The pool is treated as cyclical: it is
  frozen as a peak of `10-12%` of a competition's senior population at the
  season boundary, a trough near `3%` once the window closes, and a drain
  between them achieved mostly by signings. The delta is the gate; the level is
  description, because a pool whose peak equals its trough sits inside any level
  band while being exactly the defect.
- Steps 02 and 03 are reported together. Shortening contracts without a signing
  policy produces a larger warehouse and would measure as a regression.
- It then resolves background fixtures for the selected club's division inside
  `advanceCareerMonths`, adds the simulate-match command on the same producer,
  and measures market density against bands frozen in its Step 01.
- Its Step 06 decides whether Phase 82A is still justified. If density is
  already inside band, the loan work is re-argued rather than started by
  default.
- It runs no longitudinal cohort and touches no market feature.

- `docs/steps/82a-incoming-offers-market-postures-and-loans/`
- Status: Planned and entry-gated, previously numbered 80B. It starts only after
  Phase 80A is Done, Phase 81 is Done, Phase 81A is Done, and market
  density has been measured against the frozen bands.
- It owns durable sale/loan postures, selected-club incoming offers, one final
  counterproposal, bidirectional loans, three wage-share choices, real
  loan development, Posta UI, and persistence.
- It keeps outgoing `Action available` separate from seller willingness; the
  seller may still answer `player_not_for_sale`, and React may not duplicate
  that decision.
- It keeps the canonical per-`(buying club, player)` negotiation uniqueness
  unchanged and only restricts its own scheduler from creating concurrent bids
  until Phase 82B makes them safe.
- It runs no longitudinal cohort.

- `docs/steps/82b-competitive-transfer-race-and-player-choice/`
- Status: Planned under an accepted product contract, previously numbered 80C.
  It starts only after Phase 82A is Done.
- It owns a durable `PlayerTransferRace` over canonical negotiation references,
  explicit qualified/`outbid`/`lost_to_rival` outcomes, stale-safe raises,
  player choice, free-agent negotiation, and dedicated race diagnostics.
- It permits at most three active buyers, qualifies only the highest
  seller-acceptable fee and exact matches, keeps loans serial, gives both
  stages fixed three-day clocks, and never closes early on manager acceptance.
- Step 09 closes the phase on non-vacuous evidence, runs the second
  checkpointed `50 x 20` over the completed market, measures density against the
  frozen bands, and hands control to the world-extension work.

- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/`
- Status: Planned under an accepted design contract, and next in order. It
  starts after Phase 80A closes by transferring its goal-rate monitor here.
- It preserves the deterministic aggregate match engine while making
  formation shape, role suitability, opponent matchups, tactical instructions,
  and live manager decisions causally relevant.
- It keeps player quality, intrinsic team shape, and relational matchup as
  separate typed concepts; removes the four-department information collapse;
  derives causal actors before outcomes; and gives pre-match, live, AI, batch,
  and diagnostic paths one shared decision seam.
- Every step must remove obsolete local paths and perform any necessary
  in-scope refactor instead of layering compatibility branches or generic
  helper modules over unclear code.
- It accepts the `goals_per_match_avg` monitor transferred from Phase 80A
  unchanged. Step 06 owns the fix, Step 11 is the deadline, and the monitor may
  not be transferred a second time.
- It leaves four seams for the background world rather than building it: one
  named squad-depth accessor, a context constructor taking an explicit squad, a
  non-selected club as an ordinary caller, and a match RNG keyed by
  `(worldSeed, fixtureId)`.
- Step 12 runs this phase's checkpointed `50 x 20`, with `50` stable shards,
  exactly `7` workers, and a repeated run proving deterministic checkpoint
  reuse. It observes no loans and no races, so it is engine evidence only, and
  hands control to Phase 81A.

## Completed User-Requested Phase

- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/`
- Status: Done. All fourteen ordered steps are complete and control has
  returned to Phase 79 Step 14.
- The phase delivered the accepted global `1..6` half-star scale, source-backed
  three-division value calibration, the accepted three-by-18-club fictional
  world, promotion/relegation, public-value/asking-price/fee separation, and
  coordinated wage/budget/AI recalibration through versioned JSON config.
- Its bounded `10 x 10` passed with zero owned structural or rating-cap
  failures. It did not run or claim Phase 79 Step 14's staged `750 x 50` and
  did not close the deferred Phase 78 Step 15. The later Phase 79D handoff
  supersedes only the release gate's season horizon, not this historical
  result.

## Previous Phase Still Open

- `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/`
- Status: In progress. Steps 01-14 are Done and Step 15 was never closed.
- Transfer-window dates are source-backed content owned by each playable
  competition. They are not user-configurable and no unused championship
  calendar is shipped speculatively.

## Claude Code task prompt

Read `docs/steps/README.md` and `docs/PROJECT_STATUS.md`, identify the single active step, implement only that step, run its checks, update `docs/PROJECT_STATUS.md`, and update the next step document with any lesson that changes future work. If all existing step groups are complete, create one next-step document before implementing new code.
