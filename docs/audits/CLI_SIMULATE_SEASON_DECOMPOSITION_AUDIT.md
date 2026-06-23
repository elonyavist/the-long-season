# CLI Simulate Season Decomposition Audit

Date: 2026-06-22
Phase: `44-cli-adapter-decomposition-and-presentation-boundaries`
Step: `01-cli-adapter-responsibility-audit`

## Summary

`apps/cli/src/commands/simulate-season.ts` is currently the largest CLI adapter
and mixes command orchestration, demo data construction, fixture rendering,
season rendering, inspection reports, and shared presentation helpers.

The module still behaves correctly, but it is too dense for future UI work and
for junior debugging. The next work should split by real responsibility, not by
line count. The safest first extraction is fixture detail output because it is a
coherent presentation family with an explicit command mode:

`pnpm cli simulate-season --seed=<seed> --fixture=<fixtureId>`

The extraction must preserve all labels, ordering, spacing, and deterministic
match behavior.

## Current Module Inventory

| File | Lines | Responsibility |
|---|---:|---|
| `apps/cli/src/commands/simulate-season.ts` | 2696 | Main command adapter, season simulation call, many inspection builders, fixture/season renderers, shared formatting helpers, and local command types. |
| `apps/cli/src/commands/simulate-season/parse-args.ts` | 739 | Argument parsing, validation, help/profile listing, and parsed command shape. |
| `apps/cli/src/commands/simulate-season/formation-fit-output.ts` | 244 | Dedicated formation-fit renderer. |
| `apps/cli/src/commands/simulate-season/market-demo-output.ts` | 328 | Dedicated market-demo renderer. |
| `apps/cli/src/commands/simulate-season/profile-keys.ts` | 67 | Stable profile keys for setup, lineup, condition, and market demos. |

## Responsibility Map

### Command Adapter And Dispatch

Lines `74-314` own `SimulateSeasonCommandIo`, `runSimulateSeasonCommand`, parse
validation, fake league creation, profile construction, exclusive-mode checks,
season simulation, fixture branch dispatch, and stdout/stderr writes.

This should remain in `simulate-season.ts` while the first extractions happen.
Later it should become a thin orchestration layer only.

### Season Simulation Bridge

Lines `315-363` own `defaultIo` and `simulateSeasonForCli`.

`simulateSeasonForCli` is still adapter-level glue because it combines generated
content, setup overrides, fixture lineup overrides, optional condition lifecycle,
and the engine season use case. It should stay put until demo builders and
output rendering are split.

### Identity And Player-Generation Inspections

Lines `365-816` own identity review output and player-generation quality output.

These blocks are presentation/report builders. They are independent of fixture
detail and are good candidates for a later inspection-renderer module, not for
Step 02.

### Round And Fixture Output

Lines `818-958` own round output, fixture-only header output, and rich fixture
detail dispatch.

Lines `1043-1126` own match explanation formatting.

Lines `1288-1464` own fixture result, scorers, events, all-starter player stats,
fixture registrations, and one player stat row.

Lines `1473-1519` own small fixture lookup/side helpers used by fixture, round,
lineup, and condition code.

This is the best Step 02 target. It is user-visible, coherent, and high-value:
future UI needs the same separation between command orchestration and fixture
presentation.

### Fixture Explanation Trace Construction

Lines `959-1041` rebuild a fixture context and ask the engine for a compact
explanation trace. This is not pure rendering because it re-simulates one match
for diagnostic trace data.

It can move with fixture detail only if the new module remains CLI-local and the
input/output contract is explicit. It must not become a domain or engine
abstraction.

### Manual Tactical Switch And Setup Context Builders

Lines `1128-1286` build a manual tactic fixture, setup override team context,
and manual-switch metadata.

These are demo/inspection builders, not fixture renderers. They should stay in
the command adapter until the demo-builder extraction step.

### Season Summary Rendering

Lines `1526-1571` and `2214-2449` render final table, top scorer, top assist,
top goalkeeper saves, best defense, worst attack, count labels, and table rows.

This is a later extraction because it depends on shared display helpers and is
used by the default command path.

### Condition And Lineup Demo Output

Lines `1578-1758` format condition and lineup demo output.

Lines `1785-1939` build lineup demo profiles and fixture-scoped lineup
overrides.

These should move after fixture-detail extraction because fixture-detail stats
need to receive already-built lineup inspection data.

### Setup Demo Builders And Setup Output

Lines `1944-2099` build setup profiles, role changes, and setup lines.

This belongs with demo builders in a later step. It is not just presentation:
the setup override is an engine input.

### Shared Presentation Helpers

Lines `2106-2199` localize shot types, chance types, lineup roles, trace
buckets, condition tracking/effect, variance markers, mentality, and ASCII
ordering.

Some of these helpers should move with fixture detail. Others are shared by
season/setup/lineup renderers. Step 02 should move only what the fixture module
needs, then leave the rest until the owning renderer is extracted.

### Local Types

Lines `2456-2696` define CLI-owned setup, manual switch, condition, lineup,
season result, player-generation report, and derived fixture/player/club types.

Types should move only when their owner moves. Step 02 may need exported
fixture-detail input types, but should avoid a broad shared type barrel.

## Recommended Step 02 Target

Create a CLI-local fixture detail renderer module:

`apps/cli/src/commands/simulate-season/fixture-detail-output.ts`

The module should own:

- fixture-focused output lines after the fixture-only header;
- event rendering;
- all-starter player match stats rendering;
- fixture explanation trace rendering;
- small helpers that are exclusively needed by fixture detail.

`simulate-season.ts` should still own:

- argument parsing and command dispatch;
- creation of fake league content;
- creation of setup, condition, lineup, and manual-switch demo objects;
- fixture applicability decisions;
- season simulation and manual tactic re-simulation until the demo-builder step;
- default season summary output.

## Why This Extraction Is Low Risk

- The fixture detail branch is already a distinct command mode.
- It has strong smoke coverage through `--fixture`, `--fixture-explanation`,
  `--lineup-demo`, and `--manual-tactic-switch`.
- It reduces the largest file in a meaningful area without touching engine
  algorithms, generated content, balance tuning, or localization catalogs.
- It creates a clearer boundary between "what happened in the match" and "how
  the CLI command chooses which match to show".

## Risks To Control

1. Output spacing and ordering can regress. Keep exact string composition and
   run fixture smoke commands.
2. Type movement can create broad helper exports. Prefer narrow exported input
   types over shared catch-all utility modules.
3. Explanation trace construction can accidentally become mixed with rendering.
   If moved, keep it explicitly CLI-local and documented as a renderer support
   function, not engine logic.
4. Existing helpers such as `clubLabel`, `playerLabel`, and `presentationMessageKey`
   are shared across output families. Move only the minimum needed for Step 02
   or duplicate nothing.

## Next Step Decision

Proceed with:

`docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/02-simulate-season-fixture-detail-module.md`

The first implementation slice should extract the fixture-detail presentation
boundary while preserving the command adapter behavior and all existing output.

## Step 02 Implementation Note

Step 02 adopted the recommended target by adding:

`apps/cli/src/commands/simulate-season/fixture-detail-output.ts`

The module owns fixture-detail presentation:

- fixture result line;
- fixture scorers for round output;
- event rows;
- all-starter player match stats;
- optional match explanation trace rendering.

`simulate-season.ts` still owns command dispatch, fixture selection, setup/demo
construction, manual tactical switch simulation, and season summary rendering.
This keeps the first source split narrow and avoids turning fixture output into
a generic utility module.

## Step 03 Implementation Note

Step 03 moved deterministic demo construction into:

`apps/cli/src/commands/simulate-season/demo-builders.ts`

The module owns setup, lineup, condition, and fixture-scoped lineup inspection
builders plus the CLI-owned demo types. The main command still creates the
selected demo instances based on parsed user flags, but no longer contains the
profile definitions or generated-content lookup logic for those demos.

The split preserves the product rule that the user explicitly chooses lineups
and tactic switches. No automatic tactical decision, market advice, new profile,
or engine behavior was added.

## Step 04 Implementation Note

Step 04 split the remaining broad inspection presentation into two CLI-local
modules:

- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
  owns identity review and player-generation report rendering, including the
  report-only aggregate builders used by those outputs.
- `apps/cli/src/commands/simulate-season/demo-output.ts`
  owns setup, condition, lineup, and fixture-lineup inspection output for
  user-selected demo profiles.

Existing `formation-fit-output.ts` and `market-demo-output.ts` remain the right
seams and were not wrapped. `simulate-season.ts` now delegates inspection
presentation while keeping command parsing, validation, season simulation, and
default season composition local.

## Step 05 Implementation Note

Step 05 added:

`apps/cli/src/commands/simulate-season/season-summary-output.ts`

The module owns the default season summary and round fixture-list presentation:

- title, seed, competition, and optional setup block;
- final table formatting;
- top scorer, top assist, top goalkeeper saves;
- best defense and worst attack;
- optional round fixture/scorer output.

`simulate-season.ts` still performs simulation, validates requested rounds and
fixtures, and dispatches output modes. The exported `findRound` keeps the
existing missing-round validation behavior in the adapter without duplicating
round lookup logic.
