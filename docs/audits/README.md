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
