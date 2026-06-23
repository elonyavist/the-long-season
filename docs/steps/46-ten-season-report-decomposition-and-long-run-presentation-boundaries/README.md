# Phase 46 - Ten-Season Report Decomposition And Long-Run Presentation Boundaries

## Goal

Reduce the complexity of the ten-season and long-run report presentation layer
after the Phase 44 and Phase 45 CLI decomposition work.

The goal is not to change the simulation, market, youth academy, match engine,
player generation, player development, or diagnostic thresholds. The goal is to
make the long-run report code easier to trace, test, and eventually expose to a
UI/reporting surface without losing the product focus: the report exists to help
us understand whether the game remains fun, credible, and structurally stable
over many seasons.

Current long-run reporting should be treated as a product-facing diagnostic
surface:

- it explains whether worlds survive multiple seasons;
- it highlights squad, table, scoring, market, youth, and development signals;
- it separates real gameplay concerns from healthy football variance;
- it should not hide warnings just to make the output look cleaner.

## Product intent

- Keep the long-run reports focused on user fun and football credibility, not
  pure mathematical neatness.
- Preserve existing simulation behavior and diagnostic meaning unless a step
  explicitly documents a semantic mismatch.
- Make warnings easier to understand as gameplay signals, monitoring signals,
  or healthy variance.
- Keep the CLI usable as the current inspection surface before UI work.
- Prepare report facts so future UI screens can consume structured data rather
  than parsing CLI prose.

## Architecture intent

- Keep CLI adapters responsible for argument parsing, command orchestration, and
  localized text output.
- Keep long-run diagnostic facts and status semantics outside presentation-only
  string formatting.
- Separate report data building from CLI rendering.
- Split rendering by report section instead of adding generic wrappers.
- Avoid dead compatibility helpers, duplicate renderers, or deferred cleanup.
- Keep code easy for a junior developer to follow from command entry point to
  report output.

## Ordered steps

1. `01-ten-season-report-responsibility-audit.md`
2. `02-long-run-report-data-builder-boundary.md`
3. `03-long-run-cli-output-renderers.md`
4. `04-warning-semantics-presentation-cleanup.md`
5. `05-long-run-manual-inspection-command-review.md`
6. `06-presentation-boundary-review-and-architecture-update.md`
7. `07-phase-report-and-next-phase-decision.md`

## Phase-level checks

- Focused tests for every touched CLI or simulation-tools module.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck` when long-run
  simulation-tools modules are touched.
- `pnpm --filter @game/i18n run typecheck` when localized output is touched.
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase46-check --worlds=10 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-check --worlds=50 --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## What NOT to implement in this phase

- No gameplay tuning.
- No match engine algorithm changes.
- No player generation tuning.
- No market, youth academy, development, or rollover behavior changes.
- No diagnostic threshold changes unless a step proves the current presentation
  semantics are wrong and scopes the change explicitly.
- No UI.
- No new package.
- No new career save schema.
- No new long-run gate target.
- No warning removal just to make the report look cleaner.
- No CLI command rewrite beyond the documented report presentation boundary.
- No moving localized presentation text into engine, content, storage, or
  simulation-tools packages.
- No dead wrappers, compatibility aliases, or temporary duplicate output paths.

## Definition of Done

- Ten-season/long-run report responsibilities are documented and easier to
  trace.
- Report data building is separated from CLI section rendering where useful.
- Warning presentation explains gameplay meaning more clearly without hiding
  real signals.
- Existing report commands remain deterministic.
- Long-run report smoke checks still run successfully.
- `docs/ARCHITECTURE.md` describes the current long-run report boundary.
- `docs/PROJECT_STATUS.md` records verification and one recommended next phase.
