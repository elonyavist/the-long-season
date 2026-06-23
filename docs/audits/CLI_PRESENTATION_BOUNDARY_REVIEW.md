# CLI Presentation Boundary Review

Date: 2026-06-22
Phase: `44-cli-adapter-decomposition-and-presentation-boundaries`
Step: `06-presentation-boundary-review`

## Summary

The `simulate-season` CLI adapter is now easier to trace than it was before
Phase 44. The main command file still composes content, engine inputs, demo
profiles, selected output mode, and stdout/stderr writes, but it no longer owns
the detailed rendering for every command branch.

This is the right boundary for now. The command remains CLI-specific, while
coherent output families have names and files that a junior developer can follow
without reading one large adapter from top to bottom.

## Current Module Map

| File | Boundary |
|---|---|
| `apps/cli/src/commands/simulate-season.ts` | Command adapter: parse result handling, content creation, simulation bridge, mode dispatch, fixture-only composition, and stdout/stderr writes. |
| `apps/cli/src/commands/simulate-season/parse-args.ts` | CLI argument parsing, validation, help text, and parsed command shape. |
| `apps/cli/src/commands/simulate-season/profile-keys.ts` | Stable setup, lineup, condition, and market demo profile keys. |
| `apps/cli/src/commands/simulate-season/demo-builders.ts` | CLI-owned setup, lineup, condition, and fixture-scoped inspection builders. |
| `apps/cli/src/commands/simulate-season/season-summary-output.ts` | Default season summary, league table, top-player summaries, and round fixture/scorer output. |
| `apps/cli/src/commands/simulate-season/fixture-detail-output.ts` | Fixture result detail, match events, all-starter player match stats, scorer lines, and optional explanation trace rendering. |
| `apps/cli/src/commands/simulate-season/demo-output.ts` | Setup, condition, lineup, fixture-lineup, and manual tactic switch inspection output. |
| `apps/cli/src/commands/simulate-season/formation-fit-output.ts` | Formation-fit inspection output. |
| `apps/cli/src/commands/simulate-season/market-demo-output.ts` | Market-demo scenario construction and localized market inspection output. |
| `apps/cli/src/commands/simulate-season/generated-inspection-output.ts` | Identity review and player-generation report construction/output. |

## Pure CLI Renderers

These modules are now mostly presentation-only and should stay CLI-local until a
real UI view-model contract exists:

- `season-summary-output.ts`
- `fixture-detail-output.ts`
- `demo-output.ts`

They format already available season, fixture, demo, and localized label facts.
They should not absorb engine rules or reusable diagnostic semantics.

## Mixed Builder And Renderer Modules

These modules intentionally still mix some report construction with output:

- `generated-inspection-output.ts`
- `formation-fit-output.ts`
- `market-demo-output.ts`

That is acceptable for Phase 44 because their facts are still command-specific
inspection tools. If UI screens need the same data later, split them into a
structured report builder plus CLI renderer at that point.

## Builder-Like CLI Modules

`demo-builders.ts` is the clearest builder module. It creates CLI demo data and
setup/lineup inspection objects from generated content. It is not an engine
abstraction because the demos are command-owned examples, not game rules.

`simulate-season.ts` still builds the manual-tactic fixture composition and
explanation-trace context. That remains acceptable because it is tied to the
fixture inspection command path and to caller-owned CLI options.

## Future UI-Facing View Model Candidates

Do not create these yet. If a UI phase needs them, the likely candidates are:

- `SeasonSummaryViewModel` from `season-summary-output.ts`;
- `FixtureDetailViewModel` from `fixture-detail-output.ts`;
- `SetupInspectionViewModel`, `LineupInspectionViewModel`, and
  `ManualSwitchInspectionViewModel` from `demo-output.ts`;
- `PlayerGenerationReportViewModel` from `generated-inspection-output.ts`.

The source split now makes those future extractions possible without touching
engine behavior.

## Remaining Presentation Hotspots

| Hotspot | Why It Matters | Recommendation |
|---|---|---|
| `apps/cli/src/commands/career/format.ts` | Large localized formatter for the career command. It will matter when career screens move toward UI. | Decompose by output family before adding UI-facing career presentation contracts. |
| `apps/cli/src/commands/ten-season-report.ts` | Combines long-run setup, content-specific adapters, gate aggregation, CLI rendering, and Markdown output. | Split rendering/report-output concerns if long-run reporting continues to grow. |
| `generated-inspection-output.ts` | Still mixes identity/player-generation report building with rendering. | Keep for now; split only when reused by UI or when it becomes hard to scan. |
| `parse-args.ts` | Large but cohesive parser/validator. | Leave intact unless new command options make validation hard to follow. |

## Next Decomposition Target

The next best decomposition target is `apps/cli/src/commands/career/format.ts`.
It is presentation-only and directly connected to the playable career loop. That
makes it a better next step than another `simulate-season` split if the project
is moving toward UI or richer career inspection.

`apps/cli/src/commands/ten-season-report.ts` should be second, especially if
future work expands long-run gates, Markdown reports, or audit exports.

## Verification

No source behavior was changed in this review step. The review should be
verified with:

- `pnpm check`
- `git diff --check`
