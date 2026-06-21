# Phase 27 - Season Rollover Foundation

## Goal

Make a career save capable of finishing one season and starting the next one.

This is the foundation for any 5-10 season simulation. Without season rollover, player development, market evolution, and long-run reports are not meaningful.

## Product intent

- A career is multi-season, not a one-season sandbox.
- The save should preserve history while preparing the next season.
- Calendar generation must be repeatable by season.
- Players should age.
- Player states should roll over intentionally.
- The implementation should stay narrow and deterministic.

## Step order

1. `01-season-completion-contract.md`
2. `02-next-season-calendar-generation.md`
3. `03-career-season-archive.md`
4. `04-player-age-and-state-rollover.md`
5. `05-cli-lab-rollover-smoke.md`
6. `06-phase-report-and-phase-28-readiness.md`

## Phase constraints

- Do not implement player growth yet; that belongs to Phase 28.
- Do not implement promotions/relegations unless explicitly documented as a minimal placeholder.
- Do not implement youth intake.
- Do not implement UI.
- Do not implement advanced market AI.
- Do not change match-engine scoring calibration.
- Keep all game time in `GameDate`.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched domain/engine/storage/CLI/i18n files;
- `pnpm check`;
- a career create -> simulate/complete season -> rollover -> inspect smoke command defined by the phase;
- `git diff --check`.

## Definition of Done

- The engine can identify a completed season.
- A career save can create or attach the next season calendar.
- Season summary history is archived.
- Players age by one season.
- player dynamic state rollover is explicit and deterministic.
- A CLI lab smoke proves rollover from an existing save.

