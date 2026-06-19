# Balance Calibration Steps

## Goal

Turn the first deterministic season simulator into an iterative statistical calibration loop.

## Why we implement it this way

`requirements.md` requires statistical truth validated through batch simulation. Phase 2 proved that seasons can be simulated end-to-end and reported from CLI, but the first observed samples are under-scoring and draw-heavy. Phase 3 exists to tighten calibration without adding unrelated gameplay systems.

This phase must stay empirical: measure first, change one narrow surface, rerun the same deterministic report, and document the result.

## What to implement

- Preserve the broad default smoke targets from Phase 2.
- Add a stricter calibration profile for football-like aggregate targets.
- Use deterministic CLI batches to compare before and after changes.
- Tune only the smallest documented surface per step.
- Capture observed balance samples in project status or the relevant step document.
- Keep calibration targets aggregate and hand-authored until real-data policy work explicitly permits external reference data.

## What NOT to implement

- Do not scrape, import, or copy real football datasets.
- Do not add real club, player, competition, stadium, or market identities.
- Do not implement UI, SQLite, Web Worker, Tauri, modding editor, economy, transfers, injuries, cards, youth, staff, or facilities.
- Do not add player-level match events or scorer attribution in this phase unless a later documented step explicitly changes the phase scope.
- Do not hide calibration by changing tests only; every tuning change must be visible in a batch report.

## Allowed dependencies

- `packages/content -> domain, shared`
- `packages/simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/engine -> domain, shared` only when the active step explicitly allows engine tuning.

## Expected files

- `docs/steps/03-balance-calibration/01-calibration-target-profile.md`
- `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md`
- `docs/steps/03-balance-calibration/03-table-spread-review.md`
- `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 3 has a documented incremental path.
- The first active step is small enough to execute without tuning the engine.
- Calibration can proceed without changing `docs/PROJECT_RULES.md`.
- Future feature systems remain outside this phase.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/03-balance-calibration/01-calibration-target-profile.md`. Implement only the active calibration target profile step. Do not tune match-engine rates until the next step.
