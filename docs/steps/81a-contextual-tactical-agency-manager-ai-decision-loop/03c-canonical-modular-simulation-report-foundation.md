# Step 03C - Canonical Modular Simulation Report Foundation

## Status

**Done - Checkpoint U1 `GO` on 2026-08-08.** Checkpoint A2 (`03B`) was the
entry gate. Step 03D is now the only next action; Step 04 remains closed until
U2.

## Outcome

The canonical `simulation-report` Interface now owns request normalization,
measurement/presentation separation, a typed module/profile registry, an
execution plan, explicit section statuses, canonical JSON/hash and
console/JSON/Markdown adapters. `season` uses the existing career runner;
`tactical_agency` and `tactical_shape` are real modules, not command wrappers.
The old tactical command shells, parsers, formatters, tests and i18n keys were
removed. Their producers and A2 gate reader were renamed under the module.

U1 evidence, run alone:

- `phase81a-a2` used exactly `7` workers and returned `GO`; the frozen facts
  stayed `topFormationShare=0.2063/0.2222`, `12/11` distinct forms, `10/10`
  roles, `6/6` counterfactual moves, low-block `1.8938/2.8051`, and legacy
  out-of-sample control `3.0411`;
- `season` over `1 x 1` was observed through the canonical career path. Adding
  `tactical_agency`, or requesting unavailable custom `tactical_shape`, left
  the complete `season` section byte-identical;
- the latter real request emitted all three relevant statuses:
  `season=observed`, `tactical_agency=not_requested`,
  `tactical_shape=not_observed`;
- presentation-only changes preserved the measurement request and report hash
  in tests; discovery and explain-plan modes executed zero producers;
- focused verification: `5` files / `22` tests; full `pnpm check`: `294` files,
  `2251` tests, `862` modules, `865.64s`, exit `0`.

One deliberate boundary remains for 03D: render-only conversion and HTML are
not present yet, and the four non-tactical legacy report shells still exist.

## User-Facing Reason

The project currently asks a developer to remember which report command owns
which population, flags, output format and checkpoint rule. Adding Checkpoints
B-E on top of that would make the simulation harder to inspect precisely when
the manager and AI decision loop needs repeatable evidence.

The player-facing benefit is indirect but important: one trustworthy report can
be made small for iteration or deep for long-run credibility, so engine changes
are tested against the same world instead of against disconnected harnesses.

## Goal

Create one deep **Simulation Report Module** with one CLI entrypoint and a small
typed Interface:

```bash
pnpm cli simulation-report \
  --worlds=7 \
  --seasons=1 \
  --include=season,formations,tactics \
  --detail=diagnostic \
  --workers=7
```

This step builds the canonical envelope, request planner, section registry and
first real adapters. It migrates the two tactical report entrypoints relevant to
Phase 81A. Step 03D migrates the remaining report commands and deletes their
superseded shells.

## Why A Deep Module, Not A Mega-Report

The external Interface is one normalized request and one canonical report. The
implementation stays modular:

```text
simulation-report request
        -> normalize and validate
        -> resolve requested sections and fact dependencies
        -> execute each required world fact once
        -> append typed report sections in canonical order
        -> render through an output Adapter without new formulas
```

Deleting this Module should make parsing, dependency resolution, execution
reuse, report status and rendering rules reappear across every report caller.
That deletion test is what gives the Module depth and locality. A pass-through
that merely switches on the old commands does not satisfy this step.

## Frozen Interface

The custom request supports these orthogonal dimensions:

- `--worlds=<positive integer>` - population breadth;
- `--seasons=<positive integer>` - career horizon;
- `--include=<comma-separated section IDs>` - facts exposed in the report;
- `--detail=summary|standard|diagnostic` - retained diagnostic resolution;
- `--profile=<profile ID>` - a versioned locked checkpoint or audit request;
- `--seed-prefix=<stable string>`;
- `--workers=<positive integer>`, capped by the canonical seven-worker policy;
- `--format=console|json|markdown`;
- `--lang=it|en|de|es|fr`, with the canonical English fallback;
- `--report-output=<workspace path>`.

The same entrypoint is self-describing without executing a simulation:

- `simulation-report --help` prints the option contract and commented,
  copy-pasteable recipes;
- `simulation-report --list-modules` lists reachable section IDs and the facts
  each one reports;
- `simulation-report --list-profiles` lists locked profiles and their purpose;
- `simulation-report --describe-module=<id>` and
  `--describe-profile=<id>` explain one selection, including what it does not
  measure;
- `simulation-report <request> --explain-plan` prints the normalized request,
  dependency closure, execution depth, worker count, output Adapter and
  destination, then exits without generating a world.

Help, descriptions and recipes are derived from the same total typed registries
that normalization reads. There is no second handwritten command catalog to
drift. Every printed recipe is parsed by a test, and every listed module/profile
is reachable. User-facing descriptions use i18n keys rather than hardcoded
prose.

Normalization separates a `measurementRequest` from a `presentationRequest`.
Worlds, seasons, includes, detail, profile, seed and workers belong to the
measurement identity. Format, language and output path belong only to
presentation: they are excluded from the canonical report hash and cannot
appear as dependencies of a fact producer or gate reader. JSON facts and schema
keys remain language-agnostic.

Each output Adapter declares its supported presentation variants. Unsupported
format/language combinations fail closed instead of being silently ignored.
Step 03D's personal diagnostic HTML Adapter supports English only; that does
not narrow the five-language console, help and Markdown contract established
here.

`--profile` and custom sizing are separate modes. A locked profile refuses any
override that changes its seeds, worlds, seasons, sections, thresholds or worker
count. Output path, format and language may vary because they do not change the
measurement.

The three selection axes are independent:

1. `--include` chooses which facts are measured;
2. `--detail` chooses how much structured resolution the canonical artifact
   retains;
3. `--format` chooses an output Adapter over those retained facts.

A compact development checkpoint can therefore request diagnostic facts but
render only a concise console decision. A generic report can retain standard or
diagnostic rows and later render them for a human. Changing only the output
Adapter never executes a world, changes the manifest or changes a gate result.

## Monotonic Inclusion Is Non-Negotiable

For fixed seed, worlds, seasons and profile, adding a section may append facts
but may not change any previously requested section, match result, RNG draw or
career state.

For example:

```bash
--include=season,formations
--include=season,formations,transfers
```

must produce byte-identical `season` and `formations` sections. `transfers`
observes the same canonical career; it does not turn the market on. If a cheap
fixture-only harness is needed, it is a different explicit locked profile, not
a side effect of omitting a report section.

This prevents a report option from becoming a hidden gameplay option.

## Canonical Contract

The envelope owns:

- schema and contract version;
- normalized request and requested section order;
- seed population, world/season counts and actual worker count;
- every calibration/version stamp consumed by the run;
- execution-plan identity and stable shard IDs;
- per-section status: `observed`, `not_requested`, `not_observed` or
  `not_evaluated`;
- structured section data;
- reconciliation and gate results where the selected profile owns them.

It stores the normalized `measurementRequest`, not renderer choice or output
destination. Presentation metadata may accompany a rendered file outside the
hashed canonical facts, but it cannot alter the canonical artifact.

The JSON serialization of this envelope is the canonical machine artifact.
Console and Markdown are projections of it. Renderer-specific layout is never
stored beside the structured facts, and no renderer owns a formula, threshold,
fallback or second copy of a section table.

Absent properties are not statuses. A requested section that cannot be
observed is emitted as `not_observed`; a section the caller did not request is
`not_requested`.

## Typed Module Registry

The registry is a statically imported, total typed mapping. Content packs do not
load executable report scripts.

Every module declares:

- its stable section ID;
- the canonical facts it requires;
- profiles/custom requests that can reach it;
- its structured output type;
- its deterministic aggregation order;
- whether its facts require match, season or career execution;
- its real-data reachability test.

The source uses comments where they carry an invariant a caller cannot derive:
why a fact requires a season or career run, what a section deliberately does
not claim, which locked profile owns a threshold, and why an Adapter must not
resimulate. Comments do not repeat types, option names or registry metadata;
those remain executable truth and feed the self-describing Interface above.

The planner closes dependencies before executing. Two sections needing the same
world or career advancement share the result; neither calls the other report
command or regenerates the world.

Output Adapters form a separate total typed registry. Step 03C registers only
the console, JSON and Markdown Adapters it implements and exercises. It defines
the seam that Step 03D will extend with HTML, but it must not add an `html` enum
member, placeholder renderer or unreachable branch before that real Adapter
lands.

## First Real Adapters

Migrate these existing paths behind the new Interface:

1. `tactical-agency-report`:
   `createTacticalAgencyReportWithRows(...)`, `createCheckpointA2Report(...)`
   and their canonical facts become `tactical_agency` sections/profiles.
2. `tactical-shape-report`:
   `createTacticalShapeReport(...)` and `runTacticalShapeAudit(...)` become
   `tactical_shape` sections/profiles.
3. A minimal `season` section proves `--worlds`, `--seasons`, canonical manifest
   and renderer composition on a real generated career. It must reuse an
   existing season/career producer; it may not introduce a second simulator.

The migrated command parsers, dispatch branches, command-only dependency seams,
tests and i18n keys are deleted in the same step once parity is proven. No
compatibility alias remains solely because the old name existed.

## Tactical Continuity Before Deletion

The first two migrations obey the same scientific-continuity rule that Step
03D applies to every remaining report. Before changing their producers, freeze
the existing Phase 81 tactical-shape and Phase 81A tactical-agency populations,
structured rows, calibration stamps, ordering, reconciliation, replay hashes,
thresholds, decisions and process exit codes.

Existing numeric golden expectations and the recorded A2/A2.1 outcomes move to
the new profiles unchanged. They are not re-recorded to make the new Interface
green. A presentation-envelope difference is tested separately and cannot hide
a changed fact or decision. If parity fails, U1 is `REFINE` and the responsible
producer or Adapter is corrected before either old command is removed.

At U1 `GO`, the old tactical command shells and report-shaped production
Interfaces are absent. Retained computation is renamed and owned as canonical
fact producers, section Adapters or locked-profile gate readers; wrapping
`createTacticalAgencyReportWithRows(...)` behind the new command while keeping
the old Interface does not count as migration.

## Implementation Order

1. Capture small deterministic outputs from the existing tactical commands in
   an ignored temporary location before editing production code.
2. Add the canonical contract, request normalization and execution planner.
3. Add registry-derived help, module/profile descriptions, tested recipes and
   the no-execution `--explain-plan` path.
4. Add console, JSON and Markdown output Adapters over the same structured
   report.
5. Move tactical producers behind registered modules; do not copy them.
6. Prove old/new parity on the captured populations.
7. Update every active reproduction command and audit link.
8. Delete the two old CLI entrypoints and everything left with zero callers.
9. Cross-check `git status` against *Expected Files*; the tree is truth.

## No-Dead-Code Gate

This step is not Done unless all of the following hold:

- no `runTacticalAgencyReportCommand(...)` or
  `runTacticalShapeReportCommand(...)` production caller remains;
- no tactical compatibility alias, standalone formatter or report-shaped
  production Interface remains under another filename;
- their old branches are absent from `apps/cli/src/index.ts` and from all five
  `cli.availableCommands` labels;
- no parser, formatter, test seam, fixture or i18n key exists only for a removed
  command;
- every registered module is selected by at least one real profile or custom
  request and has a real-data reachability test;
- every module/profile printed by help is read from its executable registry,
  and every printed recipe parses successfully;
- help, list, describe and explain-plan modes execute zero simulation work;
- no module is a pass-through that calls another report command;
- no world, season or low-block arm is executed twice for two requested
  sections;
- Graphify and `rg` show an active caller or documented removal owner for every
  retained export.

## Verification Checkpoint U1

Run exactly `7` workers for simulation evidence.

- old/new tactical structured facts and decisions are byte-identical on the
  frozen small populations;
- existing tactical golden numbers, thresholds, recorded outcomes and exit
  codes are exercised through the new profiles without rerecording;
- JSON -> console/Markdown rebuild is deterministic and renderers add no
  formulas;
- changing only `--format` causes zero additional simulation executions and
  preserves the canonical report hash;
- `include=A` equals the `A` projection of `include=A,B` byte for byte;
- requested/unrequested/unobserved statuses are non-vacuous on real data;
- reordering `--include` does not alter canonical section order or output;
- invalid module IDs and illegal profile overrides fail closed with exit `1`;
- help/list/describe/explain-plan are deterministic, localized and execute zero
  world, match, season or RNG work;
- every commented recipe printed by `--help` parses to the request it describes;
- execution counters prove shared facts are produced once.

U1 `GO` opens Step 03D. `REFINE` reopens only this step with the Interface
unchanged. `STOP / RETHINK` removes the new entrypoint rather than retaining a
second shallow report surface.

## Expected Files

The pre-edit Graphify/`rg` inventory was completed on 2026-08-08. This is the
exact Step 03C surface; adding a file requires first recording its ownership
here.

- `packages/simulation-tools/src/modular-report/report-contract.ts` **(new)** -
  owns the language-agnostic envelope, canonical serialization/hash and section
  statuses.
- `packages/simulation-tools/src/modular-report/report-contract.test.ts`
  **(new)** - pins canonical ordering, hash identity and invalid-status refusal.
- `packages/simulation-tools/src/index.ts` - exports that one public contract.
- `apps/cli/src/commands/simulation-report.ts` **(new)** - sole command shell,
  parser and presentation IO for the three Step 03C modules.
- `apps/cli/src/commands/simulation-report.test.ts` **(new)** - owns command
  parsing, no-execution discovery modes, locked-profile overrides, exit codes,
  renderer rebuild and migration parity.
- `apps/cli/src/commands/simulation-report/report-planner.ts` **(new)** - pure
  normalization and dependency closure.
- `apps/cli/src/commands/simulation-report/report-planner.test.ts` **(new)** -
  pins monotonic inclusion and canonical plan order.
- `apps/cli/src/commands/simulation-report/report-registry.ts` **(new)** - the
  one typed executable module/profile catalog used by help and planning.
- `apps/cli/src/commands/simulation-report/report-help.ts` **(new)** - registry-
  derived discovery text and parse-tested recipes.
- `apps/cli/src/commands/simulation-report/report-renderers.ts` **(new)** -
  console/JSON/Markdown projections over canonical facts.
- `apps/cli/src/commands/simulation-report/season-section.ts` **(new)** - adapts
  the existing canonical career runner to the minimal season section.
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts` **(new)** -
  moved and renamed agency/A2 fact production; no legacy report Interface.
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts` **(new)** -
  moved world-selection and A2.1 analysis producer.
- `apps/cli/src/commands/simulation-report/tactical-agency-checkpoint-a2.ts`
  **(new)** and `tactical-agency-checkpoint-a2.test.ts` **(new)** - moved gate
  reader and unchanged gate tests.
- `apps/cli/src/commands/simulation-report/tactical-shape-section.ts` **(new)** -
  moved quality-band/audit fact producer.
- `apps/cli/src/index.ts` - replaces both tactical dispatch branches with the
  canonical command.
- `apps/cli/src/commands/ten-season-report/report-data.ts` - active canonical
  career seam used by `season`; no formula or observation timing changes.
- `apps/cli/src/commands/tactical-agency-report.ts`,
  `tactical-agency-report.test.ts`, `tactical-agency-report/agency-world.ts`,
  `tactical-agency-report/checkpoint-a2.ts` and `checkpoint-a2.test.ts` - removed
  after their facts/tests move to canonical ownership.
- `apps/cli/src/commands/tactical-shape-report.ts`,
  `tactical-shape-report.test.ts` and `tactical-shape-report-data.ts` - removed
  after their facts/tests move to canonical ownership.
- `packages/i18n/src/labels.ts` - replaces legacy command strings in all five
  languages with registry/help/renderer labels.
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts` -
  its active reproduction comment names the locked profile after the shell is
  removed; the numeric assertion is unchanged.
- `docs/audits/README.md`,
  `PHASE_81A_CHECKPOINT_A2_SQUAD_IDENTITY.md`,
  `PHASE_81A_CHECKPOINT_A2_1_LOW_BLOCK_ATTRIBUTION.md`,
  `PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`,
  `PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md` and
  `PHASE_81_TACTICAL_SHAPE_BASELINE.md` - active audit reproduction commands
  move to locked profiles; recorded historical numbers do not move.
- `02-real-career-before-state.md`,
  `03-checkpoint-a-ownership-and-before-state.md`,
  `03a-squad-archetypes-and-primary-role-reachability.md`,
  `03b-checkpoint-a2-real-career-squad-identity.md`,
  `05-contested-routes-and-lateral-focus.md`,
  `06-checkpoint-b-structural-ceiling.md`,
  `09-checkpoint-c-player-context.md`,
  `12-checkpoint-d-manager-ai-agency.md`,
  `15-checkpoint-e-multi-match-consequence.md` and
  `16-integrated-cohort-and-phase-closeout.md` - exact Phase 81A files whose
  executable reproduction commands or expected report owner move.
- `docs/PROJECT_STATUS.md`, this step document and
  `03d-report-module-migration-and-single-cli-entrypoint.md` - live status,
  evidence and next-step handoff.

Before closing, the complete worktree is compared with this list; the tree is
truth and any divergence is a documentation failure.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/simulation-tools/src/modular-report/report-contract.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report.test.ts
pnpm cli simulation-report --help
pnpm cli simulation-report --list-modules
pnpm cli simulation-report --list-profiles
pnpm cli simulation-report --worlds=1 --seasons=1 --include=season --explain-plan
pnpm cli simulation-report --profile=phase81a-a2 --workers=7
pnpm check
git diff --check
graphify update .
```

The profile run and `pnpm check` run separately, each alone.

## What NOT To Implement

No engine balance, transfer behaviour, persistence, beta reset, HTML renderer
inside this foundation step, unreachable future output Adapter, future Phase
81B module placeholder, dynamic script loading or second career simulator.

## Definition Of Done

One canonical report Interface exists, three real modules use it, tactical
parity and monotonic inclusion pass, both superseded tactical command surfaces
are deleted without residue, the Interface explains every available choice and
tested recipe without simulation or duplicated documentation, and Step 03D is
the only next action.
