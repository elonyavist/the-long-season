# Documentation Noise Audit

Date: 2026-06-21
Phase: `26-project-cleanup-and-long-run-readiness`
Step: `01-documentation-noise-audit`
Status: Complete

## Summary

The documentation set is useful but too noisy for the next milestone. The project now needs a tighter active reading path focused on long-run simulation readiness, not older speculative roadmaps or market-only planning tracks.

No files were moved or deleted in this step.

## Active Guidance

These documents should remain in the normal first-read path:

- `requirements.md`
- `docs/PROJECT_RULES.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- current phase docs under `docs/steps/26-project-cleanup-and-long-run-readiness/`
- planned long-run path docs under:
  - `docs/steps/27-season-rollover-foundation/`
  - `docs/steps/28-player-development-and-aging-v1/`
  - `docs/steps/29-club-identity-and-world-calendar-v1/`
  - `docs/steps/30-ten-season-simulation-report/`

Reason: these files define the current product intent, non-negotiable rules, execution loop, active step, and the approved Phase 26-30 direction.

## Keep As Historical Reference

These reports should remain available because they explain adopted decisions or recent architecture:

- `docs/audits/CAREER_MATCH_PREPARATION_GAP_REVIEW.md`
- `docs/audits/CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md`
- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/audits/CORE_CLEANUP_REPORT.md`
- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/audits/IDENTITY_FOUNDATION_REPORT.md`
- `docs/audits/MARKET_MVP_REPORT.md`
- `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`
- `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md`
- `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`
- `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md`
- `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md`
- `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md`
- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`

Reason: many of these are superseded as active guidance, but they still record why previous phases made specific decisions. Step 02 should create an audit index so future readers know which ones are current versus historical.

## Archive Candidates

These files create active-path noise because their roadmap sequencing is superseded by the Phase 26-30 direction:

- `docs/ROADMAP_PHASES_07_20.md`
- `docs/market-roadmap/README.md`
- `docs/market-roadmap/phases/phase-16-market-mvp-permanent-transfers.md`
- `docs/market-roadmap/phases/phase-17-career-state-and-transfer-persistence.md`
- `docs/market-roadmap/phases/phase-18-loans-mvp.md`
- `docs/market-roadmap/phases/phase-19-contracts-and-wages.md`
- `docs/market-roadmap/phases/phase-20-scouting-and-information-quality.md`
- `docs/market-roadmap/phases/phase-21-ai-club-market-behavior.md`
- `docs/market-roadmap/phases/phase-22-negotiation-v1.md`
- `docs/market-roadmap/phases/phase-23-transfer-windows-and-registration.md`
- `docs/market-roadmap/phases/phase-24-structured-transfer-deals.md`
- `docs/market-roadmap/phases/phase-25-market-balance-and-economy-review.md`

Reason: the market roadmap was useful to reason about dependencies, but the project is no longer following that market-only sequence. It should be archived as historical planning, not deleted.

## Deletion Candidates

None.

Reason: the current cleanup goal is to reduce noise without losing decision history. Archiving is enough for this phase.

## Notes On Step Docs

Completed phase step docs under `docs/steps/00-*` through `docs/steps/25-*` are verbose, but they are not deletion candidates. They are execution history and can remain under `docs/steps/`.

Future cleanup may add a generated index, but this phase should not rewrite historical step files.

## Next Cleanup Action

Step 02 should create:

- `docs/audits/README.md` as the active audit/report index;
- `docs/archive/README.md` as the archive policy and map.

Step 03 should then archive only the approved roadmap candidates, preserving historical value while removing them from the normal active path.

