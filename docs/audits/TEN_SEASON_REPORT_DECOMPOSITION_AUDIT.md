# Ten-Season Report Decomposition Audit

Date: 2026-06-23
Phase: `46-ten-season-report-decomposition-and-long-run-presentation-boundaries`
Step: `01-ten-season-report-responsibility-audit`

## Purpose

This audit maps the current ten-season and long-run gate report responsibilities
before moving source code.

The objective is architectural clarity, not greener reports. The report is a
product diagnostic surface: it helps us decide whether long career worlds remain
fun, credible, and structurally healthy.

## Files Reviewed

- `apps/cli/src/commands/ten-season-report.ts`
- `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/club-stability.ts`
- `packages/simulation-tools/src/long-run/player-evolution.ts`
- `packages/simulation-tools/src/long-run/youth-stability.ts`
- `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`
- `docs/audits/TABLE_SPREAD_ANOMALY_AUDIT.md`
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md`
- `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md`

## Current Shape

`apps/cli/src/commands/ten-season-report.ts` currently owns a very broad slice
of the long-run reporting feature. At review time it is about `2288` lines.

The file includes:

- command argument parsing;
- command IO;
- single-world report creation;
- multi-world gate report creation;
- world summary aggregation;
- post-season career refresh for the report;
- youth and senior intake candidate generation bridges;
- player, club, youth, balance, production, and anomaly row builders;
- worst-world sorting;
- signal-kind grouping;
- CLI output rendering;
- Markdown artifact rendering;
- workspace path resolution for report output.

The simulation-tools package already owns the stable diagnostic models and
threshold checks, but the CLI command still owns many report-specific facts
around those models.

## Responsibility Map

### CLI Command Parsing

Current owner:

- `apps/cli/src/commands/ten-season-report.ts`

Current responsibilities:

- parse `--seed`;
- parse `--seed-prefix`;
- parse `--seasons`;
- parse `--worlds`;
- parse `--report-output`;
- parse `--lang`;
- select single-world or multi-world mode;
- write help and argument errors through localized messages.

Assessment:

- This responsibility belongs in the CLI adapter.
- It should not move in Phase 46 unless a later renderer split makes tiny import
  cleanup necessary.

### Long-Run Simulation Execution

Current owners:

- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `apps/cli/src/commands/ten-season-report.ts`

Current flow:

1. CLI creates fake content with `createFakeLeagueSystem`.
2. CLI creates a career state with `careerStateFromNewWorld`.
3. `runCareerLongRunSimulation` sequences each season and delegates:
   - season input creation back to the CLI;
   - post-season refresh back to the CLI.
4. CLI applies the report-only career refresh pipeline:
   - `developPlayersForSeason`;
   - `applyEndOfSeasonPlayerExits`;
   - `applyYouthAcademyLifecycle`;
   - `applySeasonalYouthIntake`;
   - `promoteYouthCandidatesToSeniorSquads`;
   - `maintainCareerSquadShape`;
   - `simulateTransferTurnover`.

Assessment:

- The sequencing module in `simulation-tools` is a real interface: it keeps the
  package independent from content, storage, and CLI.
- The app-specific refresh bridge currently lives in the command file and is
  too large to remain mixed with rendering.
- This bridge should move behind a CLI-local report builder before any output
  renderer work.

### Report Data And Aggregate Facts

Current owner:

- mostly `apps/cli/src/commands/ten-season-report.ts`

Current responsibilities:

- `createSingleWorldReport`;
- `createLongRunGateReport`;
- `summarizeGateWorld`;
- `summarizeGateWorlds`;
- table-spread snapshots;
- draw-rate snapshots;
- champion-streak snapshots;
- club ability hierarchy snapshots;
- production rows;
- club-stability rows;
- youth-stability rows;
- balance rows;
- refresh totals;
- active-player and youth roster snapshots.

Assessment:

- These are not terminal rendering concerns.
- They also are not fully generic simulation-tools concerns because they depend
  on fake content, career scenario creation, CLI player naming, and report-only
  career refresh choices.
- The narrowest useful first split is a CLI-local report-data module that owns
  the report bundle and gate summary objects.

### Anomaly Aggregation And Warning Status Semantics

Current owners:

- `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
- `packages/simulation-tools/src/long-run/youth-stability.ts`
- `apps/cli/src/commands/ten-season-report.ts`

Current responsibilities in simulation-tools:

- stable anomaly check keys;
- PASS/WARN/FAIL thresholds;
- worst-status aggregation;
- youth stability checks;
- club and player report contracts.

Current responsibilities in CLI:

- batch-level failed/warning world counts;
- warning/failing key counts;
- signal-kind grouping through `signalKindForCheckKey`;
- worst-world sorting and compact snapshots.

Assessment:

- Thresholds and check statuses belong in `simulation-tools`.
- Batch presentation grouping currently belongs in CLI because it is report
  language, not core simulation behavior.
- Step 04 should improve naming/grouping only after the data-builder and
  renderer splits make the output easier to reason about.

## Localized Text

Current owner:

- `@game/i18n` catalogs for visible labels;
- `apps/cli/src/commands/ten-season-report.ts` for label composition.

Current behavior:

- CLI visible headings and labels use translator keys.
- Stable anomaly keys remain machine-readable keys.
- Markdown report artifact still contains English section headings and labels.

Assessment:

- CLI terminal output mostly follows localization rules.
- Markdown artifact text should be reviewed later as report presentation. It is
  currently a developer audit artifact, but it is also useful to future UI/report
  work. Step 04 or Step 05 should decide whether to leave it as developer-only
  English or introduce localized/structured section rendering.

## CLI Section Rendering

Current owner:

- `apps/cli/src/commands/ten-season-report.ts`

Current rendering groups:

- single-world header and season summaries;
- player evolution;
- ability hierarchy;
- club stability;
- youth stability;
- anomaly checks;
- multi-world gate summary;
- worst-world compact lines;
- Markdown report artifact sections.

Assessment:

- Rendering is mixed with data construction.
- The command file is difficult for a junior developer to scan because report
  meaning, data building, and terminal layout are interleaved.
- Renderer extraction should happen after the report-data boundary exists.

## Manual Inspection Guidance

Current owner:

- command output itself;
- prior audit documents.

Current gap:

- The project has good long-run evidence in audits, but no compact manual guide
  saying which ten-season report commands to run, what to review, and how to
  classify warnings by user-facing gameplay meaning.

Assessment:

- Step 05 should create a manual inspection guide before Phase 46 closes.
- This is more useful than adding new flags immediately.

## Main Architecture Friction

The current command file has high implementation locality but poor conceptual
locality. To understand one product question, a developer must scan unrelated
sections:

- "Why did this world warn?" crosses anomaly scoring, signal grouping, worst
  world sorting, and rendering.
- "How does one season refresh?" crosses content generation, career state
  mutation, refresh summaries, and active population checks.
- "What does the CLI print?" crosses data construction and localized layout.

This makes future UI readiness harder because structured facts are not cleanly
available before rendering.

## Low-Risk Step 02 Boundary

The first split should be CLI-local and data-focused:

- move the single-world and batch report data construction into a named module
  under `apps/cli/src/commands/ten-season-report/`;
- keep `runTenSeasonReportCommand` and argument parsing in
  `ten-season-report.ts`;
- keep CLI output formatting in `ten-season-report.ts` until Step 03;
- keep all simulation-tools thresholds unchanged;
- keep output text unchanged.

Recommended first module shape:

- `apps/cli/src/commands/ten-season-report/report-data.ts`

Likely responsibilities:

- `createSingleWorldReport`;
- `createLongRunGateReport`;
- report/gate interfaces needed by renderers;
- app-specific post-season refresh bridge;
- row builders and summaries needed to construct those report objects.

Reason:

- This is a deep module candidate: deleting it would force report construction
  complexity back into the command and future renderers.
- It creates leverage for Step 03 renderers because renderers can consume one
  structured report interface.
- It avoids changing diagnostics, thresholds, or user-facing output.

## What Should Stay Put For Now

- Argument parsing should stay in `ten-season-report.ts`.
- Terminal and Markdown rendering should stay until Step 03.
- Thresholds should stay in `packages/simulation-tools/src/long-run`.
- Stable anomaly keys should stay machine-readable.
- The report-only career refresh behavior should not move into
  `simulation-tools` unless future steps need a second app adapter.

## Risks For Later Steps

1. Moving too much to `simulation-tools` would violate package intent because
   the current report data needs fake content and CLI scenario knowledge.

2. Renderer extraction before data extraction would create shallow wrappers over
   a still-broad command file.

3. Localizing Markdown artifact headings could become noisy if the artifact is
   treated as developer-only. Step 04 or Step 05 should decide this deliberately.

4. The command imports `node:fs/promises` and `node:path` for report-output
   writing. That is valid in the CLI adapter, but should not leak into data
   builders or simulation tooling.

## Step 02 Recommendation

Proceed with a CLI-local `report-data.ts` extraction first.

The Step 02 success condition should be:

- `ten-season-report.ts` still parses and dispatches the command;
- structured report data is built by the new module;
- rendered output is unchanged in meaning;
- no thresholds or game systems are changed.
