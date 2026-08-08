# Step 03D - Report Module Migration And Single CLI Entrypoint

## Status

**Done on 2026-08-08. Checkpoint U2: `GO`.** `simulation-report` is the only
report CLI entrypoint, every retained producer has an active module/profile
caller, and Step 04 is authorized.

## Goal

Finish the consolidation so `simulation-report` is the only CLI report
entrypoint. A caller chooses population depth and report modules; locked profiles
express preregistered checkpoints without creating new commands.

Examples:

```bash
# One complete career season, concise output
pnpm cli simulation-report \
  --worlds=1 --seasons=1 \
  --include=season \
  --detail=summary \
  --format=console

# The same career facts plus market and fielded-shape observations
pnpm cli simulation-report \
  --worlds=1 --seasons=1 \
  --include=season,transfers,formations \
  --detail=standard \
  --format=markdown

# Deep multi-world career inspection
pnpm cli simulation-report \
  --worlds=50 --seasons=10 \
  --include=season,standings,players,transfers,formations,economy,development,anomalies \
  --detail=diagnostic \
  --format=html \
  --report-output=simulation-out/career-inspection.html \
  --workers=7
```

The second command appends observations; it must not simulate a different
season from the first.

## Existing Entrypoints To Retire

At Step 03D entry, inventory the actual tree again. The known registered report
commands before Step 03C are:

- `balance-report`;
- `ten-season-report`;
- `season-recap-report`;
- `tactical-shape-report`;
- `tactical-agency-report`;
- `hard-cap-reachability-report`.

Step 03C removes the two tactical command surfaces. This step migrates the
remaining four. It also audits unregistered report-like files such as the
live-match-control report: integrate them when they have an active required
use, otherwise delete the orphaned shell and retain only production facts with
real callers.

`simulate-season`, `career` and `doctor` are gameplay/maintenance commands, not
report aliases, and remain separate.

At Definition of Done, none of the six retired names remains as a CLI command,
compatibility alias, command parser, standalone formatter or production
`*Report` Interface. Computation that is still needed is renamed and owned as a
canonical fact producer, section Adapter or locked-profile gate reader. A
locked profile is configuration of `simulation-report`, not another report.

## Canonical Modules

Implement only modules backed by real facts and an active request. No empty
future module may enter the registry.

Required modules in this step:

- `season` - horizon, results and reconciliation summary;
- `standings` - competition tables, points and ranks;
- `players` - goals/assists leaders and player identity facts already observed
  by the canonical career path;
- `transfers` - events read from canonical `transferHistory` at season
  boundaries, never inferred from final ownership;
- `formations` - observed fielded lineups and selection source, never rebuilt
  from a default formation;
- `economy` - existing balance/player-economy facts;
- `development` - existing player-development cohort facts;
- `anomalies` - existing long-run diagnostic facts.

Specialized evidence that does not fit a reusable custom section becomes a
locked profile composed from these modules. A profile may add gate evaluation,
but it may not fork the underlying simulation or duplicate section formulas.

## Locked Profiles

Migrate the current contracts into versioned profiles, including:

- long-run gate;
- player-development cohort;
- season recap;
- balance report;
- hard-cap reachability probe;
- Phase 81A tactical agency/A2;
- Phase 81 tactical shape.

Hard-cap reachability keeps its preregistered corpus immutable. A profile can
refuse `--worlds`, `--seasons`, `--include` and seed overrides while still using
the same command, manifest, shard runner and render adapters.

Do not add the Phase 81B `world-integrity` profile before its step owns real
standings, player leaders, transfers and diagnostic-view facts. A registry row
with no active producer is dead code even if a future document mentions it.

## Scientific Continuity Before Deletion

Consolidation is an Interface migration, not permission to recalibrate an
audit. Before modifying each legacy path, freeze its current contract on the
exact population already owned by its tests or preregistration:

- seed prefixes and exact world seeds;
- world count, season count, worker policy and resume/checkpoint behaviour;
- calibration and schema/version stamps;
- canonical structured facts, stable row ordering and reconciliation counts;
- replay/state hashes and RNG consumption where the legacy path records them;
- thresholds, reachable failure branches and outcome vocabulary;
- gate decision, rendered status and process exit code.

The replacement profile must reproduce that matrix before the old shell is
removed. Existing numeric golden expectations move to the new Interface
unchanged; they are not re-recorded merely because the command name or envelope
changed. Presentation-only differences are isolated in renderer tests and may
not hide a changed fact, threshold or decision.

If exact structured parity fails, the migration returns `REFINE`: diagnose the
different producer, ordering, observation timing or RNG path. Do not accept a
new baseline, weaken a comparison or retain both systems indefinitely. A known
legacy modelling defect is recorded for its owning gameplay step and preserved
during this migration unless the current step explicitly owns its correction.

Deletion happens only after parity for that path, but Step 03D cannot close
partially. Its final tree has one report Interface and zero legacy report
surfaces. Temporary parity harnesses are tests with an explicit removal owner;
no legacy implementation or oracle remains callable in production.

## Shared Execution Plan

`createSingleWorldReport(...)` already feeds ten-season, season recap and the
hard-cap probe. Treat that as evidence of a real shared seam, not permission to
turn its existing large return value into the universal Interface.

Extract or adapt one canonical world/career execution result containing facts
that modules genuinely share. Section adapters consume that result. They do not
call `createSingleWorldReport(...)` independently, replay the career, or derive
opening facts twice.

The planner records an execution DAG in the manifest:

- world generation;
- career initialization;
- season advancement count;
- match/lineup capture;
- season-boundary market capture;
- requested section aggregation;
- gate evaluation;
- rendering.

Every node has a stable key and executes at most once per shard.

## Modular Output Adapters

Data selection and presentation are orthogonal:

- `--include` selects the measured modules;
- `--detail=summary|standard|diagnostic` selects retained structured depth;
- `--format=console|json|markdown|html` selects the presentation Adapter.

JSON is the canonical machine artifact. Console and Markdown are compact
development projections. HTML is the personal diagnostic inspection view: it is
implemented in this step as a real Adapter, not postponed to Phase 81B.
The personal HTML artifact is rendered only in English. It has no language
selector and rejects an explicit non-English `--lang` rather than ignoring it.
Its labels still resolve through the localization layer, as required by the
project rules; they are not hardcoded inside the renderer. Stable IDs, schema
keys, profile IDs and declared outcome tokens remain language-agnostic.

The CLI also supports render-only conversion from an existing canonical
artifact:

```bash
pnpm cli simulation-report \
  --from-report=simulation-out/career-inspection.json \
  --format=html \
  --report-output=simulation-out/career-inspection.html
```

`--from-report` refuses population, profile and execution overrides. It does
not generate a world, advance a season or consume RNG. Rendering the same
canonical JSON twice produces byte-identical output.

Every Adapter consumes the same typed section registry. It may omit rows that
the selected `detail` level did not retain, but it may not calculate a new
metric, re-evaluate a threshold or reconstruct a missing fact. A section that
was not requested is absent from navigation and represented canonically as
`not_requested`; it is never shown with invented empty data.

### HTML Inspection View

The HTML output is modular by section and is designed for reading a simulated
football world at a glance. It is an explicitly desktop-only personal
diagnostic artifact, not a responsive product screen:

- an aggregate overview across all worlds and seasons;
- selectors for a world and season only when those dimensions were retained;
- standings with rank, points, wins/draws/losses, goals for/against and goal
  difference;
- scorer and assist tables with stable player ID, name, age, primary role,
  club, appearances/minutes and totals;
- transfer movement by season and club from canonical `transferHistory`;
- observed formation and selection-source use from played-match facts. Tactic
  and lateral-focus evidence stays in the specialized `tactical_agency` profile
  until gameplay owns durable fielded facts for those decisions;
- visible reconciliation failures and anomaly links back to their world/season.

A `50 x 10` report does not render five hundred full tables on one page. It
opens on aggregates and exposes world/season drill-down from the retained
canonical rows. Unrequested modules contribute neither HTML component nor
JavaScript payload. Renderer modules have active callers and tests; no empty
future panel enters the registry.

The generated view is a self-contained local artifact with no remote runtime,
tracking request or network dependency. Its semantic tables remain readable
without client-side JavaScript; JavaScript may enhance filtering and drill-down
but may not be required to recover the report evidence.

The supported visual target is one declared desktop viewport. No mobile layout,
responsive redesign or WCAG conformance audit is in scope. The repository rules
still require a narrow Playwright safety screenshot and keyboard access to the
primary navigation. Those checks prove that the artifact does not become blank,
trap focus or hide evidence; they do not make narrow viewports a supported
presentation target. Use native headings, tables, links, `select` and `details`
elements so this minimum does not require a parallel accessibility framework.
Motion classification is `none`.

## Migration Order

1. Re-inventory report entrypoints, imports, i18n keys, scripts, docs and tests;
   compare Graphify callers with `rg` because graph silence is not evidence.
2. Write the scientific-continuity matrix from existing tests and
   preregistrations before changing a producer or golden value.
3. Migrate `season-recap-report` into `season`, `standings`, `players` and
   `formations` modules; prove parity, then delete its CLI shell.
4. Migrate `ten-season-report` and its `report-kind` branches into custom module
   requests and locked profiles; keep resumable shards/checkpoints canonical.
5. Migrate `balance-report` into reusable economy sections/profile.
6. Migrate the hard-cap probe into its locked profile without changing its
   preregistered corpus or outcome vocabulary.
7. Add the HTML Adapter and render-only path over the canonical artifact;
   exercise every supported section at a real retained detail level.
8. Resolve every unregistered report-like command by active integration or
   deletion; never preserve a shell with no dispatcher.
9. Remove old parsers, dispatch branches, usage strings, command dependency
   seams, formatters, tests and localized labels after their replacement passes.
10. Update every reproduction command in active docs and generated artifacts.
11. Cross-check the final worktree against *Expected Files* and run the deletion
   gate below.

## No-Dead-Code And Single-Entrypoint Gate

Step 03D fails unless:

- `apps/cli/src/index.ts` dispatches exactly one `*-report` command:
  `simulation-report`;
- all five `cli.availableCommands` labels agree with that dispatch;
- no production `runBalanceReportCommand`, `runTenSeasonReportCommand`,
  `runSeasonRecapReportCommand`, `runTacticalShapeReportCommand`,
  `runTacticalAgencyReportCommand` or
  `runHardCapReachabilityReportCommand` remains;
- no standalone legacy report parser, formatter, Interface, compatibility alias
  or production oracle remains under a different filename;
- legacy producer names such as `createSingleWorldReport(...)` and
  `createTacticalAgencyReportWithRows(...)` are either replaced by canonical
  fact/section ownership or proven absent; retaining the old name and return
  shape behind a new Adapter does not count as migration;
- every retained producer/formatter has an active registry adapter and caller;
- every output Adapter is reachable from the CLI, consumes the canonical
  artifact and has a deterministic rebuild test;
- no placeholder format, empty HTML panel, renderer-only duplicate fact or
  renderer formula remains;
- every module ID is reachable on real data and selected by a test plus at least
  one custom request or locked profile;
- every removed command's parser, fixture, test seam, i18n key and docs command
  is deleted or migrated in the same step;
- every legacy numeric golden, threshold, outcome and exit-code assertion is
  exercised through `simulation-report` without migration-time rerecording;
- there is one section formula and one gate reader for each fact;
- no compatibility alias, fallback command name or `??` default reconstructs a
  removed report;
- Graphify affected output and the final `git status`/Expected-Files comparison
  contain no unexplained residue.

The static rule is owned by
`scripts/check-single-report-entrypoint.ts` and runs inside `pnpm check`. It
inspects the real dispatcher, command files, localized available-command lists
and active reproduction commands. The retired names may survive only in this
migration contract, historical audit evidence and the checker's own denylist;
none of those is executable. Its preregistered before-state is the current tree,
where the check fails because the legacy commands really exist; its closing
state must pass after their removal.

## Verification Checkpoint U2

Checkpoint U2 runs simulation work with exactly `7` workers and records:

- byte-identical canonical section facts against every retained legacy golden
  population;
- a per-legacy-path continuity record proves seeds, observation timing,
  calibration stamps, row order, reconciliation, replay hashes, thresholds,
  decisions and exit codes did not move;
- same exit codes and gate outcomes for every locked profile;
- one-world/one-season `season`, then the same request plus `transfers`, then
  plus `formations`: earlier sections and replay hashes remain byte-identical;
- `worlds=1/7`, `seasons=1/10` and `detail=summary/diagnostic` all reachable;
- transfer rows reconcile with canonical `transferHistory`;
- formation rows reconcile with observed `fieldedLineups`, selection source
  fallback count `0`, and at least five distinct forms on the declared cohort;
- resume/rebuild produces byte-identical reports and section order;
- console, Markdown and HTML rebuilt from the same JSON cause zero simulation
  executions and preserve the canonical report hash;
- two HTML rebuilds from the same artifact are byte-identical;
- HTML navigation and sections match exactly the requested modules and retained
  detail; no unrequested module appears as an empty panel;
- the HTML view passes visual inspection at the declared desktop viewport;
- the repository-mandated narrow screenshot is a safety check only: no blank
  page, hidden evidence or broken navigation is accepted, but responsive/mobile
  layout is not a supported target;
- primary world, season and section navigation uses native controls and remains
  keyboard reachable with visible browser focus;
- HTML is deterministically English; a non-English HTML request fails closed,
  while stable outcome tokens remain untranslated;
- motion classification is `none`; no animation or reduced-motion-specific
  implementation is introduced;
- invalid dependency cycles, duplicate module IDs and illegal locked-profile
  overrides fail closed;
- the single-entrypoint and no-dead-code gate above passes mechanically.

Any failed continuity row is U2 `REFINE`, even if the new aggregate report looks
more plausible. Report validity is preserved by equivalence, not by qualitative
approval after seeing the new output.

U2 `GO` opens Step 04. `REFINE` reopens only 03C/03D without moving report or
profile contracts. `STOP / RETHINK` keeps Step 04 closed rather than retaining
both old and new report systems indefinitely.

## Checkpoint U2 Outcome - GO

The migration preserved evidence and removed the parallel Interfaces:

- `apps/cli/src/index.ts` exposes `simulation-report` as the only report
  command. The mechanical single-entrypoint gate covers dispatcher branches,
  localized command lists, package scripts and retired production symbols.
- Eight reusable career modules share one world/career execution. The carried
  Phase 81A and Phase 81 tactical instruments plus eight migrated locked
  profiles reuse their original producers, seed populations, thresholds,
  decisions and checkpoints; no legacy numeric golden was rerecorded.
- The retained career-facts suite passed `16/16` alone in `361.14` seconds;
  season-recap facts passed `20/20`; the final full gate passed `293/293` files
  and `2218/2218` tests. The first two full gates exposed stale 30-second test
  budgets, not bad outcomes: every file passed alone, one global 60-second
  budget now owns the rule, and local overrides were removed.
- With one fixed seed, `season` was byte-identical when `transfers` and then
  `formations` were appended; `transfers` was also byte-identical in the third
  request. The observed season held `50` durable transfer rows, `8` distinct
  formations, `0` selection fallbacks and only `catalog_ai` sources.
- The 7-world smoke recorded exactly `7` workers and `7` manifest seeds. The
  one-world probes correctly resolved to one actual worker rather than claiming
  six idle workers. Planner tests cover `1/7` worlds, `1/10` seasons and
  summary/diagnostic depth.
- `summary` retains compact leaders, transfers, economy gates and development
  totals; standard/diagnostic retain deeper canonical rows. All eight modules
  were observed together on a real career run.
- Two HTML rebuilds from one canonical JSON were byte-identical (`cmp=0`) and
  consumed no simulation. Browser inspection found exact requested navigation,
  native world/season drill-down, one visible season per module, zero console
  errors, and a nonblank 900-pixel safety view. HTML remains English,
  self-contained, desktop-only and motion-free.
- Graphify was rebuilt. `createSimulationReportFromPlan(...)` owns the command
  execution boundary, `createCareerSectionsFacts(...)` has that registry as its
  production caller, and `simulateSeason(...)` reaches the new career evidence
  path without a second simulator.

The low-block `2.8051` debt is unchanged and still belongs to Step 05. U2 is an
Interface/evidence `GO`, not a tactical-balance claim.

## Expected Files

Graphify and `rg` inventory completed on 2026-08-08. This is the exact migration
surface before the first Step 03D production edit:

- Existing foundation files:
  `apps/cli/src/commands/simulation-report.ts`, `simulation-report.test.ts`,
  and `simulation-report/{report-help,report-planner,report-planner.test,report-registry,report-renderers,season-section,tactical-agency-section,tactical-agency-world,tactical-agency-checkpoint-a2,tactical-agency-checkpoint-a2.test,tactical-shape-section,tactical-shape-section.test}.ts` - extend the one Interface and registry; no second shell.
- `apps/cli/src/commands/simulation-report/career-sections.ts` and
  `career-sections.test.ts` **(new)** - run one canonical career execution per
  world and project the requested season, standings, player, transfer,
  formation, economy, development and anomaly facts from it. This shared seam
  is listed before creation because implementing the modules independently in
  their own files would either resimulate a world or retain duplicate facts.
- `apps/cli/src/commands/simulation-report/locked-profile-sections.ts` and
  `locked-profile-sections.test.ts` **(new)** - compose the frozen balance,
  season-recap, long-run, development, hard-cap and live-match evidence from
  their existing fact producers. A single owner is required so profile
  execution cannot grow into one replacement command module per retired shell.
- New presentation/static-gate files:
  `simulation-report/report-html.ts`, `report-html.test.ts`,
  `scripts/check-single-report-entrypoint.ts` - English desktop artifact,
  render-only parity and mechanical single-entrypoint enforcement.
- Long-run producer migration:
  `ten-season-report.ts`, `ten-season-report.test.ts`, and
  `ten-season-report/{report-data,gate-checkpoint,gate-output,gate-status,gate-status.test,single-world-output}.ts` - move active facts/checkpoints/gates under
  canonical module/profile ownership; delete shell and standalone formatters.
- Recap migration:
  `season-recap-report.ts`, `season-recap-report.test.ts`, and
  `season-recap-report/{recap-report,recap-report.test,recap-world,recap-world.test}.ts` - season/standings/players/formations adapters, then shell deletion.
  The retained aggregate and worker facts move to
  `simulation-report/{season-recap-profile,season-recap-profile.test,season-recap-profile-world,season-recap-profile-world.test}.ts`; their standalone
  Markdown formatters are removed because the canonical adapters own every
  presentation.
- Economy/profile migration: `balance-report.ts`, `balance-report.test.ts`,
  `hard-cap-reachability-report.ts`, `hard-cap-reachability-report.test.ts`, and
  `hard-cap-reachability-report/{probe-data,probe-data.test}.ts` - preserve
  locked populations and exit vocabulary behind profiles.
  The preregistered probe producer and its reachability tests move to
  `simulation-report/hard-cap-reachability-profile.ts` and
  `hard-cap-reachability-profile.test.ts`; only the command shell, formatter
  and injected command seam are deleted.
- Orphan resolution: `live-match-control-report.ts`,
  `live-match-control-report.main.ts`, `live-match-control-report.test.ts` and
  `live-match-control-report-data.ts` - remove the unregistered shell; retain
  only actively registered analysis facts or delete them.
  Its active generated-world producer moves to
  `simulation-report/live-match-control-profile.ts`; the new name describes
  the only surviving caller and removes the obsolete standalone-report
  ownership.
- `apps/cli/src/index.ts` - removes the final four legacy report branches.
- `packages/engine/src/use-cases/simulate-season.ts` and
  `simulate-season.test.ts` - report-only fielded-lineup evidence may be added
  to the existing result without changing match execution; required so
  formations are observed, never reconstructed.
- `packages/simulation-tools/src/season-recap/season-recap.test.ts` - its typed
  hand-built season fixture must name the exact `fieldedTeams` now required by
  `SimulateSeasonFixtureParticipation`; the production recap formula is
  unchanged and no fallback lineup enters the fixture.
- `packages/engine/src/match-engine/match-context.ts` - one JSDoc recipe named
  the retired `balance-report` command. The comment is repointed to its locked
  `simulation-report` profile; no executable match contract changes.
- `packages/simulation-tools/src/modular-report/report-contract.ts` and
  `report-contract.test.ts`, plus `packages/simulation-tools/src/index.ts` -
  add HTML/render-only validation only when the real adapter exists.
- `packages/i18n/src/labels.ts` - one available-command list and labels used by
  all adapters; retired command-only families are removed in all languages.
- `package.json` - adds `check:single-report-entrypoint` to `pnpm check`.
- `scripts/check-squad-depth-accessor.ts` - its enumerated active lineup reader
  moves from the deleted live-match report filename to
  `simulation-report/live-match-control-profile.ts`; dropping the reader from
  the absence gate would weaken coverage during the rename.
- `vitest.config.ts` - the first full migration gate put three real-world tests
  above the stale suite-wide `30_000` ms contention budget (`31.1`-`34.3` s),
  while every file passed alone, including the previously unmeasured content
  file at `21.79` s. The owner is the one global budget, not three local timeout
  exceptions; update its evidence and margin once before repeating the gate.
- `packages/content/src/generators/player-generation-quality.test.ts` and the
  migrated `simulation-report/career-world-facts.test.ts` - remove their stale
  local `30_000` ms overrides after the isolated runs prove correctness. Those
  overrides shadow the suite owner and caused the second full gate to keep
  failing at exactly 30 seconds after the global budget was corrected.
- `apps/cli/package.json` - removes the stale tactical-shape command script;
  keeping a package-level executable alias would violate the one-entrypoint
  contract even after the dispatcher branch was gone.
- Active operational docs: `docs/ARCHITECTURE.md`, `docs/PROJECT_STATUS.md`,
  `docs/steps/README.md`,
  `docs/audits/README.md`,
  `PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md`,
  `PHASE_81A_HARD_CAP_REACHABILITY_REPORT.md`,
  `PHASE_81_SEASON_RECAP_DESIGN.md`,
  `LONG_RUN_MANUAL_INSPECTION_GUIDE.md`, the Phase 81A README, this document,
  `04-conserved-tactical-contributions.md`, and Phase 81B Step 07 - migrate
  executable recipes, never historical outcomes.

Historical step/audit files remain historical evidence and are not bulk-edited
merely because they record the command that existed at the time. Before close,
`git status` is crossed against this exact list and every addition is explained
here first.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/simulation-report.test.ts
pnpm cli simulation-report --help
pnpm cli simulation-report --list-modules
pnpm cli simulation-report --list-profiles
pnpm cli simulation-report --worlds=1 --seasons=1 --include=season,standings,players --format=html --report-output=simulation-out/explained-report.html --explain-plan
pnpm cli simulation-report --worlds=1 --seasons=1 --include=season --format=console --workers=7
pnpm cli simulation-report --worlds=1 --seasons=1 --include=season,standings,players,transfers,formations --detail=standard --format=json --report-output=simulation-out/u2-report.json --workers=7
pnpm cli simulation-report --from-report=simulation-out/u2-report.json --format=html --report-output=simulation-out/u2-report.html
pnpm cli simulation-report --profile=phase81a-a2 --workers=7
pnpm check
git diff --check
graphify update .
pnpm check:single-report-entrypoint
```

Each simulation gate and `pnpm check` run separately, alone. Long/resumable
profiles use ignored checkpoint directories and the canonical seven-worker cap.

## What NOT To Implement

No engine balance, transfer decision change, new transfer market, persistence
schema, beta reset, second HTML-only data model, renderer formula, dynamic
executable module loading, world-integrity profile placeholder or compatibility
alias for removed report commands. No responsive/mobile HTML design, HTML
language selector, localized HTML variant, bespoke accessibility framework or
animation system.

## Definition Of Done

`simulation-report` is the only report CLI entrypoint; requested modules append
facts without changing shared simulation truth; locked profiles preserve every
active checkpoint contract and every migrated golden/decision/exit code;
compact development output and the modular HTML inspection view rebuild from
the same canonical artifact without resimulation; old report shells, Interfaces
and all residue are deleted; the self-describing Interface is the only command
catalog; U2 records `GO`; and Step 04 is the only next action.
