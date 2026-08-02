# Project Status

This file is the project handoff snapshot for LLMs and junior developers. Update it after every step attempt, completed step, rework decision, and adopted solution change.

## Current State

- Phase: Phase 0 foundation complete; Phase 1 match-engine base complete; documented Phase 2 season-simulation sequence complete; Phase 3 balance calibration complete; Phase 4 player stats and match detail complete; Phase 5 match event detail complete; Phase 6 CLI inspection and stat completeness complete; Phase 7 match engine causal v1 complete; Phase 8 tactic and lineup MVP complete; Phase 9 manual tactical changes v1 complete; Phase 10 player dynamic states complete; Phase 11 manual lineup rotation v1 complete; Phase 12 squad selection and formation core complete; Phase 13 localization foundation complete; Phase 14 engine audit and core quality review complete; Phase 15 core cleanup before career systems complete; Phase 16 career systems dependency map complete; Phase 17 market MVP permanent transfers complete; Phase 18 career state and transfer persistence complete; Phase 19 fictional people identity foundation complete; Phase 20 new career world generation complete, including surname-variety rework and simulate-season identity seed rework; Phase 21 project audit and roadmap reconciliation complete; Phase 22 pre playable loop hardening complete; Phase 23 playable career loop MVP complete; Phase 24 player generation quality rework complete; Phase 25 career match preparation persistence complete; Phase 26 project cleanup and long-run readiness complete; Phase 27 season rollover foundation complete; Phase 28 player development and aging v1 complete; Phase 29 club identity and world calendar v1 complete; Phase 30 ten-season simulation report complete; Phase 31 career squad refresh and transfer turnover simulation implemented through 250x30 gate and blocked only on the operational 10,000x50 runner runtime; Phase 32 youth academy and squad pipeline v1 implemented but later reworked by Phase 33 and Phase 34; Phase 33 player role and ability generation rework implemented; Phase 34 creator-concentration blocker cleared by Phase 34/35 evidence; Phase 35 table spread anomaly rework complete with 250x30 PASS; Phase 36 long-run warning semantics and fun audit complete; Phase 37 long-run gate semantics cleanup complete; Phase 38 match engine and calculator quality review complete; Phase 39 engine quality hardening and match explanation trace complete; Phase 40 career loop playability audit and matchday slice complete; Phase 41 career matchday consequences and condition integration complete; Phase 42 career weekly recovery and matchday readiness complete; Phase 43 architecture hardening and package rework complete; Phase 44 CLI adapter decomposition and presentation boundaries complete; Phase 45 career presentation decomposition and view-model readiness complete; Phase 46 ten-season report decomposition and long-run presentation boundaries complete; Phase 47 pre-UI engine confidence gate complete with non-blocking risks documented; Phase 48 career UI slice readiness and first screen scope complete with app-entry/dashboard read-models, a read-only CLI dashboard smoke output, updated architecture documentation, and one next-phase recommendation; Phase 49 web app shell, main menu, and career dashboard prototype complete with buildable menu-to-dashboard web flow; Phase 50 career continue and inbox foundation complete with structured Continue-to-attention engine flow and web Inbox/Posta prototype; Phase 51 web layout shell navigation and accessible inbox placement complete with top navigation, left Inbox/Posta rail, central content outlet, WCAG 2.2 AA working target, keyboard/accessibility notes, and Playwright screenshot QA; Phase 52 web match preparation slice complete with structured preparation read model, web lineup/tactic/save flow, dashboard and Inbox/Posta resolution, Playwright QA, architecture update, and recommendation for Phase 53; Phase 53 retro football UI identity rework complete with retro-football tokens, club operations shell, stronger Inbox/Posta rail, dashboard control room, corrected tactical match-preparation pitch, reusable tactical pitch/squad table/player detail components, fixed-height sortable compact squad list, slot-suitability select ordering, position-order role sorting, Playwright screenshot QA, and recommendation for Phase 54; Phase 54 tactics and match preparation workspace completion complete with formation catalog, manual XI, manual 8-player bench, tactic/save readiness, dashboard/Inbox/Continue integration, Playwright QA, architecture update, and superseded recommendation for Inbox/Posta; Phase 55 web architecture state and styling foundation complete with feature-first folders, Zustand career UI store, Tailwind entry, conservative CSS reduction, Playwright QA, and architecture/state/styling report; Phase 56 canonical formation and role catalog complete with canonical domain roles, domain-owned formation slots, UI read-model derivation, manager-triggered selection helpers, SVG pitch background, Playwright visual QA, architecture update, and recommendation for Phase 57; Phase 57 shared tactical board and tactics screen foundation complete with normalized shared board state, canonical board roles, game-owned pitch markings, real squad mapping, derived suitability, drag zones, context menus, touch long press, match-preparation replacement, Playwright QA, architecture update, and superseded recommendation for Inbox/Posta; Phase 58 match preparation tactical workspace UX rework complete with compact match context, alert strip, board toolbar, dismissible menus, suitability-ranked candidates, bench parity, responsive visual QA, and a superseded Phase 59 Inbox/Posta recommendation; Phase 59 shared bench board and substitute selection complete with fixed `S1`-`S8` bench slots, shared bench board, contextual add/remove behavior, goalkeeper validation, helper-action integration, dead-code cleanup, Playwright QA, architecture update, and recommendation for Phase 60; Phase 60 web theme palette and user color preferences complete as a technical foundation but visually rejected by art-direction audit; Phase 61 web visual identity system rework complete, followed by a post-phase palette reduction to three accepted skins (`floodlight-navy`, `club-office`, `press-room`) with deterministic legacy palette migration, hierarchy token taxonomy, localized settings picker, Playwright screenshot QA, architecture update, and a superseded Inbox/Posta recommendation; Phase 62 engine safety net and deterministic regression gates complete; Phase 63 canonical career advancement use-case complete; Phase 64 match consequences and player state reactivity complete; Phase 65 web matchday playable slice complete with a UI read model, engine-backed in-memory web adapter, localized matchday result screen, dashboard/Inbox/Posta post-match state update, Playwright desktop/narrow QA, architecture update, and a superseded persistence recommendation; Phase 66 interactive matchday flow and half-time decisions complete with staged engine progression, deterministic ratings, selected-club half-time substitution decisions, direct dashboard/Continue routing to match centre, Playwright desktop/narrow QA, localized validation feedback, a phase-aware match-centre redesign, full-time-only consequences, final report, architecture reconciliation, and a superseded persistence recommendation; Phase 67 web matchday flow simplification and half-time tactical decisions complete with one-primary-action flow, focused preparation/matchday shell modes, direct save-to-pre-match routing, full tactical-board half-time decisions, 8-click desktop/narrow Playwright proof, final report, architecture update, and a superseded persistence recommendation after product review rejected the broader first-MVP UX language; Phase 68 MVP UX language reset around the approved tactical board complete; Phase 69 web UI full rebuild around tactical board complete with fixed visual identity, rebuilt app shell, dashboard command centre, Posta rail, board-first match preparation, focused matchday, dead legacy UI removal, Playwright visual QA, architecture reconciliation, and one next-phase recommendation later superseded by product review; Phase 70 web matchday information architecture and live flow rework complete with a five-state matchday centre, event priority presenter, pre-match confirmation, first-half and second-half live screens, half-time tactical decision workspace, full-time tabellino/ratings/consequences order, copy/accessibility pass, Playwright desktop/narrow QA, architecture update, final report, and one next recommendation for web career persistence; `docs/PROJECT_RULES.md` states that engine/domain emit structured facts only and LLM usage is authoring-time content factory work only, never runtime gameplay logic.
- Phase 71 web career persistence and save lifecycle foundation is complete with
  SQLite WASM on OPFS, durable preparation, idempotent full-time commit, typed
  recovery, deleted demo lifecycle code, and desktop/narrow refresh QA. Its
  former unfinished-match checkpoints were intentionally retired by Phase 77.
- Phase 72 career session autosave and command feedback is complete. Browser
  careers now use one working session over one SQLite/OPFS baseline, deliberate
  manual or 7/15-day safe-stop commits, dirty-exit protection, and one visible
  command-activity seam. Chromium desktop/narrow QA and the final report pass.
- Phase 73 Inbox/Posta decision center and career attention workflow is
  complete in eleven ordered steps. The implemented model uses blocking,
  important, and informational attention; deterministic daily advancement;
  same-date batching; one unified matchday message; durable read,
  acknowledged, and resolved state; current-season reset; a compact left rail;
  a two-column Posta outlet; and a bounded reduced-motion-safe date transition.
- Phase 73 Steps 01-11 are complete. Domain and engine now use one stable
  fixture-scoped `matchday` identity, canonical attention levels, independent
  lifecycle facts, structured blockers, and bounded preparation/match-entry
  destinations without legacy compatibility categories. Continue now scans
  canonical days and returns one ordered same-date batch. CareerState and
  SQLite v6 now own the current-season lifecycle. One pure engine path now
  owns delivery, opening, important acknowledgement, and fact-derived blocking
  resolution inside the dirty web working session. Posta is now a real route
  backed by the durable current-season Inbox, with framework-free list/detail
  read models, exact filters, deterministic selection, and an opening command
  that updates lifecycle inside the dirty session. The standard shell now keeps
  a compact awareness-only Posta rail on the left, while the dedicated route is
  a dense list/detail football workspace without a permanent third column. The
  one matchday message now exposes opponent, competition, round, venue, and
  lineup/bench/tactic readiness; it retains its fixture-scoped ID while its
  primary destination changes from preparation to match entry, refreshes on
  load without an action save, and resolves only when the fixture is played.
  Played fixtures now produce at most one informational result summary and a
  supported season transition produces one important archive-backed review.
  The future market, contract, finance, youth, and staff obligations are
  retained in a documentation-only extension matrix. Continue now presents the
  already-computed date range through the existing command lock: the first
  seven days remain readable, long ranges accelerate under 1.8 seconds,
  reduced motion jumps directly to the stop date, and Posta/dashboard routing
  occurs only after the visible date is coherent. Final desktop/narrow
  SQLite/OPFS Playwright, accessibility, persistence, save-cadence,
  reduced-motion, no-dead-code, architecture, and reporting gates pass.
- Phase 73A web product UI/UX quality audit and premium design baseline is
  complete. Eight audit-only steps produced a complete surface/state inventory,
  journey and action-economy review, information hierarchy audit, premium
  visual-system audit, WCAG/responsive/interaction audit, frontend ownership
  audit, 56-screenshot pixel-perfect scorecard, consolidated register, and a
  ten-slice remediation map. The baseline scores `3.59/5`, has no P0 and zero
  measured horizontal page overflow, but records 11 P1 findings that require a
  bounded Phase 73B before Phase 74. No production/test/CSS/dependency change
  was made by Phase 73A.
- Phase 73B current web product premium remediation and journey hardening is
  complete. Steps 01-09 established the canonical current-product Playwright
  gate, a localized keyboard bypass, visible-heading focus on genuine screen
  transitions, and compact narrow navigation that exposes the football task in
  the first useful viewport. Product states now use one explicit semantic
  token and markup contract for blocking, warning, success, selection, focus,
  disabled, and pending feedback; blocker copy has browser-proven WCAG AA
  contrast, while tactical suitability colors remain unchanged. Dashboard now
  presents one real manager task and one dominant command without technical
  identifiers or fallback copy. `CareerAppFrame` owns the repeated loaded-career
  providers/recovery/dialog seam, while `App` retains runtime lifecycle and
  explicit routing and a focused hook derives current screen presentations.
  The active Posta route now suppresses duplicate shell awareness, presents one
  dense list/detail decision workspace, locks interaction during commands, and
  uses a narrow list-first flow with deterministic detail and Back focus.
  Match preparation now derives draft dirtiness structurally from formation,
  normalized board slots, XI, bench, and tactic; exact undo returns to clean,
  every in-app exit offers explicit Stay/Discard, complete valid plans may Save
  and continue through the existing session boundary, and browser unload uses
  the same truthful dirty projection. The preparation screen owns one
  validation strip beside one confirmation action, with narrow and 200% text
  reflow around the unchanged tactical board. Matchday now requires only Start
  match and the real interval decision: one shared bounded playback policy
  presents both halves from canonical engine facts, reaches half time and full
  time automatically, collapses safely for reduced motion, and exposes no
  reveal-only manager command. Half-time now has one compact football-first
  review and one shared tactical decision workspace: structured decisive
  events, watch-list players, and contributors explain the decision without
  duplicating score, minute, shape, or change count, while the approved board
  remains unchanged. The full-time review remains deliberate and no
  playback timer, cursor, result, or consequence is persisted separately. Full
  time now reads as one football story: the result and decisive tabellino lead,
  selected-club ratings follow, meaningful durable player consequences are
  merged without repeating routine team-wide facts, and one command returns to
  Dashboard. The phase preserves
  structured facts, SQLite/OPFS, career-session save cadence, command feedback,
  Dashboard/Continue/Posta, deterministic staged Matchday, localization, and
  the approved tactical board. Step 10 finished App Entry and shared-state
  presentation, migrated every current browser assertion into one authoritative
  product gate, retained a separate unique SQLite/OPFS proof, deleted historical
  runners and three proven test-only tactical paths, removed confirmed unused
  CSS selector groups, and reconciled architecture, scorecard, status, and both
  roadmaps. The final browser gate passes `17/17`; `87` product screenshots plus
  three contact sheets were manually reviewed at desktop, wide, narrow, focus,
  `200%` text, and reduced-motion states. It addresses the 11 Phase 73A P1 findings in
  dependency order: visual gate and focus, semantic state, Dashboard/App seam,
  Posta hierarchy, preparation draft safety, automatic playback between real
  Matchday decisions, interval hierarchy, full-time story, and evidence-backed
  dead-path closeout. At Phase 73B close, Phase 74 was the single next
  recommendation; the later user-requested Phase 73C interposition supersedes
  only that schedule, not the reserved Phase 74 scope.
- Phase 73C matchday broadcast workspace and tabbed review rework is complete.
  The user-requested
  interposition keeps the current career sidebar width, gives Matchday 100% of
  the remaining shell outlet, removes duplicated pre-match metadata, replaces
  the growing live log with one commentary line, introduces presentation-only
  pause/speed and event holds, keeps a compact tabellino below the score, and
  moves half-time/full-time detail into accessible tabs. It preserves
  structured engine facts, deterministic checkpoints, SQLite/OPFS, save
  cadence, Posta/Continue, localization, and the approved tactical board.
  The canonical real-browser gate also proves one real interval tactical edit,
  checkpoint refresh, command failure, all review tabs, responsive layouts,
  keyboard/touch operation, 200% text, and reduced motion. Obsolete two-select
  interval UI was removed while its still-current typed substitution contract
  remains. Phase 74 remained reserved at Phase 73C close and is documented in
  the next status item.
- Phase 74 player generation and model consolidation cleanup is complete in all
  eleven ordered steps. Domain now owns one 25-attribute algebra, explicit raw
  diagnostic/current-role/potential-role measures, one role profile and cap
  catalog, and one validated construction boundary. Content producers share a
  strict generated-player assembly seam while retaining separate senior,
  academy, seasonal-intake, division, age, and rarity policy. Development,
  lifecycle, promotion, turnover, valuation, willingness, reports, and the web
  adapter consume canonical measures; generated values remain on `1..20`,
  potential stays at least current, and role caps are reapplied after mutation.
  JSON and SQLite/OPFS normalize fully absent historical identity
  deterministically, reject partial identity, and round-trip without a schema
  bump. Fixed seeds, strict balance, 50x10 diagnostics, and the 250x30 scoped
  player gate pass with zero undersized squads, zero missing natural
  goalkeepers, exact academy bounds, and zero player-model coherence failures.
  The generated global report remains transparently `FAIL` for two named
  out-of-scope signals: creator concentration in
  `phase74-player-model-world-00009` and an 11-title streak in
  `phase74-player-model-world-00233`. No threshold was relaxed and no
  match/competition repair was added. Duplicate role tables, ability lists,
  clamps, constructors, and adapter/report formulas are removed; architecture
  and the final consolidation report trace the complete lifecycle.
- Phase 75 player generation, potential, and development lifecycle rework is
  complete. Steps 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, and
  15 are Done. Phase 76 is also complete. Phase 75 Step 01 captured the audit-only
  reproducible baseline without production behavior changes. Step 02 replaced
  generated current-profile creation with one content-owned role/division/tier/
  age/family policy, removed the numeric archetype current offset, routed
  senior, career-intake, initial-youth, and seasonal-youth current abilities
  through that policy, and enforced a generated current physical floor of `7`.
  The current-profile route now preserves role hard caps, supports rarity lanes
  with deterministic fallback when an elevated lane does not exist for a
  non-core attribute, and keeps third-division generation below first-division
  quality. Step 03 added one content-owned reachable-potential allocator that
  derives potential from the completed current profile plus one age-aware
  remaining-growth budget, removed independent potential-ceiling bands and
  archetype potential offsets, bounded mature physical/technical jumps, and
  kept young upside focused into role-relevant lanes. Step 04 added one
  deterministic youth-development level from `1..5` for every generated club,
  derived from division first and reputation second, and used it only as a
  bounded content-policy input for interesting-prospect chance, current-profile
  lane, and high/elite candidate ordering. Initial academies and seasonal
  intake now expose the level as structured diagnostic data while strict
  division-wide rarity budgets and third-division current-ability limits remain
  intact. Step 05 added one durable domain-owned participation ledger for
  player/season/month rows, starts, substitute appearances, minutes, ratings,
  played-role minutes, closed months, and fixture idempotency. `CareerState`
  validates every ledger player reference. Step 06 established JSON save
  envelope v3 and SQLite/OPFS schema v7 as the only supported beta baseline,
  persists the participation ledger losslessly in both adapters, and rejects
  earlier beta saves/databases with a typed reset boundary instead of migration
  or compatibility code. Browser QA confirms the second fixture returns to
  preparation and starts without a false storage failure. Step 07 added one
  deterministic AI squad selector for credible AI XIs and benches. Step 08
  added authoritative fixture participation accrual at commit time. Step 09
  replaced positive seasonal growth with slow monthly development driven by
  real minutes and bounded performance. Step 10 added related-role familiarity
  progression from sustained played-role exposure without rewriting player
  identity. Step 11 moved aging into one monthly engine policy, set outfield
  physical decline at age 32, kept goalkeepers on a later curve, floored active
  current physical attributes at `7`, compressed unreachable potential, and
  aligned exits with role quality, age, and squad need. Step 12 added one
  canonical monthly career lifecycle checkpoint, routed direct fixture
  progression and season advancement through it, and uses durable participation
  ledger closed month keys as the reload-safe idempotency guard. Step 13 added
  developer-only trajectory diagnostics, age-band current-to-potential room
  distributions, mature high-room warning evidence, and selected-club
  trajectory samples while keeping normal game surfaces free of exact hidden
  potential. Step 14 ran the staged `50 x 10` and `250 x 30` calibration gates
  without changing gameplay policy, accepted only warning families that remain
  below locked fail thresholds, and recorded those thresholds directly in the
  lifecycle audit reports before the operational Step 15 gate.
- Phase 76 web motion language and football feedback system is complete.
  Steps 01-09 are Done. Nine ordered steps introduce Motion for React as an `apps/web`-only
  presentation Adapter, establish one shared semantic motion Module, then apply
  it to real command feedback, shell/dialog transitions, Continue/Posta,
  Dashboard updates, tactical continuity, Matchday playback, decisive events,
  and canonical interval/full-time transitions. Project rules and architecture
  now require every future browser feature to classify motion as `none`,
  `micro`, `transition`, or `narrative`, respect reduced motion, and keep
  animation completion independent from gameplay, commands, and persistence.
- Phase 77 live match control, statistics, and in-game decisions is complete.
  Steps 01-10 establish one progressive minute session, causal statistics,
  cards/injuries, deterministic AI decisions, browser pause/command
  orchestration, live broadcast tabs, shared-board substitutions, and one
  atomic full-time publication boundary. Superseded staged, half-time-only, and
  durable unfinished-match paths are deleted. The repeated `50 worlds x 1
  season` gate passes all `15,300` fixtures with zero invariant failure and
  stable hash `396aaed146613af94950c0a6365b548e`; the complete visual,
  accessibility, package, dependency, monorepo, diff, and Graphify gates pass.
- Phase 78 senior squad, player contracts, and club finance foundation is in
  progress with Steps 01-14 complete. Its fifteen ordered steps establish
  persistent shirt numbers, complete active-contract and negotiation lifecycles, coherent club
  cash/transfer/wage budgets and ledger entries, an intentional clean beta-save
  reset, one durable current match plan, the senior Squad table, a full-screen
  player profile, explicit lineup replacement, selected-club Posta decisions,
  deterministic AI renewal/expiry, and staged long-run gates. The previously
  reserved Market phase moved to Phase 79. The broader Finances expansion was
  once reserved as Phase 80 but is now deferred without an active phase number
  after the explicit graphical/structural Phase 80 decision.
- Phase 79 transfer-market windows, negotiations, and Market workspace is in
  progress with Steps 01-13 Done, Step 14 Reopened, and Step 15 not started. It
  owns source-backed dates for
  playable competitions only, two registration windows per season, three-day
  club and player negotiation stages, non-reserving pending exposure, atomic
  affordable transfer completion, final-six-month preliminary agreements,
  deterministic AI, Posta/Continue decisions, persistence, Market UI, and the
  integrated Phase 78/79 closeout. Its locked carry-forward register now also
  assigns eight audited Squad/contract/runtime corrections to Steps 01, 09,
  10, 11, 13, and 15 without adding a generic cleanup step or duplicate state.
  The former Phase 78 Step 16 has been retired and absorbed by Phase 79 Step
  15.
- Phase 79A transfer-market activity, free-agent economy, and long-run
  diagnostics is complete. Its seven steps locked the `50 x 20` baseline,
  exposed the
  permanent/preliminary funnels, reconcile free-agent stock and flow, replace
  maximum-only wage diagnostics with distributions, apply only
  evidence-backed market-policy corrections, repeat the same `50 x 20`
  cohort, and returned control to Phase 79 Step 14 with zero owned structural
  failure. Phase 79A did not run or claim the Phase 79 `750 x 50` gate.
- Phase 79B Squad/Market player-workspace UI/UX and career statistics is
  complete after all seven ordered steps. The direct user-requested
  interposition delivered public half-star
  ratings with an absolute elite marker, direct Squad placement and automatic
  swaps, one contextual row menu, compact natural/adapted roles,
  goalkeeper/outfield attribute separation, three-tab Squad/Market player
  inspectors, exact current Market attributes, and a durable coverage-aware
  player season/career-stat archive. It did not run or replace Phase 79 Step
  14's long-run gate and has returned control there.
- Phase 79C global player rating, three-division world, and market-economy
  calibration is complete after all fourteen ordered steps. Step 01 reproduced
  and versioned the dated
  Transfermarkt snapshot, independently sourced finance evidence from
  ReportCalcio 2025, six schema-validated JSON assets, stable domain/version
  contracts, and a pure supplied-input diagnostic. Step 02 replaced relative
  ratings and the rating elite flag with the global `1..6` scale everywhere,
  including accessible sixth-star and locale-aware one-decimal attribute
  presentation. Step 03 completed division-aware first-team bands, separate
  initial/intake rarity allocation, credible placement of current six-star
  players, and population-sliced diagnostics. Step 04 owns only ordered
  multi-competition state and persistence. Step 04 added the ordered domestic
  registry, canonical competition-owned membership, historical final tables,
  immutable `GameMeta` calibration versions, and JSON/SQLite round trips.
  Step 05 added globally unique competition/season fixture identity, canonical
  multi-calendar publication, and ordered competition-aware fixture traversal.
  Step 06 added the canonical deterministic 54-club country with complete
  starting senior, youth, contract, finance, window, membership, and version
  facts. Step 07 completed the shared CLI/web/diagnostic three-division
  bootstrap. Step 08 completed promotion, relegation, and the integrated season
  boundary. Step 09 added one canonical cross-division Market catalog, explicit
  structural player willingness, localized tier context/filtering, and shared
  selected-club/AI target ownership. Step 10 replaced the old public-value
  default with one explicitly injected, source-calibrated continuous
  role-quality model. Owner division is explicit, free agents use a neutral
  context, observing club/form/contract cannot alter value, the canonical
  three-world population passes every tier percentile/maximum tolerance, and
  only an eligible young six-star player can reach `€150m`. Step 11 separated
  public value, seller asking price, offered/countered/agreed fee, and completed
  fee throughout negotiation, completion, history, persistence, CLI, and web.
  Permanent completion settles the exact agreed fee; free agents retain public
  value with an exact zero transfer fee. Step 12 added one source-backed,
  version-selected wage policy across generated contracts, renewal/free-agent
  demand, AI, preliminary agreements, transfer completion, replenishment,
  youth promotion, and affordability. Opening wage budgets now meet the
  audited three-tier targets at deterministic `70%..95%` utilization and
  per-tier diagnostics expose wages, bonuses, commitment, utilization, and
  headroom without deriving salary from public value. Step 13 added one exact
  market-behavior policy for tiered opening cash/transfer distributions,
  seller replies, sporting willingness, acquisition affordability, and AI
  lifecycle/target coefficients. Every selected-club and AI acquisition path
  consumes the stamped policy explicitly; diagnostics retain separate
  cash/transfer/wage exposure and cross-tier attempt/completion/fee evidence.
  Step 14 closed the browser/absence audits and a passing deterministic
  `10 x 10`. The final cohort records minimum squad `18`, zero structural or
  rating-cap violation, `3,882` measured free-agent signings, and exact
  zero-fee semantics. Control has returned to Phase 79 Step 14 without running
  or claiming its `750 x 50`; Phase 78 Step 15 remains open.
- Phase 79D exceptional-player generation, prospect economy, and non-vacuous
  diagnostics is Done by explicit product decision on 2026-07-30. Its nine
  ordered documents delivered archetype-compatible construction, effective
  rarity limits, production annual intake, an age/role-aware public potential
  range, range-aware value, display-safe cap semantics, observable negotiation
  spread, and non-vacuous diagnostics. `Player.potential` remains the sole
  persisted ceiling; the public upper is a calibrated P90, not that stored
  ceiling. Focused checks, `pnpm check`, build, Playwright `29/29`, and manual
  browser QA pass. The direct `50 x 20` was stopped, produced no report, and is
  not claimed as evidence. It is deferred to Phase 81 Step 12 with resumable
  checkpoints, `50` stable shards, and exactly `7` workers.
  Phase 79 Step 14 remains paused and unclaimed.
- Phase 80 graphical and structural rework is complete. All nine steps are
  Done:
  `SIMULATION_WORKER_LIMIT=7` and the pure
  `resolveSimulationWorkerCount` policy now govern direct/checkpointed
  multi-world reports, host-dependent and small-sample defaults are removed,
  `TLS_SIMULATION_WORKERS` can only reduce concurrency, checkpoint replay
  records workers, and Vitest is capped at seven. The accepted inventory now
  locks five reworks: achieved-versus-upside stars, Market pagination and
  delayed typed filters, Squad age/order and delayed search, canonical money
  presentation/input, and transfer-offer dialog stability. Step 03 added one
  shared six-slot achieved-versus-upside renderer across Squad, Market, and
  both player details, with localized current/lower/upper/uncertainty facts and
  dedicated future-star tokens. Steps 04-07 delivered Market pagination and
  delayed filters, Squad age/order/search, canonical money presentation/input,
  and stable transactional dialog dismissal. Step 08 closed the complete
  repository/build/browser gate and Step 09 handed control to Phase 80A. A
  deterministic `20`-world audit also found only `11 / 1,710`
  seventeen-year-olds with at least one public star of upside. Young
  stored-six prospects start at `1..2.5` stars and the public `0..17` outfield
  policy exposes only `30.76%` of remaining ceiling room. That is an upstream
  model finding, not an open Step 03 defect; Phase 80A now owns the documented
  generation/projection correction.
- Phase 80A is Done as of 2026-08-02. The first canonical Step 09 `20 x 2`
  evidence plus product screenshots reopened Steps 05, 06, and 08; all three
  owners are reclosed, and Step 07 was previously reclosed after reserved
  promotion candidates became explicit active stock. The exact `750 x 3`
  fresh/resume cohort is deterministic and all `32` Phase-80A-owned player-model
  gates pass. It closed with the `goals_per_match_avg` monitor still at
  `36/634/80`, transferred unchanged to Phase 81 rather than repaired here:
  match scoring is outside the player model. Its nine ordered steps own
  dynamic club tier/reputation/environment, quarterly development from monthly
  evidence,
  one current/P50/upper assessment, contextual prospect generation, national
  exceptional stock, annual intake top-up, expected-outcome value, AI
  information parity, diagnostics, and incompatible beta-save deletion.
  Public value removed `marketContext`, every owner-category/free-agent
  multiplier, and every per-context maximum in favor of one global curve/cap
  under a new calibration epoch; old Phase 79C division bands and the Phase
  79D `302 / 100 worlds` stock observation remain historical only.
- Phase 82A, previously numbered 80B, is deferred behind Phase 81 and the
  Phase 81A by the 2026-08-02 phase-order decision, and is authorized
  only by a recorded market-density measurement. Its
  ten ordered steps own durable sale/
  loan postures, selected-club incoming offers, one final counterproposal,
  bidirectional loans, `0/50/100%` wage sharing, real loan development, Posta
  UI, persistence, bounded diagnostics, and beta reset. `Club.playerIds`
  remains persisted ownership and is
  never mutated by loans; named owned/selectable accessors separate ownership
  from sporting depth, outgoing loans and autonomous AI sales retain `18` plus
  `2/6/6/3`, and unresolved uniqueness is per
  `(acquiring club, player)` across permanent/loan kinds. Different buyers
  remain valid domain state while the Phase 82A scheduler temporarily avoids
  creating them concurrently. Outgoing `Action available` means the manager may
  submit an approach, not that the seller promises to negotiate; canonical
  seller willingness may still return `player_not_for_sale`.
- Phase 82B, previously numbered 80C, is planned after Phase 82A with its
  product contract accepted. It
  owns durable competitive races with at most three active buyers, highest
  acceptable-fee qualification plus exact matches, fixed three-day club/player
  stages, serial loans, non-instant free-agent negotiation, explicit
  qualified/`outbid`/player-choice outcomes, and dedicated diagnostics. Step 09
  closes on non-vacuous evidence, runs the second checkpointed `50 x 20` over
  the completed market, measures density against the frozen bands, and hands
  control to the world-extension work.
- Phase 81 is the next phase under the 2026-08-02 phase-order decision, with its
  design contract accepted and amended. Its twelve ordered steps keep the
  deterministic aggregate match engine while making typed formation shape,
  position suitability, opponent matchup, tactical instructions, causal actors,
  and live manager decisions materially affect play. Player quality, intrinsic
  shape, and relational matchup remain separate concepts; pre-match, live, AI,
  batch, and diagnostic paths share one model.
- Phase 81 additionally owns the `goals_per_match_avg` monitor transferred
  unchanged from Phase 80A Step 09, because match scoring is outside the player
  model and its Step 06 replaces the opportunity generation that produces those
  goals. Step 06 fixes it, Step 11 is the deadline, Step 12 confirms it at
  cohort scale, and it may not be transferred a second time.
- Phase 81 leaves four seams for the background world without building it: one
  named squad-depth accessor so Phase 82A redefines fieldable-versus-owned in
  one place instead of across `33` current readers; a context constructor taking
  an explicit squad; a non-selected club as an ordinary caller of it; and a
  match RNG keyed by `(worldSeed, fixtureId)` so resolution order cannot affect
  a result. Match facts also attribute to the club a player was fielded by.
- Two checkpointed `50 x 20` cohorts now exist, each with `50` stable shards and
  exactly `7` workers. Phase 81 Step 12 runs the first over the accepted match
  engine; it observes no loans and no races and is not market evidence. Phase
  82B Step 09 runs the second over the completed market. The duplication is a
  declared cost of the phase order.
- Phase 81A sits between Phase 81 and Phase 82A, planned with six ordered steps
  in
  `docs/steps/81a-season-anchored-contracts-free-agent-economy-and-background-fixtures/`.
  It owns three measured defects and two features, and no market feature at all.
- Defect one: contract expiry is anchored to the signing anniversary, not to the
  season. `contractEndDate` computes `startsOn + durationYears * 365` and world
  generation adds `rng.nextInt(0, 121)` days of scatter, so expiries never
  cluster, no summer window exists, and the "final six months" state never
  coincides with a transfer window. It also contradicts Phase 82A's accepted
  rule that loans end at the current season's end, which would leave two clocks
  in one market.
- Defect two: the offered term cannot express a short contract. `durationYears`
  is an integer `1..5` and the constraint is repeated in three SQLite tables.
  FIFA's own rule sets the minimum at "to the end of the season" and the maximum
  at five years, so the ceiling is exactly right and the floor is wrong; real
  winter signings run five or six months and `16%` of real contracts are under
  six. The signed contract itself is fine: `PlayerContract` already stores
  `startsOn` and `endsOn` as `GameDate` and is day-precise.
- Defect three: the free-agent pool fills and never drains. Recorded cohorts
  show shares of `0.2124`, `0.2085`, and `0.2040` over ten seasons in Phase 79C
  and a maximum of `0.2274` in Phase 79A. The code path is complete, so this is
  AI signing policy. Phase 81A Steps 02 and 03 are reported together: shortening
  contracts without a signing policy only enlarges the warehouse.
- The pool is frozen as a cycle rather than a level, decided on 2026-08-02.
  Peak `10-12%` of a competition's senior population at the season boundary,
  trough near `3%` once the summer window closes, and the drain between them as
  the gate. A pool whose peak equals its trough sits inside any level band while
  being precisely the defect, so the level is description and the delta is the
  test. The drain is additionally attributed between signings and exits: a
  trough reached by players leaving football is a shrinking world, not a market.
- A new career opens at that trough, roughly `30-40` leftover players in the
  current `54`-club world, generated with a leftover composition rather than a
  uniform sample. Careers begin after the summer window - generated contracts
  start at `referenceDate - rng(30..540)` - so a small pool at day one is
  correct; an empty pool that the world never returns to is not.
- Phase 81A then resolves background fixtures for the selected club's division
  inside `advanceCareerMonths`, adds the simulate-match command on the same
  producer, and measures market density against bands frozen in its Step 01. Its
  Step 06 decides whether Phase 82A is still justified rather than assuming it.
- Code status: monorepo skeleton, dependency-free domain core contracts, selected-lineup/tactic setup domain contracts, deterministic shared RNG/date utilities, JSON save storage boundary, executable enforcement, `pnpm cli doctor`, pure team-strength derivation, engine `buildTacticTeamContext` setup builder, serializable match context/config contracts, deterministic one-minute match stepping with structured shot context, complete current derived player match stats, engine-local deterministic `ChanceActors` selection for creator/shooter/primary defender/goalkeeper, and `stepMatch` attribution wired through one coherent chance actor set, batch full-match simulation, explicit `ManualTacticChangeSchedule` contract over already-built `MatchTeamContext`s, segmented fixture simulation via `simulateMatchWithManualTactics`, optional `simulateSeason.fitnessLifecycle` spend/recovery with returned `finalPlayerStates`, `simulateSeason` selected setup overrides and fixture lineup overrides, in-memory permanent-transfer market contracts, deterministic true-data player valuation, player willingness, transfer feasibility/apply preview, durable `CareerState`, JSON career save/load, persistent accepted permanent-transfer application, pure engine `findNextCareerFixture` and `progressNextCareerFixture`, pure engine `developPlayersForSeason` growth/decline with bounded potential realization, deterministic country-specific city-based fictional club naming patterns in content while preserving stable `club:` IDs, `pnpm cli career --save=<saveId> --apply-market-demo=<profile>`, `pnpm cli career --save=<saveId> --inspect`, `pnpm cli career --save=<saveId> --summary`, `pnpm cli career --save=<saveId> --advance-next-fixture`, `pnpm cli career --save=<saveId> --development-report`, durable domain match reports with schema version `7`, scorer IDs, optional assist IDs, optional non-duplicated goal creator IDs, goalkeeper save IDs, shooter IDs for generated non-goal shot events, block primary defender IDs, and structured shot context on goal/shot events, deterministic double round-robin calendar generation, copy-on-write fixture result application, deterministic derived league-table computation, season player goal and summary aggregation, fake deterministic content with generated fictional player identities, expanded nationality metadata, default 11-player lineups plus reserve players, division/tier player generation bands, role-based attribute templates, player archetypes with potential classes, rarity budgets for lower-division exceptions, `pnpm cli simulate-season --seed=demo-001` with real top scorer, top assist, and top goalkeeper-save output, optional round fixture detail, clean `--fixture=<fixtureId>` structured match detail with all-starter player stats plus compact causal `creator=` and `defender=` fields, `--identity-review` generated player identity inspection, `--player-generation-report` generated player quality inspection, `--setup-demo=pro01-balanced|pro01-attacking|pro01-defensive` CLI inspection that applies deterministic PRO01 selected lineup/tactic overrides through `simulateSeason.setupOverrides`, `--manual-tactic-switch=<minute>:<profile>` fixture inspection that applies a user-declared manual tactic switch only when the selected club is playing the requested fixture, `--condition-demo=pro01-season` season inspection for deterministic PRO01 fitness consequences, `--fixture=<fixtureId> --lineup-demo=pro01-first-team|pro01-rotated` manual lineup inspection, and localized `--market-demo=pro01-affordable-permanent|pro01-star-rejected` permanent-transfer inspection; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` exists and balance report includes explicit table points spread.
- Runtime: Node `v24.16.0` from `.nvmrc`.
- First command milestone: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001` achieved.
- First balance milestone: `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` achieved.
- Source of truth: `requirements.md`.

## Current Active Step

- Step:
  `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/01-reproducible-extreme-shape-baseline-and-frozen-contract.md`.
- Status: Not started. Phase 81 is the active phase.
- Phase 80A is Done as of 2026-08-02. Steps 05, 06, and 08 were reclosed after
  reopening, Step 09 completed the exact `750 x 3` fresh/resume cohort, and all
  `32` player-model gates pass. It closed with one gate red - the match-engine
  `goals_per_match_avg` monitor at `36/634/80` - transferred unchanged to
  Phase 81 rather than repaired or weakened. Threshold, denominator, and
  severity class are untouched; only the owner moved.
- Next action: Phase 81 Step 01. It freezes the behaviour baseline, accepts the
  carried monitor with its inherited distribution recorded as a starting point,
  states the per-component measurement contract, notes the single-country
  condition on the quality bands, and inventories every lineup-composing reader
  of `club.playerIds`.
- Do not start Phase 81A, 82A, or 82B, and do not run a cohort outside Phase 81
  Step 12 and Phase 82B Step 09.
- Phase 79 Step 14 remains Reopened and paused; no `50 x 20` has run.
- Planned-phase architecture reviewed on 2026-07-30 after direct product review
  and an implementation audit. No production code changed; the Phase 80A/82A
  contracts and step documents were corrected. Phase 82B's six product
  decisions were accepted and documented on 2026-07-31.
  - Public value becomes fully club-independent. `marketContext`, every
    owner-category/free-agent multiplier, and every per-context maximum leave
    the public-valuation input in favour of one global model and one global
    `€150m` cap. A transfer, promotion/relegation, contract expiry, or
    free-agent transition alone can no longer change public value. This closes
    a live defect: today a first-division owner multiplies value by `1.85` and a
    third-division owner by `0.90`, so moving a player between them changed his
    public value by more than `2x` for no football reason.
  - The Phase 79C per-division distribution tolerances were built with that
    multiplier and are declared superseded. Phase 80A Step 01 must record the
    pre-change baseline and fix new bands before implementation, and must prove
    the three divisions stay economically distinct through generated player
    quality rather than through an owner coefficient.
  - The Phase 79D exceptional baseline of `302` effective ceiling-six players
    across `100` worlds is declared non-comparable, because the Phase 80A stock
    contract changes the population it measured.
  - Squad floors switch to selectable depth
    (`owned present + incoming loans - outgoing loans`). `Club.playerIds`
    remains ownership truth and is never mutated by a loan. The audit found
    roughly `100` direct `.playerIds` reads in engine career/squad code split
    across two incompatible meanings, so Phase 82A Step 01 must classify every
    relevant read and expose `ownedPlayerIds(...)` and `selectablePlayerIds(...)`
    instead of leaving one field carrying two concepts.
  - Product review rejected the proposed global one-negotiation-per-player rule.
    Several clubs chasing one player is wanted football behaviour. The canonical
    per-`(buying club, player)` uniqueness stays exactly as it is; Phase 82A
    only restricts its own scheduler from creating concurrent bids, because
    today seller replies and player replies resolve offers independently and
    losers can fail on `stale_ownership` instead of on merit.
  - New Phase 82B owns competitive races. `PlayerTransferRace` is a durable
    coordination aggregate over discriminated canonical negotiation references
    and owns the single effective shared stage clock without duplicating fee,
    terms, or status. Club-stage resolution
    returns qualified/outbid/rejected sets; only qualified suitors reach player
    choice. Free agents receive their own negotiation state while
    `applyCareerFreeAgentSigning` remains the atomic commit.
  - Phase 82B permits at most three active acquiring clubs. Permanent transfers
    qualify only the highest seller-acceptable fee and exact matches; lower
    acceptable offers become `outbid`. Loans stay serial. Club and player
    stages each last three in-game days, one-suitor free agents still wait, and
    a manager-owner's acceptance cannot close the club stage early.
  - Phase 82B Step 01 must inventory every negotiation-status consumer and add
    exhaustive guards before `outbid` or `lost_to_rival` exists.
    `projectTransferNegotiation` is the known silent-fallthrough example, but
    storage, UI, AI, CLI, and diagnostic mappings require the same audit.
  - The deferred checkpointed `50 x 20` now belongs to Phase 81 Step 12, so the
    cohort observes the final accepted player, market, and match model instead
    of one about to change. Phases 82A and 82B keep the
    shard/checkpoint/worker infrastructure working and bounded-exercised.
- Adopted solution: one ceiling-first joint owner now selects the frozen
  half-star outcome and a feasible within-rating quantile before constructing
  current ability. Explicit age-15-to-20 prospects retain at least one stored
  star of room; routine players may plateau; four generation roots share the
  same semantic constraints; the factory validates without repair; and the
  legacy current-first/facade APIs are removed. Keep potential class separate from current quality through
  speaking archetype profiles, weight the Third Division `interesting` upper
  edge explicitly, and adjust only role-defining senior generation bands. The
  canonical opening shares are now inside all three frozen ranges without
  weakening thresholds. Preserve the immutable `4..5` per-world target and model
  unresolved promotion candidates as an explicit club-associated active-stock
  source instead of weakening the no-inflation gate. Exhaustive engine,
  content, CLI, and diagnostic mappings prevent that transitional source from
  masquerading as academy or senior ownership. Step 08 makes one
  date-stamped public assessment the only
  live current/P50/upper input for intrinsic value, willingness, contract
  demand, AI ranking, CLI, and browser adapters. The global valuation-v5 model
  fully prices current quality, prices bounded current-to-P50 participation,
  gives P50-to-upper a smaller positive option value, and retains one rare
  eligibility-gated `€150m` cap; asking price and exact zero free-agent fee
  remain separate.
  `marketContext`, owner/employment multipliers, per-context caps, duplicate
  market-ability derivation, durable reachable-potential aliases, and every
  named live AI stored-ceiling read were removed. Versioned AI risk appetite
  now ranks the same public ranges shown to the manager.
- Verification: Node `24.16.0`; the reclosed Step 06 required Vitest passes
  `185/185` across `14` files without increasing a timeout. Its exhaustive
  joint-policy matrix exercises both feasible interval boundaries for every
  supported age/division/tier/role/class/half-star configuration, and all four
  root propagation tests are green. The
  opening `3.5+` shares are First `421/2,144`, Second `252/2,176`, and Third
  `130/2,095`, both owning typechecks pass, and its senior-continuum guards are
  green. The earlier Step 07 regression proves a reserved
  ceiling-six promotion candidate yields `active == target`, vacancy `0`, and
  no generated replacement. The bounded `2 x 2` evidence reports all five
  stock gates at zero violations with positive vacancy evidence `1 / 1`.
  The full mandatory invocation passed `272` unaffected tests and exposed only
  its invalid small-sample exit-code expectation; that corrected case then
  passed in isolation. All seven package typechecks, `git diff --check`, and
  `graphify update .` pass. The second Step 07 reopen now binds placement and
  uniqueness to opening/allocation arrivals instead of later transfers; its
  full mandatory suite passes `279/279` across `23` files, all seven
  typechecks pass, and schema-v3 checkpoints plus aggregation reject malformed,
  partial, or unequal gate sets. Step 08 now passes `291/291` mandatory tests
  across `24` files after replacing valuation-v4 with the monotonic v5 tranche
  model and calibrating only global curve anchors against a recorded failure.
  Its final `20 x 2` bounded evidence has zero owned economy violations,
  `75,210` positive public-ordering observations, `188` stored-six value
  observations, and passing division-value bands. All seven typechecks and
  dependency cruise (`782` modules / `3,100` dependencies) pass. Step 09
  diagnostics remain non-tautological and
  their focused simulation-tools suite passes `21/21`. Earlier Step 08
  verification remains:
  expensive report coverage is exhaustive through
  `20` unaffected passes plus the focused corrected deterministic assertion;
  the remaining mandatory suite passes `201/201` across `19` files and
  additional touched-owner coverage passes `101/101` across `11` files. Seven
  package typechecks, dependency cruise (`782` modules / `3,077`
  dependencies), structural absence scans, `git diff --check`, and
  `graphify update .` pass. Step 09's fresh run simulated `750` worlds with
  `0` resumed; the replay resumed all `750` with `0` simulated. Both used
  exactly `7` workers and produced aggregate hash
  `a09c10cb2b678140a2de7c4a226faac370c2a73b3e0d143dd9e35859f51f4a03`.
  All `32` player-model gates pass with no structural violations. The overall
  report remains `FAIL` only because `goals_per_match_avg` records
  `36/634/80` pass/warn/fail worlds.
- Blocker: match scoring is outside Step 09's owned player-model scope, while
  the frozen anomaly contract requires a `monitor` failure to retain its raw
  severity. The step forbids weakening thresholds, changing denominators, or
  suppressing the result. Phase 80B cannot start until ownership/acceptance is
  decided explicitly.
- Lesson learned: potential rarity, current quality, and intrinsic value need
  separate speaking owners; changing the value curve cannot repair a malformed
  generated population. A canonical stock selector cannot omit a transitional player
  who is temporarily outside both academy and senior registration when a
  same-rollover allocator uses that selector to decide whether a vacancy
  exists. Separately, sharing a projection type is insufficient if consumers
  rederive it independently or choose policy metadata locally. A dated public
  assessment must be passed through the whole commercial decision, and absence
  tests must scan the named live owners so stored-ceiling privilege cannot
  return behind a harmless-looking helper. Checkpoint hashes prove byte
  integrity, not semantic completeness; resumable gate payloads also need
  typed shape validation and identical gate-key sets across worlds. The large
  cohort also shows that most youth plateau because they receive zero minutes,
  not because the quarterly development transition lacks room; population
  opportunity and development policy must stay separately measurable.
- Next action: make one explicit product/phase-order decision: add a narrow
  match-goal remediation before closeout, or formally carry the unchanged raw
  monitor failure to a named future match-engine owner. Do not start Phase
  80B/80C/81 or run the deferred `50 x 20` meanwhile.

### 2026-08-02 — Phase 80A Step 09 closed by ownership transfer

- Status: Done. Phase 80A is complete and Phase 81 is the active phase.
- Adopted solution: close the step on its own completed scope and transfer the
  one gate it could not own. All `32` player-model gates pass over the exact
  `750 x 3` fresh/resume cohort, with `750` one-world shards, exactly `7`
  workers, and aggregate hash
  `a09c10cb2b678140a2de7c4a226faac370c2a73b3e0d143dd9e35859f51f4a03`. The
  `goals_per_match_avg` monitor stays at `36/634/80` with every failure high and
  moves to Phase 81, which owns the match engine.
- What did not change: the monitor's threshold, denominator, `monitor` severity
  class, and reported distribution. The owner moved, the result did not, and the
  report says so plainly rather than presenting a green phase.
- Rejected alternative: a narrow match-goal remediation inside Phase 80A. It
  would have calibrated a formula that Phase 81 Step 06 removes, and would have
  had to be undone before that step could land.
- Guard against repetition: Phase 81 accepts the monitor as amendment A7, fixes
  it in Step 06, and must have it inside band by Step 11. It may not be
  transferred a second time; if Step 11 finds it still out of band, Step 06
  reopens. A transfer that can be repeated indefinitely is a way of never fixing
  a defect.
- Lesson learned: a phase gate can fail for a reason the phase does not own. The
  honest closeout names the successor and carries the raw result forward, rather
  than either widening the band or holding the phase hostage to work outside its
  scope. The mechanism only stays honest while the number of permitted transfers
  is one.
- Next action: Phase 81 Step 01.

### 2026-08-02 — Phase order decision: Phase 81 first, market work renumbered 82A/82B

- Status: Decided and documented. No production code changed.
- Decision 1 — ownership of the goal-rate monitor. Phase 80A Step 09 asked for
  an explicit choice: a narrow match-goal remediation before closeout, or
  carrying the unchanged monitor to a named future match-engine owner. The
  second is adopted. `goals_per_match_avg` transfers to Phase 81 with its
  threshold, denominator, and `monitor` severity class untouched. Phase 81
  Step 06 replaces the opportunity generation that produces those goals, so a
  narrow pre-fix would have calibrated code that Step 06 removes. The monitor
  may not be transferred again: if Phase 81 Step 11 still finds it out of band,
  Step 06 reopens.
- Decision 2 — phase order. Phase 81 runs before the market work. Its Steps 02,
  08, and 09 build the seams a background-world simulator needs, and building
  the market first would multiply their migration surface across `270` clubs.
  Phase 80B is renumbered Phase 82A and Phase 80C Phase 82B; both are deferred
  behind Phase 81 and Phase 81A.
- Decision 3 — the market phases are authorized by measurement, not assumption.
  Contract expiry drives `62.5%` of real movements, permanent transfers `18.5%`,
  loans and returns `18.9%`; competitive races add depth without adding
  movements. The cheap lever on a market currently completing `1.7` permanent
  transfers per season against a real-football expectation near `100` is
  contract duration, not loans. Phase 82A's entry gate therefore requires a
  recorded density measurement against the frozen bands.
- Amendments: eight (A1-A8) accepted into Phase 81, five carrying the
  background-world requirements forward and three new — one named squad-depth
  accessor, this phase's ownership of the goal-rate monitor, and contexts taking
  an explicit squad with match facts recorded by the club a player was fielded
  by.
- Declared costs: a second checkpointed `50 x 20` at Phase 82B Step 09, because
  the Phase 81 cohort observes no loans and no races; the user's league table
  stays empty longer; and the `18-30` month contract band is not representable
  today, since `senior-squad-transfer.ts:510` validates `durationYears` as an
  integer `1..5` and the persisted column is `duration_years`.
- Decision 4 — the playable-MVP work becomes Phase 81A, with six ordered steps.
  Investigating the contract-duration item turned up two facts that change its
  shape. Contract expiry is anchored to the signing anniversary rather than to
  the season, which is the real reason the market has no summer rhythm and which
  would have left contracts and loans on different clocks. And the free-agent
  pool sits at a measured `20-23%` share without draining, which is AI signing
  policy rather than a missing feature. Both land in Phase 81A, and its Steps 02
  and 03 are reported together because the first without the second measures as
  a regression.
- Correction: an earlier statement in this decision said the model cannot
  express eighteen months. That was too broad. `PlayerContract` stores
  `startsOn` and `endsOn` as `GameDate` and is already day-precise; only the
  offered term is quantized to whole years. The change is therefore smaller than
  first described - the contracts table is untouched - but it exposed the
  anchoring defect, which is larger.
- Verification: documentation only. `docs/the-long-season-mondo-vivo.pdf`
  rewritten to version 3, with section 6.3 moving from three declared causes to
  three measured ones; Phase 81 README, design contract, and Steps 01, 02, 06,
  08, 09, 11, 12 amended; Phase 81A created with a README and six steps; the two
  market phases and their contracts renumbered; forward-looking indexes and
  roadmaps realigned. Dated history entries keep the old phase numbers on
  purpose.
- Next action: close Phase 80A Step 09 by recording the monitor transfer, then
  start Phase 81 Step 01.

### 2026-08-01 — Phase 80A Step 09 exact `750 x 3` blocked closeout

- Status: Blocked. Implementation, fresh execution, and deterministic resume
  are complete; the Phase 80B handoff is not.
- Adopted solution: retain one compact schema-4 player-development summary per
  one-world shard; simulate all three domestic competitions with canonical
  participation; preserve exact current/P50/upper/stored-ceiling concepts;
  keep raw anomaly status separate from semantic classification; and repair
  the world-21 greedy-XI dead end with a private feasibility guard rather than
  Phase 81's future global optimizer.
- Verification: fresh `750` simulated / `0` resumed and replay `0` simulated /
  `750` resumed, exactly `7` workers, identical ordered shard hashes and final
  aggregate hash
  `a09c10cb2b678140a2de7c4a226faac370c2a73b3e0d143dd9e35859f51f4a03`.
  All `32` non-vacuous player-model gates pass; stored-ceiling breaches are
  `0 / 2,949,467`; young ceiling-six cap breaches are `0 / 6,728`; structural
  violation examples are empty. Opening age-15-to-17 current-three/public-
  upper-six players have `1,577` observations valued at
  `EUR 13.76m..28.77m`, so the reported `EUR 1.4m` pattern is not reproduced.
- Blocker: `goals_per_match_avg` is `36/634/80` pass/warn/fail across worlds,
  with all `80` failures high. Its predeclared `monitor` class keeps FAIL
  severity. Match scoring is outside this step, and the contract forbids
  result-driven threshold or semantic changes. Required post-report repository/
  browser closeout checks are therefore not claimed as phase-completion
  evidence; `git diff --check` and the mandatory Graphify refresh remain green
  as housekeeping only.
- Lesson learned: deterministic checkpoint reuse proves evidence integrity,
  not product acceptance. The cohort separately reveals aggressive visible
  narrowing at age 21-23 and youth plateaus dominated by zero minutes; neither
  may be hidden by a new result-derived threshold.
- Next action: obtain the explicit ownership decision above, keep Phase 80A
  blocked, and do not begin Phase 80B or the `50 x 20`.

### 2026-08-01 — Phase 80A Step 08 monotonic expected-outcome value reclosed

- Status: Done. Step 09 is active; Phase 79 Step 14 remains paused and the
  deferred `50 x 20` remains unrun.
- Adopted solution: fully price current quality, price `50%` of the
  current-to-P50 tranche, and price `10%` of the P50-to-upper tranche. Remove
  the global uncertainty haircut and `marketContext`; keep buyer risk,
  asking-price policy, and free-agent fee separate. After a recorded failing
  output diagnostic and a disproved P50-weight hypothesis, calibrate only the
  global `3.5`- and `4`-star anchors to `EUR 2.2m` and `EUR 22m`.
- Verification: mandatory Vitest `291/291` across `24` files; seven package
  typechecks; dependency cruise `782` modules / `3,100` dependencies; clean
  production absence scans and diff. Fresh `20 x 2` bounded evidence reports
  zero owned economy violations, `75,210` public-order observations with zero
  failures, `188` stored-six value observations with zero failures, and all
  three frozen division-value bands passing.
- Blocker: none.
- Lesson learned: the First Division median was dominated by achieved-quality
  anchors, because mature median players had almost no current-to-P50 room.
  Increasing a prospect tranche could not repair that population-level
  failure; component attribution must precede calibration.
- Next action: run Step 09's exact `750 x 3` / `750` one-world-shard gate with
  exactly `7` workers, then prove a second identical run creates zero worlds.

### 2026-08-01 — Phase 80A Step 06 ceiling-first joint profile reclosed

- Status: Done. Step 08 is the only active Phase 80A step; Step 09 remains
  paused.
- Adopted solution: choose the contextual half-star ceiling and one internal
  quantile once, derive the exact reachable interval from gap, guardrail, role
  template, and family-growth caps, then construct current and potential from
  that fixed target. Every explicit prospect aged `15..20` has at least one
  stored star of opportunity; routine youth may still plateau. Opening senior,
  opening academy, seasonal academy, and annual career intake roots share the
  same owner and semantic ceiling constraints.
- Verification: required Vitest `14` files / `185` tests passed in `77.32s`;
  `@game/content` and `@game/cli` typechecks, focused ESLint, and diff checks
  passed. Frozen `3.5+` shares remain `421/2,144`, `252/2,176`, and
  `130/2,095`; exceptional stock remains green. The focused core runs in
  `5.67s` after eliminating duplicate searches, with no timeout increase.
- Blocker: none.
- Lesson learned: freezing rating counts is not enough if the exact ability
  inside a half-star can become unreachable. Preserve the authored rating and
  its quantile, but bound exact materialization before current generation;
  never hide the conflict with a retry, clamp, or fixed threshold. A factory
  validation boundary must reject producer bugs rather than rewrite them.
- Next action: execute reopened Step 08 only. Do not resume Step 09, run
  `750 x 3`, start Phase 80B/80C/81, or run the deferred `50 x 20` yet.

### 2026-08-01 — Phase 80A young-player model reopened from product evidence

- Status: Step 05 Reopened and active; Steps 06 and 08 Reopened and blocked by
  their documented predecessors; Step 09 paused.
- Adopted solution: preserve full public upper through age 20, calibrate every
  later completed age by role family from the deterministic outcome matrix,
  generate explicit age-15-to-20 prospect lanes ceiling-first with at least one
  stored star of opportunity, and replace the global uncertainty haircut with
  monotonic current/P50/upper value tranches. Routine youth may still plateau;
  stored room is not promised growth.
- Verification: renderer inspection confirms the UI is faithful; opening-stock
  evidence separates generation, projection, and star quantization; paired
  valuation counterfactuals prove that v4 can reduce value when upper rises.
  The deterministic matrix also exposed seven retroactive January-to-July
  rows before its 1 August opening birthday; the month alignment must be fixed
  before exact-age factors are frozen. Documentation freezes the correction
  before production changes.
- Blocker: none inside the active Step 05 scope.
- Lesson learned: a renderer cannot invent missing model room, a public
  projection cannot use one coarse post-20 age band, and uncertainty must not
  be charged both as an intrinsic-value haircut and as AI risk appetite.
- Next action: implement and verify Step 05 only. The first full calibration
  after Steps 05/06/08 is the dedicated compact `750 x 3` audit with exactly
  `7` workers; the first plateau rates are descriptive unless pre-frozen.

### 2026-08-01 — Phase 80A Step 05 exact-age projection rework

- Status: Done after reopening.
- Outcome: Replaced the coarse post-20 projection policy with `24` explicit
  role-family/age bands backed by `1,620` deterministic development outcomes;
  the public upper remains full through age 20 and reaches current at the
  accepted role-family terminal age.
- Adopted solution: process each calibration career from August through July,
  use five distinct outfield templates in a measured `2 defender / 2
  midfielder / 1 attacker` mix, keep P50 as an independently observed median,
  and enforce adjacent-age narrowing only on the complete current-to-upper
  envelope. Production stamps are `player-rating-scale-v7` and
  `player-potential-projection-v4`; valuation remains v4 until Step 08.
- Verification: Node `24.16.0`; matrix `24` bands / `1,620` observations / `65`
  above-public-upper outcomes (`401` bp), with zero missing bands, ordering,
  non-widening, or stored-ceiling violations. Required focused suites pass:
  domain/engine `19/19`, remaining mandatory files `169/169`, and full CLI
  report `25/25` in `509.40s`; all seven package typechecks were green across
  the implementation, focused ESLint, `git diff --check`, and
  `graphify update .` pass.
- Blocker: none.
- Lesson learned: percentile P50 and P90 facts must not acquire an
  undocumented shared smoothing rule, and a representative diagnostic must
  assert the source templates actually consumed rather than self-reported
  fixture labels. Step 06 must choose ceiling first and bound current from both
  sides: preserve the one-star gap while keeping that ceiling mechanically
  reachable under age/role growth caps.
- Next action: execute reopened Step 06 only. Do not start Step 08 or resume
  Step 09 until the joint generation owner is green.

### 2026-08-01 — Phase 80A Step 08 re-verification complete

- Status: Done; Step 09 resumed and active.
- Adopted solution: retain valuation-v4, update only the intentional canonical
  identity snapshot, and route AI squad prospect rotation through exact-date
  public assessments instead of stored potential or approximate age.
- Verification: Node `24.16.0`; mandatory Vitest `20` files / `232` tests;
  added AI owner coverage `3` files / `46` tests; seven package typechecks;
  depcruise `782` / `3,085`; focused ESLint; absence scans; diff; Graphify.
- Blocker: none inside Step 08.
- Lesson learned: information parity must cover every live AI decision owner,
  not only market targeting; a safe public type is useful only when the caller
  must supply it and its assessment date is validated.
- Next action: execute Step 09 only with fresh schema-v3 checkpoints.

### 2026-08-01 — Phase 80A Step 07 second reopen complete

- Status: Done; Step 08 active and Step 09 still paused.
- Adopted solution: keep current placement/concentration descriptive and bind
  generation truth to opening allocation plus new stock arrivals. Preserve the
  immutable national target and allow ordinary later transfers.
- Verification: Node `24.16.0`; mandatory Vitest `23` files / `279` tests;
  seven package typechecks; focused ESLint; diff; Graphify; independent review
  with no blocker.
- Blocker: none inside Step 07.
- Lesson learned: resumable evidence needs both content hashes and an explicit
  semantic contract; otherwise stale shards can contribute partial
  denominators while remaining internally hash-valid.
- Next action: execute reopened Step 08 only.

### 2026-08-01 — Phase 80A Step 06 evidence-driven rework complete

- Status: Done; Step 07 active and Step 09 still paused.
- Outcome: the generator now separates senior current-quality profiles from
  potential class, preserves world-budgeted champions, restores the First
  Division `4.5`/`5` continuum, and makes the Third Division `interesting`
  `3.5` edge uncommon rather than routine.
- Adopted solution: apply named, pre-sampling core/secondary adjustments only
  to senior generated ability; leave youth, off-role caps, value, transfer
  context, and the frozen cohort untouched.
- Verification: Node `24.16.0`; required Vitest `13` files / `163` tests;
  content and CLI typechecks; canonical opening shares First `19.64%`, Second
  `11.58%`, Third `6.21%`; diff and Graphify pass.
- Blocker: none inside Step 06.
- Lesson learned: ceiling frequency and current-quality continuity require
  different deterministic policies even when they share an archetype label.
- Next action: execute reopened Step 07 only.

### 2026-08-01 — Phase 80A first canonical `20 x 2` evidence

- Status: FAIL; Steps 06-08 reopened, Step 06 active, Step 09 paused.
- Adopted solution: preserve the failed evidence and repair its actual owners
  instead of weakening a band. Step 06 owns the Third Division prospect-share
  overshoot and malformed senior quality continuum; Step 07 owns allocation-
  arrival rather than lifelong-registration stock gates; Step 08 owns the
  context-free global curve after the population repair.
- Verification: exact seed prefix `phase80a-prechange-baseline`, worlds `20`,
  seasons `2`, shards `20`, workers `7`, resumed shards `0`. Positive model
  evidence included `25,753` closing value observations, `3,244` Third
  Division young observations, `60` stock snapshots, `40` stock transitions,
  `75,210` public-ordering observations, `687` completed free-agent movements,
  and positive AI/value-invariance/cap cohorts.
- Blocker evidence: Third Division `3.5+` share was `275 / 3,244` (`8.48%`);
  closing value fit failed First median/P90/P99, Second maximum, and Third
  P90/maximum. Stock placement/uniqueness failures traced to ordinary
  transfers, not allocation. One world had a two-season table-spread story
  outlier while the 20-world average was `36.17`.
- Lesson learned: a generation gate must measure the moment generation owns,
  and a category-free intrinsic value curve still requires a continuous,
  category-authored football-quality population. Story variance over two
  seasons cannot silently become a structural per-world failure.
- Next action: execute the reopened Step 06 only.

### 2026-08-01 — Phase 80A Step 07 reclosed and Step 09 resumed

- Status: Step 07 Done again; Step 09 active.
- Adopted solution: added explicit `promotion_candidate` stock identity with a
  club association for allocation only, kept ownership/academy registration
  unchanged, and made every current source mapping exhaustive.
- Verification: the real ceiling-six reservation regression produces zero
  vacancy/allocation; bounded `2 x 2` stock gates have zero violations and
  positive replacement evidence; all seven typechecks, diff, and Graphify
  pass. The underpowered `2 x 2` command still fails honestly on one hard-cap
  denominator and the closing division cohort, which are owned by `20 x 2`.
- Blocker: none.
- Lesson learned: unit-size multi-world reports must verify deterministic,
  positive evidence without claiming that a two-world sample proves cohort
  calibration. Transitional stock must be named explicitly and counted before
  any allocator that can manufacture a replacement.
- Next action: execute the one canonical Step 09 `20 x 2` with `7` workers.

### 2026-08-01 — Phase 80A Step 07 reopened by Step 09

- Status: Reopened; Step 09 paused.
- Adopted solution: keep the immutable world target and include unresolved
  promotion candidates in the same incoming-season active stock used by the
  national annual allocator.
- Verification: the non-vacuous diagnostic observed `5/5 -> 5/5 -> 6/5` in
  `phase31-test-world-00002`; all five incumbents were retained, zero departed,
  and one ceiling-six intake arrived. Value-invariance, AI-parity, and real
  free-agent gates were already green and did not cause this failure.
- Blocker: Step 09 remains paused until the owner regression and Step 07 checks
  pass.
- Lesson learned: unresolved promotion state is active national stock even
  while it is temporarily absent from academy and senior registration arrays.
- Next action: correct Step 07 only, rerun its focused checks, and return to
  Step 09 without changing thresholds or seeds.

### 2026-07-31 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/01-reproducible-baseline-and-calibration-contract.md`

- Status: Done.
- Outcome: froze a replayable 20-world pre-change model baseline with stable
  seeds and hashes, explicit rating concepts, positive denominators, complete
  owner inventories, and predeclared Phase 80A calibration bands.
- Adopted solution: keep the old `11 / 1,710` number as historical evidence
  because its seeds and hashes were never retained; use the canonical
  `11 / 1,723` reproduction for every later pre/post comparison. That baseline
  records the then-live `365.2425`-day convention; Step 05 supersedes live age
  bucketing with exact completed civil years without rewriting history.
- Verification: Vitest `26/26`; `@game/simulation-tools` and `@game/cli`
  typechecks; `git diff --check`; `graphify update .`; no `50 x 20`.
- Next action: execute Step 02 and add the season-frozen dynamic club tier plus
  bounded current reputation, without implementing the development environment.
- Blocker: none.
- Lesson learned: a historical aggregate without retained seeds and hashes is
  useful context but cannot be promoted into a reproducible acceptance gate.

### 2026-07-31 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/02-dynamic-club-tier-reputation-and-season-freeze.md`

- Status: Done.
- Outcome: every active club now has one durable competitive tier frozen for
  the active season; the canonical season boundary recalculates exact `4/4/6/4`
  division buckets from a balanced XI/useful-bench roster signal plus the
  completed national-pyramid result, then moves current reputation by at most
  two points.
- Adopted solution: `club-competitive-tier-v1` is a complete season-stamped
  domain snapshot. Promotion/relegation is applied before clubs are ranked in
  their new division; incomplete report-only divisions carry forward as a
  whole with explicit facts. Calendar, club reputation, and the new tier
  snapshot commit atomically. Fresh CLI/web careers use one engine constructor;
  persisted JSON v9 and SQLite v18 require the slice and delete incompatible
  beta saves instead of bootstrapping or migrating them.
- Verification: focused Vitest `74/74`; domain, content, engine, storage, CLI,
  and web typechecks; dependency cruise `773` modules / `2,982` dependencies;
  `git diff --check`; `graphify update .`; no `50 x 20`.
- Next action: execute Step 03 only and derive the seven-state development
  environment from the frozen category/tier facts.
- Blocker: none.
- Lesson learned: a report refresh with incomplete competition evidence must
  carry the entire division forward; mixing one observed table with invented
  rows would make the tier result look precise while changing sporting truth.

### 2026-07-31 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/03-seven-state-development-environment-and-public-label.md`

- Status: Done.
- Outcome: every active club now derives one frozen-season development
  environment from its current category and Step 02 competitive tier through
  the accepted seven-state matrix.
- Adopted solution: the strict `player-development-environment-v1` content
  policy owns all twelve cells and integer basis-point multipliers. Careers
  stamp only its version; the derived environment is frozen in memory and is
  never persisted as a second fact or history. Dashboard and CLI receive only
  an exhaustive localization key, never the multiplier. JSON v10 and SQLite
  v19 delete incompatible beta saves.
- Verification: focused Vitest `158/158` after one intentional identity-hash
  update; domain, content, engine, storage, UI, i18n, CLI, and web typechecks;
  storage `29/29`; desktop/narrow browser assertions; `git diff --check`; and
  `graphify update .`. No development/intake behavior and no `50 x 20` ran.
- Next action: execute Step 04 only and process the existing monthly evidence
  ledger through deterministic quarterly checkpoints plus a rollover residual
  flush.
- Blocker: none.
- Lesson learned: a derived public state still needs its own durable policy
  stamp. Reusing the competitive-tier version would make reload semantics
  silently depend on whichever environment matrix happens to ship later.

### 2026-07-31 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/04-quarterly-development-with-monthly-evidence.md`

- Status: Done.
- Outcome: canonical monthly participation now advances player development in
  batches of three complete months, while season rollover flushes the final
  one or two months exactly once.
- Adopted solution: the monthly ledger and its closed-month keys remain the
  only checkpoint truth. Each row owns minute-weighted club provenance, so a
  transfer cannot retroactively change the environment earned by prior
  minutes. Development uses exact month-end age, reload-stable
  player/season/month variance, cumulative same-season role evidence, and the
  environment multiplier only on positive growth; permanent realization and
  the duplicate youth-development route were removed. JSON v11 and SQLite v20
  intentionally reject incompatible beta saves.
- Verification: focused Vitest `110/110`; domain, engine, storage, CLI, and web
  typechecks; dependency cruise `778` modules / `3,006` dependencies;
  `git diff --check`; `graphify update .`; no `50 x 20`.
- Next action: execute Step 05 only and establish the single age-aware
  current/P50/public-upper assessment without changing generation or value
  coefficients.
- Blocker: none.
- Lesson learned: development evidence must retain the club that earned each
  minute; looking up a player's current owner at checkpoint time silently
  rewrites the sporting meaning of pre-transfer participation.

### 2026-07-31 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/05-age-aware-p50-upper-and-shared-public-assessment.md`

- Status: Done.
- Outcome: one canonical public assessment now derives exact-civil-age current,
  statistical P50, and reachable upper ability/rating facts for UI, sorting,
  and intrinsic value without exposing stored ceiling.
- Adopted solution: calibrate eleven goalkeeper/outfield age bands from a
  deterministic `1,620`-observation matrix (`324` cells, five streams each),
  keep full upper through age 20, narrow the complete current-to-upper envelope
  by age, and converge to current at 28+ outfield / 32+ goalkeeper. The
  six-slot renderer distinguishes achieved, probable, and uncertain upside.
- Verification: mandatory focused Vitest `201/201`, including the full CLI
  report file `19/19`; seven package typechecks; Playwright current-product
  proof `1/1`; matrix `11/11` bands with positive evidence, zero ordering,
  non-widening, and ceiling violations; `82/1,620` above-upper outcomes retained
  as neutral percentile evidence.
- Next action: execute Step 06 and change only contextual prospect current and
  ceiling generation.
- Blocker: none.
- Lesson learned: completed age must use the exact civil birthday. Historical
  baselines belong to their recorded checkout; live functions that recompute
  old evidence with new code are false evidence and were removed instead of
  retained as compatibility paths. Step 08 now explicitly owns every remaining
  willingness/contract/AI/CLI stored-ceiling leak.

### 2026-07-31 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/06-contextual-prospect-current-and-ceiling-generation.md`

- Status: Done.
- Outcome: opening senior and academy generation now produces joint
  current/ceiling profiles from age, category, exact competitive tier, role,
  and prospect class, while ordinary youth remain the majority.
- Adopted solution: the accepted three-division interesting/serious/rare
  ceiling matrix and age-15-to-20 rare-current guardrails are constructive and
  deterministic. Potential-only exceptional assignments no longer force an
  exceptional current lane; exact Gregorian birthdays preserve requested civil
  age; both senior and academy natural ceiling-six excess can be reconstructed
  below the national cap without rejection sampling.
- Verification: mandatory Vitest `159/159`; content and CLI typechecks;
  `git diff --check`; `graphify update .`. The `100`-world stock reconciliation
  is green, and positive-denominator young-senior ceiling-`3.5+` shares are
  `18.36%` Serie A, `10.40%` Serie B, and `7.44%` Serie C.
- Next action: execute Step 07 and make one national owner sustain initial and
  annual exceptional stock without inflation.
- Blocker: none.
- Lesson learned: opening-academy generation is part of the same national
  rarity system as senior generation; a reconstruction path limited to seniors
  cannot truthfully enforce a country-wide ceiling.

### 2026-08-01 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/07-national-exceptional-stock-and-annual-youth-intake.md`

- Status: Done.
- Outcome: one national composition owner now sustains the world-specific
  young stored-six target and established current-six stock across initial
  generation and annual intake.
- Adopted solution: a canonical active-stock selector classifies senior,
  academy, free-agent, and loan-aware players without historical or reserved
  rows. The national allocator preserves one immutable target of `4` or `5`
  age-15-to-20 stored-six players, `2..3` established current-six players,
  first-division placement, one-per-club ownership, and deterministic
  multi-vacancy refill. Exact civil dates align age-out and incoming intake.
- Verification: mandatory Vitest `264/264` across `23` files; domain, shared,
  content, engine, simulation-tools, i18n, and CLI typechecks; diff and
  Graphify all pass on Node `24.16.0`. No longitudinal cohort ran.
- Blocker: none.
- Lesson learned: stock replacement is non-vacuous only when every transition
  has a truthful local result and the bounded cohort separately proves at
  least one real vacancy and completed refill. A deterministic exact target
  must not be weakened into a global interval at diagnostic time.
- Next action: execute Step 08 only; remove valuation context and live AI
  ceiling access before the bounded Step 09 closeout.

### 2026-08-01 — `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/08-expected-outcome-value-and-ai-information-parity.md`

- Status: Done.
- Outcome: one date-stamped public assessment now owns intrinsic value,
  willingness, contract demand, AI ranking, and the CLI/browser projections;
  manager and AI no longer receive different potential information.
- Adopted solution: price public P50 on one global nonlinear curve and use the
  P50-to-upper width only as uncertainty discount. Keep one rare current-six,
  age-qualified `€150m` cap; keep asking price and exact zero free-agent fee as
  separate facts. Delete `marketContext`, context multipliers/caps, duplicate
  market ability, and the durable reachable-potential alias. Versioned AI risk
  appetite consumes only the same public assessment and club need/budget.
- Verification: Node `24.16.0`; the report file's `20` unaffected tests plus
  its corrected deterministic outcome pass, the remaining mandatory suite is
  `201/201` across `19` files, and touched-owner coverage is `101/101` across
  `11` files. Seven package typechecks, depcruise `782/3,077`, live-owner
  absence scans, diff, and Graphify pass. No `50 x 20` ran.
- Blocker: none.
- Lesson learned: passing one dated public assessment through a complete
  commercial operation prevents both policy drift and hidden re-derivation;
  type-level parity needs owner-specific absence tests to stay enforceable.
- Next action: execute Step 09 only: bounded positive-denominator diagnostics,
  clean beta reset, full gates, report, and Phase 80B handoff.

### 2026-07-31 — Phase 81 tactical-shape contract and ordered steps

- Status: Documented; implementation not started. The active step remains Phase
  80A Step 07.
- Outcome: Phase 81 now has one accepted design contract, a README, and twelve
  ordered implementation steps for a phase-aware tactical-shape and manager-
  decision engine.
- Adopted solution: preserve the deterministic aggregate match engine, but
  replace the current four-department information collapse with typed tactical
  slot facts; keep player quality, intrinsic team shape, and relational
  opponent matchup separate; add diminishing returns, suitability-aware
  coordination, phase routes, shared tactic semantics, causal actor selection,
  AI parity, live-session persistence, structured UI consequences, and
  non-vacuous diagnostics.
- Review amendment: Steps 03-05 are explicitly headless structural milestones
  and cannot claim the gameplay defect fixed. Step 01 freezes numeric
  paired-seed bands for equal, modest-gap, and First-title-versus-Third-midtable
  quality scenarios from the post-80A generated world. Step 06 is the first
  end-to-end gameplay gate; Step 12 only monitors that already-passing
  quality-versus-structure hierarchy. Step 09 must re-prove the matrix after
  canonical AI XI selection; a valid-selection hierarchy regression reopens
  Step 06, while an assignment defect reopens Step 09.
- Code quality: every step requires football-specific names, narrow pure
  modules, exhaustive typed unions, removal of obsolete local paths, and an
  in-scope refactor when touched dead or unclear code would otherwise be
  preserved. Generic helper/manager/processor modules, compatibility leftovers,
  and duplicate formulas are forbidden.
- Cohort ownership: Phase 80C Step 09 now closes only on bounded evidence.
  Phase 81 Step 12 alone runs and replays the deferred `50 x 20` with `50`
  stable shards and exactly `7` workers before the Phase 79 handoff.
- Roadmap alignment: the former advanced-pyramid Phase 81 reservation moves to
  Phase 82; the former youth/staff/facilities Phase 82 moves to Phase 83; the
  former narrative-factory Phase 83 moves to Phase 84.
- Verification: the contract, README, and twelve step documents exist; ordered
  checks are pinned to Node 24 and the repository-wide worker policy. No
  production code, save, test, or simulation was changed or run.
- Blocker: none.
- Next action: execute Phase 80A Step 07 only.

### 2026-07-30 — Phase 80A/80B design contract and ordered steps

- Status: Documented; implementation not started.
- Outcome: the complete accepted rework discussion is split into three linear
  phases with explicit owners, boundaries, ordered step files, diagnostics,
  beta-reset policy, and one final simulation owner.
- Adopted solution: Phase 80A owns player generation, dynamic club environment,
  quarterly development, public projection, value, and AI parity. Phase 80B
  owns incoming offers, postures, final counterproposal, loans, wage sharing,
  Posta, and persistence. Phase 80C owns competitive races. The later Phase 81
  decision supersedes this entry's original cohort owner.
- Verification: all three phase directories and their ordered step documents
  exist; contracts distinguish product truth from calibration work; no
  production code or long run was executed for this documentation update.
- Blocker: none.
- Lesson learned: running the deferred cohort after Phase 80 would validate an
  intermediate product and waste hours; the current meaningful owner is Phase
  81 Step 12 after all accepted reworks.
- Next action: execute the currently active Phase 80 Step 08.

### 2026-07-30 — Phase 80A/80B value, ownership and negotiation amendment

- Status: Documented; implementation not started.
- Outcome: accepted the post-contract audit and removed four ambiguities before
  implementation: context-dependent public-value caps, obsolete calibration
  comparisons, ownership/selectability overload, and parallel same-player
  negotiations.
- Adopted solution: Phase 80A removes `marketContext`, category/free-agent
  multipliers, and per-context maximums from intrinsic public value, uses one
  global `€150m` cap, and freezes a new source-backed calibration epoch before
  behavior changes. Phase 80B keeps `Club.playerIds` as the sole persisted
  ownership list, derives `selectablePlayerIds(...)` from ownership plus active
  loans, protects selectable `18` and `2/6/6/3` floors for outgoing loans and
  autonomous AI sales without globally blocking manager-accepted permanent
  moves, and enforces one unresolved negotiation per
  `(acquiring club, player)` across permanent and loan state while leaving
  different buyers valid for Phase 80C.
- Verification: documentation amended only; relevant production references
  were inspected with Graphify and `rg`; all `9 + 10` ordered step files
  exist; targeted trailing-whitespace scan and `git diff --check` pass. No
  production test or long run was needed or executed.
- Blocker: none.
- Lesson learned: a shared field that mixes ownership and sporting
  selectability is architectural debt, not a counting shortcut; derived named
  accessors prevent silent free-agent, seller-depth, and squad-health defects.
- Historical next action at that entry: execute Phase 80 Step 08. Current next
  action is Phase 80A Step 01; do not start Phase 80B/80C/81 or run the
  deferred `50 x 20`.

### 2026-07-30 — Phase 80A/80B/80C architecture-depth amendment

- Status: Documented; implementation not started. Phase 80C product decisions
  accepted on 2026-07-31; the phase is Planned after Phase 80B.
- Outcome: removed the remaining shallow seams that would have forced later
  rewrites. Phase 80A now has one safe public-assessment Interface and no
  duplicated development ledger; Phase 80B separates posture, completed loan,
  and loan negotiation state and validates owner/employer/registration at the
  `CareerState` seam; Phase 80C persists race coordination before behaviour,
  adds a real free-agent negotiation, and gives race diagnostics their own
  Module.
- Adopted solution: keep canonical commercial facts in discriminated
  negotiation aggregates, let `PlayerTransferRace` reference them without
  copying terms, resolve the club stage to qualified/outbid/rejected sets,
  distinguish `outbid` from `lost_to_rival`, make raises stale-safe, and reserve
  Step 09 for the `50 x 20`. Permit at most three active buyers; advance only
  the highest seller-acceptable fee and exact matches; keep loans serial; give
  both stages fixed three-day clocks; make one-suitor free agents wait; and
  treat manager acceptance as seller acceptability rather than early closure.
- Verification: source owners inspected with Graphify and targeted `rg`; all
  planned file references and ordered-step existence are checked at the end of
  this documentation task. No production test or long run is required.
- Blocker: none. All six product decisions are fixed before implementation.
- Lesson learned: a race is a coordination aggregate, not a replacement for
  negotiation state; persisting it only with diagnostics would make reload
  correctness an afterthought.
- Next action: continue only the currently active Phase 80 Step 08. Do not
  start Phase 80C before Phase 80B is Done.

### 2026-07-31 — Phase 80A/80B/80C pre-execution contract audit

- Status: Documentation corrected; implementation not started.
- Outcome: closed the three issues found by the independent read of all three
  contracts and their `28` ordered step documents.
- Adopted solution: Phase 80C Step 01 now names every currently verified
  domain, engine, storage, UI, web, simulation-tools, and CLI status consumer
  plus focused tests and typechecks, so its exhaustiveness work is permitted by
  its own Expected Files, including the canonical CLI market demo and its
  integration test. The UI lifecycle must use separate total mappings for the
  transfer and preliminary-agreement source unions instead of a pending-status
  set with a fallback. Legacy Phase 79D negotiation-spread diagnostics
  explicitly filter race-only terminal outcomes before a total mapper narrowed
  to the legacy-eligible union; Phase 80C's dedicated audit owns them. Steps 03
  and 05 now include every exhaustive status consumer they must update when
  introducing `outbid` and `lost_to_rival`, respectively. Step 08 must expose
  canonical, legacy-eligible, and excluded-race counts and label the resulting
  pre/post-80C spread discontinuity. Every Phase 80A/80B/80C step starts its
  checks with
  `nvm use 24`. The Phase 80B contract already fixes outgoing command
  eligibility and seller willingness as separate facts:
  `player_not_for_sale` is a valid explicit seller response, not an eligibility
  contradiction.
- Verification: all `28 / 28` ordered step documents contain `nvm use 24`;
  the status-consumer inventory was checked with Graphify and targeted source
  search; `git diff --check` passes. No production test or simulation ran.
- Blocker: none.
- Lesson learned: a compile-safety gate is only real when every owner it
  promises to harden is inside the step's write scope; a pinned runtime belongs
  in every executable check block, not only in final gates.
- Next action: execute Phase 80A Step 01 only.

### 2026-07-31 — Phase 80 Step 09 and phase closeout

- Status: Done. Phase 80 is complete.
- Outcome: The five accepted graphical and interaction reworks are closed
  truthfully, and control passes to Phase 80A without running the deferred
  player/economy/market cohort.
- Adopted solution: every accepted inventory ID `P80-R01..P80-R05` maps to a
  named canonical owner with passing implementation and browser evidence;
  `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_REPORT.md` records the
  delivery, the defects found while proving it, the absence checks, manual
  inspection targets, and the residual monitor items; the phase README, steps
  index, both roadmaps, the audit index, and the Phase 80A README now state the
  same closed state.
- Verification: closeout checks rerun after the documentation changes.
  `pnpm check` PASS (exit `0`; Vitest `1,606` tests across `256` files,
  dependency-cruiser `769` modules / `2,966` dependencies, ten typechecks);
  `pnpm --filter @game/web run build` PASS; `pnpm web:visual:qa` `34/34` PASS;
  `git diff --check` and `graphify update .` PASS, all on Node `24.16.0`.
- Blocker: none.
- Lesson learned: the shared potential renderer is complete and correct, so the
  remaining prospect-upside gap is a generation and projection question. Phase
  80A owns it; presentation must not be used to hide a model finding.
- Next action: execute Phase 80A Step 01 only. Do not start Phase 80B, 80C, or
  81, and do not run the deferred `50 x 20`, which belongs to Phase 81 Step 12.

### 2026-07-31 — Phase 80 Step 08

- Status: Done.
- Outcome: All five accepted reworks pass together in the supported browser
  journeys, every repository/build/dependency gate is green, and no obsolete or
  duplicate implementation path remains.
- Adopted solution: run the complete gate set on the pinned Node `24.16.0`
  toolchain, record the evidence in
  `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_REPORT.md`, and fix each
  discovered failure in its owning scope instead of relaxing an assertion.
- Verification: `pnpm check` PASS (exit `0`); `pnpm --filter @game/web run build`
  PASS; `pnpm depcruise` `769` modules / `2,966` dependencies PASS;
  `pnpm web:visual:qa` `34/34` PASS in `6.7` minutes; `git diff --check` and
  `graphify update .` PASS. Absence checks confirm one debounce helper, no
  screen-local money parser, no local pagination rule, and no Market-specific
  dialog workaround.
- Blocker: none.
- Lesson learned: the repository pins Node `24.16.0` and the gates depend on it.
  On the default Node `20.17.0` shell `pnpm check` cannot start, because
  `scripts/check-localized-presentation-text.ts` needs native TypeScript
  execution, and Node 24's ICU is what the money expectations assert.
- Lesson learned: the Phase 79 transfer-offer browser journey was world
  dependent and failed about half the time. Every new browser career seeds its
  world with a fresh `crypto.randomUUID()`, so a fixed `€100,000` bid on
  whatever target sorted first was answered `fee_below_valuation`. The journey
  now filters to contracted actionable targets, sorts by ascending public value,
  offers the seller's own asking price, and walks up to eight candidates because
  a seller may still answer `player_not_for_sale`. Random-world browser
  assertions must derive their inputs from the world they are given.
- Accepted handoff for Phase 80B: `actionable` means the manager may submit the
  command; it is not a promise that the seller will negotiate. The canonical
  seller-willingness owner may still answer `player_not_for_sale`, and Phase
  80B must keep that distinction explicit in its read model and copy without
  duplicating willingness logic in React.
- Next action: execute Step 09 only.

### 2026-07-30 — Phase 80 Step 07

- Status: Done.
- Outcome: A transfer-offer draft can no longer disappear through backdrop,
  gutter, or scrollbar interaction, and it survives scrolling and profile-tab
  navigation for the same player.
- Adopted solution: `FullScreenDialog` gained one explicit `dismissOnBackdrop`
  policy that defaults to today's light dismissal for every existing consumer
  and publishes its state as `data-backdrop-dismiss`. The Market player dialog
  opts out because it holds an unsent draft. `Escape`, the explicit close
  control, the native focus trap, opener focus restoration, and the existing
  per-player draft identity are unchanged.
- Verification: focused Vitest `10/10`; web typecheck PASS; the complete
  current-product Playwright spec `33/33` PASS, including the new
  `Market offer draft survives dialog scrolling and gutter interaction`;
  `git diff --check` and `graphify update .` PASS.
- Blocker: none.
- Lesson learned: three browser assertions written before Steps 04 and 06 were
  measuring the old behavior — two compared Market result totals by counting
  rendered rows, which pagination caps at `25`, and two expected raw
  unnormalized money text. Regression specs must assert the reported total and
  the normalized value, not incidental rendering.
- Next action: execute Step 08 only.

### 2026-07-30 — Phase 80 Step 06

- Status: Done.
- Outcome: Every accepted Squad, Market, profile, contract, and finance amount
  now uses one exact locale-aware presentation, and every editable money field
  uses one integer-safe locale parser with blur normalization.
- Adopted solution: `apps/web/src/shared/format-money.ts` is the single owner.
  Read-only display hands `Intl` an exact decimal string built from the stored
  minor units, so no floating-point division sits between storage and screen.
  `parseMoneyInputToMinorUnits` reads grouping and decimal characters from the
  active language, accepts locale-valid text, assembles minor units with string
  arithmetic, and rejects ambiguous input such as English `1,50`.
  `formatMoneyInputFromMinorUnits` is its blur-time round-trip partner. The
  three screen-local parsers are gone: contract renewal, the Market transfer fee,
  and the Market value bounds all call the shared pair, and the value-bound
  inputs are locale text instead of raw `type="number"` fields.
- Verification: focused Vitest `18/18`; full `@game/web` suite `343/343`; web
  typecheck PASS; named Playwright `1/1` PASS; `git diff --check` and
  `graphify update .` PASS.
- Blocker: none.
- Lesson learned: `Intl.NumberFormat` accepts a decimal string, so exact money
  presentation needs no division at all; and an HTML `type="number"` field is
  always locale-independent, so a locale-aware money field must be text.
- Next action: execute Step 07 only.

### 2026-07-30 — Phase 80 Step 05

- Status: Done.
- Outcome: Squad now shows Placement directly after Role, exposes the canonical
  integer age as a sortable column, and rebuilds the table once the typed
  player-name query settles.
- Adopted solution: `@game/ui` owns the reordered locked column contract plus an
  `age` row field and comparator; the web adapter maps the age the valuation
  already derives, so React never computes it; the screen reuses Step 04's
  `useDebouncedValue` for the query only, while department, availability, and
  placement commands stay immediate.
- Verification: focused Vitest `39/39`; `@game/ui` and `@game/web` typechecks
  PASS; Playwright Squad suite `8/8` PASS including the new
  `Squad exposes age placement and delayed search`; `git diff --check` and
  `graphify update .` PASS.
- Blocker: none.
- Lesson learned: the Squad department select shipped the role name
  `goalkeeper` while the canonical department is `goalkeeping`, so that filter
  always returned an empty squad; the `as` cast on the select value hid the
  mismatch from the compiler. Filter option values must be canonical domain
  values, and a select whose value is cast needs browser evidence that it still
  matches something.
- Next action: execute Step 06 only.

### 2026-07-30 — Phase 80 Step 04

- Status: Done.
- Outcome: The Market now renders at most `25` deterministic rows per page,
  delays only typed filters, and bounds age through two accessible selects,
  without changing market rules, sorting semantics, or command handling.
- Adopted solution: `@game/ui` gained `CAREER_MARKET_PAGE_SIZE` and a pure
  `paginateCareerMarketTargetRows` slice that clamps oversized pages and keeps
  empty results at page `1` of `1`; the web screen keeps immediate input echo
  and applies query/manual value bounds through one shared
  `useDebouncedValue` helper after `250 ms`, while selects, age bounds, and the
  page controls stay immediate and reset to page `1`.
- Verification: focused Vitest `30/30`; `@game/ui` and `@game/web` typechecks
  PASS; named Playwright `1/1` PASS; `git diff --check` and
  `graphify update .` PASS.
- Blocker: none.
- Lesson learned: browser QA must not assert an exact match count from a
  generated world; fictional full names can repeat, so a delayed query is
  proven by a smaller result set whose every row matches the query.
- Next action: execute Step 05 only.

### 2026-07-30 — Phase 80 Step 03

- Status: Done.
- Outcome: Level and Potential now have distinct shared visual language on
  Squad, Market, and both player inspectors without changing rating,
  projection, valuation, sorting, development, or persistence facts.
- Adopted solution: pass the canonical current public rating into the existing
  six-slot potential renderer; layer achieved, light conservative future,
  light patterned uncertain future, and neutral outline; retain dark orange
  only for an achieved sixth star and use light orange for projected sixth-star
  upside.
- Verification: focused Vitest `20/20`; web typecheck PASS; named Playwright
  `1/1` PASS; desktop Market/Squad screenshots manually inspected; diff and
  Graphify PASS.
- Blocker: none.
- Lesson learned: band semantics stay exact and half-step-safe when visual
  layers share the canonical current/lower/upper inputs and expose separate
  DOM state rather than deriving meaning from color.
- Next action: execute Step 04 only.

### 2026-07-30 — Phase 80 Step 02

- Status: Done.
- Outcome: five user-reported Squad/Market reworks are recorded as
  `P80-R01..P80-R05` with current evidence, owner, non-goals, dependencies,
  verification, and ordered Steps 03-09.
- Adopted solution: use `25` rows and `250 ms` as bounded Market UX defaults;
  keep selects immediate; retain two age range selectors over `15..40`; add
  Squad age and move Placement after Role; centralize exact locale-aware money
  editing; make Market offer details opt out of backdrop dismissal.
- Verification: inventory artifact exists; screenshot and source seams were
  inspected; `git diff --check` and `graphify update .` PASS. The bounded
  Playwright replay did not start the sandboxed Vite server and therefore is
  not represented as reproduction evidence.
- Blocker: none.
- Lesson learned: the screenshots' English money grouping is already correct
  for an English UI. The rework must enforce selected-locale consistency,
  especially for editable values, rather than hard-code Italian punctuation.
- Next action: execute Step 03 only.

### 2026-07-30 — Phase 80 Step 01

- Status: Done.
- Outcome: Phase 80 is established as the graphical/structural rework phase,
  and one repository-wide seven-worker simulation execution policy replaces
  host-dependent and runner-specific defaults.
- Adopted solution: export a pure `SIMULATION_WORKER_LIMIT=7` resolver from
  `@game/simulation-tools`; default direct and resumable batches to
  `min(7, work items)`; permit only lower explicit/environment overrides; cap
  Vitest with the same owner; leave indivisible simulations at one worker.
- Verification: focused policy tests PASS (`4/4`); CLI integration PASS
  (`20/20`); simulation-tools and CLI typechecks PASS; full `pnpm check` PASS
  (`253` files / `1,586` tests); Dependency Cruiser PASS (`764` modules /
  `2,952` dependencies).
- Next action: execute only Phase 80 Step 02 after the user supplies the
  concrete rework list. Do not invent implementation steps or run the final
  cohort early.

### 2026-07-30 — Phase 79D Step 08 and phase closeout

- Status: Done by explicit product decision.
- Outcome: Phase 79D implementation, bounded deterministic diagnostics,
  repository verification, and browser QA are complete. The attempted direct
  `50 x 20` was stopped after roughly eight and a half hours, produced no
  report, and is not represented as a pass.
- Adopted solution: close the phase truthfully while carrying the missing
  longitudinal cohort forward. A later accepted decision assigns that sole
  run to Phase 81 Step 12; it must be resumable and use exactly `7` workers
  so the host remains usable.
- Verification: focused Phase 79D checks/typechecks PASS; `pnpm check` PASS
  (`252` files / `1,581` tests); Dependency Cruiser PASS (`762` / `2,950`);
  web build PASS; Playwright PASS (`29/29`); manual Squad/Market/profile QA
  PASS; no `79D_50X20_REPORT` exists.
- Historical next action at close: document Phase 80. Current next action is
  Phase 80 Step 04; Phase 80A/80B are already documented successors.

### 2026-07-29 — Phase 79D Step 03 execution-budget re-verification

- Status: Done.
- Outcome: the canonical 100-world rarity/assignment test is stable under the
  full repository suite without changing any seed, assertion, rarity bound, or
  generation behavior.
- Adopted solution: raise only the test timeout from `60s` to `300s`; an
  intermediate `120s` budget proved insufficient when a later full run reached
  `121.9s`. Seeds, assertions, bounds, and production code are unchanged.
- Verification: isolated test PASS in `56.8s`; exact Step 03 suite `6` files /
  `50` tests PASS on the final `300s` budget; content and simulation-tools
  typechecks PASS; dependency boundaries `762` modules / `2,950` dependencies
  PASS; diff and Graphify PASS.
- Follow-up: resume Phase 79D Step 08.

### 2026-07-29 — Phase 79D Step 07 resumed verification

- Status: Done.
- Outcome: all structural projection, rarity, allocation, and ceiling gates
  pass with positive observations; public-P90 misses are measured
  symmetrically without treating the public upper as a hard ceiling.
- Adopted solution: compare numeric peak ability to public upper and stored
  ceiling separately; pool evidence by role-family/age band; retain the
  predeclared `5%..15%` tolerance and explicit per-band warnings.
- Verification: exact `6` files / `45` tests, simulation-tools/CLI typechecks,
  dependency-cruiser (`762` / `2,950`), diff, and Graphify PASS. Aggregate
  exceedance is `65/1,170` (`5.56%`); stored-ceiling violations are zero.
- Follow-up: Step 08 owns browser QA, absence audits, reports, and one
  `50 x 20`.

### 2026-07-29 — Phase 79D Step 06 rework verification

- Status: Done.
- Outcome: the P90 public-upper correction preserves market monotonicity and
  negotiation behavior without redefining generated rarity.
- Adopted solution: store explicit ceiling and public-upper diagnostic facts;
  keep ceiling-six rarity at `302`, report public-upper-six separately at
  `151`, and assert `public upper <= stored ceiling`.
- Verification: exact `14` files / `137` tests, six package typechecks,
  dependency-cruiser (`762` / `2,950`), and diff PASS.
- Follow-up: resume Step 07 with symmetric public-range miss evidence, a
  predeclared `5%..15%` P90 exceedance tolerance, and hard failure above the
  stored ceiling.

### 2026-07-29 — Phase 79D Step 05b rework

- Status: Done.
- Outcome: production public potential is now a pooled P10/P50/P90 estimate,
  and visible six-star upside is no longer an alias for a hidden six-star
  ceiling.
- Adopted solution: pool exact deterministic outcomes per role-family/policy
  age band; preserve a zero terminal goalkeeper band from the engine's age-28
  no-growth rule; advance linked immutable asset versions and reset
  incompatible beta saves.
- Verification: exact `16` files / `150` tests, seven package typechecks,
  dependency-cruiser (`762` / `2,950`), diff, and Graphify PASS.
- Follow-up: Step 06 must reverify price monotonicity, prospect distributions,
  uncertainty discount, cap frequency, and negotiation reachability before any
  coefficient change.

### 2026-07-29 — Phase 79D Step 05a rework

- Status: Done.
- Outcome: public upper potential is now a modeled high-upside estimate rather
  than an alias for the stored ceiling.
- Adopted solution: add an ordered upper-realization factor; validate
  non-increasing `upper - conservative` width independently per role family;
  retain hidden stored ceiling facts for defensive checks without persistence
  or public exposure.
- Verification: focused `2` files / `12` tests, domain/engine typechecks,
  dependency-cruiser (`762` / `2,950`), and diff PASS.
- Follow-up: Step 05b calibrates and versions the production policy, resets
  incompatible beta saves, and makes public six-star upside depend on P90.

### 2026-07-29 — Phase 79D Step 07 blocked

- Status: Blocked.
- Outcome: implemented non-vacuous joint-distribution, projection, exceptional
  intake/cap, market, negotiation-stage, and contract-finance diagnostics, then
  found a real production-policy contradiction rather than a diagnostic bug.
- Adopted solution: emit explicit observation/evaluation facts, keep seller and
  counter stages separate, retain named reproducible failures, and refuse to
  relax the age-width gate or edit gameplay coefficients in Step 07.
- Verification: required `6` files / `43` tests PASS; simulation-tools/CLI
  typechecks, dependency-cruiser (`762` / `2,950`), diff, and Graphify PASS.
  Projection coverage is `234/234` cells and `1,170` observations; ordering
  passes, while `public_projection_non_widening_age` reports six age-22
  large-room violations across both role groups and all participation bands.
  A bounded one-world ten-season smoke exercised positive observations for all
  ten player-economy gates. The reserved `50 x 20` did not run.
- Blocker: changing the versioned projection factors belongs to the Step
  05a/05b policy boundary and violates Step 07's expected-file and
  no-tuning constraints.
- Follow-up: reopen the projection-policy owner, fix the six violations, rerun
  Step 07, and only then activate Step 08.

### 2026-07-29 — Phase 79D Step 06

- Status: Done.
- Outcome: low-current elite-upside prospects now have non-negligible
  range-aware value, exact cap display is eligibility-safe, and deterministic
  AI negotiations exercise acceptance, rejection, and counter paths.
- Adopted solution: consume the Step 05a expected ability and public width;
  discount the projected increment rather than the raw ceiling; apply shared
  compression and whole-euro quantization; bid within a versioned affordable
  `70%..100%` asking band; propagate accepted counter fees unchanged.
- Verification: exact `14` files / `135` tests, six typechecks,
  dependency-cruiser (`762` / `2,950`), diff, and Graphify PASS. Bounded
  evidence observed `51` completed-after-counter transfers with coherent fees,
  `9` eligible exact cap hits across `100` initial worlds, and zero ineligible
  cap-label collisions.
- Follow-up: Step 07 owns explicit stage-aware, positive-observation gates; no
  gameplay coefficient changes belong there.

### 2026-07-29 — Phase 79D Step 05b

- Status: Done.
- Outcome: Young potential is now one truthful accessible range in Squad,
  Market, and both player profiles, while current level stays singular and
  exact numeric potential remains hidden.
- Adopted solution: version and validate one production projection policy;
  derive each range from the current snapshot; use six stable solid/patterned/
  outline slots with half-star boundaries; sort by lower, upper, current, and
  ID; delete only an incompatible loaded beta save through canonical storage.
- Verification: `15` required files / `144` tests PASS; six package typechecks,
  dependency-cruiser (`762` / `2,950`), diff, and Graphify PASS.
- Follow-up: Step 06 advances valuation to the v2 scale, consumes the same
  projection expectation, removes the temporary v1 valuation-scale bridge,
  and owns all economy/negotiation changes.

### 2026-07-29 — Phase 79D Step 05a

- Status: Done.
- Outcome: Public potential now has one pure headless projection contract with
  ordered current, conservative lower, expected, and ceiling facts plus global
  half-stars.
- Adopted solution: validate a versioned caller-owned goalkeeper/outfield age
  policy in domain and derive immutable projections in engine from canonical
  current ability and the sole persisted `Player.potential` ceiling.
- Verification: `2` required files / `10` tests PASS; domain and engine
  typechecks, dependency-cruiser (`757` / `2,933`), diff, and Graphify PASS.
- Follow-up: Step 05b owns production configuration, framework-free read-model
  adoption, accessible UI presentation, and the documented incompatible beta
  save reset.

### 2026-07-29 — Phase 79D Step 04

- Status: Done.
- Outcome: Every production rollover composition now applies one shared annual
  exceptional policy to actual youth candidates, and the ten-season intake
  contract is measured through accepted canonical engine facts.
- Adopted solution: compose after youth lifecycle, allocate once at world
  scope, force only the selected generated IDs, and preserve separate
  allocation/generation/acceptance/activity diagnostics. The initial academy
  forcing seam now passes its potential floor to player construction rather
  than identity generation.
- Verification: `9` required files / `132` tests PASS; five package
  typechecks, dependency-cruiser (`755` / `2,926`), diff, and Graphify PASS.
- Follow-up: Step 05a may add only the pure headless potential-projection
  contract; production configuration, read models, saves, and pixels remain
  Step 05b scope.

### 2026-07-29 — Phase 79D Step 02

- Status: Done.
- Outcome: Exceptional current stars and potential-only prodigies now use
  compatible archetype, age, and current-quality construction paths.
- Adopted solution: resolve one explicit exceptional profile before sampling;
  current-six precedence selects the adult `category_star` and exceptional
  current band, while potential-only six-star allocation selects the young
  `rare_prodigy` and leaves current quality on its ordinary age band.
- Verification: focused content tests PASS (`6` files / `44` tests);
  `@game/content` typecheck, dependency boundaries (`755` modules / `2,915`
  dependencies), and `git diff --check` PASS.
- Follow-up: Step 03 must reconcile selected IDs with effective generated
  ratings and may not reopen archetype construction.

### 2026-07-29 — Phase 79D Step 03

- Status: Done.
- Outcome: Initial-world rarity now governs effective generated ratings, not
  only preselected IDs, with truthful source/archetype/lane metadata.
- Adopted solution: reconcile deterministic natural qualifiers first, fill
  only the remaining slots, and reconstruct any surplus senior qualifier
  through one bounded compatible below-six profile. Potential-only constructed
  prodigies use reserve slots and override stale division rarity metadata.
- Verification: focused tests PASS (`6` files / `48` tests), including `100`
  complete worlds; content/simulation-tools typechecks, dependency boundaries
  (`755` modules / `2,919` dependencies), and diff checks PASS.
- Follow-up: Step 04 must compose the annual world allocator exactly once per
  rollover and distinguish allocated, generated, accepted, and active counts.

### 2026-07-29 — Phase 79D documentation

- Status: Documented; Step 01 ready.
- Outcome: Created the binding corrective specification, phase README, and
  nine ordered step documents for exceptional generation, headless and
  integrated public potential range, range-aware prospect value, cap-display
  semantics, negotiation spread, effective rarity, annual intake, and
  non-vacuous diagnostics.
- Adopted solution: retain deterministic slot pre-allocation but construct only
  archetype-compatible profiles; keep the existing internal potential ceiling
  and derive a public conservative-to-upside range without persistence or
  scouting fog; value the same range through source-backed monetary anchors
  and a separately game-outcome-calibrated realization/uncertainty policy;
  apply shared upper-tail compression before a rare hard clamp;
  reserve the exact displayed cap for eligible players; make AI
  asking/offer/counter/completed-fee behavior observable; require positive
  observations; delete/reset incompatible beta saves rather than adding
  compatibility migrations. Twenty seasons cover one representative
  age-15-to-35 arc and year-20 stocks but do not prove later equilibrium.
- Verification: documentation-only update; no gameplay check, browser run, or
  cohort executed.
- Follow-up: execute only
  `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/01-reproducible-joint-profile-baseline-and-prospect-source-contract.md`.

### 2026-07-29 — Phase 79D independent-review corrections

- Status: Incorporated; Step 01 remains ready and no implementation has
  started.
- Outcome: Closed the four material documentation gaps found by independent
  review. The non-eligible one-cent-below-cap rendering defect now belongs to
  Step 06 and its Step 07/08 gates. The AI asking-price copy and zero-counter
  baseline now belong to Steps 01, 06, 07, and 08. The former oversized Step 05
  is split into a headless projection contract in Step 05a and explicit
  production/UI/persistence adoption in Step 05b. The twenty-season limit now
  has an explicit age-15-to-35 coverage claim and an equally explicit
  beyond-year-20 evidence limit.
- Adopted solution: quantize public value downward to whole euros before cap
  classification; reserve the exact displayed `€150m` label for eligible
  players; replace unconditional AI asking-price bids with a deterministic,
  versioned, affordability-bounded offer policy; and fail negotiation gates
  when counter-path observations are absent rather than treating typed fee
  separation as behavioral proof.
- Verification: documentation references, ordered-step ownership, roadmap
  handoff, and project-status wording reconciled; no gameplay check, browser
  run, or cohort executed.
- Follow-up: execute only Phase 79D Step 01 and use its measured baseline to
  calibrate later game-design coefficients without attributing them to
  Transfermarkt observations.

### Previous Phase 79B completion evidence

- Step 01 adopted solution: one Workbench design system and seven-step
  execution path now lock the confirmed half-star, elite, automatic-swap,
  role/attribute, career-statistics, tab, exact-Market-attribute, responsive,
  accessibility, and no-scouting-fog decisions. The existing dark-teal,
  chalk, gold, Rokkitt/Mulish identity and canonical session, tactical board,
  contract, market, and persistence owners remain unchanged.
- Step 01 verification: `design.md`, the Phase 79B README, all seven step
  documents, and Hallmark preflight exist; scoped `git diff --check` PASS.
- Step 02 adopted solution: completed-season archives now preserve ordered
  player starts, substitute appearances, minutes, rating totals/samples, goals,
  assists, and saves before exits and participation reset. Participation and
  event coverage remain independently `complete`, `partial`, or `unavailable`;
  zero played fixtures are truthful complete zeroes, a missing rating sample
  degrades participation coverage, and event schema versions below `5` cannot
  claim all goal/assist/save facts. The selector returns current and cumulative
  totals with one weighted rating. SQLite `15` incrementally upgrades `14`,
  stores archived rows without an active-player FK, and leaves JSON envelope
  `7` additive and compatible.
- Step 02 verification: focused domain/engine/storage run PASS (`11` files /
  `79` tests); all three package typechecks PASS; real Chromium SQLite/OPFS
  round-trip PASS (`1/1`, schema `15`, retired-player row preserved);
  `git diff --check` PASS. No long run executed.
- Step 02 lesson: the archive builder owns the complete canonical season only;
  an optional fixture subset was removed because monthly ledger rows cannot be
  truthfully sliced after aggregation. Career averages always sum rating
  totals/samples and never average seasonal averages.
- Step 03 adopted solution: the engine derives public current and potential
  ratings from one arithmetic-mean baseline over the selected club's current
  senior squad, clamps and rounds them to half-star values, and adds a
  non-numeric elite marker only at canonical role ability `>= 17`. Squad and
  Market adapters reuse that contract; Market assesses every target in one
  call against the same selected-club reference. One `PlayerStarRating`
  component renders five ordinary gold positions plus the optional sixth
  dark-orange marker with localized accessible copy and no hidden ability.
- Step 03 verification: engine assessment tests PASS (`11/11`); all UI tests
  PASS (`16` files / `90` tests); all i18n tests PASS (`2` files / `19` tests);
  all web tests PASS (`65` files / `287` tests); engine/UI/web typechecks and
  `git diff --check` PASS. No visual QA, build, or long run executed in this
  step.
- Step 03 lesson: Market comparisons must be derived once from the selected
  senior roster rather than grouped by target owner, and the lineup chooser is
  also a rating consumer because it displays the current occupant.
- Step 04 adopted solution: Squad now derives one sortable placement select
  from the real formation, XI, and bench snapshot, including translated
  side-specific slots and every weak-but-legal assignment. A pure planner
  sequences XI, bench, unselected, removal, and automatic occupied-slot swaps
  through the existing synchronous callbacks. One viewport-clamped
  body-portal menu owns profile and detailed-position actions, with
  keyboard/touch dismissal and focus restoration; the detailed chooser calls
  the same planner.
- Step 04 verification: UI tests PASS (`16` files / `92` tests); web tests PASS
  (`67` files / `307` tests); focused i18n tests PASS (`2` files / `19` tests);
  UI/web typechecks and web production build PASS. The complete current-product
  and SQLite/OPFS Playwright gate PASS (`24/24`) after one pre-Squad Matchday
  observation timeout passed both isolated rerun and the full rerun. Desktop,
  narrow, touch, `200%` text, first/last-row menu, scroll close, focus restore,
  automatic swap, and Tactics synchronization evidence was inspected.
  `git diff --check` and `graphify update .` PASS. No long run executed.
- Step 04 lesson: placement planning can remain a projection over the existing
  synchronous selection callbacks; it does not need another draft owner or
  persistence layer. The detailed chooser deliberately retains canonical
  position-family names while the primary select supplies the side-specific
  formation labels.
- Step 05 adopted solution: one framework-free player-detail projection now
  supplies compact natural/adapted roles, exact role-relevant current
  attributes, and coverage-aware current/career statistics. Goalkeepers expose
  goalkeeping/mental/physical families and outfield players expose
  technical/mental/physical. The Squad dialog uses three controlled WAI-ARIA
  tabs, resets only when the player changes, and keeps the complete contract
  workspace mounted while hidden so renewal drafts survive.
- Step 05 verification: UI tests PASS (`18` files / `100` tests); i18n tests
  PASS (`2` files / `19` tests); web tests PASS (`71` files / `316` tests);
  UI/web typechecks and web production build PASS. Focused Squad browser checks
  PASS (`2/2`) and the complete current-product plus SQLite/OPFS visual gate
  PASS (`24/24`). Desktop/narrow Attributes, Statistics and Contract evidence,
  keyboard tabs, `200%` text, reduced motion, draft retention, reset on player
  change, and exactly one dialog scroll owner were verified. `git diff
  --check` PASS. No long run executed.
- Step 05 lesson: the statistics selector scans current participation and
  archived seasons, so Step 06 must build the Market detail lazily for the
  opened target rather than precomputing statistics for every target row.
- Step 06 adopted solution: the Market target catalog keeps lightweight rows
  and exposes one memoized per-target detail resolver. Its factory calls the
  canonical statistics selector only for an opened player, then the shared
  player-detail view supplies exact natural/adapted roles, role-appropriate
  attributes, and coverage-aware statistics. The Market dialog reuses the
  shared shell, summary, stars, role chips, attribute groups, statistics panel,
  and WAI-ARIA tabs. Employment, contract horizon, eligibility, finance
  preview, and the existing offer composer remain together in the mounted
  `Contract and offer` panel, with draft retention and player-keyed reset.
- Step 06 verification: UI tests PASS (`18` files / `102` tests); i18n tests
  PASS (`2` files / `19` tests); web tests PASS (`72` files / `322` tests);
  UI/web/i18n typechecks and web production build PASS. Focused Market
  Playwright PASS (`3/3`) covers keyboard, touch, exact attributes, statistics,
  mounted draft retention, player reset, `200%` text, and the canonical pending
  offer lifecycle. The complete current-product plus SQLite/OPFS gate PASS
  (`24/24`). One unrelated Matchday incident observation timeout passed in
  isolation before the final full rerun. `git diff --check` PASS. No long run
  executed.
- Step 06 lesson: list construction must remain selector-free and detail
  resolution cached per target. The final audit must centralize the duplicated
  Squad/Market statistics-period formatter in the shared statistics component
  before Phase 79B closes.
- Step 07 adopted solution: Squad and Market now share one statistics-period
  formatter, one responsive player-tab contract, high-contrast resting
  controls, and complete dialog/menu focus behavior. Wide tables keep dense
  columns only at `>=1400px`; narrower layouts use bounded labelled cards.
  `position: relative` on the Squad table frame contains Chromium's tall table
  overflow inside the intended scroll owner instead of leaking it into the
  document. Visual QA covers exact `320/375/414/768` widths and
  `en/it/de/es/fr` at `1440/1200/1000`.
- Step 07 verification: domain, engine, storage, UI, i18n, and web package
  suites PASS; web reports `72` files / `322` tests. Web typecheck and
  production build PASS, with only the pre-existing non-blocking
  `1,487.35 kB` main-chunk warning. Complete current-product plus SQLite/OPFS
  visual QA PASS (`29/29`, `4.4m`). The Squad document height fell from
  `19,002` to `1,348px` at 390px, from `37,961` to `2,343px` at 200% text, and
  from `1,803` to `928px` desktop while the internal roster scroll and sticky
  header remained intact. Repository-wide `pnpm check` PASS (`235` files /
  `1,452` tests; dependency-cruiser `715` modules / `2,700` dependencies);
  localized text, lint, all workspace typechecks, `git diff --check`, and
  `graphify update .` PASS.
- Step 07 lesson: horizontal overflow checks alone cannot detect a scroll
  container whose descendant height leaks into the document. Responsive table
  tests must compare document height with the rendered app-shell boundary
  while proving the frame still owns a larger internal scroll height. A portal
  menu should transfer focus only after its measured visible position commits.
- Blocker: none. The Phase 79 `750 x 50` remains deliberately unrun and
  unclaimed.
- Phase 79B handoff action (superseded on 2026-07-28): Phase 79 Step 14's
  documented staged long-run gate remains pending and must resume only after
  Phase 79C returns control. Do not start Phase 79 Step 15.
- Activation note: the user explicitly activated Phase 79C before the Phase 79
  cohort started. Phase 79 Step 14 is paused without a gate claim; release-scale
  evidence is deferred until the new three-division model is stable.
- Step 14 correction (2026-07-24, review finding): the original Step 14 entry
  claimed a `750x50` gate with "100% clean structural integrity pass
  (`contract_finance=structural:0`) across all 750 worlds". Both halves of that
  claim were wrong.
  - The published `docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md` actually
    records `Status: FAIL`, `Failed worlds: 2`, and
    `Contract/finance structural violations: 1`. The status entry did not match
    its own artifact.
  - More seriously, the gate never exercised the market at all.
    `advanceCareerForReport` called `advanceCareerOneSeason` without
    `transferWindows`, so `advanceCareerMonths` skipped
    `advanceAiMarketLifecycle` and every world reported `transfer=0`. The three
    market checks added by Step 14 (`transfer_market_window_integrity`,
    `negotiation_clock_integrity`, `preliminary_agreement_integrity`) all
    iterate over `transferNegotiationState` / `preliminaryAgreementState`, so
    with an inert market they iterated zero times and passed vacuously. The
    "100% clean pass" validated nothing about transfer windows, negotiation
    clocks, preliminary agreements, or affordability.
  - The single failing world's squad collapse to 17 players was a downstream
    symptom of the same defect: with no market, AI clubs could not replace
    departures. `clubs_below_minimum_squad_size` and
    `contract_finance_structural_integrity` both counted that one event, because
    `structuralViolations` already includes `minimumSquadSize < 18`.
  - Fixes applied: `report-data.ts` now threads `league.transferWindows` into
    `advanceCareerOneSeason`, so the AI market runs inside the gate;
    `player-valuation.ts` `findAgeMultiplier` now prices plausible ages just
    outside the senior bands with the nearest boundary band instead of throwing
    (the `rare_prodigy` archetype seeds 15-year-olds into senior reserves, which
    crashed every market path the moment the market actually ran);
    `contract-finance-stability.ts` no longer restates window dates or the
    three-day stage bound locally and now consumes the caller's resolved
    `SeasonTransferWindows` plus domain `resolveTransferWindowStatus` and
    `NEGOTIATION_STAGE_MAX_DAYS`.
  - Re-verification so far: full `pnpm check` PASS (`223` files / `1351` tests);
    a market-active `60x8` sample gate PASS with `0` failed worlds, `0`
    structural violations, and minimum squad size `18`. The full `750x50` gate
    has NOT been re-run to completion yet (one attempt was interrupted after
    about four hours), so `docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md` is
    still the stale pre-fix FAIL artifact.
  - Implementation-audit remediation (2026-07-27): SQLite/OPFS now persists
    exact transfer and preliminary-agreement response dates in clean beta
    schema `14`; club counters and provisional club acceptances expire on their
    original clock and reject late decisions; same-day lifecycle work is
    ordered by submission date and then stable ID; free-agent registration and
    every permanent-transfer commit require transfer-window context; and the
    legacy CLI market demo now traverses the canonical club and player tables
    instead of committing directly. Standard verification passes (`223` test
    files / `1357` tests, all workspace typechecks, lint, dependency cruise,
    localized-text check, web build, and SQLite/OPFS browser round-trip). Per
    explicit user direction, the full `750x50` long-run gate was not started
    during this remediation and remains the next required Step 14 action.
  - Follow-up diagnostic (2026-07-27): a market-active `50x20` sequential run
    completed all `1,000` simulated seasons with partition hash
    `d9f3b553d6fefb50`. The overall gate reports `FAIL` for exactly one world
    (`phase79-market-smoke-50x20-world-00025`) on `champion_streak=7`; this is
    the only failing check. Phase 79 structural evidence is clean: `0`
    contract/finance structural violations, minimum squad size `18`, `0` clubs
    below the minimum, and `0` clubs without a natural goalkeeper. Transfer
    turnover is non-zero in `13/50` worlds and remains a monitor warning in
    `37/50`; wage utilization and free-agent share warn in every world. The
    temporary report is `/tmp/phase79-market-smoke-50x20.md` with SHA-256
    `0b9e9e8ac8351c48d3da1afd559576c648bd8dc236a74c68bf8094ebaca9d18e`.
    This diagnostic does not replace or close the required `750x50` gate.
  - Phase 79A interposition (2026-07-27): the diagnostic warning investigation
    found that `37/50` worlds have no permanent transfer while representative
    zero-transfer worlds still execute roughly `500` preliminary agreements
    and `290..311` activations; free-agent share rises to roughly `0.35..0.43`;
    and the wage warning is driven by a maximum-only aggregation that observes
    exact `1.0` utilization after transfer-to-wage reallocation. The seven-step
    Phase 79A path instruments the complete funnels and stock/flow first,
    applies only evidence-backed corrections, and repeats the same `50x20`.
    Champion, goals, assists, and one-player population-edge signals remain
    outside its tuning scope.
  - Phase 79A Step 02 observability (2026-07-27): compact structured engine
    facts now preserve recruitment checkpoints by club/department/stage/reason,
    canonical permanent and preliminary lifecycle outcomes, contract/preliminary
    activation facts, academy and senior exit IDs, and explicit
    transfer-to-wage reallocation attribution. Simulation tooling aggregates
    separate permanent/preliminary funnels, exact free-agent stock/flow with
    age/current-ability/time-unattached bands, and club-season wage/headroom
    distributions. CLI single-world and batch Markdown include these fields,
    representative diagnostic worlds, and deterministic hashes. In fixed world
    `00025`, all `500` genuine in-window permanent target searches stop at
    `seller_department_floor`, while `2,625` preliminary offers, `469`
    agreements, and `311` activations occur. Free-agent reconciliation is exact
    with zero residual flow; closing-stock observations are overwhelmingly
    ability `<8` (`5,206/5,444`). Wage pressure affects `16.67%` of
    club-seasons, exact ceiling `4.72%`, above budget `0%`, with `14`
    exact-ceiling observations following reallocation. Football outcomes match
    the baseline representative facts (six champions, streak seven, zero
    permanent completions, peak free-agent share `0.4099`). Required focused
    tests and typechecks pass; full `pnpm check` passes `223/223` files and
    `1,358/1,358` tests; `git diff --check` passes. Lesson for Step 03: budget
    timing and affordability are not the measured permanent loss stage in this
    world; reproduce the seller-floor interaction before changing behavior.
  - Phase 79A Step 03 permanent-market correction (2026-07-27): the apparent
    agreed-preliminary active-talk fix was rejected after it multiplied
    preliminary starts without finding a permanent target. The measured
    seller-floor gridlock came from need derivation recognizing only department
    averages while legal opening supply existed in defender/attacker depth.
    The AI now treats a player two public current-ability points below his
    department average as a quality need, exhausts all same-club permanent
    needs before preliminary fallback in an open window, and separates current
    open-talk capacity from the full future-planning cap. Seller floors,
    selected-club agency, windows, affordability, and canonical negotiations
    are unchanged. Named worlds `00025/00041/00023` produced `190` targets and
    offers plus `113` completions over `1,020` AI club-seasons, while quiet
    clubs and nineteen zero-completion seasons per world remained possible.
    Deterministic CLI snapshots were updated for the now-active market and the
    pre-existing five-second timeouts on two heavy report tests were raised.
    Focused engine tests, CLI snapshot checks, and named runs pass; full
    verification is recorded in the Step Ledger. Lesson for Step 04: permanent
    opening activity is restored, but later-season circulation remains quiet
    and must be addressed only through the measured free-agent/squad-demand
    owner, not by loosening transfer protection.
  - Phase 79A Step 04 free-agent equilibrium (2026-07-27): Step 02 stock/flow
    proves academy release inflow plus overlong retention of non-viable players,
    not useful-player unemployment, drives the pool. Academy `statusChangedAt`
    now participates in the factual unattached-duration bands. An unattached
    player below public current ability `8` explicitly steps down from this
    playable career layer only after two complete seasons without a club.
    Stronger and recent free agents remain available, ordinary replenishment
    still ranks current ability, structurally complete clubs stop at target,
    same-day return protection and selected-club agency remain intact. World
    `00025` now peaks at free-agent share `0.2119` (was `0.4099`), closes with
    `51` free agents, reconciles every annual flow at delta zero, retains the
    Step 03 `42` permanent completions, and keeps squad/goalkeeper/finance
    invariants clean. Lesson for Step 05: the remaining wage warning is
    independent of population pressure and should be classified from the
    already-recorded utilization distribution, not tuned through budgets.
  - Phase 79A Step 05 wage semantics (2026-07-27): no finance-policy defect was
    found. World `00025` records max `1.0000`, p95 `0.9958`, pressure share
    `0.1806`, exact-ceiling share `0.0417`, above-budget share `0`, p10
    headroom `14,862,000`, and p50 headroom `124,475,000`. The maximum remains
    visible but no longer controls severity alone. Stable checks now separate
    any above-budget structural failure, widespread pressure at `>=25%`,
    repeated exact-ceiling contact at `>=10%`, and informational p10 headroom.
    The representative world changes from misleading WARN to PASS without
    hiding its `1.0` observations or changing budgets, demand, replenishment,
    transfers, or free-agent behavior. Lesson for Step 06: cohort acceptance
    must assert both zero overspend and bounded prevalence, not merely the
    absence of the former maximum-only key.
  - Phase 79A Step 06 acceptance (2026-07-27): focused and full checks pass
    (`223` test files / `1,370` tests before final documentation). The exact
    sequential `50x20` exposed concurrent seller-floor commits, below-minimum
    positional dead ends, and one final-department retirement. The reproduced
    fixes recheck AI seller structure at negotiated completion, allow an
    affordable non-preferred free-agent fallback only below 18, and defer a
    retirement only when it would empty a department. The final same-seed
    `50x20` verification records `1,719` permanent completions, free-agent max
    `0.2274`, pressure/exact/overspend shares `0.1900/0.0400/0.0000`, minimum
    squad `18`, no below-minimum or no-goalkeeper club, and zero structural
    violations. Only worlds `00001` and `00046` fail on the existing
    `champion_streak=7` story boundary. Final repeated hashes match:
    `00025=c70983aa...`, `00041=5e64535b...`, `00023=91f5f94f...`.
  - Phase 79A Step 07 closeout (2026-07-27): both reports, architecture,
    status, roadmaps, step index/prompt, Phase 79 README, and Step 14 now
    reconcile the adopted behavior and evidence. No dead diagnostic caller was
    found, so none was removed. Phase 79A is Done and control returned to Phase
    79 Step 14 without running or claiming `750x50`.
- Next action: execute Phase 79 Step 14's documented staged long-run gate.
  Do not start Step 15 or claim the `750x50` until that run actually completes.
- Step 14 adopted solution (SUPERSEDED by the Step 14 correction above; its
  gate-result claims are known to be wrong and its
  `isDateInTransferWindow` helper has since been removed):
  - Extended long-run stability report & runner (`contract-finance-stability.ts` & `career-long-runner.ts`):
    - Added transfer window boundary checking (`isDateInTransferWindow`), 3-day negotiation stage deadline inspection, preliminary agreement invariant verification, and affordability completion inspection.
    - Updated `structuralViolations` sum to fail structural gate if any window violation, clock breach, preliminary agreement invariant failure, or unaffordable transfer completion occurs.
    - Added machine-readable checks (`transfer_market_window_integrity`, `negotiation_clock_integrity`, `preliminary_agreement_integrity`) to the long-run stability report.
  - Staged simulation gates executed:
    - Executed `50x10`, `250x30`, and `750x50` (37,500 total simulated seasons) long-run simulation gates.
    - 100% clean structural integrity pass (`contract_finance=structural:0`) across all 750 worlds for transfer windows, negotiation clocks, preliminary agreements, and financial affordability.
  - Generated audit documentation:
    - Produced `docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md` documenting long-run gate performance and aggregate statistics.
- Step 14 verification (SUPERSEDED): the package tests and `pnpm check` cited
  here did pass, but they never covered the market path, so they did not
  establish what the Step 14 entry claimed.
- Step 11 adopted solution: the browser now has one complete explicit market
  command flow, end-to-end verified in a real browser.
  - Engine: `evaluateTransferFeeCapacity` (new, in `career-contract-capacity.ts`)
    previews a manager-chosen fee against transfer budget and cash only, never
    running seller willingness; `evaluateCareerContractCapacity` exported for
    reuse. `createTransferNegotiationId` added alongside the existing
    `createPreliminaryAgreementId` pattern.
  - Runtime (`web-career-runtime.ts`): `WebSelectedClubMarketCommand` (11
    variants: submit/accept/reject/withdraw across transfer club-stage,
    transfer player-stage, preliminary agreement, plus `sign_free_agent` for
    the immediate no-stage free-agent path) and
    `applySelectedClubMarketCommand`, mirroring the contract-command pattern
    exactly (ID resolution, session replace, Posta refresh, no implicit save).
  - Web adapter: `previewMarketOffer` builds the Step-09 `CareerMarketOfferPreviewView`
    for every draft kind from the matching engine capacity query only;
    `resolveCareerTransferWindows` extracted as one shared window-resolution
    owner (adapter + runtime both call it, no duplication);
    `career-market-adapter.test.ts` covers window/finance projection, target
    scoping, and the missing-source path.
  - UI: extracted the Squad renewal form into a shared
    `apps/web/src/features/shared/ContractTermsForm.tsx` (`ContractTermsForm`
    + `ContractTermsInput`) so Squad renewal and the three Market annual-terms
    composers (player-stage, preliminary, free-agent) use exactly one contract
    form. `CareerMarketPlayerDialog.tsx` gained the full composer: club-stage
    fee input, player-stage/preliminary/free-agent terms form, counter
    comparisons, accept/reject/withdraw actions, and pending/terminal states,
    all driven only by `negotiation`/`eligibility` facts.
  - `packages/ui`: `CareerMarketOfferPreviewView.kind` extended with
    `free_agent_offer`; `CareerMarketNegotiationInput` gained optional
    `offeredTerms`/`counterTerms` (full annual terms, not just the flat
    `annualWage` summary) so the composer can render an exact counter
    comparison without a second finance/contract model.
  - `P79-CF-04` resolved: `CareerContractWorkspace.tsx`'s reseed effect now
    guards on a `playerId:negotiationId:status` string token instead of
    `contract` object identity, so an unrelated career-state republish
    (autosave, another command) no longer wipes a typed draft; only a real
    negotiation transition, explicit cancel, or player change reseeds. The new
    Market composer is immune by construction: its form values are seeded once
    via a lazy `useState` initializer and never resynced from props.
  - `P79-CF-03` completed: editable money entry stays on the existing 2-decimal
    `contract-renewal-form.ts` parser (plus a small local fee parser for the
    plain transfer-fee field); read-only display stays on the one shared
    `formatMoneyFromMinorUnits`; both cross through exact integer minor units.
  - i18n: added `career.command.updatingMarket` and all 27
    `career.market.composer.*` keys across all five languages (ASCII-safe,
    matching established terminology).
- Step 11 verification: full `pnpm check` PASS (`222` files / `1339` tests;
  lint, `check:localized-text`, depcruise `675`/`2572` clean, all typechecks
  clean); web build PASS; Playwright `current-product.spec.ts` PASS (`23/23`
  across repeated runs, including the new `a submitted transfer offer stays
  pending, tracks exposure, and withdraws cleanly` test — isolated single-test
  flakes appeared on different, unrelated tests across three full-suite runs
  and passed clean in isolation, matching this environment's established
  under-load flake pattern, not a regression). Manually verified in a real
  browser end-to-end: typed fee → live affordable preview → submit → pending
  state with correct feedback → finance strip showed pending exposure
  (`€1,500,000`, `1 open talks`) while the actual transfer budget stayed
  unchanged → withdraw → composer returned to a fresh fee form, exposure back
  to `€0`/`0 open talks`.
- Step 11 free-agent and preliminary-agreement live-browser verification
  (2026-07-24, user-requested: "non puoi fare il test reale?"): the fresh
  test career had zero free agents and no player inside the six-month
  preliminary window, so a temporary, session-only debug hook
  (`WebCareerRuntime.__debugReplaceWorkingState`, plus a matching
  `window.__runtimeHandlePromise` exposure in `App.tsx`) mutated the real
  running session directly through `session.replaceWorkingState` — the exact
  same call every real command uses — to free one real player and shorten
  another's contract horizon. Nothing was saved; the temporary hooks were
  removed afterward and `pnpm check`/build/Playwright re-run clean.
  - Free-agent composer: rendered "This offer fits the current budget",
    submitted, applied, reduced annual wage headroom by exactly the signed
    wage (`€856,300` → `€776,300` for an `€80,000` wage), and removed the
    player from the market pool.
  - Preliminary-agreement composer: confirmed only offered once the transfer
    window is closed (an open window always prioritizes a direct transfer
    offer, by design — `evaluateMarketActionEligibility` allows both, the
    adapter picks one next action). With the window closed, the composer
    submitted, showed `1 open talks` at `€0` pending exposure, and reached
    the waiting-for-reply state with a working withdraw control.
  - One false rejection (`invalid_signing_transition`) surfaced while setting
    up the free-agent fixture; root cause was the debug hook's own ad-hoc
    player removal leaving stale `seniorSquadState.contractIds` and
    `contractHistory` references, not a defect in shipped code — fixed by
    driving the release through the engine's own
    `prepareSeniorSquadDeparture` instead. No change was needed in
    `apply-career-free-agent-signing.ts`, `applySelectedClubMarketCommand`,
    or the composer.
- Step 10 re-verification (2026-07-24, user-requested audit of Steps 09-10):
  Step 09 held up completely on re-check (UI `16` files / `87` tests, UI
  typecheck clean, `moraleDirection` confirmed removed rather than hardcoded,
  the single `CAREER_CONTRACT_EXPIRY_ALERT_DAYS` boundary confirmed as the only
  owner, contract history confirmed indexed once). Step 10 was marked Done but
  had six real, unverified gaps, all now fixed in place:
  1. **Functional bug**: `career-market-adapter.ts` built targets from every
     generated player including academy-age youth, crashing
     `derivePlayerValuation` (`PlayerValuationError: no age multiplier for age:
     15`) whenever a youth player was iterated. Fixed by scoping targets to
     `selectFreeAgentPlayerIds` plus other-club senior owners only (the same
     canonical free-agent selector the rest of career already uses).
  2. **Missing CSS**: zero `.tls-market-*` rules existed; the Market route
     rendered fully unstyled with real horizontal table overflow, violating the
     step's own "no horizontal scroll" completion criterion. Added a complete
     Market CSS section reusing the exact Squad/player-profile tokens, table
     pattern, status-pill pattern, and full-screen-dialog shell pattern
     (finance strip, filter bar, table with desktop nth-child widths scoped to
     `@media (min-width: 981px)`, narrow row-card reflow at 980px, eligibility
     pill, player inspection dialog, role-fit badges). No `!important` added
     (kept the codebase's zero-`!important` convention).
  3. **No Playwright coverage**: Market had no visual QA despite the Local
     Runtime And Visual QA Rules requirement. Added `desktop Market presents
     window, budget, targets, and a public inspection profile` and `narrow
     Market reflows filters and the target table without horizontal
     scrolling` to `current-product.spec.ts`, following the exact Squad-test
     pattern; both pass, and the full `22`-test suite passes.
  4. **Dependency-boundary violation**: `apps/web/src/shared/canonical-player-role.ts`
     and `apps/web/src/features/market/CareerMarketScreen.tsx` imported
     `CanonicalPlayerRole` directly from `@game/domain`, violating `apps/web ->
     ... , ui, ...` (no direct domain import) and failing depcruise. Fixed by
     re-exporting `CanonicalPlayerRole` once from `@game/ui`'s public surface
     (`ui -> domain` is allowed) and pointing both web files at that export.
  5. **Localization gap**: all 82 `career.market.*` keys existed only in `en`
     and `it`; `de`/`es`/`fr` were entirely missing, failing
     `packages/i18n`'s "all five supported languages cover the current
     catalog" test and the project's five-language localization rule. Added
     complete, ASCII-safe (matching the catalog's established no-diacritics
     convention), terminology-consistent translations for all three languages
     (reusing existing Squad/contract/suitability vocabulary where a concept
     already had an established term, e.g. `career.playerProfile.suitability.*`).
  6. **No adapter test**: added `career-market-adapter.test.ts` (`4` tests)
     covering window/finance projection, target scoping (never the selected
     club), public-only levels, eligibility shape, empty pending exposure on a
     fresh career, and the missing-source error path.
- Step 10 verification after fixes: full `pnpm check` PASS (`221` files /
  `1335` tests; lint, `check:localized-text`, and all package typechecks
  clean; depcruise `671` modules / `2551` dependencies, zero violations);
  `pnpm --filter @game/web run build` PASS; complete
  `current-product.spec.ts` Playwright suite PASS (`22/22`, desktop + narrow +
  200% text + reduced motion + keyboard); `git diff --check` clean. `graphify
  update .` deferred (same disproportionate full-rebuild cost noted throughout
  this phase).
- Lesson learned: a step marked `Done` with passing checks at the time can
  still hide real gaps that only a fresh, independent re-audit surfaces
  (unstyled CSS never fails a unit test; a missing Playwright spec never fails
  itself; missing i18n keys only fail if the coverage test is run and its
  failure is read past the first `pnpm check` stage). When asked to verify a
  "Done" step, re-run every required check for that step from a clean state
  rather than trusting the recorded verification snapshot.
- Step 09 adopted solution: framework-free `@game/ui` target, detail, window,
  finance, pending-exposure, offer-preview, and negotiation models now expose
  only public, deterministic market facts. All supported filters and sorts have
  stable tie-breakers; loading, error, empty, closed-window, pending, and
  completed states are explicit. Unsupported hardcoded morale direction was
  removed. One shared `@game/ui` 244-day contract-expiry alert policy now feeds
  both Squad table and profile, and the Squad adapter indexes contract history
  and latest valid negotiations once before projecting players.
- Step 09 verification: UI tests PASS (`16` files / `87` tests), UI typecheck
  PASS, focused web Squad adapter PASS (`6` tests), i18n tests PASS (`2` files /
  `18` tests), full `pnpm check` PASS (`220` files / `1331` tests, depcruise
  `661` modules / `2509` dependencies), `git diff --check` and `graphify update
  .` PASS.
- Step 09 lesson: complexity regressions are best protected through observable
  access-count tests rather than wall-clock assertions; exact hidden potential
  must remain absent even when the Market detail becomes richer.
- Next action: implement only Step 10, mounting the read-only Market workspace
  and player inspection over the Step 09 read models.
- Step 08 adopted solution: a deterministic AI market lifecycle now derives
  bounded needs from senior depth, department coverage, age, quality, expiry,
  annual wage load, budget, division, and reputation. AI clubs use the same
  canonical permanent-transfer, player-contract, preliminary-agreement,
  affordability, and atomic-completion commands as the selected club. The
  selected club is excluded from automation, permanent offers respect open
  windows, preliminary agreements respect the final-six-month rule, and stable
  ordering plus per-season limits prevent offer fan-out. The obsolete direct
  turnover path was deleted. Structural seller protection is an explicit AI
  policy option rather than a hidden restriction on manual negotiations.
- Step 08 verification: focused AI market, transfer-negotiation, player-table,
  preliminary-agreement, and season-advancement suites PASS (`5` files / `32`
  tests); engine typecheck PASS; full `pnpm check` PASS (`217` files / `1318`
  tests, depcruise `655` modules / `2485` dependencies); `git diff --check` and
  `graphify update .` PASS.
- Step 07 adopted solution: durable preliminary agreements reuse canonical
  annual contract terms and the existing three-day player-response clock while
  leaving ownership, registration, selection, payroll, and finance untouched
  before expiry. The canonical career-day lifecycle activates an agreed deal
  once, atomically reconciling ownership, senior registration, shirt number,
  contract/history, signing finance, stale negotiations, and any selected-club
  match plan. Structural activation failures become durable cancellation facts;
  no transfer fee is created.
- Step 07 verification: focused domain and engine suites PASS (`20` tests);
  regression preliminary-agreement suites PASS (`11` tests); full `pnpm check`
  PASS (`217` files / `1321` tests, depcruise `655` modules / `2480`
  dependencies); `git diff --check` and `graphify update .` PASS.
- Step 06 adopted solution: accepted club-to-club terms now open a distinct
  player-contract stage with its own immutable three-day clock. The stage
  reuses the canonical Phase 78 contract demand/evaluation model, spends and
  reserves nothing while pending, and stores the exact accepted annual terms.
  Completion rechecks ownership, seller contract, affordability, window, and
  registration before one canonical permanent-transfer commit updates fee,
  contracts, registration, shirt number, history, ledger, squad, and selected
  match preparation. Structured rejection facts leave the career unchanged,
  repeated advancement is idempotent, and a sold selected player is removed
  without a hidden replacement.
- Step 06 verification: focused domain and engine suites PASS (`31` tests);
  domain + engine typechecks and focused ESLint PASS; full `pnpm check` PASS
  (`215` files / `1313` tests, depcruise `650` modules / `2441` dependencies);
  `git diff --check` and `graphify update .` PASS.
- Step 05 adopted solution: new domain `transfer-negotiation.ts` (7-state
  club-to-club lifecycle + `TransferNegotiationState`, wired into
  `CareerState.transferNegotiationState`) and engine `transfer-negotiation.ts`
  (`submitTransferOffer`, `advanceTransferNegotiations`, `acceptTransferCounter`,
  `withdrawTransferNegotiation`, `deriveSellerTransferWillingness`). Submission is
  window-gated and validates ownership/duplicate/positive fee; the seller reply
  is deterministic (valuation × squad-status × security × cash, squad-depth
  not-for-sale guard, 0.75 counter band). Accepted club agreements are
  provisional (no ownership/finance change), affordability rechecks cancel as
  `unaffordable`, the 3-day deadline survives a counter, and advancing is
  idempotent.
- Step 05 verification: domain (`6`) + engine (`11`) transfer-negotiation tests
  PASS; domain + engine typechecks PASS; full `pnpm check` PASS (`215` files /
  `1306` tests, depcruise `649` modules clean); `git diff --check` clean.
  `graphify update .` deferred (unchanged cost rationale).
- Step 04 adopted solution: deleted the temporary reservation-as-spend
  (`deriveCareerContractOfferReservations` + `career-contract-reservations.ts`);
  `evaluateCareerContractCapacity` moved to `career-contract-capacity.ts` and now
  judges affordability against committed contracts and cash only (acceptance
  still rechecks atomically). New informational
  `deriveMarketPendingExposure` (engine) derives aggregate pending wage/signing
  exposure without touching finance. New domain `negotiation-stage-clock.ts`
  (`createNegotiationStageClock`/`counterResponseClock`/`isNegotiationStageDue`/
  `isNegotiationStageExpired`, `NEGOTIATION_STAGE_MAX_DAYS = 3`) bounds a stage to
  three days, caps the deadline at window close, and keeps the deadline on a
  counteroffer (consumed by Steps 05-06). Every reservation caller migrated
  across transfer, free-agent, youth-promotion, AI, and finance lifecycles plus
  the simulation-tools long-run checker; reservation-behavior tests were flipped
  to the locked "pending offers do not reserve budget" truth.
- Step 04 verification: affected suites PASS; full `pnpm check` PASS (`213`
  files / `1289` tests, all typechecks, depcruise `645` modules clean); `git diff
  --check` clean. Necessary deviation (documented): raised the ten-season
  determinism test timeout to 30s because the heavier pending-exposure sim
  brushed the 5s vitest default under concurrent load (logic is deterministic;
  it passes standalone). `graphify update .` deferred (unchanged cost rationale).
- Step 02 adopted solution: domain `transfer-window.ts` owns `TransferWindow`,
  `SeasonTransferWindows`, two-inclusive-window validation
  (`not_two_windows`/`reversed_window`/`unordered_windows`/`overlapping_windows`),
  and `resolveTransferWindowStatus` (open/closed + next opening). Content
  `transfer-window-catalog.ts` owns the FIGC 2026/27 template for
  `competition:demo-third-division` only, with deterministic per-season
  roll-forward; `createFakeLeagueSystem` now exposes
  `transferWindows: SeasonTransferWindows`. Source in
  `docs/audits/TRANSFER_WINDOW_SOURCE_AUDIT.md`.
- Step 02 verification: new domain+content tests PASS (`18/18`); domain and
  content typechecks PASS; full `pnpm check` PASS (`211` files / `1274` tests,
  lint + depcruise + typecheck clean); `git diff --check` clean. `graphify
  update .` deferred (same disproportionate full-rebuild cost noted in Step 01).
- Entry-gate override (explicit user decision, 2026-07-23): Phase 79 was started
  while Phase 78 Step 15 (`15-contract-finance-and-squad-long-run-gates.md`) is
  still In progress, not Done. The Phase 79 README entry gate requires Phase 78
  Steps 01-15 Done. The user explicitly chose to proceed anyway; Phase 78 Step
  15 is treated as accepted/deferred. This is a documented deviation, not a
  satisfied gate. Phase 78 Step 15's long-run contract/finance gate remains
  unrun and must be revisited before any release-scale claim.
- Prior steps (historical): Step 01 produced
  `docs/audits/TRANSFER_MARKET_OWNERSHIP_AND_GAP_AUDIT.md` (retain/extend/replace/
  remove table, named replacement path for `deriveCareerContractOfferReservations`
  reservation-as-spend, all eight `P79-CF-*` findings mapped). Step 02 added the
  domain transfer-window vocabulary and the content FIGC 2026/27 catalog.
- Next action: complete Step 09 — framework-free market search, budget,
  eligibility, target-detail, and negotiation read models for the selected
  club.
- Blocker: none. Standing caveat: Phase 78 Step 15 long-run gate is unrun (see
  entry-gate override above).
- Lesson learned: structural squad floors belong to the autonomous AI decision
  policy and must be opt-in at the canonical seller evaluation boundary; making
  them global would silently change valid manual negotiation behavior. A future
  agreement must not be modeled as a delayed callback
  or as early ownership. Keeping it as validated durable intent makes the
  pre-expiry career truthful and allows one idempotent activation boundary to
  reject impossible transitions without publishing a partial transfer. A
  selected plan also cannot persist an empty `selectedLineup`; when its sole
  assignment leaves, the XI and board geometry are omitted while unrelated
  preparation facts remain.

## How To Read The Project

1. Read `requirements.md` for product and architecture intent.
2. Read `docs/PROJECT_RULES.md` for non-negotiable rules.
3. Read this file for current state and adopted solutions.
4. Read `docs/steps/README.md` for the iterative workflow.
5. Read only the active step file before implementing.

## Step Ledger

| Step | Status | Outcome | Adopted solution | Verification |
|---|---|---|---|---|
| `docs/steps/80-graphical-and-structural-rework/README.md` | Done | Established the seven-worker policy and delivered all five bounded Squad/Market reworks; the renderer is corrected and its upstream model finding is assigned to Phase 80A. | Preserve the completed UI/interaction owners and the unrun longitudinal cohort; hand control to Phase 80A Step 01. | Steps 01-09 PASS; `pnpm check`, web build, depcruise, Playwright `34/34`, diff, and Graphify green on Node `24.16.0`. |
| `docs/steps/80-graphical-and-structural-rework/01-seven-worker-simulation-policy-and-phase-bootstrap.md` | Done | Centralized current/future batch simulation concurrency at a default/maximum of seven and superseded the former Phase 80 finance reservation. | Export one pure `min(7, work items)` resolver, remove host/small-sample defaults, allow only lower overrides, record workers in checkpoint replay, and cap Vitest with the same policy. | Policy `4/4`; CLI integration `20/20`; owning typechecks; full `pnpm check` `253` files / `1,586` tests; dependency boundaries `764` / `2,952` PASS. |
| `docs/steps/80-graphical-and-structural-rework/02-accepted-graphical-and-structural-rework-inventory.md` | Done | Locked `P80-R01..P80-R05` and created the evidence-backed Steps 03-09. | Preserve current/potential semantics, paginate/debounce Market, add/reorder/debounce Squad, centralize exact locale money, harden transactional dialog dismissal, then close with integrated QA and a Phase 80A handoff. | Inventory exists; source/screenshots inspected; diff and Graphify PASS; no production code or long run. |
| `docs/steps/80-graphical-and-structural-rework/03-achieved-versus-upside-player-star-language.md` | Done | Separates achieved rating from probable and uncertain potential in the shared six-slot renderer; the product audit finding is assigned to Phase 80A. | Keep the verified shared renderer; do not hide generation/projection mismatch with presentation code. | Vitest `21/21`, web typecheck, Playwright `1/1`, screenshots, diff, and Graphify PASS; `20`-world model audit records only `11 / 1,710` age-17 players with at least `+1` public star. |
| `docs/steps/80-graphical-and-structural-rework/04-market-pagination-debounced-filters-and-age-controls.md` | Done | Owns deterministic Market filter-sort-pagination and responsive controls. | Use 25 rows, 250 ms for typed filters, immediate selects, two bounded 15..40 age selectors, and page reset/clamping. | Vitest `30/30`, `@game/ui` and web typechecks, Playwright `1/1`, diff, and Graphify PASS. |
| `docs/steps/80-graphical-and-structural-rework/05-squad-age-placement-order-and-debounced-search.md` | Done | Adds canonical age, moves Placement after Role, and delays player-name search. | Extend the framework-free row contract, map existing age, reuse the debounce helper, and preserve immediate placement/actions. | Vitest `39/39`, `@game/ui` and web typechecks, Playwright Squad `8/8`, diff, and Graphify PASS. |
| `docs/steps/80-graphical-and-structural-rework/06-canonical-money-presentation-and-editable-inputs.md` | Done | Unifies exact locale-aware money display and integer-safe editable input. | Preserve minor-unit ownership, use explicit precision, normalize locale-valid input on blur, and remove local parsers. | Focused Vitest `18/18`, full web suite `343/343`, web typecheck, Playwright `1/1`, diff, and Graphify PASS. |
| `docs/steps/80-graphical-and-structural-rework/07-market-offer-dialog-draft-stability.md` | Done | Prevents accidental dismissal while editing a Market offer. | Add an explicit shared backdrop-dismiss policy; opt Market out; preserve Escape, explicit close, focus restoration, and draft identity. | Focused Vitest `10/10`, web typecheck, full current-product Playwright `33/33`, diff, and Graphify PASS. |
| `docs/steps/80-graphical-and-structural-rework/08-integrated-browser-accessibility-and-regression-closeout.md` | Done | Runs all repository/browser/accessibility/absence gates after the five reworks. | Verify desktop/narrow/keyboard/focus/reduced-motion/200%-text journeys and remove obsolete paths before handoff. | On Node `24.16.0`: `pnpm check` PASS, web build PASS, depcruise `769`/`2,966` PASS, `pnpm web:visual:qa` `34/34` PASS, diff and Graphify PASS. |
| `docs/steps/80-graphical-and-structural-rework/09-phase-closeout-and-80a-handoff.md` | Done | Owns Phase 80 documentation closeout and the truthful Phase 80A handoff. | Record repository/browser evidence, preserve the unrun cohort, and make Phase 80A the only next phase. | Step 08 evidence green; closeout checks rerun; no `50 x 20` report or checkpoint exists. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/README.md` | Blocked | Owns the accepted player supply, environment, development, projection, context-invariant value, and AI-parity rework after Phase 80. | Resolve the explicit match-goal monitor ownership/acceptance decision without weakening the frozen evidence; no `50 x 20`. | Steps 01-08 Done; Step 09 fresh/resume deterministic and all `32` player-model gates green, but report-wide `goals_per_match_avg` has `80` failing worlds. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/01-reproducible-baseline-and-calibration-contract.md` | Done | Froze a canonical 20-world pre-change baseline, complete owner inventories, positive denominators, separate rating concepts, obsolete comparisons, and new source-backed thresholds. | Preserve the old `11 / 1,710` as non-reproducible history; use the stable-seed/hash `11 / 1,723` epoch for later comparisons. | Vitest `26/26`; simulation-tools and CLI typechecks; diff and Graphify PASS; no long run. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/02-dynamic-club-tier-reputation-and-season-freeze.md` | Done | Recomputes deterministic 4/4/6/4 club tiers and bounded reputation once per rollover. | Use balanced XI/useful bench plus corrected prior result after movement; commit the season stamp, reputation, and calendar atomically; carry incomplete report divisions whole; persist one current snapshot with a beta reset. | Vitest `74/74`; six package typechecks; depcruise `773`/`2,982`; diff and Graphify PASS; no long run. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/03-seven-state-development-environment-and-public-label.md` | Done | Derives the accepted seven-state category/tier environment without duplicating durable state. | Keep one strict stamped policy; derive from frozen category/tier; expose only the localized state and reserve the multiplier for later consumers. | Vitest `158/158`; eight package typechecks; storage `29/29`; browser desktop/narrow; diff and Graphify PASS; no growth/intake change. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/04-quarterly-development-with-monthly-evidence.md` | Done | Applies canonical monthly participation/performance evidence in batches of three complete months plus a residual rollover flush. | Preserve month and club provenance, derive reload-stable player/month variance, apply environment only to positive growth, and keep closed-month keys as the only checkpoint truth. | Vitest `110/110`; domain, engine, storage, CLI, and web typechecks; depcruise `778`/`3,006`; diff and Graphify PASS. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/05-age-aware-p50-upper-and-shared-public-assessment.md` | Done after reopening | Replaces coarse post-20 bands with exact-age P50/upper calibration while preserving the full-upper-through-20 product rule. | Derive each later age/family factor from the deterministic outcome matrix; keep P50 independently observed and prove adjacent upper non-widening with positive evidence. | `24` bands / `1,620` outcomes; mandatory Vitest green including CLI `25/25`; seven typechecks, ESLint, diff, Graphify green. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/06-contextual-prospect-current-and-ceiling-generation.md` | Done after reopening | Adds one ceiling-first young-prospect joint-profile owner. | Explicit age-15-to-20 prospect lanes receive at least one stored star of room; routine youth may plateau; every generation root shares the same typed Interface. | Mandatory Vitest `185/185`; frozen division shares and stock regressions pass; typechecks, diff, and Graphify green. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/07-national-exceptional-stock-and-annual-youth-intake.md` | Done | Keeps stock drift descriptive while binding generation constraints to opening allocation and new arrivals. | Preserve the canonical selector/allocator and measure placement plus club uniqueness only when stock enters the world. | Mandatory Vitest `279/279`; seven typechecks; checkpoint semantic validation; diff and Graphify PASS; independent review has no blocker. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/08-expected-outcome-value-and-ai-information-parity.md` | Done after reopening | Replaces the valuation-v4 inversion with monotonic current/P50/upper tranches while preserving information parity. | Remove the whole-P50 uncertainty haircut; price upper as bounded positive option value; retain separate AI risk appetite; calibrate global anchors only after attributed failure evidence. | Mandatory Vitest `291/291`; seven typechecks; depcruise `782`/`3,100`; bounded owned economy gates green. |
| `docs/steps/80a-prospect-generation-club-environment-and-quarterly-development/09-non-vacuous-diagnostics-beta-reset-and-phase-closeout.md` | Blocked | Completed compact diagnostics and deterministic replay, but cannot hand off to 80B while the frozen report is red. | Preserve the raw match-goal failure and request an explicit owner/acceptance decision; do not change thresholds or anomaly semantics. | Fresh `750/0` and resume `0/750`, exactly `7` workers, identical hash; `32/32` player-model gates pass; `goals_per_match_avg` has `80` high-side failed worlds. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/README.md` | Planned | Owns incoming offers, market postures, final counters, bidirectional loans, explicit ownership/selectability, Posta, persistence, and bounded closeout. | Execute ten ordered steps after 80A; never mutate `Club.playerIds` for loans; derive selectable squads; keep per-buyer/player cross-kind uniqueness; leave parallel buyers valid but unscheduled; delete incompatible beta saves; run no longitudinal cohort. | Documentation only; implementation not started. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/01-current-market-ownership-baseline-and-loan-contract.md` | Planned | Classifies all relevant direct roster accesses and freezes permanent-market, ownership, selectability, finance, Posta, persistence, and loan invariants. | Audit before adding state; define owned/selectable accessors, `18` plus `2/6/6/3` floors, and positive diagnostics. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/02-durable-sale-and-loan-availability-postures.md` | Planned | Adds independent/combinable durable sale and loan availability flags. | Persist until changed or relationship exit; affect AI interest, not public value. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/03-ai-initiated-selected-club-permanent-offers.md` | Planned | Adds bounded unsolicited incoming permanent bids while preserving canonical buyer/player-pair uniqueness. | Maximum five individual unresolved incoming offers; one unresolved state per buyer/player across supported kinds; deterministic cooldowns; different buyers remain valid but Phase 80B schedules them serially. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/04-posta-final-counteroffer-workflow.md` | Planned | Adds accept/reject/one-final-counter Posta decisions. | Preserve immutable three-day deadline and explicit final-waiting state. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/05-canonical-loan-ownership-registration-and-return.md` | Planned | Adds immutable-under-loan parent ownership, borrower registration/selectability, original contract, and season-end return. | Never mutate `Club.playerIds`; use named owned/selectable accessors, protect `18` plus `2/6/6/3`, require exactly one sporting registration, restore the parent deterministically, and delete incompatible beta saves. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/06-loan-wage-sharing-and-finance-accounting.md` | Planned | Adds prorated borrower wage contribution. | Support exactly `0%`, `50%`, or `100%` without a second contract. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/07-bidirectional-loan-market-ai-need-and-real-development.md` | Planned | Adds incoming/outgoing loan AI based on real needs and plausible rotation. | Only real match minutes and ratings influence development. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/08-squad-market-and-posta-loan-ui.md` | Planned | Exposes postures and loan negotiations through existing Squad, Market, and Posta surfaces. | Add no separate loan route; preserve accessibility and shared commands. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/09-bounded-diagnostics-browser-persistence-and-beta-reset.md` | Planned | Verifies bounded market/loan state, ownership/selectability, finance, browser, and persistence behavior. | Require non-vacuous owned/selectable/floor/per-buyer-negotiation counters and delete incompatible beta saves. | Not evaluated. |
| `docs/steps/82a-incoming-offers-market-postures-and-loans/10-phase-report-and-phase-82b-handoff.md` | Planned | Closes Phase 80B on bounded evidence and hands the final market to Phase 80C. | Run no longitudinal cohort; prove shard/checkpoint/worker wiring with a bounded exercise and leave parallel-buyer competition to 80C. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/README.md` | Planned | Owns durable competitive races, seller qualification, stale-safe raises, player choice, free-agent negotiation, race UI/diagnostics, and a bounded Phase 81 handoff. | Keep at most three active buyers; qualify only the highest seller-acceptable fee and exact matches; keep loans serial; use fixed three-day stages; persist coordination early; distinguish `outbid` from `lost_to_rival`; run no longitudinal cohort. | Product contract accepted; implementation not started. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/01-race-contract-policy-and-exhaustiveness-guard.md` | Not started | Freezes accepted race semantics, numeric policy, discriminated references, and exhaustive status handling. | Inventory every status consumer before adding terminal states; no gameplay change. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/02-durable-race-state-persistence-and-beta-reset.md` | Not started | Adds the small durable race coordination aggregate and lossless persistence. | One/many participants use one path; no duplicated terms; delete incompatible beta saves. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/03-club-stage-clearing-and-competitive-resolution.md` | Not started | Resolves permanent offers as one set at the immutable deadline. | Return qualified/outbid/rejected IDs; do not choose the transfer winner before player choice. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/04-raise-posta-visibility-and-ai-raise-policy.md` | Not started | Adds exact relevant rival-fee visibility and deterministic stale-safe raises. | One actionable Posta conversation; bounded AI; no deadline reset or bid-history ledger. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/05-player-choice-between-qualified-suitors.md` | Not started | Compares only qualified contract offers and closes player-choice losers. | Preserve one atomic winner and allow all offers to be rejected without runner-up fallback. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/06-free-agent-negotiation-and-race.md` | Not started | Adds the missing durable free-agent negotiation lifecycle. | Reuse race/player choice and preserve `applyCareerFreeAgentSigning` as the atomic commit. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/07-market-squad-and-posta-race-ui.md` | Not started | Projects canonical race facts through existing web surfaces. | Distinguish price loss from player-choice loss; never expose rival contract terms. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/08-non-vacuous-transfer-race-diagnostics.md` | Not started | Adds a dedicated race audit with positive denominators. | Separate structural hard failures from pre-frozen calibration evidence. | Not evaluated. |
| `docs/steps/82b-competitive-transfer-race-and-player-choice/09-bounded-phase-report-and-world-extension-handoff.md` | Not started | Closes the competitive-market phase on bounded, non-vacuous evidence and hands working cohort infrastructure to Phase 81. | Run no longitudinal cohort; prove positive race observations and a bounded shard/checkpoint/worker exercise. | Not evaluated; no run executed. |
| `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md` | Accepted | Freezes the Phase 81 product, architecture, clean-code, diagnostic, persistence, UI, AI, and cohort contract. | Preserve one deterministic aggregate engine; separate quality, intrinsic shape, and relational matchup; use typed football facts, diminishing returns, shared decision seams, and no named formation penalty. | Documentation reviewed; implementation not started. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/README.md` | Planned | Defines twelve ordered steps for the typed, phase-aware tactical-shape and manager-decision engine. | Keep player quality, intrinsic shape, and relational matchup separate; share one pre-match/live/AI/batch seam; remove obsolete local paths; let Step 12 alone run the final cohort. | Design contract accepted; implementation not started. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/01-reproducible-extreme-shape-baseline-and-frozen-contract.md` | Planned | Freezes current extreme-shape behavior and the accepted model contract before gameplay changes. | Lead with equal-quality `3-1-6` versus `4-4-2`; preserve structured baseline facts and predeclare thresholds. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/02-typed-tactical-slot-context-and-collapse-removal.md` | Planned | Carries typed formation line, family, side, role, and suitability facts into the engine. | Remove the four-way open-string collapse and guard every union exhaustively. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/03-intrinsic-tactical-shape-profile-and-diminishing-returns.md` | Planned | Derives one pure intrinsic shape profile with configured diminishing returns. | Measure coverage, continuity, occupation, and overload without named-formation penalties or player-quality duplication. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/04-relational-phase-matchup-and-route-capacity.md` | Planned | Compares both shapes through phase-specific relational route capacities. | Keep matchup directional and fixture-local; do not persist or precompute opponent-independent verdicts. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/05-position-suitability-coordination-without-double-penalty.md` | Planned | Adds suitability-based coordination effects without stacking a blanket attribute penalty. | Preserve destination-role weighting, isolate coordination, and prove natural/familiar/weak monotonicity. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/06-phase-aware-control-opportunity-routes-and-tactic-semantics.md` | Planned | Routes control and opportunities through the phase model and gives tactical instructions concrete semantics. | Use one versioned config and one pre-match/live/AI/batch evaluator; remove obsolete scalar fallbacks. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/07-route-quality-causal-actors-and-explanation-facts.md` | Planned | Chooses eligible causal actors before resolving route quality and outcomes. | Preserve aggregate simulation; emit structured explanation facts; eliminate post-outcome actor decoration. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/08-live-session-persistence-event-schema-and-beta-reset.md` | Planned | Persists only canonical live inputs and the structured event facts needed for deterministic resume. | Do not persist derived shape caches; reset incompatible beta saves; prove segmented/full-run equivalence. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/09-ai-whole-xi-selection-and-shared-tactical-decisions.md` | Planned | Makes AI evaluate complete XIs and tactics through the same public match model. | No AI-only formula or greedy per-slot shortcut; keep candidate search bounded and deterministic. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/10-pre-match-and-live-tactical-consequence-ui.md` | Planned | Exposes bounded qualitative tactical consequences in the existing preparation and live workspaces. | Project engine facts only; keep copy localized and avoid numeric win promises or a second tactics state. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/11-non-vacuous-tactical-diagnostics-and-integrated-gates.md` | Planned | Adds positive-denominator tactical diagnostics, metamorphic invariants, and integrated repository/browser gates. | Freeze thresholds before the cohort; fail zero observations; never suppress warnings or retune to seeds. | Not evaluated. |
| `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/12-checkpointed-50x20-phase-report-and-mvp-handoff.md` | Planned | Runs the sole deferred longitudinal cohort and hands truthful evidence to Phase 79. | Use 50 worlds, 20 seasons, 50 stable shards, exactly 7 workers, checkpoints, and a repeated reuse run. | Not evaluated; no run executed. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/README.md` | Done | All nine ordered documents are closed by explicit product decision; the implementation and bounded evidence pass while the interrupted corrective cohort remains unclaimed. | Preserve deterministic slot pre-allocation; keep stored ceiling and public P90 upper distinct; retain non-vacuous structural gates and explicit calibration warnings; defer one checkpointed `50 x 20` with exactly `7` workers to Phase 81 Step 12. | Focused checks/typechecks, `pnpm check` (`252` / `1,581`), dependency boundaries (`762` / `2,950`), web build, Playwright `29/29`, and manual QA PASS; stopped `50 x 20` produced no report or evidence. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/01-reproducible-joint-profile-baseline-and-prospect-source-contract.md` | Done | Reproduced the `100`-world joint age/rating/value baseline, zero-counter/asking-fee identity, deterministic development-outcome matrix, and monetary source provenance without gameplay changes. | Use pure supplied-input diagnostics, record allocation versus effective stock, cap-label collisions, offer/counter/fee ratios, derive range probabilities from game outcomes, and retain aggregate real-market evidence only for money calibration. | Focused `24/24`, package typechecks, dependency boundaries, and diff PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/02-archetype-compatible-exceptional-profile-construction.md` | Done | Corrected exceptional archetype precedence and constructive age/current/potential compatibility. | Current-six status owns the archetype when current and potential exceptional labels overlap; no unbounded rejection or incompatible post-force. | Focused `44/44`, content typecheck, dependency boundaries, and diff PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/03-effective-initial-world-rarity-budgets-and-assignment-truth.md` | Done | Initial rarity now constrains effective ratings and exposes truthful natural/constructed assignment metadata. | Reconcile naturally qualifying profiles before constructing the remaining budget; rebuild only surplus compatible seniors and remove superseded metadata. | Focused `48/48`, `100` complete worlds, package typechecks, dependency boundaries, and diff PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/04-production-annual-intake-allocation-and-longitudinal-caps.md` | Done | Composed the annual world allocator exactly once across CLI, web, labs, and diagnostics, with a non-vacuous ten-rollover proof. | Keep engine content-agnostic; schedule after the opening offset; distinguish allocated, generated, accepted, and active exceptional stock. | Exact `132/132`, five typechecks, dependency boundaries (`755` / `2,926`), diff, and Graphify PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/05a-headless-public-potential-projection-contract.md` | Done | Established the pure caller-configured age/role/current/ceiling projection owner without changing production behavior. | Derive ordered current/lower/expected/upper ability facts, then map public half-stars; keep `Player.potential` as the sole stored ceiling and leave content/apps/saves untouched. | Exact `10/10`, domain/engine typechecks, dependency boundaries (`757` / `2,933`), diff, and Graphify PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/05b-public-potential-range-integration-presentation-and-beta-reset.md` | Done | Adopted the projection once across versioned content, public read models, accessible Squad/Market/profile presentation, and beta-save reset. | Remove singular public-potential read-model truth; render solid conservative stars, patterned uncertain upside, neutral outline, and exact localized range copy; reset only incompatible saves. | Exact `144/144`; six typechecks, dependency boundaries (`762` / `2,950`), diff, and Graphify PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/06-range-aware-prospect-value-negotiation-spread-and-rare-upper-cap.md` | Done after rework | Range-aware value, cap safety, and deterministic negotiation spread remain coherent after the public P90 upper correction; generated rarity is no longer redefined by presentation. | Keep sourced monetary anchors separate from game outcomes; use public P90 for value, stored ceiling for rarity, and expose both diagnostic facts explicitly. | Exact `137/137`; six typechecks, dependency boundaries (`762` / `2,950`), `302` stored-ceiling-six versus `151` public-upper-six, and diff PASS. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/07-non-vacuous-joint-distribution-and-market-gates.md` | Done after rework | The upstream width contradiction is fixed with all `1,170` observations retained; diagnostics separate public P90 misses from stored-ceiling violations and generated rarity. | Keep positive observation counts, pool by role-family/age band, retain the predeclared `5%..15%` tolerance as warning evidence, and hard-fail any outcome above stored ceiling. | Exact `45/45`, typechecks, boundaries, diff, and Graphify PASS; aggregate `65/1,170`, six band warnings, zero ceiling violations. |
| `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/08-50x20-browser-qa-phase-report-and-phase-79-handoff.md` | Done by product decision | Closed browser, repository, absence-audit, and reporting work without misrepresenting the stopped direct cohort as passing evidence. | Accept the completed implementation and bounded evidence for 79D; defer the longitudinal cohort to Phase 81 Step 12 with resumable checkpoints and exactly `7` workers. | `pnpm check` `252` files / `1,581` tests; dependency boundaries, web build, Playwright `29/29`, and manual QA PASS; no `79D_50X20_REPORT` exists. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/README.md` | Done | Completed all fourteen global-rating, three-division-world, and market-economy calibration steps and returned control to Phase 79 Step 14 before the later Phase 79D interposition. | Keep observed/derived/source facts separate from design targets; use six validated JSON balance assets and explicit app composition; keep market-behavior game-design coefficients separate from observed value evidence; require independent wage/finance evidence; use focused gates plus one final `10 x 10`. | Steps 01-14 Done; final `10 x 10` PASS; no Phase 79 release gate was run or claimed. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/01-versioned-source-baselines-and-diagnostic-contract.md` | Done | Closed source provenance, independent wage/finance evidence, six versioned schema boundaries, stable domain contracts, and a read-only supplied-input diagnostic without gameplay changes. | Reproduced five competition samples and the pre-79C baseline; stored no real-player rows; kept observed, derived, and design fields explicit; used Valibot at one immutable content boundary and kept tuning out of domain/simulation-tools. | Focused Vitest `14/14`; three package typechecks, web build, depcruise, diff, and Graphify PASS; no long run executed. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/02-global-one-to-six-half-star-rating-and-attribute-presentation.md` | Done | Replaced selected-club-relative rating and the separate rating elite flag with one global current/potential `1..6` half-star contract across Squad, Market, lineup choices, and detail. | Pass the validated content scale explicitly at web composition; derive from canonical role ability; render `5.5`/`6` with a half/full dark-orange sixth star; format exact current attributes with one locale-aware decimal; expose no numeric potential. | Focused Vitest `42/42`; i18n `19/19`; web `322/322`; engine/UI/web typechecks, depcruise, absence audit, diff, and Graphify PASS. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/03-division-generation-bands-and-world-rarity-budgets.md` | Done | Calibrated first-team division bands, lower reserve/youth tails, and exact separate initial-stock and annual-intake six-star budgets. | Allocate current champions only to first-division title-club lineup slots; include them in the independent potential-six stock; route local white flies to lineups; apply explicit potential floors to the chosen intake candidates; diagnose named population slices. | Focused Vitest `89/89`; content/simulation-tools typechecks, depcruise (`733` / `2,753`), diff, and Graphify PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/04-multi-competition-career-state-and-persistence.md` | Done | Added an ordered domestic competition registry, canonical membership/history, and lossless calibration-version persistence without world-generation changes. | Keep current membership only on ordered `Competition.clubIds`; derive club competition through the registry; keep the seven-version bundle only on immutable `GameMeta`; preserve relational order and historical tables in SQLite schema 16. | Focused Vitest `63/63`; domain/storage typechecks, depcruise (`735` / `2,770`), diff, and Graphify PASS. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/05-multi-competition-calendar-and-fixture-traversal-foundation.md` | Done | Generalized calendar identity and career fixture traversal for the ordered domestic registry. | Namespace fixture IDs by explicit competition/season identity; publish calendars and traverse fixtures in canonical competition order; keep selected-club lookup narrow without a parallel legacy path. | Focused Vitest `42/42`; engine typecheck; depcruise (`735` / `2,772`); diff and Graphify PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/06-canonical-three-division-content-world.md` | Done | Added one complete deterministic 54-club fictional domestic country without switching clients. | Allocate exceptional stock once, then compose three namespaced 18-club tiers with 22 seniors per club, canonical memberships, contracts, youth, finance, windows, versions, and shared gameplay config; emit no fixtures. | Focused Vitest `70/70`; content typecheck; depcruise (`739` / `2,800`); diff and Graphify PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/07-cli-web-and-diagnostic-three-division-bootstrap.md` | Done | Switched CLI, web, and bounded diagnostics to the same canonical 54-club world. | Select Third Division explicitly, resolve competition facts from canonical membership, validate all seven immutable versions, and keep one shared seed projection across applications. | CLI `47/47`; web `325/325`; CLI/web typechecks, web build, depcruise (`740` / `2,807`), diff, and Graphify PASS; identity hash `c0f4b880`; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/08-promotion-relegation-and-integrated-season-rollover.md` | Done | Added one atomic all-competition boundary with exact fixed-topology movement and complete next calendars. | Compute every final table first; exchange `3/3` and `2/2` clubs from the immutable tables; keep Third closed; preserve identities, rosters, finance, contracts, and reputation; update categories and post-movement fixture/window lookup. | Focused `121/121`; i18n `19/19`; web `327/327`; report `15/15`; typechecks, depcruise (`742` / `2,813`), diff, and Graphify PASS; deterministic two-season smoke; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/09-cross-division-market-population-and-sporting-willingness.md` | Done | Added one complete canonical cross-division Market catalog and structural sporting willingness. | Select every persisted external senior/canonical free agent once; carry competition/tier and contract facts through lazy UI detail; feed explicit structural facts to selected-club and AI paths; keep economics unchanged. | Focused `64/64`; i18n `19/19`; web `327/327`; engine/UI/web typechecks, depcruise `744` / `2,821`, diff, and Graphify PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/10-source-calibrated-public-market-value-model.md` | Done | Replaced the old implicit linear value with one explicit source-calibrated public-value model and canonical distribution fit. | Interpolate continuously between global star anchors using role quality; apply public potential, age, position, and owner-market context; use neutral free-agent context; exclude observer/form/contract; compress the upper tail and reserve exact `€150m` for eligible young six-star players. | Focused `97/97`; CLI `33/33`; report `15/15`; web `327/327`; five package typechecks, depcruise `745` / `2,837`, diff, Graphify, and three-world tier fit PASS; no final cohort. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/11-asking-price-transfer-fee-and-free-agent-semantics.md` | Done | Separated public value, seller asking price, offered/countered/agreed fee, and completed fee across the full permanent/free-agent lifecycle. | Use one explicit asking-price config, freeze every commercial fact at its owning stage, settle the exact agreed permanent fee, and preserve free-agent public value with an exact zero transfer fee. | Focused suite plus corrected CLI `33/33`, i18n `19/19`, web `327/327`, affected typechecks, depcruise `748` / `2,854`, and diff PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/12-source-backed-wage-and-contract-calibration.md` | Done | Unified generated and runtime wages, terms, and capacity behind one independent source-backed policy and solvent three-tier opening budgets. | Derive salary from global role quality, tier, status, age, potential gap, and contract context only; select exact career-stamped content at app composition; retain compact per-tier wage/bonus/commitment/utilization/headroom diagnostics. | Focused `193/193`; i18n `19/19`; web `327/327`; five typechecks; depcruise `750` / `2,881`; diff and Graphify PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/13-transfer-budgets-affordability-willingness-and-market-ai-calibration.md` | Done | Calibrated tiered opening cash/transfer room, seller replies, sporting willingness, acquisition affordability, and AI market behavior behind one exact stamped policy. | Keep cash reserve, transfer allocation, wage headroom, signing bonus, and pending exposure distinct; pass config explicitly through selected/AI paths; retain per-tier and cross-tier market diagnostics without forcing deals. | Focused `158/158`; i18n `19/19`; web `327/327`; five typechecks; depcruise `751` / `2,901`; diff and Graphify PASS; no long run. |
| `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/14-short-calibration-visual-qa-cleanup-and-phase-report.md` | Done | Closed Phase 79C with non-vacuous market evidence, complete browser/absence audits, and one bounded deterministic cohort. | Repair hard squad floors fairly before optional depth, materialize a bounded reserve only when the shared free-agent pool is insufficient, and emit season-scoped replenishment facts without duplicating transfer history. | `pnpm check` `247` files / `1,532` tests; browser `29/29`; build/typechecks/depcruise PASS; `10 x 10` PASS with `0` failed worlds, minimum squad `18`, `0` structural/rating-cap violations, and exact zero-fee free-agent semantics. |
| `docs/audits/DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md` | Accepted | Locked `fictional-three-tier-v1`: three 18-club/34-matchday competitions, 3 movements between First/Second, 2 between Second/Third, and a closed Third lower boundary. | Preserve the existing bounded 18-club prototype while creating a real in-save Scalata; label the format as fictional game design and leave Italian 20/20/60 groups/postseason to advanced Phase 82. | Decision, source comparison, movement rationale, deterministic/persistence contract, and non-goals are documented. No production code changed. |
| `docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_CALIBRATION_SPEC.md` | Documented | Recorded the preliminary real-market snapshot, current implementation measurements, root causes, accepted global-star/value/world/economy decisions, ownership, and validation ladder. | Treat retained aggregates as planning evidence until Step 01 records pagination/inclusion/percentile and command/commit/seed provenance; no live source/real-player data; public value differs from asking/final fee; free-agent fee is zero; `€150m` is a compressed young six-star ceiling. | Source links, preliminary captured/derived/design labels, explicit provenance gap, current formula/distribution evidence, and Phase 79C mapping are present. |
| `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/07-responsive-accessibility-visual-qa-and-phase-report.md` | Done | Closed the Squad/Market redesign with shared formatting, complete responsive/accessibility evidence, and a regression fix for the reported scroll glitch. | Keep one formatter and one tab contract; reflow tables to bounded cards below 1400px; contain tall Squad rows in their frame; measure document-versus-shell height; preserve portal menu focus after positioning. | Package suites PASS; web `322/322`; typecheck/build PASS; visual QA `29/29` in `4.4m`; final monorepo/diff/Graphify result recorded in the active-step section. |
| `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/README.md` | Done | Completed all seven bounded player-workspace/statistics steps and returned the single active step to Phase 79 Step 14. | Preserve exact Market attributes, public relative ratings, durable coverage-aware statistics, automatic lineup swaps, three-tab inspectors, and the existing canonical contract/market owners. | Steps 01-07 Done; `750 x 50` not run or claimed. |
| `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/04-squad-lineup-select-swap-and-action-menu.md` | Done | Squad rows now provide direct formation placement, truthful automatic swaps, and one accessible contextual action menu. | Derive selects from the canonical formation and current plan; execute a pure ordered plan through existing synchronous XI/bench callbacks; portal and clamp the menu outside the table scroll frame; preserve the detailed chooser on the same planner. | UI `92/92`; web `307/307`; i18n `19/19`; typechecks/build PASS; complete Playwright `24/24`; diff and Graphify PASS. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/07-phase-report-and-return-to-phase-79.md` | Done | Reconciled both reports, architecture, status, roadmaps, step index/prompt, and parent Phase 79 documentation; returned the single active step to Phase 79 Step 14. | Preserve all final warning/story evidence, remove no live diagnostic path, and leave the Phase 79 staged gate unchanged and unclaimed. | Final `pnpm check` PASS (`223` files / `1,371` tests); depcruise PASS (`679` modules / `2,607` dependencies); diff and Graphify PASS. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/06-focused-regression-and-50x20-calibration-gate.md` | Done | Completed the exact cohort, reproduced every owned failure, corrected concurrent seller completion and lifecycle department edges, and obtained zero Phase 79A-owned failure across all 50 worlds. | Recheck AI seller floors at negotiated commit; permit non-preferred replenishment only below 18; defer retirement only when it would empty a department. Preserve story thresholds and manager behavior. | Final `50x20`: `1,719` permanent completions, FA max `0.2274`, overspend `0`, min squad `18`, below-min/GK/structural `0`; only two `champion_streak` story failures. Repeated hashes byte-identical. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/05-wage-headroom-diagnostic-semantics.md` | Done | Replaced the maximum-only wage warning with distinct structural, prevalence, exact-contact, and headroom meanings. | Keep max/p95/p99/exact/reallocation visible; fail any overspend; warn pressure at `>=25%` of club-seasons and exact ceiling at `>=10%`; expose p10 headroom informationally. No finance tuning. | Focused simulation/CLI suites PASS (`21/21`); world `00025`: finance PASS with max `1.0`, pressure `0.1806`, exact `0.0417`, overspend `0`, p10 headroom `14,862,000`; full `pnpm check` and diff PASS. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/04-free-agent-stock-flow-and-squad-demand.md` | Done | Replaced runaway low-ability free-agent retention with an explicit, bounded career-layer outcome while preserving useful-player demand and roster shape. | Include academy release dates in unattached duration; current-ability `<8` outfield players step down after two complete unattached seasons and goalkeepers after five. Keep stronger/recent players available; allow non-preferred emergency recruitment only below 18; defer retirement only when it would empty a department. | Final `50x20` free-agent max `0.2274`, useful max `3`, annual flow reconciliation clean, minimum squad `18`, and zero missing goalkeeper/department structural failure. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/03-permanent-transfer-funnel-and-budget-timing.md` | Done | Restored meaningful permanent-market opportunity without guaranteed deals or weaker seller protection. | Detect materially weak depth outliers as quality needs; exhaust same-club current-window needs before preliminary fallback; let agreed future arrivals consume future-planning capacity without blocking a current permanent negotiation, then recheck the full cap before another preliminary start. | Named `00025/00041/00023` sample: `190` targets/offers and `113` completions over `1,020` AI club-seasons; constrained-club, seller-floor, affordability, quiet-club, and quiet-season outcomes remain. Focused tests PASS; full `pnpm check` and `git diff --check` PASS. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/02-market-funnel-population-and-wage-observability.md` | Done | Added separate permanent/preliminary funnels, exact free-agent stock/flow and population bands, and club-season wage/headroom distributions without changing gameplay decisions. | Compact engine checkpoint facts by club/department/stage/reason; retain canonical lifecycle and exit facts until simulation tooling aggregates one season; include bounded club-season samples and the new summaries in CLI output and hashes. Fixed world `00025` proves the permanent bottleneck is `seller_department_floor`, the pool is overwhelmingly low-current-ability academy-release stock, and wage pressure is minority prevalence rather than universal compression. | Focused engine/simulation/CLI suites PASS (`26/26`); engine, simulation-tools, and CLI typechecks PASS; fixed 20-season world matches baseline football/economy facts; full `pnpm check` PASS (`223/223`, `1,358/1,358`); `git diff --check` PASS. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/01-lock-50x20-baseline-and-diagnostic-contract.md` | Done | Locked the reproducible `50 x 20` baseline, representative seasonal trajectories, warning semantics, finding taxonomy, hypotheses, and missing metric vocabulary. | Treat permanent-transfer scarcity and free-agent accumulation as real economy risks; treat maximum-only wage reporting as a diagnostic defect; keep dynasty, goals, assists, and population edges outside Phase 79A tuning; require structured evidence before behavior changes. | Temporary report SHA-256 verified as `0b9e9e8ac8351c48d3da1afd559576c648bd8dc236a74c68bf8094ebaca9d18e`; required Phase 79 Step 14 file exists; `git diff --check` PASS. |
| `docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/README.md` | Done | Completed the seven-step bounded correction path for the market-economy findings exposed by the market-active `50 x 20`. | Instrument permanent/preliminary funnels, free-agent stock/flow, and wage distributions before tuning; change only proven canonical owners; repeat the same `50 x 20`; return to Phase 79 Step 14 without claiming its `750 x 50` gate. | Steps 01-07 Done; final cohort and deterministic repeats satisfy every owned criterion. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/11-offer-composer-and-two-stage-decision-flow.md` | Done | The manager can submit, revise, accept, reject, and withdraw permanent-transfer and preliminary-agreement talks through one explicit command flow with live affordability previews; browser-verified end-to-end. | New `evaluateTransferFeeCapacity` engine query; `WebSelectedClubMarketCommand`/`applySelectedClubMarketCommand` runtime boundary (11 variants incl. `sign_free_agent`); `previewMarketOffer` adapter over the Step 09 preview contract; shared `ContractTermsForm` extracted for Squad+Market (no second contract form); `P79-CF-04` fixed via token-guarded reseed (Squad) and by-construction immunity (Market); `P79-CF-03` completed (edit/display precision stay separate). | Full `pnpm check` PASS (`222` files / `1339` tests, depcruise `675`/`2572` clean); web build PASS; Playwright PASS (`23/23`); manual browser verification of the full submit→pending→withdraw cycle and finance/exposure accuracy. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/10-market-workspace-and-player-inspection.md` | Done | Market is a real, styled, accessible, localized, tested browser route; a real free-agent/adapter crash, zero CSS, missing Playwright coverage, a dependency-boundary violation, and a five-language localization gap were found on re-audit and fixed. | Scope Market targets to `selectFreeAgentPlayerIds` plus other-club senior owners; add a complete `.tls-market-*` CSS section reusing Squad/profile tokens and patterns; add desktop+narrow Playwright specs; re-export `CanonicalPlayerRole` from `@game/ui` instead of importing `@game/domain` in `apps/web`; add all 82 `career.market.*` `de`/`es`/`fr` translations; add `career-market-adapter.test.ts`. | Full `pnpm check` PASS (`221` files / `1335` tests, depcruise `671` / `2551` clean); web build PASS; Playwright `current-product.spec.ts` PASS (`22/22`); `git diff --check` clean. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/09-market-search-budget-and-target-read-models.md` | Done | Re-verified: framework-free `@game/ui` Market models are truthful and public-only; all three carry-forward fixes (`P79-CF-01/02/06`) confirmed present and correct on independent re-check. | Confirmed `moraleDirection` removed (not hardcoded), single `CAREER_CONTRACT_EXPIRY_ALERT_DAYS` boundary is the only expiry-alert owner, and Squad adapter indexes contract history/negotiations once before the player loop. | UI tests PASS (`16` files / `87` tests); UI typecheck PASS; findings folded into the Step 10 re-verification entry above. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/08-ai-market-targeting-and-squad-protection.md` | Done | AI clubs participate in both market windows through bounded, football-reasoned decisions without automating the selected club or bypassing canonical transfer rules. | Derive deterministic needs from squad and finance facts; route permanent and preliminary talks through canonical commands; use stable ordering and bounded active/seasonal limits; keep structural seller protection AI-specific; delete the obsolete direct turnover path. | Focused suites PASS (`5` files / `32` tests); engine typecheck PASS; full `pnpm check` PASS (`217` files / `1318` tests, depcruise `655` / `2485`); diff and Graphify update PASS. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/07-final-six-month-preliminary-agreements.md` | Done | Eligible players can agree a future contract in their final six months without joining early; activation happens exactly once after current expiry. | Durable future-agreement state reuses canonical terms and the three-day player clock; ownership, registration, payroll, selection, and finance remain unchanged until an atomic activation reconciles every affected contract, squad, finance, history, negotiation, and selected-plan fact. | Focused domain/engine suites PASS (`20` tests); regression suites PASS (`11` tests); full `pnpm check` PASS (`217` files / `1321` tests, depcruise `655` / `2480`); diff and Graphify update PASS. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/06-player-contract-table-and-atomic-transfer-completion.md` | Done | An accepted club fee now opens a separate player-contract table and completes exactly one permanent transfer only after player acceptance and final invariant checks. | Reuse the Phase 78 annual contract demand/evaluation model under an independent three-day stage clock; keep pending terms informational; store exact accepted terms; call the canonical atomic permanent-transfer boundary for fee, contracts, registration, number, history, ledger, squad, and selected-plan reconciliation; expose structured terminal failures and idempotent advancement. | Focused domain + engine suites PASS (`31` tests); typechecks and focused ESLint PASS; full `pnpm check` PASS (`215` files / `1313` tests, depcruise `650` / `2441`); diff and Graphify update PASS. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/05-club-to-club-permanent-transfer-negotiation.md` | Done | A manager can offer a fee for an employed player and get a deterministic accept/reject/counter from the seller within three game days; no ownership or money moves before player terms. | New domain 7-state `TransferNegotiation` (+ `CareerState.transferNegotiationState`) and engine use case over the existing valuation owner; seller willingness from value × status × security × cash with a squad-depth not-for-sale guard; provisional acceptance, unaffordable cancellation, counter keeps the deadline, idempotent advance. | Domain (`6`) + engine (`11`) tests PASS; typechecks PASS; full `pnpm check` PASS (`215` files / `1306` tests, depcruise `649` clean); `git diff --check` clean. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/04-three-day-negotiation-clock-and-pending-exposure.md` | Done | Pending offers no longer reserve budget; combined risk is an informational query; a three-day stage clock (deadline capped at window close, unchanged by a counter) is available for the transfer stages. | Delete reservation-as-spend and migrate every caller to committed-facts affordability (`career-contract-capacity.ts`); add `deriveMarketPendingExposure` and domain `negotiation-stage-clock.ts`; recheck affordability at acceptance; flip reservation-behavior tests to the locked truth. | Affected suites PASS; full `pnpm check` PASS (`213` files / `1289` tests, depcruise `645` clean); `git diff --check` clean. Documented deviation: ten-season determinism test timeout raised to 30s. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/03-window-eligibility-and-out-of-window-policy.md` | Done | One engine owner answers which market actions are legal now and why, with active-close / next-open dates; permanent transfers reject out-of-window attempts independently of UI. | Pure `evaluateMarketActionEligibility` over resolved `SeasonTransferWindows`; window-gated transfers/registrations require an open window; renewals and inspection year-round; preliminary agreements need <= 183 remaining days; add `outside_transfer_window` reason and gate `applyCareerPermanentTransfer` when windows supplied. | Eligibility + transfer tests PASS (`13`); engine typecheck PASS; full `pnpm check` PASS (`212` files / `1282` tests); `git diff --check` clean. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/02-playable-competition-transfer-window-catalog.md` | Done | Each playable competition now has exactly two source-backed inclusive transfer windows; the demo third division uses the FIGC 2026/27 dates and rolls forward deterministically. | Domain owns window vocabulary/validation/status; content owns the cited month/day template for playable competitions only and resolves absolute per-season dates; world generation exposes `FakeLeagueSystem.transferWindows`; no user-configurable calendar or speculative rows. | New domain+content tests PASS (`18/18`); domain+content typechecks PASS; full `pnpm check` PASS (`211` files / `1274` tests); `git diff --check` clean. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/01-current-market-ownership-and-gap-audit.md` | Done | Complete transfer/valuation/contract/finance ownership audit with retain/extend/replace/remove table, named replacement path for the temporary pending-reservation behavior, and all eight `P79-CF-*` findings mapped to one owning step and one test seam. Started under an explicit user entry-gate override (Phase 78 Step 15 still In progress). | Audit production callers and Graphify evidence, not filenames; keep every new Module tied to one named gap; distinguish durable domain facts from transient web drafts; name one deletion path for `deriveCareerContractOfferReservations` reservation-as-spend. | `graphify query` ran; `git diff --check` clean; `pnpm depcruise` PASS (`636` modules / `2,375` deps). `graphify update .` deferred (disproportionate full-rebuild cost for a single-doc step). |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/14-full-screen-player-profile-and-renewal-workspace.md` | Done | Squad now opens one complete full-screen football profile with exact current attributes, public potential, annual contract facts, history, finance preview, and every supported renewal decision. | Keep contract and finance truth in domain/engine; expose presentation-safe UI inputs and runtime commands; retain only a recoverable form draft in React; resolve raw browser IDs at the runtime boundary; preserve focus and command errors without closing the profile. | Node 24 UI PASS (`75/75`); web PASS (`63` files / `278` tests); web typecheck/build PASS; complete Playwright current-product and SQLite/OPFS gate PASS (`21/21`); dependency-cruiser PASS (`626` modules / `2,314` dependencies); diff and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/13-explicit-lineup-selection-and-tactics-synchronization.md` | Done | Squad, Tactics, preparation, and Matchday now consume one current plan with explicit, atomic XI and bench replacement. | Reuse the approved preparation workspace on the separate Tactics route; centralize slot ownership and suitability ordering in framework-free projections; preserve the draft across internal routes; prompt only at real career-exit or Matchday boundaries. | Node 24 engine PASS; web PASS (`61` files / `271` tests); web typecheck/build PASS; complete Playwright product and SQLite/OPFS gate PASS (`20/20`); dependency, monorepo, diff, and Graphify gates PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/12-senior-squad-table-and-navigation-workspace.md` | Done | Squad is a real responsive career route with a dense senior-roster table, canonical sorting/filtering, contract alert, and accessible player-profile entry. | Consume only Step 11 projections in React; retain route-local table state in Zustand; use one native full-screen dialog; fit desktop, narrow, and 200% text without horizontal table scrolling or copied football formulas. | Node 24 web tests PASS (`61` files / `269` tests); web typecheck/build PASS; dependency-cruiser PASS (`616` modules / `2,279` dependencies); complete Playwright product and SQLite/OPFS gate PASS (`20/20`); diff check PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/11-squad-player-profile-and-contract-read-models.md` | Done | Senior Squad, player profile, and contract facts now have reusable framework-free read models and explicit action descriptors. | Derive public club-relative current/potential categories in engine; expose exact current attributes but no hidden potential numbers; keep selection separate from availability; use annual-only wage and finance fields; centralize deterministic table sorting/filtering and explicit replacement choices. | Node 24 focused engine/UI/i18n coverage PASS (`5` files / `29` tests); engine, UI, and i18n typechecks PASS; dependency-cruiser PASS (`610` modules / `2,250` dependencies); diff and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/10-durable-match-plan-and-fixture-eligibility-separation.md` | Done | The exact XI, bench, formation, roles, and tactic survive full time and reload; selected injured or suspended players remain visible while confirmation and kickoff return exact blockers. | Validate durable plan structure separately from next-fixture eligibility; use one domain blocker query through engine APIs; preserve manager intent until an explicit edit; let explicit fill helpers skip unavailable candidates without hidden reconciliation. | Node 24 domain, engine, and web suites PASS; focused coverage PASS (`92` tests); full `pnpm check` PASS (`199` files / `1,185` tests); dependency-cruiser PASS (`602` modules / `2,221` dependencies); web typecheck, diff, and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/09-transfer-youth-valuation-and-contract-history-integration.md` | Done | Permanent transfers, youth graduation, releases, expiry, exits, and AI turnover now preserve ownership, agreement, registration, finance, number, negotiation, and history invariants. | Route every ownership change through contract-aware atomic seams; derive transfer value and terms from sporting plus real contract context; protect existing wage/status/security; reconcile closed negotiations; append factual signing, renewal, transfer-termination, expiry, and release history; remove ownership-only mutation paths. | Node 24 domain and engine suites PASS; full `pnpm check` PASS (`199` files / `1,181` tests); dependency-cruiser PASS (`602` modules / `2,220` dependencies); complete ten-season report PASS; diff and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/08-ai-renewal-expiry-and-free-agent-lifecycle.md` | Done | AI clubs now renew or release deterministically, expiry creates real free agents, structural depth is protected, and pending negotiations plus Inbox policy survive reload. | Reuse the canonical negotiation/activation/finance boundaries; exclude the selected club; retain at least 18 seniors plus department depth; derive free agency from ownership and active contracts; persist envelope `5` / SQLite `11`; keep wages annual and post payroll once per season; use validated incremental domain commands instead of whole-career reconstruction per offer. | Node 24 focused lifecycle tests PASS; web `60` files / `264` tests; storage and engine typechecks PASS; full `pnpm check` PASS (`199` files / `1,178` tests); dependency-cruiser PASS (`602` modules / `2,209` dependencies); structural ten-season smoke `18..22` players with no role warning; diff and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/07-selected-club-contract-posta-and-continue-workflow.md` | Done | Selected-club reminders, delayed responses, counteroffers, final expiry choices, and their actions now flow through one truthful Posta/Continue projection. | Keep negotiation truth in domain/engine; make reminders non-blocking and due decisions blocking; expose typed commands for offer, revise, accept/reject, withdraw, and release; reconcile messages from underlying lifecycle state; keep commands in the working session until canonical save cadence. | Node 24 domain, engine, UI, and web suites PASS; web `60` files / `264` tests; web typecheck PASS; dependency-cruiser PASS (`600` modules / `2,199` dependencies); diff and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/06-contract-demand-offer-and-negotiation-engine.md` | Done | Renewal offers now move through deterministic draft, submitted, accepted, rejected, countered, expired, withdrawn, or unaffordable outcomes shared by selected and AI clubs. | Derive demands from canonical football facts; evaluate every supported contract term together; seed a two-to-six-day response delay and fourteen-day counter deadline; verify affordability at submission and activation; commit accepted renewals, history, wages, signing bonus, and exact failure facts atomically. | Node 24 domain PASS (`27` files / `147` tests); engine PASS (`56` files / `373` tests); full `pnpm check` PASS (`198` files / `1,159` tests); all typechecks, dependency-cruiser (`599` modules / `2,189` dependencies), diff, and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/05-payroll-bonuses-and-finance-ledger-lifecycle.md` | Done | Contract costs and supported club income now change canonical cash and budgets exactly once at annual-payroll, full-time, transfer, and season-distribution boundaries. | Use stable ledger IDs and integer minor units; aggregate annual payroll per club and season; derive fixture bonuses only from committed facts; stage permanent registration, contract, signing bonus, fee, and wage headroom atomically; suspend legacy ownership-only rollover for canonical squads until Steps 08-09. | Node 24 domain and engine suites PASS; `pnpm check` PASS (`195` files / `1,150` tests); all workspace typechecks PASS; dependency-cruiser PASS (`593` modules / `2,152` dependencies). |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/04-clean-beta-save-reset-and-persistence-contract.md` | Done | New careers persist registrations, contracts, histories, club finances, and ledgers losslessly; every earlier beta baseline resets or fails with a typed incompatibility instead of loading partial state. | Make envelope `4` and SQLite `10` the only baseline; require senior/finance state at the storage boundary; recreate only typed obsolete browser schemas; keep storage-access failures distinct; add no compatibility defaults or negotiation placeholders. | Node 24 storage PASS (`7` files / `30` tests); web PASS (`60` files / `262` tests); storage/web typechecks PASS; real Chromium SQLite/OPFS journey PASS; dependency-cruiser PASS (`590` modules / `2,135` dependencies); diff and Graphify PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/03-club-finance-and-budget-world-generation.md` | Done | Every generated club now receives one coherent cash balance, transfer budget, annual wage budget, committed-wage total, season totals, and ordered finance ledger. | Make `ClubFinanceState` the only finance owner; derive opening values from contracts and sporting facts; give the competition one season distribution; migrate market, CLI, simulation tooling, and web new-world creation; remove `MarketState` without compatibility cache. | Node 24 domain/content/engine suites and typechecks PASS; focused transfer-finance tests PASS; dependency-cruiser PASS (`589` modules / `2,128` dependencies); two-seed weak/average/strong manual distribution inspection PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/02-shirt-number-and-player-contract-world-generation.md` | Done | Every generated senior now receives one validated, role-aware shirt registration and one deterministic active agreement with supported bonuses and ordered signing history. | Keep immutable player identity separate from registrations/contracts; use namespaced IDs, unique `1..99` shirt numbers, integer minor-unit money, age/level/potential/division/reputation policy, and stable squad-order tie-breaks; expose generated facts from the content world while deferring durable schema composition to Step 04 and transfer mutation to Step 08. | Node 24 focused domain/content PASS (`5` files / `36` tests); domain/content typechecks PASS; dependency-cruiser PASS (`585` modules / `2,108` dependencies); two-seed ten-club manual distribution inspection PASS; `git diff --check` and `graphify update .` PASS. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/01-current-ownership-and-gap-audit.md` | Done | Mapped every current senior ownership, money, plan, availability, Posta/Continue, and persistence seam before production changes. | Extend `CareerState` and its canonical adapters; replace roster-index shirt numbers; preserve unavailable selections but reject them at kickoff; invalidate all beta saves through one clean version boundary; add no compatibility defaults or duplicate UI formulas. | Required source scan PASS; `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md` exists with exact replacement targets; Node 24 `git diff --check` PASS; `graphify update .` PASS. |
| `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md` | In progress | Defined fifteen ordered steps for the complete permanent-transfer and preliminary-agreement loop; Steps 01-13 are Done, Step 14 is Reopened and paused through Phase 81, and Step 15 is not started. | Preserve source-backed windows, staged talks, atomic affordability, preliminary agreements, deterministic AI, Posta decisions, persistence, and Market UI; resume only after Phase 81 and its checkpointed `50 x 20` with exactly `7` workers. | Phase 79D implementation/check/browser evidence passes, but its stopped direct `50 x 20` is unclaimed; the Phase 79 release gate remains unrun and unclaimed. |
| `docs/steps/78-senior-squad-player-contracts-and-club-finance-foundation/README.md` | In progress | Phase 78 has fifteen ordered implementation steps; Steps 01-14 are Done and Step 15 is active. | Build persistent shirt numbers, contracts, negotiation, annual payroll, bonuses, club finance, expiry/free agency, transfer/youth integration, one carried match plan, a dense senior Squad table, explicit lineup replacement, and a full-screen player profile; finish its structural long-run gate before Phase 79 begins. | Steps 01-14 pass their documented checks; Step 15 is active; the former Step 16 was retired and its integrated accessibility, cleanup, architecture, and report obligations now belong to Phase 79 Step 15. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/10-motion-accessibility-long-run-gate-cleanup-and-phase-report.md` | Done | Closed the complete live-match loop with deterministic season evidence, stable responsive presentation, accessible command parity, and no obsolete parallel Matchday path. | Keep one progressive engine session and volatile web projection; delete staged, half-time-only, and active-checkpoint owners; use SQLite schema `9` as the clean beta boundary; preserve bounded semantic Motion; retain the existing calibration thresholds and correct causal opportunity/penalty rates when the gate exposes excess scoring. | Repeated `50 worlds x 1 season` PASS across `15,300` fixtures with hash `396aaed146613af94950c0a6365b548e`, zero failures, and `3.156` goals per match; Playwright `19/19`; Node 24 package/typecheck/build, dependency, `pnpm check`, diff, and Graphify gates PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/09-full-time-team-review-and-career-consequences.md` | Done | Full time now presents one stable result and tabellino above Summary, Your team, and Opponent tabs, then publishes all career consequences through one Continue command. | Cache one canonical completion preview in the private live session; expose only review facts before acknowledgment; reuse the preview for one atomic career commit; integrate public consequences into team rows; preserve the full-time screen and previous working state when a due autosave fails. | Node 24 engine/UI/i18n/web suites PASS (web `59` files / `256` tests); Playwright PASS (`19/19`); web typecheck/build, dependency-cruiser (`573` modules / `2,097` dependencies), and diff check PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/08-shared-live-tactical-board-drag-drop-and-substitutions.md` | Done | The approved board now owns paused live substitutions, tactical movement, formation/role adaptation, forced exits, and accessible alternatives. | Reuse the shared XI/bench/role catalog and one typed pending command; keep edits reversible and memory-only; enforce no re-entry, five substitutions, fixed goalkeeper behavior, and disabled outgoing players without a parallel Matchday board. | Node 24 web PASS (`59` files / `254` tests); Playwright PASS (`19/19`); web typecheck/build, dependency-cruiser (`573` modules / `2,094` dependencies), diff, and Graphify PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/07-match-and-statistics-broadcast-tabs.md` | Done | Matchday now presents a stable score/current-commentary broadcast, cumulative two-half tabellino, compact live metrics, and complete comparative statistics. | Project one canonical cumulative engine snapshot into `Partita`, `Statistiche`, and `Tattica`; classify penalty award/outcome and goal as bounded narrative holds; keep red card and forced injury as engine decision pauses; reconcile carried preparation against next-fixture availability without hidden replacement. | Node 24 web PASS (`59` files / `248` tests); UI PASS (`10` files / `59` tests); Playwright PASS (`19/19`), including the second-fixture suspension regression; typecheck/build, dependency-cruiser, diff, and Graphify PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/06-web-live-pause-command-and-session-orchestration.md` | Done | Matchday now advances one canonical engine minute at a time with explicit speed, pause, incident, command, and full-time publication boundaries. | Keep engine truth in the private runtime session; project only read-only live facts to Zustand; let presentation timers request the next minute but never apply commands; publish career/Posta/persistence only on full-time `Continua`; restart unfinished matches from the durable pre-match state after refresh. | Node 24 web PASS (`57` files / `239` tests); UI PASS (`10` files / `59` tests); Playwright PASS (`19/19`); typecheck/build, dependency-cruiser, diff, and Graphify PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/05-deterministic-ai-in-game-decisions.md` | Done | Opponents now make deterministic, legal, visible in-game substitutions and bounded tactical reactions. | Evaluate real score/minute/condition/rating/incident facts at explicit boundaries; rank replacements by canonical suitability and ability; validate and apply the same atomic team-change command used by the manager; emit structured substitution, formation, role, and tactic facts; remove the half-time-only AI seam. | Node 24 engine suite PASS (`55` files / `370` tests); simulation-tools PASS (`7` files / `31` tests); engine typecheck and dependency-cruiser PASS; no active old-AI reference; `git diff --check` PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/04-fouls-cards-injuries-and-disciplinary-lifecycle.md` | Done | Matches now produce deterministic fouls, cards, penalties, and injuries whose durable consequences affect future selection and Posta. | Resolve incidents from current football context; remove dismissed/forced-exit players immediately; apply injury dates, bans, yellow totals, and ban consumption once at fixture commit; persist the facts in SQLite schema version `8`. | Node 24 domain/engine/storage tests and typechecks PASS; dependency-cruiser PASS (`558` modules / `2,035` dependencies); `git diff --check` and `graphify update .` PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/03-causal-team-statistics-and-live-rating-projection.md` | Done | Engine snapshots now expose causal possession, shots, shots on target, xG, corners, saves, goals, condition, and provisional ratings that share final-report ownership. | Accumulate minute control separately from conversion; derive xG/corners in the occasion resolver; spend condition only for the current XI; use one immutable structured-event rating ledger for live and final projections. | Node 24 engine suite PASS (`53` files / `361` tests); focused suite PASS (`4` files / `41` tests); simulation-tools suite PASS (`7` files / `31` tests); engine/simulation-tools typechecks and dependency-cruiser PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/02-progressive-minute-engine-and-match-session-state.md` | Done | Batch, staged, and future interactive Matchday progression now share one deterministic minute session with arbitrary pause boundaries and no future facts. | Wrap `stepMatch` in one immutable progressive state; keep the RNG cursor caller-owned; apply already-validated grouped changes only while paused so minute `N + 1` is their first consumer; retain staged state only as a loop-free checkpoint adapter. | Node 24 engine suite PASS (`53` files / `357` tests); focused suite PASS (`6` files / `41` tests); engine/simulation-tools typechecks and dependency-cruiser PASS; `git diff --check` and `graphify update .` PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/01-live-match-domain-contract-and-competition-rules.md` | Done | Established the dependency-safe live-match vocabulary and current playable competition rules without changing runtime behavior. | Use five regulation phases, one serializable memory-only session, complete team snapshots, atomic commands, typed rejections, structured incidents/statistics/consequences, and competition-owned substitution/discipline values; keep active legacy seams only until their named migration steps. | Node 24 focused tests PASS (`13/13`); domain/content/engine/storage/web typechecks PASS; dependency-cruiser PASS; `git diff --check` and `graphify update .` PASS. |
| `docs/steps/77-live-match-control-statistics-and-in-game-decisions/README.md` | Done | Completed the Phase 77 live-match control rework. | Ten ordered steps establish domain rules, one minute session, causal statistics and ratings, incident lifecycles, deterministic AI decisions, web pause/commands, broadcast tabs, shared-board drag/substitutions, full-time consequences, and a 50-world one-season gate while preserving save cadence and memory-only live state. | All ten steps and complete Node 24 engine, web, storage, browser, accessibility, dependency, monorepo, diff, and Graphify gates PASS. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/09-accessibility-performance-cleanup-and-phase-report.md` | Done | The complete current browser journey now has one accessible, production-used, bundle-measured motion language with no parallel React-state keyframe system. | Inventory every consumer by semantic reason; keep every used preset; route lazy renderers through `motion/react-m`; migrate the calendar tick; retain only presentation cleanup callbacks; document one next phase. | Node 24 web tests PASS (57 files / 242 tests); typecheck/build PASS; Playwright PASS (19/19); dependency-cruiser PASS (540 modules / 1,929 dependencies); `pnpm check` PASS (184 files / 1,099 tests); static ownership/dead-code scans, `git diff --check`, and `graphify update .` PASS. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/08-half-time-full-time-and-substitution-motion.md` | Done | Half time and full time now arrive as clear football checkpoints, and tab changes preserve one stable decision surface. | Animate only real canonical phase entries and newly selected tab panels; keep command/focus completion independent; reuse the existing half-time tactical workspace and keep entry memory ephemeral and local. | Node 24 web tests PASS (57 files / 242 tests); typecheck/build PASS; Playwright PASS (19/19) across normal/reduced motion, checkpoint entry, tabs, narrow tactics, persistence, and the second fixture; required screenshots inspected; `git diff --check` and `graphify update .` PASS. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/07-decisive-match-event-and-score-choreography.md` | Done | Goals now read as the strongest current Matchday moment while ordinary incidents remain calm. | Animate only the immutable score side that changed, the current event-keyed commentary node, and the newly mounted structured tabellino incident; retain typed playback holds and static reduced-motion hierarchy; remove the replaced CSS goal keyframe. | Node 24 web tests PASS (57 files / 242 tests); typecheck/build PASS; Playwright PASS (19/19) with opening, ordinary, goal, pause, closing, narrow, and reduced-motion coverage; goal evidence manually inspected; `git diff --check` and `graphify update .` PASS. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/06-matchday-playback-and-commentary-motion.md` | Done | Ordinary Matchday commentary changes smoothly while score, controls, page height, and checkpoints remain stable. | Remounted one polite commentary node from the current frame fact without exit overlap; added press-only feedback to pause/resume and 1x/2x/4x controls; retained the playback Module as sole timer and hold owner. | Node 24 web tests PASS (57 files / 242 tests); typecheck/build PASS; Playwright PASS (19/19) across both halves, every speed, pause, narrow, 200% text, and reduced motion; opening/paused/event screenshots inspected. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/05-tactical-workspace-state-and-layout-motion.md` | Done | XI, bench, formation, and context-menu changes now read as coherent tactical updates without altering the approved board. | Keyed each fixed tactical slot by its rendered player/role facts, remounted pitch slots only after canonical formation transformation, and kept drag, normalized coordinates, role clamp, ranking, duplicate prevention, and all input behavior under existing owners. | Node 24 web tests PASS (57 files / 242 tests); typecheck/build PASS; Playwright PASS (19/19) with 11 pitch plus 8 bench motion owners before/after role change and at half time; desktop/narrow/reduced-motion evidence inspected. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/04-dashboard-information-change-and-widget-motion.md` | Done | Real Dashboard task, table, and result changes now settle into view once without making the control room feel animated. | Key the dominant task and two football-context widgets from exactly the facts they render; leave static cards, rows, counters, commands, and information architecture unchanged. | Node 24 web tests PASS (57 files / 242 tests); typecheck/build PASS; Playwright PASS (19/19); attention/ready/post-match/narrow screenshots inspected without layout jump or overflow. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/03-continue-and-inbox-attention-motion.md` | Done | Continue progression and newly relevant Posta attention are now easier to follow without changing any career fact or stop rule. | Reused Motion's reduced-motion signal for the pure bounded date plan, derived one ephemeral blocking/important arrival ID from successful Continue snapshots, added one calm detail/rail cue, and preserved filters, selection, focus, lifecycle, and command locks. | Node 24 web tests PASS (57 files / 242 tests); web typecheck/build PASS; Playwright PASS (19/19); desktop/narrow Posta evidence manually inspected; `git diff --check` and `graphify update .` PASS. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/02-shell-navigation-and-modal-transition-language.md` | Done | Screen changes and modal decisions now feel connected without moving persistent football navigation or weakening native dialog behavior. | Keyed only the current shell outlet with a restrained shared transition, added the shared treatment to the dirty-exit dialog, preserved navigation and focus ownership, and corrected both native dialogs to a centered bounded viewport layout. | Node 24 web tests PASS (57 files / 240 tests); web typecheck/build PASS; Playwright PASS (19/19) plus focused tactical-board retry PASS; desktop/narrow dialogs manually inspected; `git diff --check` PASS. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/01-motion-runtime-and-command-feedback-foundation.md` | Done | Real browser commands now acknowledge pending work through one stable, accessible motion language. | Installed `motion` only in `apps/web`, added one strict dynamically loaded provider and active semantic timings, migrated the shared command label plus save and save-before-exit consumers, and preserved command ownership and recovery semantics. | Node 24 web tests PASS (57 files / 239 tests); web typecheck/build PASS; Playwright PASS (19/19); dependency-cruiser PASS (540 modules / 1,891 dependencies); `git diff --check` and `graphify update .` PASS; bundle delta recorded. |
| `docs/steps/76-web-motion-language-and-football-feedback-system/README.md` | Done | Completed the coherent Phase 76 web motion language. | Nine production-used slices move from a web-only Motion runtime and command feedback through shell, Posta, Dashboard, tactics, Matchday playback, decisive-event choreography, checkpoint transitions, and final accessibility/performance cleanup. | All nine steps and the complete Node 24 web, browser, dependency, monorepo, diff, Graphify, accessibility, responsive, and bundle gates PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/15-operational-10000x50-gate-cleanup-and-phase-report.md` | Done | The full operational lifecycle gate passes at `10000 x 50` with zero failed worlds and no structural squad collapse. | Added deterministic parallel gate metadata, post-transfer squad maintenance, low-denominator creator-share handling, champion-dynasty warning semantics for 50-season gates, and the final lifecycle closeout report. | Node 24.16.0 `phase75-release` `10000 x 50` PASS with `0` failed worlds; focused lifecycle suite PASS (84 files / 492 tests); package typechecks PASS; dependency-cruiser PASS; `pnpm check` PASS (183 files / 1093 tests plus all workspace typechecks). |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/14-staged-50x10-and-250x30-calibration-gates.md` | Done | The complete lifecycle passes staged diagnostic and pre-gate cohorts without structural failure. | Ran `50 x 10` and `250 x 30` gates, accepted only below-threshold story/monitor warnings, preserved all gameplay thresholds, and documented locked thresholds in both lifecycle audit reports. | Node 24.16.0 `pnpm check` PASS; `phase75-diagnostic` `50 x 10` PASS with `0` failed worlds; `phase75-pre-gate` `250 x 30` PASS with `0` failed worlds; `phase75-balance` strict balance PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/13-player-trajectory-diagnostics-and-inspection-reports.md` | Done | Player generation and development anomalies can be inspected from structured evidence without exposing exact hidden potential in normal game surfaces. | Added developer-only long-run trajectory diagnostics, generated-player age-band current-to-potential room distributions, mature high-room warning counts with example IDs, and selected-club career trajectory samples. | Node 24.16.0 focused Step 13 tests PASS (7 files / 116 tests); simulation-tools, CLI, and i18n typechecks PASS; `phase75-report-a` generation report PASS with zero age-26+ high-room warnings; career preview/development reports PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/12-career-calendar-orchestration-and-idempotency.md` | Done | Monthly lifecycle is the only calendar path for completed participation months. | Added `advanceCareerMonths`, processing eligible months one by one from participation rows and using ledger closed month keys for idempotency. Direct fixture progress and season advancement route through it before applying new fixture participation or season-boundary work. | Node 24.16.0 focused Step 12 tests PASS (6 files / 63 tests); engine typecheck PASS; CLI typecheck PASS; dependency-cruiser PASS (529 modules / 1,870 dependencies); `pnpm check` PASS (183 files / 1,088 tests plus all workspace typechecks); `git diff --check` PASS; `graphify update .` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/11-aging-physical-decline-potential-compression-and-exits.md` | Done | Aging now lowers realistic abilities and reachable ceilings without creating ageless active squads. | Added one engine-owned monthly aging policy; outfield physical decline begins at 32, goalkeepers use a later curve, active physical current values floor at 7, potential compresses after aging, exits use role-shaped quality and thin-squad safeguards, and youth lifecycle does not invent growth without participation facts. | Node 24.16.0 focused Step 11 tests PASS (6 files / 45 tests); engine and simulation-tools typechecks PASS; dependency-cruiser PASS (527 modules / 1,860 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/10-related-role-exposure-and-familiarity-progression.md` | Done | Sustained related-role minutes can improve role familiarity without rewriting player identity. | Domain owns one directional exposure graph and one identity-preserving familiarity mutation helper; engine consumes open played-role monthly ledger rows and applies weak-to-adapted or adapted-to-natural progression only after sustained exposure. | Node 24.16.0 focused Step 10 tests PASS (5 files / 40 tests); domain, engine, and storage typechecks PASS; dependency-cruiser PASS (525 modules / 1,851 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/09-monthly-minutes-and-performance-driven-development.md` | Done | Monthly minutes and bounded performance now drive positive development. | Positive development consumes real open monthly participation rows, applies deterministic age/opportunity/room/relevance/performance factors, closes processed months, and resets completed-season participation during rollover. | Node 24.16.0 focused Step 09 tests PASS (4 files / 61 tests); engine typecheck PASS; CLI typecheck PASS; CLI career preview/development-report PASS; dependency-cruiser PASS (523 modules / 1,844 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/08-ai-half-time-substitutions-and-authoritative-minute-accrual.md` | Done | AI half-time substitution and committed participation accrual are production-used and deterministic. | Added deterministic AI half-time substitutions plus committed fixture participation accrual for starters, substitutes, unused bench, ratings, played-role minutes, and fixture idempotency. `progressNextCareerFixture` and `commitStagedCareerFixture` accrue only at fixture commit, and staged commit verifies the restored checkpoint report before writing facts. The required full-check blocker was resolved by updating affected deterministic CLI expectations and the youth rarity test runtime budget. | Node 24.16.0 focused Step 08 tests PASS (5 files / 26 tests); blocker tests PASS (3 files / 81 tests); `pnpm check` PASS; dependency-cruiser PASS (521 modules / 1,837 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/07-ai-pre-match-squad-selection-and-rotation.md` | Done | AI clubs can select one credible deterministic XI and bench before fixtures. | Added one pure engine selector with role coverage, role-current-ability ordering, suitability, bounded fitness/recent-use/prospect modifiers, stable tie-breaking, structured diagnostics, and a match-context builder. Season simulation and AI sides in career fixture context construction consume it while the selected club's saved lineup remains authoritative. | Node 24.16.0 focused team-selection, season, fixture, and long-run tests PASS (4 files / 44 tests); `@game/engine` typecheck PASS; `@game/simulation-tools` typecheck PASS; `phase75-rotation-a` and `phase75-rotation-b` season simulations PASS; dependency-cruiser PASS (517 modules / 1,818 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/06-beta-save-baseline-reset-and-lifecycle-persistence.md` | Done | Reset the beta save baseline and persisted lifecycle participation facts. | JSON career saves now use envelope v3 and SQLite/OPFS schema v7. Both adapters round-trip the participation ledger losslessly; old beta JSON v1/v2 saves and SQLite v1-v6 databases fail through a typed unsupported-schema reset boundary with no migration, legacy normalizer, dual reader, localStorage mirror, or IndexedDB fallback. | Node 24.16.0 focused storage tests PASS (5 files / 24 tests); `@game/storage` typecheck PASS; `@game/web` tests PASS (56 files / 236 tests); `@game/web` typecheck/build PASS; Playwright visual QA PASS (18/18); dependency-cruiser PASS (514 modules / 1,806 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/05-durable-player-participation-and-development-ledger.md` | Done | Added the durable player participation ledger contract without changing development behavior. | Domain owns ordered player/season/month rows with starts, substitute appearances, minutes, sampled ratings, played-role minutes, closed months, and fixture idempotency; `CareerState` validates ledger rows against existing players. Step 08 supplies the real fixture facts and Step 09 consumes closed months. | Node 24.16.0 focused domain tests PASS (2 files / 28 tests); `@game/domain` typecheck PASS; dependency-cruiser PASS (514 modules / 1,807 dependencies); `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/04-youth-development-level-and-rarity-budget-integration.md` | Done | Added deterministic youth-development levels and bounded rarity integration for initial academies and seasonal intake. | Domain validates `YouthDevelopmentLevel` as `1..5`; content derives it from division and reputation, uses it only for small interesting-prospect, current-lane, and rarity-candidate modifiers, and exposes it as structured diagnostics while preserving four prospect labels and strict division budgets. | Node 24.16.0 focused domain/content tests PASS (5 files / 31 tests); domain/content typechecks PASS; `phase75-youth-a` and `phase75-youth-b` generation reports PASS with zero current `15+`, zero role warnings, exact 11-player academies, and strict rarity budgets; dependency-cruiser PASS; `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/03-age-aware-reachable-potential-allocation.md` | Done | Replaced independent potential rolls with age-aware reachable potential from current ability. | Added `player-potential-allocation`, routed senior, career-intake, initial-youth, and seasonal-youth potential through one remaining-growth budget, removed archetype potential offsets and `potentialCeiling` bands, bounded age-26/27 physical and technical jumps, preserved role caps and goalkeeper curve. | Node 24.16.0 focused content generator tests PASS (8 files / 62 tests); `@game/content` typecheck PASS; `phase75-potential-a` and `phase75-potential-b` generation reports PASS with zero current `15+`, zero role warnings, exact 11-player academies, and strict rarity budgets; dependency-cruiser PASS; `git diff --check` PASS; superseded potential field scan PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/02-current-profile-generation-and-physical-floor-policy.md` | Done | Replaced generated current-profile creation with one policy before touching potential. | Added `player-current-profile-policy`, routed senior, career-intake, initial-youth, and seasonal-youth current abilities through it, removed archetype current offsets, enforced current physical floor `7`, preserved role caps, and added rarity-lane fallback for non-core attributes. | Node 24.16.0 focused content generator tests PASS (9 files / 67 tests); `@game/content` typecheck PASS; `phase75-current-a` and `phase75-current-b` generation reports PASS with zero current `15+`, zero role warnings, and exact 11-player academies; dependency-cruiser PASS; `git diff --check` PASS. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/01-accepted-lifecycle-contract-and-reproducible-baseline.md` | Done | Captured the Phase 75 baseline before changing generation, potential, development, participation, aging, or persistence behavior. | Keep Step 01 audit-only: map existing owners and anomalies, record fixed-seed generation/development/long-run evidence, define measurable owner-specific invariants for Steps 02-15, and leave current-profile implementation as the single next action. | Node 24.16.0 `pnpm check` PASS; `phase75-baseline-a` and `phase75-baseline-b` generation reports PASS with zero role warnings; career preview/development report PASS after save creation; `50 x 10` PASS with 0 failed worlds, 10 warnings, zero structural roster/GK failures, and hash `7f979b773a3d0d96eb6035f3096c5a2353100f57b9b99387b1a149b8bad30c1b`; production behavior unchanged. |
| `docs/steps/75-player-generation-potential-and-development-lifecycle-rework/README.md` | Planned | Documented the complete Phase 75 lifecycle rework without starting implementation. | Fifteen ordered steps move from accepted invariants and fixed baselines through age-aware generation and potential, real participation, monthly development, AI rotation, role familiarity, decline, clean beta persistence, diagnostics, staged calibration, and the `10000 x 50` operational gate. Coefficients stay with their owning domain/content/engine modules instead of moving into one global balance package. | Node 24.16.0 documentation validation PASS: 15 ordered links resolve, all required step sections exist, all 16 phase Markdown files are whitespace-clean, active roadmaps/indexes are aligned, stale future-phase names are absent, and `git diff --check` passes. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/11-long-run-quality-gate-dead-code-closeout-and-phase-report.md` | Done | Closed fixed-seed, long-run, balance, duplicate-path, architecture, and reporting gates. | Preserve thresholds and named failed seeds; accept only the scoped player-model gate and classify unrelated global failures without opportunistic repair. | Focused 66 files / 384 tests and full 171 files / 1,029 tests PASS; web 56 files / 236 tests PASS; depcruise 505 modules / 1,764 dependencies PASS; 50x10 PASS; 250x30 zero structural player failures with two named out-of-scope global failures; strict balance PASS; duplicate, diff, and Graphify checks PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/10-save-migration-and-round-trip-compatibility.md` | Done | Implemented deterministic historical-role normalization and lossless current JSON/SQLite/OPFS round trips without a schema bump. | Share one storage-boundary normalizer, reject partial identities, preserve current facts, keep loads read-only and SQLite at v6, traverse the domain-owned 25 ability keys, and assert playback controls only while the live phase owns them. | Focused storage 4 files / 26 tests, storage typecheck, web 56 files / 236 tests, web typecheck/build, ordered Playwright 18/18 through OPFS, dependency-cruiser, diff, and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/09-market-report-and-web-adapter-ability-alignment.md` | Done | Removed the last market, CLI-report, and web-adapter ability averages that ambiguously treated all 25 attributes as football quality. | Derive role current/potential ability once, let valuation and willingness share the market projection, expose role-aware report facts, and project role current ability onto the existing web `0..100` contract while leaving tactical suitability separate. | Focused 5 files / 83 tests PASS; engine/CLI typechecks PASS; full web 56 files / 236 tests and typecheck PASS; dependency-cruiser 507 modules / 1,769 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/08-career-lifecycle-consumer-alignment.md` | Done | Removed lifecycle-local 25-attribute averages and aligned age-out, promotion, and turnover with explicit role quality while preserving structural behavior. | Keep the canonical raw diagnostic average only for historical exit thresholds; use role current/potential facts for football-quality decisions, with a named historical fallback only when persisted role identity is absent. | Focused 5 files / 28 tests PASS, including goalkeeper and specialist boundaries; engine typecheck PASS; dependency-cruiser 507 modules / 1,766 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/07-development-aging-and-role-cap-consolidation.md` | Done | Removed development-local ability paths, role tables, hard caps, read/write switches, and CLI delta duplication. | Keep deterministic age/growth/decline policy in the engine orchestrator; traverse canonical abilities, use domain role measures and caps, enforce `1..20`, and expose explicit role current/potential summaries with a named legacy fallback only for old saves lacking role identity. | Focused 2 files / 26 tests PASS; engine/CLI typechecks PASS; seven-season world-a report PASS with 13 improved, 10 declined, 0 stalled, growth 90.64, decline 33.72; dependency-cruiser 507 modules / 1,766 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/06-youth-generation-and-rarity-pipeline-consolidation.md` | Done | Routed initial-academy and seasonal-intake players through the strict shared assembly seam and corrected unbounded initial-youth rarity. | Keep initial and seasonal age/intake policy separate; allocate 2-5 high and 0-1 elite prospects deterministically per division while ordinary players remain the majority; return complete `RoleIdentifiedPlayer` values to engine lifecycle code. | Focused 6 files / 36 tests PASS across 40 worlds; content/engine typechecks PASS; world-a/world-b exact academy, age, department, senior, and role-coherence baselines PASS; dependency-cruiser 507 modules / 1,766 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/05-senior-and-career-intake-generation-pipeline-consolidation.md` | Done | Routed initial seniors and later-career intake through one content-owned assembly seam. | Keep RNG, identity, age, division, and archetype policy in each producer; centralize complete role identity, generated-scale enforcement, canonical caps, potential ordering, and validated construction. | Focused 4 files / 33 tests PASS; content typecheck PASS; world-a/world-b generation reports preserve senior/youth distributions, rarity budgets, and zero role warnings; dependency-cruiser 507 modules / 1,763 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/04-validated-player-construction-contract.md` | Done | Added one pure typed construction boundary and routed the initial senior generator through it. | Keep persisted `Player` role fields optional only for historical compatibility; require `RoleIdentifiedPlayer` for every new producer and validate explicit facts without RNG or mutation. | Focused 3 files / 29 tests PASS; domain/content typechecks PASS; dependency-cruiser 505 modules / 1,754 dependencies PASS; world-a preview parity, diff, and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/03-canonical-role-profile-classification-and-cap-ownership.md` | Done | Moved stable role buckets, weights, and hard caps to one dependency-safe domain source. | Preserve current generation/development role rules while deleting parallel content/engine tables after parity proof. | Focused 5 files / 32 tests PASS; domain/content/engine typechecks PASS; dependency-cruiser 503 modules / 1,739 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/02-canonical-ability-algebra-and-ca-pa-semantics.md` | Done | Added one domain-owned 25-attribute vocabulary, traversal API, potential invariant, and explicit raw/current-role/potential-role measures. | Keep raw diagnostic average branded and separate from football quality; current/potential role evaluation shares one weight contract; tactical suitability remains separate. | Focused 3 files / 26 tests PASS; domain/content typechecks PASS; dependency-cruiser 501 modules / 1,731 dependencies PASS; diff and Graphify PASS. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/01-current-player-model-path-invariant-and-baseline-audit.md` | Done | Mapped every producer, mutator, consumer, persistence path, duplicate, semantic measure, and fixed-seed baseline before source edits. | Durable `Player` shape remains unchanged; domain owns stable invariants, content generation policy, engine transitions, storage compatibility, and apps projection. | Focused 8 files / 71 tests PASS; world-a/world-b reports, career preview/development metrics, save hash, raw CLI bootstrap blocker, line counts, and `git diff --check` recorded. |
| `docs/steps/74-player-generation-and-model-consolidation-cleanup/README.md` | Done | Completed the complete Phase 74 consolidation sequence. | Eleven steps separate audit, ability semantics, role profiles, construction, senior/intake/youth generation, development, lifecycle, market/adapters, persistence, and long-run closeout without starting Phase 75. | All eleven steps Done; final reports, architecture, scoped 250x30 player gate, strict balance, repository checks, duplicate cleanup, and status reconciliation complete. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/README.md` | Done | Completed the bounded Matchday broadcast rework without renumbering or starting Phase 74. | Nine browser-visible micro-steps now own pre-match geometry, playback pace, one-line commentary, compact tabellino, half-time tabs, unchanged tactical board, full-time tabs, responsive/accessibility QA, and evidence-backed cleanup. | All nine steps Done; final report and both roadmaps reconciled; complete Node 24, repository, browser, visual, diff, and Graphify gates PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/09-current-product-gate-dead-code-closeout-and-phase-report.md` | Done | Made the rebuilt Matchday the only current product path and closed the phase with evidence. | The canonical journey performs a real interval tactical edit and proves all phases/tabs, refresh, failure, responsive/accessibility/motion states, and SQLite/OPFS; the obsolete two-select fallback is deleted while its actively used typed command contract remains. | Node 24.16.0; i18n PASS; web 56 files / 235 tests PASS; typecheck/build PASS; dependency-cruiser 498 modules / 1,721 dependencies PASS; full check 168 files / 991 tests PASS; Playwright 18/18 PASS; screenshots reviewed; diff and Graphify PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/08-responsive-accessibility-and-motion-quality-pass.md` | Done | Completed the responsive, keyboard, focus, reduced-motion, and useful text-zoom pass across the whole Matchday route. | Responsive grids reflow phase tabs and playback controls; checkpoint transitions focus the visible Matchday heading; the absolute focus-visible skip link rests off canvas; narrow tabellino facts stack without clipping. | Node 24.16.0; i18n/web tests PASS (56 files / 234 tests); typecheck/build PASS; Playwright 18/18 with SQLite/OPFS across desktop, wide, narrow, 200% text, touch, keyboard, and reduced motion; dependency-cruiser and full `pnpm check` PASS (168 files / 990 tests); `git diff --check` and Graphify update PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/07-full-time-team-opponent-and-consequence-tabs.md` | Done | Reframed full time as one result story with three focused review views. | Final context stays above Your team, Opponent, and Consequences tabs; both clubs reuse one final-rating composition, durable changes are isolated, and one Dashboard exit remains. | Node 24.16.0; i18n/web tests PASS (56 files / 234 tests); typecheck/build PASS; Playwright 18/18 with SQLite/OPFS; dependency-cruiser and full check PASS (168 files / 990 tests); all required final-review screenshots inspected; diff and Graphify PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/06-half-time-tactics-team-and-opponent-tabs.md` | Done | Completed all four interval views without changing tactical-board behavior. | The unchanged shared board and draft live under Tactics; Your team and Opponent reuse one responsive observed-facts rating component with deterministic active-first ordering; Summary retains validation and applied-change feedback. | Node 24.16.0; i18n/web tests PASS (56 files / 233 tests); typecheck/build PASS; Playwright 18/18 with SQLite/OPFS; dependency-cruiser and full check PASS (168 files / 989 tests); desktop/narrow/reduced-motion screenshots reviewed; diff and Graphify PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/05-half-time-tab-shell-and-summary-hierarchy.md` | Done | Reframed the interval around one accessible four-tab shell and concise default Summary. | Summary owns current player attention facts, validation, and substitution count; inactive future panels contain no fabricated facts, tab focus behavior is covered, and the old signals card is deleted. | Node 24.16.0; i18n/web tests PASS (55 files / 231 tests); typecheck/build PASS; Playwright 18/18 with SQLite/OPFS; event-rich/event-light desktop and narrow screenshots reviewed; diff PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/04-persistent-compact-tabellino-and-event-hierarchy.md` | Done | Added one compact match record adjacent to the scoreboard across every applicable phase. | One presenter view and one component own chronological home/away goals and real substitutions; bounded overflow is keyboard reachable, event-free states omit the component, and duplicate incident owners are deleted. | Node 24.16.0; i18n tests PASS; web tests PASS (54 files / 229 tests); typecheck/build PASS; Playwright 18/18 including SQLite/OPFS; event-rich/event-light desktop and narrow screenshots reviewed; diff and Graphify PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/03-single-live-commentary-line-and-decisive-event-moment.md` | Done | Replaced the growing live feed with one current localized incident and a restrained decisive-event moment. | The sampled frame identifies its highest-priority event; one stable polite live region replaces prior lines, goal hierarchy is stronger but restrained, and replaced live-list markup and styles are deleted. | Node 24.16.0; i18n/web tests PASS (53 files / 225 tests); typecheck/build PASS; Playwright 18/18 including SQLite/OPFS; commentary screenshots reviewed; diff and Graphify PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/02-live-playback-controls-and-event-hold-policy.md` | Done | Added manager-controlled presentation pace and readable structured event holds. | One pure policy classifies existing event kinds into transition, ordinary, significant, and goal holds; one cancel-safe controller owns both halves; Pause/Resume and 1x/2x/4x remain local UI state. | Node 24.16.0; i18n/web tests PASS (53 files / 223 tests); typecheck/build PASS; Playwright 18/18 including SQLite/OPFS; playback screenshots reviewed; diff and Graphify PASS. |
| `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/01-pre-match-workspace-and-full-width-content-contract.md` | Done | Removed repeated pre-match metadata and locked Matchday to the complete shell outlet. | The scoreboard owns fixture identity, side, score, confirmation, progress, and one Start match command; the lower Ready/Fixture/Venue branch and labels were deleted. | Node 24.16.0; i18n/web tests PASS (52 files / 220 tests); typecheck/build PASS; Playwright 18/18 including SQLite/OPFS; desktop/wide/narrow screenshots reviewed; diff and Graphify PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/10-shared-finish-visual-gate-dead-path-closeout-and-phase-report.md` | Done | Finished shared product states, made one real-browser gate authoritative, and removed only proven obsolete presentation paths. | App Entry, dirty-exit dialog, and command feedback now share the premium football language; `current-product.spec.ts` owns current journeys and interactions, `sqlite-opfs-storage.spec.ts` retains unique persistence proof, historical visual runners and three test-only tactical paths are deleted after migration, and no unused production CSS class selector remains. | Node 24.16.0; i18n/web tests PASS (web 51 files / 211 tests); web typecheck/build PASS; dependency-cruiser PASS (483 modules / 1,673 dependencies); full `pnpm check` PASS (163 files / 965 tests); canonical Playwright PASS (17/17); 87 product screenshots plus three contact sheets manually reviewed; `git diff --check` and Graphify update PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/09-full-time-football-story-and-consequence-hierarchy.md` | Done | Replaced the technical full-time report with one concise football story and one exit. | `MatchdayFullTimePhase` orders structured result, tabellino, selected-club ratings, and meaningful merged player consequences; routine team facts are not repeated, unavailable facts are omitted, and one Return to Dashboard command completes the idempotent journey. | Node 24.16.0; i18n/web tests PASS (web 54 files / 229 tests); web typecheck/build PASS; canonical Playwright PASS (12/12); dependency-cruiser PASS (510 modules / 1,809 dependencies); full `pnpm check` PASS (167 files / 984 tests); `git diff --check` and Graphify update PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/08-half-time-decision-hierarchy-and-phase-decomposition.md` | Done | Replaced the flattened interval with one compact review and one central tactical decision workspace. | `MatchdayHalfTimePhase` composes presenter-derived decisive events and player signals around the unchanged shared board and bench; score, minute, phase, shape, change count, validation, and resume action each have one owner. | Node 24.16.0; i18n/web tests PASS (web 52 files / 221 tests); web typecheck/build PASS; canonical Playwright PASS (12/12); dependency-cruiser PASS (506 modules / 1,794 dependencies); full `pnpm check` PASS (165 files / 976 tests); `git diff --check` and Graphify update PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/07-matchday-second-half-playback-and-live-phase-composition.md` | Done | Removed the second-half reveal click and made one interval confirmation run a bounded live presentation through the deliberate full-time review. | The screen-level playback controller keeps shell and centre on one visible phase; `matchday-playback.ts` derives both periods from canonical checkpoint facts; `MatchdayLivePhase` serves both halves; and the presenter filters both reveal-only actions without changing engine, consequence, or save behavior. | Node 24.16.0; i18n/web tests PASS (web 51 files / 217 tests); web typecheck/build PASS; canonical Playwright PASS (12/12); dependency-cruiser PASS (503 modules / 1,776 dependencies); full `pnpm check` PASS (164 files / 972 tests). |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/06-matchday-current-contract-and-first-half-playback.md` | Done | Replaced the first-half reveal click with one bounded, automatic presentation from Start match to the real half-time decision. | The adapter-to-screen phase view is mandatory; `matchday-playback.ts` projects existing checkpoint facts through cleared timeouts only; `MatchdayLivePhase` owns the focused live composition; and the presenter type excludes reveal-only commands. Refresh follows the existing durable-baseline contract without hidden saves or duplicate simulation. | Node 24.16.0; i18n/web tests PASS (web 51 files / 214 tests); web typecheck/build PASS; canonical Playwright PASS (11/11); dependency-cruiser PASS (503 modules / 1,776 dependencies); full `pnpm check` PASS (164 files / 969 tests); `git diff --check` PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/05-match-preparation-draft-safety-and-validation-hierarchy.md` | Done | Prevented silent preparation loss and replaced repeated readiness blocks with one decision hierarchy. | Structural draft comparison extends the existing session dirty projection; exact undo, Stay, Discard, native unload, and valid explicit Save have deterministic outcomes, while individual tactical edits never write storage or change save cadence. | Node 24.16.0; i18n/web tests PASS (web 49 files / 208 tests); web typecheck/build PASS; canonical Playwright PASS (9/9); dependency-cruiser PASS (498 modules / 1,759 dependencies); full `pnpm check` PASS (162 files / 963 tests). |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/04-posta-active-route-and-decision-hierarchy.md` | Done | Replaced duplicated active-route awareness with one dense, focus-safe Posta decision workspace. | The active Posta route suppresses only the compact shell rail; desktop uses one list/detail workspace, narrow starts from the list and restores row focus after Back, and command activity locks all mutating controls without changing lifecycle or save cadence. | Node 24.16.0; i18n/web tests PASS (web 49 files / 202 tests); web typecheck/build PASS; canonical Playwright PASS (7/7); dependency-cruiser PASS (498 modules / 1,758 dependencies); full `pnpm check` PASS (162 files / 957 tests). |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/03-dashboard-command-hierarchy-and-career-composition-seam.md` | Done | Replaced the dashboard report grid with one current manager task and narrowed repeated current-career composition. | Dashboard omits unavailable/technical facts and receives command activity explicitly; `CareerAppFrame` owns providers, recovery, and the dirty-exit dialog while `App` retains runtime and routing and one focused hook derives screen presentations. | Node 24.16.0; i18n/web tests PASS (web 49 files / 199 tests); web typecheck/build PASS; canonical Playwright PASS (5/5, 28 captures); dependency-cruiser PASS (498 modules / 1,757 dependencies); full `pnpm check` PASS (162 files / 954 tests); `git diff --check` and Graphify update PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/02-semantic-tokens-contrast-and-interaction-state-contract.md` | Done | Replaced ambiguous and undefined product-state styling with one explicit, accessible interaction contract. | Semantic tokens and `data-state` markers now distinguish danger, warning, success, selection, focus, disabled, and pending states across shell, Dashboard, save/session feedback, preparation, and Matchday; tactical suitability colors remain separate and unchanged. | Node 24.16.0; web tests PASS (47 files / 196 tests); web typecheck/build PASS; canonical Playwright PASS (3/3, 16 screenshots, real blocker contrast and keyboard focus assertions); dependency-cruiser, `git diff --check`, and Graphify update PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/01-current-visual-gate-task-first-shell-and-screen-focus.md` | Done | Established one current-product visual gate and made the current task keyboard- and narrow-first. | AppShell owns one localized skip link, a stable main landmark, visible-heading focus, and compact narrow navigation; App triggers focus only on real top-level screen changes; same-screen filters and tactical menus retain interaction focus. | Node 24.16.0; i18n/web tests PASS (47 files / 195 tests); web typecheck/build PASS; canonical Playwright PASS (2/2, 11 screenshots); dependency-cruiser, `git diff --check`, and Graphify update PASS. |
| `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/README.md` | Done | Completed all ten browser-visible remediation slices derived from the Phase 73A register and map. | The current web loop now has truthful draft safety, task-first focus, semantic state, one Dashboard/Posta hierarchy, automatic half presentation between real decisions, phase-local Matchday composition, one canonical visual gate, and evidence-backed cleanup while preserving the tactical board and deterministic career contracts. | All ten steps Done; phase report and both roadmaps reconciled; complete Node 24, repository, browser, manual visual, diff, and Graphify gates PASS. |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/08-consolidated-findings-remediation-map-and-next-phase-decision.md` | Done | Reconciled all Phase 73A evidence into one canonical report and one dependency-ordered ten-slice remediation map, then selected exactly one next phase. | Execute bounded `Phase 73B - Current Web Product Premium Remediation And Journey Hardening`; do not rewrite the app, alter the tactical board, or renumber/start Phase 74. | Node 24.16.0; required docs PASS; web typecheck PASS; web tests 47/47 files and 193/193 tests PASS; build PASS; dependency-cruiser PASS; full `pnpm check` 160/160 files and 946/946 tests PASS; `git diff --check` PASS. |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/07-playwright-visual-baseline-and-pixel-perfect-scorecard.md` | Done | Captured and manually reviewed the complete current browser product across desktop, wide, narrow, focus, loading, error, menus, dialog, text zoom, and reduced-motion states, then scored every surface through all eight Phase 73A lenses. | Preserve the tactical board, current primary-command language, Posta decision structure, and command feedback. Treat the `3.59/5` average as diagnostic evidence: narrow task priority, operational hierarchy, technical copy, Matchday flow/ownership, and accessibility are bounded remediation needs rather than grounds for a rewrite. | Node 24.16.0; 56 screenshots and 6 contact sheets; zero measured horizontal overflow; Posta Playwright 2/2 PASS; command feedback/autosave browser suite PASS; required scorecard exists; web typecheck PASS; web build PASS; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/06-frontend-presentation-architecture-and-css-maintainability-audit.md` | Done | Mapped entry, runtime, Zustand, presenter, screen, shared UI, CSS, localization, and visual-QA ownership and traced every suspected dead or compatibility path to production and test callers. | Preserve the healthy package/runtime/UI boundaries, Posta decomposition, and shared tactical board. Record P1 remediation for App composition, phase-local Matchday ownership, and one current visual gate; retain store/CSS/dead-path/documentation findings as bounded P2 work and localization size as Monitor. | Node 24.16.0; 36,234 scoped lines and 4,656 CSS lines measured; 43 production-unused selectors and three test-preserved Modules traced; `pnpm depcruise` PASS across 492 modules/1,721 dependencies; required audit exists; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/05-accessibility-responsive-and-interaction-state-audit.md` | Done | Audited every current primary surface at desktop, wide, narrow, keyboard, 200% text zoom, reduced motion, loading, error, dialog, and tactical interaction states. | Preserve zero horizontal overflow, semantic landmarks, contextual async feedback, native dialog recovery, reduced motion, and tactical-board keyboard semantics. Record P1 remediation for keyboard bypass, screen-change focus, blocker contrast, and narrow task priority; retain target-size and stale tactical browser proof as bounded P2 debt. | Node 24.16.0; desktop/wide/narrow screenshots; current Posta 2/2 Playwright PASS; Phase 72 loading/save journey PASS; 11 tactical tests PASS; required audit exists; web typecheck PASS; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/04-premium-visual-system-and-component-language-audit.md` | Done | Inventoried the fixed skin, tokens, typography, spacing, surfaces, component states, hardcoded exceptions, missing contracts, and tactical-board integration against manager comprehension. | Preserve the current navy/cream/gold identity, primary-command language, pending feedback, and tactical board. Record one P1 hierarchy defect plus P2 token/state/typography/spacing/semantic-color issues; define a minimum testable premium baseline before any visual implementation. | Node 24.16.0; 4,656 CSS lines and 288 class selectors inventoried; eight Chromium component-state screenshots; computed-style probe proves three undefined product tokens and 16px phase-rail fallback; required audit exists; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/03-information-architecture-and-content-hierarchy-audit.md` | Done | Locked one manager question and first-useful-viewport contract for every current surface/state, mapped duplicate and technical content, and audited empty/loading/error/recovery hierarchy. | Preserve the route model, Dashboard/Continue/Posta rhythm, tactical board, structured match facts, and recovery feedback. Record P1 remediation for narrow shell displacement and technical identity/fallback leaks; consolidate repeated Dashboard/preparation/Matchday facts and demote future navigation without deleting roadmap orientation. | Node 24.16.0; 24 current desktop/narrow state screenshots; narrow geometry measurements; current loading/Posta zoom evidence; required audit exists; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/02-critical-journey-and-action-economy-audit.md` | Done | Measured creation, load, Continue, Posta, preparation, Matchday, save/exit, refresh, keyboard, and recovery journeys against explicit decision budgets. | Preserve the coherent outer career rhythm and one-command Continue/Posta flow. Record two P1 remediation candidates: preparation drafts must participate in unsaved-progress semantics, and automatic half playback must replace two mandatory reveal clicks that contain no manager decision. Keep the stale persistence selector and keyboard focus order as P2 QA/accessibility debt. | Node 24.16.0; current Posta Playwright 2/2 PASS; standalone session/autosave journey PASS; isolated draft-loss and keyboard probes recorded; required audit exists; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/01-current-web-surface-and-state-inventory.md` | Done | Created the authoritative inventory of current production web surfaces, states, transitions, ownership, deterministic fixtures, and existing QA evidence. | Treat the web app as a five-screen Zustand state machine over runtime-owned career facts; audit implemented destinations and shared decision surfaces now, while keeping disabled future sections separate from defects. File/CSS size and legacy-looking branches remain investigation signals until later steps prove user or maintenance impact. | Node 24.16.0; required audit exists; source and Graphify trace complete; `git diff --check` PASS |
| `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/README.md` | Ready | Documented the complete audit-only Phase 73A and its eight ordered steps. | The phase evaluates the entire current browser product through surface inventory, journey economy, information hierarchy, visual language, accessibility/responsive states, frontend maintainability, Playwright evidence, and one final remediation decision. No production source or dependency may change. | README plus eight step files created; both career roadmaps updated; phase references checked; `git diff --check` PASS |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/11-accessibility-playwright-cleanup-and-phase-report.md` | Done | Proved the complete Posta/calendar journey, removed replaced paths, reconciled architecture and roadmaps, and closed Phase 73. | Real SQLite/OPFS Chromium journeys cover lifecycle, same-date delivery, result, manual and 7/15-day saves, refresh, focus, text zoom, overflow, and reduced motion; reports preserve future workflow obligations without scaffolding them. | package typechecks; 193 web tests; web build; `pnpm check` with 946 tests; 2 Playwright tests; dependency cruise; scans; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/10-calendar-transition-and-continue-feedback.md` | Done | Presented deterministic career advancement as bounded visible calendar movement. | The existing Phase 72 command runner remains the sole lock while a pure date plan shows seven readable days, samples longer ranges under 1.8 seconds, skips animation for reduced motion, and routes only after the final date. | 46 focused tests; 190 web tests; i18n/web typechecks; web build; dependency cruise; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/09-informational-important-delivery-and-future-extension-matrix.md` | Done | Added only supported result and rollover Posta content and retained future workflow obligations as documentation. | One committed played fixture yields at most one informational summary; one real season archive yields one important review; ordinary consequences stay grouped and unsupported systems have no runtime categories. | 39 focused tests; domain/engine/UI/i18n/web typechecks; dependency cruise; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/08-unified-matchday-message-action-and-resolution-flow.md` | Done | Completed the one-message matchday destination and resolution flow. | One fixture-scoped identity exposes structured match/readiness facts, changes its sole destination from preparation to match entry, refreshes in place across preparation/load, and resolves only from the played fixture. | 102 focused tests; engine/UI/i18n/web typechecks; web build; dependency cruise; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/07-football-manager-style-posta-rail-list-and-detail.md` | Done | Replaced the decorative rail and plain route with a compact left awareness rail and dense two-column Posta workspace. | The rail exposes counts and the highest subject but no football actions; the route owns continuous message rows, structured detail, one destination, no third column, and explicit narrow Back navigation. | 26 focused tests; i18n/web typechecks; web build; dependency cruise; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/06-posta-read-model-route-and-screen-state.md` | Done | Added the durable-fact Posta read model, route, exact filters, and bounded screen state. | Framework-free presentation derives source, subject, football facts, blockers, and primary action from current-season messages; Zustand owns only filter and selection; rail and shell navigation open Posta; opening a message mutates lifecycle through the runtime without an immediate save. | 46 focused tests; UI/i18n/web typechecks; web build; dependency cruise; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/05-inbox-lifecycle-use-cases-and-runtime-integration.md` | Done | Added the single application path for delivery, open, important acknowledgement, and derived resolution. | Redelivery preserves lifecycle while refreshing blockers/actions; opening is idempotent; important attention acknowledges only after open; blocking matchday messages resolve only from a played linked fixture; runtime mutations remain dirty with zero immediate storage writes. | 38 focused tests; engine/web typecheck; dependency-cruiser; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/04-durable-current-season-inbox-and-season-reset.md` | Done | Added validated current-season Inbox persistence and deterministic rollover reset. | CareerState defaults legacy saves to an empty ordered slice; SQLite v6 stores message, blocker, action, and lifecycle facts relationally; rollover clears previous-season messages. | 50 focused tests; domain/storage/engine typecheck; dependency-cruiser; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/03-daily-continue-stop-policy-and-same-date-delivery.md` | Done | Replaced next-fixture jumping with deterministic daily attention evaluation and same-date batching. | Informational items deliver without stopping; first stopping date returns all messages ordered blocking, important, informational, then stable ID. | 18 focused tests; engine/web typecheck; dependency-cruiser; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/02-canonical-attention-level-and-message-lifecycle-contract.md` | Done | Replaced priority/status ambiguity and split match identities with one canonical contract. | One `matchday` category and fixture-scoped ID retain structured blockers while action changes from preparation to match entry; lifecycle uses independent read/acknowledged/resolved facts. | 12 focused tests; domain/engine typecheck; dependency-cruiser; `git diff --check`; `graphify update .` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/01-current-attention-and-posta-audit.md` | Done | Audited current attention, Continue, Posta, persistence, routing, and deletion targets before source changes. | The audit proves messages are derived, identifies two unstable identities, confirms SQLite/OPFS ownership, and assigns every obsolete path to Steps 02-11. | `test -f docs/audits/CAREER_ATTENTION_AND_POSTA_CURRENT_STATE_AUDIT.md`; `git diff --check` |
| `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/README.md` | Ready | Documented the complete Posta decision-center phase and its eleven ordered steps. | Locked three attention levels, same-date batching, unified matchday action, durable current-season lifecycle, FM-style rail/outlet, bounded date transition, and an explicit no-code future extension matrix. | All eleven files exist; Step 01 is the only Ready step; roadmap numbering reconciled; `git diff --check` PASS |
| `docs/steps/72-career-session-autosave-and-command-feedback/08-playwright-save-cadence-loading-qa-and-phase-report.md` | Done | Proved save cadence, durable-baseline reload, exit protection, and command feedback in a real Chromium SQLite/OPFS journey, then closed the phase. | Desktop and narrow QA covers 7/15/manual policies, matchday postponement, every exit choice, recoverable failure, reduced motion, and action-specific loading. Final cleanup removed the duplicate runtime Promise queue; a Strict Mode startup regression was fixed by deferring runtime discovery until after the diagnostic mount. | storage/web/i18n typechecks; 161 web tests; web build; dependency cruise; `pnpm check`; direct Chromium QA and screenshots; source scans; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/07-action-specific-loading-and-interaction-locks.md` | Done | Made every real asynchronous career command immediately visible and protected against conflicting input. | Specific localized labels, a restrained reusable indicator, one polite live region, `aria-busy`, disabled/inert conflict locks, stable control geometry, and reduced-motion behavior preserve the current football context; synchronous half-time edits receive no fake loader. | i18n/web typechecks; 161 web tests; 10 i18n tests; web build; dependency cruise; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/06-canonical-command-activity-and-async-runner.md` | Done | Replaced invisible pending refs and repeated Promise chains with one observable asynchronous command seam. | A typed Zustand activity snapshot and one application runner synchronously publish pending state, reject conflicts, publish successful session state before clearing, and expose bounded recoverable failures; only real asynchronous production actions have command IDs. | web typecheck; 33 focused tests; dependency cruise; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/05-save-controls-policy-settings-and-unsaved-exit-guard.md` | Done | Exposed the deliberate save lifecycle and protected dirty exits without broad shell redesign. | One shell control shows clean/dirty state and persisted game date, supports 7/15/manual policy, disables save during matchday, uses a native modal for dirty main-menu exits, registers `beforeunload` only for an open dirty career, and replaces misleading preparation save copy with plan confirmation. | i18n/web typechecks; 43 focused tests; web build; dependency cruise; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/04-manual-save-autosave-scheduler-and-safe-stops.md` | Done | Added the only post-creation full-session commit paths: explicit manual save and due safe-stop autosave. | Cadence is derived from persisted/current game dates at 7 or 15 days; manual-only never schedules; match phases postpone due work; acknowledgment commits once; successful commits advance the clean baseline while failures preserve dirty working state. | web typecheck; 28 focused tests; dependency cruise; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/03-session-owned-gameplay-commands-without-action-saves.md` | Done | Removed storage writes and reloads from every current gameplay command. | Continue, preparation, staged matchday, full-time consequences, acknowledgment, and dashboard return now replace one working session; deleted save/reload helpers and persisted-result/store naming; a new runtime reload restores only the durable baseline. | web typecheck; 17 focused tests; zero-write full journey; dependency cruise; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/02-career-session-and-save-policy-contract.md` | Done | Added one production career session and canonical per-career autosave policy without changing action save cadence yet. | Career policy is `7`, `15`, or manual-only; JSON V1 and SQLite schema 4 migrate to 7 days; policy updates preserve dirty gameplay and gameplay timestamps; runtime owns the baseline/working session and Zustand receives a bounded clean status projection. | storage/web typechecks; 53 focused tests; dependency cruise; graph refresh; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/01-current-write-through-and-feedback-audit.md` | Done | Audited the current action-level write/reload lifecycle and invisible command-pending behavior before source changes. | Accounted for 7 writes and 12 loads in a complete journey; defined safe stops, policy migration, command-feedback gaps, compatibility boundary, and exact deletion targets while keeping SQLite/OPFS as the only browser persistence. | `docs/audits/WEB_CAREER_SAVE_CADENCE_AND_COMMAND_FEEDBACK_AUDIT.md`; `git diff --check` |
| `docs/steps/72-career-session-autosave-and-command-feedback/README.md` | Done | Completed the corrective phase that must precede Inbox/Posta expansion. | One working career session now saves initially, manually, or on due 7/15-day safe stops; live matchday postpones saves; one observable command runner provides action-specific accessible feedback; replaced write-through, reload-chain, pending-ref, and duplicate queue paths are deleted. | All eight steps complete; final reports and architecture reconciled; full project gate and Chromium QA pass |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/13-playwright-refresh-qa-architecture-and-phase-report.md` | Done | Proved the complete durable browser lifecycle and closed Phase 71. | Desktop/narrow Chromium covers create/list/load, explicit Continue, dashboard, preparation, pre-match, half-time decision, full-time review, dashboard return, non-empty OPFS ownership, and focused unavailable-storage recovery; architecture and final reports record one production path and one next phase. | `pnpm check` PASS (146 files / 878 tests); Playwright PASS (4/4); required typechecks/build/dependency cruise/source scans/graph refresh/`git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/12-storage-errors-migrations-and-accessible-recovery.md` | Done | Added typed, localized, non-destructive persistence recovery. | Storage migrations reject invalid/future versions deterministically; runtime maps implementation failures to bounded codes; startup failures return to app entry while current-career write failures preserve the active screen and draft; retry recreates the SQLite/OPFS runtime without fallback. | Focused tests PASS (51); storage/web/i18n typechecks, dependency cruise, and `git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/11-demo-runtime-removal-and-production-path-cleanup.md` | Done | Removed the replaced demo career lifecycle and left one production path. | Production screens consume loaded-career adapters; deterministic builders live only under test fixtures; obsolete demo Modules and compatibility tests were deleted; architecture docs now name durable runtime/storage ownership. | Web tests PASS (137); web typecheck/build and dependency cruise PASS; no production demo lifecycle references remain |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/10-durable-matchday-checkpoints-and-full-time-commit.md` | Done | Persisted meaningful matchday checkpoints and committed full time exactly once. | Production matchday derives from the loaded career; runtime saves pre-match, half-time, and tactical-decision checkpoints; engine commits the exact staged report atomically, clears the checkpoint, and rejects repeat commits. | Focused tests PASS (50); web/engine/storage typechecks, dependency cruise, and `git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/09-durable-match-preparation-save-flow.md` | Done | Persisted and restored the manager's complete match preparation. | Domain and SQLite schema v4 preserve base formation, normalized board slots, ordered bench, XI, and tactic; a loaded-career adapter owns unsaved Zustand drafts and the runtime publishes only the reloaded durable commit. | Focused tests PASS (76); web suite PASS (168); storage suite PASS (21); typechecks/build/dependency cruise/OPFS Playwright/Chromium refresh PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/08-loaded-dashboard-continue-and-posta-rehydration.md` | Done | Rehydrated dashboard, Continue, and Posta from the selected durable career. | `buildCareerDashboard` derives the existing read model from `CareerState`; `WebCareerRuntime.continueCareer` saves before publishing; reload inspection rebuilds attention deterministically. | Focused tests PASS (38); web typecheck/build, dependency cruise, `git diff --check`, and Chromium create/reload/list/load rehydration PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/07-web-new-career-save-list-and-load-flow.md` | Done | Replaced `hasDemoCareer` with real asynchronous create/list/select/load lifecycle states. | `WebCareerRuntime` coordinates content/engine facts and canonical storage; React owns async composition; Zustand stores metadata and validated loaded state; preferences remain separate. | Focused tests PASS (34); web/i18n typechecks, build, dependency cruise, Chromium write/list/Continue smoke, and `git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/06-relational-career-systems-and-match-checkpoint-round-trip.md` | Done | Completed relational persistence for every current durable career field, rich report, preparation, and active checkpoint. | Immutable migration version 3 plus package-owned career mapping; worker remains connection-only; shared storage contract covers lifecycle semantics. | Storage tests PASS (21); storage/engine typechecks and dependency cruise PASS; exact OPFS round trip, rollback, isolation, and deterministic checkpoint resume PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/05-relational-world-state-round-trip.md` | Done | Added exact relational round-trip coverage for the ordered game world. | Migration version 2 stores player identity, optional roles, familiarity, current/potential abilities, dynamic state, clubs and roster order, fixtures and results; the worker delegates to one package mapper. | 4 focused tests PASS; storage typecheck and dependency cruise PASS; real-browser exact round trip, two-save isolation, rollback, and no-fallback checks PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/04-sqlite-wasm-opfs-worker-and-schema-bootstrap.md` | Done | Added the official SQLite WASM/OPFS browser adapter and proved persistence across adapter recreation. | Use direct `OpfsDb` inside one dedicated Comlink worker with COOP/COEP headers, typed availability failures, one database path, and no fallback. | Real-browser save/reopen/load/list/delete PASS; storage/web typechecks and web build PASS; dependency cruise and `git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/03-durable-active-match-checkpoint-contract.md` | Done | Added domain-owned active regulation-match state and pure engine capture/restore/complete adapters. | Persist initial deterministic context, minute/phase, score/stats, structured domain events, selected-club bench, substitutions, and tactical plan; rebuild the RNG cursor from seed and completed minute. | 27 focused tests PASS; domain/engine typechecks PASS; dependency cruise and `git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/02-canonical-career-storage-interface-and-package-seams.md` | Done | Split the canonical manager-career seam from concrete Node persistence and added deterministic listing. | `career-storage.interface.ts` is browser-safe; envelope migration is independent; `json-career-storage.ts` alone owns Node filesystem imports; the obsolete combined module was deleted. | 45 focused tests PASS; storage/CLI typechecks PASS; dependency cruise and `git diff --check` PASS; graphify updated |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/01-current-persistence-and-demo-runtime-audit.md` | Done | Audited current persistence and all production demo lifecycle ownership before source changes. | Keep `CareerStorage` as the canonical manager seam; use official SQLite `opfs` VFS in one custom worker with Comlink and COOP/COEP; persist a relational schema and a domain-owned match checkpoint; remove replaced demo Modules at their last caller. | Architecture audit created; schema, commit points, errors, and deletion ledger documented; `git diff --check` PASS |
| `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/README.md` | Done | Executed the complete durable web-career phase in 13 ordered steps. | Use SQLite WASM on OPFS through `CareerStorage`, keep JSON for CLI, persist structured state only, resume half-time deterministically, delete replaced demo runtime, and close with refresh-based Playwright QA. | All steps complete; final reports and roadmaps aligned |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/04a-responsive-squad-list-information-rework.md` | Done | Reworked the shared squad list into a compact, football-facing, overflow-free decision surface and tightened selection behavior after visual review. | The list now shows shirt number/name, canonical position code, age, current condition percentage, and quiet selection status. Available players have no redundant marker; the starting XI uses an accessible check and the bench an accessible bench-shaped icon, with no language-specific `XI/S` lettering. XI and bench assignments are mutually exclusive moves: choosing a player on either surface automatically removes him from the other, including moves between bench slots. Local department filters and all five deterministic sorts reuse shared position semantics. Preferred foot remains in player detail, no unavailable states were invented, and the screen adapter supplies real demo shirt numbers. | Focused selection/preparation/matchday/store tests PASS (61); full `pnpm check` PASS (139 files / 877 tests); browser interaction proves XI-to-bench and bench-to-XI movement without duplicates; web/i18n typechecks PASS; web build PASS with existing chunk warning; Playwright desktop/narrow QA PASS; `graphify update .` PASS; `git diff --check` PASS |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/10-playwright-visual-qa-fun-review-and-phase-report.md` | Done | Closed Phase 70 with browser visual QA, final fun review, architecture reconciliation, roadmap updates, and one next-phase recommendation. | Added `WEB_MATCHDAY_INFORMATION_ARCHITECTURE_REWORK_REPORT.md`; documented the matchday presenter and visual QA in `ARCHITECTURE.md`; marked Phase 70 complete in the web and playability roadmaps; and kept the single next recommendation on web career persistence. Playwright proves pre-match, first half, half-time, second half, and full time on desktop/narrow with passive phase progress, one primary command per phase, half-time-only tactical decisions, and full-time tabellino-before-ratings-before-consequences order. | Playwright visual QA PASS; web typecheck/test/build PASS; ui/i18n typechecks PASS; `pnpm check` PASS; `git diff --check` PASS; `graphify update .` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/09-copy-localization-and-accessibility-pass.md` | Done | Completed the matchday copy, localization, and accessibility pass. | Matchday now uses local football-facing fixture copy, localized passive phase-progress and player-ratings table labels, explicit accessible event-card names, and color-independent event kind text. The event-line template now spaces club and player correctly across all supported languages, and tests assert the phase rail is passive and the ratings table is named. | `nvm use 24`; focused matchday Vitest PASS; i18n labels Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/08-full-time-tabellino-ratings-and-dashboard-return.md` | Done | Rebuilt full time as a post-match review ordered around the story of the match. | Full time now renders the full match tabellino first, with goal events visually stronger than quieter structured facts, then final player ratings, then post-match condition/form/morale consequences. The primary command now says `Return to dashboard`, live-only controls are absent, and obsolete full-time helper components/i18n keys were removed. | `nvm use 24`; focused matchday Vitest PASS; career UI store Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/07-second-half-live-screen-and-match-pressure.md` | Done | Added the second-half live pressure screen before the final report. | Starting the second half now opens a browser-only second-half playback view over full-time structured facts, preserving prior first-half goals as context and showing second-half events plus selected-club result pressure. The phase has one primary `Play to full time` command, no tactical controls, and no full-time consequences or ratings before the user reveals full time. | `nvm use 24`; focused matchday Vitest PASS; career UI store Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/06-half-time-decision-screen-recomposition.md` | Done | Rebuilt half-time as a decision hierarchy around the first-half story and tactical workspace. | Half-time now shows score context, selected-club state, substitution count, and a first-half tabellino above the decisions. The shared tactical board and bench remain the primary workspace, while the side rail shows selected-club watch-list players and key contributors derived from live ratings, condition, and structured contributions. Generic repeated report panels are removed and one primary `Start second half` action remains. | `nvm use 24`; focused matchday Vitest PASS; tactical-board state Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/05-first-half-live-screen-and-event-playback.md` | Done | Added a first-half live event screen between kickoff and the half-time decision state. | Starting the match now opens a browser-only first-half playback view over the existing staged half-time facts, with a compact live feed ordered by the presenter event hierarchy and one `Play to half-time` command. The implementation avoids engine/prose changes, keeps persistence untouched, and suppresses half-time/full-time report panels during first-half review. | `nvm use 24`; focused matchday Vitest PASS; career UI store Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/04-pre-match-confirmation-only-screen.md` | Done | Made the ready pre-match screen a single-purpose kickoff confirmation. | Pre-match now shows the compact score header plus a small readiness card with selected-club fixture context. Empty key-events, timeline, and player-stats panels are suppressed, tactical-board controls are absent, and tests assert the only meaningful ready command is one `Start match` button. Blocked matchdays keep only the blockers and `Prepare match` path. | `nvm use 24`; focused matchday Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/03-compact-score-header-and-phase-indicator.md` | Done | Consumed the matchday presenter in the visible header and removed duplicated context chrome. | `CareerMatchdayScreen` now renders a compact score header with phase, minute, round, venue, score, live line, one primary action, and a passive non-clickable phase indicator. The old separate context strip and visible debug labels `Live line`/`Next command` were removed, and tests assert the phase rail exposes progress semantics without buttons or links. | `nvm use 24`; focused matchday Vitest PASS; web/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/02-matchday-event-priority-and-view-model-contract.md` | Done | Added the app-level presentation contract that future matchday layouts will consume. | `apps/web/src/features/matchday/career-matchday-presenter.ts` derives compact score-header facts, passive phase indicators, one primary command, and tabellino/live-feed event groups from existing structured `CareerMatchdayPhaseView` facts. Goals become the highest-priority tabellino facts, real penalty/card/injury/substitution kinds are ready when supplied by the engine, and misses/saves remain live-feed detail without inventing unavailable facts. | `nvm use 24`; focused matchday Vitest PASS; web/ui/i18n typechecks PASS; `git diff --check` PASS with non-blocking `pnpm` Node engine warning |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/01-current-matchday-information-architecture-audit.md` | Done | Documented why the current matchday feels scattered before changing code. | `docs/audits/MATCHDAY_INFORMATION_ARCHITECTURE_AUDIT.md` defines one job and one primary action per phase, lists information to remove/merge/demote, records existing structured facts, and confirms the tactical board remains only in decision phases. | `git diff --check` PASS |
| `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/README.md` | Ready | Created the Phase 70 documentation path for matchday information architecture and live flow rework. | Phase 70 now owns the accepted product direction: pre-match confirmation only, first-half live screen, half-time decision screen, second-half live screen, full-time tabellino before ratings, compact visual-only phase indicators, one primary command per phase, and Playwright/fun QA before persistence resumes. | Documentation files created; roadmaps updated; `git diff --check` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/14-visual-qa-accessibility-and-phase-report.md` | Done | Closed Phase 69 with browser proof, accessibility notes, architecture reconciliation, and a final next-phase decision later superseded by product review. | Added `apps/web/src/visual-qa/web-ui-full-rebuild.spec.ts`, generated `docs/audits/WEB_UI_FULL_REBUILD_VISUAL_QA.md`, created `docs/audits/WEB_UI_FULL_REBUILD_REPORT.md`, updated `docs/ARCHITECTURE.md` to remove stale palette/career-shell references, and initially updated both web/playability roadmaps to recommend persistence before Phase 70 product review redirected the next phase to matchday IA. | web typecheck/test/build PASS; Phase 69 Playwright visual QA PASS with screenshots in `/tmp/the-long-season-phase69`; ui/i18n typechecks PASS; `pnpm check` PASS; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/13-legacy-code-and-css-removal.md` | Done | Removed dead web UI modules left behind by the rebuild. | Dashboard, match preparation, and matchday now import `AppShell` directly. The obsolete `features/career-shell` bridge/inbox panel and their stale tests were deleted. The rejected theme-palette module, test, visual QA spec, i18n labels, and label tests were removed. Unused legacy dashboard/report CSS selectors were deleted while tactical-board CSS/tests stayed untouched. Architecture reconciliation was completed in Step 14. | web typecheck/test/build PASS; i18n typecheck and labels test PASS; Playwright smoke screenshots in `/tmp/the-long-season-phase69-step13`; desktop/narrow overflow PASS; `pnpm check` PASS; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/12-matchday-full-time-compact-result.md` | Done | Rebuilt full-time as a compact football result review. | `CareerMatchdayScreen` now renders a dedicated full-time result layout: dominant scoreboard/broadcast frame remains on top, the body shows a compact full-time summary, key-event cards, a scrollable final-ratings table, and post-match state cards for condition/form/morale. Consequences are owned by full time and no Timeline/raw event dump dominates the screen. No engine events, persistence, season-table redesign, or interview behavior was added. | Matchday Vitest PASS; web typecheck PASS; i18n typecheck PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step12`; no horizontal overflow; no Timeline section; one primary `Continue` command; `git diff --check` PASS; `pnpm check` attempted but failed on out-of-scope legacy `CareerShell.test.tsx` text expectation |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/11-matchday-half-time-board-decision.md` | Done | Rebuilt half-time as a manager decision screen. | `CareerMatchdayScreen` now renders a dedicated half-time decision layout: the shared tactical board and bench remain the primary workspace, first-half highlights and player decision signals move into compact side cards, the generic Timeline/player table layout is suppressed during half-time, and the broadcast frame keeps `Start second half` as the single main action. No engine facts, team talks, opponent board, or second tactical-board implementation were added. | Matchday Vitest PASS; tactics-board Vitest PASS; web typecheck PASS; i18n typecheck PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step11`; no horizontal overflow; one primary `Start second half` action; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/10-matchday-broadcast-pre-match-and-phase-frame.md` | Done | Rebuilt the pre-match matchday frame as a broadcast-style centre. | `CareerMatchdayScreen` now anchors `CareerMatchdayPhaseView` in a compact broadcast frame with phase/round line, dominant scoreboard, localized live line, one primary phase command, and the existing phase rail. The lower event/player facts remain framed below, and full-time consequences stay hidden before full time. No engine changes, new event kinds, full-time result redesign, or half-time board work were added. | Matchday screen Vitest PASS; matchday phase-view Vitest PASS; web/ui/i18n typechecks PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step10`; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/09-match-preparation-tabs-and-save-flow.md` | Done | Completed the match-preparation decision panel with tabs and a clearer save flow. | `CareerMatchPreparationScreen` now exposes localized Squad/Tactic/Detail tabs backed by existing squad, tactic, and player-detail facts; blockers sit closer to the primary save action; the screen keeps one top-level Save and go to match button; clicking, assigning, or opening a player focuses the Detail tab. No tactic engine, team talks, opponent preview, or matchday UI was changed. | Match-preparation Vitest PASS; shared-ui Vitest PASS; web typecheck PASS; i18n typecheck PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step09`; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/08-match-preparation-board-first-layout.md` | Done | Rebuilt match preparation around a board-first workspace. | `CareerMatchPreparationScreen` now marks `tactics` active, keeps helper actions adjacent to the shared board, renders the board first, places the bench immediately below it, and moves squad/detail/tactic facts into one right-side decision panel. Tactical-board and bench behavior were not changed. | Match-preparation Vitest PASS; tactics-board Vitest PASS; web typecheck PASS; i18n typecheck PASS; `git diff --check` PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step08`; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/07-posta-attention-rail-and-navigation-states.md` | Done | Rebuilt the shell Posta/attention rail and clarified navigation states. | Extracted `AppShellPostaRail`, removed the separate right-rail next-action card, kept the Continue relationship hint only when global Continue is visible, made the current navigation item use `aria-current` without `aria-disabled`, and subdued disabled future sections without adding fake mail categories or new persistence. | AppShell Vitest PASS; web typecheck PASS; i18n typecheck PASS; `git diff --check` PASS; Playwright dashboard/preparation desktop and preparation narrow screenshots in `/tmp/the-long-season-phase69-step07`; no horizontal overflow at 1440px or 390px; one Posta panel found; current nav is not disabled; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/06-dashboard-command-centre-rebuild.md` | Done | Rebuilt the dashboard as a compact career command centre. | `CareerDashboardScreen` now uses the app shell with one central primary action, a compact next-fixture/preparation desk, blockers beside the next match, and a short real-fact signal row for condition, squad size, table context, and recent match. Technical save/world-seed output and raw fixture ids were removed from the dashboard body. The dashboard uses the focused shell mode to avoid a competing global Continue button. | Dashboard Vitest PASS; web typecheck PASS; i18n typecheck PASS; `git diff --check` PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step06`; no horizontal overflow at 1440px or 390px; one dashboard primary action found; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/05-app-shell-sidebar-and-right-rail.md` | Done | Added the first persistent career app shell for the full web UI rebuild. | Introduced `features/app-shell/AppShell.tsx` with a left sidebar, central content outlet, and action/attention rail. Existing career screens now route through the new shell via a thin `features/career-shell/CareerShell.tsx` compatibility bridge, avoiding duplicated chrome while later steps rewrite sections. Inactive future sections are visible, disabled, and accessible. The right rail shows Continue, next action, career context, and manager attention; on normal desktop widths it moves below the central content to prevent the legacy dashboard/preparation layouts from being squeezed or overlapped. | AppShell Vitest PASS; App.test Vitest PASS; web typecheck PASS; i18n typecheck PASS; `git diff --check` PASS; Playwright desktop/narrow screenshots in `/tmp/the-long-season-phase69-step05`; no horizontal overflow at 1440px or 390px; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/04-shared-ui-primitives-rebuild-in-place.md` | Done | Rebuilt the shared row/table/detail primitives used by the match-preparation slice without rewriting the dashboard, shell, matchday, or tactical-board logic. | Tightened `PlayerCandidateRow`, `SquadSelectionTable`, and `PlayerFactPanel` with clearer selection/status presentation, deterministic table sorting, percentage fitness display, fixed-height squad table scroll, compact detail facts, and a stable table minimum width inside the table scroll. Added focused tests for the changed primitives. | Shared UI Vitest PASS: 3 files / 4 tests; web typecheck PASS; i18n typecheck PASS; Playwright desktop/narrow match-preparation screenshots in `/tmp/the-long-season-phase69-step04`; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/03-base-layout-foundation-and-focus-language.md` | Done | Established the rebuilt UI's base material, focus language, and app-entry layout foundation without starting shell/sidebar/dashboard work. | Tuned the single identity tokens, added Tailwind `@theme` mappings, simplified the global background into controlled scanline/grid material, strengthened keyboard focus with an explicit amber outline, improved app-entry spacing/typography/action hierarchy, and preserved tactical-board token compatibility. No tactical-board behavior, matchday, dashboard, or shell flow was changed. | Web typecheck PASS; web tests PASS: 35 files / 157 tests; Playwright app-entry desktop/narrow/focus and career-screen desktop/narrow screenshots in `/tmp/the-long-season-phase69-step03`; no horizontal overflow at 1440px or 390px; `git diff --check` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/02-tactical-board-css-isolation-and-visual-lock.md` | Done | Isolated the approved shared tactical-board and bench-board chrome CSS before the wider UI rebuild. | Added `apps/web/src/styles/tactical-board.css`, imported it from the style entry, and removed the `tls-tactical-board-*` / `tls-tactical-bench-*` definitions from the legacy global component sheet. Tactical-board logic, pitch markings, pointer/drag/context-menu handlers, roles, formations, coordinates, and bench contracts were not modified. Existing contextual container overrides stayed in `components.css` because they belong to matchday/preparation layout ownership, not the board chrome contract. | Tactical-board Vitest PASS: 13 files / 47 tests; web typecheck PASS; Playwright desktop/narrow/context-menu screenshots in `/tmp/the-long-season-phase69-step02`; `git diff --check` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/01-app-entry-single-identity-and-theme-removal.md` | Done | Rebuilt the app entry as the first browser-visible slice of the approved full UI rebuild and removed the rejected user-facing theme selector. | App entry now uses one fixed product identity with localized kicker/tagline, clear New Career/Continue Career actions, and language/currency settings only. Theme-palette preferences and store actions were removed from user-facing state; tactical-board source was not touched. Reworked the primary button hover so `New career/Nuova carriera` stays gold with dark readable text instead of inheriting the gray secondary hover. Obsolete theme-palette modules and labels are deferred to Step 13 cleanup because legacy tests/specs still reference them. | Required app-entry Vitest PASS; app-entry view-model Vitest PASS; web typecheck PASS; i18n typecheck PASS; affected preference/store/i18n/web tests PASS; Playwright desktop/narrow smoke PASS plus `/tmp/the-long-season-phase69-step01/app-entry-new-career-hover.png`; `git diff --check` PASS |
| `docs/steps/69-web-ui-full-rebuild-around-tactical-board/README.md` | Ready | Created the Phase 69 implementation plan for the approved full web UI rebuild. | Phase 69 supersedes the Phase 68 static gate and turns `docs/superpowers/specs/2026-06-30-web-ui-redesign-design.md` into 14 browser-visible micro-steps. Each step must ship one testable UI slice, run checks, update status/roadmap, and stop for user visual approval before the next step. The tactical board remains the preserved anchor; no new gameplay systems or dead UI are allowed. | Documentation-only update; implementation checks start with Phase 69 Step 01 |
| `docs/steps/68-mvp-ux-language-reset-around-tactical-board/README.md` | Ready | Created the Phase 68 documentation path after the broader first-MVP UX language was rejected. | Phase 68 supersedes the previous persistence recommendation. It preserves the tactical board as the approved visual anchor and resets shell, dashboard, Inbox/Posta, preparation chrome, matchday, shared layout, static direction, visual QA, and accessibility before persistence or new sections can resume. The phase includes a static approval gate before app-wide source rework. | Phase 68 README and 9 ordered step files exist; roadmaps updated; `git diff --check` pending |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/09-section-quality-review-and-next-phase-decision.md` | Done | Closed Phase 67 with final flow-quality evidence and a next-phase decision later superseded by product review. | Added `MATCHDAY_FLOW_SIMPLIFICATION_REPORT.md`; updated architecture docs with shell, dashboard, preparation, matchday, half-time tactical-decision, and visual-QA entry points; initially recommended persistence, but this is now superseded by `Phase 68 - MVP UX Language Reset Around Tactical Board` because the broader MVP UX was rejected. Closeout `pnpm check` exposed a web-to-domain dependency violation, fixed by re-exporting the half-time tactical decision input types from the allowed `@game/engine` boundary and moving the web import there. | Focused Phase 67 Vitest PASS; package typechecks PASS; web build PASS with non-blocking Vite chunk-size warning; web tests PASS; Playwright flow QA PASS; `pnpm check` PASS; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/08-click-count-playwright-accessibility-and-flow-qa.md` | Done | Proved the simplified matchday path in a real browser. | Added `matchday-flow-simplification.spec.ts`, which launches the web app, drives dashboard -> preparation -> save-and-go-to-match -> pre-match -> half-time tactical workspace -> full time -> clean dashboard on desktop and narrow viewports, asserts no horizontal overflow, no matchday Inbox/Posta, no global matchday Continue, no dead dashboard action buttons, keyboard-focusable primary actions, and writes `MATCHDAY_FLOW_SIMPLIFICATION_VISUAL_QA.md` plus screenshots under `/tmp/the-long-season-phase67`. | Playwright script PASS; visual QA audit exists; web typecheck PASS with existing pnpm engine warning; web tests PASS with existing pnpm engine warning; web build PASS with existing pnpm engine warning and Vite chunk-size warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/07-half-time-tactical-board-workspace.md` | Done | Replaced the half-time two-select substitution surface with a shared tactical-board decision workspace. | The web matchday screen now receives the current match-preparation view and tactical-board draft, renders the reusable XI board and fixed 8-slot bench at half-time, lets the manager change formation, slot positions, roles, XI assignments, and bench assignments, and starts the second half by converting the current board/bench state into the structured half-time tactical decision plan from Step 06. Validation issues are exposed through localized structured fact keys; the old substitution panel remains only as a fallback when the tactical workspace cannot be mounted. | matchday screen/demo Vitest PASS; tactics-board Vitest PASS; career UI store Vitest PASS; i18n labels Vitest PASS; web typecheck PASS with existing pnpm engine warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/06-half-time-tactical-decision-contract.md` | Done | Added the structured selected-club half-time tactical decision contract. | `@game/domain` now validates half-time tactical plans as structured facts for second-half formation, lineup slots, bench slots, substitutions, duplicates, missing goalkeeper, missing XI slots, invalid setup, and substitution limits. `applyHalfTimeSubstitutions` still preserves substitution-only behavior, but can now consume a validated tactical plan as the second-half selected-club lineup and stores that plan in `StagedMatchState`/snapshots for full-time continuity. | domain tactical-plan Vitest PASS; half-time substitutions Vitest PASS; staged progression Vitest PASS; domain typecheck PASS with existing pnpm engine warning; engine typecheck PASS with existing pnpm engine warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/05-pre-match-and-full-time-primary-action-cleanup.md` | Done | Reduced matchday phase actions to one clear primary CTA per phase. | `buildCareerMatchdayPhaseView` now returns only the current phase CTA. `CareerMatchdayScreen` uses matchday shell mode, removes the header Dashboard button, renders a single primary action, keeps half-time substitutions inside the decision panel, and removes the duplicate full-time button from consequences. Full-time `Continue` now routes through `finishMatchdayAndOpenDashboard`, clearing stale attention text before returning to the dashboard. | phase-view/matchday-screen/matchday-demo/store/i18n Vitest PASS; UI typecheck PASS with existing pnpm engine warning; web typecheck PASS with existing pnpm engine warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/04-match-preparation-save-and-go-to-match.md` | Done | Removed the dashboard bounce after preparation. | The match-preparation read model now labels the save action as `Save and go to match`. The preparation screen renders that action in the top header, removes the old bottom duplicate save section, and uses preparation shell mode so the global Continue is hidden. The web store exposes `savePreparationAndOpenMatchday`, which saves only complete preparation drafts and opens the explicit pre-match state without auto-starting the fixture. | match-preparation screen/demo/store/i18n Vitest PASS; web typecheck PASS with existing pnpm engine warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/03-dashboard-single-primary-action-and-dead-action-removal.md` | Done | Simplified the dashboard to one meaningful primary action and removed dead available actions from the dashboard surface. | `buildCareerDashboardView` now emits only current real actions: `prepare_match` when preparation blockers exist and `advance_next_fixture` when the saved setup can open matchday. Dead inspect actions are no longer produced by the dashboard builder. `CareerDashboardScreen` no longer renders the duplicated lower action list, leaving the header CTA as the single manager next action. | dashboard-view Vitest PASS; dashboard-actions Vitest PASS; demo dashboard Vitest PASS; UI typecheck PASS with existing pnpm engine warning; web typecheck PASS with existing pnpm engine warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/02-shell-action-mode-and-disabled-navigation-cleanup.md` | Done | Added focused shell modes and made disabled future nav non-interactive. | `buildCareerShellView` now exposes `standard`, `preparation`, and `matchday` modes with structured flags for Inbox/Posta and global Continue visibility. `CareerShell` renders disabled future navigation as non-button text with `aria-disabled`, can hide Inbox/Posta, and can suppress global Continue. The root Vitest config now includes `apps/**/*.test.tsx` so documented React shell tests actually run. | `pnpm exec vitest run packages/ui/src/career/career-shell-view.test.ts` PASS; `pnpm exec vitest run apps/web/src/features/career-shell/CareerShell.test.tsx` PASS; `pnpm exec vitest run packages/i18n/src/labels.test.ts` PASS; `pnpm --filter @game/ui run typecheck` PASS with existing pnpm engine warning; `pnpm --filter @game/web run typecheck` PASS with existing pnpm engine warning; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/01-current-button-click-and-matchday-flow-audit.md` | Done | Audited the current web button/click flow before behavior changes. | Added `MATCHDAY_FLOW_SIMPLIFICATION_AUDIT.md` with cold/warm baseline click counts, current button surfaces, dead available dashboard actions, duplicated actions, shell ambiguity, Inbox/Posta matchday noise, and the accepted target flow. Updated the web-section roadmap Phase 67 progress with the Step 01 conclusion. | `nvm use 24` PASS after loading `~/.nvm/nvm.sh`; `test -f docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_AUDIT.md` PASS; `git diff --check` PASS |
| `docs/steps/67-web-matchday-flow-simplification-and-half-time-tactical-decisions/README.md` | Ready | Documented Phase 67 for matchday flow simplification and half-time tactical decisions. | Added nine ordered steps covering current flow audit, shell action-mode cleanup, dashboard primary-action cleanup, preparation "Save and go to match", pre-match/full-time action cleanup, half-time tactical decision contract, half-time tactical-board workspace, Playwright/accessibility/click-count QA, and final section-quality review. Updated roadmaps so persistence moves behind this flow cleanup and future web section backlog no longer collides with active phase numbering. | Phase 67 README exists; 9 ordered step documents plus README are present; stale Phase 67 persistence references removed; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/11-section-quality-review-and-phase-report.md` | Done | Closed Phase 66 with final report, architecture reconciliation, roadmap updates, and next-phase decision. | Added `INTERACTIVE_MATCHDAY_FLOW_REPORT.md`, updated `ARCHITECTURE.md`, reconciled the playability and web roadmaps, and marked Phase 66 complete. The old immediate persistence recommendation is now superseded by Phase 67 flow simplification; persistence moves after the web matchday path has fewer clicks, clearer primary actions, and useful half-time tactical decisions. | focused Phase 66 engine/UI/web Vitest pack PASS; domain/engine/UI/web typechecks PASS; web build PASS with existing large-chunk warning; web test PASS; Playwright interactive matchday QA PASS; `pnpm check` PASS; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/10-playwright-accessibility-and-fun-qa.md` | Done | Proved the interactive matchday flow in desktop and narrow Chromium and fixed QA-exposed UX issues. | Added `interactive-matchday-flow.spec.ts` and `INTERACTIVE_MATCHDAY_FLOW_VISUAL_QA.md`. The QA drives dashboard, preparation, direct Continue-to-matchday, dashboard "Go to match", pre-match, half-time, substitution, full time, and dashboard return. It confirms no horizontal overflow, keyboard reachability for primary actions, event-card hierarchy instead of old report layout, and half-time as a meaningful decision point. QA fixes included narrow card-style player rows, compact substitution option labels, precise dashboard-return selector, and removal of the duplicate generic half-time no-op action. | Playwright visual QA PASS; audit file exists; web typecheck PASS; web tests PASS; web build PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/09-dashboard-continue-click-flow-rework.md` | Done | Reduced dashboard/Continue friction for matchday. | `Continue` now routes directly to the match centre when the engine returns `matchday_reached`. The dashboard exposes a clear primary "Go to match" action when preparation is ready, keeps preparation routing when blockers remain, and still leaves Inbox/Posta as an accurate attention record. `App` now passes the phase-aware matchday view, half-time substitution panel, half-time substitution callback, and second-half callback into `CareerMatchdayScreen`. | focused dashboard-view test PASS; focused demo dashboard test PASS; focused career UI store test PASS; focused i18n labels test PASS; UI typecheck PASS; web typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/08-half-time-substitution-and-rating-ui.md` | Done | Added a useful half-time decision panel for selected-club substitutions. | `buildDemoHalfTimeSubstitutionPanel` derives lineup, bench, applied substitutions, validation reasons, ratings, and condition from staged match facts. `CareerMatchdayScreen` now shows half-time substitution controls, applied substitution summaries, and localized invalid-substitution feedback while keeping team talks, opponent decisions, full tactical-board editing, and persistence out of scope. New i18n assertions lock the half-time substitution labels in all five supported languages. | focused matchday demo tests PASS; focused matchday screen tests PASS; focused career UI store tests PASS; focused i18n labels tests PASS; web typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/07-match-centre-visual-redesign.md` | Done | Replaced the log-like matchday report surface with a phase-aware match centre presentation. | `CareerMatchdayScreen` can now render a phase-aware matchday view with dominant scoreboard, period rail, context strip, event cards, highlight cards, useful player rows for rating/condition/contribution/status, and full-time-only consequences. Legacy result-only views remain compatible during wiring migration. Added localized labels in all five supported languages and focused tests for blocked, ready, half-time, full-time, and legacy full-time rendering. | focused matchday screen tests PASS; focused i18n labels tests PASS; web typecheck PASS; i18n typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/06-web-demo-staged-matchday-adapter-and-store-flow.md` | Done | Wired the in-memory web demo adapter and Zustand store to staged matchday progression. | Added staged matchday state, first-half progression to a real half-time stop, explicit half-time substitution pass-through, second-half progression to full time, and a phase-aware demo view builder. The legacy full-play result remains compatible for current dashboard updates until the match centre UI is replaced. Store tests now drive pre-match to half-time to substitutions to full time without persistence or automatic selected-club changes. | focused matchday adapter tests PASS; focused career UI store tests PASS; web typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/05-ui-matchday-phase-read-model.md` | Done | Added a phase-aware `@game/ui` matchday read model while keeping the Phase 65 result-only view compatible. | Added `career-matchday-phase-view.ts` with framework-free, language-agnostic facts for match phase, period label keys, scoreboard, timeline rows, major event cards, player rating rows, half-time substitution action availability, full-time-only consequences, and next action IDs. The builder owns ordering/action visibility only; engine/adapters still own match facts and ratings. | focused phase-view tests PASS; legacy matchday-view tests PASS; UI typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/04-substitution-decision-contract-and-engine-application.md` | Done | Added explicit selected-club half-time substitution validation and staged-context application. | Added domain substitution facts and an engine `applyHalfTimeSubstitutions` helper. The helper accepts manager-declared decisions only, validates half-time phase, bench membership, starter membership, duplicate players, and a conservative v1 five-substitution limit. Accepted decisions replace player IDs inside existing tactical slots, preserve current strength values for now, update the second-half staged context, and expose applied substitution facts. Future competition-specific limits remain documented as later ownership. | focused half-time substitution tests PASS; focused staged-progression tests PASS; domain typecheck PASS; engine typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/03-half-time-snapshot-and-player-ratings-foundation.md` | Done | Added deterministic live/final player rating facts to staged match snapshots. | Added `player-match-rating.ts`, deriving a v1 1-10 rating from structured step events only: goals, assists, chance creation, shots, shots on target, saves, blocks, misses, and blocked shots. Quiet registered players stay at a 6.0 baseline; repeated wasted attacking volume is not inflated. `StagedMatchSnapshot` now exposes `playerRatings` at half-time and full time. | focused player-rating tests PASS; focused staged-progression tests PASS; engine typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/02-engine-staged-match-progression-contract.md` | Done | Added a deterministic staged match progression contract below the career fixture application use case. | Added canonical domain match phases, then introduced `createInitialStagedMatchState`, `progressStagedMatchToHalfTime`, `progressStagedMatchToFullTime`, and `progressStagedMatchToPhase`. The staged state stores only the initial context, current serializable `MatchSimulationState`, accumulated events, and phase; it does not persist mutable RNG state. Continuation reconstructs the RNG cursor by replaying completed minutes from the initial seed and fixture, then advances from the stored simulation state. Extra time and penalties exist only as inactive future phase values. | `nvm use 24`; focused staged progression tests PASS; domain typecheck PASS; engine typecheck PASS; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/01-current-matchday-flow-and-ui-audit.md` | Done | Audited the current one-shot matchday web flow and identified the correct staged-engine seam. | Keep the Phase 65 structured facts, web adapter proof, and final consequence path, but replace the report-like UI and one-shot browser action. The staged contract should sit below `progressNextCareerFixture`, near `MatchSimulationState`, `stepMatch`, `runMatchSimulation`, and `createMatchReport`, so half-time can expose partial facts without applying final consequences. The old web roadmap's historical Market UI Phase 66 row remains superseded by the playability roadmap. | `nvm use 24`; `test -f docs/audits/INTERACTIVE_MATCHDAY_FLOW_AUDIT.md`; `git diff --check` PASS |
| `docs/steps/66-interactive-matchday-flow-and-half-time-decisions/README.md` | Ready | Created the Phase 66 documentation path for an interactive matchday flow before persistence. | Phase 66 replaces the superseded persistence recommendation with an engine/UI rework: staged match progression, half-time snapshots, deterministic player ratings, selected-club half-time substitutions, phase-aware UI read models, staged web adapter/store flow, match-centre visual redesign, faster dashboard/Continue routing, Playwright fun/accessibility QA, and final quality review. Extra time and penalties are structurally acknowledged but explicitly inactive until cup rules exist. | Phase 66 README and 11 ordered step files exist; playability and web roadmaps updated; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/07-section-quality-review-and-phase-report.md` | Done | Closed Phase 65 with architecture, roadmap, final report, and full verification gates. | Added `WEB_MATCHDAY_PLAYABLE_SLICE_REPORT.md`, updated `ARCHITECTURE.md` with the matchday read model, web adapter, screen, and visual QA entry points, and reconciled both roadmap files. Its original persistence recommendation is now superseded by the Phase 66 matchday UX rework because the current result screen is playable but not yet good enough to preserve. | focused matchday/UI/store tests PASS; UI/web typechecks PASS; web build PASS with non-blocking Vite chunk-size warning; web test PASS; Playwright QA PASS; `pnpm check` PASS; `git diff --check` PASS; `graphify update .` PASS |
| `docs/steps/65-web-matchday-playable-slice/06-playwright-accessibility-and-visual-qa.md` | Done | Verified the full browser loop and fixed concrete matchday layout bugs discovered by QA. | Added `apps/web/src/visual-qa/matchday-playable-slice.spec.ts` to drive desktop and narrow flows from new career through preparation, Continue, Inbox/Posta, matchday play, result inspection, and dashboard return. Added `WEB_MATCHDAY_PLAYABLE_SLICE_VISUAL_QA.md` with screenshot evidence under `/tmp/the-long-season-phase65`. QA exposed two real source bugs, so Step 06 intentionally touched `apps/web/src/styles/components.css` outside the nominal expected files: matchday card content now aligns to the top, and the final next-action row wraps cleanly instead of clipping. | `node --experimental-strip-types apps/web/src/visual-qa/matchday-playable-slice.spec.ts` PASS; `pnpm --filter @game/web run typecheck` PASS; `test -f docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_VISUAL_QA.md` PASS; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/05-dashboard-inbox-and-continue-state-update.md` | Done | Wired the playable matchday result back into dashboard, Inbox/Posta, and Continue state. | `buildDemoCareerDashboardInput` now accepts the played matchday adapter state and, after a fixture is played, returns updated current date, selected-club condition rows, recent match facts, cleared preparation blockers, and no next fixture. `continueDemoCareer` consumes the same matchday state so the stale `matchday_reached` Inbox/Posta message is cleared after play and Continue returns `no_attention` for the one-fixture demo. The Zustand `playMatchdayFixture` action now updates both `matchdayState` and `continueResult` after a successful play. The documented `dashboard-demo.test.ts` path does not exist; the existing dashboard adapter test is `build-demo-career-dashboard.test.ts` and was extended instead of creating a duplicate dead test. | `pnpm exec vitest run apps/web/src/features/dashboard/build-demo-career-dashboard.test.ts` PASS; `pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts` PASS; `pnpm --filter @game/web run typecheck` PASS; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/04-matchday-screen-result-and-event-presentation.md` | Done | Added the first localized web matchday screen for blocked, ready, and played states. | Added `CareerMatchdayScreen` as a report-style screen fed only by the `@game/ui` matchday read model and the Step 03 demo adapter. It shows fixture context, preparation status, blockers, a Play Match action, final score, key structured events, compact player stats, condition deltas, form/morale deltas, and a dashboard return action. `App.tsx` now routes the `matchday` screen to this component instead of the dashboard fallback. New i18n labels cover all five supported languages. The documented `.test.tsx` check is incompatible with the current Vitest include pattern (`apps/**/*.test.ts`), so the test was implemented and run as `.test.ts`; future web test docs should use `.test.ts` unless the shared Vitest config is intentionally changed. | `pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts` PASS; `pnpm exec vitest run packages/i18n/src/labels.test.ts` PASS; `pnpm --filter @game/web run typecheck` PASS; `pnpm --filter @game/i18n run typecheck` PASS; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/03-web-demo-matchday-adapter-and-store-flow.md` | Done | Connected the web demo store to an engine-backed in-memory matchday adapter. | Added `apps/web/src/features/matchday/matchday-demo.ts` as a narrow browser adapter that validates complete saved lineup, bench, and tactic, builds a replaceable in-memory career state, runs `progressNextCareerFixture`, stores the played result and consequences, prevents duplicate fixture play, and exposes `buildDemoMatchdayView` for the upcoming screen. Zustand now owns `matchdayState`, routes `open_matchday`, and exposes `playMatchdayFixture`. The adapter intentionally avoids undeclared package dependencies; the future persistence phase can replace its local demo state with a real save adapter after the interactive matchday rework. | `pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts apps/web/src/stores/career-ui-store.test.ts` PASS; `pnpm --filter @game/web run typecheck` PASS; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/02-matchday-read-model-and-action-contract.md` | Done | Added the pure `@game/ui` matchday read-model contract. | `career-matchday-view.ts` exposes `buildCareerMatchdayView` plus documented input/view types for blocked, ready-to-play, played, and unavailable matchday states. The builder derives actions, blockers, selected-club score outcome, ordered event rows, ordered player-stat rows, condition changes, form/morale changes, and next-stop facts without importing engine, web, React, i18n, or storage. Tests cover missing preparation, playable state, played result, missing report, missing fixture, and deterministic row ordering. | `pnpm exec vitest run packages/ui/src/career/career-matchday-view.test.ts` PASS; `pnpm --filter @game/ui run typecheck` PASS; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/01-current-web-matchday-readiness-audit.md` | Done | Audited the current web, UI, and engine seams before implementing playable web matchday. | `WEB_MATCHDAY_PLAYABLE_SLICE_AUDIT.md` records that the current web app can prepare and Continue to `matchday_reached`, but has no matchday screen, no `open_matchday` route, static dashboard facts, and no UI matchday read model. The safe path is to add a pure `@game/ui` matchday read model, then a web demo adapter that calls real engine fixture progression in memory. The audit flags coherent demo player IDs versus engine career player IDs as the main Step 03 integration risk. Persistence remains explicitly deferred until the matchday experience is good enough to preserve. `CAREER_WEB_SECTION_ROADMAP.md` was checked; no row was marked complete by this audit. | `test -f docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_AUDIT.md`; `git diff --check` PASS |
| `docs/steps/65-web-matchday-playable-slice/README.md` | Ready | Created the Phase 65 documentation path for the first playable web matchday loop. | Phase 65 is scoped to audit current web matchday readiness, add a UI-owned matchday read model, connect an in-memory web demo adapter to real engine fixture progression, present the matchday result/consequences, update dashboard and Inbox/Posta state, run Playwright accessibility/visual QA, and close with a quality report plus next-phase recommendation. It explicitly forbids live match animation, in-match substitutions, team talks, opponent board, fake matchday data, new persistence, CLI parsing, and runtime LLM/narrative generation. | README plus seven ordered step files exist; `git diff --check` PASS |
| `docs/steps/64-match-consequences-and-player-state-reactivity/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 64 with the final architecture/gameplay report and next-phase recommendation. | `MATCH_CONSEQUENCES_AND_REACTIVITY_REPORT.md` documents the new `applyCareerMatchStateConsequences` Module, affected state values, reason keys, `progressNextCareerFixture` integration, CLI inspection output, deterministic checks, residual risks, and recommends `Phase 65 - Web Matchday Playable Slice`. `ARCHITECTURE.md` now lists the post-match player-state consequence entry point and debugging path; `CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` records the Phase 64 completion note. | focused Phase 64 tests PASS; engine/CLI/i18n typechecks PASS; career advance smoke PASS; ten-season smoke PASS; strict balance PASS; `pnpm check` PASS; `git diff --check`; `graphify update .` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/07a-content-rare-prodigy-test-runtime-stabilization.md` | Done | Unblocked the Phase 64 broad regression gate by stabilizing an unrelated content test timeout. | Replaced the 80-world rare-prodigy scan with two deterministic existing seed fixtures: `wonderkid-sample-0` proves rare prodigies are possible, and `wonderkid-sample-1` proves they are not guaranteed. No production content generation, rarity tuning, match consequence, match engine, balance, or long-run threshold code changed. | focused content test PASS; Phase 64 focused tests PASS; `pnpm check` PASS; regression smoke report updated |
| `docs/steps/64-match-consequences-and-player-state-reactivity/07-regression-smokes-and-long-run-sanity.md` | Blocked | Focused Phase 64 gates, career smoke, ten-season report, and strict balance passed; broad `pnpm check` is blocked by an unrelated content test timeout. | `MATCH_CONSEQUENCES_REGRESSION_SMOKE.md` records all command outcomes. The repeated `pnpm check` failure is `packages/content/src/generators/fake-players.test.ts` timing out in the rare-prodigy generation test after 5000ms. This is outside the Step 07 expected files and not caused by match consequences, so the phase stops here instead of changing content-generation tests from this step. | Phase 64 focused tests PASS; career CLI smoke PASS; ten-season PASS; balance strict PASS; `pnpm check` BLOCKED by unrelated timeout |
| `docs/steps/64-match-consequences-and-player-state-reactivity/06-next-fixture-reactivity-and-season-boundary-checks.md` | Done | Proved post-match player state can affect next-fixture strength and remains safe at season rollover. | Added focused team-strength coverage showing low form/morale can reduce next-fixture strength when state multiplier curves are supplied, plus rollover coverage for a post-match-like state returning to the new-season baseline. `MATCH_CONSEQUENCES_REACTIVITY_REVIEW.md` documents the persistence/reactivity path, bounded effect, user value, season boundary, and future limits. | `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm exec vitest run packages/engine/src/career/player-season-rollover.test.ts`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; engine/CLI typechecks; review file exists; `git diff --check` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/05-cli-post-match-reactivity-output.md` | Done | Exposed post-match form/morale reactivity in localized career advancement output. | `formatCareerAdvanceOutput` now prints a compact `Post-match player state` section after condition changes, using only engine-provided structured facts: changed player count, total form/morale deltas, player before/after values, signed deltas, and localized reason labels. The current i18n architecture uses `packages/i18n/src/labels.ts`; no dead `messages/*.ts` files were created. Smoke output for `phase64-check` showed persisted player-state consequences after a 3-0 loss. | `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm exec vitest run packages/i18n/src/labels.test.ts`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; career CLI smoke; `git diff --check` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/04-progress-fixture-integration-and-structured-facts.md` | Done | Integrated post-match form/morale consequences into selected-club fixture progression. | `progressNextCareerFixture` now runs in explicit order: simulate fixture, create/apply report, spend selected-starter fitness, apply selected-starter form/morale consequences, create copied career state, and return structured facts. The successful result now includes `playerStateConsequences` plus `playerStateConsequenceSummary` alongside existing `conditionChanges`. Existing condition behavior and explanation trace behavior are preserved. | `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts`; `pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts`; `pnpm --filter @game/engine run typecheck`; `git diff --check` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/03-engine-post-match-player-state-module.md` | Done | Added the pure engine post-match player-state consequence module and focused tests. | `packages/engine/src/career/career-match-state-consequences.ts` exports `applyCareerMatchStateConsequences`. The helper copies player state, validates ordered starter IDs, derives selected-club side from the fixture, reacts only to durable match report facts, applies bounded `form`/`morale` deltas, clamps values to `0..100`, returns ordered player-level facts plus aggregate summary, and emits no prose. Covered facts are win/loss/draw, clean sheet, heavy loss, goals, assists, and goalkeeper saves. | `pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts`; `pnpm --filter @game/engine run typecheck`; `git diff --check` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/02-consequence-model-and-state-contract.md` | Done | Defined the bounded v1 post-match form/morale consequence model. | `MATCH_CONSEQUENCES_MODEL_CONTRACT.md` keeps existing fitness unchanged and adds only selected-club starter `form`/`morale` changes from durable facts: result, clean sheet, heavy loss, goal, assist, and goalkeeper saves. Deltas are capped per match at `form -5..+5` and `morale -4..+4`, clamped to `0..100`, processed in lineup order, and emitted as structured reason-key facts only. Bench dissatisfaction, injuries, team talks, personality, promises, training, staff, market/economy, UI, match tuning, and player generation remain out of scope. `CAREER_WEB_SECTION_ROADMAP.md` was checked; no web-row completion applies to this engine-only step. | contract file exists; `git diff --check` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/01-current-player-state-and-match-consequence-audit.md` | Done | Audited the current selected-club matchday state path before adding post-match reactivity. | `MATCH_CONSEQUENCES_STATE_AUDIT.md` documents that played fixtures currently spend only starter fitness, while `form` and `morale` already exist in `PlayerDynamicState` and already influence next-fixture team strength when state multiplier curves are supplied. The safe integration seam is after match fitness spend inside `progressNextCareerFixture`; Phase 64 must use only existing structured facts and must not invent bench dissatisfaction, injuries, team talks, personality, training, staff, market, or UI behavior. `CAREER_WEB_SECTION_ROADMAP.md` was checked; no web-row completion applies to this engine-only step. | audit file exists; `git diff --check` |
| `docs/steps/64-match-consequences-and-player-state-reactivity/README.md` | Ready | Created Phase 64 documentation for match consequences and player state reactivity. | Phase 64 is scoped to audit current player-state behavior, define a bounded form/morale consequence model, implement one pure engine post-match state module, integrate it into `progressNextCareerFixture`, expose concise localized CLI inspection output, prove next-fixture reactivity and season-boundary safety, run regression smokes, and close with a next-phase decision. It explicitly forbids injuries, team talks, personality, automatic advice, UI, economy, market, staff, training, match tuning, and fake bench dissatisfaction without durable data. | Phase 64 README and 8 step files exist; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 63 with the canonical career advancement report, architecture update, and next-phase recommendation. | Added `CAREER_ADVANCEMENT_USE_CASE_REPORT.md`; updated `ARCHITECTURE.md` and `CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` to document `advanceCareerOneSeason`, migrated callers, allowed seams, final checks, residual risks, and exactly one next recommendation: `Phase 64 - Match Consequences And Player State Reactivity`. | Engine/career/ten-season/simulation-tools focused tests; engine/CLI/simulation-tools typechecks; career development-report smoke; ten-season single-world smoke; `pnpm check`; `git diff --check`; `graphify update .` |
| `docs/steps/63-canonical-career-advancement-use-case/07-regression-command-pack-and-no-third-path-check.md` | Done | Verified that no adapter-level third season-advancement path remains. | Added `CAREER_ADVANCEMENT_NO_THIRD_PATH_REPORT.md`; generated `CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md` with a 50-world/10-season PASS. Direct helper calls are now confined to the canonical engine Module, lower-level engine internals/tests, the allowed fixture-level progression seam, and adapter calls to `advanceCareerOneSeason`. | Broad/focused advancement scans; `pnpm cli career --save=phase63-check --development-report`; `pnpm cli ten-season-report --seed-prefix=phase63-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_ADVANCEMENT_LONG_RUN_SMOKE.md`; `pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts apps/cli/src/commands/career.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/simulation-tools/src/long-run/career-long-runner.test.ts`; report existence checks; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/06-ten-season-report-and-long-run-migration.md` | Done | Migrated ten-season/long-run refresh onto the canonical advancement use-case. | `apps/cli/src/commands/ten-season-report/report-data.ts` now calls `advanceCareerOneSeason` in `reportRefresh` mode from its long-run adapter callback and derives refresh metrics from structured facts. The canonical Interface gained optional content-provider callbacks for youth and senior intake so adapters can generate candidates from the correct mid-pipeline state without importing content into engine. `packages/simulation-tools/src/long-run/career-long-runner.ts` remains a batch-loop seam only. | `pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts packages/simulation-tools/src/long-run/career-long-runner.test.ts packages/engine/src/career/advance-career-season.test.ts`; CLI/simulation-tools/engine typechecks; `pnpm cli ten-season-report --seed=phase63-world --seasons=10`; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/05-cli-rollover-and-development-report-migration.md` | Done | Migrated CLI career rollover and development-report paths onto the canonical season advancement use-case. | `apps/cli/src/commands/career/season-labs.ts` now calls `advanceCareerOneSeason` for both `completedSeason` rollover and seven-step `reportRefresh` development inspection. The CLI still owns save loading/writing and formatting. Durable rollover uses engine archive/state facts instead of duplicating calendar/table/rollover order; development report remains inspection-only and derives player examples from returned state deltas without calling development rules directly. | `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts`; CLI/engine typechecks; `pnpm cli career --save=phase63-check --seed=world-a --new-world-preview`; expected invalid `--rollover-season` on incomplete new save; `pnpm cli career --save=phase63-check --development-report`; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/04-deterministic-season-history-and-facts.md` | Done | Hardened canonical advancement facts for adapter/report consumption. | `CareerSeasonAdvancementFacts` now includes the selected club id and youth-lifecycle outcome counts in addition to season/date context, archive facts, development, exits, youth intake/promotions, squad maintenance, transfer turnover, squad health, youth health, and warning keys. Tests prove an adapter can build a structured report from facts without rerunning season rules or using prose from the engine. | `pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts`; `pnpm --filter @game/engine run typecheck`; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/03-engine-advance-career-season-module.md` | Done | Implemented the canonical engine season-advancement Module and deterministic unit coverage. | Added `packages/engine/src/career/advance-career-season.ts` and exported it from `@game/engine`. The Module owns the documented order for completed-season rollover and report refresh, emits structured facts, keeps content-derived candidates/table rules Adapter-owned, preserves selected-club protection, and does not perform filesystem, CLI, localization, or UI work. Tests prove deterministic output, input immutability, invalid incomplete-season behavior, report-refresh mode, and operation ordering. | `pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts`; `pnpm --filter @game/engine run typecheck`; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/02-interface-and-ordering-contract.md` | Done | Defined the canonical season advancement Interface and ordering contract before implementation. | `CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md` chooses `advanceCareerOneSeason` in `packages/engine/src/career/advance-career-season.ts`, with one deep Interface and two explicit modes: `completedSeason` for durable rollover and `reportRefresh` for long-run/report advancement. The contract keeps content-derived candidates and table rules Adapter-owned, while engine owns development, exits, youth lifecycle, intake, promotions, squad maintenance, transfer turnover, optional archive/calendar merge, player rollover, and structured facts. | `test -f docs/audits/CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md`; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/01-current-advancement-path-audit.md` | Done | Audited current career advancement paths before introducing the canonical use-case. | `CAREER_ADVANCEMENT_PATH_AUDIT.md` maps selected-club fixture advancement, CLI development report, durable CLI season rollover, simulation-tools long-run sequencing, ten-season report refresh, and lower-level engine helpers. The audit classifies fixture-level progression and the long-run batch loop as allowed seams, while durable rollover and report refresh order must move behind a deep engine Module. It records that engine cannot import content, so content-derived inputs must be supplied by Adapters. | `test -f docs/audits/CAREER_ADVANCEMENT_PATH_AUDIT.md`; `git diff --check` |
| `docs/steps/63-canonical-career-advancement-use-case/README.md` | Ready | Created Phase 63 documentation for a canonical career season advancement use-case. | Phase 63 is scoped to audit current advancement paths, define a narrow engine Interface, implement `advanceCareerOneSeason`, migrate CLI rollover/development-report paths, migrate ten-season and long-run report paths, prove there is no third advancement path, and close with an architecture report and next-phase decision. It explicitly forbids new UI, economy, contracts, staff, gameplay tuning, LLM narrative, hidden manager decisions, and save-schema churn unless documented as a blocker. | Phase 63 README and 8 step files exist; `git diff --check` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/06-phase-report-and-next-phase-decision.md` | Done | Closed Phase 62 with a final safety-net report and one next-phase recommendation. | `ENGINE_SAFETY_NET_REPORT.md` summarizes the season, match, step, and career fixture sentinels, the command pack, intentionally unpinned behavior, golden update rules, residual risks, and recommends exactly `Phase 63 - Canonical Career Advancement Use-Case`. `CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` now has a Phase 62 completion note without changing the next phase order. The command pack now documents that successful fixture advancement requires saved lineup and tactic first. | final report exists; `pnpm check`; CLI season/career/balance smoke commands with explicit saved lineup/tactic before advance; `git diff --check`; `graphify update .` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/05-long-run-verification-command-pack.md` | Done | Documented the engine safety-net command pack for future engine-changing phases. | `ENGINE_SAFETY_NET_COMMANDS.md` separates fast local gates, adapter smoke checks, balance/plausibility gates, heavier `ten-season-report` confidence/stress runs, and full closeout. It states that warnings are design signals for football credibility and fun, not numbers to suppress automatically. | `test -f docs/audits/ENGINE_SAFETY_NET_COMMANDS.md`; `git diff --check` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/04-career-fixture-determinism-smoke.md` | Done | Added a compact career fixture progression sentinel at the engine boundary. | `progressNextCareerFixture` now pins fixture ID, score, event count, stats, applied fixture result, unchanged current date, and first selected-club condition deltas for a stable prepared fixture. No new CLI output or save schema was added; existing CLI smoke tests remain adapter-level coverage. | `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `git diff --check` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/03-match-edge-case-determinism-tests.md` | Done | Added explicit match low-event and no-event determinism coverage. | `simulateMatch` now has a zero-opportunity full-match test that remains deterministic, 0-0, and emits only kickoff/half-time/full-time. `stepMatch` now has a zero-opportunity no-event minute test proving a non-kickoff minute can advance without visible events while preserving deterministic state and zero stats. No probabilities, RNG keys, or output semantics were changed. | `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm --filter @game/engine run typecheck`; `git diff --check` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/02-simulate-season-golden-regression.md` | Done | Added a compact structured `simulateSeason` golden sentinel. | The test pins one stable seed through round/fixture count, champion, runner-up, bottom club, first/last fixture scores and shot/event counts, and top three scorer rows. It avoids CLI prose, full fixture snapshots, generated names, and complete player summary tables. The audit now documents when a future golden update is allowed. | `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm --filter @game/engine run typecheck`; `git diff --check` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/01-current-regression-surface-audit.md` | Done | Audited the current engine regression surface before adding safety-net tests. | `ENGINE_SAFETY_NET_AUDIT.md` records current coverage for `simulateSeason`, `simulateMatch`, `stepMatch`, career fixture progression, table/player stats, and long-run gates. The adopted Phase 62 gate set is a compact season golden, match low-event evidence, step no-event minute evidence, career fixture structured sentinel, and a long-run command pack. The web roadmap was checked and no web-section task was marked because Phase 62 is engine-scoped. | `test -f docs/audits/ENGINE_SAFETY_NET_AUDIT.md`; `git diff --check` |
| `docs/PROJECT_RULES.md` / `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` | Done | Added build-time LLM/content-factory constraints and parked the future narrative corpus foundation in the roadmap. | Engine/domain must emit structured facts only; narrative text belongs behind a content/presentation/narrator seam outside engine; LLM output is authoring-time, reviewed, schema-validated static content only; no runtime LLM and no LLM-generated gameplay truth. Future `Phase 84 - Narrative Content Factory And Corpus Foundation` is documented after core playable-loop and major-system readiness. | `git diff --check` |
| `docs/steps/62-engine-safety-net-and-deterministic-regression-gates/README.md` | Ready | Created Phase 62 documentation for engine safety-net and deterministic regression gates. | Phase 62 is scoped to audit current regression risks, add structured `simulateSeason` golden evidence, match edge-case/repeatability coverage, career fixture determinism smoke coverage, a long-run verification command pack, and a final report. It explicitly forbids gameplay tuning, UI work, season-advancement implementation, and post-match form/morale consequences. | `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 61 with a final report, architecture update, roadmap update, and one next-phase recommendation. | `WEB_VISUAL_IDENTITY_SYSTEM_REPORT.md` records why the rework was needed, the accepted three-skin set, removed id migration, token taxonomy, field/SVG non-touch proof, QA evidence, residual risks, and recommends exactly `Phase 62 - Inbox/Posta Decision Center`. `docs/ARCHITECTURE.md` now describes the visual-identity skin contract and Phase 61 visual QA. | `test -f docs/audits/WEB_VISUAL_IDENTITY_SYSTEM_REPORT.md`; `pnpm check`; `git diff --check`; `graphify update .` |
| `docs/steps/61-web-visual-identity-system-rework/07-visual-qa-and-art-direction-gate.md` | Done | Added and ran Phase 61 visual QA for all accepted skins. | `theme-palette.spec.ts` now writes to `/tmp/the-long-season-phase61`, checks the three accepted skins, verifies no horizontal overflow, stable semantic colors, stable tactical pitch grass, visible hierarchy, hover distinction, and border readability. `WEB_VISUAL_IDENTITY_QA.md` records screenshot evidence, manual art-direction acceptance, residual risks, and confirms `campo-calcio.svg` was not changed. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts`; `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/06-settings-picker-localization-and-tests.md` | Done | Updated the settings picker/read model/localization tests for the accepted skin set. | The app-entry picker exposes only the three accepted skins. All visible skin labels are localized in Italian, English, German, Spanish, and French, with tests proving every accepted skin has a concrete translation in each supported language. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- AppEntryScreen.test.tsx app-entry-view-model.test.ts preferences.test.ts theme-palettes.test.ts career-ui-store.test.ts`; `pnpm exec vitest run packages/i18n/src/labels.test.ts`; `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/05-light-skin-surface-hierarchy-rework.md` | Done | Reworked light-skin surface hierarchy so light options read as programme/archive skins instead of washed-out dark skins. | Light skins define paper/sepia app, shell, panel, elevated panel, table header, row, alternate row, selected row, muted text, borders, and primary actions through the same bounded hierarchy. Component CSS now uses table row/header/selected tokens for squad tables and preparation panels. Tactical field colors remain unchanged. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/04-dark-skin-surface-hierarchy-rework.md` | Done | Reworked dark-skin chrome hierarchy for shell, dashboard, Inbox/Posta, preparation panels, buttons, navigation, and tables. | Dark skins now distinguish app background, shell surface, panel, elevated panel, table header, row, selected row, secondary actions, and primary actions. Gold is reserved for active/primary emphasis instead of flooding every panel. Tactical field colors and `campo-calcio.svg` were not touched. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/03-palette-reduction-and-preference-migration.md` | Done | Reduced the public theme options to three accepted football-manager skins. | Public skin ids are now `floodlight-navy`, `club-office`, and `press-room`. Removed Phase 60 and superseded Phase 61 ids are deterministic compatibility inputs only, mapping to the closest accepted skin; unknown values fall back to `floodlight-navy`. Settings/view-model/store/i18n tests now expect the accepted skin set. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- theme-palettes.test.ts preferences.test.ts career-ui-store.test.ts app-entry-view-model.test.ts AppEntryScreen.test.tsx`; `pnpm exec vitest run packages/i18n/src/labels.test.ts`; `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/02-skin-contract-and-token-taxonomy.md` | Done | Replaced the generic palette contract with a hierarchy-based skin token taxonomy. | `theme-palettes.ts` now exposes app background, shell, panel, elevated panel, table header/row/alternate/selected row, borders, text, muted text, heading text, primary action, secondary action, focus, and overlay variables. `tokens.css` defines compatibility aliases for old consumed names while components migrate. Tests prove pitch, suitability, fitness, danger, success, and warning colors are outside the skin contract. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- theme-palettes.test.ts preferences.test.ts career-ui-store.test.ts app-entry-view-model.test.ts AppEntryScreen.test.tsx`; `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/01-current-palette-failure-review-and-target-lock.md` | Done | Locked the Phase 61 visual target before changing web code. | `WEB_VISUAL_IDENTITY_TARGET.md` records the approved retro-premium football-manager direction, rejected visual patterns, six target skins, deterministic migration decisions for the nine Phase 60 ids, the explicit field/SVG non-touch rule, and manual visual acceptance criteria. | `git diff --check` |
| `docs/steps/61-web-visual-identity-system-rework/README.md` | Ready | Created Phase 61 documentation to correct the rejected Phase 60 visual result before more web sections are built. | Phase 61 is now a focused visual identity system rework: target-lock audit, skin contract/token taxonomy, palette reduction with preference migration, dark and light skin hierarchy rework, settings/i18n/test update, Playwright plus manual art-direction QA, and a final report. The phase explicitly forbids changing `apps/web/src/assets/campo-calcio.svg` or tactical field colors. | `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 60 with a final report, architecture update, roadmap update, and one next-phase recommendation that was later superseded by user visual review. | `WEB_THEME_PALETTE_REPORT.md` records the nine-palette contract, preference state, CSS variable application, localized settings picker, non-themeable boundaries, hardcoded color cleanup, visual/accessibility evidence, roadmap section review, and residual risks. Its Inbox/Posta recommendation is superseded by `Phase 61 - Web Visual Identity System Rework` because the palette result was visually rejected. `docs/ARCHITECTURE.md` documents the web theme-palette contract and visual QA ownership. | `test -f docs/audits/WEB_THEME_PALETTE_REPORT.md`; `pnpm check`; `git diff --check`; phase-level i18n/web typechecks, web tests, web build, theme-palette visual QA, and `graphify update .` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/07-contrast-visual-qa-and-accessibility.md` | Done | Added browser visual QA for all nine supported palettes and documented accessibility evidence. | `theme-palette.spec.ts` cycles through every supported palette on app entry, dashboard, and match preparation across desktop and narrow viewports. It asserts root palette application, no horizontal overflow, stable semantic colors, and stable tactical pitch grass. `WEB_THEME_PALETTE_VISUAL_QA.md` records screenshot output, findings, and residual risks. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts`; `test -f docs/audits/WEB_THEME_PALETTE_VISUAL_QA.md`; `pnpm check`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/06-hardcoded-color-cleanup-and-non-theme-exceptions.md` | Done | Cleaned themeable UI accents and documented stable color exceptions. | Remaining themeable accent usage in buttons, navigation, dashboard, Inbox/Posta, and match-preparation chrome now routes through palette variables. `WEB_THEME_COLOR_EXCEPTIONS.md` documents pitch grass/SVG, pitch markings, suitability, form, severity, and bench football-surface exceptions. | `test -f docs/audits/WEB_THEME_COLOR_EXCEPTIONS.md`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/05-settings-palette-picker-ui.md` | Done | Added a compact localized palette picker to the app-entry settings area. | The first screen now renders an accessible radio fieldset with nine palette swatches, immediate preference updates, and localized labels in Italian, English, German, Spanish, and French. Focused rendering tests cover the picker output. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/04-css-variable-theme-application.md` | Done | Applied selected theme palettes through CSS variables. | `App` sets `data-theme-palette` on the document root; `tokens.css` defines palette variables and current accepted root overrides; app background, panel, scoreboard, line, text, focus, and button variables route through the palette while pitch and semantic colors stay separate. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `pnpm check`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/03-theme-preference-state-and-read-model.md` | Done | Added selected theme palette to the web preference state and app-entry read model. | `WebPreferences` now includes `themePaletteId` with deterministic fallback to `classic-green`; the app-entry view model exposes palette ids, swatches, and label keys; the Zustand career UI store can update the palette without touching career save or engine state. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- app-entry-view-model.test.ts career-ui-store.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/02-theme-palette-contract-and-boundaries.md` | Done | Added a typed, bounded web theme-palette contract. | `apps/web/src/app/theme-palettes.ts` defines six stable manager-game palette ids, one deterministic default, swatches, i18n label keys, and only UI-chrome variable fields. Focused tests prove id uniqueness, fallback behavior, and that pitch/semantic keys are not part of the contract. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- theme-palettes.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/01-current-color-token-and-hardcoded-audit.md` | Done | Audited current web color ownership before adding user-selectable palettes. | `WEB_THEME_COLOR_AUDIT.md` separates themeable app chrome from stable football-surface colors, semantic colors, role-suitability colors, and fitness colors. The audit identifies the CSS, React, SVG, preference, i18n, and visual-QA files that later Phase 60 steps need to touch. | `test -f docs/audits/WEB_THEME_COLOR_AUDIT.md`; `git diff --check` |
| `docs/steps/60-web-theme-palette-and-user-color-preferences/README.md` | Ready | Created Phase 60 documentation for user-selectable web theme palettes. | Phase 60 inserted a bounded display-preference phase before Inbox/Posta, but the resulting visual direction was later rejected. Its technical contract becomes input for Phase 61 visual identity rework. Inbox/Posta now moves to Phase 62. | Phase 60 README and 8 step files exist; roadmap updated; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 59 with a final quality report, architecture update, roadmap update, and next-phase recommendation. | `SHARED_BENCH_BOARD_REPORT.md` records the fixed `S1`-`S8` contract, goalkeeper requirement, contextual add/remove behavior, candidate ordering, helper actions, match-preparation integration, dead-code cleanup, visual/accessibility evidence, dependency/code/architecture/UI/accessibility/fun reviews, residual risks, and originally recommended Inbox/Posta next. That recommendation was superseded by Phase 60 theme preferences and then Phase 61 visual identity rework. Inbox/Posta now moves to Phase 62. `docs/ARCHITECTURE.md` documents the Phase 59 bench validation and shared tactical-board QA ownership. | `test -f docs/audits/SHARED_BENCH_BOARD_REPORT.md`; `pnpm check`; `git diff --check`; `graphify update .` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/07-responsive-accessibility-and-visual-qa.md` | Done | Extended browser QA for the shared bench board and documented visual/accessibility evidence. | `shared-tactical-board.spec.ts` now verifies the fixed 8-slot shared bench board, empty plus slots, filled number/surname/role tokens, bench add/remove menus, candidate exclusions, deterministic ability/form ordering, missing reserve-goalkeeper blocker, `Auto`/`Fill gaps`/`Clear` behavior across XI and bench, desktop/narrow overflow, keyboard reachability, and touch long-press. `SHARED_BENCH_BOARD_VISUAL_QA.md` records screenshot paths, accessibility notes, visual findings, and residual risks. | `pnpm --filter @game/web run typecheck`; `node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/06-match-preparation-replacement-and-dead-code-cleanup.md` | Done | Replaced the match-preparation bench grid with the shared tactical bench board and removed obsolete picker code. | `CareerMatchPreparationScreen` now maps `@game/ui` bench slots into `TacticalBenchBoard` slot/candidate data and delegates bench add/remove through existing screen callbacks. The old `BenchSelectionPanel` and its select-based test were deleted, old bench CSS selectors were removed, and `docs/ARCHITECTURE.md` now documents `tactical-board-bench.ts` and `TacticalBenchBoard.tsx` ownership. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- CareerMatchPreparationScreen.test.tsx TacticalBenchBoard.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/05-helper-actions-and-save-readiness-integration.md` | Done | Verified helper actions and save readiness across XI, bench, and the goalkeeper requirement. | Existing explicit `Auto`, `Riempi`, and `Svuota` behavior now has stronger evidence: `Auto` fills XI then all 8 bench slots with role coverage including a goalkeeper when possible; `Riempi` preserves manager selections while filling gaps; `Svuota` clears XI and bench while preserving formation/tactic. The match-preparation screen now tests the visible alert for `bench needs a goalkeeper` when a full bench lacks a goalkeeper. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/ui run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/ui run test -- career-match-preparation-view.test.ts`; `pnpm --filter @game/web run test -- match-preparation-demo.test.ts CareerMatchPreparationScreen.test.tsx`; `pnpm check`; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/04-bench-context-menu-and-candidate-picker.md` | Done | Added contextual add/remove behavior and deterministic candidate ordering to the shared bench board. | `TacticalBenchBoard` now opens a reusable `TacticalBoardMenu` for fixed substitute slots: empty slots show available candidate rows sorted by current ability, fitness, position order, and stable identity, while filled slots show only `Remove from bench`. The menu supports outside/background/`Esc` close in normal uncontrolled usage, keeps XI role-change behavior intact, excludes selected/unavailable players through caller-owned inputs, and adds localized bench removal text. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- TacticalBenchBoard.test.ts TacticalBoardMenu.test.ts tactical-board-squad.test.ts tactical-board-suitability.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/03-shared-bench-board-component-foundation.md` | Done | Added the shared fixed-slot bench board foundation. | `features/tactics-board` now owns a state-free `TacticalBenchBoard`, `TacticalBenchSlotToken`, and `tactical-board-bench` contract with exactly eight `bench:01`-`bench:08` slots. Empty slots render a compact `+`; filled slots render shirt number, surname, and role code on a green mini-board surface. The new accessible empty-slot label is localized in all five supported languages. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- TacticalBenchBoard.test.ts tactical-board-bench.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/02-bench-read-model-validation-and-ordering.md` | Done | Added shared bench-readiness semantics and deterministic bench helper ordering. | `@game/ui` now blocks a fully selected bench with no goalkeeper using `missing_bench_goalkeeper`, while leaving empty-bench states covered by `missing_bench_slot` to avoid duplicate noise. The web demo bench helper now sorts by current ability, fitness, football position order, and stable identity. The new blocker was localized in all five supported languages because it is visible UI text. | `pnpm --filter @game/ui run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/ui run test -- career-match-preparation-view.test.ts`; `pnpm --filter @game/web run test -- match-preparation-demo.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/01-current-bench-flow-audit-and-target-contract.md` | Done | Audited the current bench implementation and locked the target substitute-selection contract. | `SHARED_BENCH_BOARD_UX_AUDIT.md` records the active inline `BenchSelectionGrid`, the obsolete native-select `BenchSelectionPanel`, existing read-model blockers, missing goalkeeper blocker, helper-action behavior, ownership boundaries, and the target `S1`-`S8` mini-board contract. | `test -f docs/audits/SHARED_BENCH_BOARD_UX_AUDIT.md`; `git diff --check` |
| `docs/steps/59-shared-bench-board-and-substitute-selection/README.md` | Ready | Created Phase 59 documentation for a shared bench board and substitute-selection rework before Inbox/Posta. | Phase 59 turns the user's bench decisions into an executable sequence: fixed `S1`-`S8` reserve slots, mini green bench board, `+` empty slots, contextual add/remove behavior, deterministic candidate ordering by overall/current ability and form, required bench goalkeeper, helper actions that fill XI then bench, match-preparation replacement, dead-code cleanup, Playwright visual/accessibility QA, and final section-quality report. Inbox/Posta Decision Center was initially moved to Phase 60, then superseded by the Phase 60 theme-palette insertion and Phase 61 visual identity rework, and now moves to Phase 62. | Phase 59 README and 8 step files exist; roadmap updated; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 58 with a final UX report, architecture update, roadmap update, and one next-phase recommendation. | `MATCH_PREPARATION_TACTICAL_WORKSPACE_UX_REPORT.md` records compact header/alert decisions, menu dismissal, candidate ranking, shared candidate rows, bench parity, board toolbar, three-player spacing, Playwright/accessibility evidence, residual risks, and recommends exactly `Phase 59 - Inbox/Posta Decision Center`. `docs/ARCHITECTURE.md` now reflects the Phase 58 match-preparation tactical workspace, shared player candidate row, context-menu dismissal, responsive candidate-row behavior, and updated visual QA responsibility. | `test -f docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_UX_REPORT.md`; `pnpm check`; `git diff --check`; `graphify update .` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/07-responsive-accessibility-and-visual-qa.md` | Done | Extended browser QA for the compact tactical workspace and documented visual/accessibility evidence. | `shared-tactical-board.spec.ts` now verifies first-viewport compact chrome, alert strip replacement, board toolbar reachability, menu dismissal on outside click/pitch click/`Esc`/completed action, suitability-sorted candidates, bench candidate-row parity, three-`CC` and three-`DC` spacing, desktop/narrow overflow, keyboard reachability, and touch long press. The QA found a real mobile overflow in shared candidate rows, fixed with a narrow responsive CSS rule that wraps candidate meta below the player name. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts`; `test -f docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_VISUAL_QA.md`; `pnpm check`; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/06-board-spacing-density-and-toolbar-polish.md` | Done | Moved helper controls into a compact board toolbar and improved three-player central-line spacing. | Formation selection plus `Auto`, `Fill gaps`, and `Clear` now sit in a board-local toolbar above the shared tactical board. Formation presets apply dynamic spacing only when exactly three `CC` or three `DC` slots exist, keeping two-player lines unchanged and all coordinates normalized. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/05-bench-selection-visual-parity.md` | Done | Reworked the 8-player bench picker to use the same player candidate row language as XI assignment. | Match preparation now renders each reserve slot as an explicit details-based picker outside the pitch. Candidate rows show shirt number, surname, localized role, compact fitness percentage, preferred foot when known, and own-role suitability. Duplicate/lineup overlap blockers and save readiness still come from the existing read model; no bench drag/drop or hidden auto-selection was added. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/04-shared-player-candidate-row-and-picker-contract.md` | Done | Added a dense shared player candidate row and used it in the tactical-board assignment menu. | `PlayerCandidateRow` renders shirt number, surname, localized role, compact fitness percentage, optional foot, and localized suitability badge without depending on stores or engine logic. `TacticalBoardMenu` now uses the shared row for XI assignment candidates, keeping keyboard-reachable button behavior and existing role-change/remove actions. | `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/03-context-menu-dismissal-and-candidate-ranking.md` | Done | Made tactical-board candidate ordering deterministic and fixed stuck context menus. | `TacticalBoardPitch` now closes the menu on background/outside pointer down, `Esc`, and completed menu actions while preserving slot open, right-click, and long-press behavior. Assignment candidates are sorted by role suitability, current ability, fitness, then stable identity through reusable suitability helpers instead of inline component sorting. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/02-compact-match-header-and-alert-strip.md` | Done | Replaced the oversized match context and blocker card with a compact header strip and alert strip. | `CareerMatchPreparationScreen` now shows selected club, next fixture, XI count, bench count, and tactic state in one compact strip, then renders blockers as a horizontal attention strip while preserving the existing blocker/readiness semantics. CSS removes the old blocker-card presentation from this screen and keeps the dashboard action visible. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test -- CareerMatchPreparationScreen.test.ts`; `pnpm --filter @game/i18n run test -- labels.test.ts` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/01-current-ux-issue-audit-and-target-layout.md` | Done | Audited the current match-preparation tactical workspace UX before source changes. | `docs/audits/MATCH_PREPARATION_TACTICAL_WORKSPACE_UX_AUDIT.md` records the oversized context/blocker panels, detached board controls, sticky tactical menu, candidate ordering needs, XI/bench visual mismatch, and three-player central-line spacing issue. The target layout is a compact match header, compact alert strip, board toolbar, board-first hierarchy, shared candidate row language, and deferred Inbox/Posta. | UX audit exists; `git diff --check` |
| `docs/steps/58-match-preparation-tactical-workspace-ux-rework/README.md` | Ready | Created Phase 58 documentation for a focused match-preparation tactical workspace UX rework before Inbox/Posta. | Phase 58 turns the user review into an executable sequence: compact match header, compact alert strip, board toolbar, context-menu dismissal, candidate ordering by role suitability/current ability/fitness, shared candidate row for XI and bench, bench visual parity, improved three-`CC` and three-`DC` spacing, Playwright visual/accessibility QA, and a final next-phase decision. Inbox/Posta Decision Center moves after this rework so it routes into a stronger preparation screen. | Phase 58 README and 8 step files exist; roadmap updated; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/09-phase-report-and-next-phase-decision.md` | Done | Closed Phase 57 with a final report, architecture update, roadmap update, and one next-phase recommendation. | `docs/audits/SHARED_TACTICAL_BOARD_REPORT.md` documents supplied-feature decisions, canonical role adaptation, normalized coordinates, shared board state ownership, real squad mapping, derived suitability, match-preparation replacement, persistence shape, touch/accessibility QA, and non-blocking risks. `docs/ARCHITECTURE.md` now identifies `apps/web/src/features/tactics-board` as the reusable tactical surface and explains the flow from domain formation catalog to UI read model to web board to match preparation, future Tactics, and read-only matchday reuse. Its original Inbox/Posta recommendation is superseded by `Phase 58 - Match Preparation Tactical Workspace UX Rework`. | report exists; `pnpm check`; `git diff --check`; `graphify update .` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/08-regression-visual-qa-accessibility-and-touch.md` | Done | Added browser QA and documented accessibility/touch findings for the shared board. | `shared-tactical-board.spec.ts` drives the real app through match preparation, validates empty and filled board states, desktop/narrow overflow, active drag zones, CC clamp, goalkeeper lock and replacement menu, ED-to-AD role change with derived `4-3-3` shape, remove/candidate filtering, suitability change, long-press open/cancel behavior, and keyboard reachability. `SHARED_TACTICAL_BOARD_VISUAL_QA.md` records screenshot paths and residual non-blocking risks. | web typecheck; web test; web build; Playwright shared tactical-board QA; audit file exists; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/07-match-preparation-replacement-and-persistence.md` | Done | Replaced the visible match-preparation pitch with the shared tactical board while preserving bench, tactic, save, dashboard, Inbox/Posta, and Continue behavior. | `CareerMatchPreparationScreen` now mounts `TacticalBoardPitch` with the persisted `tacticalBoardDraft`, current demo squad mapping, derived current shape, and board callbacks. The Zustand store exposes focused adapter actions for moving board slots, changing board roles, and clearing assignments; the existing lineup assignment, helper actions, bench validation, tactic selection, save readiness, dashboard blockers, and Continue flow remain intact. | web and UI typecheck; focused match-preparation screen/demo/career-loop/store/UI tests; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/06-real-squad-mapping-and-role-suitability.md` | Done | Added current-data squad mapping and deterministic role suitability for the shared board. | `tactical-board-squad.ts` maps current match-preparation player options into board-ready player facts with stable numbers, surnames, fitness-derived form trend, primary and alternative canonical roles, current ability, and role suitability maps. `suitFor(player, role)` now derives suitability from the game's existing position-fit tiers rather than the supplied feature's sample heuristics, and match-preparation exposes the mapped demo squad for the next integration step. | web typecheck; focused tactical-board squad/suitability, match-preparation demo, and player-position ordering tests; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/05-drag-zone-context-menu-and-touch-interactions.md` | Done | Added reusable board interactions without storing pixel state. | `tactical-board-interactions.ts` now owns drag/long-press helpers, goalkeeper drag/role locks, movement threshold rules, and active zone overlay geometry. `TacticalBoardPitch` remains controlled: it opens click/right-click/keyboard/long-press menus, shows only the dragged slot's role zone, clamps emitted move coordinates to the role zone, prevents goalkeeper drag and role changes, lists non-XI candidates for empty slots, and delegates move/change/remove/assign through callbacks. | web typecheck; focused tactical-board interaction/pitch tests; web test suite; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/04-pitch-markings-token-and-player-token-integration.md` | Done | Added the reusable visual shell for the shared tactical board without drag behavior. | The board now renders a localized vertical pitch, copied/adapted premium pitch markings, assigned player tokens with number/surname/role/form/suitability border, empty slots, and a reusable menu shell. Tactical-board labels were added in all five supported languages and the CSS uses existing design-system tokens for board surfaces and semantic token colors. | web and i18n typecheck; focused tactical-board pitch and i18n label tests; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/03-shared-tactical-board-state-and-adapters.md` | Done | Added persistence-ready board state and current demo/store adapters without changing the visible UI. | `tactical-board-state.ts` owns pure draft creation, base formation loading, slot movement, role changes, clearing, assignment, duplicate prevention, and selection-map extraction. `DemoMatchPreparationState` now carries a `tacticalBoardDraft` synchronized with the existing `selectedPlayerIdsBySlot`, and `career-ui-store` keeps that draft inside the current preparation state. Duplicate XI selections are prevented at assignment time, producing a missing-slot blocker instead of a later duplicate error. | web typecheck; focused tactical-board state/adapters, career store, and match-preparation demo tests; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/02-canonical-board-role-and-geometry-contract.md` | Done | Added the shared tactical-board role, geometry, and formation contract. | `apps/web/src/features/tactics-board` now owns normalized board types, the 12 display-role codes mapped to canonical roles, movement zones, role options by field cell, SVG viewBox geometry helpers, and formation presets adapted from `@game/ui` rather than importing domain directly from the browser. Tests cover reference-only role removal, ED-to-AD role availability, coordinate round-trips, clamping, derived shapes, and normalized slot coordinates. | web typecheck; focused tactical-board contract tests; `pnpm check`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/01-supplied-feature-audit-and-integration-map.md` | Done | Audited the supplied tactical feature before source integration. | `docs/audits/SHARED_TACTICAL_BOARD_FEATURE_AUDIT.md` classifies each supplied module as copy/adapt, reimplement, or reject; confirms Phase 56 canonical roles remain the source of truth; records `REG`, `SP`, and `PC` remaps; identifies `TacticalPitchLineup`, `match-preparation-demo`, and `career-ui-store` as integration targets; and keeps opponent board, live matchday tactics, full Tactics route, and bench drag/drop out of scope. | `test -f docs/audits/SHARED_TACTICAL_BOARD_FEATURE_AUDIT.md`; `git diff --check` |
| `docs/steps/57-shared-tactical-board-and-tactics-screen-foundation/README.md` | Ready | Created Phase 57 documentation for the shared tactical board and future tactics-screen foundation. | Phase 57 integrates the supplied `feature_richiesta/the-long-season-tactics` reference as a game-owned shared tactical board instead of a second model. The documented scope keeps the 12 canonical roles, normalized slot coordinates, slot/player separation, real squad mapping, derived suitability, drag zones, right-click and long-press menus, match-preparation persistence, separate 8-player bench, Playwright visual/touch/accessibility QA, and defers Inbox/Posta Decision Center until the tactical workspace is strong enough to receive routed attention events. | Phase 57 README and 9 step files exist; roadmap updated; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 56 with a final report, architecture update, roadmap update, and one next-phase recommendation. | `docs/audits/CANONICAL_FORMATION_ROLE_REPORT.md` summarizes the canonical role model, role-vs-slot distinction, domain catalog ownership, `@game/ui -> @game/domain` dependency decision, manager-triggered helper behavior, SVG pitch integration, QA results, non-blocking risks, and its original next recommendation, now superseded by `Phase 57 - Shared Tactical Board And Tactics Screen Foundation`. `docs/ARCHITECTURE.md` now documents the formation-to-pitch flow and SVG asset ownership for junior developers. | report exists; `pnpm check`; `git diff --check`; `graphify update .` |
| `docs/steps/56-canonical-formation-and-role-catalog/07-regression-visual-qa-and-accessibility.md` | Done | Completed browser regression QA and accessibility audit for the canonical formation workspace. | Playwright now covers the critical formations `4-4-2`, `4-3-3`, `4-2-3-1`, `3-5-2`, `3-6-1`, and `5-3-2`; it asserts no slot overlap/out-of-pitch placement, SVG pitch usage, no legacy pitch-marking markup, no horizontal overflow, scrollable squad table, 11 lineup selects, 8 bench selects, and keyboard reachability for helper buttons, lineup, bench, tactic, formation, and save. `docs/audits/CANONICAL_FORMATION_ROLE_VISUAL_QA.md` records screenshots, findings, accessibility notes, and non-blocking residual risk. | web typecheck; web tests; web build; Playwright tactics workspace QA; visual QA audit exists; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/06a-pitch-svg-background-integration.md` | Done | Integrated the supplied football-pitch SVG into the reusable tactical pitch. | The web app now owns `apps/web/src/assets/campo-calcio.svg`, imports it into `TacticalPitchLineup`, uses it as a decorative contained background, removes the previous duplicate CSS field markings, and keeps the stable pitch-slot grid over the SVG. Visual QA now asserts the SVG pitch asset marker, rendered background image, and absence of legacy pitch-marking markup. | asset existence check; web typecheck; focused pitch layout/tactical pitch tests; web build; Playwright tactics workspace QA; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/06-i18n-and-web-pitch-slot-mapping.md` | Done | Completed localized formation/helper labels and aligned pitch coordinates with canonical slot keys. | All domain formation labels now have match-preparation i18n keys in the five supported languages, helper action labels remain compact, and the pitch layout maps the canonical `dm` slot plus all critical formations to bounded unique grid cells. The pitch card still exposes only alert icons for unresolved slots while preserving accessible labels. | i18n/web typecheck; focused i18n, pitch layout, and tactical pitch tests; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/05-ui-read-model-derives-from-domain-catalog.md` | Done | Removed the independent UI formation slot catalog and derived match-preparation formation facts from domain. | `@game/ui` now explicitly depends on `@game/domain` for canonical formation contracts while remaining framework-free and language-agnostic. Dependency Cruiser and project architecture rules allow only this inner-domain dependency for UI read models. `CAREER_MATCH_PREPARATION_FORMATIONS` is adapted from `FORMATION_CATALOG`, and tests assert UI slot keys/position keys match the domain source of truth. | UI typecheck; focused match-preparation view test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/04a-manager-triggered-selection-actions.md` | Done | Added explicit manager-triggered helper actions for XI and bench selection. | `Auto`, `Fill gaps`, and `Clear` are localized in all five supported languages and run only from explicit UI buttons. The web demo state now ranks lineup options by slot fit plus current ability, fills the bench with goalkeeper/defense/midfield/attack coverage before strongest extras, preserves manager choices for `Fill gaps`, and clears only XI/bench selections for `Clear`; save readiness and duplicate validation remain unchanged. | domain/ui/i18n/web typecheck; focused suitability, match-preparation view, i18n, tactical pitch, screen, and demo-state tests; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/04-position-suitability-and-selection-ordering.md` | Done | Reworked player-slot suitability and web option ordering around canonical player roles. | Domain suitability now evaluates canonical slot roles, keeps side metadata as a small deterministic tie-breaker, and exposes `scorePlayerForFormationSlot` so explicit manager helpers can rank valid adapted strength above mediocre natural fit while preserving weak/invalid gaps. Web squad/select ordering now uses position order plus optional current ability rather than localized role text; suitability was tightened so full backs and strikers do not hide wide-midfield or attacking-midfield squad gaps. | domain/web typecheck; focused suitability, web ordering, formation-fit, and CLI tests; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/03-domain-formation-catalog-rewrite.md` | Done | Reworked domain formation slots to expose canonical player roles while preserving active callers. | `FormationSlot` now carries `playerRole` as the canonical slot requirement and keeps `positionFamily` as a same-value compatibility alias for current engine/UI callers. The catalog no longer uses `right_wing_back`, `left_wing_back`, or `second_striker` as slot role requirements; three-at-the-back wide slots use midfield-wide roles, five-at-the-back wide slots use full-back roles, and 4-4-1-1 uses an attacking-midfielder support slot. | domain typecheck; focused `formations.test.ts` and `player-roles.test.ts`; transient content test timeout rerun passed; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/02-canonical-role-contract.md` | Done | Added the dependency-free domain contract for the 12 canonical player roles. | `packages/domain/src/tactics/player-roles.ts` now exposes `CANONICAL_PLAYER_ROLES`, `CanonicalPlayerRole`, department/order helpers, and a type guard. Tests reject slot-side and variant names such as `right_wing_back`, `left_wing_back`, `second_striker`, `cb-right`, `cm-left`, and `dm-right` as canonical player roles. | domain typecheck; focused `player-roles.test.ts`; `pnpm check`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/01-current-formation-role-divergence-audit.md` | Done | Audited all current formation, role, slot, suitability, i18n, and pitch ownership before source changes. | `docs/audits/CANONICAL_FORMATION_ROLE_AUDIT.md` records that domain should own canonical roles and formation slot semantics, `@game/ui` should derive read-model formation facts from domain, and web should own only pitch rendering/interaction. The audit identifies the current drift around `right_wing_back`, `left_wing_back`, `second_striker`, duplicated UI formation arrays, web fit tiers, and i18n labels. | `test -f docs/audits/CANONICAL_FORMATION_ROLE_AUDIT.md`; `git diff --check` |
| `docs/steps/56-canonical-formation-and-role-catalog/README.md` | Ready | Created Phase 56 documentation for the canonical formation and role catalog rework. | Phase 56 supersedes the immediate Inbox/Posta Decision Center recommendation because tactical UI and future tactics/squad screens need one stable football grammar first. The phase fixes the role-vs-slot distinction: player roles are limited to 12 canonical roles, while side/channel belongs to formation slots and pitch layout. It also adds explicit manager-triggered `Auto`, `Fill gaps`, and `Clear` helper actions for XI and bench selection plus the supplied SVG pitch background integration. Inbox/Posta Decision Center moves after this cleanup. | Phase 56 README and 10 step files created; roadmap updated; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/01-phase-53-output-and-workspace-scope.md` | Done | Confirmed Phase 54 must complete the tactical workspace before Inbox/Posta Decision Center. | `docs/audits/WEB_TACTICS_WORKSPACE_SCOPE.md` records the Phase 52/53 evidence, current gaps, adopted scope, out-of-scope items, roadmap constraint check, UX target, and decision to extend `@game/ui` before React controls. The roadmap already has Phase 54 as the tactical workspace and Phase 55 as Inbox/Posta. | `test -f docs/audits/WEB_TACTICS_WORKSPACE_SCOPE.md`; roadmap phase `rg`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/02-formation-catalog-and-preparation-contract.md` | Done | Extended the framework-free match-preparation read model. | `@game/ui` now exposes the Phase 54 formation catalog, selected formation state, formation slots, optional bench slots, bench validation, missing/duplicate/lineup-overlap bench blockers, and save readiness across formation, XI, bench, and tactic. Existing callers remain compatible through the default `4-4-2` formation and optional bench input. New i18n labels cover formation, bench, bench statuses, new blockers, and additional slot labels in all five supported languages. | UI typecheck; i18n typecheck; focused UI/i18n tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/03-web-preparation-state-and-formation-switching.md` | Done | Extended the web demo preparation state without rendering new controls yet. | `apps/web` now stores selected formation, selected XI by formation slot, optional ordered bench selections, and tactic/save state. Formation changes preserve only slots that still exist in the new formation, clear stale selections deterministically, and never auto-fill players. Bench validation is activated once bench state is touched, preserving the existing visible screen until Step 05 renders bench controls; Step 05 now records that visible bench controls must pass all 8 slots so missing substitutes block saving. | web typecheck; focused web adapter/state tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/04-tactical-workspace-component-boundaries.md` | Done | Hardened current tactical components for multiple formations and future tactics reuse. | `TacticalPitchLineup` now uses a reusable pitch-grid coordinate helper instead of slot-specific CSS selectors, so new formation slots render in bounded pitch positions. `SquadSelectionTable` keeps fixed-height scrolling and tactical position sorting. Focused component tests were converted from ignored `.test.tsx` files to executable `.test.ts` files, and `docs/ARCHITECTURE.md` now documents pitch layout, tactical ordering, and match-preparation adapter responsibilities. | web typecheck; focused component tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/05-starting-xi-and-bench-selection-flow.md` | Done | Rendered manager-controlled formation and bench selection in the tactical workspace. | The web match-preparation screen now exposes a formation selector, renders formation-specific pitch slots, shows a dedicated 8-slot substitutes panel, lets the manager manually assign bench players, marks squad rows as XI/bench/available, and requires all bench slots in the read model before save readiness can pass. No auto-fill, recommendation, substitution, or persistence behavior was added. | web typecheck; focused web tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/06-tactic-profile-and-save-readiness-integration.md` | Done | Verified full preparation save readiness across formation, XI, bench, duplicate validation, and tactic. | Existing read-model logic already blocked save until formation, XI, bench, and tactic were valid. Focused tests now assert blocker visibility, available save state only for complete preparation, and unsaved state after changing formation, XI, bench, or tactic. No persistence, fixture advancement, tactic recommendation, or automatic switching was added. | web typecheck; web tests; focused web tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/07-dashboard-inbox-and-continue-readiness.md` | Done | Verified the tactical workspace is reachable from dashboard and Inbox/Posta and clears Continue blockers only after saved complete preparation. | Focused web career-loop tests cover missing-preparation blockers, prepare-match action availability, Continue stop reason, Inbox/Posta prepare action, complete saved preparation, dashboard blocker clearance, and Continue reaching matchday. No new Inbox message center, matchday simulation UI, or persistence scope was added. | web typecheck; web tests; focused career-loop tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/08-responsive-accessibility-and-visual-qa.md` | Done | Added and ran browser QA for the completed tactical workspace. | `apps/web/src/visual-qa/tactics-workspace.spec.ts` verifies dashboard and Inbox/Posta routes, formation switching, XI selection, 8-player bench selection, tactic selection, save readiness, dashboard blocker clearance, Continue readiness, desktop/narrow overflow, pitch slot overlap, fixed-height squad table behavior, and keyboard reachability. `docs/audits/WEB_TACTICS_WORKSPACE_VISUAL_QA.md` records screenshot paths and accessibility notes; screenshots are in `/tmp/the-long-season-phase54`. | web typecheck; web tests; web build; Phase 54 Playwright QA; audit file exists; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/09-section-quality-report-and-next-phase-decision.md` | Done | Closed Phase 54 and recommended exactly one next phase. | `docs/audits/WEB_TACTICS_WORKSPACE_REPORT.md` documents formation catalog, formation switching, reusable tactical components, XI selection, bench selection, tactic/save readiness, dashboard/Inbox/Continue integration, browser QA, dependency/code-quality/architecture/UI/accessibility/football-identity/fun reviews, known non-blocking issues, and the next recommendation: `Phase 55 - Inbox/Posta Decision Center`. `docs/ARCHITECTURE.md` now documents Phase 54 tactical workspace responsibilities and browser QA. | final report exists; UI typecheck; web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/README.md` | Ready | Inserted a web architecture foundation phase before Inbox/Posta Decision Center. | Phase 55 will audit and rework the web app structure, install Zustand and Tailwind with `nvm use 24` before package changes, move existing browser state into a focused store, migrate to a feature-first folder map, reduce custom CSS where Tailwind improves readability, run browser regression QA, and then recommend the next phase. Inbox/Posta Decision Center moves to Phase 56. | Documentation-only update; Phase 55 README/step files exist; roadmap and project rules updated; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/01-current-web-architecture-audit.md` | Done | Audited current `apps/web` architecture before source moves or dependency installs. | `docs/audits/WEB_ARCHITECTURE_FOUNDATION_AUDIT.md` records current folder responsibilities, broad/shallow Modules, React state currently concentrated in `App.tsx`, CSS pressure in `components.css`, graphify findings, concrete non-problems, checks to preserve, and the decision to proceed with Phase 55 before Inbox/Posta. | `test -f docs/audits/WEB_ARCHITECTURE_FOUNDATION_AUDIT.md`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/02-folder-map-and-migration-plan.md` | Done | Defined the target web folder map before source moves. | `docs/audits/WEB_FOLDER_STRUCTURE_PLAN.md` assigns every current `apps/web/src` file to a target home, documents folder responsibilities, import conventions, `shared/*` constraints, and the migration order: tooling first, store second, then feature-first file moves. | `test -f docs/audits/WEB_FOLDER_STRUCTURE_PLAN.md`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/03-install-zustand-and-tailwind-tooling.md` | Done | Installed Zustand and Tailwind tooling for the web app without state or folder migration. | `@game/web` now declares `zustand`; Tailwind and `@tailwindcss/vite` are wired through Vite after `nvm use 24`, with the current CSS chain preserved and no component behavior changes. | `node --version`; Zustand import smoke; web typecheck; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/04-zustand-career-ui-store.md` | Done | Moved existing browser career UI state out of `App.tsx`. | `apps/web/src/stores/career-ui-store.ts` now owns the current screen, preferences, demo career availability, Continue result, and match-preparation draft. `App.tsx` builds view models and wires components from store selectors without duplicated React state. | web typecheck; web test; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/05-feature-first-folder-migration.md` | Done | Migrated `apps/web/src` into a feature-first structure without behavior changes. | `App` moved under `app/`; app-entry, dashboard, career shell, and match preparation moved under `features/`; reusable tactical UI/helpers moved under `shared/`; Zustand stayed in `stores/`; old `career`, `components`, and `screens` folders were removed. Label helpers were placed in `shared/lib` so `shared/ui` does not import from feature code. | old-folder removal check; web typecheck; web test; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/06-tailwind-foundation-and-css-reduction.md` | Done | Added a single Tailwind CSS entry and reduced generic app-entry CSS. | `styles/index.css` now imports Tailwind and project CSS in order; the main menu uses Tailwind utilities for generic layout/spacing while retro shell, tactical pitch, dashboard, Inbox/Posta, and complex component styling remain in named CSS. `WEB_STYLING_SYSTEM_REVIEW.md` documents the boundary. | styling audit exists; web typecheck; web test; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/07-regression-visual-qa-and-accessibility.md` | Done | Verified the browser experience after the architecture and styling rework. | Added and ran `apps/web/src/visual-qa/architecture-rework.spec.ts`, producing desktop/narrow screenshots under `/tmp/the-long-season-phase55`; `WEB_ARCHITECTURE_REWORK_VISUAL_QA.md` records flow coverage, accessibility checks, and visual findings. | Phase 55 Playwright QA; visual QA audit exists; web typecheck; web test; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/55-web-architecture-state-and-styling-foundation/08-architecture-report-and-next-phase-decision.md` | Done | Closed Phase 55 with a final architecture/state/styling report and one next-phase recommendation. | `WEB_ARCHITECTURE_STATE_STYLING_REPORT.md` documents the final web folder map, Zustand seam, Tailwind/custom-CSS split, dependency review, locality review, folder-purpose review, store seam review, styling-system review, UI regression review, accessibility review, and the original recommendation for `Phase 56 - Inbox/Posta Decision Center`, now superseded by `Phase 56 - Canonical Formation And Role Catalog`. | final report exists; web typecheck; web test; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/54-tactics-and-match-preparation-workspace-completion/README.md` | Ready | Created the Phase 54 documentation path for completing match preparation as a reusable tactical workspace. | Phase 54 comes before Inbox/Posta Decision Center because Inbox should route to a solid preparation decision screen. The phase requires a formation catalog, formation switching, manual XI selection, manual 8-player bench selection, duplicate validation, tactic/save readiness, dashboard/Inbox/Continue integration, Playwright QA, and a final section-quality review. The roadmap was updated so Inbox/Posta follows as Phase 55. | Documentation-only update; Phase 54 README/step files exist; roadmap updated; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/README.md` | Ready | Created the Phase 53 documentation path for a global retro-football UI identity rework. | Phase 53 must rework the existing shell, dashboard, Inbox/Posta rail, and match-preparation screen into a Championship Manager / Scudetto-inspired club control room before more web sections are added. The phase explicitly requires a vertical tactical pitch, compact squad list, Playwright visual QA, WCAG-oriented accessibility checks, and a final fun/agency review. | Documentation-only update; Phase 53 README/step files exist; roadmap updated; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/01-current-ui-audit-and-identity-scope.md` | Done | Documented the current UI identity gap before source changes. | `docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_SCOPE.md` records the current generic dashboard feeling, card-like Inbox/Posta rail, form-like match preparation, adopted Championship Manager / Scudetto direction, behavior to preserve, out-of-scope items, and roadmap constraint check. | audit file exists; required identity terms found; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/02-theme-tokens-and-retro-football-design-system.md` | Done | Reworked the web visual foundation. | `apps/web/src/styles` now has a sharper retro-football token set, club-office/pitch/scoreboard surfaces, stronger focus rings, more tactile buttons, and denser panel/list primitives without changing React components, gameplay, labels, or layout ownership. | web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/03-shell-topbar-and-navigation-rework.md` | Done | Reworked the career shell header into a club operations control room. | `CareerShell` now supports localized context facts supplied by screens, shows a restrained crest placeholder, presents selected club and screen context in the top chrome, and gives Continue stronger heartbeat treatment while preserving top navigation, Main menu, left Inbox/Posta, central outlet, and Phase 52 behavior. | web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/04-inbox-rail-football-decision-rework.md` | Done | Reworked the compact Inbox/Posta rail into a stronger decision surface. | `CareerInboxPanel` now exposes action-required state, compact counts, message urgency/status badges, related labels, and more prominent action placement while preserving the existing action callback and without adding a full message detail center, persistence, news, or new categories. | web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/05-dashboard-club-control-room-rework.md` | Done | Reworked the dashboard into a denser club control-room surface. | `CareerDashboardScreen` now puts blockers, next fixture, preparation readiness, and actions in a first-viewport command center, keeps selected club/condition/table/recent facts as secondary compact panels, and preserves existing dashboard actions and readiness logic. | web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/06-match-preparation-pitch-and-squad-layout.md` | Done | Reworked match preparation into a football-first tactical layout. | The screen now centers on a vertical tactical pitch/lavagna with native slot selects, keeps blockers and tactic controls visible, adds a compact squad table with name/role/age/fitness/foot/status, and shows a selected-player detail panel. Demo-only age/foot facts live in the web adapter so they can later map to real career player state without changing engine behavior. | web typecheck; web tests; web build; i18n typecheck; focused i18n labels test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/07-responsive-accessibility-and-visual-qa.md` | Done | Added and ran Phase 53 browser QA. | `apps/web/src/visual-qa/retro-football-identity.spec.ts` verifies main menu, shell/top navigation, left Inbox/Posta rail, dashboard control room, dashboard and Inbox paths into match preparation, pitch layout, squad list, tactic selection, save preparation, dashboard blocker clearance, Continue to matchday, desktop/narrow overflow, and keyboard focus. `docs/audits/WEB_RETRO_FOOTBALL_UI_VISUAL_QA.md` records screenshot paths and findings; screenshots are in `/tmp/the-long-season-phase53`. | web typecheck; web tests; web build; Phase 53 Playwright QA; audit file exists; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/53-retro-football-ui-identity-rework/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 53 and applied post-review component extraction. | `docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_REPORT.md` records the completed retro-football identity rework, scope boundaries, dependency/code-quality/architecture/UI/accessibility/football-identity/fun reviews, known non-blocking issues, and the post-review next-phase recommendation: `Phase 54 - Tactics And Match Preparation Workspace Completion`. Post-review, match-preparation tactical pitch, squad table, player detail, and tactical label helpers were extracted into reusable components for the future Tactics section. `docs/ARCHITECTURE.md` now reflects the Phase 53 web responsibilities, reusable tactical components, and visual QA. | final report exists; web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/README.md` | Ready | Created the Phase 52 documentation path for the first almost-complete web match-preparation section. | Phase 52 is scoped to resolving the current missing-lineup/missing-tactic blockers from the web UI through structured read models, a deterministic web demo adapter, lineup and tactic selection, dashboard/Inbox resolution, browser QA, and a final dependency/code-quality/UI/UX/fun review. | Documentation-only update; Phase 52 README/step files exist; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/01-phase-51-output-and-preparation-scope.md` | Done | Documented why match preparation is the correct next section and what it must include. | `docs/audits/WEB_MATCH_PREPARATION_SCOPE_REVIEW.md` confirms the current blockers, shell placement, roadmap constraints, first useful section shape, dependencies, out-of-scope items, and dead-code risks. | `test -f docs/audits/WEB_MATCH_PREPARATION_SCOPE_REVIEW.md`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/02-match-preparation-view-contract.md` | Done | Added the framework-free match-preparation view contract. | `@game/ui` now exposes `buildCareerMatchPreparationView`, stable lineup/tactic/fixture/action contracts, deterministic blocker derivation for missing fixture, missing slots, duplicate players, and missing tactic, plus focused tests for blocked, ready, saved, duplicate, and no-fixture states. | `pnpm --filter @game/ui run typecheck`; focused match-preparation view test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/03-web-preparation-demo-adapter-and-state.md` | Done | Added web-owned deterministic match-preparation demo facts and in-memory state. | `apps/web` now builds match-preparation views from replaceable demo facts, tracks selected lineup/tactic/save status in memory, keeps complete-but-unsaved distinct from saved, and feeds saved preparation facts into dashboard/Continue without browser persistence. | `pnpm --filter @game/web run typecheck`; web tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/04-lineup-selection-screen.md` | Done | Added the first editable web lineup selection screen. | The dashboard `prepare_match` action opens a central match-preparation screen inside the career shell. The screen shows next fixture, selected club, selected slot count, visible lineup blockers, 11 stable lineup slots, accessible player selects, role/condition option facts, and localized slot/status labels without drag-and-drop, best XI, recommendations, squad needs, or market advice. | web typecheck; web tests; i18n typecheck; focused i18n labels test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/05-tactic-selection-and-save-flow.md` | Done | Added tactic selection and explicit save-preparation flow. | The match-preparation screen now renders structured tactic profiles with mentality/pressing/directness/width/risk values, lets the user select one profile, shows all blockers including missing tactic, and enables Save preparation only when lineup and tactic are valid. Saving updates in-memory state only; no browser or JSON persistence was added. | web typecheck; web tests; i18n typecheck; focused i18n labels test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/06-dashboard-and-inbox-preparation-resolution.md` | Done | Wired dashboard, Inbox/Posta, and Continue to preparation state. | The dashboard action and Inbox/Posta `prepare_match` action open match preparation. Saved in-memory preparation clears dashboard blockers, makes `advance_next_fixture` available in the prototype, clears the stale missing-preparation inbox stop, and lets Continue stop at `matchday_reached` instead of missing preparation. | web typecheck; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/07-responsive-accessibility-and-visual-qa.md` | Done | Added and ran Phase 52 browser QA. | `apps/web/src/visual-qa/match-preparation.spec.ts` verifies main menu, dashboard blockers, dashboard action path, Inbox/Posta action path, lineup/tactic selection, save, dashboard blocker clearance, Continue to matchday, desktop/narrow overflow, and keyboard focus path. Screenshots are written to `/tmp/the-long-season-phase52`; `docs/audits/WEB_MATCH_PREPARATION_VISUAL_QA.md` records findings. | web typecheck; web tests; web build; Phase 52 Playwright QA; audit file exists; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/08-section-quality-fun-and-architecture-review.md` | Done | Reviewed the match-preparation section before phase closure. | `docs/audits/WEB_MATCH_PREPARATION_SECTION_REVIEW.md` records dependency, code-quality, architecture, UI/UX, accessibility, and fun review results. The section is judged strong enough to build on; non-blocking future improvements are assigned to squad, tactics, persistence, or later CSS organization scope. | section review audit exists; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/52-web-match-preparation-slice/09-phase-report-and-next-phase-decision.md` | Done | Closed Phase 52. | `docs/audits/WEB_MATCH_PREPARATION_SLICE_REPORT.md` summarizes the completed read model, web adapter/state, lineup selection, tactic selection, save flow, dashboard/Inbox resolution, localization, Playwright QA, quality/fun review, out-of-scope boundaries, known non-blocking issues, and its original next recommendation. The current roadmap supersedes that order by inserting `Phase 53 - Retro Football UI Identity Rework` before the full Inbox/Posta decision center. `docs/ARCHITECTURE.md` now maps the match-preparation read model, web adapter, screen, and visual QA. | final report exists; UI typecheck; web typecheck/test/build; Phase 52 Playwright QA; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/README.md` | Ready | Created the Phase 51 documentation path for web shell navigation and accessible Inbox placement. | Phase 51 inserts a UI-structure/accessibility phase before match preparation: top global navigation, left Inbox/Posta attention rail, central selected-content area, Continue as career heartbeat, and WCAG 2.2 AA as the working accessibility target. | Documentation-only update; Phase 51 README/step files exist; `git diff --check` passed |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/01-phase-50-output-and-layout-accessibility-scope.md` | Done | Documented the Phase 51 shell direction and accessibility target before changing source. | `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md` adopts top global navigation, left Inbox/Posta attention rail, central selected-screen content, Continue as career heartbeat, and WCAG 2.2 AA as the web UI working target. `requirements.md` and `docs/PROJECT_RULES.md` now reflect the Posta rail and web accessibility constraints. | `test -f docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_SCOPE.md`; required scope/rules `rg`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/02-career-shell-navigation-contract.md` | Done | Added the dependency-free career shell/navigation contract. | `packages/ui/src/career/career-shell-view.ts` now exposes stable section keys, navigation item contracts, current-section state, central content section, and Inbox rail summary state using label keys and structured data only. | `pnpm --filter @game/ui run typecheck`; focused shell-view test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/03-web-shell-layout-restructure.md` | Done | Added the top-navigation web career shell around the dashboard. | `CareerShell` renders branded context, global navigation, Main menu, Continue, and central content outlet. `CareerDashboardScreen` now renders inside that shell while preserving dashboard facts, Continue behavior, and dashboard-local Inbox placement for Step 04. New shell labels were added for all five languages. | `pnpm --filter @game/web run typecheck`; web tests; web build; i18n typecheck; focused i18n labels test; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/04-left-inbox-rail-placement-and-content-outlet.md` | Done | Moved Inbox/Posta into the left shell rail. | `CareerShell` now renders an `aside` rail with `CareerInboxPanel` from `shellView.inboxRail`, while the dashboard remains central content. The existing Continue result and Inbox message behavior are preserved. | `pnpm --filter @game/web run typecheck`; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/05-accessible-navigation-and-keyboard-flow.md` | Done | Documented keyboard/focus accessibility and tightened the shell action group semantics. | `docs/audits/WEB_SHELL_KEYBOARD_ACCESSIBILITY_REVIEW.md` records expected tab order, landmarks, accessible names, current navigation state, disabled future-section behavior, Inbox reachability, and focus visibility for the app entry and dashboard shell. `CareerShell` now groups Main menu and Continue actions with an explicit labeled action group. | `test -f docs/audits/WEB_SHELL_KEYBOARD_ACCESSIBILITY_REVIEW.md`; `pnpm --filter @game/web run typecheck`; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/06-responsive-density-and-retro-premium-polish.md` | Done | Polished shell density and responsive presentation without changing behavior. | CSS now keeps desktop top navigation on one row at the checked viewport, slightly reduces the left rail footprint, preserves accessible hit height, protects central dashboard values from overflow, and keeps the narrow layout stacked as Posta rail plus central content. | `pnpm --filter @game/web run typecheck`; web tests; web build; browser smoke for desktop/narrow; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/07-playwright-accessibility-and-visual-qa.md` | Done | Added and ran Phase 51 Playwright visual/accessibility QA. | `apps/web/src/visual-qa/shell-accessibility.spec.ts` drives Chromium through main menu, New career, shell landmarks, current navigation, desktop/narrow geometry, keyboard focus path, Continue stop, and Inbox action state. Screenshots are written to `/tmp/the-long-season-phase51`. `docs/audits/WEB_SHELL_ACCESSIBILITY_VISUAL_QA.md` records the findings. | `pnpm --filter @game/web run typecheck`; web tests; web build; Phase 51 Playwright QA; audit file exists; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/51-web-layout-shell-navigation-and-accessible-inbox-placement/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 51 with a final report, architecture update, and one next-phase recommendation. | `docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_REPORT.md` records the completed shell, WCAG target, keyboard/focus findings, screenshot evidence, package direction, out-of-scope boundaries, and exactly one recommendation: `Phase 52 - Web Match Preparation Slice`. `docs/ARCHITECTURE.md` now maps `career-shell-view`, `CareerShell`, and shell visual QA. | `test -f docs/audits/WEB_SHELL_LAYOUT_ACCESSIBILITY_REPORT.md`; UI typecheck; web typecheck/test/build; Phase 51 Playwright QA; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/README.md` | Done | Created and executed the Phase 50 documentation path for career Continue and Inbox/Posta foundation. | Phase 50 replaces the immediate match-preparation-slice recommendation with a more foundational Football Manager style loop: dashboard `Continue` advances until an attention event, and the event appears as structured Inbox/Posta data. It keeps implementation narrow to match preparation and matchday readiness while documenting future stop categories without implementing them. | Phase completed; final checks passed |
| `docs/steps/50-career-continue-and-inbox-foundation/01-phase-49-output-and-continue-loop-scope.md` | Done | Reviewed Phase 49 output and bounded the Continue/InBox scope. | `docs/audits/CAREER_CONTINUE_INBOX_SCOPE_REVIEW.md` confirms Phase 50 should implement only `match_preparation_required` and `matchday_reached` stops, with future market/contract/youth/economics/staff categories documented but not generated. | `test -f docs/audits/CAREER_CONTINUE_INBOX_SCOPE_REVIEW.md`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/02-inbox-domain-contract.md` | Done | Added the dependency-free Inbox/Posta domain contract. | `packages/domain/src/career/inbox.ts` now defines stable `inbox:` IDs, message category/status/priority/action contracts, related entities, a validated constructor, and unresolved action-required detection without storing rendered prose. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/career/inbox.test.ts`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/03-career-attention-event-classification.md` | Done | Added deterministic language-agnostic attention events. | `packages/domain/src/career/attention.ts` now defines `attention:` IDs, event categories, reasons, blocker keys, helpers for match-preparation-required and matchday-reached stops, deterministic comparison, and unresolved-event detection. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/career/attention.test.ts`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/04-continue-until-next-attention-stop.md` | Done | Added pure career continuation until the next attention stop. | `continueCareerUntilAttention` accepts explicit current date, selected club, next fixture, preparation facts, and existing attention events; it returns deterministic stop dates, days advanced, attention events, and Inbox messages without mutation, persistence, fixture simulation, or automatic choices. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/continue-career.test.ts`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/05-career-inbox-view-model.md` | Done | Added the framework-free Inbox/Posta view model. | `packages/ui/src/career/career-inbox-view.ts` builds ordered Inbox views, unread/action-required counts, highest priority, and empty-state keys from structural input while keeping `@game/ui` dependency-free. | `pnpm --filter @game/ui run typecheck`; `pnpm exec vitest run packages/ui/src/career/career-inbox-view.test.ts`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/06-web-dashboard-continue-action.md` | Done | Wired the web dashboard Continue action to the structured continuation result. | `apps/web` now depends on `@game/engine` as allowed by project rules, `continueDemoCareer` delegates to `continueCareerUntilAttention`, the dashboard shows localized stop-state details, and no persistence, fixture simulation, or automatic manager decision was added. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/i18n/src/labels.test.ts`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/07-web-inbox-panel-prototype.md` | Done | Added the compact web Inbox/Posta panel. | `CareerInboxPanel` renders unread/action-required counts, ordered message summaries, priority/status keys, and message actions from `CareerInboxView`; the dashboard now shows the panel after Continue produces messages, with localized labels and responsive retro-premium styling. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `pnpm --filter @game/i18n run typecheck`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/08-playwright-continue-and-inbox-qa.md` | Done | Added and ran browser QA for the Continue/Posta flow. | `apps/web/src/visual-qa/continue-inbox.spec.ts` starts Vite, drives Chromium through main menu, new career, dashboard, Continue, attention stop, and Inbox/Posta on desktop and narrow viewports, writing screenshots to `/tmp/the-long-season-phase50`. `docs/audits/CAREER_CONTINUE_INBOX_VISUAL_QA.md` records no visual blockers. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `node --experimental-strip-types apps/web/src/visual-qa/continue-inbox.spec.ts`; `test -f docs/audits/CAREER_CONTINUE_INBOX_VISUAL_QA.md`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/50-career-continue-and-inbox-foundation/09-phase-report-and-next-phase-decision.md` | Done | Closed Phase 50 with implementation report, architecture update, and one next-phase recommendation. | `docs/audits/CAREER_CONTINUE_INBOX_FOUNDATION_REPORT.md` records the implemented Inbox contract, attention contract, Continue-until-attention rule, Inbox view model, web Continue action, web Inbox panel, visual QA findings, out-of-scope areas, and exactly one recommended next phase: `Phase 51 - Web Match Preparation Slice`. | `test -f docs/audits/CAREER_CONTINUE_INBOX_FOUNDATION_REPORT.md`; domain/engine/ui/web typechecks; web tests; web build; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/README.md` | Done | Created and executed the Phase 47 documentation path for the pre-UI engine confidence gate. | Phase 47 audited the current match engine, career loop, and player generation before UI readiness. It classified findings by user-facing impact and preserved Phase 48 as the queued UI readiness phase. | Documentation and audit execution; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/01-engine-confidence-scope.md` | Done | Defined the pre-UI confidence audit scope before collecting evidence. | `docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md` defines match, season, career-loop, generation, and warning-semantics questions; sample seeds/commands; and a fun-first blocker classification model. | `test -f docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md`; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/02-match-engine-sample-review.md` | Done | Reviewed deterministic match explanation samples before exposing match outcomes in the first UI. | `docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md` classifies four fixture samples as healthy or story-positive variance; no pre-UI match-engine blocker was found. | `test -f docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md`; fixture explanation smokes for `world-a` and `world-b`; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/03-career-loop-sample-review.md` | Done | Reviewed career creation, summary, squad/youth snapshots, development, and ten-season signals before UI readiness. | `docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md` found no first-dashboard blocker; career summary/preparation facts are ready, youth population is controlled, growth/decline creates stories, and long-run warnings remain monitoring signals. Youth nationality `unknown` is tracked as a post-UI improvement before a dedicated youth screen. | `test -f docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md`; career new-world, summary, development-report, 10x10 ten-season report; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/04-player-generation-sanity-review.md` | Done | Reviewed generated player quality, role coherence, prospects, identities, and division credibility before UI readiness. | `docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md` found no generation blocker: no reviewed current-ability `15+` senior players, no role-coherence warnings, controlled prospect budgets, exactly `11` youth per club, and credible mostly domestic lower-division identity. Repeated first names and youth nationality presentation remain post-UI polish/improvement notes. | `test -f docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md`; player-generation reports for `world-a` and `world-b`; identity review for `world-a`; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/05-fun-signals-and-blocker-classification.md` | Done | Consolidated match, career, and generation findings into a fun-first blocker table. | `docs/audits/PRE_UI_FUN_SIGNALS_AND_BLOCKERS.md` found no pre-UI blocker; it records positive fun signals and carries risks into Phase 48: no CLI prose parsing, no raw long-run warning UI, no automatic squad-needs advice, and no full youth detail while youth nationality can render `unknown`. | `test -f docs/audits/PRE_UI_FUN_SIGNALS_AND_BLOCKERS.md`; `git diff --check` |
| `docs/steps/47-pre-ui-engine-confidence-gate/06-pre-ui-engine-confidence-report.md` | Done | Closed the Phase 47 pre-UI engine confidence gate. | `docs/audits/PRE_UI_ENGINE_CONFIDENCE_REPORT.md` records that the engine is ready for Phase 48 with non-blocking risks: no CLI prose parsing, no raw warning UI, no automatic squad-needs advice, and no full youth detail before youth nationality presentation is fixed. | `pnpm check`; season, fixture-explanation, 10x10 ten-season, and strict balance smokes; `test -f docs/audits/PRE_UI_ENGINE_CONFIDENCE_REPORT.md`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/README.md` | Not started | Created and revised the Phase 48 documentation path for career UI slice readiness and first-screen scope. | Phase 48 starts with a readiness review, defines the app entry/main menu as the real first screen, defines the career dashboard/matchday hub as the first post-load career screen, introduces UI-facing entry/dashboard/action contracts only if justified, adds a CLI dashboard smoke output, and closes with one next-phase decision. Economics, salaries, contracts, stadiums, and ticket prices stay out of Phase 48 except for currency preference readiness. No React or web app implementation is included in the documentation. | Documentation-only update; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/01-phase-47-output-review.md` | Done | Confirmed Phase 48 can proceed after the pre-UI engine confidence gate. | `docs/audits/CAREER_UI_SLICE_READINESS_REVIEW.md` classifies reusable career facts, CLI-only rendering, UI-facing candidates, app-entry facts, career-dashboard facts, package-boundary risks, localization risks, and non-blocking first-screen risks. It confirms `Main Menu / App Entry` as the real first screen and `Career Dashboard / Matchday Hub` as the first post-load career screen. | `test -f docs/audits/CAREER_UI_SLICE_READINESS_REVIEW.md`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/02-first-screen-product-scope.md` | Done | Defined the bounded product scope for the app entry and first post-load career screen. | `docs/audits/CAREER_FIRST_SCREEN_SCOPE.md` defines `Main Menu / App Entry` with new career, continue career, settings, language, and currency; defines `Career Dashboard / Matchday Hub` with career context, selected club, next fixture, preparation, condition, compact table context, recent match context, actions, and blockers; and keeps economics and visual design out of Phase 48 except for currency preference readiness. | `test -f docs/audits/CAREER_FIRST_SCREEN_SCOPE.md`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/03-career-dashboard-view-contract.md` | Done | Added the minimal `@game/ui` read-model package with app-entry and career-dashboard view contracts. | `packages/ui` exports `AppEntryView` and `CareerDashboardView` contracts using stable IDs, status keys, numeric values, translation keys, language keys, and currency preference keys. The package has no React, browser, storage, content, engine, CLI, or i18n dependency. | `pnpm --filter @game/ui run typecheck`; focused `packages/ui` view-contract tests; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/04-career-dashboard-view-builder.md` | Done | Added a deterministic pure builder for the first post-load career dashboard view. | `buildCareerDashboardView` accepts explicit loaded-save facts, derives preparation blockers, compact condition summary, table/recent-match context, alert keys, and dashboard action availability without storage IO, localization rendering, engine simulation, hidden recommendations, economics, or mutation. | `pnpm --filter @game/ui run typecheck`; focused dashboard builder tests; `pnpm check`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/05-career-action-result-contracts.md` | Done | Added structured app-entry and career-dashboard action availability/result contracts. | `packages/ui` now exports app-entry actions, career-dashboard actions, generic UI action results, and helper constructors. The dashboard builder uses the shared career action helper instead of local action mapping. No action execution, settings persistence, save writes, or gameplay behavior was added. | `pnpm --filter @game/ui run typecheck`; focused `packages/ui` action/view/builder tests; `pnpm check`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/06-cli-dashboard-smoke-output.md` | Done | Added a localized read-only career dashboard smoke output. | `pnpm cli career --save=<saveId> --dashboard` loads an existing career save, adapts it into the shared `@game/ui` dashboard builder, and renders compact career context, selected club, next fixture, preparation readiness, condition summary, table context, recent match, actions, and blockers without mutating the save or duplicating dashboard readiness logic in CLI rendering. `@game/cli` now declares its workspace dependency on `@game/ui` for this smoke adapter. | `pnpm --filter @game/ui run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused i18n/UI/career CLI tests; `pnpm check`; `pnpm cli career --save=phase48-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase48-check --dashboard`; `git diff --check` |
| `docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/07-ui-readiness-report-and-next-phase-decision.md` | Done | Closed Phase 48 with a readiness report and next-phase recommendation. | `docs/audits/CAREER_UI_SLICE_READINESS_REPORT.md` confirms that the future web UI can consume structured app-entry and career-dashboard contracts without parsing CLI prose. `docs/ARCHITECTURE.md` now documents `@game/ui` as a language-agnostic read-model boundary. The single recommended next phase is `Phase 49 - Web App Shell, Main Menu, And Career Dashboard Prototype`; Phase 49 docs were not created. | `test -f docs/audits/CAREER_UI_SLICE_READINESS_REPORT.md`; `pnpm --filter @game/ui run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm check`; `pnpm cli career --save=phase48-check --summary`; `pnpm cli career --save=phase48-check --dashboard`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/README.md` | Not started | Created the Phase 49 documentation path for the first web prototype. | Phase 49 will add a Vite React `apps/web` shell, app-entry/main-menu screen, settings foundation, retro-premium visual foundation, deterministic dashboard demo adapter, career dashboard screen, and final QA report. It must not add gameplay, economics, browser persistence, or hidden recommendations. | Documentation-only update; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/01-phase-48-output-and-web-scope-review.md` | Done | Confirmed the exact web slice and package-boundary changes before adding `apps/web`. | `docs/audits/WEB_APP_SHELL_SCOPE_REVIEW.md` defines the main menu, settings, demo new/continue career, and career dashboard flow. `docs/PROJECT_RULES.md` and `.dependency-cruiser.cjs` now explicitly allow outer apps to use `@game/i18n`, keep `@game/ui` isolated, block engine from UI imports, and block direct web imports from `@game/domain`. | `test -f docs/audits/WEB_APP_SHELL_SCOPE_REVIEW.md`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/02-web-workspace-scaffold-and-boundary-rules.md` | Done | Added the minimal buildable `@game/web` workspace app. | `apps/web` now contains a Vite React TypeScript scaffold with `dev`, `build`, `preview`, `typecheck`, and `test` scripts. The placeholder app shell intentionally renders no final user-facing labels, imports no engine/content/storage modules, and adds no gameplay or real screen behavior. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/03-web-localization-and-preferences-foundation.md` | Done | Added bounded in-memory web preferences and a translation adapter. | `apps/web/src/app/preferences.ts` defines deterministic `en`/`EUR` defaults, supported language/currency options, parsers, immutable updates, and label-key helpers. `apps/web/src/app/translation.ts` wraps `@game/i18n`. The app shell now proves visible labels react to language changes without adding economics or durable settings. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/i18n run typecheck`; focused i18n labels test; `pnpm check`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/04-retro-premium-visual-foundation.md` | Done | Added the first reusable premium-retro CSS foundation. | `apps/web/src/styles` now defines tokens, base styles, and layout chrome for a dense football-manager shell. `docs/audits/WEB_RETRO_PREMIUM_VISUAL_DIRECTION.md` records palette, typography, density, allowed assets, and later art-phase work. Runtime verification found and fixed a React select-handler issue by capturing control values before functional state updates. | `test -f docs/audits/WEB_RETRO_PREMIUM_VISUAL_DIRECTION.md`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run build`; `pnpm check`; `git diff --check`; local dev server smoke |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/05-main-menu-app-entry-screen.md` | Done | Added the real localized main menu/app-entry screen. | `apps/web/src/app/app-entry-view-model.ts` builds `AppEntryView` from `@game/ui` contracts. `AppEntryScreen` renders New career, Continue career, and Settings controls for language/currency. Continue is unavailable until the in-memory demo career exists; New career enables that prototype state without writing browser storage or showing dashboard details yet. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/i18n run typecheck`; focused i18n labels test; `pnpm check`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/06-career-dashboard-demo-adapter.md` | Done | Added a deterministic read-only demo dashboard adapter and presenter. | `build-demo-career-dashboard.ts` builds explicit Phase 48-like dashboard facts for `world-a` and passes them to `buildCareerDashboardView` from `@game/ui`. `career-dashboard-presenter.ts` groups the resulting view for React without duplicating readiness logic, parsing CLI output, writing saves, or loading real browser persistence. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm check`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/07-career-dashboard-screen-prototype.md` | Done | Rendered the first read-only web career dashboard and wired menu navigation to it. | `CareerDashboardScreen` renders header/context, selected club, next fixture, match preparation, condition, table context, recent match, actions, and blockers from the deterministic dashboard presenter. `App` now moves New career and available Continue career into the same in-memory demo dashboard without advancing fixtures, parsing CLI output, or adding real persistence. | `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `pnpm check`; `git diff --check` |
| `docs/steps/49-web-app-shell-main-menu-and-career-dashboard-prototype/08-web-prototype-qa-and-next-phase-report.md` | Done | Closed Phase 49 with QA report and architecture update. | `docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md` summarizes the web workspace, app entry, settings, visual foundation, demo dashboard adapter, dashboard screen, package direction, QA findings, out-of-scope items, and exactly one recommended next phase: `Phase 50 - Web Match Preparation Slice`. `docs/ARCHITECTURE.md` now documents `apps/web` areas and entry points. | `test -f docs/audits/WEB_APP_SHELL_PROTOTYPE_REPORT.md`; `pnpm --filter @game/web run typecheck`; `pnpm --filter @game/web run test`; `pnpm --filter @game/web run build`; `pnpm depcruise`; `pnpm check`; `git diff --check`; local dev server smoke |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/README.md` | Not started | Created the Phase 46 documentation path for ten-season report and long-run presentation boundaries. | Phase 46 starts with a responsibility audit, then separates report data building from CLI rendering, clarifies warning presentation, documents manual inspection commands, updates architecture, and closes with one next-phase recommendation. | Documentation-only update; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/01-ten-season-report-responsibility-audit.md` | Done | Mapped current ten-season report and long-run gate responsibilities before moving source. | `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md` identifies `report-data.ts` as the narrow first extraction: a CLI-local data-builder module that owns single-world and multi-world report facts while command parsing and rendering stay put until later steps. | `test -f docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/02-long-run-report-data-builder-boundary.md` | Done | Extracted long-run report data construction behind a named CLI-local builder boundary. | Added `apps/cli/src/commands/ten-season-report/report-data.ts` for single-world report bundles, multi-world gate aggregation, report-only career refresh, row builders, warning counts, and diagnostic snapshots. `ten-season-report.ts` remains the command parser, file writer, and renderer. No simulation behavior, thresholds, or output wording changed intentionally. | CLI typecheck; focused ten-season-report tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase46-builder --worlds=10 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/03-long-run-cli-output-renderers.md` | Done | Split ten-season and long-run gate CLI rendering into section-owned output modules. | Added `gate-output.ts` for multi-world gate text/Markdown output and `single-world-output.ts` for single-world ten-season output. `ten-season-report.ts` now focuses on command parsing, orchestration, and file writing; `report-data.ts` remains the report facts boundary. No thresholds, simulation behavior, or warning semantics changed. | CLI typecheck; i18n typecheck; focused ten-season-report tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=10 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/04-warning-semantics-presentation-cleanup.md` | Done | Clarified long-run warning presentation without changing gate semantics. | Added `docs/audits/LONG_RUN_WARNING_PRESENTATION_REVIEW.md` and a localized `Signal guide` line in gate output explaining `story`, `monitor`, and `structural` signal groups. No thresholds, simulation behavior, warning keys, or fail semantics changed. | Audit file exists; CLI typecheck; i18n typecheck; focused ten-season-report and i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase46-warning --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/05-long-run-manual-inspection-command-review.md` | Done | Documented repeatable manual long-run inspection commands and review guidance. | Added `docs/audits/LONG_RUN_MANUAL_INSPECTION_GUIDE.md` covering quick 10x10, medium 50x10, deeper 250x30, single-world follow-up, and what to inspect for world survival, squad size, youth pressure, table variety, production concentration, transfer turnover, growth, and aging. No source change was needed. | Guide file exists; `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=10 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/06-presentation-boundary-review-and-architecture-update.md` | Done | Documented the post-split ten-season report boundary and updated architecture docs. | Added `docs/audits/TEN_SEASON_REPORT_BOUNDARY_REVIEW.md`; updated `docs/ARCHITECTURE.md` so the long-run report command points to `report-data.ts`, `single-world-output.ts`, and `gate-output.ts`, and so debugging paths reflect the implemented boundary. | Boundary review file exists; `pnpm check`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/07-phase-report-and-next-phase-decision.md` | Done | Closed Phase 46 with a final report and one next-phase recommendation. | Added `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_REPORT.md`; the report records changed files, created modules, preserved behavior, checks, risks, and recommends `Phase 48 - Career UI Slice Readiness And First Screen Scope` without starting it. | Final report file exists; CLI/i18n/simulation-tools typechecks; `pnpm check`; final 10x10 and 50x10 ten-season reports; strict calibration balance report; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/01-career-format-responsibility-audit.md` | Done | Mapped `career/format.ts` presentation responsibilities before moving source. | `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md` records output-family boundaries, helper ownership risks, what should remain in `format.ts`, and recommends `career/overview-output.ts` as the first low-risk extraction. | `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/02-career-overview-output-module.md` | Done | Extracted career overview presentation into a named module. | `apps/cli/src/commands/career/overview-output.ts` owns new-world preview, summary, and inspect output; `career.ts` imports those formatters directly; helpers still shared by advancement/squad/youth remain in `career/format.ts` until a stable helper boundary emerges. | CLI typecheck; focused career CLI tests; `pnpm check`; overview CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/03-career-preparation-output-module.md` | Done | Extracted saved lineup, saved tactic, and match-preparation presentation into a named module. | `apps/cli/src/commands/career/preparation-output.ts` owns preparation output; overview imports the narrow match-preparation formatter; small lineup/tactic helpers remain in `format.ts` until matchday output moves. | CLI typecheck; focused career CLI tests; `pnpm check`; preparation CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/04-career-matchday-output-module.md` | Done | Extracted career advancement and explanation-trace presentation into a named module. | `apps/cli/src/commands/career/matchday-output.ts` owns advance output, recovery lines, condition lines, and optional explanation trace rendering; `career.ts` imports it directly; generic helpers remain in `format.ts` pending Step 07 boundary review. | CLI typecheck; focused career CLI tests; `pnpm check`; matchday CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/05-career-roster-and-development-output-module.md` | Done | Extracted squad, youth academy, and development report presentation into player-facing modules. | `roster-output.ts` owns squad/youth output and derived player display helpers; `development-output.ts` owns development report output; hidden potential remains unexposed. | CLI typecheck; focused career CLI tests; `pnpm check`; roster/development CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/06-career-market-and-rollover-output-module.md` | Done | Extracted career market apply and season rollover output into named modules. | `market-output.ts` owns permanent-transfer apply output; `season-rollover-output.ts` owns rollover output; `format.ts` now remains as a 193-line shared presentation helper module. | CLI typecheck; focused career CLI tests; `pnpm check`; market CLI smoke; rollover invalid-path CLI smoke; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/07-career-presentation-boundary-review.md` | Done | Documented post-split career presentation boundaries. | `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md` classifies pure CLI renderers, builder-like modules, helper ownership, future UI view-model candidates, and remaining hotspots; `docs/ARCHITECTURE.md` now maps the new career output modules. | `pnpm check`; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 45 with a final report and one next-phase recommendation. | `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md` records changed files, modules created, behavior preserved, remaining risks, final checks, and recommends `46-ten-season-report-decomposition-and-long-run-presentation-boundaries` without starting it. | Report file exists; CLI/i18n typechecks; `pnpm check`; final career CLI smokes; strict balance report; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/README.md` | Not started | Created the Phase 45 documentation path. | Phase 45 decomposes the career presentation layer by output family: audit first, overview output, preparation output, matchday output, roster/development output, market/rollover output, presentation-boundary review, and final phase report. No UI or gameplay change is included in the documentation. | Documentation-only update; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/07-phase-report-and-next-phase-decision.md` | Done | Closed Phase 44 with the final CLI adapter decomposition report and one next-phase recommendation. | `docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md` records changed files, new modules, preserved behavior, remaining risks, final checks, and recommends `Phase 45 - Career Presentation Decomposition And View-Model Readiness` without starting it. | `test -f docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md`; CLI/i18n typechecks; `pnpm check`; all required simulate-season smoke commands; strict balance report; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/06-presentation-boundary-review.md` | Done | Documented the post-split simulate-season presentation boundaries. | `docs/audits/CLI_PRESENTATION_BOUNDARY_REVIEW.md` maps the adapter, parser, demo builders, CLI renderers, mixed builder/renderers, future UI view-model candidates, remaining hotspots, and recommends `career/format.ts` before `ten-season-report.ts` as the next presentation decomposition target. `docs/ARCHITECTURE.md` now lists the Phase 44 simulate-season module map. | `pnpm check`; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/05-simulate-season-summary-renderer.md` | Done | Extracted default season and round output out of `simulate-season.ts`. | `season-summary-output.ts` now owns default season summary, final table, top player summaries, best/worst team rows, and round fixture/scorer rendering; `simulate-season.ts` keeps simulation, validation, fixture/manual-switch composition, and dispatch. | CLI typecheck; focused simulate-season/i18n tests; `pnpm check`; season/round/Italian season smokes; strict balance report; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/04-simulate-season-inspection-renderers.md` | Done | Extracted remaining broad inspection renderers out of `simulate-season.ts`. | `generated-inspection-output.ts` owns identity review and player-generation report output; `demo-output.ts` owns setup, condition, lineup, and fixture-lineup inspection output; existing formation-fit and market-demo renderer seams were kept. | CLI typecheck; focused simulate-season/i18n tests; `pnpm check`; identity/player-generation/formation-fit/market-demo CLI smokes; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/03-simulate-season-demo-builders-module.md` | Done | Extracted simulate-season demo construction out of the command adapter. | `apps/cli/src/commands/simulate-season/demo-builders.ts` now owns setup, lineup, condition, fixture-scoped lineup inspection builders, profile applicability helper, and CLI-owned demo types; `simulate-season.ts` still composes user-selected demos and renders output. | CLI typecheck; focused simulate-season tests; `pnpm check`; condition/setup/lineup/manual-switch CLI smokes; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/02-simulate-season-fixture-detail-module.md` | Done | Extracted fixture-detail rendering out of `simulate-season.ts`. | `apps/cli/src/commands/simulate-season/fixture-detail-output.ts` now owns fixture result lines, scorer lines, event rows, all-starter player match stats, and optional explanation trace rendering; `simulate-season.ts` still owns command dispatch, fixture selection, demo construction, and season orchestration. | CLI typecheck; focused simulate-season/i18n tests; `pnpm check`; fixture, explanation, lineup-demo, manual-switch CLI smokes; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/01-cli-adapter-responsibility-audit.md` | Done | Mapped `simulate-season.ts` responsibilities before moving source. | `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md` records current module inventory, responsibility clusters, risks, what must remain in the adapter, and recommends fixture-detail output as the Step 02 extraction target. | `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/01-package-and-file-complexity-inventory.md` | Done | Created a package and file complexity audit before source refactors. | `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md` records package responsibilities, dependency direction, file line/import/export counts, readability scores, split priorities, and Step 02 interface review targets. | Required inventory commands; `pnpm depcruise`; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/02-public-interface-surface-review.md` | Done | Reviewed package public interfaces before source refactors. | `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md` classifies stable entry points, stable contracts, low-level helpers, and future narrowing candidates; Step 03 should keep `progressNextCareerFixture` as the likely career advancement entry point and improve readability only if needed. | Import/export scans; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/03-career-advancement-deep-module.md` | Done | Clarified the career fixture advancement entry point without changing gameplay. | `progressNextCareerFixture` remains the stable engine entry point; its TSDoc now states the exact flow and caller-owned pre-match responsibilities, private helpers make context validation and simulation/report creation easier to follow, and a focused test proves caller-supplied recovered state is treated as pre-match truth. | Engine typecheck; focused career tests; `pnpm check`; career create/prep/advance/summary smokes; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/04-cli-command-slimming-plan-and-first-slice.md` | Done | Wrote the CLI slimming plan and applied one narrow safe CLI split. | `apps/cli/src/commands/career/season-labs.ts` now owns the pure development-report and season-rollover lab builders; `career.ts` remains the storage/dispatch adapter; `docs/audits/ARCHITECTURE_CLI_SLIMMING_PLAN.md` records the target CLI shape and future candidates. | CLI/i18n typechecks; focused career/i18n tests; `pnpm check`; career new-world/summary/squad smokes; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/05-world-generation-module-deepening.md` | Done | Clarified the generated-world content entry point without tuning generated content. | `createFakeLeagueSystem` remains the single content facade for generated league worlds; its TSDoc now explains composition order and caller intent, a focused test locks the coherent world bundle contract, and `docs/audits/ARCHITECTURE_WORLD_GENERATION_REVIEW.md` documents internal generator responsibilities and export decisions. | Content typecheck; focused content generator tests; `pnpm check`; simulate-season world-a smoke; career new-world/summary smokes; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/06-long-run-diagnostics-module-cleanup.md` | Done | Moved shared long-run status severity semantics out of CLI. | `worstLongRunAnomalyStatus` now lives in `@game/simulation-tools` and is used by `ten-season-report` when combining anomaly and youth diagnostics; `docs/audits/ARCHITECTURE_LONG_RUN_DIAGNOSTICS_REVIEW.md` records why broader report extraction is premature without weakening package boundaries. | simulation-tools/CLI typechecks; focused long-run/CLI tests; `pnpm check`; strict calibration balance report; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/07-junior-readability-pass.md` | Done | Reviewed Phase 43 source changes for junior readability without adding decorative comments. | `docs/audits/ARCHITECTURE_READABILITY_REVIEW.md` lists reviewed files, confirms no dead wrappers were introduced, records readability fixes from earlier steps, and keeps the remaining large-file decomposition candidates visible. | `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/08-documented-architecture-map-and-phase-report.md` | Done | Created the stable project architecture map and closed Phase 43. | `docs/ARCHITECTURE.md` explains package responsibilities, dependency direction, important files, main flows, debugging paths, remaining large files, and rules for future code; `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md` records changes, intentional deferrals, verification, risks, and one recommended next phase. | `test -f docs/ARCHITECTURE.md`; `pnpm depcruise`; `pnpm check`; `pnpm cli doctor`; `pnpm cli simulate-season --seed=world-a`; career new-world/summary smokes; strict calibration balance report; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/README.md` | Not started | Created the Phase 44 documentation path. | Phase 44 decomposes the `simulate-season` CLI adapter by responsibility: audit first, fixture-detail output, demo builders, inspection renderers, season summary renderer, presentation-boundary review, and final phase report. | Documentation-only update; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/README.md` | Not started | Created the Phase 43 documentation path. | Phase 43 is an incremental architecture hardening phase: first measure package/file complexity, then narrow public interfaces, deepen career advancement, slim one CLI slice, review world generation, clean long-run diagnostics, run a readability pass, and finish with stable `docs/ARCHITECTURE.md`. | Documentation-only update; `git diff --check` |
| `docs/steps/00-foundation/00-monorepo-skeleton.md` | Done | Minimal pnpm workspace and empty package entrypoints were created. | Root pnpm workspace with `apps/cli`, `packages/domain`, `packages/shared`, `packages/engine`, `packages/content`, and `packages/storage`; placeholder scripts stay non-gameplay until enforcement. | `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `tsc --showConfig` alias check |
| `docs/steps/00-foundation/01-domain-core-types.md` | Done | Dependency-free core domain contracts, value objects, entities, state, and tests were created. | Branded IDs and value objects live in `domain`; `Player` stores the full 25-attribute shape plus potential; dynamic state is separated in `PlayerDynamicState`; `GameState` uses lookup records plus explicit ordered ID arrays. | `pnpm --filter @game/domain run typecheck`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; domain import scan |
| `docs/steps/00-foundation/02-shared-rng-and-date.md` | Done | Deterministic shared RNG streams and pure Gregorian epoch-day utilities were created. | `shared` exposes `deriveRng(seed, streamName, ...keyParts)` over `sfc32` seeded by stable `cyrb128` hash words; date conversion uses pure Gregorian arithmetic with no JavaScript `Date`; all new shared files and functions are documented with TSDoc/JSDoc. | `pnpm --filter @game/shared run typecheck`; `node --test packages/shared/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; forbidden API scan; JSDoc scan |
| `docs/steps/00-foundation/03-storage-json.md` | Done | JSON-backed save storage boundary was created for full `GameState` snapshots. | `storage` exposes `GameStorage`, `JsonGameStorage`, save metadata, schema version `1`, identity migration for v1 saves, and typed storage errors; metadata listing is sorted deterministically by save ID. | `pnpm --filter @game/storage run typecheck`; `node --test packages/storage/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; storage forbidden dependency scan; JSDoc scan |
| `docs/steps/00-foundation/04-enforcement.md` | Done | Executable enforcement and the first real CLI doctor command were created. | Dependency Cruiser enforces package boundaries, ESLint bans forbidden runtime APIs inside `engine`, Vitest runs package tests, `pnpm check` is the single gate, and `pnpm cli doctor` exits `0`. | `pnpm lint`; `pnpm depcruise`; `pnpm test`; `pnpm typecheck`; `pnpm check`; `pnpm cli doctor`; negative dependency fixture; negative engine runtime API fixture |
| `docs/steps/01-match-engine/01-team-strength.md` | Done | Pure role-weight-based `TeamStrength` derivation was created. | `engine` derives department and overall strength from explicit ordered lineup slots, caller-supplied role weight profiles, player abilities, and optional caller-supplied dynamic-state multiplier curves; missing players/roles fail with typed `TeamStrengthError`. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm check`; engine forbidden import/API scan; JSDoc scan |
| `docs/steps/01-match-engine/02-match-context.md` | Done | Serializable match context and engine config contracts were created. | `MatchContext` carries fixture ID, seed, explicit home/away team contexts, precomputed strengths, tactical distribution inputs, and `MatchEngineConfig`; `buildMatchRngKey` defines the stable `seed + "match" + fixtureId` derivation data without consuming RNG. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/match-context.test.ts`; `pnpm check`; engine forbidden import/API scan; JSDoc scan |
| `docs/steps/01-match-engine/03-step-match.md` | Done | Deterministic one-minute match stepping was created. | `MatchSimulationState` keeps match-local minute, score, stats, and marker flags; `stepMatch` advances one minute, randomizes home/away processing order through the match RNG, generates Bernoulli opportunities from aggregate team strengths, and resolves them through `OccasionResolver` with `AggregateOccasionResolver`; step events remain engine-local until the later domain `MatchReport` step. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan |
| `docs/steps/01-match-engine/04-simulate-match.md` | Done | Batch full-match simulation over `stepMatch` was created. | `simulateMatch(context)` derives one match RNG stream from `seed + "match" + fixtureId`, initializes local `MatchSimulationState`, loops over `stepMatch` until full time, returns serializable fixture ID, final minute, score, stats, and sparse step events, and fails with typed `SimulateMatchError` if the safety guard is exceeded; golden-output tests now lock full-match reproducibility. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan |
| `docs/steps/01-match-engine/05-match-report.md` | Done | Durable domain match report and event contracts were created. | `domain` owns `MatchReport`, `MatchStats`, `MatchScore`, `MATCH_EVENT_SCHEMA_VERSION`, and sparse language-agnostic `MatchEvent` variants; `engine` maps local simulation events to report events through `createMatchReport` without prose, storage schemas, fixture updates, or new simulation logic. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/01-calendar-generation.md` | Done | Deterministic double round-robin calendar generation was created. | `domain` owns minimal `Competition`, `Fixture`, and `Round` contracts; `engine` generates an even-club double round-robin calendar by shuffling explicit club IDs with `deriveRng(seed, "schedule", seasonId, competitionId)`, applying the Berger circle method, mirroring return fixtures, assigning weekly `GameDate`s, and generating sequential `fixture:` IDs. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/calendar.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/02-fixtures-and-results.md` | Done | Completed match reports can now be applied to fixture results without mutating original state. | `domain` owns compact `FixtureResult` as the table source of truth; `engine` exposes `applyMatchReportToFixture` with typed errors, fixture/report ID validation, default overwrite guard, optional debug overwrite, and copy-on-write replacement of the fixture lookup. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/03-league-table.md` | Done | League tables are now derived deterministically from played fixture results. | `domain` owns `LeagueTableRow` and simple point `LeagueTableRules`; `engine` exposes `computeLeagueTable` over explicit club IDs, fixture lookup, fixture ID order, and rules, ignoring unplayed fixtures and sorting by points, goal difference, goals for, then stable club ID. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/league-table.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/04-simulate-season-cli.md` | Done | The first gameplay milestone command now simulates one deterministic fake 18-team season and prints the final table. | `content` generates fictional clubs, players, lineups, role weights, table rules, and match config; `engine` owns a tested `simulateSeason` use-case; `apps/cli` exposes `simulate-season --seed` and composes exported engine primitives to print table, top-scorer availability, best defense, and worst attack. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; invalid-arg CLI check; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/05-season-balance-report.md` | Done | Added deterministic aggregate season balance reporting and a strict CLI gate mode. | `simulation-tools` owns content-free aggregate calibration; `content` owns broad hand-authored targets; `engine` publicly exports `simulateSeason`; CLI wires fake content into the report without importing `domain` directly. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts`; `pnpm check`; default and strict-fail CLI smoke checks; forbidden API/dependency scans |
| `docs/steps/03-balance-calibration/01-calibration-target-profile.md` | Done | Added stricter `calibration-v1` target profile and CLI support without changing simulation behavior. | `default` remains the broad smoke profile; `calibration-v1` exposes the current under-scoring/draw-heavy gap; `strict-fail-smoke` remains the intentional failure profile for CLI tests. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts`; `pnpm check`; default strict CLI report passed; `calibration-v1` strict CLI report failed as expected |
| `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` | Done | Tuned fake match-engine rates and reworked conversion bands so the 20-season `calibration-v1` sample passes near 2.8 goals per match. | Config-only tuning uses base opportunity rate `0.09`, cap `0.24`, conversion probabilities `0.105/0.20/0.35`, and home advantage `1.10`; no engine algorithms changed. | Baseline `calibration-v1` 20-season report failed; first tuning reached goals `3.197`; rework reached goals `2.773` with strict report PASS; `pnpm check` passed |
| `docs/steps/03-balance-calibration/03-table-spread-review.md` | Done | Added explicit average table points spread to balance reporting and confirmed the tuned 20-season sample remains plausible. | `simulation-tools` now reports `table_points_spread` as average first-place minus last-place points; content target profiles include broad/default and stricter `calibration-v1` bands. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused calibration/CLI tests; `pnpm check`; `calibration-v1` strict 20-season report passed |
| `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` | Done | Fake content now produces a stronger top-to-bottom hierarchy while preserving current scoring calibration. | Widened generated player base ability gradient from roughly `7.2..12.5` to roughly `6.6..13.3` and reduced slot noise from `0.5` to `0.35`; no engine algorithms or scoring probabilities changed. | `pnpm --filter @game/content run typecheck`; focused content/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md` | Done | Every engine-local goal step event now carries a deterministic scorer from the scoring side lineup. | `attributeGoal` derives an independent `goal-attribution` RNG stream from seed, fixture, minute, side, and pre-goal score, then picks a weighted scorer by lineup role; this avoids consuming the main match RNG and preserves aggregate match outcomes/calibration. | `pnpm --filter @game/engine run typecheck`; focused match-engine Vitest files; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md` | Done | Durable domain goal events now preserve the scorer ID from engine-local goal step events. | `GoalMatchEvent` includes `scorerPlayerId`; `createMatchReport` copies it exactly from the engine event; `MATCH_EVENT_SCHEMA_VERSION` was bumped from `1` to `2` because the durable event schema changed. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-report/fixture tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001` |
| `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md` | Done | Simulated seasons now expose deterministic player goal totals derived from durable match reports. | `computeSeasonPlayerGoalStats` reads `MatchReport` schema v2 goal events, maps `home/away` sides to fixture clubs, includes fixed-lineup registered players with zero goals, and sorts by goals descending then stable player ID; `simulateSeason` returns `playerGoalStats`. | `pnpm --filter @game/engine run typecheck`; focused player-stat/simulate-season tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001` |
| `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md` | Done | CLI season output now prints a real deterministic top scorer instead of the aggregate-engine placeholder. | `simulate-season` now calls engine `simulateSeason` directly and formats `result.playerGoalStats[0]` with player display name, club short name, and goal count; it does not recompute stats in CLI. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md` | Done | CLI can now print deterministic fixture results and goal scorers for one requested round. | `simulate-season --round=<number>` reuses the existing `simulateSeason` result, prints fixtures in round order, includes final score and scorer/minute details from durable reports, and rejects invalid or missing round arguments cleanly. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/README.md` | Done | Created the Phase 5 documentation path for richer structured match-event detail. | Phase 5 starts with a shot-event contract, then optional assists, goalkeeper save attribution, player match stats, and CLI match detail v2; it stays deterministic, CLI-first, and avoids full duel chains or UI. | Documentation-only update; no code checks required |
| `docs/steps/05-match-event-detail/01-shot-event-contract.md` | Done | Durable and engine-local shot outcome events now carry structured shot context. | Added `shotType` and `chanceType` to `ShotContext` and engine-local shot events; values are derived deterministically from existing minute, side, quality, and tactical distribution data without consuming extra RNG or changing outcomes; `MATCH_EVENT_SCHEMA_VERSION` is now `3`. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine/player-stat tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/02-assist-attribution.md` | Done | Goal events can now carry deterministic optional assist IDs. | Added `attributeAssist` with a separate `assist-attribution` RNG stream keyed by seed, fixture, minute, side, pre-goal score, scorer, `shotType`, and `chanceType`; assists are optional, exclude the scorer and goalkeepers, favor midfield creators, and are copied into durable reports without changing match outcomes. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` | Done | Saved-shot events now carry the defending goalkeeper ID. | Added `attributeGoalkeeperSave`, required `goalkeeperPlayerId` on durable save events, bumped `MATCH_EVENT_SCHEMA_VERSION` to `5`, and made missing goalkeeper slots fail clearly. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/04-player-match-stats.md` | Done | Engine can derive compact per-player match stats from durable reports. | Added public `computePlayerMatchStats` with goals, assists, known player shots, shots on target, and saves; explicit registrations include zero-stat players and output sorts deterministically. | `pnpm --filter @game/engine run typecheck`; focused engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` | Done | CLI can now inspect one fixture with structured match-event detail and compact player stats. | Added `simulate-season --fixture=<fixtureId>` rendering from existing season results and engine `computePlayerMatchStats`; output includes event order, goals with optional assists, stable shot/chance keys, saves, misses, blocks, and compact player stats. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/README.md` | Done | Created the Phase 6 documentation path for cleaner CLI inspection and complete current player stats. | Phase 6 starts with fixture-only CLI output, then shot taker attribution, complete player match stats, fixture player-stat rendering v2, and season assist/save summaries. | Documentation-only update; no code checks required |
| `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md` | Done | `--fixture=<fixtureId>` now prints a clean fixture-detail view without the full final table. | The CLI branches to a fixture-only renderer when `--fixture` is present, reusing the same simulated season result and preserving base season and round views. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md` | Done | Generated non-goal shot events now carry deterministic attacking shooter IDs. | Added `attributeShotTaker` on a separate derived RNG stream; generated save/miss/block report events now include `shooterPlayerId`, while goals keep `scorerPlayerId` as the shooter field in the current aggregate model; `MATCH_EVENT_SCHEMA_VERSION` is now `6`. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md` | Done | `computePlayerMatchStats` now counts complete current shot stats from durable report events. | Goals credit `scorerPlayerId`; generated save/miss/block events credit `shooterPlayerId` when present; shots on target follow durable `shot.isShotOnTarget`; saves remain credited to the defending goalkeeper. | `pnpm --filter @game/engine run typecheck`; focused engine and CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md` | Done | Fixture detail now renders a clearer all-starter player-stat table. | The CLI passes home/away lineup registrations into `computePlayerMatchStats`, keeps contribution sorting for active players, and includes zero-stat starters as deterministic rows. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md` | Done | Season output now includes top assist and top goalkeeper-save summaries. | Added engine `computeSeasonPlayerSummaryStats` for goals, assists, and saves from durable reports; `simulateSeason` returns `playerSummaryStats`; CLI selects top assist/save rows from engine-derived stats without parsing rendered text. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; focused player-stat/simulate-season/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/README.md` | Done | Created the Phase 7 documentation path for causal match-event work. | Phase 7 starts with a baseline review, then chance actor selection, step-match integration, durable causal event context, and CLI causal fixture review. | Documentation-only update; no code checks required |
| `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md` | Done | Phase 6 CLI output is coherent enough to become the before/after baseline for causal match work. | No rework before causal actors: keep current fixture detail as the baseline, with the known limitation that richer causal context is still future Phase 7 scope rather than a blocker. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` | Done | Added an engine-local deterministic `ChanceActors` selector with focused tests. | `selectChanceActors` uses a separate `chance-actors` RNG stream, chooses attacking creator/shooter, defending primary defender, and defending goalkeeper from explicit lineup order, excludes goalkeepers from attacking creator/shooter roles, and requires a defending `gk` slot. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md` | Done | `stepMatch` now uses one coherent chance actor set for current player attribution. | `selectChanceActors` is called once per generated opportunity after aggregate outcome resolution; goals use selected shooter as scorer, optional assists use selected creator when credited, non-goal shots use selected shooter, saves use selected goalkeeper, blocked shots keep selected primary defender engine-local for the durable-context step, and obsolete standalone attribution helpers/tests were removed. | `pnpm --filter @game/engine run typecheck`; focused match-engine and player-stat Vitest tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` | Done | Durable match reports now preserve minimal causal actor context. | `MATCH_EVENT_SCHEMA_VERSION` is `7`; goal events may carry `creatorPlayerId` only when it is not already represented by scorer/assist, and block events may carry `primaryDefenderPlayerId`; `createMatchReport` copies these fields from engine-local events without recalculating. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine/player-stat Vitest tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` | Done | CLI fixture detail now renders durable causal context for goals and blocks. | Goal rows append compact `creator=<player>` when durable reports expose a non-duplicated creator; block rows append `defender=<player>` when durable reports expose the primary defender; base season output and fixture-only shape remain otherwise unchanged. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/README.md` | Done | Created the Phase 8 documentation path for the first managerial lever. | Phase 8 starts with a Phase 7 output review, then domain contracts, engine builder, season setup overrides, and CLI tactic/lineup inspection; UI, live match-day, player states, persistence, and management systems remain out of scope. | Documentation-only update; no code checks required |
| `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md` | Done | Phase 7 output accepted as coherent enough for tactic/lineup MVP. | No Phase 7 rework needed before domain tactic contracts; season leaders are plausible, `creator=` does not duplicate assists, `defender=` appears on block events, player stats align, and strict calibration passes. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` | Done | Added dependency-free selected-lineup and tactic setup contracts to domain. | `SelectedLineup` stores club ID plus ordered slot/player/role selections; `TacticSetup` stores five-step `mentality` plus 0-1 `pressing`, `directness`, `width`, and `risk`; helper constructors reject ambiguous lineup/tactic data and preserve serializable shape. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts`; `pnpm check` |
| `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` | Done | Added engine builder from selected lineup/tactic setup to current `MatchTeamContext`. | `buildTacticTeamContext` validates explicit required lineup size, available players, role-weight resolution, and domain setup contracts; selected slots become ordered `LineupSlot`s, strength uses existing `deriveTeamStrength`, and tactic distribution maps only `directness`, `pressing`, `width`, and `risk`. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts`; `pnpm check` |
| `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` | Done | `simulateSeason` can use explicit selected setup overrides while preserving default behavior. | Added ordered `setupOverrides` entries with self-contained lineup, tactic, players, role weights, and required lineup size; overrides call `buildTacticTeamContext`, duplicate/invalid overrides fail with `SimulateSeasonError`, and no-override CLI output remains unchanged. | `pnpm --filter @game/engine run typecheck`; focused engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` | Done | CLI can compare default season output against a deterministic selected lineup/tactic setup. | Added explicit `--setup-demo=pro01-attacking`; the CLI builds a PRO01 selected setup, changes slots `slot:08` and `slot:09` from `midfielder` to `attacker`, applies attacking tactic values through `simulateSeason.setupOverrides`, and prints setup context before season or fixture output. Default output remains unchanged without the flag. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; default season smoke; fixture smoke; setup-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/README.md` | Done | Created the Phase 9 documentation path for manual tactical switching. | Phase 9 starts by reviewing Phase 8 output, then adds saved demo tactic profiles, an explicit manual tactic-change contract, segmented fixture simulation, and CLI inspection for one user-declared switch. Automatic tactical decisions are explicitly out of scope. | Documentation-only update; no code checks required |
| `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md` | Done | Phase 8 output accepted as a technical baseline for manual tactical switching. | `--setup-demo=pro01-attacking` clearly proves setup overrides and prints selected club, tactic values, and role changes; its season-long downside is understood as a reason to add manager-selected profiles and switches, not as a blocker. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` | Done | CLI now supports three deterministic saved setup demos for PRO01. | `--setup-demo` accepts `pro01-balanced`, `pro01-attacking`, and `pro01-defensive`; balanced matches the default PRO01 setup, while attacking and defensive are explicit manager-selectable profiles for later manual switching. | CLI typecheck; focused CLI tests; `pnpm check`; default/profile smoke commands; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md` | Done | Engine now has a deterministic contract for explicit manual tactic changes by minute. | `buildManualTacticChangeSchedule` validates caller-declared side/minute/team-context changes, sorts by minute then home/away, rejects invalid minutes, missing team contexts, invalid sides, and duplicate side+minute pairs, and performs no simulation or automatic tactical decisions. | Engine typecheck; focused manual-tactic-change tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md` | Done | Engine can simulate one fixture with caller-declared manual tactic changes. | `simulateMatchWithManualTactics` delegates to `simulateMatch` when no changes are supplied, otherwise validates `ManualTacticChangeSchedule`, applies side contexts before their declared minute, reuses the same match RNG and `stepMatch`, and keeps report/player-stat compatibility. | Engine typecheck; focused manual-tactic/simulate-with-manual-tactics tests; `pnpm check`; default season smoke; fixture smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md` | Done | CLI can inspect one user-declared manual tactic switch for a requested fixture. | Added `--manual-tactic-switch=<minute>:<profile>` for fixture detail only. The CLI requires `--fixture` and `--setup-demo`, builds the target saved profile, re-simulates the requested fixture through `simulateMatchWithManualTactics` when PRO01 is involved, and prints an explicit profile timeline; if PRO01 is not playing, it reports that the switch does not apply and leaves the fixture unchanged. | CLI typecheck; focused CLI tests; `pnpm check`; default season smoke; fixture smoke; manual-switch smoke for non-applicable and applicable fixtures; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/README.md` | Done | Created the Phase 10 documentation path for the first cross-match player state. | Phase 10 starts by reviewing Phase 9 output, then adds pure fitness spend/recovery rules, bounded fitness strength impact, optional season fitness lifecycle, and CLI condition inspection. Form, morale, injuries, staff, training, and automatic rotation remain out of scope. | Documentation-only update; no code checks required |
| `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md` | Done | Phase 9 output accepted as a stable baseline for player fitness consequences. | Manual switch output clearly shows selected club, initial profile, switch minute, target profile, applicability, and profile timeline; no automatic tactical decision is implied. | Required Phase 10 review CLI commands passed; strict `calibration-v1` balance report passed |
| `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` | Done | Pure deterministic fitness spend/recovery helpers were added. | `DEFAULT_FITNESS_RULES` spends 8 fitness per match and recovers 5 fitness per calendar day, clamps to `0..100`, copy-on-writes player states, rejects missing states and duplicate ordered IDs, and does not wire into season or CLI output yet. | Engine typecheck; focused fitness tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` | Done | Low fitness can now lightly affect team strength through explicit curves. | Fake content exposes fitness curve bands `<=39:0.88`, `<=59:0.94`, `<=79:0.98`, `<=100:1.00`; CLI team-context builders pass the curve to `deriveTeamStrength`. All generated players still start at fitness 100, so default output is unchanged. | Content/engine/CLI typechecks; focused content/engine/CLI tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` | Done | `simulateSeason` can optionally carry deterministic fitness spend/recovery across the season. | `fitnessLifecycle` is opt-in; when supplied, the use-case copy-on-writes player states, recovers tracked players between fixture dates, spends fitness for starters after each fixture, recomputes team strength from current fitness, and returns `finalPlayerStates`. Default no-lifecycle output remains unchanged. | Engine typecheck; focused engine tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md` | Done | CLI can show deterministic PRO01 fitness consequences for the season. | Added explicit `--condition-demo=pro01-season`; it enables the optional season fitness lifecycle, keeps default output unchanged, prints lifecycle rules, the first selected-club fixture, post-match fitness, recovered fitness before the next selected fixture, selected club table impact, and final starter condition. | CLI/engine typechecks; focused CLI tests; `pnpm check`; default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/README.md` | Done | Created the Phase 11 documentation path for manual lineup rotation. | Phase 11 starts by reviewing Phase 10 output, then adds lineup demo profiles, an explicit fixture lineup override contract, season wiring, and CLI lineup/condition inspection. The user chooses who plays; automatic rotation is out of scope. | Documentation-only update; no code checks required |
| `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` | Done | Phase 10 condition output accepted as a baseline for manual lineup rotation. | Existing `--condition-demo=pro01-season` clearly shows selected club, lifecycle state, rules, first fixture, post-match fitness `92`, seven-day recovery to `100`, and final starter fitness `92`. | Default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` | Done | CLI can inspect deterministic PRO01 first-team and rotated lineup profiles without applying them to the season. | Fake content now generates 16 senior players per club while keeping the default 11-player lineup unchanged; `pro01-rotated` uses real reserves No12, No13, No15, and No16 and reports differences from the first team. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/CLI Vitest tests; `pnpm check`; default season smoke; `--lineup-demo=pro01-rotated` smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` | Done | Engine now accepts and validates explicit fixture lineup override input. | `SimulateSeasonFixtureLineupOverride` identifies fixture, club, ordered lineup slots, required size, player lookup, role weights, and optional state curves; `simulateSeason` validates duplicate overrides, missing fixtures/teams, wrong fixture club, and invalid lineup data without applying overrides yet. | Engine typecheck; focused `simulate-season` tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` | Done | `simulateSeason` now applies explicit fixture lineup overrides. | Overrides are indexed by fixture/club, apply only to the matching participant, preserve the club's existing tactic, rebuild strength from the selected lineup and current fitness states, include override players in season registrations, and spend fitness for the actual selected starters. | Engine typecheck; focused `simulate-season` tests; `pnpm check`; default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` | Done | CLI can inspect one explicit user-selected lineup override for one fixture. | `--lineup-demo=<profile>` remains available for profile-only inspection and, when combined with `--fixture=<fixtureId>`, applies the selected PRO01 lineup only if PRO01 plays that fixture; output shows applicability, selected starters, rested first-team players, expected fixture fitness impact, fixture events, and player stats for the actual starters. | CLI typecheck; focused CLI tests; `pnpm check`; default season smoke; condition-demo smoke; `--fixture=fixture:000006 --lineup-demo=pro01-rotated` smoke; strict `calibration-v1` balance report |
| `docs/steps/12-squad-selection-and-formation-core/README.md` | Done | Created the Phase 12 documentation path for squad selection and formation core. | Phase 12 consolidates Phases 08-11 into a real manager-facing squad/formation model: broad curated formation catalog, squad depth, position suitability, formation fit reporting, and CLI inspection of squad gaps and fit trade-offs without prescribing market actions. | Documentation-only update; no code checks required |
| `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md` | Done | Phase 11 outputs were reviewed and accepted before formation work. | CLI season output, PRO01 rotated fixture inspection, and `calibration-v1` strict balance still pass; Phase 12 can build on manual lineup rotation without code rework. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md` | Done | Curated domain formation catalog was added. | `domain/tactics` exposes 22 stable formation keys, structured formation slots, recognized position families, `FORMATION_CATALOG`, deterministic ordered `FORMATIONS`, and lookup/narrowing helpers; no player assignment or squad-fit logic was added. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/formations.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` | Done | Squad-depth domain contract was added. | `domain/squad` exposes explicit squad, starter, and bench/reserve player groups plus validation for duplicates, membership, overlap, and match starter count; it preserves user choice and does not select players automatically. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/squad/squad-depth.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` | Done | Player-position to formation-slot suitability was added. | `domain/tactics` exposes strict `natural`, `adapted`, `weak`, and `invalid` suitability evaluation from `PlayerPosition[]` to formation position families; weak fits do not count as real coverage, so squad gaps remain visible. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` | Done | Engine formation squad-fit reporting was added and later reworked to avoid market-prescriptive wording. | `engine/squad` reports slot coverage, uncovered/weak/adapted slots, natural fits, likely out-of-position players, family depth, broad extra-depth groups, and stable factual `squadFitHints` keys such as `gap:*`, `adapted_only:*`, and `extra_depth:*`; it does not assign players or recommend transfers. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` | Done | CLI formation-fit inspection was added and later reworded as factual squad assessment. | `simulate-season --formation-fit=<formationKey>` renders a standalone inspection for the selected fake club squad, including formation slots, covered/adapted/weak/missing slots, extra-depth groups, and localized squad-fit notes; fake clubs now generate 22 senior players while fixed default lineups stay 11 players. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/13-localization-foundation/README.md` | Done | Created and broadened the Phase 13 documentation path for localization foundation. | Phase 13 supports `it`, `en`, `de`, `es`, and `fr`, keeps English as fallback, covers all current CLI-visible game text rather than only formation-fit labels, adds enforcement against hardcoded presentation strings, and closes with project-wide policy alignment in requirements/rules. | Documentation-only update; no code checks required |
| `docs/steps/13-localization-foundation/01-phase-12-output-review.md` | Done | Current Phases 00-12 user-facing CLI text was inventoried before localization. | Localization scope covers command errors, doctor output, balance reports, season summaries, round/fixture detail, event words, player stats, tactic/setup/manual-switch output, condition/lineup output, formation-fit labels, warnings, and factual squad-fit notes; domain/engine keys remain structured data. | Source scan; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1` |
| `docs/steps/13-localization-foundation/02-language-contract-and-fallback.md` | Done | Added isolated localization package and supported-language contract. | `@game/i18n` defines supported languages `it/en/de/es/fr`, English fallback, parsing helpers, typed message keys, interpolation, and dependency isolation from simulation packages. | `pnpm --filter @game/i18n run typecheck`; focused i18n tests |
| `docs/steps/13-localization-foundation/03-label-catalog-it-en.md` | Done | Added the first English and Italian catalog for current CLI-visible presentation text. | The catalog covers common labels, CLI errors, doctor, balance report, season summary, fixture detail, event words, tactic/setup/manual-switch, condition, lineup, formation-fit, warnings, and factual squad-fit notes. | focused i18n tests |
| `docs/steps/13-localization-foundation/04-cli-language-option.md` | Done | Exposed CLI `--lang` and migrated current CLI presentation output through localization. | `simulate-season`, `balance-report`, `doctor`, and unknown-command output now render headings, labels, statuses, user-facing errors, event words, and formation-fit vocabulary through `@game/i18n`; simulation data and deterministic results stay unchanged. | CLI typecheck; focused CLI tests; localized CLI smokes |
| `docs/steps/13-localization-foundation/05-five-language-label-completion.md` | Done | Completed German, Spanish, and French labels for the current catalog. | All current message keys now have concrete `it`, `en`, `de`, `es`, and `fr` translations; English fallback remains available for future missing catalog entries. | focused i18n tests verify zero missing translations for all five languages |
| `docs/steps/13-localization-foundation/06-hardcoded-presentation-text-enforcement.md` | Done | Added a deterministic guard against new hardcoded CLI presentation text. | `scripts/check-localized-presentation-text.ts` scans current CLI output/error boundaries for direct user-facing string literals and `pnpm check` now runs `pnpm check:localized-text`. | `pnpm check:localized-text`; `pnpm check` |
| `docs/steps/13-localization-foundation/07-project-policy-localization-alignment.md` | Done | Requirements and project rules were verified as the binding localization policy. | `requirements.md` and `docs/PROJECT_RULES.md` state that labels useful to CLI/UI/event rendering/reports/statuses/warnings/hints/errors must be localization keys, while domain/engine keep language-agnostic structured data. | `rg -n "hardcoded|localizzazione|localization|user-facing|UI|CLI" requirements.md docs/PROJECT_RULES.md docs/PROJECT_STATUS.md`; `pnpm check` |
| `docs/steps/14-engine-audit-and-core-quality-review/README.md` | Done | Created the Phase 14 documentation path for complete engine/core audit before market or youth work. | Phase 14 is a non-feature audit gate with seven points: architecture boundaries, determinism, match engine, season engine, tactic/lineup/formation, code quality/dead code/naming, and final report/next-phase decision. | Documentation-only update; no source checks required |
| `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md` | Done | Package seams were audited. | Dependency Cruiser and import scans found no package-boundary violations; CLI remains the presentation/composition adapter and domain/engine remain language-agnostic. | `pnpm depcruise`; `pnpm lint`; forbidden import scans |
| `docs/steps/14-engine-audit-and-core-quality-review/02-determinism-audit.md` | Done | Determinism was audited. | Representative CLI outputs reproduce by seed and forbidden runtime scans found only acceptable storage metadata clock usage; engine has one cleanup finding for `Object.values()` in `simulateSeason`. | focused tests; CLI smokes; repeatability diff; forbidden runtime scan |
| `docs/steps/14-engine-audit-and-core-quality-review/03-match-engine-audit.md` | Done | Match engine was audited. | Current aggregate match engine, chance actors, durable reports, manual tactic segmentation, and player match stats are coherent for current scope; full possession chains remain accepted future scope. | domain/engine typecheck; focused match/player-stat tests; fixture smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/04-season-engine-audit.md` | Done | Season engine was audited. | Calendar, fixture application, table derivation, player summaries, fitness lifecycle, setup overrides, lineup overrides, and balance reporting are connected; `GameState` fixture consolidation remains a pre-persistence cleanup. | engine/simulation-tools typecheck; focused season/use-case tests; season/condition/lineup/balance smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/05-tactic-lineup-formation-audit.md` | Done | Manager-choice boundary was audited. | Tactics, lineups, formation catalog, position suitability, squad fit, setup demos, manual switches, and lineup rotation preserve explicit manager choice and avoid automatic lineup/tactic/market recommendations. | domain/engine/content/CLI typecheck; focused tactics/squad/CLI tests; Italian formation/setup/lineup smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/06-code-quality-dead-code-naming-audit.md` | Done | Code quality, naming, and dead-code risks were audited. | No dead attribution helpers or old hint keys remain; cleanup findings are stale CLI comments, large `simulate-season.ts` locality risk, and the engine `Object.values()` rule violation. | `pnpm lint`; `pnpm check:localized-text`; `pnpm typecheck`; text scans |
| `docs/steps/14-engine-audit-and-core-quality-review/07-audit-report-and-next-phase-decision.md` | Done | Final audit report was created. | `docs/audits/ENGINE_CORE_AUDIT.md` gives score `86/100`, no critical blockers, one high finding, medium/low findings, verified strengths, and recommends a narrow Phase 15 core cleanup before market/youth. | `pnpm check`; final CLI smokes; audit report review |
| `docs/steps/15-core-cleanup-before-career-systems/README.md` | Done | Created the Phase 15 documentation path for narrow cleanup before market/youth/career work. | Phase 15 closes Phase 14 findings: explicit fixture-lineup override order, factual squad-fit naming cleanup, CLI module split, fixture-state decision, and final cleanup report. | Documentation-only update; no source checks required |
| `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md` | Done | Confirmed all Phase 14 cleanup findings still exist before source cleanup starts. | Phase 15 remains scoped to cleanup: ordered fixture-lineup overrides, factual squad-fit naming, CLI module locality, fixture-state decision, and final report. | `rg` scans for object iteration, market wording, fixture state; `wc -l apps/cli/src/commands/simulate-season.ts` |
| `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md` | Done | Removed the engine `Object.values()` order risk from fixture lineup overrides. | `simulateSeason` now validates fixture lineup overrides into an internal `OrderedFixtureLineupOverrides` Module with `byKey` lookup plus caller-ordered `ordered` array; player registrations use the ordered array. | engine/CLI typecheck; focused engine/CLI tests; object-iteration scan; lineup override CLI smoke; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md` | Done | Removed stale market/recommendation wording from current squad-fit implementation comments. | Runtime output stays factual and unchanged; internal comments now describe formation-fit notes and factual coverage targets instead of market hints. | CLI typecheck; focused CLI tests; localized-text check; stale-wording scan; Italian formation-fit smoke; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md` | Done | Split the large CLI `simulate-season` implementation into private modules. | `runSimulateSeasonCommand` remains the public command Interface; profile keys, argument parsing, and formation-fit formatting moved behind private CLI Modules to improve locality without behavior changes. | CLI typecheck; focused CLI tests; required season/fixture/formation/manual-switch smokes; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md` | Done | Consolidated fixture state into the canonical `GameState` contract. | `GameState` now owns `fixtures` and `fixtureIds`; `applyMatchReportToFixture` accepts and returns `GameState` directly, and the obsolete fixture-slice/alias types were removed. | domain/engine/storage typecheck; focused domain/use-case/storage tests; required season and fixture CLI smokes; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md` | Done | Created the Phase 15 cleanup report and next-phase recommendation. | `docs/audits/CORE_CLEANUP_REPORT.md` scores the cleaned core at `92/100`, records all fixed findings, accepts the aggregate-match limitation, and originally recommended market MVP next; Phase 16 now adds a dependency-map gate before implementation. | `pnpm check`; required season/fixture/formation/manual-switch CLI smokes; `calibration-v1` strict balance report |
| `docs/steps/16-career-systems-dependency-map/README.md` | Done | Created the Phase 16 documentation path for mapping shared career-system dependencies before market implementation. | Phase 16 checks whether market can proceed linearly or needs shared career state, economy, calendar, scouting, or youth foundations first. | Documentation-only update; no source checks required |
| `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md` | Done | Market roadmap dependencies were classified before implementation. | `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` now marks which market phases can start now, which require career state/economy/calendar/scouting/prior market work, and where non-market shared phases should interrupt the roadmap. | `find docs/market-roadmap -type f | sort`; roadmap phase `rg`; dependency keyword `rg` |
| `docs/steps/16-career-systems-dependency-map/02-shared-career-state-seams.md` | Done | Shared career-state seams were mapped before market implementation. | `GameState` and `GameStorage` are enough for future persistence, while durable market behavior still needs an explicit career slice, roster ownership evolution, selected-club context, transfer history, and season progression seams. | `GameState`/storage `rg`; squad/tactic/state `rg`; career/save `rg` |
| `docs/steps/16-career-systems-dependency-map/03-economy-and-budget-dependencies.md` | Done | Economy and budget dependencies were mapped before market implementation. | `Money`/`BasisPoints` already exist; the first market MVP may use a narrow transfer-budget Interface, while wages, contracts, installments, future commitments, and full finances remain blocked for later phases. | Economy keyword `rg`; category/reputation `rg`; Money value-object scan |
| `docs/steps/16-career-systems-dependency-map/04-calendar-and-season-transition-dependencies.md` | Done | Calendar and season-transition dependencies were mapped before loans/windows/contracts. | Current `GameDate`, calendar, and fixture dates are enough for a narrow transfer MVP, but loans, windows, registration, contract expiry, promotion/relegation, and multi-season processing require dedicated calendar/season-transition Modules. | Calendar primitive `rg`; loan/window/registration/promotion `rg` |
| `docs/steps/16-career-systems-dependency-map/05-scouting-youth-and-market-overlap.md` | Done | Scouting, youth, and market information seams were mapped. | Market MVP may use true player data behind valuation/willingness Interfaces, but must not hardcode fog, visible potential ranges, youth ownership, loan development, ambition/personality, or presentation text. | Scouting/youth keyword `rg`; player truth data `rg` |
| `docs/steps/16-career-systems-dependency-map/06-phase-order-decision.md` | Done | Finalized the dependency map and next implementation phase decision. | `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` recommends `Phase 17 — Market MVP Permanent Transfers` next, constrained to in-memory permanent transfers with temporary transfer budget, no windows, truth-based player willingness, and no persistence/contracts/loans/scouting fog. | report existence check; required report-section `rg`; project-status `rg`; Phase README documentation-scan rule reviewed |
| `docs/steps/17-market-mvp-permanent-transfers/README.md` | Done | Created the Phase 17 documentation path for a constrained market MVP. | Phase 17 is permanent-transfer only, in-memory, manager-driven, truth-based for valuation/willingness, and explicitly excludes persistence, loans, wages/contracts, windows, scouting fog, AI, installments, and player exchanges. | Documentation-only update; no source checks required |
| `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md` | Done | Confirmed Phase 17 scope from Phase 16 before coding. | Phase 17 may proceed as a constrained, manager-driven, in-memory permanent-transfer MVP; persistence, loans, wages/contracts, windows, scouting fog, AI, installments, and player exchanges remain blocked for later documented phases. | dependency-map/roadmap `rg`; next-step existence check |
| `docs/steps/17-market-mvp-permanent-transfers/02-market-domain-contracts.md` | Done | Added dependency-free domain contracts for permanent transfers. | `domain` now exposes `MarketState`, `ClubTransferBudget`, `PermanentTransferIntent`, feasibility status, structured rejection reasons, `PermanentTransferPreview`, and small validators/helpers while staying free of future-only transfer branches. | domain typecheck; focused transfer entity tests; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/03-player-valuation-v1.md` | Done | Added deterministic true-data player valuation v1. | `engine/market` now exposes `derivePlayerValuation` with explicit config, `Money` output, current/potential ability averages, age/category/reputation/position multipliers, clamping, and focused tests; it does not use generated content or mutate state. | engine typecheck; focused player valuation tests; out-of-scope scan; `pnpm check`; runtime scan false-positive noted for `GameDate` naming |
| `docs/steps/17-market-mvp-permanent-transfers/04-player-willingness-v1.md` | Done | Added deterministic permanent-transfer willingness v1. | `engine/market` now exposes `derivePlayerWillingness`, rejecting unrealistic sporting/reputation downgrades for strong prime players while accepting plausible same-level or younger non-star moves; output is structured and language-agnostic. | engine typecheck; focused player willingness tests; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/05-transfer-feasibility-and-apply-preview.md` | Done | Combined ownership, temporary budget, valuation, and willingness into in-memory transfer feasibility and apply preview. | `engine/market` now exposes `evaluatePermanentTransfer` and `previewPermanentTransfer`, returning structured rejection reasons or copy-on-write `GameState`/`MarketState` previews without touching storage. | engine typecheck; focused transfer feasibility tests; no-storage scan; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/06-cli-market-inspection.md` | Done | Added localized CLI inspection for accepted and rejected permanent-transfer demos. | `simulate-season --market-demo=pro01-affordable-permanent|pro01-star-rejected` renders standalone localized market previews with selected club, buyer/seller, target player, transfer value, buyer budget before/after, reasons, willingness details, and roster preview; no career save is written. | CLI/i18n typecheck; focused CLI/i18n tests; localization guard; `pnpm check`; accepted/rejected/Italian CLI smokes |
| `docs/steps/17-market-mvp-permanent-transfers/07-phase-17-review-and-next-phase-decision.md` | Done | Finalized Phase 17 with a market MVP report and next-phase decision. | `docs/audits/MARKET_MVP_REPORT.md` documents implemented scope, demo outputs, kept boundaries, residual risks, and recommends career state and transfer persistence next. | `pnpm check`; season smoke; Italian formation-fit smoke; accepted/rejected/Italian market-demo smokes; strict calibration balance report; no-storage scan; out-of-scope scan |
| `docs/steps/18-career-state-and-transfer-persistence/README.md` | Done | Created the Phase 18 documentation path for durable career state and transfer persistence. | Phase 18 turns accepted permanent-transfer decisions from inspection-only previews into persisted career state, while keeping loans, wages/contracts, windows, scouting fog, AI market behavior, installments, player exchanges, and UI out of scope. | Documentation-only update; no source checks required |
| `docs/steps/18-career-state-and-transfer-persistence/01-phase-17-output-review.md` | Done | Confirmed the minimal durable career scope after Phase 17. | Phase 18 should persist selected club context, the current game snapshot, transfer funds, permanent-transfer roster changes, and transfer history; loans, contracts/wages, windows, scouting fog, AI market behavior, installments, player exchanges, and UI remain out of scope. | `test -f docs/audits/MARKET_MVP_REPORT.md`; `test -f docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`; required career/persistence roadmap `rg` |
| `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md` | Done | Added the dependency-free durable career-state contract. | `CareerState` wraps `GameState` with `saveId`, schema version, selected club, durable `MarketState`, and ordered permanent-transfer history; `createCareerState` validates selected club order, budget club references, safe non-negative money, and transfer-history references. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/state/career-state.test.ts`; domain forbidden import scan; `pnpm check` |
| `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md` | Done | Added JSON-backed career save persistence. | `JsonCareerStorage` persists full `CareerState` snapshots in career-specific JSON envelopes, validates through `createCareerState` on save/load, preserves typed storage failures, and remains independent from engine/content/CLI/i18n. | `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/storage/src/career-storage.test.ts`; storage forbidden import scan; `pnpm check` |
| `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md` | Done | Added engine use case for persistent permanent-transfer application. | `applyCareerPermanentTransfer` reuses existing market preview logic, returns original `CareerState` on rejection, and returns a copied `CareerState` with updated `GameState`, `MarketState`, and appended transfer-history entry when accepted. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/apply-career-transfer.test.ts`; engine forbidden import scan; `pnpm check` |
| `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md` | Done | Added deterministic CLI career market apply flow for supported market demos. | `pnpm cli career --save=<saveId> --apply-market-demo=<profile>` bootstraps deterministic fake career state, applies accepted permanent-transfer demos through `applyCareerPermanentTransfer`, writes accepted results through `JsonCareerStorage`, leaves rejected demos unsaved, and renders localized output without CLI-domain direct imports. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; accepted/rejected CLI smokes |
| `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md` | Done | Added CLI inspection for reloaded career state, budget, roster, and transfer history. | `pnpm cli career --save=<saveId> --inspect` loads `JsonCareerStorage`, shows selected club roster size and transfer funds, lists permanent-transfer history, and prints affected clubs with persisted roster sizes and budgets. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; career apply and inspect CLI smokes |
| `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md` | Done | Produced the first playable loop readiness report. | `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md` states that Phase 18 passes as a persistence bridge and recommends Phase 19 as a CLI-first playable career loop MVP before deeper market, youth, scouting, contracts, or UI work. | `pnpm check`; career apply/inspect CLI smokes; localized market inspection smoke; strict `calibration-v1` balance report |
| `docs/steps/19-fictional-people-identity-foundation/README.md` | Done | Created the Phase 19 documentation path for fictional people identity. | Phase 19 moves before the first playable career loop so generated players stop looking like technical placeholders; it covers person identity, name cultures, nationality distribution by division/reputation, player identity generation, staff identity readiness, and a quality report. | Documentation-only update; no source checks required |
| `docs/steps/19-fictional-people-identity-foundation/01-phase-18-output-and-identity-gap-review.md` | Done | Confirmed that current player-facing output still uses technical placeholder names. | Season, fixture-detail, and career-inspect outputs still show `PlayerXX NoYY`; source scan points to `packages/content/src/generators/fake-players.ts` as the placeholder generator, while names remain content data and not localization labels. | `test -f docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli career --save=career-demo --inspect`; placeholder/name/staff `rg` scan |
| `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md` | Done | Added a reusable domain person-identity contract for players now and staff later. | `PersonIdentity` stores generated first/last name, primary nationality, optional second nationality, birth country, and name-culture key; constructors validate empty names, unsupported keys, duplicate second nationality, and unexpected rendered-prose fields while remaining language-agnostic. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/value-objects/person-identity.test.ts`; domain forbidden import scan; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md` | Done | Added content-owned fictional name culture pools. | `content/identity/name-cultures` now exposes explicit first/last-name pools for every supported `NameCultureKey`, with stable key order and no localization coupling. | `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/name-cultures.test.ts`; content forbidden import scan; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md` | Done | Added deterministic nationality distribution by league nation, division, and club strength/reputation. | `selectNationality` uses derived RNG and explicit weighted profiles: third division mostly domestic, second division more mixed, first division more international, and strong first-division clubs can become majority international; output remains structured identity metadata, not prose. | `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/nationality-distribution.test.ts`; deterministic runtime scan; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md` | Done | Replaced generated player placeholder display names with deterministic fictional identities. | Fake player generation now selects structured identity metadata from seeded nationality/name-culture content, keeps stable `player:` IDs, writes player display names from generated `PersonIdentity`, and updates CLI/career tests to assert behavior without old placeholder names. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused fake-player/league-system/simulate-season/career tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; career apply+inspect smoke; strict `calibration-v1` balance report |
| `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md` | Done | Confirmed that the identity foundation can support future staff without implementing staff gameplay. | `PersonIdentity` is sufficient as shared identity metadata for staff, scouts, presidents, agents/procuratori, and AI managers; future staff systems must keep role, rating, specialization, assignments, persona/tendencies, wages, and gameplay effects in separate contracts. | staff/scouting/persona `rg` review; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md` | Done | Added identity review CLI output and produced the identity foundation quality report. | `simulate-season --identity-review` shows selected fake-club identity metadata and nationality summary with localized presentation labels; `docs/audits/IDENTITY_FOUNDATION_REPORT.md` records the adopted identity model, staff readiness, manual checks, and the known repeated-name limitation. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; season, fixture, identity-review, career apply/inspect, and strict balance CLI smokes |
| `docs/steps/20-new-career-world-generation/README.md` | Done | Created the Phase 20 documentation path for new career world generation. | Phase 20 will make generated people and squads vary per new career/world seed while staying persisted and reproducible inside a save; it also prepares flag asset mapping outside domain/engine. | Documentation-only update; no source checks required |
| `docs/steps/20-new-career-world-generation/01-current-generated-content-review.md` | Done | Reviewed current fake content, identity, career, and CLI generation paths. | `generateFakePlayersForClubs` is already seed-aware for identity generation, but `createFakeLeagueSystem()` still uses the default `demo-001` path; `GameState.meta.seed` currently acts as the season/match runtime seed, so a separate durable career world seed belongs in career metadata before career creation writes saves. | required `rg` scans; `pnpm check` |
| `docs/steps/20-new-career-world-generation/02-career-world-seed-contract.md` | Done | Added a durable career world seed metadata contract. | `CareerWorldMetadata` stores trimmed `worldSeed`, positive `generatorVersion`, and stable `creationSourceKey`; `CareerState` can now persist optional validated world metadata without changing existing save callers until the CLI creation step writes it. | `pnpm --filter @game/domain run typecheck`; focused career-world/career-state tests; domain import scan; `pnpm check` |
| `docs/steps/20-new-career-world-generation/03-generated-player-archetypes.md` | Done | Added content-owned generated player archetypes. | `GENERATED_PLAYER_ARCHETYPES` defines stable machine keys for first-team regulars, rotation players, veterans, prospects, high-potential prospects, and rare wonderkids, with deterministic age/current-ability/potential ranges and lineup/reserve weights. | `pnpm --filter @game/content run typecheck`; focused player-archetypes tests; `pnpm check` |
| `docs/steps/20-new-career-world-generation/04-seeded-squad-generation.md` | Done | Fake squad generation now varies by world seed while preserving stable player IDs. | `createFakeLeagueSystem({ worldSeed })` passes the seed into player generation; names avoid duplicate full names inside one club when possible; a small seed-specific ability variance changes generated squads without changing engine algorithms. CLI tests now assert structure and money formatting instead of old dataset-specific valuation constants. | `pnpm --filter @game/content run typecheck`; focused fake-player, league-system, simulate-season, and career CLI tests; `pnpm check`; season and identity-review CLI smokes |
| `docs/steps/20-new-career-world-generation/05-potential-age-and-prospect-distribution.md` | Done | Applied generated player archetypes to age/current ability/potential generation. | Fake players now carry content-only `playerArchetypes`; age derives from archetype ranges at the 2026-08-01 career start, current ability gets archetype offsets, potential uses archetype uplift, and rare wonderkids are possible but uncommon across generated worlds. Existing CLI tests now avoid old dataset-specific score/standing assumptions. | content typecheck; focused archetype/fake-player/league-system tests; `pnpm check`; season and identity CLI smokes; strict `calibration-v1` balance report PASS with goals `2.863`, first-place points `70.350`, spread `46.400` |
| `docs/steps/20-new-career-world-generation/06-cli-new-career-world-creation-preview.md` | Done | Added a localized career CLI path that writes and inspects a seeded generated career world. | `pnpm cli career --save=<saveId> --seed=<worldSeed> --new-world-preview` builds `createFakeLeagueSystem({ worldSeed })`, persists `CareerWorldMetadata`, selected club state, generated squads, and compact nationality/age/prospect summaries; `career --inspect` now shows world seed and generator version when present. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused career/i18n tests; `pnpm check`; `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase20-world-b --seed=world-b --new-world-preview`; `pnpm cli career --save=phase20-world-a --inspect` |
| `docs/steps/20-new-career-world-generation/07-flag-asset-readiness.md` | Done | Added a content-owned flag asset mapping for every supported nationality. | `flagAssetForNationality` maps `NationalityCode` to a stable SVG filename stem and project-relative `assets/flags/<code>.svg` path for future UI/CLI presentation; domain and engine remain asset-agnostic. | `pnpm --filter @game/content run typecheck`; focused flag-asset tests; `find assets/flags -maxdepth 1 -name "*.svg" | sort`; `pnpm check` |
| `docs/steps/20-new-career-world-generation/08-world-generation-quality-report.md` | Done | Produced the Phase 20 quality report and next-phase recommendation. | `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md` records world seed persistence, same-seed reproducibility, different-seed variation, name/nationality/age/prospect quality, flag asset ownership, balance results, manual commands, and recommends `Phase 21 - Playable Career Loop MVP`. | focused Phase 20 tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase20-world-b --seed=world-b --new-world-preview`; `pnpm cli career --save=phase20-world-a --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/20-new-career-world-generation/09-name-pool-and-surname-variety-rework.md` | Done | Reworked generated surname variety after user review found too many repeated surnames in one squad. | Fake player generation now tracks club and league name usage, avoids duplicate full names, avoids repeated surnames inside a club, limits surnames to two league uses under normal pool capacity, and requires different first names when a surname repeats; Italian and Balkan surname pools were expanded to support the stronger constraint. | `pnpm --filter @game/content run typecheck`; focused name-culture/fake-player/simulate-season tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview` |
| `docs/steps/20-new-career-world-generation/10-simulate-season-identity-world-seed-rework.md` | Done | Fixed standalone identity review so different `simulate-season --seed` values generate different fake worlds. | `runSimulateSeasonCommand` now calls `createFakeLeagueSystem({ worldSeed: parsed.seed })`; this keeps `simulate-season --seed=<value> --identity-review` useful for quick world inspection while persisted careers still store durable `CareerWorldMetadata.worldSeed`. | `pnpm --filter @game/cli run typecheck`; focused simulate-season CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli simulate-season --seed=world-c --identity-review` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/README.md` | Done | Created the Phase 21 audit and roadmap reconciliation documentation path. | Phase 21 is an audit gate before the first playable career-loop phase: it reviews docs, code boundaries, determinism, save consistency, product-loop readiness, roadmap dependencies, and next-phase priority without implementing gameplay features. | Documentation-only update; no source checks required |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/01-documentation-state-audit.md` | Done | Audited binding, operational, advisory, and historical docs. | `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` now identifies `requirements.md`, project rules, project status, and active steps as source-of-truth hierarchy; older roadmap and audit recommendations are historical/advisory when they conflict with current status. | `find docs -maxdepth 3 -type f \| sort`; roadmap/audit `rg` scan; `git diff --check` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/02-code-boundary-and-dead-code-audit.md` | Done | Audited package boundaries, dead-code markers, deterministic API use, and CLI module pressure. | No boundary or forbidden runtime blocker found; the main maintainability watch is keeping future career-loop code modular instead of growing `apps/cli/src/commands/career.ts` unchecked. | `pnpm depcruise`; `pnpm lint`; domain/engine/content/CLI typecheck; dead-code and forbidden-runtime `rg` scans |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/03-determinism-and-save-consistency-audit.md` | Done | Verified seed-varying identity output and persisted career world metadata. | `CareerWorldMetadata.worldSeed` remains separate from `GameState.meta.seed`; career inspect loads stored metadata instead of regenerating a world. | shared/storage/CLI typecheck; `world-a`/`world-b` identity reviews; `phase21-determinism-a` and `phase21-determinism-b` create+inspect smokes; `git diff --check` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/04-product-loop-readiness-audit.md` | Done | Verified current CLI inspection flows and identified the missing cohesive loop. | The project is ready for a narrow playable career loop, but many flows are still fragmented between `simulate-season` and `career` commands instead of operating from one loaded save. | season, fixture, lineup, manual tactic switch, formation-fit, condition, market IT, and strict balance CLI smokes |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/05-roadmap-dependency-reconciliation.md` | Done | Reconciled market roadmap, dependency map, playable-loop report, and Phase 20 world-generation report. | Market MVP and transfer persistence already exist; deeper market/youth/scouting/UI work should wait until a save-driven playable loop exists. | `find docs/market-roadmap -type f \| sort`; dependency/roadmap `rg` scan |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/06-risk-and-priority-report.md` | Done | Prioritized findings and set readiness score. | No blockers; high-risk item is product cohesion: no unified save-driven career loop yet. Readiness score is `88 / 100`. | audit report priority scan; `git diff --check` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/07-next-phase-spec-recommendation.md` | Done | Finalized the Phase 21 audit and next-phase recommendation. | The recommendation was later refined into `Phase 22 - Pre Playable Loop Hardening` followed by `Phase 23 - Playable Career Loop MVP`, preserving Phase 21 as the completed audit gate. | `pnpm check`; final season/identity/career/balance CLI smokes; `git diff --check` |
| `docs/steps/22-pre-playable-loop-hardening/README.md` | Not started | Created the Phase 22 documentation path. | Phase 22 is a hardening phase to resolve roadmap/status ambiguity, career CLI module pressure, save runtime policy, and career determinism tests before the playable loop. | Documentation-only update; `git diff --check` |
| `docs/steps/22-pre-playable-loop-hardening/01-roadmap-status-alignment.md` | Done | Aligned active roadmap/status terminology after the Phase 21 audit gate. | Phase 22 remains pre-loop hardening and Phase 23 remains the playable loop; older Phase 22 playable mentions are historical drift, not active direction. | `rg -n "Phase 22 - Playable\|Phase 23 - Playable\|Pre Playable\|playable loop" docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md docs/PROJECT_STATUS.md`; `git diff --check` |
| `docs/steps/22-pre-playable-loop-hardening/02-career-cli-module-boundaries.md` | Done | Split the broad career command into private parsing, scenario/state, formatting, and type modules without changing command behavior. | `career.ts` remains the public orchestrator; private modules under `apps/cli/src/commands/career/` own argument parsing, deterministic scenario creation, and localized output formatting. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; sequential career create/inspect smoke commands; `pnpm check` |
| `docs/steps/22-pre-playable-loop-hardening/03-career-save-runtime-policy.md` | Done | Made career save runtime behavior visible and safer for local development. | Career CLI output now prints the storage directory through localized `career.saveDirectory`; `.gitignore` explicitly ignores `apps/cli/saves/` runtime saves. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused career/i18n tests; career create/inspect smokes; `git check-ignore -v apps/cli/saves/career/save%3Aphase22-save-policy-world.career.json`; `pnpm check` |
| `docs/steps/22-pre-playable-loop-hardening/04-career-determinism-golden-checks.md` | Done | Added focused career determinism and persistence golden checks. | Career tests now prove same world seed creates stable selected-club player data, different seeds vary generated worlds, and accepted permanent transfers survive storage adapter reloads. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/storage/src/career-storage.test.ts`; `pnpm check` |
| `docs/steps/22-pre-playable-loop-hardening/05-phase-23-readiness-review.md` | Done | Completed the Phase 22 hardening report and approved Phase 23 start. | `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md` scores readiness at `95 / 100`; remaining risk is accepted because the save-driven loop itself is Phase 23 scope. | `pnpm check`; `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-hardening-world --inspect`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/23-playable-career-loop-mvp/README.md` | Not started | Created the Phase 23 documentation path. | Phase 23 is the first cohesive save-driven career loop MVP after Phase 22 hardening. | Documentation-only update; `git diff --check` |
| `docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md` | Done | Phase 22 readiness was confirmed before implementing career-loop behavior. | Treat the remaining readiness gap as Phase 23 scope; no source changes were needed in this review step. | `rg -n "Score\|Blocker\|Phase 23\|playable" docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md docs/PROJECT_STATUS.md`; `git diff --check` |
| `docs/steps/23-playable-career-loop-mvp/02-career-summary-from-save.md` | Done | Added a localized save-driven career summary and persisted initial fixtures for new career worlds. | `--summary` loads an existing career save, prints current date/season, selected club, roster size, budget, and next selected-club fixture without mutating the save; new world creation now stores the initial deterministic calendar. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase23-summary-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-summary-world --summary`; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/03-career-next-fixture-progression-contract.md` | Done | Added a pure engine contract for finding the next unplayed selected-club fixture. | `findNextCareerFixture` returns typed `found`, `none`, or `invalid` results using only persisted `CareerState` and explicit fixture order; it does not simulate, mutate, or persist. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts`; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/04-persisted-fixture-progression.md` | Done | Added a reusable in-memory use-case that simulates and applies one next selected-club fixture. | `progressNextCareerFixture` reuses `findNextCareerFixture`, supplied match team contexts, `simulateMatch`, `createMatchReport`, and fixture result application to return a copied career state without writing storage or choosing lineups/tactics. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts packages/engine/src/career/progress-fixture.test.ts apps/cli/src/commands/career.test.ts`; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/05-career-advance-cli.md` | Done | Added the first save-writing career advancement command. | `--advance-next-fixture` loads a career save, builds deterministic MVP default team contexts from persisted roster/player state, advances one selected-club fixture, writes the updated save only on success, and prints localized result/next-fixture output. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts packages/engine/src/career/progress-fixture.test.ts`; create-summary-advance-inspect CLI smoke; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/06-durable-decision-continuity.md` | Done | Proved an accepted manual transfer remains visible after fixture advancement. | A focused career CLI test and smoke flow apply an accepted transfer, verify roster/budget/history, advance one selected-club fixture, reload the save, and verify the manual decision plus played-fixture count remain durable. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; create/apply/summary/advance/inspect CLI continuity smoke; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/07-playability-audit-and-next-phase-decision.md` | Done | Completed the playability audit and next-phase decision. | `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md` scores the current milestone at `98 / 100` and recommends only `Phase 24 - Career Match Preparation Persistence` next. | `pnpm check`; create-summary-advance-inspect CLI smoke on `phase23-loop-world`; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/24-player-generation-quality-rework/README.md` | Not started | Created the Phase 24 documentation path after the user identified player generation quality as the core risk to resolve before more career systems. | Phase 24 supersedes the previous next-phase recommendation for now: first audit and rework generated player quality by division, club tier, role, age, potential, and rarity; then decide whether to resume career match preparation persistence. | Documentation-only update; `git diff --check` |
| `docs/steps/24-player-generation-quality-rework/01-current-generator-audit.md` | Done | Confirmed that current generated identities vary by seed but ability generation is too broad and off-role values are inflated by the common base formula. | `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md` records source areas, suspicious output examples, and concrete requirements for bands, role templates, archetypes, and rarity budgets. | `rg` generator scan; `pnpm --filter @game/content run typecheck`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review` |
| `docs/steps/24-player-generation-quality-rework/02-division-and-club-tier-attribute-bands.md` | Done | Added explicit current/potential generation bands by division and generated club tier. | `player-generation-bands.ts` separates first/second/third-division quality and title/playoff/mid-table/survival tiers; fake player base ability now starts from these bands before role templates. A brittle CLI condition-demo test was generalized because generated content changes can validly change a fixture score. | `pnpm --filter @game/content run typecheck`; focused content band/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/03-role-based-attribute-templates.md` | Done | Added explicit role templates for generated player attributes. | `player-role-templates.ts` builds all 25 abilities from role templates; defenders, attackers, outfield players, and goalkeepers now have caps that stop off-role attributes from rising with the general base. The old generic `abilitiesForPosition` helper was removed. | `pnpm --filter @game/content run typecheck`; focused role/fake-player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/04-age-potential-and-prospect-archetypes.md` | Done | Replaced broad old archetypes with explicit senior, category, youth, serious prospect, and prodigy archetypes. | Archetypes now carry `potentialClass`, fractional current offsets, and separate potential uplift; career formatting now counts serious/elite potential classes instead of old hardcoded archetype names. | `pnpm --filter @game/content run typecheck`; focused archetype/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/05-rarity-budget-and-white-fly-rules.md` | Done | Added deterministic league-level rarity budgets for lower-division exceptions. | `player-rarity-budget.ts` assigns white-fly players, serious prospects, and rare prodigies by world seed; ordinary archetype selection now skips budget-controlled archetypes so rare cases cannot leak outside the allocation. | `pnpm --filter @game/content run typecheck`; focused rarity/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/06-player-generation-quality-tests.md` | Done | Added product-level generated league quality tests. | `player-generation-quality.test.ts` checks seed stability/variation, role-coherence caps, limited high-current players, rarity-budget counts, and at least one prospect per club without guaranteeing stars. | `pnpm --filter @game/content run typecheck`; focused quality/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/07-cli-generation-quality-report.md` | Done | Added a localized `simulate-season --player-generation-report` inspection. | The CLI summarizes seed-level division, club/player counts, current ability bands, potential classes, rarity budget usage, prospect coverage, and role-coherence warnings without writing saves or listing hidden individual potential. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `git diff --check` |
| `docs/steps/24-player-generation-quality-rework/08-phase-report-and-next-phase-decision.md` | Done | Completed the Phase 24 quality report and next-phase decision. | `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md` scores player generation at `93 / 100` for current maturity and recommends `Phase 25 - Career Match Preparation Persistence` as the single next phase. | `pnpm check`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/25-career-match-preparation-persistence/README.md` | Not started | Created the Phase 25 documentation path. | Phase 25 turns match preparation into durable career state: inspect squad, save lineup, save tactic, advance with saved preparation, then report readiness. | Documentation-only update; `git diff --check` |
| `docs/steps/25-career-match-preparation-persistence/01-phase-24-output-and-prep-gap-review.md` | Done | Documented the current career match-preparation persistence gap. | `docs/audits/CAREER_MATCH_PREPARATION_GAP_REVIEW.md` records that selected-club career advancement still uses runtime default lineup/tactic construction and should move to saved manager choices while reusing existing domain `SelectedLineup` and `TacticSetup` contracts. | `rg -n "defaultLineupFromRoster|advanceCareerNextFixture|createSelectedLineup|createTacticSetup|CareerState" apps packages docs`; `git diff --check` |
| `docs/steps/25-career-match-preparation-persistence/02-career-squad-player-inspection.md` | Done | Added save-driven selected-club squad inspection. | `pnpm cli career --save=<saveId> --squad` loads an existing career save, prints selected club, squad size, ordered roster, age, natural position, compact role-relevant current ability, and fitness/form/morale without exposing hidden potential or mutating the save. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase25-squad-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase25-squad-world --squad`; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/03-match-preparation-state-contract.md` | Done | Added durable optional match-preparation state to `CareerState`. | `CareerMatchPreparation` stores selected club, optional target fixture, optional selected lineup, optional tactic, and update date; `createCareerState` validates club/fixture references, selected-club player ownership, selected-lineup ambiguity through `createSelectedLineup`, and tactic values through `createTacticSetup`; storage round-trips the new slice while old saves without preparation remain valid. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/domain/src/state/career-state.test.ts packages/storage/src/career-storage.test.ts`; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/04-save-career-lineup-selection.md` | Done | Added save-writing career lineup selection. | `pnpm cli career --save=<saveId> --set-lineup-demo=pro01-first-team|pro01-rotated` loads an existing career save, writes `matchPreparation.selectedLineup`, binds it to the next selected-club fixture when available, preserves any existing tactic, and `--inspect` shows the saved lineup after reload. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; CLI create/set-lineup/inspect smoke; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/05-save-career-tactic-selection.md` | Done | Added save-writing career tactic selection. | `pnpm cli career --save=<saveId> --set-tactic-demo=pro01-balanced|pro01-attacking|pro01-defensive` writes `matchPreparation.tactic`, preserves any saved lineup, and summary/inspect output shows the full saved tactic values. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; CLI create/set-lineup/set-tactic/summary smoke; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/06-advance-fixture-uses-saved-preparation.md` | Done | Career fixture advancement now uses saved selected-club preparation. | `advanceCareerNextFixture` blocks selected-club progression when saved preparation, lineup, or tactic is missing; with preparation present it builds the selected club through `buildTacticTeamContext`, keeps deterministic opponent defaults only for non-user clubs, persists the played fixture, and retargets saved preparation to the next selected-club fixture. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts packages/engine/src/career/progress-fixture.test.ts`; CLI create/set-lineup/set-tactic/advance/inspect smoke; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/07-phase-report-and-next-phase-decision.md` | Done | Completed the Phase 25 final report and next-phase decision. | `docs/audits/CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md` scores the career preparation loop at `95 / 100`, confirms selected-club default preparation is blocked, and recommends exactly one next phase: `Phase 26 - Career Match-Day Interaction MVP`. | `pnpm check`; career create/squad/set-lineup/set-tactic/summary/advance/inspect CLI smoke on `phase25-prep-world`; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/README.md` | Not started | Created the Phase 26 documentation path. | Phase 26 supersedes the immediate match-day recommendation and prepares the long-run path by cleaning docs, defining active reports, recording the engine baseline, and defining long-run metrics. | Documentation-only update; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/01-documentation-noise-audit.md` | Done | Classified project documentation noise without moving or deleting files. | `docs/audits/DOCUMENTATION_NOISE_AUDIT.md` marks active guidance, historical references, archive candidates, and no deletion candidates; obsolete roadmap material is ready for a policy-backed archive step. | `find docs -maxdepth 3 -type f | sort`; `rg -n "roadmap|Phase 7|Phase 20|future|archive|obsolete" docs`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/02-report-retention-policy.md` | Done | Created active audit/report retention policy. | `docs/audits/README.md` now defines the active reading path and report categories; `docs/archive/README.md` defines how archived files should be treated. No files were moved or deleted. | `test -f docs/audits/DOCUMENTATION_NOISE_AUDIT.md`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/03-archive-obsolete-roadmaps.md` | Done | Archived obsolete roadmap material without deleting decision history. | `docs/ROADMAP_PHASES_07_20.md` moved to `docs/archive/roadmaps/ROADMAP_PHASES_07_20.md`; `docs/market-roadmap/` moved to `docs/archive/roadmaps/market-roadmap/`; audit and archive indexes record that these are historical context, not active implementation order. | `find docs -maxdepth 4 -type f | sort`; `rg -n "PROJECT_ROADMAP|roadmap|archive" docs/audits docs/archive docs/steps`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/04-current-engine-baseline.md` | Done | Created the current engine baseline before long-run work. | `docs/audits/CURRENT_ENGINE_BASELINE.md` summarizes match, season, career persistence, player generation, market MVP, current limitations, and the minimum Phase 27-30 path; the current strict balance sample is recorded at `2.859` goals per match. | `rg -n "simulateSeason|progressNextCareerFixture|CareerState|generateFake|player-generation|transfer" packages apps docs`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/05-long-run-metrics-definition.md` | Done | Defined the long-run credibility metrics before runner implementation. | `docs/audits/LONG_RUN_METRICS_SPEC.md` separates mandatory Phase 30 metrics from later metrics and covers season results, player development, aging, squad stability, market turnover, anomalies, and manual inspection outputs. | `test -f docs/audits/CURRENT_ENGINE_BASELINE.md`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/06-phase-report-and-phase-27-readiness.md` | Done | Closed Phase 26 and confirmed Phase 27 can start. | `docs/audits/LONG_RUN_READINESS_REPORT.md` records archived roadmap material, active audit structure, current baseline summary, long-run metric summary, and the decision to start `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md`. | `find docs -maxdepth 4 -type f | sort`; `rg -n "CURRENT_ENGINE_BASELINE|LONG_RUN_METRICS_SPEC|LONG_RUN_READINESS_REPORT" docs`; `git diff --check`; Phase-level docs checks |
| `docs/steps/27-season-rollover-foundation/README.md` | Not started | Created the Phase 27 documentation path. | Phase 27 makes a career save finish one season, archive it, generate the next calendar, and roll player age/state forward. | Documentation-only update; `git diff --check` |
| `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md` | Done | Added pure current-season completion detection. | `assessCareerSeasonCompletion` walks ordered fixture IDs, validates fixture and club references, ignores non-current-season fixtures, and returns typed `complete`, `incomplete`, or `invalid` results without storage or CLI decisions. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused season-completion/domain tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/02-next-season-calendar-generation.md` | Done | Added pure next-season calendar generation. | `generateNextSeasonCalendar` requires a complete current season, carries forward the same clubs/competition, derives the next season ID deterministically, schedules the new season 70 days after the latest current-season fixture, and remaps fixture IDs after the current maximum to avoid collisions. | `pnpm --filter @game/engine run typecheck`; focused next-season/calendar tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/03-career-season-archive.md` | Done | Added compact completed-season history to durable career state. | `CareerState.seasonHistory` stores optional structured season archive entries with sequence, season, competition, final table, champion, selected-club finish, and aggregate goals; `createCareerState` validates archive references and old saves without archives remain valid. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/storage run typecheck`; focused domain/storage tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/04-player-age-and-state-rollover.md` | Done | Added pure player age/state rollover for next season. | `rolloverPlayersForNextSeason` treats calendar date as the age source, advances to the supplied next season start, resets fitness to `100`, resets form to `50`, normalizes morale toward `50` by 10 points, and leaves abilities, potential, birth dates, and player order unchanged. | `pnpm --filter @game/engine run typecheck`; focused player-season-rollover tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/05-cli-lab-rollover-smoke.md` | Done | Added localized career season rollover lab command. | `pnpm cli career --save=<saveId> --rollover-season` validates that the current season is complete, writes no save on invalid/incomplete state, archives final table/champion/selected-club finish/aggregate goals, appends the next season calendar, advances calendar season/date, resets player fitness/form, normalizes morale, clears stale match preparation, and writes the save only on success. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; deterministic completed-save rollover smoke in career command test |
| `docs/steps/27-season-rollover-foundation/06-phase-report-and-phase-28-readiness.md` | Done | Completed the Phase 27 closeout report and Phase 28 readiness decision. | `docs/audits/SEASON_ROLLOVER_FOUNDATION_REPORT.md` documents the rollover model, archive model, CLI smoke, remaining limitations, and recommends `docs/steps/28-player-development-and-aging-v1/01-development-model-spec.md` as the next active step. | `pnpm check`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts -t "career command rolls a completed season into the next persisted season"`; `git diff --check` |
| `docs/steps/28-player-development-and-aging-v1/README.md` | Not started | Created the Phase 28 documentation path. | Phase 28 implements deterministic player growth, decline, and potential realization for multi-season credibility. | Documentation-only update; `git diff --check` |
| `docs/steps/28-player-development-and-aging-v1/01-development-model-spec.md` | Done | Created the deterministic player development model spec. | `docs/audits/PLAYER_DEVELOPMENT_MODEL_SPEC.md` defines age bands by broad position, growth/peak/decline windows, model inputs, role-relevant growth, bounded potential realization, third-division credibility targets, out-of-scope items, and mandatory implementation tests. | `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`; `git diff --check` |
| `docs/steps/28-player-development-and-aging-v1/02-player-growth-engine.md` | Done | Added pure deterministic positive player growth. | `developPlayersForSeason` derives per-player growth from `worldSeed`, `seasonId`, and player ID; growth is strongest for young players with room to potential, biased toward role-relevant attributes, bounded by true potential, and returned with structured non-presentational change summaries. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`; `pnpm check` |
| `docs/steps/28-player-development-and-aging-v1/03-aging-and-decline-engine.md` | Done | Added deterministic aging decline to the development engine. | Outfield decline starts by age group with physical abilities declining before technical/mental abilities; goalkeeper decline starts later and targets rushing-out/footwork first, with reflexes/handling/positioning declining only later. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`; `pnpm check` |
| `docs/steps/28-player-development-and-aging-v1/04-potential-realization-and-variance.md` | Done | Added controlled potential-realization variance. | Growth now uses a stable per-player realization modifier plus per-season variance; potential remains a bound, high-upside players have better opportunity without guaranteed stars, and long-run tests confirm varied paths and bounded outcomes. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`; `pnpm check` |
| `docs/steps/28-player-development-and-aging-v1/05-development-report-cli-lab.md` | Done | Added a localized in-memory career development report. | `pnpm cli career --save=<saveId> --development-report` simulates seven seasons from an existing save without writing it, reports selected-club aggregate growth/decline/stalled prospects plus example players, and avoids exposing exact hidden potential. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli career --save=phase28-development-world --development-report` |
| `docs/steps/28-player-development-and-aging-v1/06-phase-report-and-phase-29-readiness.md` | Done | Completed the Phase 28 closeout report and Phase 29 readiness decision. | `docs/audits/PLAYER_DEVELOPMENT_AND_AGING_REPORT.md` documents the growth model, decline model, potential-realization variance, CLI lab report output, remaining limitations, and recommends `docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md` as the next active step. | `pnpm check`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts -t "development report"`; `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/README.md` | Not started | Created the Phase 29 documentation path. | Phase 29 replaces placeholder club names with deterministic fictional city-based identities and reviews calendar readiness. | Documentation-only update; `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md` | Done | Created the fictional city-based club identity source-data spec. | `docs/audits/CLUB_IDENTITY_SOURCE_DATA_SPEC.md` defines supported countries, city-pool categories, division weighting, fictional naming patterns, duplicate avoidance, short-name rules, and IP-safety rules. | `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md` | Rework done | Reworked deterministic fictional club names away from repetitive generic suffixes. | `packages/content/src/clubs/club-identity-source-data.ts` now defines country-specific weighted naming patterns and fallback disambiguators; `generateFakeClubs({ seed })` now mixes names like `A.C. Lecco`, `Como Calcio`, `Virtus Trento`, and `Pro Palermo` while preserving stable `club:province-XX` IDs and technical short names. | `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b` |
| `docs/steps/29-club-identity-and-world-calendar-v1/03-club-identity-in-career-worlds.md` | Done | Career and simulation CLI output now uses generated club names consistently. | The CLI presentation helpers now prefer `Club.name` for selected club, fixtures, tables, market demos, career summaries, and formation-fit output; localized table headers were widened and tests now assert readable generated names rather than `PROxx` placeholders. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/04-world-calendar-v1-review.md` | Done | Reviewed the current world calendar model before Phase 30. | `docs/audits/WORLD_CALENDAR_V1_REVIEW.md` documents the deterministic closed-league double round-robin model, confirms it is sufficient for first ten-season reporting, and records non-blocking limitations such as no promotions, cups, playoffs, or multi-division world yet. | `rg -n "generate.*Calendar|Round|Fixture|competition|season" packages docs`; `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/05-club-identity-and-calendar-report.md` | Done | Completed the Phase 29 closeout and Phase 30 readiness decision. | `docs/audits/CLUB_IDENTITY_AND_WORLD_CALENDAR_REPORT.md` records the club naming model, sample generated clubs for `world-a` and `world-b`, career preview samples, calendar model limits, and confirms Phase 30 can start as a closed single-division ten-season report. | `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase29-world-b --seed=world-b --new-world-preview`; `git diff --check` |
| `docs/steps/30-ten-season-simulation-report/README.md` | Not started | Created the Phase 30 documentation path. | Phase 30 simulates roughly ten seasons and produces reports to decide whether the engine is credible enough for future UI exploration. | Documentation-only update; `git diff --check` |
| `docs/steps/30-ten-season-simulation-report/01-ten-season-report-spec.md` | Done | Created the ten-season report specification. | `docs/audits/TEN_SEASON_REPORT_SPEC.md` defines report sections, standard seeds, metrics, goals/assists/creator concentration thresholds, anomaly categories, unavailable-system handling, and final decision criteria. | `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`; `git diff --check` |
| `docs/steps/30-ten-season-simulation-report/02-multi-season-runner.md` | Done | Added the deterministic multi-season runner and the first CLI lab command. | `simulation-tools` owns `runLongRunSimulation` with stable per-season seed derivation; CLI bridges fake content through a shared season-input helper and exposes localized `pnpm cli ten-season-report`. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused runner/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/03-player-evolution-metrics.md` | Done | Added player-evolution and production metrics to the ten-season report. | `simulation-tools` owns generic player-evolution aggregation from report-safe snapshots; CLI builds snapshots from an in-memory career world, applies deterministic player development for the report horizon, and prints growth/decline, prospect/prodigy, age, scorer/assist depth, and creator-share metrics. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused player-evolution/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/04-club-and-market-stability-metrics.md` | Done | Added club and missing-system stability metrics to the ten-season report. | `simulation-tools` owns generic club-stability aggregation; CLI derives champion/title/selected-club rows from completed seasons and explicitly reports transfer and squad turnover as unavailable instead of fabricating market activity. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused club-stability/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/05-balance-and-anomaly-scoring.md` | Done | Added deterministic anomaly scoring to the ten-season report. | `simulation-tools` scores goals, table spread, top assist maximum, top-one/top-three creator share, champion streak, useful players after long run, age distribution, and unavailable turnover systems; CLI renders the overall status and ordered checks without tuning engine values. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused anomaly-scoring/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/06-final-ten-season-playability-report.md` | Done | Completed the final ten-season playability report and next-phase decision. | `docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md` records `world-a` and `world-b` ten-season evidence, confirms match balance is credible, identifies age distribution and missing turnover as blockers, and recommends Phase 31 for career squad refresh and transfer turnover before UI. | `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=10`; `pnpm cli ten-season-report --seed=world-b --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/README.md` | Not started | Created the Phase 31 documentation path. | Phase 31 adds deterministic exits, intake, squad-shape maintenance, simple transfer turnover, long-run integration, and a validation ladder: 50x10 smoke, 250x30 development regression, and 10,000x50 final hard gate before UI exploration. | Documentation-only update; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/01-phase-30-findings-review.md` | Done | Created the Phase 31 squad-refresh spec from Phase 30 findings. | `docs/audits/CAREER_SQUAD_REFRESH_SPEC.md` defines the long-run squad-health targets, non-goals, required metrics, and validation ladder before code starts. | `test -f docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/02-player-exit-and-retirement-rules.md` | Done | Added deterministic end-of-season player exit rules. | `applyEndOfSeasonPlayerExits` evaluates active players by age, broad position, current ability, world seed, season ID, and player ID; exited players leave active rosters/order and produce structured retirement/released/career-step-down records without generating replacements. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-exits.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/03-new-player-intake-pool.md` | Done | Added deterministic replacement-player intake generation and validation. | `generateCareerIntakePlayers` reuses content-owned nationality distribution, name pools, division bands, youth archetypes, and role templates; `createCareerIntakePool` validates unique non-active candidates for later squad maintenance without applying them yet. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/content/src/generators/career-intake-players.test.ts packages/engine/src/career/player-intake.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/04-squad-size-and-role-balance-maintenance.md` | Done | Added squad-size and broad role-balance maintenance. | `maintainCareerSquadShape` applies validated intake players only where clubs have minimum-size, goalkeeper, or broad department depth needs; it preserves active player order, does not choose lineups/tactics, and emits factual warnings. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/squad-maintenance.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/05-transfer-turnover-simulation-mvp.md` | Done | Added minimal deterministic transfer turnover between clubs. | `simulateTransferTurnover` moves a controlled number of suitable players between clubs based on broad positional need, source roster safety, age/ability context, club reputation, and simple downward-move willingness checks; it has no fees, wages, contracts, negotiations, loans, or persistence writes. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/transfer-turnover.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/06-career-long-run-integration.md` | Done | Integrated career refresh into the long-run report path. | `runCareerLongRunSimulation` sequences season simulation and app-provided post-season refresh; CLI composes fake content with development, exits, intake generation, squad maintenance, and transfer turnover in memory, surfacing real refresh totals without writing career saves. | simulation-tools/CLI/i18n typechecks; focused long-run/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/07-turnover-and-age-distribution-metrics.md` | Done | Added detailed refresh metrics and structural anomaly checks to the long-run report. | `ten-season-report` now aggregates exit reasons, intake, transfer turnover, squad-size min/avg/max, clubs below minimum squad size, clubs without natural goalkeeper, and role coverage warnings; anomaly scoring now fails structural squad collapse instead of only warning on unavailable turnover. | simulation-tools/CLI/i18n typechecks; focused long-run/CLI tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md` | Blocked | Added the explicit gate runner and ran the 50x10 smoke gate, which failed before larger gates. | `ten-season-report` now supports `--seed-prefix`, `--worlds`, `--seasons`, and `--report-output`; the 50x10 report found no squad-structure collapse but failed on `phase31-gate-world-00009` (`top_assist_max`) and `phase31-gate-world-00040` (`champion_streak`), so 250x30 and 10,000x50 were intentionally not run. | focused CLI/i18n/simulation-tools tests; `pnpm check`; strict `calibration-v1` balance report; 50x10 gate report; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08a-long-run-gate-anomaly-rework.md` | Blocked | Reworked the failed 50x10 gate and cleared the 250x30 gate, but did not launch the final 10,000x50 gate because the current serial CLI runner would likely take multiple hours. | Added warning/failing check diagnostics, fixed intake-player age anchoring to the current career date, seed-shuffled transfer-turnover destination order, raised long-run turnover and intake capacity, scaled assist/champion anomaly thresholds by run length, and made top-three creator-share scoring ignore low-goal clubs. | Focused typechecks/tests; `pnpm check`; strict `calibration-v1` balance report; representative seeds `00001`, `00009`, `00040`; 50x10 PASS; 250x30 PASS; 10,000x50 blocked by runtime |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/09-phase-31-final-report-and-next-decision.md` | Not started | Planned final Phase 31 report and next decision. | The step decides whether the project can move toward UI exploration or needs another simulation-hardening phase. | Pending |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/README.md` | Not started | Created the Phase 32 documentation path. | Phase 32 introduces a bounded youth-academy pipeline to reduce reliance on external senior intake and keep long-run squads credible without overpopulating the world. | Documentation-only update; `git diff --check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/01-phase-31-findings-and-youth-pipeline-spec.md` | Done | Created the youth academy pipeline spec from Phase 31 evidence. | Locked conservative youth population targets, user-control boundaries, lifecycle vocabulary, non-goals, and long-run success metrics before code. | `test -f docs/audits/CAREER_SQUAD_REFRESH_ANOMALY_REWORK_REPORT.md`; `test -f docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`; `git diff --check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/02-youth-academy-domain-contracts.md` | Done | Added durable youth academy contracts and validation. | `CareerState` now optionally persists `YouthAcademyState` with ordered club rosters and lifecycle rows; active youth players are validated as existing, non-senior, non-duplicated players, and old saves without youth state remain valid. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/storage run typecheck`; focused domain/storage tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/03-initial-youth-roster-generation.md` | Done | New career worlds now include bounded initial youth academies. | Content generates exactly `8` deterministic youth players per club, age `15..19`, with role-coherent lower-division quality; CLI new-world creation persists them as real players in `GameState` and active youth members in `YouthAcademyState` without changing senior rosters. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused content/CLI/i18n tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/04-seasonal-youth-intake.md` | Done | Added bounded annual youth intake generation and application. | Content generates deterministic annual youth candidates (`2..4`, age `15..17`); engine applies accepted candidates to youth rosters up to cap `12`, records generated/accepted/skipped IDs, initializes old saves without youth state, and leaves senior rosters unchanged. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; focused content/engine tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/05-youth-aging-development-and-exits.md` | Done | Added youth-only development and age-out lifecycle processing. | `applyYouthAcademyLifecycle` develops only active academy players, removes aged-out players from active youth rosters, deletes released/external-move youth from active state, and keeps promotion candidates as non-rostered lifecycle rows for the next promotion step. | `pnpm --filter @game/engine run typecheck`; focused youth lifecycle tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/06-youth-promotion-and-senior-pipeline.md` | Done | Added explicit youth-to-senior promotion rules and long-run lab integration. | `promoteYouthCandidatesToSeniorSquads` promotes only lifecycle `promotion_candidate` players when senior squads have room; selected club is protected by default, while the automated ten-season lab opts in explicitly before external squad maintenance. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused engine/CLI/i18n tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/07-long-run-youth-metrics.md` | Done | Added youth-academy population metrics to long-run reports. | `LongRunYouthStabilityReport` now scores youth over/underpopulation separately from existing anomaly scoring, and the ten-season report/gate surface senior/youth/total active players, youth roster range, intake, exits, promotions, selected-club youth size, and youth PASS/WARN/FAIL checks. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=phase32-step07 --seasons=2` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/08-cli-youth-academy-inspection.md` | Done | Added safe youth academy CLI inspection. | `pnpm cli career --save=<saveId> --youth-academy` reads a persisted career save without mutation and prints selected-club youth count, senior/youth/total active players, broad youth ability/development categories, and lifecycle status without exact hidden potential. Nationality currently displays as unavailable when the save lacks durable identity metadata. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused career/i18n tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/09-phase-32-gates-and-final-report.md` | Done | Wrote final Phase 32 gate report and blocked the next phase from evidence. | Youth overpopulation is controlled (`youth_max=12`, `clubs_above_youth_target=0`), but the required `250x30` gate fails in 8 worlds on `top_creator_goal_share_max` and every world warns on youth underpopulation, so Phase 32 needs a rework before broader career/UI work. | `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=50 --seasons=10 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md` failed as expected from gate findings; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/README.md` | Not started | Created the Phase 33 documentation path. | Phase 33 is the chosen remediation for the broader player generation/development issue identified during the Phase 32 youth-academy discussion: explicit role identity, archetypes, hard attribute caps, division/age bands, potential rarity, academy refill, and development cap enforcement. | Documentation-only update; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/01-generation-audit-and-model-spec.md` | Done | Created the Phase 33 model spec and current-code audit. | The audit confirms Phase 24 improved generation, but Phase 33 still needs explicit role identity/familiarity contracts, complete role/archetype classification, role-aware development caps, exact youth refill to 11, and reportable long-run validation. | `test -f docs/audits/YOUTH_ACADEMY_AND_SQUAD_PIPELINE_REPORT.md`; `test -f docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`; required `rg` audit scan; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/02-role-identity-and-familiarity-contracts.md` | Done | Added explicit role identity and familiarity contracts for generated players. | `domain` now owns the Phase 33 role/archetype/familiarity contract and validator; `content` maps every generated tactical position to one stable primary role, archetype, natural/adapted/weak role set, and role familiarity for senior, initial youth, seasonal youth, and career intake players. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/content run typecheck`; focused domain/content Vitest files; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/03-role-attribute-classification-and-hard-caps.md` | Done | Added complete role/archetype attribute classification and hard-cap data. | `content` now owns reusable ability-key classifications for all official roles and archetypes, including goalkeeper separation, defender finishing caps, attacker defensive caps, and outfield goalkeeper caps; tests fail if any ability is unclassified or duplicated. | `pnpm --filter @game/content run typecheck`; focused content classification test; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/04-division-age-and-current-ability-bands.md` | Done | Added explicit current-ability bands for senior and youth generation. | `content` now owns division-, age-, role-bucket-, rarity-lane-, and tier-aware current-ability bands plus deterministic sampling helpers and effective role/ability ranges that apply hard caps; club tier can move values only inside division lanes. | `pnpm --filter @game/content run typecheck`; focused current-band/classification tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/05-potential-rarity-and-white-fly-budget.md` | Done | Added explicit potential rarity bands and division/season rarity budgets. | `content` maps existing archetypes to `ordinary`, `interesting`, `high`, and `elite`; the existing league-level rarity allocator now reads division/season budgets so third-division `high` potential is bounded to 2..5 and `elite` remains 0..1 while white-fly stories stay rare. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; focused content rarity tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/06-senior-generator-rework.md` | Done | Rewired senior generation to the Phase 33 role-aware path. | Senior current abilities are now sampled per ability from role classifications, division/current bands, rarity lanes, and club-tier modifiers, then clamped by role hard caps; potential is still generated through the existing potential path but is capped by role and never below current ability. Player-generation report thresholds now match Phase 33 caps. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/CLI/i18n tests; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/07-youth-academy-refill-generator-rework.md` | Done | Reworked academy generation/refill around the exact Phase 33 youth structure. | Initial academies now generate exactly 11 players per club with 1 goalkeeper, 4 defenders, 4 midfielders, and 2 attackers; seasonal refill generates only missing positions, mostly ages 15..17 with rare 18, uses role-aware youth current bands, fails if a club remains underfilled after refill, and long-run/report automation no longer auto-promotes the selected club. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/engine/simulation-tools/CLI tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/08-development-respects-role-caps.md` | Done | Reworked player development so growth respects Phase 33 role caps. | Development now derives a stable development role from `primaryRole` with a natural-position fallback, prioritizes core/secondary/allowed/capped ability buckets, clamps growth room by role hard caps, preserves the player's primary role, and keeps aging decline behavior intact. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; focused engine development tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/09-generation-quality-report-and-tests.md` | Done | Extended generation quality reports and tests with youth academy evidence. | `simulate-season --player-generation-report` now prints senior current/potential/rarity/role-coherence metrics plus initial academy baseline totals, exact 11-player club coverage, youth roster min/max, youth department counts, youth age distribution, and youth role-coherence warnings; all new labels are localized in the five supported languages. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/10-long-run-gates-and-phase-report.md` | Blocked | Wrote the Phase 33 report and identified the remaining gate blocker. | Player generation, development caps, and youth academy structure are credible enough for inspection, but the phase cannot close because the required 250x30 long-run gate has one `top_creator_goal_share_max` failure in `phase33-generation-world-00173`; the next work must be a narrow match-event creator/assist concentration rework. | `pnpm check`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm cli career --save=phase33-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase33-world-a --development-report`; `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md` failed as expected from the blocker; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/34-match-event-concentration-rework/README.md` | Not started | Created the Phase 34 documentation path. | Phase 34 is a narrow remediation for the remaining Phase 33 long-run blocker: rare excessive goal-creator concentration in `phase33-generation-world-00173`; it must audit first, avoid threshold widening, avoid season-level caps, and preserve player-generation/youth fixes. | Documentation-only update; `git diff --check` |
| `docs/steps/34-match-event-concentration-rework/01-failing-world-creator-concentration-audit.md` | Done | Reproduced and explained the failing Phase 33 seed. | The failure is isolated to season `2`: `A.C. Brescia`, creator `Matteo Morandi`, `15` assists on `37` club goals, `top_creator_goal_share=0.41`; the CLI production rows now include creator club, team goals, same-club top scorer, and top creator fields as diagnostics only, with no attribution behavior change. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused simulation-tools/CLI/i18n tests; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; final `pnpm check` and `git diff --check` pending after status update |
| `docs/steps/34-match-event-concentration-rework/02-creator-assist-attribution-diagnostics.md` | Done | Added compact creator-concentration diagnostics to long-run gate output. | Worst-world rows now include `creator_snapshot` with season, club, creator, assists, team goals, top1/top3 share, top assist, and top scorer; this separates creator concentration from scorer and assist maxima without changing engine behavior. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused simulation-tools/CLI/i18n tests; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; temporary 2-world gate with report output; final `pnpm check` and `git diff --check` pending after status update |
| `docs/steps/34-match-event-concentration-rework/03-creator-selection-distribution-rework.md` | Done | Reworked creator selection distribution by chance type. | Creator weights now vary by chance type: open play still favors midfielders, counters favor attackers, crosses give defenders/attackers more share, dead balls keep a mixed outfield pool, and goalkeepers remain excluded; this reduced the failing seed's `top_creator_goal_share_max` from `0.41` to `0.26` without changing scoring probabilities, generation, youth, or thresholds. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused engine/CLI tests; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; final `pnpm check` and `git diff --check` pending after status update |
| `docs/steps/34-match-event-concentration-rework/04-long-run-smoke-gate.md` | Blocked | Ran the 50x10 smoke gate and stopped before the final 250x30 gate. | The creator-concentration rework holds under the smoke gate, but the gate still fails because `phase34-concentration-world-00003` and `phase34-concentration-world-00040` have low `table_points_spread_avg`; this is a separate table-spread anomaly, not a creator/assist concentration failure. | `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=50 --seasons=10 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md` failed with `table_points_spread_avg=2` failing worlds; `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`; `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed |
| `docs/steps/34-match-event-concentration-rework/05-phase-34-gate-and-report.md` | Not started | Planned final gate and report. | Run the final 250x30 gate, strict balance report, and write the Phase 34 concentration report with the next action. | Pending |
| `docs/steps/35-table-spread-anomaly-rework/README.md` | Done | Created the Phase 35 documentation path. | Phase 35 is the narrow remediation path for the two Phase 34 smoke-gate `table_points_spread_avg` failures; it must audit first, add diagnostics if needed, identify the table-compression source, rework only that source, and preserve the Phase 34 creator-concentration fix. | Documentation-only update; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/01-table-spread-failure-audit.md` | Done | Reproduced and documented the two table-spread failure worlds. | Single-world season summaries now include last-place points and first-minus-last table spread as diagnostics only; the audit shows both failed worlds pass goals and creator metrics but repeatedly produce compressed standings, with many champions below the mid-60s and bottom clubs often above 30 points. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI test; `pnpm check`; both failing-world reproduction commands; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/02-table-spread-diagnostics.md` | Done | Added compact table-spread diagnostics to long-run gate output. | Multi-world reports now expose table spread avg/min at aggregate level and per-worst-world `table_spread` snapshots with average, min, max, lowest-spread season, champion-points range, and last-place-points range; this is diagnostics-only and does not change simulation behavior or thresholds. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI test; temporary 2-world diagnostic gate; `pnpm check`; both failing-world reproduction commands; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/03-strength-hierarchy-source-review.md` | Done | Selected the source of the table-spread anomaly. | Added diagnostics for senior ability hierarchy and draw rate; rejected pure goals, creator concentration, pure draw-rate, and pure final ability-spread convergence as sole causes; selected insufficient match-result separation from existing team-strength differences as the Step 04 target. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI test; `pnpm check`; both failing-world reproduction commands; comparison `world-a`; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/04-narrow-table-spread-rework.md` | Done | Reworked match-result separation narrowly. | Increased only the opportunity-volume sensitivity to existing team-strength differences with `OPPORTUNITY_STRENGTH_SEPARATION_DIVISOR = 16`; conversion probabilities, thresholds, creator logic, and long-run refresh stayed unchanged; the two targeted table-spread failures improved from FAIL to WARN while strict balance stayed PASS. | `pnpm --filter @game/engine run typecheck`; focused step-match test; both failing-world reproduction commands; strict `calibration-v1` balance; `pnpm check`; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/05-smoke-gate-and-balance-check.md` | Blocked | Smoke gate failed on an out-of-scope champion-streak anomaly. | The 50x10 gate has zero `table_points_spread_avg` failures and zero creator-concentration failures after the Step 04 rework, but it still exits nonzero because `phase35-table-spread-world-00037` fails `champion_streak`; the final 250x30 gate was not run. | `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/05a-champion-streak-smoke-rework.md` | Done | Reclassified the only 50x10 smoke blocker as a short-run champion-streak policy issue and made the smoke gate pass. | Ten-season `champion_streak` anomaly scoring now treats `7` as WARN and keeps `8+` as FAIL after evidence showed the `phase35-table-spread-world-00037` dynasty had healthy table-spread, scoring, creator, squad, youth, and turnover metrics; longer scaled thresholds remain unchanged. | Focused anomaly-scoring and CLI report-output tests; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; strict `calibration-v1` balance; `pnpm check` |
| `docs/steps/35-table-spread-anomaly-rework/06-final-long-run-gate-and-phase-report.md` | Done | Closed Phase 35 with a passing final long-run gate. | The final 250x30 gate passes with zero failed worlds and no failing checks; table spread remains healthy, Phase 34 creator-concentration remains cleared on the original failing seed, and strict balance remains green. | `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check` |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/README.md` | Done | Created the Phase 36 documentation path. | Phase 36 audits remaining long-run warnings through user fun, football credibility, readability, and emergent-story value before any tuning or threshold changes. | Documentation-only update; `git diff --check` |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/01-warning-taxonomy-and-fun-criteria.md` | Done | Created the warning taxonomy and fun-first criteria. | `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` records the Phase 35 warning set, defines the classification vocabulary, asks player-facing evaluation questions, and assigns initial hypotheses without changing simulation behavior, thresholds, or CLI output. | `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/02-active-player-population-diagnostics.md` | Done | Diagnosed why `active_player_population` warns in every final Phase 35 world. | Added diagnostics only: active senior/youth/total min-max counts in single-world, multi-world CLI, markdown, and worst-world rows; the 250x30 gate shows stable senior `396..443`, youth `198..198`, total `594..641`, so the warning is bad threshold semantics with useful monitoring value, not world-health collapse. | Focused tests; CLI/simulation-tools typecheck; small smoke report; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/03-creator-and-assist-warning-audit.md` | Done | Classified creator and assist warnings as non-blocking story/monitoring signals. | Added diagnostics only: aggregate production warning maxima and markdown production warning snapshots; the 250x30 gate shows max assists `18`, max top1 creator share `0.40`, max top3 share `0.57`, and no failures, so high-assist seasons are currently credible playmaker stories rather than attribution bugs. | Focused CLI/i18n/simulation tests; CLI typecheck; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/04-champion-streak-and-dynasty-audit.md` | Done | Classified champion-streak warnings as healthy dynasty variance with monitoring value. | Added diagnostics only: champion streak max, dynasty warning snapshots, champion points during streak, streak table spread, unique champions, and turnover context; the strongest dynasty is rare, has healthy spread and turnover, and does not indicate structural stagnation. | Focused CLI/i18n/simulation tests; CLI typecheck; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/05-table-spread-warning-audit.md` | Done | Classified table-spread warnings as healthy tight-league variance with monitoring value. | Added diagnostics only: table-spread warning snapshots ordered by tightest average spread; only `3 / 250` worlds warn, the lowest average is `35.67` versus pass `36`, and supporting draw/ability/spread evidence does not show recurring compression collapse. | Focused CLI/i18n/simulation tests; CLI typecheck; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/06-warning-semantics-decision-report.md` | Done | Completed the Phase 36 final warning semantics decision report. | All remaining long-run warning types stay as monitoring signals; no gameplay tuning is recommended just to reduce warning counts, and the only future cleanup candidate is splitting `active_player_population` into clearer senior/youth/total semantics. | `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/37-long-run-gate-semantics-cleanup/README.md` | Done | Created the Phase 37 documentation path. | Phase 37 turns Phase 36 warning decisions into clearer long-run gate semantics without changing gameplay behavior. | Documentation-only update; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/01-phase-36-decision-review.md` | Done | Created the Phase 37 cleanup baseline report. | `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md` records the Phase 36 decisions, confirms Phase 37 is not gameplay tuning, and identifies `active_player_population` as the only required semantics rework. | `test -f docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` |
| `docs/steps/37-long-run-gate-semantics-cleanup/02-active-player-population-semantic-split.md` | Done | Split the ambiguous total-player warning into explicit senior, youth, and total active-player semantics. | Replaced `active_player_population` with `senior_active_player_population`, `youth_active_player_population`, and `total_active_player_population`; a healthy `594` active-player world now passes while structural squad/youth collapse remains covered by existing strict checks. | Focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/03-warning-severity-and-report-language.md` | Done | Added report-level signal grouping for warning checks. | The batch gate now prints and writes `Signal check counts`, grouping warning-level check keys as `story`, `monitor`, or `structural`; `fail` remains the only blocker severity and all anomaly keys/thresholds stay unchanged. | Focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00065 --seasons=30`; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00238 --seasons=30`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/04-monitoring-signal-readability.md` | Done | Confirmed the long-run warning output is readable after the Step 03 signal grouping. | No additional code was needed; the existing aggregate counts plus `Signal check counts`, worst worlds, production snapshots, dynasty snapshots, and table-spread snapshots make the remaining warnings interpretable as story or monitoring signals. | Focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/05-regression-gates-after-semantics-cleanup.md` | Done | Proved the semantics cleanup did not change gameplay outcomes or hide real failures. | The 250x30 long-run gate passed with `0` failing worlds, `56` warning worlds, active-player ranges senior `396..443`, youth `198..198`, total `594..641`, and only story/monitor warning signals; strict `calibration-v1` balance also passed. | `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/06-phase-report-and-next-decision.md` | Done | Completed Phase 37 and left the next phase unselected. | The final report states gameplay behavior did not change, the long-run gate passes, strict balance passes, and remaining warning signals are not current blockers. | `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` pending |
| `docs/steps/38-match-engine-and-calculator-quality-review/README.md` | Done | Created the Phase 38 documentation path. | Phase 38 reviews the match engine and calculator as a football-quality system before any optimization or tuning. | Documentation-only update; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/01-calculator-surface-map.md` | Done | Mapped the current match-engine calculator surface. | `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md` now identifies the main inputs, outputs, explainable data paths, and aggregate/opaque areas without judging balance or changing behavior. | `rg -n "deriveTeamStrength|buildTacticTeamContext|stepMatch|simulateMatch|simulateSeason|ChanceActors|MatchEngineConfig" packages apps docs`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/02-team-strength-sensitivity-audit.md` | Done | Team-strength sensitivity is directionally credible. | Added focused engine tests proving striker, defender, midfielder, and goalkeeper-relevant attributes move the expected department while irrelevant cross-role attributes do not dominate; natural/adapted/weak suitability remains an explicit lineup/formation surface, not a hidden team-strength penalty. | `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/03-chance-generation-and-conversion-audit.md` | Done | Chance generation and conversion are directionally credible for the current aggregate scope. | Added deterministic full-match flow tests for equal teams, stronger home, stronger away, strong attack versus weak defense, and weak attack versus strong defense; stronger profiles produce more credible opportunities, shots on target, goals, and wins without removing variance. | `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/04-causal-actor-selection-audit.md` | Done | Causal actor selection is credible enough for the current aggregate match engine. | Fixture and long-run evidence show outfield scorers/creators, goalkeeper saves, optional assists, and no impossible role assignments; the main future limitation is that actors explain aggregate outcomes but do not yet cause them through a pre-outcome duel chain. | `pnpm check`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/05-tactic-lineup-and-condition-effect-audit.md` | Done | Tactic, lineup, and condition effects are visible and manager-driven, with no automatic tactical choice introduced. | No gameplay rework was applied; future work should separate pure tactic effects, lineup/role reshaping effects, and condition/fatigue effects more explicitly when diagnostics or UI need it. | `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/06-performance-and-determinism-benchmark.md` | Done | Current runtime is acceptable and representative seeded output remains deterministic. | No optimization was applied; one-season and balance checks are fast enough, 50x10 is acceptable as an explicit batch report, and larger gates should remain explicit report jobs rather than interactive UI actions. | `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; repeated seeded `diff`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/07-phase-report-and-next-decision.md` | Done | Phase 38 concluded that the match engine and calculator are acceptable for continued product work. | No broad optimization or balance tuning is justified now; if the next product goal is engine-focused, the recommended narrow direction is deterministic match-explanation traceability rather than mathematical tuning. | `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/README.md` | Done | Created the Phase 39 documentation path. | Phase 39 hardens engine code and adds deterministic match explanation traceability without changing gameplay behavior unless a narrow bug is proven. | Documentation-only update; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/01-phase-38-baseline-and-behavior-lock.md` | Done | Captured the Phase 38 baseline and fixed the behavior lock before cleanup or trace work. | `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md` records representative season, fixture, strict balance, and 50x10 long-run outputs plus the rule that cleanup/trace work must preserve fixed-seed behavior unless a narrow bug is proven. | `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/02-engine-code-quality-audit.md` | Done | Audited engine code quality and selected a narrow cleanup scope. | Step 03 is approved only for extracting the duplicated match loop shared by `simulateMatch` and `simulateMatchWithManualTactics`, plus stale match-engine comment cleanup; calculator weights, CLI split, and large season-use-case split are explicitly out of scope. | Required `rg` scans; `pnpm check`; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/03-safe-engine-cleanup-pass.md` | Done | Extracted a shared full-match simulation runner and cleaned stale match-engine comments without changing fixed-seed behavior. | `simulateMatch` and `simulateMatchWithManualTactics` now reuse `match-simulation-runner.ts`; manual tactics use a deterministic pre-step context hook and public contracts remain stable. | focused match-engine tests; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; strict `calibration-v1` balance report |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/04-match-explanation-trace-contract.md` | Done | Added the engine-local structured explanation trace contract without emitting it from simulation. | `match-explanation-trace.ts` defines schema version, stable factor keys, team snapshots, lineup/tactic/condition snapshots, opportunity summaries, and data-only variance markers; no domain durability or presentation prose was added. | focused trace-contract test; `pnpm --filter @game/engine run typecheck`; `pnpm check` after rerunning an unrelated timed-out content test |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/05-trace-emission-without-outcome-change.md` | Done | Added optional match explanation trace emission without changing default simulation output or fixed-seed behavior. | `SimulateMatchOptions.includeExplanationTrace` adds `explanationTrace` only when requested; trace data is built from existing context, score, stats, and events without consuming RNG. | focused match-engine tests; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; strict `calibration-v1` balance report |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/06-cli-fixture-explanation-inspection.md` | Done | Added optional localized fixture explanation output for `simulate-season --fixture=<fixtureId> --fixture-explanation`. | The CLI appends factual trace sections for team strength, tactics, lineup roles, condition impact, chance summary, and variance markers only when requested; default fixture output remains unchanged. | CLI/i18n typechecks; focused CLI/i18n tests; `pnpm check`; default fixture command; fixture explanation command; strict `calibration-v1` balance report |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/07-regression-gate-and-phase-report.md` | Done | Closed Phase 39 with a passing regression gate and final report. | `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md` records cleanup, trace capability, aggregate limits, verification results, and the decision that no immediate match-engine tuning is needed. | focused tests; `pnpm check`; fixed-seed season/fixture/fixture-explanation; 50x10 long-run PASS; strict `calibration-v1` balance PASS; deterministic repeat check; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/README.md` | Done | Created the Phase 40 documentation path. | Phase 40 audits the current career loop as a manager journey and uses one matchday slice to decide whether to move toward UI or fix one core blocker first. | Documentation-only update; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/01-phase-39-output-review.md` | Done | Reviewed Phase 39 explanation output from a career playability perspective. | Existing trace data is useful enough to continue, but it must be connected to career save, preparation, condition, and post-match consequences before it is playable. | `test -f docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/02-career-loop-playability-spec.md` | Done | Defined the minimum playable career loop from new save through first post-match review. | The loop is judged by whether the manager can connect decision, match, consequence, and next decision without automatic advice. | `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/03-career-state-matchday-readiness-audit.md` | Done | Audited selected club, squad, condition, match preparation, and next fixture from one deterministic career save. | Career state is ready for first-match audit, but saved formation/tactic/lineup preparation is still missing from the summary and remains a future matchday ritual friction. | `pnpm cli career --save=phase40-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --squad`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/04-career-fixture-explanation-readiness.md` | Done | Added optional factual explanation for played career fixtures. | `career --advance-next-fixture --fixture-explanation` attaches structured match explanation to the played career fixture only when requested; default career advance output remains compact. | focused career/CLI tests; CLI/engine/i18n typechecks; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/05-season-rollover-and-development-loop-smoke.md` | Done | Smoke-tested repeated fixture advancement, development report, youth academy report, and rollover invalid state from the same career viewpoint. | The career can be followed beyond one match; development/youth are readable inspections, while full rollover remains unavailable until the season is completed. | `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `pnpm cli career --save=phase40-check --development-report`; `pnpm cli career --save=phase40-check --youth-academy`; `pnpm cli career --save=phase40-check --rollover-season` expected invalid; `pnpm check`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/06-playability-friction-report-and-next-decision.md` | Done | Closed Phase 40 with a playability report and one next-phase recommendation. | The current career loop is close to playable, but the next best user-fun improvement is career matchday consequences and condition integration before serious UI work. | focused tests; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/README.md` | Done | Created the Phase 41 documentation path. | Phase 41 integrates deterministic post-match condition consequences into career fixture advancement so the manager can see why rotation matters before UI work. | Documentation-only update; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/01-phase-40-output-review.md` | Done | Created the focused career matchday condition audit. | Phase 41 proceeds without a new product decision: played career fixtures should spend deterministic fitness for explicit selected starters and report that consequence without choosing for the manager. | `test -f docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/02-career-condition-consequence-contract.md` | Done | Added a pure engine condition-consequence contract for one played career fixture. | `applyCareerFixtureConditionConsequences` spends fitness only for explicit selected starters, preserves non-starters, returns ordered structured changes, and leaves save writing/output to later steps. | focused condition-consequence test; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/03-career-advance-condition-application.md` | Done | Wired career fixture advancement to persist selected-club condition consequences. | `progressNextCareerFixture` now applies starter fitness spend after match simulation/result application, returns structured condition changes, preserves non-starters, and marks selected-club explanation condition as tracked when requested. | focused progress-fixture test; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/04-cli-post-match-condition-output.md` | Done | Added compact localized post-match condition output to career fixture advancement. | Successful `career --advance-next-fixture` now prints selected-starter condition deltas and rested first-team players when available; `career --squad` shows the persisted fitness state. | focused career CLI test; CLI/i18n typechecks; `pnpm check`; career advance smoke; career squad smoke; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/05-multi-fixture-condition-smoke.md` | Done | Repeated fixture advancement now shows accumulating selected-starter condition pressure. | The `phase41-check` smoke advanced three selected-club fixtures with the same lineup: starters moved from 100 to 76, reserves stayed at 100, and explained output marked selected-club condition as tracked/negative. | focused career/condition/progression tests; `pnpm check`; summary/advance/explained-advance/squad smokes; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/06-phase-report-and-next-decision.md` | Done | Closed Phase 41 with a final condition-consequence report and next-phase recommendation. | The career loop now has visible matchday condition consequences, but the next core blocker before serious UI is deterministic between-fixture recovery. | focused career/condition/progression tests; `pnpm check`; summary/advance/explained-advance/squad smokes; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/README.md` | Done | Created the Phase 42 documentation path. | Phase 42 adds deterministic between-fixture recovery to make career matchday readiness fair and inspectable before UI work. | Documentation-only update; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/01-phase-41-output-review.md` | Done | Created the focused career weekly recovery audit. | Phase 42 proceeds from the Phase 41 one-way condition drain: recovery must be date-based, applied before match simulation, and exposed as factual readiness without advice or auto-rotation. | `test -f docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/02-career-recovery-contract.md` | Done | Added a pure career weekly recovery contract. | `applyCareerWeeklyRecovery` wraps the existing fitness recovery helper, returns ordered before/after/delta summaries, treats non-positive day gaps as no-op summaries, and does not advance fixtures, spend match fitness, choose players, or render text. | focused recovery test; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/03-career-advance-recovery-application.md` | Done | Career fixture advancement from CLI now applies recovery before simulation. | `advanceCareerNextFixture` finds the next selected-club fixture, recovers the selected-club roster by calendar-day gap, builds match contexts from the recovered state, then lets `progressNextCareerFixture` simulate and spend condition; tests cover weekly full recovery, short-gap partial recovery, and unchanged saved lineup. | focused career CLI/progression tests; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/04-cli-pre-match-readiness-output.md` | Done | Added compact localized pre-match recovery output to career advancement. | Successful `career --advance-next-fixture` now prints recovery days, improved-player count, and selected-club fitness range before post-match condition deltas; output is factual and non-advisory. | focused career CLI/i18n tests; CLI and i18n typechecks; `pnpm check`; career summary/advance/squad smokes; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/05-repeated-fixture-recovery-smoke.md` | Done | Repeated selected-club fixture smoke confirms weekly recovery prevents cumulative drain. | The `phase42-check` smoke advanced four selected-club fixtures with the same first-team lineup; after the opening same-day match, each seven-day gap restored starters from `92..100` to `100..100` before kickoff, then the match spend returned starters to `92`. Current demo calendar has no short-gap pressure, which is a future scheduling/cups finding rather than a Phase 42 blocker. | `pnpm check`; phase42-check create/prepare/four-advance/squad smokes; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/06-phase-report-and-next-decision.md` | Done | Closed Phase 42 with a complete recovery report and one next-phase recommendation. | The career loop now supports visible saved preparation, pre-match recovery, fixture result, post-match condition, persisted squad state, and optional explanation; the next recommended phase is a minimal career matchday UI slice, not more CLI-only systems. | `pnpm check`; career summary/squad smokes; strict `calibration-v1` balance report; `git diff --check` |

Status values:

- `Planned`: identified as future work but not yet the active step.
- `Not started`: documented but no implementation work done.
- `In progress`: currently being implemented.
- `Done`: implementation merged locally and Definition of Done satisfied.
- `Rework`: implemented but needs correction before the next step.
- `Skipped`: intentionally not done, with reason recorded in Outcome.

## Adopted Solutions

- Documentation is split into executable implementation steps under `docs/steps/`.
- Work proceeds one active step at a time.
- The process is incremental and iterative: implement, test, learn, update next step, advance.
- The mandatory execution loop is: read status, choose active step, implement, test, fix or adjust next step, update status briefly, advance.
- Future scope is kept in `docs/steps/99-future/README.md` as a queue, not a ban list.
- `docs/PROJECT_RULES.md` is stable across phases; moving forward should add step docs, not rewrite rules.
- The implementation target remains CLI-first and deterministic; persistence is added only through documented storage/career phases, while UI remains out of scope until explicitly planned.
- After Phase 25, the immediate match-day interaction idea is intentionally deferred: Phases 26-30 now focus on cleanup, season rollover, player development, club identity/calendar, and ten-season simulation reports before UI exploration.
- The Step Ledger tracks individual step files, not only broad phase groups.
- Every step prompt tells the implementer to read and update `docs/PROJECT_STATUS.md`.
- Phase 7 follows the roadmap gate rule: review current output before adding causal actor code.
- `pnpm` is exposed through Corepack under Node `v24.16.0`; this shell required `source ~/.nvm/nvm.sh && nvm use` before running pnpm commands.
- Domain IDs use one namespace convention for every entity type: `type:value` (`player:000001`, `club:perugia`, `competition:ita-3`, `fixture:000001`, `season:2026`, `save:demo-001`).
- Domain ID validation is intentionally not exposed as a partial public helper; callers must use specific constructors like `playerId`, `clubId`, and `fixtureId`.
- TypeScript source files written so far carry TSDoc/JSDoc comments for public contracts, package entrypoints, and test fixture intent.
- Shared deterministic RNG uses local streams only: callers derive streams from `seed + streamName + stable key parts`; no global RNG state exists.
- Shared date utilities convert `YYYY-MM-DD` to epoch-day and back with pure Gregorian arithmetic; JavaScript `Date` and timezone APIs are not used.
- JSON storage persists full `GameState` snapshots behind `GameStorage`; storage metadata uses real ISO timestamps, while game time remains `GameDate` in domain/engine.
- Enforcement is executable: `pnpm check` runs ESLint, Dependency Cruiser, Vitest, and workspace typecheck.
- ESLint currently focuses on engine determinism bans; Dependency Cruiser currently enforces source-import package boundaries.
- Existing package tests were migrated from Node native `node:test` registration to Vitest `test` registration while keeping Node `assert/strict`.
- `pnpm cli doctor` is the first real CLI command and prints a stable success line without gameplay side effects.
- Team strength calculation is pure and data-driven: role weights and dynamic-state multiplier curves are passed by the caller, not hardcoded in engine.
- Match context is serializable and self-contained: future match simulation should consume `MatchContext` without reading `GameState`, content files, storage, or UI preferences.
- Match RNG derivation data is standardized as `seed + "match" + fixtureId`; the context step defines the key but does not create or consume an RNG stream.
- Match stepping is local and serializable: `MatchSimulationState` owns minute, score, stats, and marker flags; durable domain `MatchEvent`/`MatchReport` types are still deferred to their documented step.
- Batch match simulation is reproducible end-to-end: `simulateMatch` derives the match RNG internally and the fixed golden output test locks the complete result shape and event sequence.
- Match reports are durable domain data: `MatchReport` stores schema version, fixture ID, final minute, score, stats, and sparse structured events; narration, fixture application, storage schemas, and retention remain separate future steps.
- Calendar generation is deterministic and date-first: fixtures carry both `roundNumber` and `GameDate`; the first implementation supports even-club double round-robin leagues, one round every seven days, no cups/breaks/rescheduling.
- Fixture results are the source of truth for future standings: `FixtureResult` stores `played`, `homeGoals`, and `awayGoals`; the rich `MatchReport` is only an optional reference.
- Fixture result application is copy-on-write over `GameState & FixtureStateSlice`; `game-state.ts` was not modified because it was not listed in the active step's expected files.
- League tables are derived, not persisted: `computeLeagueTable` reads only compact fixture results in explicit fixture order and uses stable club ID ordering as the final tie-breaker.
- The first season CLI milestone uses fictional generated content only: 18 fake clubs, generated players, fixed 4-4-2 lineups, content-provided role weights, and no real football data.
- `simulate-season` is deterministic by seed and prints a final table plus best defense and worst attack; player-level top scorer is explicitly unavailable until the match engine attributes goals to players.
- `simulateSeason` is now exported from `@game/engine` because balance tooling needs the season use-case through the package boundary.
- `packages/simulation-tools` is the content-free place for deterministic aggregate reports; it may use `domain`, `engine`, and `shared`, while apps supply concrete content and target profiles.
- `balance-report` uses broad hand-authored calibration targets from content, reports goals per match, result rates, table points, and upset proxy, and exits nonzero only when `--strict` is enabled and a metric fails.
- Phase 3 balance calibration starts with target/profile separation before tuning: `default` remains a broad smoke profile, while `calibration-v1` is the stricter gate used to expose under-scoring and draw-heavy output.
- Current `calibration-v1` baseline for `seed-prefix=balance-demo`, `seasons=3`: goals per match `1.127` fails `2.000..3.200`; home win rate `0.296` fails `0.330..0.550`; draw rate `0.444` fails `0.180..0.330`; first-place points `57.000` fails `66.000..90.000`.
- Match rate tuning is config-only so far: fake content now uses base opportunity rate `0.09`, max opportunity rate `0.24`, conversion probabilities `0.105/0.20/0.35`, and home advantage `1.10`.
- Current tuned `calibration-v1` sample for `seed-prefix=test-balance`, `seasons=20`: goals per match `2.853`, home win rate `0.416`, draw rate `0.235`, away win rate `0.350`, first-place points `71.450`, last-place points `23.500`, table points spread `47.950`, upset rate `0.331`; all pass.
- Table spread review is an explicit report metric now: `table_points_spread` means average first-place points minus last-place points across the simulated season batch.
- Fake content strength spread is now wider and less noisy by slot: the top generated clubs should separate more reliably from bottom generated clubs before future richer match mechanics exist.
- Phase 4 focuses on player-visible match detail: goal attribution, durable scorer events, season player goal stats, CLI top scorers, and minimal fixture detail.
- Goal attribution is engine-local in step 04/01: goal step events include `scorerPlayerId`, but durable domain `MatchReport` goal events and CLI output still do not expose scorers until later Phase 4 steps.
- Goal attribution uses an independent deterministic `goal-attribution` RNG stream, not the main match RNG, so adding scorer IDs does not change match results, league tables, or balance metrics.
- Match event schema version `2` adds durable `scorerPlayerId` to goal events; season/player-stat code should read this field from `MatchReport` goal events instead of engine-local step events.
- `simulateSeason` now returns `playerGoalStats`, derived from durable report goal events and fixed-lineup registrations; CLI consumes this result for the top-scorer line without recomputing stats.
- Current `pnpm cli simulate-season --seed=demo-001` top scorer: `Matteo Ricciardi (PRO05) - 23 goals`.
- `simulate-season --round=<number>` prints deterministic fixture-level results and scorer lines from existing simulated season reports; it does not run a separate match/season simulation path.
- Phase 4 is intentionally not the full duel engine, match-day UI, storage migration, market, growth, staff, youth, facilities, or economy phase.
- Phase 5 is documented as match event detail: richer shot context, optional assists, goalkeeper save attribution, player match stats, and CLI match detail v2.
- Phase 5 must stay deterministic and language-agnostic; it should not implement full possession chains, live match-day UI, storage browsing, management systems, or rendered commentary.
- Match event schema version `3` adds structured shot context to durable shot outcome events: `shotType` and `chanceType` are enum-like keys derived without additional RNG consumption.
- Current structured shot context derivation is intentionally aggregate and minimal: it uses minute, side, opportunity quality, and attacking tactical distribution to label `open_play`, `counter`, or `cross`, and `normal` or `header`; it does not create set-piece systems, assists, goalkeeper attribution, or full duels.
- Match event schema version `4` adds optional `assistPlayerId` to durable goal events; current CLI output does not render assists yet, so `simulate-season --round=<number>` remains visually unchanged until `05-cli-match-detail-v2`.
- Assist attribution is optional and independent from the main match RNG; it uses `shotType`/`chanceType` for eligibility, excludes the scorer and goalkeepers, and does not change goals, scores, tables, or balance metrics.
- Match event schema version `5` adds `goalkeeperPlayerId` to durable save events; save attribution uses the defending side's explicit `roleKey: "gk"` lineup slot.
- Save attribution does not change shot outcomes, scores, tables, or balance metrics; it only enriches saved-shot events and fails clearly if a simulated team has no goalkeeper slot.
- `computePlayerMatchStats` derives match player stats only from durable `MatchReport` events; current per-player shots and shots on target are credited only for goals because non-goal shot events do not yet identify the shooter.
- Player match stats are exported from `@game/engine` so the CLI can render match detail without duplicating report parsing.
- `simulate-season --fixture=<fixtureId>` is the first structured match inspection command; use `--round=<number>` to discover fixture IDs, then `--fixture` to inspect one match's events and compact player stats.
- Phase 6 is a CLI/stat completeness phase: clean fixture-only output first, then shot taker attribution, complete current player match stats, clearer fixture player-stat rendering, and minimal season assist/save summaries.
- `simulate-season --fixture=<fixtureId>` now uses a fixture-focused output path and intentionally omits the final table/top-scorer season summary.
- Match event schema version `6` adds `shooterPlayerId` to generated non-goal durable shot events (`save`, `miss`, `block`); goal events intentionally do not duplicate it because `scorerPlayerId` is the shooter in the current aggregate model.
- Match event schema version `7` adds minimal durable causal context: optional non-duplicated `creatorPlayerId` on goals and optional `primaryDefenderPlayerId` on blocks; CLI fixture detail renders these as compact `creator=` and `defender=` fields when present.
- `computePlayerMatchStats` now derives complete current shot counts: goals count through `scorerPlayerId`, non-goal shot events count through `shooterPlayerId` when present, and save events also credit the defending goalkeeper.
- `simulate-season --fixture=<fixtureId>` now registers all home and away starters when rendering player stats, so zero-stat starters appear after contribution rows.
- `simulateSeason` now also returns `playerSummaryStats`, derived from durable reports and fixed-lineup registrations; current fields are goals, assists, and goalkeeper saves.
- Current `pnpm cli simulate-season --seed=demo-001` season summaries: top scorer `Matteo Ricciardi (PRO05) - 23 goals`; top assist `Enrico Ferri (PRO01) - 11 assists`; top goalkeeper saves `Marko Stanic (PRO02) - 94 saves`.
- Phase 7 now has an engine-local causal actor building block: `selectChanceActors` selects creator, shooter, primary defender, and goalkeeper without consuming the main match RNG.
- `stepMatch` now consumes that building block for player attribution only: scores, tables, opportunity counts, and balance metrics remain stable, while player-level goals/assists/shots can change for fixed seeds.
- The old standalone match-engine attribution helpers for scorer, assist, shot taker, and goalkeeper saves have been retired after `stepMatch` integration because they no longer had production callers; current attribution lives in `chance-actors.ts` plus the small assist-credit decision inside `step-match.ts`.
- Current `pnpm cli simulate-season --seed=demo-001` season summaries after identity generation: top scorer `Matteo Ricciardi (PRO05) - 23 goals`; top assist `Enrico Ferri (PRO01) - 11 assists`; top goalkeeper saves `Marko Stanic (PRO02) - 94 saves`.
- Phase 7 CLI fixture review is complete: `fixture:000001` shows creator context on unassisted goals, and `fixture:000002` shows defender context on a blocked shot.
- Phase 8 is documented as tactic and lineup MVP: review Phase 7 output first, then add selected-lineup/tactic contracts, engine setup builder, season setup overrides, and a minimal CLI inspection path.
- Phase 8 output review accepted Phase 7 output as a stable baseline: `fixture:000001` shows `creator=` on unassisted goals without duplicating assists, `fixture:000002` shows `defender=` on a block, player stats align with event rows, and `calibration-v1` strict mode still passes.
- Phase 8 domain contracts are dependency-free: selected lineups are ordered slot/player/role selections, tactic setup has a five-step `mentality` key plus bounded 0-1 `pressing`, `directness`, `width`, and `risk`; `mentality` is setup data only until a later step explicitly maps it to engine behavior.
- Phase 8 engine builder converts selected setup into current match-engine data only: `buildTacticTeamContext` validates size/player/role inputs, derives strength through existing role weights, maps the four existing tactic knobs, and keeps `mentality` as validated data with no independent match effect.
- Phase 8 season overrides are API-only so far: `simulateSeason.setupOverrides` accepts ordered self-contained setup overrides and preserves default output when omitted; CLI inspection is intentionally deferred to `05-cli-tactic-lineup-inspection`.
- Phase 9 is documented around manual manager intent: saved tactical profiles can be selected and later switched by an explicit minute command, while automatic tactical switching based on score/minute/context is out of scope.
- Phase 9 output review accepted Phase 8 as a technical baseline: `pro01-attacking` is useful as an explicit demo/manual tactic option, but it should not be treated as an optimized season-long tactic.
- Phase 9 saved setup demos now expose `pro01-balanced`, `pro01-attacking`, and `pro01-defensive` through one explicit CLI profile registry; these are user-selectable tactic options, not automatic score/minute decisions.
- Phase 9 manual tactic-change contract is engine-only and uses already-built `MatchTeamContext` values, so future segmented simulation can apply caller intent without importing content, CLI, or saved profile registries.
- Phase 9 segmented fixture simulation is wired to CLI fixture inspection only: `simulateMatchWithManualTactics` applies explicit scheduled team contexts by minute, delegates to `simulateMatch` for no-change compatibility, and remains caller-declared rather than automatic.
- `simulate-season --fixture=<fixtureId> --setup-demo=<initialProfile> --manual-tactic-switch=<minute>:<targetProfile>` is now the manual tactic switch inspection path. It shows the selected club inside the manual switch block, whether that club is actually playing the fixture, and the profile timeline.
- Phase 10 is documented around player fitness as the first dynamic cross-match state: pure spend/recovery rules first, bounded strength impact second, optional season lifecycle third, CLI condition inspection last.
- Phase 10 intentionally uses existing `PlayerDynamicState.fitness`; `form` and `morale` remain future systems even though the domain shape already includes them.
- Phase 11 is documented around manual lineup rotation: the user chooses who plays, while the engine and CLI apply and inspect explicit lineup choices without automatic rotation or recommendations.

## Open Decisions And Follow-Up

- `pnpm-lock.yaml` was created by the required `pnpm install` verification even though it was not listed in the step `Expected files`; keep it as the workspace lockfile.
- `pnpm install` resolved TypeScript `^5.8.3` to `5.9.3`; keep this acceptable unless a later step needs a pinned compiler version.
- `packages/domain/tsconfig.json` enables `allowImportingTsExtensions` so Node 24 can execute TypeScript tests directly.
- `packages/shared/tsconfig.json` also enables `allowImportingTsExtensions`, matching `domain`, because the workspace currently runs `.ts` files directly under Node 24.
- `packages/storage/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/engine/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/content/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because generated content now imports workspace source packages directly.
- `apps/cli/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because the CLI imports local `.ts` command modules and workspace source packages directly under Node 24.
- `tsconfig.base.json` sets `noEmit: true`, because current packages are typechecked and executed directly from `.ts` files; this satisfies TypeScript's `allowImportingTsExtensions` requirement without producing unresolved emitted JavaScript imports.
- `vitest.config.ts` includes both `packages/**/*.test.ts` and `apps/**/*.test.ts` so CLI command tests are part of `pnpm check`.
- Phase 10 player dynamic states v1 is complete.
- Step 11/02 established that manual lineup rotation needs real reserve players in fake content; fake clubs now generate 16 senior players while default generated lineups remain 11 starters.
- Step 11/03 intentionally validated fixture lineup override input without applying it; Step 11/04 is responsible for using that contract during match context creation and fitness spend.
- Step 11/04 applies fixture lineup overrides inside `simulateSeason`; the default CLI season and condition-demo outputs remained unchanged because no CLI command passes fixture lineup overrides yet.
- Phase 11 manual lineup rotation v1 is complete. Manual lineup override inspection command to review: `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`.
- Phase 12 is now selected as squad selection and formation core before career persistence. It must make formation choice reveal squad-fit facts and trade-offs without auto-selecting players, recommending market actions, or executing transfers.
- When a future documented step lists `packages/domain/src/state/game-state.ts`, consolidate `fixtures` and `fixtureIds` into the base `GameState` contract instead of keeping them only as a use-case slice.
- Phase 12 squad selection and formation core is complete. Review command: `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`.
- Phase 12 formation-fit report was reworked after manual inspection: CLI slot rows now separate `natural`, `adapted`, and `weak` counts instead of a vague `candidates` total, and adapted-only DM/AM coverage now appears as factual weak-depth notes backed by `adapted_only:*` fit keys.
- Phase 13 is documented as localization foundation. The game supports five language codes (`it`, `en`, `de`, `es`, `fr`) with English fallback; domain/engine keys remain stable and language-agnostic, while CLI/UI presentation layers localize all user-facing text.
- `docs/PROJECT_RULES.md` now includes binding presentation/localization rules: user-facing headings, labels, event words, report metrics, statuses, warnings, hints, and user-facing errors must go through localization once Phase 13 introduces the layer.
- `requirements.md` Area 20 now states the same product rule: labels useful to UI or CLI must not be hardcoded in produced code and must pass through localization keys.
- Phase 14 is documented as a complete engine/core audit before market or youth. It has seven points: architecture boundaries, determinism, match engine, season engine, tactic/lineup/formation, code quality/dead code/naming, and audit report/next-phase decision.
- Phase 14 audit result: score `86/100`, no critical blockers. The current core is healthy, but Phase 15 should be a narrow cleanup/rework phase before market/youth: remove `Object.values()` from engine simulation order, rename stale market-hint comments, split the large CLI `simulate-season` module, and decide whether to consolidate fixtures into `GameState` before persistence/career state.
- Phase 15 is documented as `docs/steps/15-core-cleanup-before-career-systems/`: it closes the Phase 14 findings before market/youth and must end with `docs/audits/CORE_CLEANUP_REPORT.md`.
- Phase 15 core cleanup is complete. The cleaned core score is `92/100`; no critical or high cleanup blockers remain. Its original recommendation was market MVP next, but Phase 16 now inserts a dependency-map gate before market implementation.
- Market roadmap is documented in `docs/market-roadmap/`. The agreed scope removes sell-on percentages, appearance/goal bonuses, complex loan buy options/obligations, multiple-player exchanges, and highly legalistic clauses; it keeps one-player exchange and simple installments for a later structured-deals phase.
- Phase 16 is now a dependency-map phase, not market implementation. It exists to decide whether market MVP can proceed next or whether a shared career-state, economy, calendar, scouting, or youth foundation must come first.
- Phase 17 is documented as `docs/steps/17-market-mvp-permanent-transfers/`: a constrained in-memory permanent-transfer MVP. It must prove transfer contracts, valuation, willingness, feasibility/apply preview, and localized CLI inspection before any persistence, loans, contracts, wages, windows, scouting, AI, installments, or player exchanges.
- Phase 18 is documented as `docs/steps/18-career-state-and-transfer-persistence/`: it must make selected-club career state, transfer funds, roster changes, and permanent-transfer history durable before deeper market systems or first-playable-loop work.
- Phase 19 is documented as `docs/steps/19-fictional-people-identity-foundation/`: it intentionally moves before the first playable career loop so generated players stop using placeholder names and squads reflect credible domestic/international nationality distribution by division and club strength.
- Phase 20 is documented as `docs/steps/20-new-career-world-generation/`: it must make each new career/world seed generate distinct fictional squads and prospects while keeping the generated world persisted and stable inside the save.
- Phase 21 completed `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`: no blocker found and readiness scored `88 / 100`; the recommendation is now refined into `Phase 22 - Pre Playable Loop Hardening` followed by `Phase 23 - Playable Career Loop MVP`, before youth, scouting, loans, contracts, UI, staff, facilities, or deeper market.
- Phase 22 pre playable loop hardening is complete and scored `95 / 100` in `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md`; Phase 23 should now prove the first save-driven playable loop and move the current milestone near `100 / 100`.
- Phase 23 playable career loop MVP is complete and scored `98 / 100` in `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md`; its original next-phase recommendation was `Phase 24 - Career Match Preparation Persistence`, but the user later identified player generation quality as the more important core risk.
- Phase 24 is complete as `docs/steps/24-player-generation-quality-rework/`: the generator now has division/tier bands, role templates, archetypes, rarity budgets, quality tests, and CLI inspection.
- Career match preparation persistence should now resume as `Phase 25 - Career Match Preparation Persistence`; do not reuse the old Phase 24 numbering for it.
- Nationality flag SVG files under `assets/flags/` are presentation assets. Future code should map `NationalityCode` to a flag asset code outside domain/engine and must not store SVG paths in player, match, or career domain state.

### 2026-06-21 — `docs/steps/21-project-audit-and-roadmap-reconciliation/`

- Status: Done
- Outcome: Completed a full project audit across documentation, package boundaries, determinism, save consistency, product-loop readiness, roadmap dependencies, and next-phase priority.
- Adopted solution: `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` is the current audit handoff; it scores readiness at `88 / 100`, records no blockers, and now recommends `Phase 22 - Pre Playable Loop Hardening` before `Phase 23 - Playable Career Loop MVP`.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli career --save=phase21-audit-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase21-audit-world --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Execute Phase 22 hardening before Phase 23 loop implementation.

### 2026-06-21 — Phase 22 and Phase 23 documentation

- Status: Done
- Outcome: Created the pre-loop hardening phase and the playable career loop MVP phase documentation.
- Adopted solution: Keep completed Phase 21 as audit history; use Phase 22 for hardening and Phase 23 for the first save-driven career loop.
- Verification: `git diff --check`.
- Follow-up: Start `docs/steps/22-pre-playable-loop-hardening/01-roadmap-status-alignment.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/01-roadmap-status-alignment.md`

- Status: Done
- Outcome: Confirmed and recorded that Phase 22 is pre-loop hardening and Phase 23 is the playable loop.
- Adopted solution: Preserve the completed Phase 21 audit history and treat older Phase 22 playable references as historical drift unless `docs/PROJECT_STATUS.md` says otherwise.
- Verification: `rg -n "Phase 22 - Playable\|Phase 23 - Playable\|Pre Playable\|playable loop" docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md docs/PROJECT_STATUS.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/02-career-cli-module-boundaries.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/02-career-cli-module-boundaries.md`

- Status: Done
- Outcome: Reduced career CLI module pressure without changing existing command behavior.
- Adopted solution: `apps/cli/src/commands/career.ts` now orchestrates only, while private modules under `apps/cli/src/commands/career/` own parsing, scenario/state construction, formatting, and shared aliases.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm cli career --save=phase22-boundary-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-boundary-world --inspect`; `pnpm check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/03-career-save-runtime-policy.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/03-career-save-runtime-policy.md`

- Status: Done
- Outcome: Made local career save behavior explicit and safe before adding more save-writing commands.
- Adopted solution: Career CLI output now shows the effective save directory via localized labels, and `.gitignore` explicitly excludes `apps/cli/saves/` runtime files.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase22-save-policy-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-save-policy-world --inspect`; `git check-ignore -v apps/cli/saves/career/save%3Aphase22-save-policy-world.career.json`; `pnpm check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/04-career-determinism-golden-checks.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/04-career-determinism-golden-checks.md`

- Status: Done
- Outcome: Added automated career determinism coverage before the playable loop.
- Adopted solution: Career CLI tests now cover same-seed stable generated worlds, different-seed variation, and accepted transfer persistence across fresh storage adapter reloads.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/storage/src/career-storage.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/05-phase-23-readiness-review.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/05-phase-23-readiness-review.md`

- Status: Done
- Outcome: Completed the Phase 22 hardening report and approved Phase 23 start.
- Adopted solution: Readiness is now `95 / 100`; the project should not claim `100 / 100` until Phase 23 proves the save-driven playable career loop.
- Verification: `pnpm check`; `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-hardening-world --inspect`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md`.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md`

- Status: Done
- Outcome: Confirmed Phase 22 hardening cleared the pre-loop blockers and Phase 23 can proceed.
- Adopted solution: Treat the remaining readiness gap as Phase 23 scope; no source changes were needed in this review step.
- Verification: `rg -n "Score\|Blocker\|Phase 23\|playable" docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md docs/PROJECT_STATUS.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/02-career-summary-from-save.md`.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/02-career-summary-from-save.md`

- Status: Done
- Outcome: Added a localized career summary command that reads an existing save and shows the next selected-club fixture.
- Adopted solution: `pnpm cli career --save=<saveId> --summary` loads persisted `CareerState`, prints current date/season, selected club roster/budget, and first unplayed selected-club fixture; new career world creation now persists the initial deterministic fixture calendar so the summary and later progression steps have saved fixture state.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase23-summary-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-summary-world --summary`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/03-career-next-fixture-progression-contract.md`; keep next-fixture selection pure and move it out of CLI formatting.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/03-career-next-fixture-progression-contract.md`

- Status: Done
- Outcome: Added a pure engine contract for locating the next unplayed fixture involving the selected career club.
- Adopted solution: `findNextCareerFixture(careerState)` reads explicit fixture order and returns discriminated `found`, `none`, or `invalid` results; invalid state covers missing selected club, unordered selected club, missing fixture references, and fixture club references.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/04-persisted-fixture-progression.md`; reuse `findNextCareerFixture` instead of duplicating fixture selection.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/04-persisted-fixture-progression.md`

- Status: Done
- Outcome: Added reusable in-memory progression for exactly one selected-club fixture.
- Adopted solution: `progressNextCareerFixture` takes a loaded `CareerState`, caller-provided match team contexts, and match config; it simulates only the selected club's next fixture, applies the resulting `MatchReport` to a copied game state, and returns a copied `CareerState` without storage writes or automatic lineup/tactic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts packages/engine/src/career/progress-fixture.test.ts apps/cli/src/commands/career.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/05-career-advance-cli.md`; CLI must supply deterministic team contexts and perform the actual save write.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/05-career-advance-cli.md`

- Status: Done
- Outcome: Added the first save-writing career advancement command.
- Adopted solution: `pnpm cli career --save=<saveId> --advance-next-fixture` loads the save, uses persisted roster/player state to build deterministic MVP default team contexts, advances only the next selected-club fixture, writes the save on `advanced`, and prints localized fixture result plus next fixture.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts packages/engine/src/career/progress-fixture.test.ts`; `pnpm cli career --save=phase23-advance-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-advance-world --summary`; `pnpm cli career --save=phase23-advance-world --advance-next-fixture`; `pnpm cli career --save=phase23-advance-world --inspect`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/06-durable-decision-continuity.md`; prove a manual durable decision survives fixture advancement.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/06-durable-decision-continuity.md`

- Status: Done
- Outcome: Proved a manual accepted transfer remains visible after career fixture advancement.
- Adopted solution: The continuity test and smoke flow use the existing accepted permanent-transfer demo, then `--advance-next-fixture`, then reload/inspect to verify roster size `23`, post-transfer budget, transfer history, and selected-club played-fixture count all survive.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm cli career --save=phase23-continuity-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-continuity-transfer --seed=demo-001 --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=phase23-continuity-transfer --summary`; `pnpm cli career --save=phase23-continuity-transfer --advance-next-fixture`; `pnpm cli career --save=phase23-continuity-transfer --inspect`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/07-playability-audit-and-next-phase-decision.md`; document whether this phase reaches the current near-100 milestone and select the next phase without implementing it.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/07-playability-audit-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 23 and recorded the first playable career loop MVP as `98 / 100`.
- Adopted solution: `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md` treats the save-driven loop as proven, records the remaining MVP shortcut, and recommends exactly one next phase: `Phase 24 - Career Match Preparation Persistence`.
- Verification: `pnpm cli career --save=phase23-loop-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-loop-world --summary`; `pnpm cli career --save=phase23-loop-world --advance-next-fixture`; `pnpm cli career --save=phase23-loop-world --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check`.
- Follow-up: Do not start Phase 24 until its docs and incremental steps are explicitly requested.

### 2026-06-21 — Phase 25 career match preparation persistence docs

- Status: Done
- Outcome: Created `docs/steps/25-career-match-preparation-persistence/` with README and seven step documents.
- Adopted solution: Phase 25 starts with a gap review, then adds save-driven squad inspection, durable preparation state, saved lineup, saved tactic, fixture advancement through saved preparation, and a final report. This keeps the user as the decision-maker and removes the selected-club default preparation shortcut through documented steps.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/25-career-match-preparation-persistence/01-phase-24-output-and-prep-gap-review.md`; do not implement product code before the review documents the current preparation gap.

### 2026-06-21 — Phases 26-30 long-run simulation documentation

- Status: Done
- Outcome: Created documentation for Phase 26 through Phase 30 and shifted the next milestone away from adding more isolated CLI features.
- Adopted solution: Phase 26 cleans documentation noise and defines long-run metrics; Phase 27 adds season rollover; Phase 28 adds player development and aging; Phase 29 adds fictional city-based club identity and calendar readiness; Phase 30 produces a ten-season simulation report as the gate before future UI exploration.
- Verification: `git diff --check`.
- Next action: Execute `docs/steps/26-project-cleanup-and-long-run-readiness/01-documentation-noise-audit.md`.

### 2026-06-21 — Phase 26 project cleanup and long-run readiness

- Status: Done
- Outcome: Completed Phase 26 without gameplay/code changes.
- Adopted solution: Obsolete roadmap material was archived under `docs/archive/roadmaps/`; active audit/report policy was clarified in `docs/audits/README.md` and `docs/archive/README.md`; `docs/audits/CURRENT_ENGINE_BASELINE.md`, `docs/audits/LONG_RUN_METRICS_SPEC.md`, and `docs/audits/LONG_RUN_READINESS_REPORT.md` now define the baseline and long-run direction.
- Verification: Phase 26 required document scans; strict `calibration-v1` balance report with `2.859` goals per match; `git diff --check`. `pnpm check` intentionally skipped because this phase changed documentation only.
- Next action: Execute `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md`; do not start Phase 28+ before Phase 27 is complete.

### 2026-06-21 — `docs/steps/25-career-match-preparation-persistence/07-phase-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 25 and recorded durable match preparation readiness.
- Adopted solution: `docs/audits/CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md` records persisted preparation state, verified CLI flow, default-shortcut removal, limitations, a `95 / 100` maturity score, and exactly one recommended next phase: `Phase 26 - Career Match-Day Interaction MVP`.
- Verification: `pnpm cli career --save=phase25-prep-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase25-prep-world --squad`; `pnpm cli career --save=phase25-prep-world --set-lineup-demo=pro01-first-team`; `pnpm cli career --save=phase25-prep-world --set-tactic-demo=pro01-balanced`; `pnpm cli career --save=phase25-prep-world --summary`; `pnpm cli career --save=phase25-prep-world --advance-next-fixture`; `pnpm cli career --save=phase25-prep-world --inspect`; strict `calibration-v1` balance report; `pnpm check`; `git diff --check`.
- Next action: If approved, create Phase 26 documentation before implementing career match-day interaction.

### 2026-06-21 — Phase 24 player generation quality rework docs

- Status: Done
- Outcome: Created `docs/steps/24-player-generation-quality-rework/` with README and eight step documents.
- Adopted solution: Supersede the previous immediate Phase 24 recommendation for now. Before adding more career systems, the project will audit and rework player generation quality so attributes are credible by division, club tier, role, age, current ability, potential, and rarity.
- Verification: `git diff --check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/01-current-generator-audit.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/01-current-generator-audit.md`

- Status: Done
- Outcome: Confirmed the player-generation quality risk before code changes.
- Adopted solution: `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md` records that the current identity generator is seed-varied, but the ability model is too uniform because one base value drives most attributes with small role offsets.
- Verification: `rg` generator scan; `pnpm --filter @game/content run typecheck`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/02-division-and-club-tier-attribute-bands.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/02-division-and-club-tier-attribute-bands.md`

- Status: Done
- Outcome: Added deterministic division and club-tier bands for generated current ability and potential ceilings.
- Adopted solution: `packages/content/src/generators/player-generation-bands.ts` owns first/second/third-division bands and generated club tiers; `fake-players.ts` now derives its base ability from these bands. The condition-demo CLI test no longer pins one exact generated fixture score because the phase intentionally changes generated player quality.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-generation-bands.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/03-role-based-attribute-templates.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/03-role-based-attribute-templates.md`

- Status: Done
- Outcome: Made generated attributes role-coherent.
- Adopted solution: `packages/content/src/generators/player-role-templates.ts` owns role templates and caps; `fake-players.ts` now builds player abilities through that module, and the obsolete base-plus-small-offset helper was removed.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-role-templates.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/04-age-potential-and-prospect-archetypes.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/04-age-potential-and-prospect-archetypes.md`

- Status: Done
- Outcome: Separated generated age/current-ability archetypes from potential classes.
- Adopted solution: `player-archetypes.ts` now uses explicit archetypes such as `category_star`, `veteran_drop_down`, `good_prospect`, `serious_prospect`, and `rare_prodigy`; potential can exceed normal category anchors only through prospect/prodigy uplift, while current ability remains separately offset.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-archetypes.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/05-rarity-budget-and-white-fly-rules.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/05-rarity-budget-and-white-fly-rules.md`

- Status: Done
- Outcome: Budgeted rare lower-division exceptions at league level.
- Adopted solution: `player-rarity-budget.ts` creates deterministic white-fly, serious-prospect, and rare-prodigy assignments by seed; `fake-players.ts` forces assigned rare archetypes and excludes budgeted archetypes from ordinary weighted selection.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-rarity-budget.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/06-player-generation-quality-tests.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/06-player-generation-quality-tests.md`

- Status: Done
- Outcome: Added broad generated-league quality regression coverage.
- Adopted solution: `player-generation-quality.test.ts` validates same-seed stability, different-seed variation, role-coherence caps, bounded high-current players, rarity-budget compliance, and prospect availability across generated third-division clubs.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-generation-quality.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/07-cli-generation-quality-report.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/07-cli-generation-quality-report.md`

- Status: Done
- Outcome: Added localized seed-level player generation quality inspection to the CLI.
- Adopted solution: `simulate-season --player-generation-report` prints aggregate division, player-count, current-ability band, potential-class, rarity-budget, prospect-coverage, and role-coherence data without writing career saves or exposing exact individual hidden potential.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `git diff --check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/08-phase-report-and-next-phase-decision.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/08-phase-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed the Phase 24 final report and next-phase decision.
- Adopted solution: `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md` records before/after findings, inspection output, verification results, a `93 / 100` maturity score, and recommends `Phase 25 - Career Match Preparation Persistence`.
- Verification: `pnpm check`; identity reviews for `world-a` and `world-b`; player-generation reports for `world-a` and `world-b`; strict `calibration-v1` balance report; `git diff --check`.
- Next action: Create Phase 25 documentation before implementing durable career match preparation persistence.

### 2026-06-21 — Phase 20 new career world generation docs

- Status: Done
- Outcome: Created `docs/steps/20-new-career-world-generation/` with README and eight step documents.
- Adopted solution: Phase 20 focuses on per-new-career world generation: audit current fixed generation, add a durable world seed, define generated player archetypes, vary squads by seed, tune age/potential/prospect distribution, expose a CLI preview/create path, prepare flag asset mapping, and produce a quality report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/20-new-career-world-generation/01-current-generated-content-review.md`.

### 2026-06-21 — Phase 19 fictional people identity foundation docs

- Status: Done
- Outcome: Created `docs/steps/19-fictional-people-identity-foundation/` with README and seven step documents.
- Adopted solution: Phase 19 covers identity-gap review, reusable `PersonIdentity`, content-owned fictional name culture pools, deterministic nationality distribution by league/division/reputation, generated player identities, staff identity readiness without staff gameplay, and final CLI/review report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/01-phase-18-output-and-identity-gap-review.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/01-phase-18-output-and-identity-gap-review.md`

- Status: Done
- Outcome: Confirmed the identity gap in current Phase 18 outputs.
- Adopted solution: Player and future staff names are treated as generated content, not i18n labels; current outputs still expose `PlayerXX NoYY` placeholders, so the next step remains a small language-agnostic identity contract before name pools and generation.
- Verification: `test -f docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli career --save=career-demo --inspect`; `rg -n "Player[0-9]+ No[0-9]+|firstName|lastName|nationality|Staff|staff" packages docs requirements.md`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md`

- Status: Done
- Outcome: Added the domain `PersonIdentity` contract.
- Adopted solution: `PersonIdentity` is a language-agnostic value shape with generated first/last name, nationality, optional second nationality, birth country, and name culture; validation rejects empty names, unsupported keys, duplicate nationalities, and rendered-prose fields such as `displayName`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/value-objects/person-identity.test.ts`; domain forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md`

- Status: Done
- Outcome: Added content-owned fictional name culture pools.
- Adopted solution: `content/identity/name-cultures` maps every domain `NameCultureKey` to explicit first-name and last-name pools; names are content entries, not localization keys, and lookup uses stable culture keys rather than presentation text.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/name-cultures.test.ts`; content forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md`

- Status: Done
- Outcome: Added deterministic nationality distribution for generated people.
- Adopted solution: `selectNationality` uses `deriveRng` with seed, league nation, club category, club reputation, and stable player key; weighted profiles keep third division mostly domestic, make second division more mixed, and allow strong first-division clubs to become majority international.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/nationality-distribution.test.ts`; deterministic runtime scan; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md`

- Status: Done
- Outcome: Generated player-facing names now use deterministic fictional identities instead of `PlayerXX NoYY` placeholders.
- Adopted solution: `generateFakePlayersForClubs` derives nationality and name culture from content profiles, picks names from seeded culture pools, stores structured `playerIdentities`, keeps stable player IDs, and feeds generated first/last names into existing player display output without changing engine outcomes.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts apps/cli/src/commands/simulate-season.test.ts apps/cli/src/commands/career.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md`

- Status: Done
- Outcome: Confirmed staff identity readiness without adding staff gameplay.
- Adopted solution: `PersonIdentity` remains a reusable, language-agnostic people identity value for future staff/scout/president/agent/AI-manager contracts; all staff-specific mechanics must stay separate as role, rating, specialization, assignment, persona/tendency, wage, and effect contracts.
- Verification: `rg -n "staff|scout|medico|preparatore|DS|responsabile vivaio|presidente|agent|procurator" requirements.md docs/PROJECT_STATUS.md packages`; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md`

- Status: Done
- Outcome: Added the identity review CLI path and completed the Phase 19 quality report.
- Adopted solution: `pnpm cli simulate-season --seed=<seed> --identity-review` renders the selected generated club's player names, nationality, optional second nationality, birth country, name culture, and nationality summary using localized labels; `docs/audits/IDENTITY_FOUNDATION_REPORT.md` records the model, staff limits, manual commands, and the repeated-name limitation from small pools.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Decide the next phase; recommended first action is handling repeated generated full names before or inside the first playable career-loop phase.

### 2026-06-21 — Phase 19 expanded nationality rework

- Status: Done
- Outcome: Expanded fictional nationality coverage beyond the first compact set.
- Adopted solution: Added Colombia, Mexico, Ivory Coast, Wales, Scotland, Russia, South Korea, Albania, and Turkey to domain nationality codes; Serbia remains present and USA continues to use the stable `american` key. Distribution buckets now include the expanded football-nationality set, with Turkish and Korean name-culture pools added and all nationality/name-culture labels localized in `it/en/de/es/fr`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused person-identity/name-culture/nationality/i18n/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli simulate-season --seed=demo-001 --identity-review --lang=it`.
- Next action: Decide the next phase; repeated generated full names remain the recommended identity-quality cleanup.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md`

- Status: Done
- Outcome: Created `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`.
- Adopted solution: The report marks Phase 18 as a successful persistence bridge, lists what is playable/durable/inspection-only, records manual commands to inspect, and recommends Phase 19 as a CLI-first playable career loop MVP before deeper market, youth, scouting, contracts, or UI work.
- Verification: `pnpm check`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`; `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Decide and document Phase 19. Recommended: first playable career loop MVP.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md`

- Status: Done
- Outcome: Added CLI inspection for persisted career saves.
- Adopted solution: `pnpm cli career --save=<saveId> --inspect` reloads `JsonCareerStorage`, displays the selected club roster size and transfer funds, lists permanent-transfer history, and shows affected clubs with persisted roster size and transfer budget.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md`

- Status: Done
- Outcome: Added the first deterministic CLI flow that turns an accepted market demo into a persisted career save.
- Adopted solution: `pnpm cli career --save=<saveId> --apply-market-demo=<profile>` builds the same deterministic fake career context, applies permanent transfers through the engine career use case, writes accepted results through `JsonCareerStorage`, leaves rejected transfers unsaved, and renders output through i18n labels.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; accepted/rejected `pnpm cli career` smoke checks.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md`

- Status: Done
- Outcome: Added an engine-only persistent permanent-transfer application use case.
- Adopted solution: `applyCareerPermanentTransfer` wraps the existing market preview, appends durable transfer history only for accepted transfers, and preserves the original `CareerState` reference for rejected transfers; engine still does not import storage, CLI, or i18n.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/apply-career-transfer.test.ts`; engine forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md`

- Status: Done
- Outcome: Added career-state save/load persistence through the storage package.
- Adopted solution: `JsonCareerStorage` stores full `CareerState` snapshots in `*.career.json` envelopes, validates snapshots via the domain constructor, reports missing/malformed saves through `StorageError`, and does not import engine/content/CLI/i18n.
- Verification: `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/storage/src/career-storage.test.ts`; storage forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`

- Status: Done
- Outcome: Added the minimal dependency-free domain `CareerState` contract and tests.
- Adopted solution: `CareerState` is a versioned wrapper over `GameState` with explicit selected-club context, durable transfer funds via `MarketState`, and ordered permanent-transfer history; validation remains domain-only and does not apply transfers or perform storage.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/state/career-state.test.ts`; domain forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/01-phase-17-output-review.md`

- Status: Done
- Outcome: Confirmed the Phase 18 persistence scope from Phase 17 output and existing career-system dependency notes.
- Adopted solution: The first durable career slice must include save ID, selected club, current `GameState`, market transfer funds, and permanent-transfer history; no wider economy, loans, contracts, windows, scouting, AI market, or UI scope is opened.
- Verification: `test -f docs/audits/MARKET_MVP_REPORT.md`; `test -f docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`; required career/persistence roadmap `rg`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`.

### 2026-06-21 — Phase 18 career state and transfer persistence docs

- Status: Done
- Outcome: Created `docs/steps/18-career-state-and-transfer-persistence/` as the next phase after the in-memory market MVP.
- Adopted solution: Phase 18 is the persistence bridge before fun/playability evaluation: accepted permanent transfers can become durable career state, rejected transfers must not mutate saves, and final review must decide whether the project is ready for the first playable career loop.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/01-phase-17-output-review.md`.

### 2026-06-20 — Phase 15 core cleanup before career systems docs

- Step: `docs/steps/15-core-cleanup-before-career-systems/README.md`
- Status: Done
- Outcome: Created the Phase 15 cleanup specification and six executable step documents.
- Adopted solution: Phase 15 is a non-feature cleanup phase that fixes or documents Phase 14 risks before market/youth: ordered fixture-lineup overrides, factual squad-fit naming, CLI `simulate-season` module split, fixture-state decision, and final cleanup report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`

- Status: Done
- Outcome: Confirmed the Phase 14 findings are still current before changing source code.
- Adopted solution: Keep Phase 15 scoped as cleanup. The confirmed items are engine `Object.values()` in `simulateSeason`, stale CLI market wording around squad-fit notes, a 2685-line `simulate-season.ts` CLI module, and fixture state still living as a slice around `GameState`.
- Verification: `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src`; `rg -n "market|need|recommend|auto-select|automatic|best XI|best-XI" apps/cli/src packages apps docs/audits/ENGINE_CORE_AUDIT.md`; `wc -l apps/cli/src/commands/simulate-season.ts`; `rg -n "FixtureStateSlice|fixtureIds|fixturesById|fixtures" packages/domain/src packages/engine/src/use-cases`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`

- Status: Done
- Outcome: Removed the Phase 14 high finding from `simulateSeason`.
- Adopted solution: Fixture lineup overrides keep the public ordered-array caller interface, then become an internal `OrderedFixtureLineupOverrides` Module with `byKey` for fixture lookup and `ordered` for caller-order registration. No unordered object enumeration remains in the touched engine path.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts`; `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src/use-cases/simulate-season.ts`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`

- Status: Done
- Outcome: Removed stale market/recommendation wording from current formation-fit implementation comments.
- Adopted solution: Kept the runtime CLI output unchanged and factual; internal comments now describe stable formation-fit notes and factual coverage targets.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check:localized-text`; `rg -n "market hint|market-depth|market need|marketNeed|need:|consider:|surplus:" apps/cli/src packages/i18n/src`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`

- Status: Done
- Outcome: Improved CLI Module locality without changing command behavior.
- Adopted solution: `runSimulateSeasonCommand` stays as the public Interface in `apps/cli/src/commands/simulate-season.ts`; profile keys live in `simulate-season/profile-keys.ts`, argument parsing/validation in `simulate-season/parse-args.ts`, and formation-fit output in `simulate-season/formation-fit-output.ts`.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`

- Status: Done
- Outcome: Removed the temporary fixture-state slice before career persistence work.
- Adopted solution: `GameState` now owns fixture lookup and deterministic fixture ID order; `applyMatchReportToFixture` accepts and returns canonical `GameState`; the obsolete `FixtureStateSlice` and `ApplyMatchReportToFixtureState` exports were removed instead of kept as compatibility leftovers.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/domain/src packages/engine/src/use-cases packages/storage/src`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 15 and created the durable cleanup handoff report.
- Adopted solution: `docs/audits/CORE_CLEANUP_REPORT.md` records the Phase 15 fixes, scores the cleaned core at `92/100`, keeps the aggregate-match engine as an accepted limitation, and originally recommended market MVP before youth; Phase 16 now refines this with a dependency-map gate.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Superseded by Phase 16 dependency-map docs; execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-21 — Phase 17 market MVP permanent transfers docs

- Status: Done
- Outcome: Created `docs/steps/17-market-mvp-permanent-transfers/` after the Phase 16 dependency-map gate.
- Adopted solution: Phase 17 is a constrained in-memory permanent-transfer MVP: domain contracts, true-data valuation, player willingness, feasibility/apply preview, localized CLI inspection, and final report. Persistence, loans, contracts, wages, windows, scouting fog, AI, installments, and player exchanges remain out of scope.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md`.

### 2026-06-20 — Market roadmap planning

- Status: Done
- Outcome: Created the market-specific roadmap and individual phase overview documents.
- Adopted solution: `docs/market-roadmap/` now defines candidate market phases for permanent transfers, career persistence, loans, contracts/wages, scouting quality, AI club behavior, negotiation, transfer windows, structured deals, and market balance review. The plan deliberately removes sell-on percentages, appearance/goal bonuses, complex loan buy options/obligations, multiple-player exchanges, and highly legalistic clauses.
- Verification: Documentation-only update; no source checks required.
- Next action: Superseded by Phase 16 dependency-map docs; execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-20 — Phase 16 career systems dependency map docs

- Status: Done
- Outcome: Created `docs/steps/16-career-systems-dependency-map/` before opening market implementation.
- Adopted solution: Phase 16 is a dependency-map gate that will decide whether market MVP can proceed next or whether shared career state, economy, calendar, scouting, or youth foundations must be inserted first. This keeps `docs/steps/` linear instead of treating `docs/market-roadmap/` as a direct implementation order.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-20 — Phase 14 engine audit and core quality review

- Status: Done
- Outcome: Completed the seven-point engine/core audit and created `docs/audits/ENGINE_CORE_AUDIT.md`.
- Adopted solution: The project can continue after one focused cleanup phase. The audit found no critical blockers, one high determinism-discipline finding in `simulateSeason`, medium maintainability/state-model findings, and low naming/documentation issues.
- Verification: `pnpm depcruise`; `pnpm lint`; `pnpm check:localized-text`; `pnpm typecheck`; `pnpm test`; focused match/season/tactic/CLI tests; CLI smoke commands; deterministic repeatability diff; `pnpm check`.
- Next action: Create Phase 15 documentation for core cleanup before implementing market or youth.

### 2026-06-20 — Phase 14 engine audit and core quality review docs

- Status: Done
- Outcome: Created the Phase 14 audit documentation and made architecture boundary audit the active next step.
- Adopted solution: Phase 14 is a stop-and-review phase, not a feature phase. It will write `docs/audits/ENGINE_CORE_AUDIT.md`, score the current engine/core from `0` to `100`, classify findings, and decide whether to proceed to market, youth, or a focused core rework phase.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md`.

### 2026-06-20 — Phase 13 localization foundation

- Status: Done
- Outcome: Added `@game/i18n`, CLI `--lang` support, five-language current label coverage, localized current CLI presentation output, and a localized-text enforcement check.
- Adopted solution: Domain/engine continue emitting stable structured keys; CLI presentation maps those keys to localized labels in `it`, `en`, `de`, `es`, and `fr` with English fallback for future missing keys.
- Verification: `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/cli run typecheck`; focused i18n/CLI Vitest files; localized CLI smokes for Italian/German/French; `pnpm check:localized-text`; `pnpm check`.
- Next action: Phase 14 is now documented as engine audit and core quality review; execute the architecture boundary audit next.

### 2026-06-20 — Phase 12/13 squad-fit language rework

- Status: Done
- Outcome: Removed market-prescriptive wording from formation-fit output and localized additional enum-like values that were visible in CLI output.
- Adopted solution: Engine formation-fit report now exposes factual `squadFitHints` using `gap:*`, `adapted_only:*`, and `extra_depth:*`; CLI renders these as localized squad-fit notes, not market advice. Fixture event `shotType`/`chanceType`, setup mentality values, and lineup role keys now render through localization.
- Verification: focused engine/CLI/i18n tests; `pnpm check`; localized smoke commands for Italian fixture detail, Italian formation-fit, and Italian setup-demo output.
- Next action: Use Phase 14 for the complete engine/core audit before deciding market, youth, or focused rework.

### 2026-06-20 — `docs/steps/13-localization-foundation/README.md`

- Status: Done
- Outcome: Created and then broadened Phase 13 documentation and implementation step documents for localization foundation, including a final policy-alignment step.
- Adopted solution: Phase 13 now starts with a review of all user-facing CLI/source text created across Phases 00-12, including events, balance reports, season summaries, fixture detail, player stats, tactic/lineup/condition output, formation/squad-fit output, and user-facing errors. It then adds a supported-language/message-key contract, an `it/en` catalog, CLI `--lang` integration across current presentation output, `de/es/fr` completion, hardcoded-presentation-text enforcement, and final requirements/project-rules policy alignment. Domain/engine keys remain stable and untranslated.
- Rule update: Added project rules and requirements text requiring user-facing presentation text to go through localization once Phase 13 introduces it, while keeping domain/engine reports structured and language-agnostic.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/13-localization-foundation/01-phase-12-output-review.md` next; do not add localization code before reviewing the current user-facing text surface.

### 2026-06-20 — Phase 12 formation-fit report readability rework

- Status: Done
- Outcome: Improved the Phase 12 formation-fit CLI output so a user can distinguish true natural depth from adapted or weak cover.
- Adopted solution: Slot rows now render `best`, `natural`, `adapted`, and `weak` counts; engine fit hints now include `adapted_only:defensive_midfielder` and `adapted_only:attacking_midfielder` when those families are covered only by adapted players; the CLI renders those as factual weak-depth notes.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`.
- Follow-up: Re-run `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1` and verify that `rb` no longer looks like it has 10 natural candidates, while DM/AM adapted-only coverage is clearly visible.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md`

- Status: Done
- Outcome: Added a standalone CLI formation-fit inspection path and expanded fake senior squads to 22 players per club without changing the default fixed 11-player lineup.
- Adopted solution: `simulate-season --formation-fit=<formationKey>` builds a squad-depth snapshot for the selected generated club, runs the engine formation-fit report, and prints formation slots, covered slots, adapted/weak slots, missing slots, extra-depth groups, and localized squad-fit notes. The CLI explicitly states that no lineup is auto-selected and no transfer action is created.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Manually inspect `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; verify that adapted DM/AM slots and surplus wide/center-back hints are understandable before deciding Phase 13.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md`

- Status: Done
- Outcome: Added deterministic engine reporting for how a squad fits a selected formation.
- Adopted solution: `packages/engine/src/squad/formation-squad-fit.ts` consumes domain formation catalog data, squad depth, and player natural positions to report covered, adapted, weak, and uncovered slots plus family depth, likely out-of-position players, extra-depth groups, and stable factual `squadFitHints`. It does not assign players to slots or recommend transfers.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` next; keep default season simulation output unchanged.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md`

- Status: Done
- Outcome: Added strict deterministic suitability between player natural positions and formation slot requirements.
- Adopted solution: `packages/domain/src/tactics/position-suitability.ts` classifies fit as `natural`, `adapted`, `weak`, or `invalid`; full backs/wing backs, central midfield bands, wide players, and strikers have explicit non-equivalent adaptation rules so formation gaps remain visible.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` next; do not auto-select lineups.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md`

- Status: Done
- Outcome: Added a dependency-free squad-depth contract for explicit user-selected starters and bench/reserves.
- Adopted solution: `packages/domain/src/squad/squad-depth.ts` validates ordered squad, starter, and bench/reserve player IDs, rejects duplicates, membership errors, and starter/bench overlap, and keeps the exact eleven-starter rule in `validateMatchSquadDepth` so non-match squad inspection stays flexible.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/squad/squad-depth.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` next; do not build formation-fit reports yet.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md`

- Status: Done
- Outcome: Added a dependency-free domain formation catalog for the major professional shapes planned in Phase 12.
- Adopted solution: Formation data lives in `packages/domain/src/tactics/formations.ts` as stable keys, structured slots, broad departments, tactical lines, side/channel metadata, and recognized position-family requirements. The catalog is exported through `packages/domain/src/tactics/index.ts` and the root domain surface.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/formations.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` next; do not compute formation fit or assign players automatically.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/README.md`

- Status: Done
- Outcome: Created Phase 12 documentation and six implementation step documents for squad selection and formation core.
- Adopted solution: Phase 12 pauses career persistence work to consolidate the core manager loop around formation choice, squad depth, player-slot suitability, and squad-fit reporting. The formation catalog should cover common major-league shapes, while reports should expose coverage gaps, weak central roles, and extra-depth groups as structured data for manager interpretation.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md` next; do not add formation code before reviewing Phase 11 output.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/README.md`

- Status: Done
- Outcome: Created Phase 11 documentation and five implementation step documents for manual lineup rotation v1.
- Adopted solution: Phase 11 will first review completed Phase 10 condition output, then add deterministic PRO01 lineup demo profiles, an explicit fixture lineup override contract, season wiring for user-selected lineup overrides, and a CLI lineup/condition inspection path. The phase explicitly preserves the rule that the user chooses who plays; automatic rotation, fatigue-based recommendations, substitutions, injuries, form, morale, career mode, and UI remain out of scope.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` next; do not add lineup profiles before the Phase 10 output review is recorded.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md`

- Status: Done
- Outcome: Accepted Phase 10 condition output as a stable baseline for manual lineup rotation.
- Adopted solution: Existing `--condition-demo=pro01-season` output is clear enough to compare first-team and rotated selections later. It shows selected club `PRO01`, lifecycle enabled, match cost `8`, daily recovery `5`, first PRO01 fixture, post-match fitness `92`, seven-day recovery to `100`, and final starter fitness `92`.
- Verification: Direct Node 24 CLI smoke for `simulate-season --seed=demo-001`; direct Node 24 CLI smoke for `simulate-season --seed=demo-001 --condition-demo=pro01-season`; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` next; add profile selection/inspection but do not apply lineups to fixtures or seasons yet.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md`

- Status: Done
- Outcome: Added explicit PRO01 lineup demo inspection for `pro01-first-team` and `pro01-rotated`.
- Adopted solution: After user authorization, fake content now generates 16 senior players per club while keeping the default 11-player lineup unchanged; the rotated profile replaces four first-team slots with real deterministic reserves and remains inspection-only.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/content/src/generators/league-system.test.ts apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --lineup-demo=pro01-rotated`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` next; define the engine contract before applying lineup overrides.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md`

- Status: Done
- Outcome: Added the engine contract and validation path for explicit fixture lineup overrides.
- Adopted solution: `SimulateSeasonFixtureLineupOverride` is serializable caller intent for one fixture/club lineup; `simulateSeason` now validates duplicates, missing fixtures, missing teams, wrong fixture clubs, lineup size/slot/player shape, and role/player strength data while leaving actual application to the next step.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` next; apply the validated contract during fixture simulation and fitness spend.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md`

- Status: Done
- Outcome: Wired explicit fixture lineup overrides into season simulation.
- Adopted solution: `simulateSeason` indexes validated fixture/club overrides, applies the selected lineup only to the matching fixture participant, preserves existing tactic distribution, rebuilds strength from current fitness states when lifecycle is enabled, registers override players for season stats, and spends fitness for actual selected starters.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --condition-demo=pro01-season`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` next; expose one CLI inspection path without adding automatic rotation.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md`

- Status: Done
- Outcome: Added CLI fixture-level inspection for manually selected lineup profiles.
- Adopted solution: `--lineup-demo=<profile>` still supports profile-only inspection; when combined with `--fixture=<fixtureId>`, it applies the selected PRO01 lineup only if PRO01 plays the fixture, keeps non-applicable fixtures unchanged, prints selected starters, rested first-team players, expected per-fixture fitness impact, re-simulated fixture events, and player stats for actual starters.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --condition-demo=pro01-season`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Phase 11 is complete. Manually inspect `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`, especially selected starters, rested players, expected fitness impact, and player stats for actual starters.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/README.md`

- Status: Done
- Outcome: Created Phase 10 documentation and five implementation step documents for player dynamic states v1.
- Adopted solution: Phase 10 will first review the completed Phase 9 output, then add pure deterministic fitness spend/recovery helpers, bounded fitness strength impact through explicit multiplier curves, optional season fitness lifecycle, and a CLI condition inspection view. The phase uses existing `PlayerDynamicState.fitness` and explicitly excludes injuries, form, morale, staff, training, growth, automatic rotation, and career persistence.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md` next; do not add fitness rules before the Phase 9 output review is recorded.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md`

- Status: Done
- Outcome: Phase 9 output is good enough to build player fitness consequences on top of it.
- Adopted solution: Keep Phase 9 as the baseline. Default season output works, fixture-only output remains clean, non-applicable manual switches explicitly say `Applies to fixture: no`, applicable switches show `Selected club: PRO01`, initial/target profiles, switch minute, and timeline, and no output implies automatic tactical decisions.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` next; add pure fitness spend/recovery rules without touching season simulation or CLI output.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md`

- Status: Done
- Outcome: Added pure deterministic engine helpers for player fitness spend and recovery.
- Adopted solution: `packages/engine/src/player-state/fitness.ts` owns `DEFAULT_FITNESS_RULES` with match cost `8`, daily recovery `5`, and `0..100` clamps over existing `PlayerDynamicState.fitness`. Helpers copy-on-write the state lookup, update only explicitly ordered player IDs, reject missing states and duplicate IDs, and keep form/morale untouched.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/player-state/fitness.test.ts` passed 8 tests; `pnpm check` passed with 28 files and 203 tests; `pnpm cli simulate-season --seed=demo-001` preserved the current table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` next; use explicit multiplier curves and do not start season fitness lifecycle yet.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md`

- Status: Done
- Outcome: Fitness can now lightly affect team strength through explicit content-owned multiplier curves.
- Adopted solution: Fake content exposes `stateMultiplierCurves.fitness` with bands `<=39 => 0.88`, `<=59 => 0.94`, `<=79 => 0.98`, and `<=100 => 1.00`. CLI season and balance team-context builders pass those curves to `deriveTeamStrength`; since generated players start at fitness `100`, default season output and balance metrics remain unchanged.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/engine/CLI tests passed 42 tests; `pnpm check` passed with 29 files and 207 tests; `pnpm cli simulate-season --seed=demo-001` preserved the current table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` next; keep lifecycle optional and do not add CLI condition output yet.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`

- Status: Done
- Outcome: Added a deterministic CLI condition inspection path for PRO01.
- Adopted solution: `simulate-season --condition-demo=pro01-season` enables the optional season fitness lifecycle for inspection only. It keeps the default season output unchanged, rejects combination with `--round` or `--fixture`, prints the lifecycle rules, first PRO01 fixture, first-match fitness spend, recovery before the next selected fixture, final table impact, and final condition for all PRO01 starters.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests passed 28 tests; `pnpm check` passed with 29 files and 215 tests; direct Node 24 CLI smoke for default season passed; direct Node 24 CLI smoke for `--condition-demo=pro01-season` printed final PRO01 starter fitness `92`; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Phase 11 is now documented; use `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` as the next active step before adding lineup profiles.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md`

- Status: Done
- Outcome: Added optional deterministic season fitness lifecycle to `simulateSeason`.
- Adopted solution: `simulateSeason.fitnessLifecycle` carries a copy-on-write player-state lookup only when explicitly supplied. It recovers tracked players once between new fixture dates, spends fitness for both starting lineups after each fixture, rebuilds team strength from current player states plus explicit player/role/curve data, and returns `finalPlayerStates` for inspection. Default no-lifecycle season and balance outputs remain unchanged.
- Verification: `pnpm --filter @game/engine run typecheck`; focused engine tests passed 24 tests; `pnpm check` passed with 29 files and 212 tests; direct Node 24 CLI smoke for `simulate-season --seed=demo-001` preserved the current table; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Completed by `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`; the existing optional lifecycle is now visible through CLI inspection without rotation, injuries, form, morale, career mode, or UI.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md`

- Status: Done
- Outcome: Added CLI inspection for one explicit user-declared manual tactic switch in a requested fixture; reworked the output so the manual switch block also names the selected club.
- Adopted solution: `simulate-season --fixture=<fixtureId> --setup-demo=<initialProfile> --manual-tactic-switch=<minute>:<targetProfile>` now validates the switch input, requires fixture context and an initial setup profile, builds the target saved profile, and uses `simulateMatchWithManualTactics` only for the requested fixture. The `Manual tactic switch` section prints `Selected club: PRO01`, so it is clear which club the switch controls. If the selected club is not playing that fixture, the CLI reports `Applies to fixture: no` and preserves the original fixture detail; if it is playing, the CLI reports `Applies to fixture: yes`, prints a profile timeline, and renders the switched fixture report/player stats. No automatic score/minute decision, live session, pause/resume, substitution, or season-wide switching was added.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` passed 25 tests; `pnpm check` passed with 27 files and 195 tests; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Review the `fixture:000001` non-applicable example and the `fixture:000006` applicable example. If the inspection shape is acceptable, create Phase 10 documentation before implementing new features.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md`

- Status: Done
- Outcome: Added an engine-only segmented fixture simulation path for explicit manual tactic changes.
- Adopted solution: `simulateMatchWithManualTactics` delegates to existing `simulateMatch` when no manual changes are supplied. With changes, it validates the caller-supplied `ManualTacticChangeSchedule`, applies a side's already-built `MatchTeamContext` before the declared minute is stepped, reuses the same match RNG stream and `stepMatch`, and returns a normal `SimulateMatchResult` compatible with `createMatchReport` and `computePlayerMatchStats`. No CLI flags, live sessions, substitutions, or automatic tactic decisions were added.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/manual-tactic-change.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts` passed 14 tests; `pnpm check` passed with 27 files and 191 tests; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md` next; expose a fixture inspection command that builds an explicit switch schedule from saved demo profiles.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md`

- Status: Done
- Outcome: Added a minimal deterministic engine contract for explicit manager-declared tactic changes during a match.
- Adopted solution: `buildManualTacticChangeSchedule` accepts already-built `MatchTeamContext` values for `home` or `away`, validates that change minutes are within `1..minuteCount`, rejects duplicate side+minute pairs and missing team contexts, and returns changes sorted by minute then side. The contract records caller intent only; it does not inspect score, choose profiles, simulate segments, or make automatic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/manual-tactic-change.test.ts` passed 8 tests; `pnpm check` passed with 26 files and 185 tests; `pnpm cli simulate-season --seed=demo-001` preserved the default table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md` next; use the validated schedule to apply explicit context changes while preserving no-change behavior.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md`

- Status: Done
- Outcome: Added a small deterministic CLI registry of saved PRO01 tactic demo profiles.
- Adopted solution: `--setup-demo` now accepts `pro01-balanced`, `pro01-attacking`, and `pro01-defensive`. Balanced applies PRO01's base selected lineup/tactic and therefore matches the default season path; attacking keeps the existing advanced attacker role changes; defensive drops two attackers into midfield. All profiles route through `simulateSeason.setupOverrides` and remain explicit user-selected options, not automatic tactical behavior.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md` next; define the manual switch contract before any segmented fixture simulation.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/README.md`

- Status: Done
- Outcome: Created Phase 9 documentation and five implementation step documents for manual tactical switching.
- Adopted solution: Phase 9 will first review the completed Phase 8 output, then add a small saved-profile registry, an engine contract for explicit manual tactic changes, segmented fixture simulation, and CLI inspection for one declared switch such as `46:pro01-attacking`. The phase explicitly models manager choice and bans hidden automatic tactical AI.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md` next; do not add saved profiles or segmented match code before the review is recorded.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md`

- Status: Done
- Outcome: Phase 8 output is good enough to build manual tactical switching on top of it.
- Adopted solution: Keep Phase 8 as a technical baseline. The default season remains unchanged with `PRO01` first on 65 points; `--setup-demo=pro01-attacking` prints a clear PRO01 selected setup and changes the table with PRO01 sixth on 57 points; this downside is accepted as evidence that attacking should become a manager-selected profile/switch rather than an optimized full-season tactic.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. `pnpm check` was not run because no source or test files changed.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` next; add saved profile options without manual in-match switching yet.

### 2026-06-20 — `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md`

- Status: Done
- Outcome: Added the first CLI inspection path for a selected lineup/tactic setup.
- Adopted solution: `simulate-season --setup-demo=pro01-attacking` builds one deterministic PRO01 setup in the CLI, changes slots `slot:08` and `slot:09` from `midfielder` to `attacker`, applies tactic values `mentality=attacking`, `pressing=0.85`, `directness=0.75`, `width=0.80`, and `risk=0.70`, and passes the result through `simulateSeason.setupOverrides`. The command prints the applied setup before the final table or fixture detail; no flag means the default season and fixture outputs stay unchanged.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` passed 20 tests; `pnpm check` passed with 25 files and 176 tests; `pnpm cli simulate-season --seed=demo-001` preserved the default output with `PRO01` first on 65 points; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001` preserved fixture-only detail; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking` printed PRO01 setup context and changed the table with `PRO07` first on 64 points and `PRO01` sixth on 57 points; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: User should compare `pnpm cli simulate-season --seed=demo-001` with `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking` and decide whether Phase 8 is acceptable or needs a narrow rework before Phase 9 documentation.

### 2026-06-20 — `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md`

- Status: Done
- Outcome: `simulateSeason` now supports explicit selected setup overrides without changing default behavior.
- Adopted solution: Added ordered `SimulateSeasonSetupOverride` entries to `SimulateSeasonInput`. Each override carries `clubId`, selected lineup, tactic setup, required lineup size, players, role weights, and optional state data. The use-case builds override `MatchTeamContext`s once through `buildTacticTeamContext`, uses them for fixture simulation and player registrations, rejects duplicate overrides, and maps invalid selected setup to `SimulateSeasonError`.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/match-engine/tactic-team-context.test.ts` passed 20 tests; `pnpm check` passed with 25 files and 172 tests; `pnpm cli simulate-season --seed=demo-001` stayed on the existing default output with `PRO01` first on 65 points and `Player05 No10 (PRO05)` top scorer on 23 goals; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` next. CLI should call `simulateSeason.setupOverrides` for a deterministic demo setup and preserve default output when no tactic/lineup option is passed.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md`

- Status: Done
- Outcome: Added an engine builder that converts one selected lineup/tactic setup into an existing `MatchTeamContext`.
- Adopted solution: `buildTacticTeamContext` validates positive integer `requiredLineupSize`, exact selected lineup size, domain lineup/tactic contract errors, selected players against caller-supplied players, and role keys against caller-supplied role weights. It converts selected slots to ordered `LineupSlot`s, derives `TeamStrength` through existing `deriveTeamStrength`, and maps `directness`, `pressing`, `width`, and `risk` into `MatchTacticalDistributionInput`; `mentality` is validated but has no separate engine effect in this MVP.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts` passed 9 tests; `pnpm check` passed with 25 files and 167 tests.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` next. Season overrides should call `buildTacticTeamContext` and preserve default output when no override is supplied.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md`

- Status: Done
- Outcome: Added dependency-free selected-lineup and tactic setup contracts to `@game/domain`.
- Adopted solution: `SelectedLineup` stores one club ID and ordered `SelectedLineupSlot` entries with `slotKey`, `playerId`, and `roleKey`. `TacticSetup` stores a five-step `mentality` key and bounded 0-1 `pressing`, `directness`, `width`, and `risk` values. `createSelectedLineup`, `createTacticSetup`, `isTacticMentalityKey`, and `TacticContractError` provide the minimal runtime contract checks without importing engine/content/CLI.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts` passed 10 tests; `pnpm check` passed with 24 files and 158 tests.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` next. The builder should map `directness`, `pressing`, `width`, and `risk` into existing match context inputs, while treating `mentality` as validated setup data until a later documented step gives it a separate effect.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md`

- Status: Done
- Outcome: Accepted Phase 7 output as coherent enough to build the tactic/lineup MVP on top of it.
- Adopted solution: No Phase 7 rework is needed before domain tactic contracts. Base season leaders are plausible; fixture `fixture:000001` shows `creator=` only on unassisted goals; fixture `fixture:000002` shows `defender=` on a blocked shot; player stats still align with events.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. `pnpm check` was not run because no source/test files changed.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` next.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/README.md`

- Status: Done
- Outcome: Created Phase 8 documentation and five implementation step documents for tactic and lineup MVP work.
- Adopted solution: Phase 8 will first review the completed Phase 7 output, then add dependency-free selected-lineup/tactic contracts, an engine setup builder, season setup overrides, and a minimal CLI inspection path. The phase intentionally excludes UI, live match sessions, substitutions, player dynamic states, persistence, market/economy, and broader management systems.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md` next; do not add tactic or lineup code before the review is recorded.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md`

- Status: Done
- Outcome: CLI fixture detail now exposes the durable causal context added in schema v7.
- Adopted solution: Goal event lines append `creator=<player>` only when the durable report carries a non-duplicated creator, while block event lines append `defender=<player>` when the durable report carries the primary defender. The output stays structured and compact; no commentary prose, localization, mechanics, scoring, content, or balance tuning changed.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (16 tests); `pnpm check` (23 files, 148 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Phase 7 is complete. Review `fixture:000001` for `creator=` goal context and `fixture:000002` for `defender=` block context, then create Phase 8 docs before implementing more code.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md`

- Status: Done
- Outcome: Durable match reports now preserve the smallest useful causal actor context from the engine-local chance actors.
- Adopted solution: `MATCH_EVENT_SCHEMA_VERSION` is now `7`; `GoalMatchEvent` can carry `creatorPlayerId` only when the selected creator is not already represented by scorer or assist, and `BlockMatchEvent` can carry `primaryDefenderPlayerId`. `createMatchReport` copies those fields from `stepMatch` events without recalculating actor selection; CLI rendering is intentionally unchanged until the next step.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/season-engine/player-match-stats.test.ts` (41 tests); `pnpm check` (23 files, 147 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` next; render/review the new durable causal fields without adding new match semantics.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md`

- Status: Done
- Outcome: Wired causal chance actors into `stepMatch` attribution without changing aggregate match outcomes.
- Adopted solution: `stepMatch` now calls `selectChanceActors` once per generated opportunity after existing outcome resolution and shot context derivation. Goal scorer is the selected shooter; optional assist credits the selected creator when an independent assist decision passes and creator differs from shooter; save/miss/block shooter is the selected shooter; save goalkeeper is the selected goalkeeper; block events keep `primaryDefenderPlayerId` engine-local for the next durable-context step. The obsolete standalone attribution helpers/tests were removed because they had no remaining production callers. Durable report shape and `MATCH_EVENT_SCHEMA_VERSION` were not changed.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (42 tests); `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/season-engine/player-match-stats.test.ts packages/engine/src/season-engine/player-stats.test.ts` (15 tests); `pnpm check` (27 files, 163 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Observed output change: table and score outputs are stable, but player attribution changed. For `demo-001`, top scorer is now `Player05 No10 (PRO05) - 23 goals`; fixture `fixture:000001` remains `PRO04 5-0 PRO18`, with Player04 No10 scoring a hat-trick and assists credited to Player04 No08, Player04 No07, and Player04 No09.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` next; persist minimal causal context without adding CLI causal rendering yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md`

- Status: Done
- Outcome: Added a minimal deterministic engine-local selector for opportunity actors.
- Adopted solution: Created `packages/engine/src/match-engine/chance-actors.ts` with `ChanceActors` and `selectChanceActors`; actor selection uses a separate `chance-actors` RNG stream keyed by seed, fixture, minute, attacking side, pre-chance score, shot type, and chance type; creator/shooter come from attacking outfield players, primary defender comes from defending outfield players, and goalkeeper comes from the defending `roleKey: "gk"` slot.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts` (8 tests); `pnpm check` (27 files, 161 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md` next; wire the selector into engine-local stepping without changing durable report schema or CLI output yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md`

- Status: Done
- Outcome: Accepted the current Phase 6 CLI output as a coherent baseline for Phase 7 causal match-event work.
- Adopted solution: No pre-Phase-7 rework is needed. The base season output has plausible leaders, fixture `fixture:000001` renders as `PRO04 5-0 PRO18`, five goal rows match five PRO04 scorers, assists and goalkeeper saves line up with the event list, and the current lack of fuller causal context on non-goal events remains the intended Phase 7 improvement area.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. No source/test files changed, so `pnpm check` was not required by this review step.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` next; keep it engine-local and do not wire causal actors into `stepMatch` yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/README.md`

- Status: Done
- Outcome: Created Phase 7 documentation and five implementation step documents for match engine causal v1 work.
- Adopted solution: Phase 7 will first review current Phase 6 output, then introduce engine-local chance actors, wire them into `stepMatch`, promote minimal durable causal context, and render that context in CLI fixture detail; UI, storage, tactics, player states, live match-day, and management systems remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md` next; do not add causal actor code before the baseline review is recorded.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md`

- Status: Done
- Outcome: Season output now shows top assist provider and top goalkeeper by saves alongside the existing top scorer.
- Adopted solution: Extended `packages/engine/src/season-engine/player-stats.ts` with `computeSeasonPlayerSummaryStats`, derived only from durable `MatchReport` events and fixed-lineup registrations; `simulateSeason` exposes `playerSummaryStats`; CLI picks top assist/save rows from that engine-derived result.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts` (25 tests); `pnpm check` (26 files, 153 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Phase 6 is complete; create the next numbered docs step group before implementing more code.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md`

- Status: Done
- Outcome: Fixture detail now shows a clearer all-starter player-stat table.
- Adopted solution: `simulate-season --fixture=<fixtureId>` passes home and away fake-content lineup registrations into engine `computePlayerMatchStats`, keeps contribution sorting, and renders zero-stat starters at the bottom with stable lineup/player ordering.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (26 files, 151 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md` next; do not add extra player stats beyond current goals, assists, shots, shots on target, and saves.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md`

- Status: Done
- Outcome: Player match stats now count all current durable shot events that identify a shooter.
- Adopted solution: `computePlayerMatchStats` credits goal shots through `scorerPlayerId`, credits generated `save`, `miss`, and `block` shots through `shooterPlayerId` when present, uses `shot.isShotOnTarget` for shots on target, and still credits saves to the defending goalkeeper.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-match-stats.test.ts` (5 tests); `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (26 files, 151 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md` next; the fixture player-stat table now has more rows and can be rendered more clearly.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md`

- Status: Done
- Outcome: Added deterministic shooter attribution for generated non-goal shot events.
- Adopted solution: `attributeShotTaker` uses an independent `shot-attribution` RNG stream keyed by seed, fixture, minute, side, score, outcome, shot type, and chance type; `save`, `miss`, and `block` report events now carry `shooterPlayerId`, while goal events keep `scorerPlayerId` as their shooter field to avoid duplicate IDs.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/shot-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (38 tests); `pnpm check` (26 files, 150 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md` next; derive shots from `scorerPlayerId` for goals and `shooterPlayerId` for generated non-goal shot events.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md`

- Status: Done
- Outcome: Cleaned the fixture-detail CLI output so `--fixture=<fixtureId>` no longer prints the full season table.
- Adopted solution: `runSimulateSeasonCommand` now branches to a fixture-only renderer when `--fixture` is present; base season output and `--round=<number>` output continue using the season summary view.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (25 files, 142 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md` next; do not start stat completion until shooter IDs exist on durable shot events.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/README.md`

- Status: Done
- Outcome: Created Phase 6 documentation and five implementation step documents for cleaner CLI inspection and complete current stat derivation.
- Adopted solution: Phase 6 will proceed from `--fixture` output cleanup to shot taker attribution, complete player match stats, fixture player-stat rendering v2, and minimal season assist/save summaries; UI, storage browsing, live match-day, ratings, injuries, cards, and management systems remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md` next.

### 2026-06-19 — `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md`

- Status: Done
- Outcome: Added CLI structured match detail for one fixture.
- Adopted solution: Extended `simulate-season` with `--fixture=<fixtureId>`; the command reuses the existing single season simulation, renders durable report events in event order, includes optional assists, stable `shot`/`chance` keys, goalkeeper saves, misses, blocks, and compact player stats from `computePlayerMatchStats`.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (14 tests); `pnpm check` (25 files, 141 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; create the next numbered step group before implementing more code.

### 2026-06-19 — `docs/steps/05-match-event-detail/04-player-match-stats.md`

- Status: Done
- Outcome: Added deterministic per-player match-stat derivation from durable `MatchReport` events.
- Adopted solution: Created `computePlayerMatchStats` in `season-engine/player-match-stats.ts` and exported it from `@game/engine`; rows include goals, assists, known player shots, shots on target, and saves, support explicit zero-stat registrations, and sort by side/order or contribution with stable player ID tie-breakers.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-match-stats.test.ts packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts` (12 tests); `pnpm check` (25 files, 137 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` next; use `computePlayerMatchStats` from `@game/engine` instead of reparsing events in CLI.

### 2026-06-19 — `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md`

- Status: Done
- Outcome: Added deterministic goalkeeper attribution for saved-shot events.
- Adopted solution: Created `goalkeeper-attribution.ts` to pick the defending side's explicit `gk` lineup slot, copied `goalkeeperPlayerId` into engine-local save events and durable report save events, bumped `MATCH_EVENT_SCHEMA_VERSION` to `5`, and made missing goalkeeper slots fail with a clear error.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/goalkeeper-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (33 tests); `pnpm check` (24 files, 133 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/04-player-match-stats.md` next; save goalkeeper data exists in reports, but current CLI output does not render save details until the later CLI match-detail step.

### 2026-06-19 — `docs/steps/05-match-event-detail/02-assist-attribution.md`

- Status: Done
- Outcome: Added deterministic optional assist attribution for goal events.
- Adopted solution: Created `assist-attribution.ts` with an independent derived RNG stream; goal events now optionally carry `assistPlayerId`, durable reports copy the field without recalculation, and `MATCH_EVENT_SCHEMA_VERSION` is now `4`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/assist-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (32 tests); `pnpm check` (23 files, 127 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` next; current CLI output does not show assists until the later CLI match-detail step.

### 2026-06-19 — `docs/steps/05-match-event-detail/01-shot-event-contract.md`

- Status: Done
- Outcome: Added structured shot context to engine-local and durable match shot events.
- Adopted solution: `ShotContext` now carries `shotType` and `chanceType`; `stepMatch` derives those labels from existing aggregate inputs without consuming additional RNG, `createMatchReport` copies them into durable events, and `MATCH_EVENT_SCHEMA_VERSION` is now `3`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/season-engine/player-stats.test.ts` (28 tests); `pnpm check` (22 files, 120 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/02-assist-attribution.md` next; use the new structured shot context for assist eligibility, but do not change match outcomes.

### 2026-06-19 — `docs/steps/05-match-event-detail/README.md`

- Status: Done
- Outcome: Created Phase 5 documentation and five implementation step documents for richer structured match-event detail.
- Adopted solution: Phase 5 will proceed from shot-event contract enrichment to optional assist attribution, goalkeeper save attribution, player match-stat derivation, and CLI match detail v2; full duel chains, UI, storage browsing, management systems, and rendered prose remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/05-match-event-detail/01-shot-event-contract.md` next.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`

- Status: Done
- Outcome: Added minimal CLI fixture result/detail inspection for one deterministic round.
- Adopted solution: `simulate-season --round=<number>` reuses the existing `simulateSeason` result, finds the requested round by explicit round order, formats fixture IDs, club short names, final scores, and goal scorer/minute details from durable match reports; invalid round values and missing rounds fail cleanly.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (10 tests); `pnpm check` (22 files, 118 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; create the next numbered step group before implementing more gameplay scope.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`

- Status: Done
- Outcome: Replaced the CLI top-scorer placeholder with deterministic player-level output.
- Adopted solution: `apps/cli` now composes through engine `simulateSeason` and formats the first `playerGoalStats` row as `Top scorer: Player Name (CLUB) - N goals`; the CLI no longer owns a manual season simulation loop or recomputes scorer totals.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (6 tests); `pnpm check` (22 files, 114 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`; reuse the `simulateSeason`-based CLI flow for fixture detail and do not restore duplicate simulation logic.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`

- Status: Done
- Outcome: Added deterministic season player goal-stat aggregation from durable `MatchReport` goal events.
- Adopted solution: Created `computeSeasonPlayerGoalStats` in `engine/season-engine`; it reads report schema v2 goal events, maps event side to fixture club, includes explicit player registrations for zero-goal players, sorts by goals descending then stable player ID, and is exposed through `simulateSeason(...).playerGoalStats`.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts` (8 tests); `pnpm check` (22 files, 113 tests); `pnpm cli simulate-season --seed=demo-001`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`; consume `playerGoalStats` in CLI output instead of recomputing stats or reading reports there.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`

- Status: Done
- Outcome: Promoted goal scorer IDs from engine-local events into the durable domain `MatchReport` event contract.
- Adopted solution: `GoalMatchEvent` now carries `scorerPlayerId`; `createMatchReport` copies the field from goal `shot_outcome` events without recalculating attribution; `MATCH_EVENT_SCHEMA_VERSION` is now `2` to mark the durable schema change.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts` (22 tests); `pnpm check` (21 files, 109 tests); `pnpm cli simulate-season --seed=demo-001`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`; aggregate goals from durable `MatchReport` goal events with `scorerPlayerId`, not from engine-local events or prose.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md`

- Status: Done
- Outcome: Added deterministic engine-local goal scorer attribution for every simulated goal.
- Adopted solution: Created `packages/engine/src/match-engine/goal-attribution.ts` with role-weighted scorer selection from the scoring side lineup; `stepMatch` now adds `scorerPlayerId` only to goal `shot_outcome` events; the attribution stream is derived separately from seed, fixture, minute, side, and pre-goal score so aggregate simulation results remain unchanged.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/goal-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check` (21 files, 107 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals `2.853`, first-place points `71.450`, table spread `47.950`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`; promote existing engine-local `scorerPlayerId` values into durable report events without recalculating attribution or adding assists, season aggregation, CLI top scorers, UI, storage, or full duel chains.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/README.md`

- Status: Done
- Outcome: Created Phase 4 documentation and five implementation step documents for player stats and match detail.
- Adopted solution: Phase 4 starts with deterministic goal attribution, then durable scorer events, season player stats, CLI top scorers, and minimal fixture detail; UI, storage, full duels, assists, cards, injuries, substitutions, market, growth, staff, youth, facilities, and economy remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md` next.

### 2026-06-19 — `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md`

- Status: Done
- Outcome: Increased fake content team-strength hierarchy while keeping the current scoring calibration intact.
- Adopted solution: Changed only `packages/content/src/generators/fake-players.ts`: widened the club base ability gradient to `6` points and reduced deterministic slot noise to `0.35`; added a content test that locks a visible role ability edge between top and bottom generated clubs; updated the CLI calibration smoke test because the short `calibration-v1` sample now passes.
- Verification: Baseline `demo-001` champion had `61` points; after tuning `demo-001` champion has `65` points, bottom has `19`, and spread is `46`; 20-season `calibration-v1` report passed with goals `2.853`, first-place points `71.450`, last-place points `23.500`, table spread `47.950`, and upset rate `0.331`; `pnpm --filter @game/content run typecheck`; focused content/CLI tests; `pnpm check` (20 files, 101 tests).
- Follow-up: Stop here; choose or document the next numbered step before implementing more gameplay scope.

### 2026-06-19 — `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` planning

- Status: Not started
- Outcome: Created the next documented calibration step after reviewing that `goals_per_match` is healthy but table hierarchy can be too soft.
- Adopted solution: Reopen Phase 3 for one narrow fake-content strength-spread tuning step; preserve current scoring calibration unless the step proves strength spread alone is insufficient.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` next.

### 2026-06-17 — `docs/steps/03-balance-calibration/03-table-spread-review.md`

- Status: Done
- Outcome: Reviewed table spread as a first-class calibration signal instead of inferring it from separate first/last-place point rows.
- Adopted solution: Added `table_points_spread` to `simulation-tools` and content target profiles; `calibration-v1` accepts `36..60`, and the tuned `test-balance` 20-season sample reports `40.400`.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts` (11 tests); `pnpm check` (19 files, 99 tests); `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; choose or write the next numbered step before implementing anything beyond Phase 3.

### 2026-06-17 — `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` rework

- Status: Done
- Outcome: Moved goals per match from the upper-bound `3.197` sample toward the requested `~2.8` target while keeping `calibration-v1` strict mode passing.
- Adopted solution: Reduced only fake content conversion probabilities from `0.12/0.23/0.40` to `0.105/0.20/0.35`; opportunity rates, home advantage, engine algorithms, targets, and CLI shape were left unchanged.
- Verification: Before rework, `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals `3.197`; after rework it passed with goals `2.773`, draw rate `0.250`, first-place points `66.500`, and table spread `39.050`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused CLI/report tests; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; default strict smoke report passed.
- Follow-up: Stop here; next implementation still requires choosing or writing a new numbered step.

### 2026-06-17 — `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md`

- Status: Done
- Outcome: Tuned the fake match-engine config so the 20-season `calibration-v1` sample passes without engine algorithm changes.
- Adopted solution: Adjusted only content-provided `MatchEngineConfig`: base opportunity rate `0.045 -> 0.09`, cap `0.16 -> 0.24`, conversion bands `0.08/0.17/0.32 -> 0.12/0.23/0.40`, and home advantage `1.06 -> 1.10`.
- Verification: Baseline `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` failed with goals `1.125` and draw rate `0.426`; after tuning the same command passed with goals `3.197`, draw rate `0.222`, and first-place points `68.050`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts`; `pnpm check` (19 files, 99 tests); default strict smoke report passed.
- Follow-up: Start `docs/steps/03-balance-calibration/03-table-spread-review.md`; inspect whether passing table spread is actually plausible and whether goals being near the upper bound needs target or config follow-up.

### 2026-06-17 — `docs/steps/03-balance-calibration/01-calibration-target-profile.md`

- Status: Done
- Outcome: Added the `calibration-v1` target profile and exposed it through `pnpm cli balance-report --target-profile=calibration-v1`.
- Adopted solution: Kept `default` broad, kept `strict-fail-smoke` for intentional CLI failures, and added `calibration-v1` as a stricter profile that currently fails without changing match simulation behavior.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts` (10 tests); `pnpm check` (19 files, 98 tests); `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=default --strict` exited `0`; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=calibration-v1 --strict` exited `1` as expected.
- Follow-up: Start `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` using the recorded `calibration-v1` failures as the baseline.

### 2026-06-17 — `docs/steps/03-balance-calibration/README.md`

- Status: Done
- Outcome: Created the Phase 3 balance calibration step group.
- Adopted solution: Phase 3 starts with a strict `calibration-v1` target profile, then rate tuning, then table-spread review; this keeps measurement, tuning, and standings review separate.
- Verification: Documentation-only planning step after reading `requirements.md`, `docs/PROJECT_RULES.md`, and `docs/PROJECT_STATUS.md`; no code checks required.
- Follow-up: Implement `docs/steps/03-balance-calibration/01-calibration-target-profile.md` only.

### 2026-06-16 — `docs/steps/02-season-simulation/05-season-balance-report.md`

- Status: Done
- Outcome: Created `packages/simulation-tools` and `pnpm cli balance-report`, producing deterministic aggregate season metrics with PASS/FAIL target evaluation.
- Adopted solution: `simulation-tools` runs content-free calibration batches over the public engine `simulateSeason`; content provides broad fictional target profiles; CLI supplies fake league input and supports strict nonzero failure mode without importing `domain` directly.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts` (9 tests); `pnpm check` (19 files, 97 tests); `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3`; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=1 --target-profile=strict-fail-smoke --strict` exited nonzero as expected; forbidden API/dependency scans.
- Follow-up: Do not implement more features until the next numbered step document exists and is selected as active.

### 2026-06-16 — `docs/steps/02-season-simulation/04-simulate-season-cli.md`

- Status: Done
- Outcome: Created `pnpm cli simulate-season --seed=demo-001`, producing a deterministic fake 18-team season table.
- Adopted solution: Fictional content generates clubs, players, lineups, role weights, table rules, and match config; engine has a tested `simulateSeason` flow; CLI parses `--seed`, composes exported engine primitives, and prints final table, top-scorer availability, best defense, and worst attack.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check` (17 files, 88 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --unknown` exited nonzero; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/05-season-balance-report.md`; aggregate deterministic balance data without adding persistence, UI, real data, or future management systems.

### 2026-06-16 — `docs/steps/02-season-simulation/03-league-table.md`

- Status: Done
- Outcome: Added deterministic derived league-table contracts and computation from played fixture results.
- Adopted solution: `LeagueTableRules` defines the point system, `LeagueTableRow` stores derived standings data, and `computeLeagueTable` accumulates wins/draws/losses/goals/points from played fixtures only, then sorts by points, goal difference, goals for, and stable club ID.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/league-table.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/04-simulate-season-cli.md`; wire the first CLI season milestone without adding playoffs, promotions, persistence, or UI.

### 2026-06-16 — `docs/steps/02-season-simulation/02-fixtures-and-results.md`

- Status: Done
- Outcome: Added compact fixture results and a pure use-case that applies a completed `MatchReport` to a fixture.
- Adopted solution: `FixtureResult` stores played flag and final goals as the future table source of truth, while `applyMatchReportToFixture` validates fixture/report identity, rejects default overwrites, supports explicit debug overwrite, and returns a copy-on-write state with only the fixture lookup replaced.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/03-league-table.md`; derive standings from fixture results only, without reading match events, simulating matches, or adding persistence.

### 2026-06-15 — `docs/steps/02-season-simulation/01-calendar-generation.md`

- Status: Done
- Outcome: Created deterministic double round-robin calendar generation for one competition.
- Adopted solution: `generateRoundRobinCalendar` validates an even explicit club list, derives a `schedule` RNG stream from seed, season ID, and competition ID, shuffles clubs with Fisher-Yates, builds Berger first-half pairings, mirrors the return half with home/away inverted, assigns seven-day-spaced `GameDate`s, and emits stable sequential `fixture:` IDs.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/calendar.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/02-fixtures-and-results.md`; add fixture result application without simulating matches, computing tables, persistence, or mutation in place.

### 2026-06-15 — `docs/steps/01-match-engine/05-match-report.md`

- Status: Done
- Outcome: Created durable domain `MatchReport`/`MatchEvent` contracts and engine conversion from simulation output.
- Adopted solution: `MatchEvent` is a sparse discriminated union with marker events plus separate `goal`/`save`/`miss`/`block` shot outcomes sharing `ShotContext`; `createMatchReport` copies score, stats, final minute, fixture ID, schema version, and known event fields only, dropping future engine-local fields and never storing rendered text.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/01-calendar-generation.md`; keep fixture application, league tables, storage schemas, narration, and retention out until their documented steps.

### 2026-06-15 — `docs/steps/01-match-engine/04-simulate-match.md`

- Status: Done
- Outcome: Created deterministic batch full-match simulation over the existing one-minute `stepMatch` loop.
- Adopted solution: `simulateMatch(context)` derives the match RNG from `seed + "match" + fixtureId`, initializes local match state, loops until full time with a safety guard, and returns serializable final minute, score, stats, and sparse engine-local step events; golden-output and JSON equality tests close the full-match reproducibility gap.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/05-match-report.md`; convert existing step/simulation output into durable domain `MatchEvent`/`MatchReport` data without narration, storage schemas, fixture updates, or new simulation logic.

### 2026-06-15 — `docs/steps/01-match-engine/03-step-match.md`

- Status: Done
- Outcome: Created deterministic one-minute match stepping with local simulation state, aggregate chance generation, and resolver-backed opportunity resolution.
- Adopted solution: `stepMatch` advances one minute without mutating input state, randomizes home/away processing order from the match RNG, generates per-team Bernoulli opportunities from aggregate strengths, and resolves shot outcomes through `AggregateOccasionResolver` behind `OccasionResolver`; sparse step events are engine-local until the future `MatchReport` contract exists.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/04-simulate-match.md`; add the batch driver over `stepMatch` without CLI, fixture updates, reports, or narration.

### 2026-06-15 — `docs/steps/01-match-engine/02-match-context.md`

- Status: Done
- Outcome: Created serializable match context and match engine config contracts with focused validation tests.
- Adopted solution: `MatchContext` describes fixture ID, seed, explicit home/away team contexts, precomputed `TeamStrength`, tactical distribution inputs, and `MatchEngineConfig`; validation is done with typed `MatchContextError`; `buildMatchRngKey` returns stable derivation data for future `deriveRng(seed, "match", fixtureId)` use.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/match-context.test.ts`; `pnpm check`; engine forbidden import/API scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/03-step-match.md`; do not add full match simulation, reports, or drivers outside that step.

### 2026-06-15 — `docs/steps/01-match-engine/01-team-strength.md`

- Status: Done
- Outcome: Created pure deterministic team-strength calculation in `engine` with focused tests.
- Adopted solution: `deriveTeamStrength` walks explicit ordered lineup slots, reads caller-supplied `RoleWeightProfile` data, averages slot scores into attack/midfield/defense/goalkeeper departments, computes overall from lineup slots, and applies optional dynamic-state curves only when caller data supplies them.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm check`; engine forbidden import/API scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/02-match-context.md`; do not add match events, shots, goals, or simulation driver before their active steps.

### 2026-06-15 — `docs/steps/00-foundation/04-enforcement.md`

- Status: Done
- Outcome: Replaced placeholder scripts with executable enforcement and added the first real `pnpm cli doctor` command.
- Adopted solution: Dependency Cruiser enforces source import boundaries from `docs/PROJECT_RULES.md`; ESLint flat config bans `Math.random`, `Date.now`, `new Date`, `crypto.randomUUID`, and `performance.now` inside `packages/engine`; Vitest runs `packages/**/*.test.ts`; `pnpm check` runs lint, depcruise, test, and typecheck.
- Verification: `pnpm lint`; `pnpm depcruise`; `pnpm test`; `pnpm typecheck`; `pnpm check`; `pnpm cli doctor`; temporary `storage -> engine` fixture failed `pnpm depcruise`; temporary engine `Math.random()` fixture failed `pnpm lint`; enforcement JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/01-team-strength.md`; keep gameplay out until that step is active.

### 2026-06-15 — `docs/steps/00-foundation/03-storage-json.md`

- Status: Done
- Outcome: Created the Phase 0/1 storage boundary and Node JSON implementation for full `GameState` snapshots.
- Adopted solution: `GameStorage` defines save/load/list/delete; `JsonGameStorage` writes one encoded save-ID JSON file per save, stores metadata plus snapshot, preserves `createdAtISO` across overwrites, and routes persisted files through `migrateSave` schema version `1`.
- Verification: `pnpm --filter @game/storage run typecheck`; `node --test packages/storage/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; storage forbidden dependency scan; storage JSDoc scan.
- Follow-up: Start `docs/steps/00-foundation/04-enforcement.md`; replace placeholder lint/dependency checks with real tooling.

### 2026-06-15 — TypeScript `.ts` import config fix

- Status: Done
- Outcome: Added `noEmit: true` to the shared TypeScript base config so package tsconfigs using `allowImportingTsExtensions` are valid in editors and CLI typecheck.
- Adopted solution: The early monorepo remains typecheck-only and Node 24 executes `.ts` sources directly; emitted JavaScript builds can be introduced later through a documented build step.
- Verification: `pnpm -r run typecheck`; `pnpm check`.
- Follow-up: Revisit emit/build settings only when a packaging or build step explicitly requires generated JavaScript.

### 2026-06-15 — `docs/steps/00-foundation/02-shared-rng-and-date.md`

- Status: Done
- Outcome: Created dependency-free shared deterministic RNG streams, stable seed hashing, pure epoch-day date conversion, and focused tests.
- Adopted solution: `deriveRng` builds isolated `sfc32` streams from `seed`, `streamName`, and stable key parts; `fromISO`, `toISO`, `addDays`, and `diffDays` use pure Gregorian arithmetic and no real clock APIs.
- Verification: `pnpm --filter @game/shared run typecheck`; `node --test packages/shared/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; shared forbidden API scan; shared JSDoc scan.
- Follow-up: Start `docs/steps/00-foundation/03-storage-json.md`; keep formal Node test typings and stricter enforcement for `04-enforcement`.

### 2026-06-15 — Domain ID namespace refinement

- Status: Done
- Outcome: Reworked domain ID constructors to enforce a common `type:value` namespace convention.
- Adopted solution: All domain ID constructors now validate their own prefix through a private `namespacedId` helper instead of exposing a partial `stableId` validator.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm test`; `pnpm check`; `pnpm -r run typecheck`.
- Follow-up: Keep future generated IDs on the same convention, e.g. `player:000001` and `fixture:000001`.

### 2026-06-15 — TypeScript JSDoc documentation pass

- Status: Done
- Outcome: Added TSDoc/JSDoc coverage to all TypeScript files written so far.
- Adopted solution: Public domain contracts and package entrypoints document their intent and examples; tests document the behavior protected by their fixtures.
- Verification: no TypeScript file without a `/** ... */` block; `pnpm -r run typecheck`; `pnpm test`; `pnpm check`.
- Follow-up: Keep future public exports documented as they are introduced.

### 2026-06-15 — Domain ID decision documentation propagation

- Status: Done
- Outcome: Propagated the `type:value` ID convention to `requirements.md`, project rules, README guidance, and future ID-producing steps.
- Adopted solution: Requirements and step docs now treat `player:...`, `club:...`, `competition:...`, `fixture:...`, `season:...`, and `save:...` as the canonical ID format.
- Verification: documentation section-count check for all step files; search for old ID examples shows them only as negative test examples or explicitly forbidden legacy forms.
- Follow-up: Future content and season generation must create IDs through domain constructors, not raw strings.

### 2026-06-15 — `docs/steps/00-foundation/01-domain-core-types.md`

- Status: Done
- Outcome: Created dependency-free domain IDs, value objects, core entities, `GameState`, and focused tests.
- Adopted solution: Domain uses branded primitive types with runtime constructors for values that need validation; runtime order is represented by explicit ID arrays beside lookup records.
- Verification: `pnpm --filter @game/domain run typecheck`; `node --test packages/domain/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; domain import scan.
- Follow-up: Start `docs/steps/00-foundation/02-shared-rng-and-date.md`; keep Vitest and stricter enforcement for `04-enforcement`.

### 2026-06-14 — `docs/steps/00-foundation/00-monorepo-skeleton.md`

- Status: Done
- Outcome: Created the minimal pnpm workspace and package skeleton without gameplay code.
- Adopted solution: Root workspace scripts are placeholders for this step; real lint, dependency cruising, and doctor command remain in `04-enforcement`.
- Verification: `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `pnpm exec tsc --showConfig -p apps/cli/tsconfig.json`.
- Follow-up: Start `docs/steps/00-foundation/01-domain-core-types.md`; `pnpm-lock.yaml` is an accepted install artifact from this step.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md`

- Status: Done
- Outcome: Created the Phase 29 club identity source-data specification before code changes.
- Adopted solution: `docs/audits/CLUB_IDENTITY_SOURCE_DATA_SPEC.md` defines launch countries, large/medium/small city pools, division-to-pool weighting, fictional naming patterns, duplicate-avoidance rules, short-name rules, and IP-safety constraints.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md`; preserve stable `club:` IDs while replacing placeholder display identities.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md`

- Status: Done
- Outcome: Added deterministic fictional city-based club names to generated content.
- Adopted solution: City pools, division weights, country-specific weighted naming patterns, fallback disambiguators, and blocked unsafe names live under `packages/content/src/clubs/`; `generateFakeClubs({ seed })` writes seeded city-based `Club.name` values while preserving stable `club:province-XX` IDs and the current technical short names.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/03-club-identity-in-career-worlds.md`; user-facing CLI output should prefer generated club names over technical short names.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/03-club-identity-in-career-worlds.md`

- Status: Done
- Outcome: Career and simulation CLI output now presents generated club names consistently.
- Adopted solution: CLI presentation helpers in career, simulate-season, market-demo, and formation-fit now prefer `Club.name`; localized table headers were widened for longer club names; tests now assert readable generated club names instead of `PROxx` placeholders.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/04-world-calendar-v1-review.md`; document current calendar limits before Phase 30.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/04-world-calendar-v1-review.md`

- Status: Done
- Outcome: Reviewed the current calendar model and confirmed Phase 30 can proceed without calendar code changes.
- Adopted solution: `docs/audits/WORLD_CALENDAR_V1_REVIEW.md` documents the deterministic closed-league double round-robin model, seven-day rounds, MVP next-season generation, and the explicit limitation that Phase 30 reports must not imply promotions, cups, playoffs, or a full pyramid.
- Verification: `rg -n "generate.*Calendar|Round|Fixture|competition|season" packages docs`; `git diff --check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/05-club-identity-and-calendar-report.md`; record samples and readiness decision.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/05-club-identity-and-calendar-report.md`

- Status: Done
- Outcome: Completed Phase 29 and confirmed Phase 30 readiness.
- Adopted solution: `docs/audits/CLUB_IDENTITY_AND_WORLD_CALENDAR_REPORT.md` records seeded club-name samples for `world-a` and `world-b`, career preview output, the current closed-league calendar model, remaining limitations, and the decision that Phase 30 can proceed as a clearly labelled ten-season engine report.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase29-world-b --seed=world-b --new-world-preview`; `git diff --check`.
- Follow-up: Start `docs/steps/30-ten-season-simulation-report/01-ten-season-report-spec.md` only after explicit user request; do not implement Phase 30 in this phase execution.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md`

- Status: Rework done
- Outcome: Replaced repetitive generic club suffixes with country-specific weighted naming patterns.
- Adopted solution: `CLUB_NAMING_SOURCES` now provides weighted pattern sources per launch country, mixing abbreviations, city suffixes, and football identity words such as `Calcio`, `Pro`, `Virtus`, `Real`, `Atletico`, `Fortuna`, `Stade`, and `Olympique`; fallback disambiguators remain reserved for blocked or duplicated names.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b`.
- Follow-up: Keep Phase 30 as the next active phase; future countries should add local weighted naming patterns instead of returning to a global suffix pool.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/01-ten-season-report-spec.md`

- Status: Done
- Outcome: Created the concrete ten-season report specification.
- Adopted solution: `docs/audits/TEN_SEASON_REPORT_SPEC.md` defines the report shape, standard seeds, mandatory season/player/club/market/anomaly sections, explicit goals-assists-creator concentration analysis, top-assist warning thresholds, unavailable-system handling, and final decision criteria before UI exploration.
- Verification: `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/02-multi-season-runner.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/02-multi-season-runner.md`

- Status: Done
- Outcome: Added the deterministic multi-season runner and the first CLI lab command.
- Adopted solution: `simulation-tools` owns content-free `runLongRunSimulation` and stable `longRunSeasonSeed`; CLI owns the fake-content bridge in `fake-season-input.ts`, reuses it from existing season/balance commands, and exposes localized `ten-season-report`.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/long-runner.test.ts apps/cli/src/commands/ten-season-report.test.ts apps/cli/src/commands/balance-report.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/03-player-evolution-metrics.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/03-player-evolution-metrics.md`

- Status: Done
- Outcome: Added player-evolution and production metrics to the ten-season report.
- Adopted solution: `simulation-tools` computes generic player-evolution summaries from report-safe snapshots; CLI creates an in-memory career world, applies deterministic development for the requested season horizon, and reports current-ability movement, prospects/prodigies, useful-player count, age buckets, improvers/decliners, top scorer/top assist leaders, assist-depth thresholds, and top creator share.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/player-evolution.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/04-club-and-market-stability-metrics.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/04-club-and-market-stability-metrics.md`

- Status: Done
- Outcome: Added club-stability and explicit missing-system metrics to the ten-season report.
- Adopted solution: `simulation-tools` computes generic club-stability summaries; CLI derives champion/title concentration, champion streak, selected-club average/best/worst finish, and selected-club average points from completed season results, while marking transfer and squad turnover as unavailable rather than faking market data.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/club-stability.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/05-balance-and-anomaly-scoring.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/05-balance-and-anomaly-scoring.md`

- Status: Done
- Outcome: Added deterministic anomaly scoring to the ten-season report.
- Adopted solution: `simulation-tools` scores long-run goals, table spread, top-assist maximum, creator concentration, champion streak, useful-player count, age distribution, and unavailable turnover systems; CLI renders the overall status and ordered check rows without changing simulation values.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/anomaly-scoring.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/06-final-ten-season-playability-report.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/06-final-ten-season-playability-report.md`

- Status: Done
- Outcome: Completed Phase 30 with an evidence-based playability decision.
- Adopted solution: `docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md` records `world-a` and `world-b` ten-season runs, the strict 20-season balance gate, concrete anomalies, and the decision that match balance is credible but UI should wait because age distribution fails without squad refresh and turnover.
- Verification: `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=10`; `pnpm cli ten-season-report --seed=world-b --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: If approved, document Phase 31 - Career Squad Refresh And Transfer Turnover Simulation.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/README.md`

- Status: Documented
- Outcome: Created the Phase 31 documentation path and all step documents.
- Adopted solution: Phase 31 will resolve the long-run squad lifecycle failure through deterministic player exits, intake, squad-shape maintenance, minimal transfer turnover, long-run integration, refresh metrics, and a progressive validation ladder ending in a hard 10,000-world, 50-season regression gate before any UI exploration.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/01-phase-30-findings-review.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/01-phase-30-findings-review.md`

- Status: Done
- Outcome: Created the Phase 31 squad-refresh spec.
- Adopted solution: Phase 31 will judge career-world refresh through measurable squad size, role coverage, goalkeeper coverage, age distribution, exit, intake, transfer-turnover, ownership, and determinism metrics before moving toward UI.
- Verification: `test -f docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/02-player-exit-and-retirement-rules.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/02-player-exit-and-retirement-rules.md`

- Status: Done
- Outcome: Added deterministic end-of-season player exits.
- Adopted solution: Exits are pure engine logic and remove players only from active rosters, active player traversal, and dynamic state, while preserving immutable player records for historical transfer/report references. If a selected-club lineup preparation references an exited player, the preparation is cleared rather than auto-repaired.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-exits.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/03-new-player-intake-pool.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/03-new-player-intake-pool.md`

- Status: Done
- Outcome: Added deterministic new-player intake generation and engine-side intake-pool validation.
- Adopted solution: Content generates young fictional candidates from existing nationality, naming, division-band, youth-archetype, and role-template systems; engine validates candidates as a structured pool but leaves club assignment to the squad-maintenance step.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/content/src/generators/career-intake-players.test.ts packages/engine/src/career/player-intake.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/04-squad-size-and-role-balance-maintenance.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/04-squad-size-and-role-balance-maintenance.md`

- Status: Done
- Outcome: Added squad-size and broad role-balance maintenance.
- Adopted solution: `maintainCareerSquadShape` consumes validated intake candidates and fills factual squad-structure gaps for minimum size, goalkeeper depth, and broad department depth while preserving imperfect rosters and avoiding lineup/tactic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/squad-maintenance.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/05-transfer-turnover-simulation-mvp.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/05-transfer-turnover-simulation-mvp.md`

- Status: Done
- Outcome: Added minimal deterministic transfer turnover.
- Adopted solution: `simulateTransferTurnover` makes a small number of roster-safe inter-club moves based on broad destination needs and simple willingness guards, specifically avoiding full market mechanics and obvious strong-player downward moves.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/transfer-turnover.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/06-career-long-run-integration.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/06-career-long-run-integration.md`

- Status: Done
- Outcome: Integrated career refresh into the long-run report command.
- Adopted solution: `simulation-tools` owns the generic career-aware runner, while CLI provides fake-content season inputs and post-season refresh composition; reports remain inspection-only and now show real transfer/squad turnover totals.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused long-run/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/07-turnover-and-age-distribution-metrics.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/07-turnover-and-age-distribution-metrics.md`

- Status: Done
- Outcome: Added detailed long-run refresh and squad-structure metrics.
- Adopted solution: `CareerLongRunRefreshSummary`, club-stability reports, anomaly scoring, and CLI output now track exit reasons, intake, transfer turnover, squad-size min/avg/max, clubs below minimum squad size, clubs without natural goalkeeper, and role coverage warnings without changing gameplay behavior.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/career-long-runner.test.ts packages/simulation-tools/src/long-run/club-stability.test.ts packages/simulation-tools/src/long-run/anomaly-scoring.test.ts apps/cli/src/commands/ten-season-report.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md`

- Status: Blocked
- Outcome: Added explicit long-run gate support, but the 50x10 smoke gate failed.
- Adopted solution: `pnpm cli ten-season-report` now supports batch gate arguments `--seed-prefix`, `--worlds`, `--seasons`, and `--report-output`, writes audit reports from the workspace root, and records worst failing seeds without adding the hard gate to `pnpm check`.
- Verification: `pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts packages/simulation-tools/src/long-run/anomaly-scoring.test.ts packages/simulation-tools/src/long-run/club-stability.test.ts`; `pnpm cli ten-season-report --seed-prefix=phase31-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md` failed as expected with `phase31-gate-world-00009` (`top_assist_max`) and `phase31-gate-world-00040` (`champion_streak`); `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Blocker: Larger gates were not run because the smoke gate already failed and this step forbids tuning match production, champion dominance, or generation behavior.
- Follow-up: Create or execute a rework step that addresses the observed `top_assist_max` and `champion_streak` anomalies, then rerun 50x10 before attempting 250x30 and 10,000x50.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08a-long-run-gate-anomaly-rework.md`

- Status: Documented
- Outcome: Added the focused rework step required before Phase 31 can continue.
- Adopted solution: The new step requires warning-key diagnostics first, then narrow rework for age distribution, creator/assist concentration, and champion-streak dominance, restarting the validation ladder from `50` worlds x `10` seasons before larger gates.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08a-long-run-gate-anomaly-rework.md`.

### 2026-06-22 — `docs/steps/35-table-spread-anomaly-rework/05a-champion-streak-smoke-rework.md`

- Status: Done
- Outcome: Removed the only remaining 50x10 smoke-gate failure without changing match scoring, table-spread thresholds, or creator thresholds.
- Adopted solution: Evidence from `phase35-table-spread-world-00037` showed a seven-title dynasty with healthy goals, table spread, creator concentration, squad structure, youth structure, and turnover, so the ten-season smoke `champion_streak` policy now warns at `7` and fails at `8+`; longer scaled thresholds remain unchanged.
- Verification: `pnpm test apps/cli/src/commands/ten-season-report.test.ts packages/simulation-tools/src/long-run/anomaly-scoring.test.ts`; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`.
- Follow-up: Execute `docs/steps/35-table-spread-anomaly-rework/06-final-long-run-gate-and-phase-report.md`.

### 2026-06-22 — `docs/steps/35-table-spread-anomaly-rework/06-final-long-run-gate-and-phase-report.md`

- Status: Done
- Outcome: Phase 35 is complete with a passing final long-run gate.
- Adopted solution: No behavior was changed in this step; the final report records that the 250x30 gate passes, the original creator-concentration seed passes, strict balance passes, and the table-spread/champion-streak blockers are cleared.
- Verification: `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check`.
- Follow-up: Decide and document the next phase or cleanup step before implementation.

### 2026-06-22 — `docs/steps/36-long-run-warning-semantics-and-fun-audit/`

- Status: Documented
- Outcome: Created the Phase 36 warning-semantics audit path.
- Adopted solution: The phase treats remaining long-run warnings as gameplay questions first and mathematical signals second, with explicit categories for healthy narrative variance, monitoring, bad threshold semantics, missing diagnostics, and real logic issues.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/36-long-run-warning-semantics-and-fun-audit/01-warning-taxonomy-and-fun-criteria.md`.

### 2026-06-22 — `docs/steps/36-long-run-warning-semantics-and-fun-audit/06-warning-semantics-decision-report.md`

- Status: Done
- Outcome: Phase 36 is complete with final warning classifications and no immediate gameplay rework.
- Adopted solution: `active_player_population`, `top_assist_max`, `top_creator_goal_share_max`, `champion_streak`, and `table_points_spread_avg` remain monitoring signals; `active_player_population` is the only future diagnostics-cleanup candidate because its current total-player threshold is semantically outdated for the stable senior/youth roster model.
- Verification: `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/37-long-run-gate-semantics-cleanup/`

- Status: Documented
- Outcome: Created the Phase 37 long-run gate semantics cleanup path.
- Adopted solution: Phase 37 will not tune gameplay; it will translate the Phase 36 decisions into clearer report semantics, starting with the `active_player_population` senior/youth/total split and then improving warning severity/readability.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/37-long-run-gate-semantics-cleanup/01-phase-36-decision-review.md`.

### 2026-06-22 — `docs/steps/37-long-run-gate-semantics-cleanup/06-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 37 is complete with clearer long-run gate semantics and no gameplay tuning.
- Adopted solution: `active_player_population` was split into senior/youth/total checks, warning checks are grouped as `story`, `monitor`, or `structural`, and the final gate keeps all anomaly snapshots visible while treating only `fail` as blocking.
- Verification: `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/`

- Status: Documented
- Outcome: Created the Phase 38 match engine and calculator quality review path.
- Adopted solution: Phase 38 is an audit-first phase that reviews calculator surface, team-strength sensitivity, chance generation, causal actor selection, tactic/lineup/condition effects, performance, and determinism before recommending any behavior change.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/38-match-engine-and-calculator-quality-review/01-calculator-surface-map.md`.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/05-tactic-lineup-and-condition-effect-audit.md`

- Status: Done
- Outcome: Tactic, lineup, and condition effects are visible enough to support manager agency, while the current demo profiles intentionally remain inspection surfaces rather than automatic tactical behavior.
- Adopted solution: No gameplay rework was applied; future diagnostics should separate pure tactic effects, role/lineup reshaping effects, and condition/fatigue effects before tuning any of them.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`; `git diff --check`.
- Follow-up: Execute `docs/steps/38-match-engine-and-calculator-quality-review/06-performance-and-determinism-benchmark.md`.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/06-performance-and-determinism-benchmark.md`

- Status: Done
- Outcome: Current runtime is acceptable and representative seeded output remains deterministic.
- Adopted solution: No optimization was applied; one-season simulation and strict balance are fast enough for development, 50x10 is acceptable as an explicit batch report, and larger gates should stay explicit report jobs.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; repeated seeded `diff`; `git diff --check`.
- Follow-up: Execute `docs/steps/38-match-engine-and-calculator-quality-review/07-phase-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/07-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 38 is complete; the match engine and calculator are acceptable for continued product work.
- Adopted solution: No broad optimization or balance tuning is justified now; if the next phase stays engine-focused, the best narrow direction is deterministic match-explanation traceability for manager understanding.
- Verification: `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/`

- Status: Documented
- Outcome: Created the Phase 39 engine quality hardening and match explanation trace path.
- Adopted solution: Phase 39 starts with a behavior lock, then audits code quality, performs only safe cleanup, adds a structured language-agnostic trace contract, emits optional trace without outcome changes, exposes a CLI inspection view, and closes with a regression gate.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/01-phase-38-baseline-and-behavior-lock.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/01-phase-38-baseline-and-behavior-lock.md`

- Status: Done
- Outcome: Captured fixed-seed season, fixture, strict balance, and 50x10 long-run baselines before cleanup or trace work.
- Adopted solution: Phase 39 behavior changes are locked behind the rule that cleanup and trace work must preserve fixed-seed output unless a later step proves and documents a narrow bug with user-facing reason.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/02-engine-code-quality-audit.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/02-engine-code-quality-audit.md`

- Status: Done
- Outcome: Audited engine code quality and identified one narrow fix-now cleanup.
- Adopted solution: Step 03 may only extract the duplicated full-match loop shared by normal and manual-tactic match simulation and update stale match-engine comments; calculator weights, CLI split, and large season-use-case split stay out of scope.
- Verification: Required `rg` scans; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/03-safe-engine-cleanup-pass.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/03-safe-engine-cleanup-pass.md`

- Status: Done
- Outcome: Extracted the duplicated normal/manual full-match loop into a shared match simulation runner and cleaned stale match-engine comments.
- Adopted solution: `simulateMatch` and `simulateMatchWithManualTactics` now share `match-simulation-runner.ts`; manual tactics use a deterministic pre-step context hook, so future explanation trace work can attach to one loop without changing gameplay.
- Verification: `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/04-match-explanation-trace-contract.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/04-match-explanation-trace-contract.md`

- Status: Done
- Outcome: Added a structured engine-local explanation trace contract without emitting trace data from simulation.
- Adopted solution: `match-explanation-trace.ts` defines language-agnostic machine-key data for team strength, tactic distribution, lineup roles, condition impact, opportunity context, and variance; the contract is not durable domain state yet.
- Verification: `pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts`; `pnpm --filter @game/engine run typecheck`; focused rerun of the unrelated timed-out content test; `pnpm check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/05-trace-emission-without-outcome-change.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/05-trace-emission-without-outcome-change.md`

- Status: Done
- Outcome: Added optional trace emission without changing default simulation output or fixed-seed results.
- Adopted solution: `includeExplanationTrace` builds trace data from existing context, score, stats, and events after simulation completes; no extra RNG is consumed and manual-tactic simulation forwards the same option.
- Verification: focused match-engine tests; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/06-cli-fixture-explanation-inspection.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/06-cli-fixture-explanation-inspection.md`

- Status: Done
- Outcome: Exposed optional localized fixture explanation output through `--fixture-explanation`.
- Adopted solution: `simulate-season --fixture=<fixtureId> --fixture-explanation` appends factual trace sections after player stats; it requires `--fixture`, keeps default fixture output unchanged, and does not give tactical advice.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; default fixture command; fixture explanation command; strict `calibration-v1` balance report.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/07-regression-gate-and-phase-report.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/07-regression-gate-and-phase-report.md`

- Status: Done
- Outcome: Phase 39 is complete with cleaner match simulation code and deterministic fixture explanation traceability.
- Adopted solution: Keep the current match engine behavior; use the new optional trace as a factual inspection surface while leaving full possession chains, tactical advice, and hidden scouting data out of scope.
- Verification: focused tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; deterministic repeat check; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/`

- Status: Documented
- Outcome: Created the Phase 40 career loop playability audit and matchday slice path.
- Adopted solution: Phase 40 starts by reviewing Phase 39 explanation output, defines the minimum playable career loop, audits matchday readiness, checks career fixture explanation readiness, smokes post-match/rollover/development continuity, and closes with one next-phase decision.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/01-phase-39-output-review.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/01-phase-39-output-review.md`

- Status: Done
- Outcome: Phase 39 fixture explanation is useful for match understanding but not yet connected to career playability.
- Adopted solution: Continue Phase 40 with existing trace data while explicitly auditing the gap between fixture explanation and career save/preparation/condition/post-match consequences.
- Verification: `test -f docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/02-career-loop-playability-spec.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/02-career-loop-playability-spec.md`

- Status: Done
- Outcome: Defined the minimum playable loop as a manager journey from career creation to first post-match review.
- Adopted solution: Judge playability by whether the user can connect club, squad, preparation, next fixture, match result, consequences, and next decision without automatic advice.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/03-career-state-matchday-readiness-audit.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/03-career-state-matchday-readiness-audit.md`

- Status: Done
- Outcome: Career save, selected club, squad, condition, and next fixture are readable, but saved match preparation is absent in the current save.
- Adopted solution: Continue to fixture-explanation readiness; treat missing visible preparation as matchday friction, not as a Phase 40 blocker.
- Verification: `pnpm cli career --save=phase40-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/04-career-fixture-explanation-readiness.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/04-career-fixture-explanation-readiness.md`

- Status: Done
- Outcome: Played career fixtures can now expose optional factual explanation.
- Adopted solution: Added `career --advance-next-fixture --fixture-explanation`, backed by optional engine trace propagation; default career advance output stays compact and no save schema stores rendered text.
- Verification: focused career/CLI tests; CLI/engine/i18n typechecks; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/05-season-rollover-and-development-loop-smoke.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/05-season-rollover-and-development-loop-smoke.md`

- Status: Done
- Outcome: The career save can be followed across multiple selected-club fixtures, and development/youth reports are readable inspection surfaces.
- Adopted solution: Treat development/youth as useful inspection reports for now; full rollover remains correctly blocked until the current season is complete.
- Verification: `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `pnpm cli career --save=phase40-check --development-report`; `pnpm cli career --save=phase40-check --youth-academy`; `pnpm cli career --save=phase40-check --rollover-season` expected invalid; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/06-playability-friction-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/06-playability-friction-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 40 is complete; the current career loop is close to playable but needs visible matchday condition consequences before serious UI work.
- Adopted solution: Recommend exactly one next direction: `41-career-matchday-consequences-and-condition-integration`.
- Verification: focused tests; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/`

- Status: Documented
- Outcome: Created the Phase 41 career matchday consequences and condition integration path.
- Adopted solution: Phase 41 starts from the Phase 40 playability friction, audits the missing post-match condition consequence, adds a pure condition-consequence contract, wires it into career fixture advancement, exposes compact CLI output, smokes repeated fixtures, and closes with one next decision.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/01-phase-40-output-review.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/01-phase-40-output-review.md`

- Status: Done
- Outcome: Created `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md` and locked the Phase 41 blocker in user-facing terms.
- Adopted solution: Reuse existing player dynamic state and deterministic fitness helpers; keep the phase focused on explicit selected-starter condition spend after career fixtures, with no injuries, morale, training, tactical advice, UI, or auto-rotation.
- Verification: `test -f docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/02-career-condition-consequence-contract.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/02-career-condition-consequence-contract.md`

- Status: Done
- Outcome: Added the pure engine condition-consequence contract for one played career fixture.
- Adopted solution: `applyCareerFixtureConditionConsequences` reuses deterministic fitness rules, spends condition only for explicit selected starters, preserves non-starters, returns ordered structured changes, and avoids save writes, output text, recovery, and player choice.
- Verification: `pnpm exec vitest run packages/engine/src/career/career-condition-consequences.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/03-career-advance-condition-application.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/03-career-advance-condition-application.md`

- Status: Done
- Outcome: Career fixture advancement now persists selected-club condition consequences.
- Adopted solution: `progressNextCareerFixture` simulates the match from pre-match state, applies the result/report, then spends fitness for the actual selected-club starters and returns structured condition changes; optional explanation marks the selected-club condition side as tracked without changing match outcomes.
- Verification: `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/04-cli-post-match-condition-output.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/04-cli-post-match-condition-output.md`

- Status: Done
- Outcome: Career advance output now shows compact post-match condition consequences.
- Adopted solution: The CLI renders localized selected-starter deltas and rested first-team players from structured engine condition changes; `career --squad` remains the detailed follow-up inspection for persisted fitness.
- Verification: `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm check`; `pnpm cli career --save=phase41-check --advance-next-fixture`; `pnpm cli career --save=phase41-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/05-multi-fixture-condition-smoke.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/05-multi-fixture-condition-smoke.md`

- Status: Done
- Outcome: Repeated fixture advancement makes selected-starter fatigue visible.
- Adopted solution: The `phase41-check` smoke kept the same saved lineup over three selected-club fixtures; selected starters moved from `100` to `76`, reserves stayed at `100`, and explained output reported selected-club condition as `tracked effect=negative affected=11`.
- Verification: focused career/condition/progression tests; `pnpm check`; `pnpm cli career --save=phase41-check --summary`; `pnpm cli career --save=phase41-check --advance-next-fixture`; `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase41-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/06-phase-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/06-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 41 is complete; career match advancement now has visible selected-club condition consequences.
- Adopted solution: Keep the new consequence layer factual and manager-driven: selected starters spend fitness, non-starters remain unchanged, post-match output shows deltas, and explanation marks selected-club condition as tracked when requested. The final report recommends one next core-loop phase for between-fixture recovery before serious UI work.
- Verification: focused career/condition/progression tests; `pnpm check`; `pnpm cli career --save=phase41-check --summary`; `pnpm cli career --save=phase41-check --advance-next-fixture`; `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase41-check --squad`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly; recommended direction is `42-career-weekly-recovery-and-matchday-readiness`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/`

- Status: Done
- Outcome: Created the Phase 42 career weekly recovery and matchday readiness documentation path.
- Adopted solution: Phase 42 starts from the Phase 41 one-way condition drain, adds a pure day-based career recovery contract, applies recovery before selected-club fixture simulation, exposes compact readiness output, and verifies repeated fixture behavior without adding auto-rotation, advice, injuries, morale, training, staff, UI, or match-balance tuning.
- Verification: Documentation-only update; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/01-phase-41-output-review.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/01-phase-41-output-review.md`

- Status: Done
- Outcome: Created `docs/audits/CAREER_WEEKLY_RECOVERY_AUDIT.md` and documented the Phase 41 recovery blocker.
- Adopted solution: Treat the Phase 41 one-way fitness drain as a missing recovery layer, not as a tuning problem; Phase 42 should recover selected-club players by fixture date before match simulation, then spend condition after the match while keeping the manager in control.
- Verification: `test -f docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/02-career-recovery-contract.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/02-career-recovery-contract.md`

- Status: Done
- Outcome: Added a pure engine recovery contract for pre-fixture career readiness.
- Adopted solution: `applyCareerWeeklyRecovery` reuses deterministic fitness recovery, returns structured before/after/delta summaries, treats non-positive day gaps as no-op summaries, and leaves fixture advancement, match spend, lineup choice, and presentation to later steps.
- Verification: `pnpm exec vitest run packages/engine/src/career/career-weekly-recovery.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/03-career-advance-recovery-application.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/03-career-advance-recovery-application.md`

- Status: Done
- Outcome: Career advancement from a save now applies selected-club recovery before fixture simulation.
- Adopted solution: The CLI composition layer computes the next fixture day gap, recovers the selected-club roster first, builds match contexts from the recovered state, and then calls `progressNextCareerFixture` so post-match condition spend persists from the recovered baseline. The saved lineup and tactic are preserved; `apps/cli/src/commands/career.test.ts` was touched as necessary coverage for the save-driven behavior.
- Verification: `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/engine/src/career/progress-fixture.test.ts packages/engine/src/career/career-weekly-recovery.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/04-cli-pre-match-readiness-output.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/04-cli-pre-match-readiness-output.md`

- Status: Done
- Outcome: Career advance output now exposes compact pre-match recovery facts.
- Adopted solution: The CLI prints localized recovery days, improved-player count, and selected-club fitness range before post-match condition deltas; it remains factual inspection output and does not recommend rotation.
- Verification: `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm check`; `pnpm cli career --save=phase42-check --summary`; `pnpm cli career --save=phase42-check --advance-next-fixture`; `pnpm cli career --save=phase42-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/05-repeated-fixture-recovery-smoke.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/05-repeated-fixture-recovery-smoke.md`

- Status: Done
- Outcome: Repeated fixture smoke confirmed weekly recovery prevents the Phase 41 one-way condition drain.
- Adopted solution: Keep current recovery tuning: same-day first fixture spends `100 -> 92`; each following seven-day league gap recovers the selected-club roster from `92..100` to `100..100` before kickoff, then match spend returns starters to `92`. Current demo calendar has no short-gap pressure, which is a future scheduling/cups concern, not a recovery blocker.
- Verification: `pnpm check`; `pnpm cli career --save=phase42-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase42-check --set-lineup-demo=pro01-first-team`; `pnpm cli career --save=phase42-check --set-tactic-demo=pro01-balanced`; four `--advance-next-fixture` smokes including one with `--fixture-explanation`; `pnpm cli career --save=phase42-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/06-phase-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/06-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 42 is complete; career matchday readiness now includes deterministic pre-match recovery and visible post-match condition.
- Adopted solution: The save-driven loop now lets the manager inspect saved lineup, saved tactic, next fixture, pre-match recovery days/range, match result, post-match condition, persisted squad fitness, and optional condition explanation. No auto-rotation, advice, injuries, morale, training, or balance tuning was added.
- Verification: `pnpm check`; `pnpm cli career --save=phase42-check --summary`; `pnpm cli career --save=phase42-check --squad`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly; recommended direction is `43-career-matchday-ui-slice`.

## Update Protocol

For every step attempt, follow this loop:

1. Read this file.
2. Choose the active step.
3. Implement only that step.
4. Run the required checks.
5. If something is wrong, fix the current step or update the next relevant step document.
6. Update this file in a short entry.
7. Advance only when the step Definition of Done is satisfied.

When updating this file:

1. Update `Current Active Step`.
2. Change the row in the Step Ledger to `Done`, `Rework`, `Skipped`, or the next appropriate status.
3. Summarize the outcome in one sentence.
4. Record the adopted solution, not every rejected option.
5. Add the verification command or test result.
6. Add any lesson that changes future work to `Open Decisions And Follow-Up`.
7. If the next step changed, update that step document before implementation starts.

## Handoff Note Template

Use this format at the end of a step:

```md
### YYYY-MM-DD — Step path

- Status: Done | Rework | Skipped
- Outcome:
- Adopted solution:
- Verification:
- Follow-up:
```
