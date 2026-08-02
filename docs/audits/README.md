# Audit And Report Index

This directory contains reports that explain project decisions, audits, and readiness gates.

Normal active reading path:

1. `requirements.md`
2. `docs/PROJECT_RULES.md`
3. `docs/PROJECT_STATUS.md`
4. the active phase README under `docs/steps/`
5. only the audit/report explicitly referenced by the active step

Do not read every report in this directory before every step. Most reports are historical context.

## Active Reports

Read these only when the current step asks for current long-run readiness context:

- `PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_REPORT.md` - Step 09
  closeout: all `32` player-model gates pass in the deterministic `750 x 3`
  fresh/resume cohort, while `80` high-side `goals_per_match_avg` monitor
  failures keep the phase report red. The 2026-08-02 decision transfers that
  monitor unchanged to Phase 81, which owns match scoring.
- `PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_BASELINE.md` -
  replayable 20-world pre-change joint profile, current generation/development/
  projection/value/AI ownership inventory, canonical age semantics, superseded
  calibration evidence, and thresholds frozen before Phase 80A behaviour
  changes.
- `PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_DESIGN_CONTRACT.md` -
  accepted current/P50/upper, dynamic club environment, quarterly development,
  contextual prospect generation, national exceptional stock, annual intake,
  context-invariant global expected-value/calibration epoch, AI-parity,
  beta-reset, and diagnostic contract.
- `PHASE_82A_INCOMING_OFFERS_MARKET_POSTURES_AND_LOANS_DESIGN_CONTRACT.md` -
  accepted selected-club incoming-offer, market-posture, final-counter,
  bidirectional-loan, explicit ownership/selectability accessors,
  per-buyer/player negotiation invariants, outgoing-action versus
  seller-willingness semantics, wage-sharing, real-development, persistence,
  and bounded-closeout contract.
- `PHASE_82B_COMPETITIVE_TRANSFER_RACE_DESIGN_CONTRACT.md` - accepted durable
  race coordination, three-active-buyer cap, highest-fee qualification,
  stale-safe raises, fixed three-day stages, serial-loan scope, player choice,
  free-agent negotiation, dedicated diagnostics, and the second checkpointed
  market cohort.
- `PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`
  - accepted typed tactical-context, intrinsic-shape, relational-matchup,
  role-suitability, tactic-semantics, causal-actor, live-session, shared-AI,
  non-vacuous diagnostic, clean-code, and checkpointed-cohort contract, amended
  2026-08-02 with the carried goal-rate monitor and the background-world seams.

The two market contracts were numbered 80B and 80C before 2026-08-02. Reports
written earlier keep the old numbers on purpose: they record what was true when
they were written and are not retroactively renumbered.
- `PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md` - accepted
  evidence, ownership, interaction defaults, non-goals, and ordered delivery
  for the five current Squad/Market reworks and their Phase 80A handoff.
- `PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_REPORT.md` - completed Phase 80
  delivery for all five accepted items, the defects found and fixed while
  proving them, the obsolete-path absence checks, manual-inspection targets,
  residual monitor items, and the truthful Phase 80A handoff.
- `SIMULATION_EXECUTION_POLICY.md` - repository-wide default/maximum
  seven-worker budget for current and future batch simulations, including
  checkpoint and determinism constraints.
- `EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_REPORT.md` -
  completed Phase 79D implementation and bounded verification, explicit record
  that the stopped `50 x 20` produced no evidence, and the user decision to
  defer a checkpointed cohort now owned by Phase 81 Step 12.
- `EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_SPEC.md` - accepted
  corrective contract for archetype-compatible exceptional generation,
  effective rarity budgets, derived public potential ranges, range-aware
  prospect valuation, display-safe cap semantics, negotiation spread, annual
  intake, and non-vacuous diagnostics.
- `EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_BASELINE.md` -
  reproducible 100-world pre-change joint-profile baseline, supplied Phase 79C
  negotiation facts, deterministic engine development-outcome matrix, and
  twelve-defect metric/source trace for Phase 79D.
- `GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_REPORT.md` - completed Phase 79C
  implementation, verification, residual warnings, and Phase 79 handoff.
- `GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md` - generated
  bounded three-division cohort evidence.
- `GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_CALIBRATION_SPEC.md` - accepted
  product, source, scale, economy, and tolerance contract implemented by
  Phase 79C.
- `DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md` - accepted bounded fictional
  three-tier topology and source/design separation implemented by Phase 79C.
- `PLAYER_MARKET_CALIBRATION_PROVENANCE_LEDGER.md` and
  `WAGE_AND_CLUB_FINANCE_CALIBRATION_SOURCE_AUDIT.md` - reproducible market
  evidence and independent wage/finance evidence used by Phase 79C.
- `DOCUMENTATION_NOISE_AUDIT.md` - Phase 26 classification of active, historical, archive, and deletion candidates.
- `CURRENT_ENGINE_BASELINE.md` - concise current engine/career baseline before long-run work.
- `LONG_RUN_METRICS_SPEC.md` - mandatory and deferred metrics for the ten-season credibility report.
- `LONG_RUN_READINESS_REPORT.md` - Phase 26 closeout and Phase 27 readiness decision.

## Recent Historical Reports

These are useful when a step explicitly touches the related system:

- `CAREER_MATCH_PREPARATION_GAP_REVIEW.md`
- `CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md`
- `PLAYER_GENERATION_QUALITY_AUDIT.md`
- `PLAYER_GENERATION_QUALITY_REWORK_REPORT.md`
- `PLAYABLE_CAREER_LOOP_MVP_REPORT.md`
- `PLAYABLE_LOOP_READINESS_REPORT.md`
- `NEW_CAREER_WORLD_GENERATION_REPORT.md`
- `MARKET_MVP_REPORT.md`
- `IDENTITY_FOUNDATION_REPORT.md`
- `CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `CORE_CLEANUP_REPORT.md`
- `ENGINE_CORE_AUDIT.md`
- `PRE_PLAYABLE_LOOP_HARDENING_REPORT.md`
- `PROJECT_ROADMAP_AND_CODE_AUDIT.md`

## Retention Policy

Keep in `docs/audits/` when a report:

- records an adopted architecture or product decision still affecting implementation;
- is referenced by current or future step docs;
- explains a recent phase output that has not yet been summarized by a newer baseline;
- is a current Phase 26-30 readiness artifact.

Move to `docs/archive/` when a report or roadmap:

- is useful history but no longer guides the current implementation order;
- has phase numbering that conflicts with the current `docs/steps/` sequence;
- is a speculative roadmap superseded by a later status decision;
- is only needed when investigating why an old choice was made.

Delete only when:

- the document contains no unique decision history;
- the same content is fully preserved in a newer active document;
- `docs/PROJECT_STATUS.md` records the deletion reason.

Current deletion candidates: none.

## Archived In Phase 26

The following roadmap documents were moved out of the active path:

- `docs/archive/roadmaps/ROADMAP_PHASES_07_20.md`
- `docs/archive/roadmaps/market-roadmap/`

Reason: both still contain useful historical planning, but their sequencing is superseded by the current Phase 26-30 long-run simulation path in `docs/PROJECT_STATUS.md`.
