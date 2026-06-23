# Ten-Season Report Decomposition Report

Date: 2026-06-23
Phase: `46-ten-season-report-decomposition-and-long-run-presentation-boundaries`
Status: Complete

## Purpose

Close Phase 46 after decomposing the ten-season and long-run report command into
clearer data and presentation boundaries.

This phase did not tune the game. Its purpose was to make the report easier to
read, test, and eventually expose to UI/reporting work without hiding warnings
that matter for user fun.

## Files Changed In This Phase

- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `packages/i18n/src/labels.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md`
- `docs/audits/LONG_RUN_WARNING_PRESENTATION_REVIEW.md`
- `docs/audits/LONG_RUN_MANUAL_INSPECTION_GUIDE.md`
- `docs/audits/TEN_SEASON_REPORT_BOUNDARY_REVIEW.md`
- `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_REPORT.md`

## Modules Created Or Clarified

### Command Adapter

`apps/cli/src/commands/ten-season-report.ts` is now the command entry point. It
parses args, creates the translator, selects single-world or batch mode, writes
optional report artifacts, and delegates work.

It no longer owns the bulk of report facts or output sections.

### Report Data Builder

`apps/cli/src/commands/ten-season-report/report-data.ts` owns CLI-local report
facts:

- generated world creation;
- in-memory career state creation;
- career long-run execution;
- report-only post-season refresh;
- single-world report bundles;
- multi-world gate aggregation;
- warning/fail key counts;
- signal grouping for `story`, `monitor`, and `structural`.

This remains CLI-local because it composes content, engine, simulation-tools,
and career scenario setup. It should not move into `simulation-tools` while it
depends on fake content and app-specific career setup.

### Single-World Renderer

`apps/cli/src/commands/ten-season-report/single-world-output.ts` owns one-world
human-readable output:

- season summaries;
- player evolution;
- club strength hierarchy;
- club stability;
- youth stability;
- anomaly rows.

### Gate Renderer

`apps/cli/src/commands/ten-season-report/gate-output.ts` owns batch gate output:

- terminal gate summary;
- worst-world compact rows;
- localized signal guide;
- Markdown artifact output.

## Behavior Preserved

The following intentionally did not change:

- match engine behavior;
- season simulation behavior;
- career refresh rules;
- player generation;
- youth academy behavior;
- market behavior;
- development and aging behavior;
- long-run thresholds;
- anomaly key names;
- PASS/WARN/FAIL severity rules.

Phase 46 changed structure and presentation clarity only.

## Warning Presentation Improvement

The gate output now includes a localized guide:

`Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk`

This helps the user read warning rows without treating every warning as a bug.
The report still shows all warning keys and fail keys.

## Verification

Checks run during the phase:

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused ten-season-report tests
- focused i18n tests
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase46-builder --worlds=10 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=10 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=50 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-warning --worlds=50 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=10 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=50 --seasons=10`
- final Phase 46 checks listed in `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/07-phase-report-and-next-phase-decision.md`

All completed checks passed.

## Remaining Risks

- `report-data.ts` is still large. It is coherent today, but future additions
  should avoid turning it into another command-sized file.
- Markdown report rendering is still developer-report oriented and English-only.
  If it becomes player-facing, introduce localized or structured export
  presentation.
- Signal grouping is currently report language, not a simulation-tools rule. If
  future UI needs it, expose structured metadata rather than parsing CLI text.
- The long-run report remains a diagnostic surface. It should support product
  decisions, not replace human review of whether worlds are fun.

## Recommended Next Phase

Recommended next phase:

`Phase 47 - Career UI Slice Readiness And First Screen Scope`

Reason:

Phases 43-46 have reduced adapter and presentation complexity enough to start
defining the first UI-facing career slice without pulling UI directly from raw
CLI prose. The next phase should not build a full UI yet. It should define the
first screen scope, the read-model/view-model contracts, and the minimum career
actions needed to make a first playable UI slice understandable.

Do not start Phase 47 until its documentation is explicitly requested.
