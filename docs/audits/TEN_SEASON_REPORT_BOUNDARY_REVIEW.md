# Ten-Season Report Boundary Review

Date: 2026-06-23
Phase: `46-ten-season-report-decomposition-and-long-run-presentation-boundaries`
Step: `06-presentation-boundary-review-and-architecture-update`

## Purpose

Review the implemented Phase 46 boundary for the ten-season and long-run report
command after splitting report data construction from CLI rendering.

The goal is readability and traceability. No simulation behavior, diagnostic
threshold, or gameplay rule was changed.

## Current Module Map

| File | Current responsibility |
|---|---|
| `apps/cli/src/commands/ten-season-report.ts` | Public command adapter: parses args, selects single-world vs multi-world mode, creates translator, writes optional report artifact, and handles IO errors. |
| `apps/cli/src/commands/ten-season-report/report-data.ts` | CLI-local report facts boundary: builds generated worlds, creates report-only career state, runs career long-run simulation, applies report-only post-season refresh, creates single-world bundles, summarizes multi-world gate facts, classifies warning signal families, and exposes stable report types. |
| `apps/cli/src/commands/ten-season-report/single-world-output.ts` | Single-world text renderer: season summaries, player evolution, strength hierarchy, club stability, youth stability, and anomaly rows. |
| `apps/cli/src/commands/ten-season-report/gate-output.ts` | Multi-world gate renderer: concise terminal summary, worst-world rows, signal guide, and Markdown report artifact. |
| `packages/simulation-tools/src/long-run/*` | Generic long-run runners and diagnostic report models: player evolution, club stability, youth stability, anomaly status, and PASS/WARN/FAIL semantics. |
| `packages/i18n/src/labels.ts` | Reusable localized labels for CLI/UI-facing long-run presentation text. |

## Command Entry Point

`ten-season-report.ts` is now a narrow adapter. It should stay responsible for:

- command parsing and help/errors;
- language selection;
- deciding between `--seed` and `--seed-prefix --worlds`;
- writing `--report-output`;
- joining formatted lines with IO.

It should not regain report aggregation helpers, post-season refresh logic, or
section rendering.

## Report Data Builder

`report-data.ts` is intentionally the largest Phase 46 module. It owns facts,
not terminal prose.

It is still CLI-local because it composes content, engine refresh functions,
career scenario creation, generated player labels, and simulation-tools models.
Moving it into `simulation-tools` would incorrectly pull fake content and CLI
career setup concerns into a package that must stay content/storage/i18n
independent.

Future splits should happen only when they produce a real concept boundary, for
example:

- report-only career refresh;
- gate world summarization;
- player/club/youth row builders.

Do not split it into generic wrappers just to reduce line count.

## Section Renderers

The renderer modules now consume structured report facts and translators:

- `single-world-output.ts` renders one world for human diagnosis;
- `gate-output.ts` renders multi-world summaries and Markdown artifacts.

These modules should not compute new diagnostics. Formatting values is allowed;
deciding what a warning means belongs in report data or simulation-tools.

## Warning Semantics Ownership

Stable anomaly checks and PASS/WARN/FAIL thresholds live in
`packages/simulation-tools/src/long-run/anomaly-scoring.ts` and
`packages/simulation-tools/src/long-run/youth-stability.ts`.

Batch-level signal grouping lives in `report-data.ts` because it is report
language:

- `story`;
- `monitor`;
- `structural`.

The renderer displays the grouped counts and localized signal guide. It does not
change warning status.

## Localization Ownership

Visible CLI labels belong in `@game/i18n`.

Machine-readable anomaly keys stay untranslated in output because they are
stable diagnostic handles used by tests, docs, and follow-up inspection. Future
UI can pair those keys with localized explanations without changing the keys.

The Markdown artifact currently uses English developer headings. This is
acceptable for now because it is an audit/report artifact, not a player UI
surface. If the Markdown report becomes player-facing, it should get the same
localized label treatment as terminal output.

## Remaining Risks

- `report-data.ts` is still large. It is coherent but should be watched when
  adding new long-run facts.
- Markdown rendering is still in `gate-output.ts`. This is acceptable while the
  artifact is developer-facing; a player-facing report should use a separate
  view-model/export boundary.
- Signal grouping is currently CLI-local report language. If future UI needs the
  exact same grouping, keep it as structured report metadata rather than
  parsing output text.
- The report-only career refresh bridge is app-specific and should not move into
  `simulation-tools` unless content/career setup dependencies are removed.

## Result

The current boundary is good enough for Phase 46:

- the public command is readable;
- data building and rendering are separate;
- warning meaning is easier to inspect;
- architecture docs now point a junior developer to the right files.
