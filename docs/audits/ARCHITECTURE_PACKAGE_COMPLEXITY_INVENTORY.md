# Architecture Package Complexity Inventory

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`
Step: `01-package-and-file-complexity-inventory`

## Summary

The package graph is healthy. The main architecture issue is not dependency direction; it is readability and interface depth in a few large adapter/use-case files.

The strongest findings are:

- `apps/cli/src/commands/simulate-season.ts` is a high-risk adapter hotspot at about 2,697 lines.
- `apps/cli/src/commands/ten-season-report.ts` is a high-risk diagnostics hotspot at about 2,303 lines.
- `apps/cli/src/commands/career/format.ts` is a high-risk presentation hotspot at about 1,323 lines.
- `apps/cli/src/commands/career/parse-career-args.ts` is a parsing hotspot at about 811 lines.
- `packages/engine/src/use-cases/simulate-season.ts` and `packages/engine/src/career/player-development.ts` are large core files that need careful review before any split.
- The macro package boundaries enforced by Dependency Cruiser passed with no violations.

The recommended Step 02 focus is public interface review, especially `packages/engine/src/index.ts`, `packages/content/src/index.ts`, and the current CLI imports from engine/content/storage/simulation-tools.

## Package Map

| Package | Responsibility | Allowed dependencies | Current dependencies | Public entry point | Depth |
|---|---|---|---|---|---|
| `@game/domain` | Pure game contracts, IDs, entities, value objects, career state, tactics, squad contracts. | none | none | `packages/domain/src/index.ts` | Deep but broad |
| `@game/shared` | Deterministic technical primitives such as RNG, date helpers, assertions, number utilities, errors. | none | none | `packages/shared/src/index.ts` | Deep and small |
| `@game/engine` | Pure deterministic gameplay rules and use-cases: match engine, season engine, career progression, market rules, player state, squad fit. | `domain`, `shared` | `@game/domain`, `@game/shared` | `packages/engine/src/index.ts` | Deep but very broad |
| `@game/content` | Deterministic fake content generation and source data: clubs, players, youth academies, identity, calibration targets. | `domain`, `shared` | `@game/domain`, `@game/shared` | `packages/content/src/index.ts` | Medium depth |
| `@game/storage` | JSON persistence adapters and save migrations. | `domain`, `shared` | `@game/domain`, `@game/shared` | `packages/storage/src/index.ts` | Deep and narrow |
| `@game/simulation-tools` | Calibration and long-run diagnostic model logic. | `domain`, `engine`, `shared` | `@game/domain`, `@game/engine`, `@game/shared` | `packages/simulation-tools/src/index.ts` | Medium depth |
| `@game/i18n` | Presentation labels, supported language contract, fallback renderer. | none | none | `packages/i18n/src/index.ts` | Deep and narrow |
| `apps/cli` | CLI adapter: parse commands, compose packages, render localized output. | `engine`, `content`, `storage`, `simulation-tools`, `shared`, `i18n` | all allowed app dependencies | `apps/cli/src/index.ts` | Shallow but oversized |

## Dependency Rule Check

Command used:

```sh
pnpm depcruise
```

Result:

- Passed.
- Dependency Cruiser reported no dependency violations across 222 modules and 808 dependencies.
- Environment note: the sandbox shell did not initially find `pnpm`; using the Node v24.19.0 path is recommended for future checks in this environment.

## File Inventory Legend

Readability score:

- `5`: easy for a junior developer to follow.
- `4`: mostly clear, small local complexity.
- `3`: understandable but requires context.
- `2`: difficult without prior knowledge.
- `1`: likely confusing entry point or mixed responsibilities.

Split priority:

- `none`: keep as-is unless touched by feature work.
- `watch`: monitor; split only when a real change makes it useful.
- `candidate`: likely worth splitting in a documented step.
- `high`: should be reviewed before more feature work extends it.

Gameplay risk:

- `low`: presentation, parsing, or isolated utility.
- `medium`: affects user output, generated content, or one subsystem.
- `high`: affects match results, season results, career state, or long-run credibility.

## CLI Command Files

| File | Lines | Imports | Exports | Main responsibility | Suspected secondary responsibilities | Readability | Split | Risk |
|---|---:|---:|---:|---|---|---:|---|---|
| `apps/cli/src/commands/balance-report.ts` | 400 | 4 | 4 | Balance-report command adapter. | Some report formatting. | 3 | watch | medium |
| `apps/cli/src/commands/career.ts` | 813 | 10 | 10 | Career command orchestration. | Development report and rollover helpers still live in the command file. | 2 | candidate | high |
| `apps/cli/src/commands/career/format.ts` | 1323 | 8 | 11 | Career output formatting. | Many presentation modes in one file. | 2 | high | medium |
| `apps/cli/src/commands/career/parse-career-args.ts` | 811 | 3 | 5 | Career argument parsing. | Validation and user-facing parse semantics. | 2 | candidate | medium |
| `apps/cli/src/commands/career/preparation.ts` | 287 | 2 | 5 | Save lineup/tactic preparation demos. | Demo profile wiring. | 4 | watch | medium |
| `apps/cli/src/commands/career/progression.ts` | 268 | 3 | 5 | CLI career advancement bridge. | Builds caller-supplied contexts around engine progression. | 3 | watch | high |
| `apps/cli/src/commands/career/scenarios.ts` | 302 | 4 | 5 | Career save scenario/new-world construction. | Market demo setup and youth-academy setup. | 3 | watch | high |
| `apps/cli/src/commands/career/types.ts` | 40 | 3 | 11 | CLI-local type aliases. | none | 5 | none | low |
| `apps/cli/src/commands/doctor.ts` | 108 | 1 | 1 | Doctor command. | none | 5 | none | low |
| `apps/cli/src/commands/fake-season-input.ts` | 225 | 3 | 5 | Fake season input construction for CLI/report commands. | Shared content fixture composition. | 4 | watch | medium |
| `apps/cli/src/commands/simulate-season.ts` | 2697 | 8 | 3 | Main simulated-season CLI adapter. | Many demo modes, fixture detail, output rendering, formation/condition/lineup/tactic inspection. | 1 | high | high |
| `apps/cli/src/commands/simulate-season/formation-fit-output.ts` | 245 | 3 | 1 | Formation-fit output rendering. | none | 4 | none | low |
| `apps/cli/src/commands/simulate-season/market-demo-output.ts` | 329 | 4 | 1 | Market-demo output rendering. | none | 4 | watch | low |
| `apps/cli/src/commands/simulate-season/parse-args.ts` | 740 | 3 | 7 | Simulate-season argument parsing. | Many demo flag combinations and validation messages. | 2 | candidate | medium |
| `apps/cli/src/commands/simulate-season/profile-keys.ts` | 68 | 0 | 17 | CLI demo profile keys. | none | 5 | none | low |
| `apps/cli/src/commands/ten-season-report.ts` | 2303 | 9 | 3 | Long-run report command and renderer. | Diagnostic model construction, file output, report aggregation, CLI rendering. | 1 | high | medium |

## Engine Career Files

| File | Lines | Imports | Exports | Main responsibility | Suspected secondary responsibilities | Readability | Split | Risk |
|---|---:|---:|---:|---|---|---:|---|---|
| `packages/engine/src/career/apply-career-transfer.ts` | 97 | 4 | 3 | Apply accepted career transfer preview to state. | none | 4 | none | high |
| `packages/engine/src/career/career-condition-consequences.ts` | 85 | 2 | 4 | Spend condition for match starters. | none | 5 | none | high |
| `packages/engine/src/career/career-weekly-recovery.ts` | 112 | 2 | 4 | Date-based career recovery. | none | 5 | none | high |
| `packages/engine/src/career/next-fixture.ts` | 100 | 1 | 6 | Find next selected-club fixture. | none | 5 | none | high |
| `packages/engine/src/career/next-season-calendar.ts` | 204 | 4 | 5 | Generate next season calendar after completion. | Season completion validation. | 4 | watch | high |
| `packages/engine/src/career/player-development.ts` | 917 | 2 | 4 | Player growth and aging model. | Internal curve math, role weighting, potential realization, reporting. | 2 | candidate | high |
| `packages/engine/src/career/player-exits.ts` | 285 | 2 | 5 | End-of-season player exits. | Exit classification and deterministic selection. | 3 | watch | high |
| `packages/engine/src/career/player-intake.ts` | 109 | 1 | 7 | Career intake pool contract. | none | 4 | none | medium |
| `packages/engine/src/career/player-season-rollover.ts` | 71 | 1 | 3 | Age/state rollover. | none | 5 | none | high |
| `packages/engine/src/career/progress-fixture.ts` | 269 | 9 | 7 | Career fixture advancement. | Match simulation, report application, condition consequences, prep retargeting. | 3 | watch | high |
| `packages/engine/src/career/season-completion.ts` | 130 | 1 | 6 | Current-season completion assessment. | none | 4 | none | high |
| `packages/engine/src/career/squad-maintenance.ts` | 269 | 2 | 7 | Squad shape maintenance. | Senior/youth shape classification. | 3 | watch | high |
| `packages/engine/src/career/transfer-turnover.ts` | 322 | 3 | 4 | Transfer turnover simulation. | Multi-club turnover heuristics. | 3 | watch | high |
| `packages/engine/src/career/youth-intake.ts` | 212 | 1 | 8 | Seasonal youth intake application. | Candidate validation and academy sizing. | 4 | watch | high |
| `packages/engine/src/career/youth-lifecycle.ts` | 283 | 3 | 5 | Youth aging/lifecycle decisions. | Development integration and outcome classification. | 3 | watch | high |
| `packages/engine/src/career/youth-promotion.ts` | 245 | 1 | 6 | Youth promotion application. | Senior roster mutation and academy mutation. | 4 | watch | high |

## Engine Match Files

| File | Lines | Imports | Exports | Main responsibility | Suspected secondary responsibilities | Readability | Split | Risk |
|---|---:|---:|---:|---|---|---:|---|---|
| `packages/engine/src/match-engine/aggregate-occasion-resolver.ts` | 116 | 4 | 1 | Aggregate shot outcome resolver. | none | 4 | none | high |
| `packages/engine/src/match-engine/chance-actors.ts` | 276 | 5 | 6 | Select shooter, creator, defender, goalkeeper. | Weighting rules for event attribution. | 4 | watch | high |
| `packages/engine/src/match-engine/create-match-report.ts` | 126 | 3 | 1 | Convert match simulation to durable report. | none | 4 | none | high |
| `packages/engine/src/match-engine/index.ts` | 127 | 0 | 12 | Match-engine barrel exports. | Broad public surface. | 3 | watch | medium |
| `packages/engine/src/match-engine/manual-tactic-change.ts` | 195 | 2 | 7 | Manual tactic schedule contract. | Validation and ordering. | 4 | none | high |
| `packages/engine/src/match-engine/match-context.ts` | 242 | 4 | 10 | Serializable match context contracts. | Validation and RNG key construction. | 4 | watch | high |
| `packages/engine/src/match-engine/match-engine-config.ts` | 139 | 0 | 6 | Match engine tuning config contracts. | none | 5 | none | high |
| `packages/engine/src/match-engine/match-explanation-trace.ts` | 424 | 4 | 18 | Structured explanation trace. | Team strength, tactic, condition, chance summary, variance classification. | 3 | watch | medium |
| `packages/engine/src/match-engine/match-simulation-runner.ts` | 141 | 7 | 7 | Shared full-match loop. | Segment support for manual tactics. | 4 | none | high |
| `packages/engine/src/match-engine/match-simulation-state.ts` | 122 | 1 | 8 | Match state construction and mutation helpers. | none | 4 | none | high |
| `packages/engine/src/match-engine/occasion-resolver.ts` | 48 | 2 | 4 | Resolver interface. | none | 5 | none | high |
| `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts` | 102 | 6 | 2 | Simulate match with manual tactic schedule. | none | 5 | none | high |
| `packages/engine/src/match-engine/simulate-match.ts` | 26 | 2 | 2 | Default full match entry point. | none | 5 | none | high |
| `packages/engine/src/match-engine/step-match.ts` | 624 | 7 | 10 | One-minute match stepping and event generation. | Opportunity generation, event attribution, actor selection calls, event state updates. | 2 | candidate | high |
| `packages/engine/src/match-engine/tactic-team-context.ts` | 224 | 3 | 5 | Build tactic-aware team context. | Lineup validation and strength derivation. | 4 | watch | high |
| `packages/engine/src/match-engine/team-strength.ts` | 382 | 1 | 11 | Team strength derivation from lineup/roles/state. | Input validation and dynamic-state curves. | 4 | watch | high |

## Engine Use-Case Files

| File | Lines | Imports | Exports | Main responsibility | Suspected secondary responsibilities | Readability | Split | Risk |
|---|---:|---:|---:|---|---|---:|---|---|
| `packages/engine/src/use-cases/apply-match-report-to-fixture.ts` | 107 | 1 | 5 | Apply durable report to fixture result. | none | 5 | none | high |
| `packages/engine/src/use-cases/simulate-season.ts` | 895 | 10 | 9 | Simulate full season from content-like inputs. | Calendar iteration, fixture override handling, setup overrides, fitness lifecycle, reports, player stats, final table. | 2 | candidate | high |

## Content Generator Files

| File | Lines | Imports | Exports | Main responsibility | Suspected secondary responsibilities | Readability | Split | Risk |
|---|---:|---:|---:|---|---|---:|---|---|
| `packages/content/src/generators/career-intake-players.ts` | 259 | 8 | 5 | Generate career intake players. | Uses identity and ability generation helpers. | 4 | watch | medium |
| `packages/content/src/generators/fake-clubs.ts` | 356 | 3 | 11 | Generate deterministic fake clubs. | City/name selection and duplicate handling. | 4 | watch | medium |
| `packages/content/src/generators/fake-players.ts` | 632 | 11 | 5 | Generate deterministic senior players. | Identity, nationality, ability, roles, potential, rarity budgets. | 2 | candidate | high |
| `packages/content/src/generators/initial-youth-academies.ts` | 559 | 8 | 11 | Generate initial youth academies. | Youth role mix, potential/current ability, identity. | 2 | candidate | high |
| `packages/content/src/generators/league-system.ts` | 270 | 4 | 9 | Compose fake league system. | Top-level world-ish generator and content wiring. | 3 | watch | high |
| `packages/content/src/generators/player-archetypes.ts` | 153 | 0 | 8 | Player archetype definitions. | none | 5 | none | medium |
| `packages/content/src/generators/player-current-ability-bands.ts` | 237 | 4 | 13 | Current ability bands. | Band selection and validation. | 4 | watch | high |
| `packages/content/src/generators/player-generation-bands.ts` | 118 | 1 | 8 | Generation band contracts. | none | 5 | none | high |
| `packages/content/src/generators/player-potential-rarity.ts` | 108 | 2 | 9 | Potential rarity classes. | none | 5 | none | high |
| `packages/content/src/generators/player-rarity-budget.ts` | 189 | 4 | 8 | Rarity budget allocation. | none | 4 | none | high |
| `packages/content/src/generators/player-role-attribute-classification.ts` | 462 | 1 | 9 | Role attribute classification. | Large data tables and classification helpers. | 3 | watch | high |
| `packages/content/src/generators/player-role-identity.ts` | 124 | 1 | 2 | Role identity generation helpers. | none | 5 | none | medium |
| `packages/content/src/generators/player-role-templates.ts` | 494 | 4 | 8 | Role templates and ability shaping. | Large data/model table plus helper logic. | 3 | watch | high |

## Simulation Tools Long-Run Files

| File | Lines | Imports | Exports | Main responsibility | Suspected secondary responsibilities | Readability | Split | Risk |
|---|---:|---:|---:|---|---|---:|---|---|
| `packages/simulation-tools/src/long-run/anomaly-scoring.ts` | 327 | 2 | 6 | Long-run anomaly scoring. | Threshold semantics and aggregation. | 3 | watch | medium |
| `packages/simulation-tools/src/long-run/career-long-runner.ts` | 170 | 3 | 8 | Career long-run runner. | none | 4 | none | high |
| `packages/simulation-tools/src/long-run/club-stability.ts` | 196 | 0 | 4 | Club stability metrics. | none | 4 | none | medium |
| `packages/simulation-tools/src/long-run/long-runner.ts` | 85 | 1 | 7 | Generic long-run runner contracts. | none | 5 | none | high |
| `packages/simulation-tools/src/long-run/player-evolution.ts` | 190 | 0 | 6 | Player evolution metrics. | none | 4 | none | medium |
| `packages/simulation-tools/src/long-run/youth-stability.ts` | 262 | 1 | 5 | Youth stability metrics. | none | 4 | watch | medium |

## Top Five Files Where Flow Is Hardest To Trace

1. `apps/cli/src/commands/simulate-season.ts`
   - Reason: one command owns many inspection modes, fixture rendering, season rendering, setup demos, manual tactic switch, condition demo, lineup demo, identity/player-generation review, and market demo integration.
   - User-facing risk: future CLI/UI behavior could drift if presentation and simulation composition remain tangled.
2. `apps/cli/src/commands/ten-season-report.ts`
   - Reason: report command appears to mix execution, report model building, anomaly interpretation, and rendering.
   - User-facing risk: long-run warning semantics can become hard to audit.
3. `apps/cli/src/commands/career/format.ts`
   - Reason: many career output modes are formatted in one file.
   - User-facing risk: localization/output changes can become fragile.
4. `packages/engine/src/use-cases/simulate-season.ts`
   - Reason: core season loop handles many optional behaviors and output aggregates.
   - User-facing risk: feature additions can accidentally affect match/season determinism.
5. `packages/engine/src/career/player-development.ts`
   - Reason: development model is compactly housed but contains many internal curves and rules.
   - User-facing risk: growth/decline credibility is core to long-run fun and needs careful boundaries.

## Top Five Large But Coherent Files

1. `packages/engine/src/career/player-development.ts`
   - Large but coherent because it owns one gameplay concept: deterministic player growth and aging.
   - Split only if extracting named curve/config helpers improves readability without changing behavior.
2. `packages/content/src/generators/player-role-templates.ts`
   - Large but coherent because it is mostly data/model configuration for role templates.
   - A split should separate data tables from helper functions only if needed.
3. `packages/content/src/generators/player-role-attribute-classification.ts`
   - Large but coherent because it centralizes role-attribute classification.
   - Splitting too early could scatter the role rules the user cares about.
4. `packages/engine/src/match-engine/team-strength.ts`
   - Large but coherent because it owns team strength derivation and validation.
   - Keep as one module unless Step 02 proves exported surface is too broad.
5. `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
   - Medium-large but coherent because it owns anomaly classification.
   - Keep thresholds and semantics together unless CLI currently duplicates report modeling.

## Step 02 Input

Step 02 should focus on public interface surface, not file splitting yet.

Priority review targets:

- `packages/engine/src/index.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/content/src/index.ts`
- `packages/simulation-tools/src/index.ts`
- CLI imports from `@game/engine`, `@game/content`, `@game/simulation-tools`, and `@game/storage`

Questions for Step 02:

- Which engine exports are stable use-case entry points?
- Which engine exports are low-level implementation details exposed for historical reasons?
- Can career advancement be consumed through one obvious engine entry point?
- Can world generation expose a clearer top-level content entry point?
- Can long-run diagnostics expose a structured report model so CLI renders instead of calculating meaning?

## Verification

- `find apps packages -name package.json -maxdepth 4 -print | sort`: passed.
- `find apps packages -path "*/src/*" -type f | sort`: passed.
- `wc -l apps/cli/src/commands/*.ts apps/cli/src/commands/**/*.ts packages/engine/src/**/*.ts packages/content/src/**/*.ts packages/simulation-tools/src/**/*.ts`: passed.
- `rg -n "^import |^export " apps packages`: passed.
- `pnpm depcruise`: passed with no dependency violations. Environment note: initial shell did not find `pnpm`; using the Node v24.19.0 path is recommended in this sandbox.
- `git diff --check`: pending final status update.
