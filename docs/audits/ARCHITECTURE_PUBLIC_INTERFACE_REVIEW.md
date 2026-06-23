# Architecture Public Interface Review

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`
Step: `02-public-interface-surface-review`

## Summary

The public package surfaces are consistent with the package dependency rules. No source export was changed in this step.

The main interface risk is that `@game/engine` and `@game/content` expose many low-level helpers through their root entry points. That is acceptable for the current CLI-only stage, but future UI work should depend on deeper use-case interfaces instead of recomposing helpers.

Step 03 should focus narrowly on the career advancement entry point:

- current target: `progressNextCareerFixture`;
- related CLI bridge: `apps/cli/src/commands/career/progression.ts`;
- objective: make the matchday flow obvious and documented without changing package dependencies or gameplay behavior.

## Import Surface Findings

Commands used:

```sh
rg -n "from \"@game/(domain|engine|content|storage|simulation-tools|i18n|shared)\"" apps packages
rg -n "from \"@game/.*/src|from \"\\.\\./\\.\\." apps packages
rg -n "^export " packages/*/src/index.ts
```

Findings:

- App and package code generally import package root entry points such as `@game/engine`, `@game/content`, and `@game/storage`.
- No `@game/*/src` deep package imports were found.
- Internal relative imports are used inside each package, which is expected.
- Dependency Cruiser passed with no package violations.

## Package Export Classification

### `@game/domain`

Root file: `packages/domain/src/index.ts`

Classification:

- Stable contracts:
  - entities;
  - career/game/youth state;
  - squad contracts;
  - tactics contracts;
  - ID constructors;
  - value objects.

Risk:

- Broad by design. Domain is the shared language of the game and is allowed to expose many contracts.
- No narrowing recommended now.

Target shape:

- Keep dependency-free.
- Keep rendered text out of domain.
- Keep all IDs created through constructors.

### `@game/shared`

Root file: `packages/shared/src/index.ts`

Classification:

- Stable technical utilities:
  - deterministic RNG;
  - pure date helpers;
  - numeric assertions;
  - shared errors.

Risk:

- Low. Surface is small and technical.
- No narrowing recommended.

Target shape:

- Must remain free from football/gameplay concepts.

### `@game/engine`

Root file: `packages/engine/src/index.ts`

Classification:

- Stable entry points:
  - `simulateSeason`;
  - `progressNextCareerFixture`;
  - `generateRoundRobinCalendar`;
  - `computeLeagueTable`;
  - `computeSeasonPlayerGoalStats`;
  - `computePlayerMatchStats`;
  - `applyCareerPermanentTransfer`;
  - `developPlayersForSeason`;
  - career rollover/refresh helpers.
- Stable contracts:
  - input/result types for the above use-cases;
  - match context/config types;
  - market valuation/feasibility types.
- Test-supported low-level helpers:
  - match-engine stepping and actor helpers;
  - team-strength helpers;
  - player fitness helpers;
  - formation squad fit helpers.
- Candidate for future narrowing:
  - blanket `export * from "./match-engine/index.ts"`;
  - blanket `export * from "./market/index.ts"`;
  - blanket `export * from "./player-state/index.ts"`;
  - blanket `export * from "./squad/index.ts"`;
  - low-level match helpers exposed at the package root.

Risk:

- Medium-high. The root surface lets adapters assemble low-level pieces if they choose.
- Do not narrow now because CLI and tests are active callers and Step 43 should first deepen the correct use-case paths.

Target shape:

- Future root should favor use-cases and stable contracts.
- Low-level implementation helpers should remain internal or be exposed only when tests/diagnostics need them.

### `@game/content`

Root file: `packages/content/src/index.ts`

Classification:

- Stable entry points:
  - `createFakeLeagueSystem`;
  - fake club/player generation used by CLI and reports;
  - calibration target profiles.
- Stable contracts/data:
  - identity source data;
  - nationality distribution;
  - player-generation bands;
  - role templates;
  - rarity budgets.
- Candidate for future narrowing:
  - individual generation sub-helpers;
  - source-data tables that are exported because the root is currently broad.

Risk:

- Medium. The package contains valuable data/model rules that can become scattered if callers bypass top-level generation.

Target shape:

- Expose one obvious world/league generation path for career creation.
- Keep lower-level data exported only where app/report code actually needs it.

### `@game/storage`

Root file: `packages/storage/src/index.ts`

Classification:

- Stable entry points:
  - `JsonCareerStorage`;
  - `JsonGameStorage`;
  - storage interfaces;
  - migration helpers;
  - schema version and metadata types.

Risk:

- Low. Storage has concrete adapters and interfaces, and it does not know engine/content.

Target shape:

- Keep storage as outer persistence implementation.
- Future UI/application code can depend on storage; engine must not.

### `@game/simulation-tools`

Root file: `packages/simulation-tools/src/index.ts`

Classification:

- Stable entry points:
  - calibration report;
  - long-run runners;
  - long-run player/club/youth/anomaly report builders.
- Candidate for future narrowing:
  - if CLI currently duplicates report-model building, move that model construction here instead of adding more CLI logic.

Risk:

- Medium. Diagnostic meaning should live here, but rendering and localized text should stay out.

Target shape:

- Simulation tools own report models and anomaly semantics.
- CLI owns parsing and rendering.

### `@game/i18n`

Root file: `packages/i18n/src/index.ts`

Classification:

- Stable entry points:
  - supported language contract;
  - translator creation;
  - message key catalog helpers.

Risk:

- Low. Dependency-free and intentionally presentation-oriented.

Target shape:

- Keep simulation packages out.
- Add labels here before rendering user-facing text in CLI/UI.

## Outer Adapter Composition Risks

### Career command

Current files:

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/career/scenarios.ts`
- `apps/cli/src/commands/career/preparation.ts`
- `apps/cli/src/commands/career/format.ts`

Risk:

- CLI still builds content/config inputs and renders output, which is correct.
- The core career fixture progression entry point is already in engine as `progressNextCareerFixture`.
- The unclear part is whether a junior developer can see the full order of recovery, match simulation, report application, condition consequences, and preparation retargeting.

Step 03 target:

- Keep `progressNextCareerFixture` as the likely public entry point.
- Improve its readability and/or documentation if needed.
- Only move logic if Step 03 proves gameplay sequencing still lives in CLI.

### Simulate-season command

Current files:

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season/parse-args.ts`
- `apps/cli/src/commands/simulate-season/formation-fit-output.ts`
- `apps/cli/src/commands/simulate-season/market-demo-output.ts`

Risk:

- The command owns many inspection modes and is the largest app adapter.
- It should not be the first source refactor in Step 03 because the phase sequence deliberately starts with career advancement.

Future target:

- Step 04 should select one CLI slice, probably career or simulate-season, based on Step 03 results.

### Ten-season report command

Current file:

- `apps/cli/src/commands/ten-season-report.ts`

Risk:

- Report execution, model aggregation, anomaly interpretation, file output, and rendering may be mixed.

Future target:

- Step 06 should move any pure report-model logic to `@game/simulation-tools` and keep CLI as renderer.

## Recommended Target Interface Map

| Area | Preferred public entry point | Package | Status |
|---|---|---|---|
| Career fixture advancement | `progressNextCareerFixture` | `@game/engine` | Existing, Step 03 review target |
| Career recovery | `applyCareerWeeklyRecovery` | `@game/engine` | Existing stable helper |
| Career transfer application | `applyCareerPermanentTransfer` | `@game/engine` | Existing stable use-case |
| Player development | `developPlayersForSeason` | `@game/engine` | Existing stable use-case, large implementation |
| Season simulation | `simulateSeason` | `@game/engine` | Existing stable use-case, large implementation |
| Match simulation | `simulateMatch`, `simulateMatchWithManualTactics` | `@game/engine` | Existing stable entry points |
| Match report | `createMatchReport` | `@game/engine` | Existing stable helper used by engine use-cases |
| World generation | `createFakeLeagueSystem` today; future `generateInitialWorld`-style facade if needed | `@game/content` | Step 05 review target |
| Storage | `JsonCareerStorage`, `JsonGameStorage` | `@game/storage` | Stable adapter entry points |
| Diagnostics | `createCalibrationReport`, long-run report builders | `@game/simulation-tools` | Existing, Step 06 review target |
| Localization | `createTranslator`, `translate` | `@game/i18n` | Stable presentation entry points |

## Export Narrowing Recommendations

Do not narrow exports in Step 02.

Future narrowing candidates:

1. `@game/engine` blanket match-engine exports.
   - Do this only after Step 03/04 prove adapters no longer need low-level helpers.
2. `@game/content` generator/data blanket exports.
   - Do this only after Step 05 defines the clear top-level generation interface.
3. `@game/simulation-tools` long-run exports.
   - Do this only after Step 06 decides what is model logic versus rendering.

## Step 03 Scope Decision

Step 03 should not create a new package.

Step 03 should inspect and, if useful, improve:

- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `apps/cli/src/commands/career/progression.ts`

Allowed Step 03 outcomes:

- keep `progressNextCareerFixture` unchanged but improve TSDoc/comments/tests;
- extract a private helper inside `packages/engine/src/career/` if it makes the flow clearer;
- remove redundant code if it becomes unused inside the step scope.

Not allowed in Step 03:

- new package;
- storage/content/i18n imports in engine;
- broad root export rewrite;
- gameplay tuning.

## Step 03 Adopted Follow-up

Step 03 should keep `progressNextCareerFixture` as the career advancement engine entry point.

The pre-match recovery pass should remain caller-owned for now because team contexts must be built from the recovered state and the engine cannot import content, storage, i18n, or CLI preparation builders. The engine entry point should instead document that callers must supply match-ready contexts and an already prepared `CareerState`.

## Verification

- `rg -n "from \"@game/(domain|engine|content|storage|simulation-tools|i18n|shared)\"" apps packages`: passed.
- `rg -n "from \"@game/.*/src|from \"\\.\\./\\.\\." apps packages`: no forbidden deep package imports found.
- `rg -n "^export " packages/*/src/index.ts`: passed.
- `pnpm depcruise`: passed.
- `pnpm check`: passed, 84 test files and 582 tests.
- `git diff --check`: pending final status update.
