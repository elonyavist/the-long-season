# Architecture Long-Run Diagnostics Review

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`
Step: `06-long-run-diagnostics-module-cleanup`

## Summary

Long-run diagnostic meaning mostly already lives in `@game/simulation-tools`.
The CLI is still large, but much of its remaining size is adapter work:

- creating fake content worlds;
- creating in-memory career states;
- applying report-only player development, exits, intake, transfer turnover,
  youth lifecycle, and season rollover;
- formatting localized console and Markdown output.

The safe cleanup slice for this step was to move the shared PASS/WARN/FAIL
combination rule into simulation tools:

- added `worstLongRunAnomalyStatus` to
  `packages/simulation-tools/src/long-run/anomaly-scoring.ts`;
- exported it from `packages/simulation-tools/src/index.ts`;
- replaced the duplicated CLI `worstReportStatus` helper in
  `apps/cli/src/commands/ten-season-report.ts`;
- added a focused test for status-combination semantics.

This keeps diagnostic severity semantics in the diagnostics package while
leaving presentation sorting in the CLI.

## Ownership Decision

Belongs in `@game/simulation-tools`:

- anomaly thresholds;
- warning/failure semantics;
- PASS/WARN/FAIL status combination;
- report model contracts for player evolution, club stability, youth stability,
  and anomaly checks.

Belongs in CLI for now:

- fake content generation;
- career-state construction for report runs;
- localized output;
- Markdown file output;
- report sections that require `@game/content`, `@game/i18n`, or app-local
  career types.

## Why Not Move More Now

Moving `createSingleWorldReport` or the batch gate model wholesale into
`@game/simulation-tools` would require one of these bad tradeoffs:

- importing `@game/content` into simulation tools, which violates the package
  direction;
- inventing a broad callback interface before the future UI shape is known;
- duplicating report builders between CLI and simulation tools.

The current code is still too large, but the next useful extraction should be
done after a dedicated diagnostics phase, where the desired report model can be
designed without dragging presentation or content dependencies inward.

## Future Cleanup Candidates

1. Split CLI long-run rendering into a `ten-season-report/format.ts` module.
2. Move content-free gate aggregation into simulation tools only if the input
   contracts can stay small and app-provided.
3. Keep localized labels out of simulation tools.
4. Keep report file writing in CLI or a future app shell, not in simulation
   tools.

## Verification

Verification is recorded in `docs/PROJECT_STATUS.md` for this step.
