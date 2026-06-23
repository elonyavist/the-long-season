# The Long Season Architecture

Last updated: 2026-06-23

## Purpose

This document explains the current project structure for a developer joining the
codebase. It focuses on package responsibilities, important files, entry points,
and the paths to follow when debugging the main flows.

It is not a function-by-function API reference. Source code and focused tests
remain the source of truth for exact behavior.

## Package Graph

Dependency direction is intentionally one-way:

```text
apps/cli
  -> @game/storage
  -> @game/content
  -> @game/simulation-tools
  -> @game/engine
  -> @game/i18n
  -> @game/shared

@game/simulation-tools -> @game/engine -> @game/domain
@game/content          -> @game/domain
@game/storage          -> @game/domain
@game/engine           -> @game/shared
@game/content          -> @game/shared
@game/storage          -> @game/shared
@game/domain           -> no project package
@game/i18n             -> no project package
@game/shared           -> no project package
```

Why this matters:

- `domain` stays pure and language-agnostic.
- `engine` owns deterministic rules and must not know storage, content, CLI, or
  i18n.
- `content` generates fake/world data and must not import engine rules.
- `storage` persists data and must not simulate anything.
- `simulation-tools` owns report models and diagnostic meaning, but not
  localized text or fake content.
- `apps/cli` is the outer adapter. It can compose packages, parse commands,
  persist saves, and render localized output.

`pnpm depcruise` enforces the package direction.

## Package Responsibilities

| Package | Owns | Must Not Own |
|---|---|---|
| `packages/domain` | IDs, entities, value objects, career/game/youth state, squad contracts, tactic contracts. | RNG, storage, rendering, generated content, engine decisions. |
| `packages/shared` | Deterministic technical helpers: RNG, date conversion, assertions, errors, number utilities. | Football concepts or presentation text. |
| `packages/engine` | Match simulation, season simulation, career fixture progression, development, squad/youth lifecycle, market rules, table calculation. | Content generation, JSON storage, CLI output, localized labels. |
| `packages/content` | Deterministic fake clubs, players, youth academies, identities, nationality data, generation bands, calibration targets. | Engine algorithms, save writes, UI/CLI rendering. |
| `packages/storage` | JSON-backed save storage, schema metadata, migrations. | Gameplay decisions or generated content. |
| `packages/simulation-tools` | Balance reports, long-run runners, player/club/youth stability reports, anomaly semantics. | Fake content, storage, localized prose, CLI formatting. |
| `packages/i18n` | Supported languages, translation keys, fallback translation rendering. | Simulation logic or package imports. |
| `apps/cli` | Command parsing, package composition, save IO, localized console output, smoke/lab commands. | Core gameplay rules or reusable diagnostic semantics. |

## Main Entry Points

| Area | Entry Point |
|---|---|
| CLI app | `apps/cli/src/index.ts` |
| CLI doctor | `apps/cli/src/commands/doctor.ts` |
| Simulate one season | `apps/cli/src/commands/simulate-season.ts` |
| Career command | `apps/cli/src/commands/career.ts` |
| Long-run report command | `apps/cli/src/commands/ten-season-report.ts` |
| Generated world facade | `packages/content/src/generators/league-system.ts` via `createFakeLeagueSystem` |
| Season simulation use-case | `packages/engine/src/use-cases/simulate-season.ts` |
| Career fixture progression | `packages/engine/src/career/progress-fixture.ts` via `progressNextCareerFixture` |
| Match simulation | `packages/engine/src/match-engine/simulate-match.ts` |
| Manual tactic segments | `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts` |
| Team strength | `packages/engine/src/match-engine/team-strength.ts` |
| Calendar generation | `packages/engine/src/season-engine/calendar.ts` |
| League table | `packages/engine/src/season-engine/league-table.ts` |
| Career storage | `packages/storage/src/career-storage.ts` |
| Long-run anomaly semantics | `packages/simulation-tools/src/long-run/anomaly-scoring.ts` |
| Localization labels | `packages/i18n/src/labels.ts` |

## Important Files By Area

### Domain

- `packages/domain/src/entities/*`
  Contains core entities such as players, clubs, fixtures, competitions, and
  reports. These files define shape, not behavior-heavy orchestration.
- `packages/domain/src/state/*`
  Contains durable game/career/youth state contracts.
- `packages/domain/src/value-objects/*`
  Contains branded IDs and values.
- `packages/domain/src/index.ts`
  Public domain entry point. Broad by design.

Domain files must not contain localized labels, random generation, storage, or
simulation algorithms.

### Shared

- `packages/shared/src/rng.ts`
  Deterministic RNG streams. Use this instead of runtime randomness.
- `packages/shared/src/date-utils.ts`
  Pure date conversion helpers. Use this instead of JavaScript `Date` in engine.
- `packages/shared/src/assert.ts`, `errors.ts`, `number-utils.ts`
  Small technical utilities.

Shared files must stay free from football concepts.

### Engine

- `packages/engine/src/match-engine/step-match.ts`
  One-minute match stepping and event generation. Large and gameplay-critical.
- `packages/engine/src/match-engine/chance-actors.ts`
  Chooses shooter, creator, defender, and goalkeeper for events.
- `packages/engine/src/match-engine/create-match-report.ts`
  Converts simulation output into durable domain match reports.
- `packages/engine/src/match-engine/match-explanation-trace.ts`
  Produces structured explanation data for debugging fixture outcomes.
- `packages/engine/src/use-cases/simulate-season.ts`
  Simulates a full season from app/content-provided inputs.
- `packages/engine/src/career/progress-fixture.ts`
  Stable career matchday advancement entry point. Caller owns preparation and
  recovered state before calling this function.
- `packages/engine/src/career/player-development.ts`
  Growth and aging model. Large but coherent.
- `packages/engine/src/career/squad-maintenance.ts`,
  `transfer-turnover.ts`, `youth-lifecycle.ts`, `youth-intake.ts`,
  `youth-promotion.ts`
  Career refresh and youth pipeline logic.
- `packages/engine/src/index.ts`
  Public engine entry point. It is broad today; future narrowing should happen
  only after adapters consume deeper use-cases.

Engine files must not import content, storage, CLI, or i18n.

### Content

- `packages/content/src/generators/league-system.ts`
  Generated-world facade. Prefer `createFakeLeagueSystem` when a caller needs a
  coherent generated world bundle.
- `packages/content/src/generators/fake-clubs.ts`
  Stable club IDs and fictional city-based club identities.
- `packages/content/src/generators/fake-players.ts`
  Senior squad, identities, roles, ability, potential, lineup, and state
  generation.
- `packages/content/src/generators/initial-youth-academies.ts`
  Initial youth academy generation for career saves.
- `packages/content/src/generators/career-intake-players.ts`
  Later-career intake players used by long-run refresh.
- `packages/content/src/generators/player-role-templates.ts`
  Role-based ability shaping rules.
- `packages/content/src/generators/player-role-attribute-classification.ts`
  Role/attribute classification rules.
- `packages/content/src/identity/*`
  Name cultures, nationality distribution, flag metadata.
- `packages/content/src/index.ts`
  Public content entry point.

Content must not import engine. It emits data/config that engine callers can
adapt.

### Storage

- `packages/storage/src/career-storage.ts`
  JSON career save/load adapter.
- `packages/storage/src/json-game-storage.ts`
  Older game-state JSON storage.
- `packages/storage/src/migrate-save.ts`
  Save migration logic.
- `packages/storage/src/save-metadata.ts`
  Save listing metadata.

Storage must not simulate matches or generate content.

### Simulation Tools

- `packages/simulation-tools/src/calibration-report.ts`
  Balance calibration report model.
- `packages/simulation-tools/src/long-run/long-runner.ts`
  Generic long-run season runner.
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
  Career-aware long-run runner.
- `packages/simulation-tools/src/long-run/player-evolution.ts`
  Player growth/decline and production report model.
- `packages/simulation-tools/src/long-run/club-stability.ts`
  Club stability and squad refresh report model.
- `packages/simulation-tools/src/long-run/youth-stability.ts`
  Youth population/lifecycle report model.
- `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
  Warning/failure semantics and shared PASS/WARN/FAIL severity helpers.

Simulation tools may define report models and thresholds. They must not render
localized CLI text or import generated content.

### CLI

- `apps/cli/src/index.ts`
  Command dispatcher.
- `apps/cli/src/commands/simulate-season.ts`
  Simulated-season command adapter. It composes generated content, runs the
  season, chooses the requested inspection mode, and delegates output to
  dedicated modules under `commands/simulate-season/`.
- `apps/cli/src/commands/simulate-season/parse-args.ts`
  Simulated-season argument parsing, validation, help output, and parsed command
  shape.
- `apps/cli/src/commands/simulate-season/demo-builders.ts`
  CLI-owned setup, lineup, condition, and fixture-scoped inspection builders.
- `apps/cli/src/commands/simulate-season/season-summary-output.ts`
  Default season summary, final table, top-player summaries, best/worst teams,
  and round fixture/scorer output.
- `apps/cli/src/commands/simulate-season/fixture-detail-output.ts`
  Fixture detail, event, all-starter player-stat, scorer, and explanation-trace
  output.
- `apps/cli/src/commands/simulate-season/demo-output.ts`
  Setup, condition, lineup, fixture-lineup, and manual tactic switch inspection
  output.
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
  Identity review and player-generation quality report output.
- `apps/cli/src/commands/simulate-season/formation-fit-output.ts`
  Formation-fit inspection output.
- `apps/cli/src/commands/simulate-season/market-demo-output.ts`
  Market-demo inspection output.
- `apps/cli/src/commands/career.ts`
  Career command storage/dispatch adapter.
- `apps/cli/src/commands/career/scenarios.ts`
  New-world and market-demo career state construction.
- `apps/cli/src/commands/career/progression.ts`
  Builds caller-owned matchday contexts and calls engine career advancement.
- `apps/cli/src/commands/career/preparation.ts`
  Persists selected lineup/tactic demo preparation.
- `apps/cli/src/commands/career/season-labs.ts`
  In-memory development report and season rollover lab helpers.
- `apps/cli/src/commands/career/format.ts`
  Shared career presentation helpers for labels, money, fixture lines, metadata,
  stable ordering, and compact player/club labels.
- `apps/cli/src/commands/career/overview-output.ts`
  New-world preview, career summary, and career inspect output.
- `apps/cli/src/commands/career/preparation-output.ts`
  Saved lineup, saved tactic, and persisted match-preparation output.
- `apps/cli/src/commands/career/matchday-output.ts`
  Save-driven fixture advancement, condition consequences, recovery, and optional
  explanation-trace output.
- `apps/cli/src/commands/career/roster-output.ts`
  Selected squad and youth-academy inspection output.
- `apps/cli/src/commands/career/development-output.ts`
  Multi-season player development report output.
- `apps/cli/src/commands/career/market-output.ts`
  Permanent-transfer apply output.
- `apps/cli/src/commands/career/season-rollover-output.ts`
  Season rollover output.
- `apps/cli/src/commands/ten-season-report.ts`
  Long-run report command adapter. It parses arguments, chooses single-world or
  multi-world mode, creates the translator, writes optional report artifacts,
  and delegates report facts/rendering to `commands/ten-season-report/`.
- `apps/cli/src/commands/ten-season-report/report-data.ts`
  CLI-local long-run report facts boundary. It creates generated worlds,
  report-only career state, career long-run runs, post-season refresh snapshots,
  single-world report bundles, multi-world gate summaries, warning-key counts,
  and signal-kind grouping.
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
  Single-world ten-season report output: season summaries, player evolution,
  strength hierarchy, club stability, youth stability, and anomaly rows.
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
  Multi-world gate output: terminal summary, worst-world compact rows, signal
  guide, and Markdown report artifact.
- `apps/cli/src/commands/fake-season-input.ts`
  Converts `FakeLeagueSystem` into engine `simulateSeason` input.

CLI code can compose packages. It should not become the home for reusable engine
rules or diagnostic semantics.

### I18n

- `packages/i18n/src/language.ts`
  Supported language parsing and fallback contract.
- `packages/i18n/src/labels.ts`
  Translation key catalog and label values.

User-facing CLI/UI labels belong here when they are reusable presentation text.
Simulation packages should not hardcode UI/CLI labels.

## How To Trace Main Flows

### Simulate One Season

1. CLI enters through `apps/cli/src/index.ts`.
2. `simulate-season` args are parsed in
   `apps/cli/src/commands/simulate-season/parse-args.ts`.
3. `apps/cli/src/commands/simulate-season.ts` creates content with
   `createFakeLeagueSystem`.
4. `apps/cli/src/commands/fake-season-input.ts` converts content into engine
   season input.
5. `packages/engine/src/use-cases/simulate-season.ts` runs the season.
6. CLI renders table, stats, fixture detail, or inspection output.
   Simulate-season output is split by family under
   `apps/cli/src/commands/simulate-season/`.

### Create Or Load A Career Save

1. CLI enters `apps/cli/src/commands/career.ts`.
2. Args are parsed by `career/parse-career-args.ts`.
3. New worlds are built through `createFakeLeagueSystem` and
   `career/scenarios.ts`.
4. Career saves are written/read by `JsonCareerStorage`.
5. Career output is rendered by `career/format.ts`.

### Prepare A Match

1. User-facing CLI preparation commands enter `career.ts`.
2. `career/preparation.ts` persists selected lineup or tactic preparation.
3. The save stores preparation data; engine does not choose lineups or tactics
   automatically for the user.

### Advance A Career Fixture

1. CLI enters `career.ts` with `--advance-next-fixture`.
2. `career/progression.ts` applies caller-owned recovery/preparation context.
3. It builds match-ready `MatchTeamContext`s.
4. It calls `progressNextCareerFixture` in engine.
5. Engine simulates exactly the next selected-club fixture, applies fixture
   result, spends selected-starter condition, and returns a copied career state.
6. CLI writes the save and renders output.

### Generate A World

1. Call `createFakeLeagueSystem({ worldSeed })`.
2. Club identities come from `fake-clubs.ts`.
3. Senior squads and lineups come from `fake-players.ts`.
4. Career creation adds youth academies in `career/scenarios.ts`.
5. Calendar generation remains in engine because it is a rule, not content data.

### Run Long-Run Diagnostics

1. CLI enters `ten-season-report.ts`.
2. `ten-season-report.ts` parses args and creates the translator.
3. `ten-season-report/report-data.ts` builds fake content, in-memory career
   state, and app/content-specific report refresh callbacks.
4. `runCareerLongRunSimulation` in simulation-tools runs the season loop.
5. Simulation-tools builds player, club, youth, and anomaly report models.
6. `report-data.ts` summarizes single-world or multi-world report facts.
7. `single-world-output.ts` or `gate-output.ts` renders localized console
   output. `gate-output.ts` also renders optional Markdown.

### Render Localized CLI Output

1. CLI parses `--lang`.
2. `createTranslator` from `@game/i18n` builds a translator.
3. CLI format modules call translation keys and inject values.
4. Engine/content/simulation-tools return structured facts, not localized prose.

## Common Debugging Paths

| Problem | Start Here |
|---|---|
| Season table looks wrong | `apps/cli/src/commands/simulate-season.ts`, then `packages/engine/src/use-cases/simulate-season.ts`, then `league-table.ts`. |
| One fixture result looks wrong | Run `simulate-season --fixture=<id> --fixture-explanation`, then inspect `match-explanation-trace.ts`, `step-match.ts`, and `chance-actors.ts`. |
| Career match did not use expected lineup/tactic | `career/preparation.ts`, `career/progression.ts`, then `progress-fixture.ts`. |
| Player condition changed unexpectedly | `career/progression.ts`, `career-weekly-recovery.ts`, `career-condition-consequences.ts`, then `progress-fixture.ts`. |
| Generated players look unrealistic | `fake-players.ts`, role template/classification files, player-generation tests, and the player-generation report CLI. |
| Club names look repetitive | `fake-clubs.ts` and `clubs/club-identity-source-data.ts`. |
| Long-run warnings are unclear | Start with `apps/cli/src/commands/ten-season-report/gate-output.ts`, then `ten-season-report/report-data.ts` signal grouping, then `simulation-tools/src/long-run/anomaly-scoring.ts` and `youth-stability.ts`. |
| Save cannot be read | `JsonCareerStorage`, save schema in domain, and storage tests. |
| Translation is missing | `packages/i18n/src/labels.ts` and localized presentation text check. |

## Remaining Large Files

These files are known and intentionally not fully split in Phase 43:

- `apps/cli/src/commands/simulate-season.ts`
  Improved in Phase 44. It is still the command adapter for many inspection
  modes, but season, fixture, demo, generated-inspection, formation-fit, and
  market output now live in dedicated modules.
- `apps/cli/src/commands/ten-season-report.ts`
  Improved in Phase 46. The command adapter is now narrow; the remaining large
  file is `apps/cli/src/commands/ten-season-report/report-data.ts`, which still
  owns report-only career refresh, row builders, gate aggregation, and signal
  grouping. Split only around real concept boundaries.
- `apps/cli/src/commands/career/format.ts`
  Large but presentation-only. Split by output family when adding UI-facing
  presentation contracts.
- `packages/engine/src/use-cases/simulate-season.ts`
  Large and core. Split only with careful golden tests.
- `packages/engine/src/career/player-development.ts`
  Large but coherent. Split curve/config helpers only if readability improves
  without tuning behavior.

## Rules For Adding Future Code

1. Start from the package that owns the concept.
2. Keep engine deterministic and language-agnostic.
3. Keep content generation out of engine.
4. Keep save IO out of engine and content.
5. Put reusable diagnostic semantics in simulation-tools, not CLI.
6. Put reusable presentation labels in i18n, not engine/content.
7. Prefer one clear entry point over many shallow helper paths.
8. Add TSDoc to exported functions/types that define flow or contracts.
9. Avoid compatibility leftovers and dead wrappers.
10. Run focused tests plus `pnpm check` before marking a step complete.
