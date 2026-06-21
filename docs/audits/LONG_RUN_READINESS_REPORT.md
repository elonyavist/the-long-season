# Long-Run Readiness Report

Date: 2026-06-21
Phase: `26-project-cleanup-and-long-run-readiness`
Step: `06-phase-report-and-phase-27-readiness`
Status: Complete

## Purpose

This report closes Phase 26. It confirms that the project has reduced documentation noise and is ready to start the season rollover foundation required for credible long-run simulation.

## What Was Archived

The following planning documents were moved out of the active implementation path:

- `docs/ROADMAP_PHASES_07_20.md` -> `docs/archive/roadmaps/ROADMAP_PHASES_07_20.md`
- `docs/market-roadmap/` -> `docs/archive/roadmaps/market-roadmap/`

Nothing was deleted. These files remain available as historical context, but they are no longer active planning sources.

## Active Report Structure

Active reports now live in `docs/audits/` and should be read only when the current step references them.

Current active Phase 26 reports:

- `docs/audits/DOCUMENTATION_NOISE_AUDIT.md`
- `docs/audits/CURRENT_ENGINE_BASELINE.md`
- `docs/audits/LONG_RUN_METRICS_SPEC.md`
- `docs/audits/LONG_RUN_READINESS_REPORT.md`

Archive policy:

- Keep active reports in `docs/audits/`.
- Move historical context to `docs/archive/`.
- Delete only when a document has no unique decision/history value and the reason is recorded in project status.

## Current Engine Baseline Summary

The engine is strong enough for deterministic one-season lab work:

- match simulation is deterministic and event-based;
- lineups, tactics, manual tactical switches, condition, and rotation exist;
- season simulation produces fixture results, tables, top scorers, assists, saves, and balance reports;
- career persistence can save/load worlds, apply permanent transfers, save match preparation, and advance selected-club fixtures;
- player generation has role templates, division/tier bands, potential classes, and rarity budgets;
- market MVP supports permanent-transfer valuation, willingness, rejection, acceptance, and persistence.

The engine is not yet a long-run career system:

- no season completion contract;
- no next-season calendar generation;
- no season archive;
- no age/state rollover;
- no player growth or decline;
- no deterministic ten-season runner/report.

## Long-Run Metrics Summary

The ten-season report must measure:

- season results and table credibility;
- player growth, decline, prospects, and rare white-fly outcomes;
- aging distribution and veteran decline;
- squad and club stability;
- available market turnover;
- anomaly categories such as overpowered lower-division players, frozen worlds, runaway champions, weak prospect pipelines, and missing systems.

The report should decide whether the project is:

- ready for UI exploration;
- in need of tuning;
- missing required systems;
- blocked by determinism or persistence problems.

## Phase 27 Readiness

Phase 27 can start.

Reason:

- documentation noise has been reduced;
- the active baseline is clear;
- the metrics target for Phase 30 is explicit;
- the next missing technical foundation is season rollover, not more CLI inspection.

Next active step:

- `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md`

## Manual Inspection

Before implementing Phase 27, a developer should inspect:

1. `docs/audits/CURRENT_ENGINE_BASELINE.md`
2. `docs/audits/LONG_RUN_METRICS_SPEC.md`
3. `docs/steps/27-season-rollover-foundation/README.md`
4. `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md`

## Conclusion

Phase 26 is complete. The project should now build the minimum rollover foundation required to simulate multiple seasons, then add player development and finally produce the ten-season credibility report before any UI push.
