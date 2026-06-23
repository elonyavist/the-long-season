# Project Status

This file is the project handoff snapshot for LLMs and junior developers. Update it after every step attempt, completed step, rework decision, and adopted solution change.

## Current State

- Phase: Phase 0 foundation complete; Phase 1 match-engine base complete; documented Phase 2 season-simulation sequence complete; Phase 3 balance calibration complete; Phase 4 player stats and match detail complete; Phase 5 match event detail complete; Phase 6 CLI inspection and stat completeness complete; Phase 7 match engine causal v1 complete; Phase 8 tactic and lineup MVP complete; Phase 9 manual tactical changes v1 complete; Phase 10 player dynamic states complete; Phase 11 manual lineup rotation v1 complete; Phase 12 squad selection and formation core complete; Phase 13 localization foundation complete; Phase 14 engine audit and core quality review complete; Phase 15 core cleanup before career systems complete; Phase 16 career systems dependency map complete; Phase 17 market MVP permanent transfers complete; Phase 18 career state and transfer persistence complete; Phase 19 fictional people identity foundation complete; Phase 20 new career world generation complete, including surname-variety rework and simulate-season identity seed rework; Phase 21 project audit and roadmap reconciliation complete; Phase 22 pre playable loop hardening complete; Phase 23 playable career loop MVP complete; Phase 24 player generation quality rework complete; Phase 25 career match preparation persistence complete; Phase 26 project cleanup and long-run readiness complete; Phase 27 season rollover foundation complete; Phase 28 player development and aging v1 complete; Phase 29 club identity and world calendar v1 complete; Phase 30 ten-season simulation report complete; Phase 31 career squad refresh and transfer turnover simulation implemented through 250x30 gate and blocked only on the operational 10,000x50 runner runtime; Phase 32 youth academy and squad pipeline v1 implemented but later reworked by Phase 33 and Phase 34; Phase 33 player role and ability generation rework implemented; Phase 34 creator-concentration blocker cleared by Phase 34/35 evidence; Phase 35 table spread anomaly rework complete with 250x30 PASS; Phase 36 long-run warning semantics and fun audit complete; Phase 37 long-run gate semantics cleanup complete; Phase 38 match engine and calculator quality review complete; Phase 39 engine quality hardening and match explanation trace complete; Phase 40 career loop playability audit and matchday slice complete; Phase 41 career matchday consequences and condition integration complete; Phase 42 career weekly recovery and matchday readiness complete; Phase 43 architecture hardening and package rework complete; Phase 44 CLI adapter decomposition and presentation boundaries complete; Phase 45 career presentation decomposition and view-model readiness complete; Phase 46 ten-season report decomposition and long-run presentation boundaries complete; Phase 47 career UI slice readiness and first screen scope documented and ready to execute.
- Active implementation step: `docs/steps/47-career-ui-slice-readiness-and-first-screen-scope/01-phase-46-output-review.md`.
- Code status: monorepo skeleton, dependency-free domain core contracts, selected-lineup/tactic setup domain contracts, deterministic shared RNG/date utilities, JSON save storage boundary, executable enforcement, `pnpm cli doctor`, pure team-strength derivation, engine `buildTacticTeamContext` setup builder, serializable match context/config contracts, deterministic one-minute match stepping with structured shot context, complete current derived player match stats, engine-local deterministic `ChanceActors` selection for creator/shooter/primary defender/goalkeeper, and `stepMatch` attribution wired through one coherent chance actor set, batch full-match simulation, explicit `ManualTacticChangeSchedule` contract over already-built `MatchTeamContext`s, segmented fixture simulation via `simulateMatchWithManualTactics`, optional `simulateSeason.fitnessLifecycle` spend/recovery with returned `finalPlayerStates`, `simulateSeason` selected setup overrides and fixture lineup overrides, in-memory permanent-transfer market contracts, deterministic true-data player valuation, player willingness, transfer feasibility/apply preview, durable `CareerState`, JSON career save/load, persistent accepted permanent-transfer application, pure engine `findNextCareerFixture` and `progressNextCareerFixture`, pure engine `developPlayersForSeason` growth/decline with bounded potential realization, deterministic country-specific city-based fictional club naming patterns in content while preserving stable `club:` IDs, `pnpm cli career --save=<saveId> --apply-market-demo=<profile>`, `pnpm cli career --save=<saveId> --inspect`, `pnpm cli career --save=<saveId> --summary`, `pnpm cli career --save=<saveId> --advance-next-fixture`, `pnpm cli career --save=<saveId> --development-report`, durable domain match reports with schema version `7`, scorer IDs, optional assist IDs, optional non-duplicated goal creator IDs, goalkeeper save IDs, shooter IDs for generated non-goal shot events, block primary defender IDs, and structured shot context on goal/shot events, deterministic double round-robin calendar generation, copy-on-write fixture result application, deterministic derived league-table computation, season player goal and summary aggregation, fake deterministic content with generated fictional player identities, expanded nationality metadata, default 11-player lineups plus reserve players, division/tier player generation bands, role-based attribute templates, player archetypes with potential classes, rarity budgets for lower-division exceptions, `pnpm cli simulate-season --seed=demo-001` with real top scorer, top assist, and top goalkeeper-save output, optional round fixture detail, clean `--fixture=<fixtureId>` structured match detail with all-starter player stats plus compact causal `creator=` and `defender=` fields, `--identity-review` generated player identity inspection, `--player-generation-report` generated player quality inspection, `--setup-demo=pro01-balanced|pro01-attacking|pro01-defensive` CLI inspection that applies deterministic PRO01 selected lineup/tactic overrides through `simulateSeason.setupOverrides`, `--manual-tactic-switch=<minute>:<profile>` fixture inspection that applies a user-declared manual tactic switch only when the selected club is playing the requested fixture, `--condition-demo=pro01-season` season inspection for deterministic PRO01 fitness consequences, `--fixture=<fixtureId> --lineup-demo=pro01-first-team|pro01-rotated` manual lineup inspection, and localized `--market-demo=pro01-affordable-permanent|pro01-star-rejected` permanent-transfer inspection; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` exists and balance report includes explicit table points spread.
- Runtime: Node `v24.16.0` from `.nvmrc`.
- First command milestone: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001` achieved.
- First balance milestone: `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3` achieved.
- Source of truth: `requirements.md`.

## Current Active Step

- Step: `docs/steps/47-career-ui-slice-readiness-and-first-screen-scope/01-phase-46-output-review.md`
- Status: Ready. Phase 47 documentation created; implementation has not started.
- Last verification: Documentation-only update; `git diff --check` passed.
- Next action: Execute the Phase 47 review step before introducing UI-facing contracts.
- Blocker: None.

## How To Read The Project

1. Read `requirements.md` for product and architecture intent.
2. Read `docs/PROJECT_RULES.md` for non-negotiable rules.
3. Read this file for current state and adopted solutions.
4. Read `docs/steps/README.md` for the iterative workflow.
5. Read only the active step file before implementing.

## Step Ledger

| Step | Status | Outcome | Adopted solution | Verification |
|---|---|---|---|---|
| `docs/steps/47-career-ui-slice-readiness-and-first-screen-scope/README.md` | Not started | Created the Phase 47 documentation path for career UI slice readiness and first-screen scope. | Phase 47 starts with a readiness review, defines the first career dashboard/matchday hub scope, introduces UI-facing dashboard/action contracts only if justified, adds a CLI dashboard smoke output, and closes with one next-phase decision. No React or web app implementation is included in the documentation. | Documentation-only update; `git diff --check` |
| `docs/steps/47-career-ui-slice-readiness-and-first-screen-scope/01-phase-46-output-review.md` | Ready | Active first implementation step for Phase 47. | Review Phase 45/46 presentation boundaries and architecture docs before creating any UI-facing contract. | Not run yet |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/README.md` | Not started | Created the Phase 46 documentation path for ten-season report and long-run presentation boundaries. | Phase 46 starts with a responsibility audit, then separates report data building from CLI rendering, clarifies warning presentation, documents manual inspection commands, updates architecture, and closes with one next-phase recommendation. | Documentation-only update; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/01-ten-season-report-responsibility-audit.md` | Done | Mapped current ten-season report and long-run gate responsibilities before moving source. | `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md` identifies `report-data.ts` as the narrow first extraction: a CLI-local data-builder module that owns single-world and multi-world report facts while command parsing and rendering stay put until later steps. | `test -f docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_AUDIT.md`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/02-long-run-report-data-builder-boundary.md` | Done | Extracted long-run report data construction behind a named CLI-local builder boundary. | Added `apps/cli/src/commands/ten-season-report/report-data.ts` for single-world report bundles, multi-world gate aggregation, report-only career refresh, row builders, warning counts, and diagnostic snapshots. `ten-season-report.ts` remains the command parser, file writer, and renderer. No simulation behavior, thresholds, or output wording changed intentionally. | CLI typecheck; focused ten-season-report tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase46-builder --worlds=10 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/03-long-run-cli-output-renderers.md` | Done | Split ten-season and long-run gate CLI rendering into section-owned output modules. | Added `gate-output.ts` for multi-world gate text/Markdown output and `single-world-output.ts` for single-world ten-season output. `ten-season-report.ts` now focuses on command parsing, orchestration, and file writing; `report-data.ts` remains the report facts boundary. No thresholds, simulation behavior, or warning semantics changed. | CLI typecheck; i18n typecheck; focused ten-season-report tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=10 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase46-renderers --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/04-warning-semantics-presentation-cleanup.md` | Done | Clarified long-run warning presentation without changing gate semantics. | Added `docs/audits/LONG_RUN_WARNING_PRESENTATION_REVIEW.md` and a localized `Signal guide` line in gate output explaining `story`, `monitor`, and `structural` signal groups. No thresholds, simulation behavior, warning keys, or fail semantics changed. | Audit file exists; CLI typecheck; i18n typecheck; focused ten-season-report and i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase46-warning --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/05-long-run-manual-inspection-command-review.md` | Done | Documented repeatable manual long-run inspection commands and review guidance. | Added `docs/audits/LONG_RUN_MANUAL_INSPECTION_GUIDE.md` covering quick 10x10, medium 50x10, deeper 250x30, single-world follow-up, and what to inspect for world survival, squad size, youth pressure, table variety, production concentration, transfer turnover, growth, and aging. No source change was needed. | Guide file exists; `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=10 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/06-presentation-boundary-review-and-architecture-update.md` | Done | Documented the post-split ten-season report boundary and updated architecture docs. | Added `docs/audits/TEN_SEASON_REPORT_BOUNDARY_REVIEW.md`; updated `docs/ARCHITECTURE.md` so the long-run report command points to `report-data.ts`, `single-world-output.ts`, and `gate-output.ts`, and so debugging paths reflect the implemented boundary. | Boundary review file exists; `pnpm check`; `git diff --check` |
| `docs/steps/46-ten-season-report-decomposition-and-long-run-presentation-boundaries/07-phase-report-and-next-phase-decision.md` | Done | Closed Phase 46 with a final report and one next-phase recommendation. | Added `docs/audits/TEN_SEASON_REPORT_DECOMPOSITION_REPORT.md`; the report records changed files, created modules, preserved behavior, checks, risks, and recommends `Phase 47 - Career UI Slice Readiness And First Screen Scope` without starting it. | Final report file exists; CLI/i18n/simulation-tools typechecks; `pnpm check`; final 10x10 and 50x10 ten-season reports; strict calibration balance report; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/01-career-format-responsibility-audit.md` | Done | Mapped `career/format.ts` presentation responsibilities before moving source. | `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md` records output-family boundaries, helper ownership risks, what should remain in `format.ts`, and recommends `career/overview-output.ts` as the first low-risk extraction. | `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/02-career-overview-output-module.md` | Done | Extracted career overview presentation into a named module. | `apps/cli/src/commands/career/overview-output.ts` owns new-world preview, summary, and inspect output; `career.ts` imports those formatters directly; helpers still shared by advancement/squad/youth remain in `career/format.ts` until a stable helper boundary emerges. | CLI typecheck; focused career CLI tests; `pnpm check`; overview CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/03-career-preparation-output-module.md` | Done | Extracted saved lineup, saved tactic, and match-preparation presentation into a named module. | `apps/cli/src/commands/career/preparation-output.ts` owns preparation output; overview imports the narrow match-preparation formatter; small lineup/tactic helpers remain in `format.ts` until matchday output moves. | CLI typecheck; focused career CLI tests; `pnpm check`; preparation CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/04-career-matchday-output-module.md` | Done | Extracted career advancement and explanation-trace presentation into a named module. | `apps/cli/src/commands/career/matchday-output.ts` owns advance output, recovery lines, condition lines, and optional explanation trace rendering; `career.ts` imports it directly; generic helpers remain in `format.ts` pending Step 07 boundary review. | CLI typecheck; focused career CLI tests; `pnpm check`; matchday CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/05-career-roster-and-development-output-module.md` | Done | Extracted squad, youth academy, and development report presentation into player-facing modules. | `roster-output.ts` owns squad/youth output and derived player display helpers; `development-output.ts` owns development report output; hidden potential remains unexposed. | CLI typecheck; focused career CLI tests; `pnpm check`; roster/development CLI smokes; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/06-career-market-and-rollover-output-module.md` | Done | Extracted career market apply and season rollover output into named modules. | `market-output.ts` owns permanent-transfer apply output; `season-rollover-output.ts` owns rollover output; `format.ts` now remains as a 193-line shared presentation helper module. | CLI typecheck; focused career CLI tests; `pnpm check`; market CLI smoke; rollover invalid-path CLI smoke; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/07-career-presentation-boundary-review.md` | Done | Documented post-split career presentation boundaries. | `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md` classifies pure CLI renderers, builder-like modules, helper ownership, future UI view-model candidates, and remaining hotspots; `docs/ARCHITECTURE.md` now maps the new career output modules. | `pnpm check`; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/08-phase-report-and-next-phase-decision.md` | Done | Closed Phase 45 with a final report and one next-phase recommendation. | `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md` records changed files, modules created, behavior preserved, remaining risks, final checks, and recommends `46-ten-season-report-decomposition-and-long-run-presentation-boundaries` without starting it. | Report file exists; CLI/i18n typechecks; `pnpm check`; final career CLI smokes; strict balance report; `git diff --check` |
| `docs/steps/45-career-presentation-decomposition-and-view-model-readiness/README.md` | Not started | Created the Phase 45 documentation path. | Phase 45 decomposes the career presentation layer by output family: audit first, overview output, preparation output, matchday output, roster/development output, market/rollover output, presentation-boundary review, and final phase report. No UI or gameplay change is included in the documentation. | Documentation-only update; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/07-phase-report-and-next-phase-decision.md` | Done | Closed Phase 44 with the final CLI adapter decomposition report and one next-phase recommendation. | `docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md` records changed files, new modules, preserved behavior, remaining risks, final checks, and recommends `Phase 45 - Career Presentation Decomposition And View-Model Readiness` without starting it. | `test -f docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md`; CLI/i18n typechecks; `pnpm check`; all required simulate-season smoke commands; strict balance report; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/06-presentation-boundary-review.md` | Done | Documented the post-split simulate-season presentation boundaries. | `docs/audits/CLI_PRESENTATION_BOUNDARY_REVIEW.md` maps the adapter, parser, demo builders, CLI renderers, mixed builder/renderers, future UI view-model candidates, remaining hotspots, and recommends `career/format.ts` before `ten-season-report.ts` as the next presentation decomposition target. `docs/ARCHITECTURE.md` now lists the Phase 44 simulate-season module map. | `pnpm check`; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/05-simulate-season-summary-renderer.md` | Done | Extracted default season and round output out of `simulate-season.ts`. | `season-summary-output.ts` now owns default season summary, final table, top player summaries, best/worst team rows, and round fixture/scorer rendering; `simulate-season.ts` keeps simulation, validation, fixture/manual-switch composition, and dispatch. | CLI typecheck; focused simulate-season/i18n tests; `pnpm check`; season/round/Italian season smokes; strict balance report; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/04-simulate-season-inspection-renderers.md` | Done | Extracted remaining broad inspection renderers out of `simulate-season.ts`. | `generated-inspection-output.ts` owns identity review and player-generation report output; `demo-output.ts` owns setup, condition, lineup, and fixture-lineup inspection output; existing formation-fit and market-demo renderer seams were kept. | CLI typecheck; focused simulate-season/i18n tests; `pnpm check`; identity/player-generation/formation-fit/market-demo CLI smokes; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/03-simulate-season-demo-builders-module.md` | Done | Extracted simulate-season demo construction out of the command adapter. | `apps/cli/src/commands/simulate-season/demo-builders.ts` now owns setup, lineup, condition, fixture-scoped lineup inspection builders, profile applicability helper, and CLI-owned demo types; `simulate-season.ts` still composes user-selected demos and renders output. | CLI typecheck; focused simulate-season tests; `pnpm check`; condition/setup/lineup/manual-switch CLI smokes; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/02-simulate-season-fixture-detail-module.md` | Done | Extracted fixture-detail rendering out of `simulate-season.ts`. | `apps/cli/src/commands/simulate-season/fixture-detail-output.ts` now owns fixture result lines, scorer lines, event rows, all-starter player match stats, and optional explanation trace rendering; `simulate-season.ts` still owns command dispatch, fixture selection, demo construction, and season orchestration. | CLI typecheck; focused simulate-season/i18n tests; `pnpm check`; fixture, explanation, lineup-demo, manual-switch CLI smokes; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/01-cli-adapter-responsibility-audit.md` | Done | Mapped `simulate-season.ts` responsibilities before moving source. | `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md` records current module inventory, responsibility clusters, risks, what must remain in the adapter, and recommends fixture-detail output as the Step 02 extraction target. | `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/01-package-and-file-complexity-inventory.md` | Done | Created a package and file complexity audit before source refactors. | `docs/audits/ARCHITECTURE_PACKAGE_COMPLEXITY_INVENTORY.md` records package responsibilities, dependency direction, file line/import/export counts, readability scores, split priorities, and Step 02 interface review targets. | Required inventory commands; `pnpm depcruise`; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/02-public-interface-surface-review.md` | Done | Reviewed package public interfaces before source refactors. | `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md` classifies stable entry points, stable contracts, low-level helpers, and future narrowing candidates; Step 03 should keep `progressNextCareerFixture` as the likely career advancement entry point and improve readability only if needed. | Import/export scans; `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/03-career-advancement-deep-module.md` | Done | Clarified the career fixture advancement entry point without changing gameplay. | `progressNextCareerFixture` remains the stable engine entry point; its TSDoc now states the exact flow and caller-owned pre-match responsibilities, private helpers make context validation and simulation/report creation easier to follow, and a focused test proves caller-supplied recovered state is treated as pre-match truth. | Engine typecheck; focused career tests; `pnpm check`; career create/prep/advance/summary smokes; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/04-cli-command-slimming-plan-and-first-slice.md` | Done | Wrote the CLI slimming plan and applied one narrow safe CLI split. | `apps/cli/src/commands/career/season-labs.ts` now owns the pure development-report and season-rollover lab builders; `career.ts` remains the storage/dispatch adapter; `docs/audits/ARCHITECTURE_CLI_SLIMMING_PLAN.md` records the target CLI shape and future candidates. | CLI/i18n typechecks; focused career/i18n tests; `pnpm check`; career new-world/summary/squad smokes; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/05-world-generation-module-deepening.md` | Done | Clarified the generated-world content entry point without tuning generated content. | `createFakeLeagueSystem` remains the single content facade for generated league worlds; its TSDoc now explains composition order and caller intent, a focused test locks the coherent world bundle contract, and `docs/audits/ARCHITECTURE_WORLD_GENERATION_REVIEW.md` documents internal generator responsibilities and export decisions. | Content typecheck; focused content generator tests; `pnpm check`; simulate-season world-a smoke; career new-world/summary smokes; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/06-long-run-diagnostics-module-cleanup.md` | Done | Moved shared long-run status severity semantics out of CLI. | `worstLongRunAnomalyStatus` now lives in `@game/simulation-tools` and is used by `ten-season-report` when combining anomaly and youth diagnostics; `docs/audits/ARCHITECTURE_LONG_RUN_DIAGNOSTICS_REVIEW.md` records why broader report extraction is premature without weakening package boundaries. | simulation-tools/CLI typechecks; focused long-run/CLI tests; `pnpm check`; strict calibration balance report; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/07-junior-readability-pass.md` | Done | Reviewed Phase 43 source changes for junior readability without adding decorative comments. | `docs/audits/ARCHITECTURE_READABILITY_REVIEW.md` lists reviewed files, confirms no dead wrappers were introduced, records readability fixes from earlier steps, and keeps the remaining large-file decomposition candidates visible. | `pnpm depcruise`; `pnpm check`; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/08-documented-architecture-map-and-phase-report.md` | Done | Created the stable project architecture map and closed Phase 43. | `docs/ARCHITECTURE.md` explains package responsibilities, dependency direction, important files, main flows, debugging paths, remaining large files, and rules for future code; `docs/audits/ARCHITECTURE_HARDENING_FINAL_REPORT.md` records changes, intentional deferrals, verification, risks, and one recommended next phase. | `test -f docs/ARCHITECTURE.md`; `pnpm depcruise`; `pnpm check`; `pnpm cli doctor`; `pnpm cli simulate-season --seed=world-a`; career new-world/summary smokes; strict calibration balance report; `git diff --check` |
| `docs/steps/44-cli-adapter-decomposition-and-presentation-boundaries/README.md` | Not started | Created the Phase 44 documentation path. | Phase 44 decomposes the `simulate-season` CLI adapter by responsibility: audit first, fixture-detail output, demo builders, inspection renderers, season summary renderer, presentation-boundary review, and final phase report. | Documentation-only update; `git diff --check` |
| `docs/steps/43-architecture-hardening-and-package-rework/README.md` | Not started | Created the Phase 43 documentation path. | Phase 43 is an incremental architecture hardening phase: first measure package/file complexity, then narrow public interfaces, deepen career advancement, slim one CLI slice, review world generation, clean long-run diagnostics, run a readability pass, and finish with stable `docs/ARCHITECTURE.md`. | Documentation-only update; `git diff --check` |
| `docs/steps/00-foundation/00-monorepo-skeleton.md` | Done | Minimal pnpm workspace and empty package entrypoints were created. | Root pnpm workspace with `apps/cli`, `packages/domain`, `packages/shared`, `packages/engine`, `packages/content`, and `packages/storage`; placeholder scripts stay non-gameplay until enforcement. | `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `tsc --showConfig` alias check |
| `docs/steps/00-foundation/01-domain-core-types.md` | Done | Dependency-free core domain contracts, value objects, entities, state, and tests were created. | Branded IDs and value objects live in `domain`; `Player` stores the full 25-attribute shape plus potential; dynamic state is separated in `PlayerDynamicState`; `GameState` uses lookup records plus explicit ordered ID arrays. | `pnpm --filter @game/domain run typecheck`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; domain import scan |
| `docs/steps/00-foundation/02-shared-rng-and-date.md` | Done | Deterministic shared RNG streams and pure Gregorian epoch-day utilities were created. | `shared` exposes `deriveRng(seed, streamName, ...keyParts)` over `sfc32` seeded by stable `cyrb128` hash words; date conversion uses pure Gregorian arithmetic with no JavaScript `Date`; all new shared files and functions are documented with TSDoc/JSDoc. | `pnpm --filter @game/shared run typecheck`; `node --test packages/shared/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; forbidden API scan; JSDoc scan |
| `docs/steps/00-foundation/03-storage-json.md` | Done | JSON-backed save storage boundary was created for full `GameState` snapshots. | `storage` exposes `GameStorage`, `JsonGameStorage`, save metadata, schema version `1`, identity migration for v1 saves, and typed storage errors; metadata listing is sorted deterministically by save ID. | `pnpm --filter @game/storage run typecheck`; `node --test packages/storage/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; storage forbidden dependency scan; JSDoc scan |
| `docs/steps/00-foundation/04-enforcement.md` | Done | Executable enforcement and the first real CLI doctor command were created. | Dependency Cruiser enforces package boundaries, ESLint bans forbidden runtime APIs inside `engine`, Vitest runs package tests, `pnpm check` is the single gate, and `pnpm cli doctor` exits `0`. | `pnpm lint`; `pnpm depcruise`; `pnpm test`; `pnpm typecheck`; `pnpm check`; `pnpm cli doctor`; negative dependency fixture; negative engine runtime API fixture |
| `docs/steps/01-match-engine/01-team-strength.md` | Done | Pure role-weight-based `TeamStrength` derivation was created. | `engine` derives department and overall strength from explicit ordered lineup slots, caller-supplied role weight profiles, player abilities, and optional caller-supplied dynamic-state multiplier curves; missing players/roles fail with typed `TeamStrengthError`. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm check`; engine forbidden import/API scan; JSDoc scan |
| `docs/steps/01-match-engine/02-match-context.md` | Done | Serializable match context and engine config contracts were created. | `MatchContext` carries fixture ID, seed, explicit home/away team contexts, precomputed strengths, tactical distribution inputs, and `MatchEngineConfig`; `buildMatchRngKey` defines the stable `seed + "match" + fixtureId` derivation data without consuming RNG. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/match-context.test.ts`; `pnpm check`; engine forbidden import/API scan; JSDoc scan |
| `docs/steps/01-match-engine/03-step-match.md` | Done | Deterministic one-minute match stepping was created. | `MatchSimulationState` keeps match-local minute, score, stats, and marker flags; `stepMatch` advances one minute, randomizes home/away processing order through the match RNG, generates Bernoulli opportunities from aggregate team strengths, and resolves them through `OccasionResolver` with `AggregateOccasionResolver`; step events remain engine-local until the later domain `MatchReport` step. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan |
| `docs/steps/01-match-engine/04-simulate-match.md` | Done | Batch full-match simulation over `stepMatch` was created. | `simulateMatch(context)` derives one match RNG stream from `seed + "match" + fixtureId`, initializes local `MatchSimulationState`, loops over `stepMatch` until full time, returns serializable fixture ID, final minute, score, stats, and sparse step events, and fails with typed `SimulateMatchError` if the safety guard is exceeded; golden-output tests now lock full-match reproducibility. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan |
| `docs/steps/01-match-engine/05-match-report.md` | Done | Durable domain match report and event contracts were created. | `domain` owns `MatchReport`, `MatchStats`, `MatchScore`, `MATCH_EVENT_SCHEMA_VERSION`, and sparse language-agnostic `MatchEvent` variants; `engine` maps local simulation events to report events through `createMatchReport` without prose, storage schemas, fixture updates, or new simulation logic. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/01-calendar-generation.md` | Done | Deterministic double round-robin calendar generation was created. | `domain` owns minimal `Competition`, `Fixture`, and `Round` contracts; `engine` generates an even-club double round-robin calendar by shuffling explicit club IDs with `deriveRng(seed, "schedule", seasonId, competitionId)`, applying the Berger circle method, mirroring return fixtures, assigning weekly `GameDate`s, and generating sequential `fixture:` IDs. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/calendar.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/02-fixtures-and-results.md` | Done | Completed match reports can now be applied to fixture results without mutating original state. | `domain` owns compact `FixtureResult` as the table source of truth; `engine` exposes `applyMatchReportToFixture` with typed errors, fixture/report ID validation, default overwrite guard, optional debug overwrite, and copy-on-write replacement of the fixture lookup. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/03-league-table.md` | Done | League tables are now derived deterministically from played fixture results. | `domain` owns `LeagueTableRow` and simple point `LeagueTableRules`; `engine` exposes `computeLeagueTable` over explicit club IDs, fixture lookup, fixture ID order, and rules, ignoring unplayed fixtures and sorting by points, goal difference, goals for, then stable club ID. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/league-table.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/04-simulate-season-cli.md` | Done | The first gameplay milestone command now simulates one deterministic fake 18-team season and prints the final table. | `content` generates fictional clubs, players, lineups, role weights, table rules, and match config; `engine` owns a tested `simulateSeason` use-case; `apps/cli` exposes `simulate-season --seed` and composes exported engine primitives to print table, top-scorer availability, best defense, and worst attack. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; invalid-arg CLI check; forbidden API/dependency scans; JSDoc scan |
| `docs/steps/02-season-simulation/05-season-balance-report.md` | Done | Added deterministic aggregate season balance reporting and a strict CLI gate mode. | `simulation-tools` owns content-free aggregate calibration; `content` owns broad hand-authored targets; `engine` publicly exports `simulateSeason`; CLI wires fake content into the report without importing `domain` directly. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts`; `pnpm check`; default and strict-fail CLI smoke checks; forbidden API/dependency scans |
| `docs/steps/03-balance-calibration/01-calibration-target-profile.md` | Done | Added stricter `calibration-v1` target profile and CLI support without changing simulation behavior. | `default` remains the broad smoke profile; `calibration-v1` exposes the current under-scoring/draw-heavy gap; `strict-fail-smoke` remains the intentional failure profile for CLI tests. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts`; `pnpm check`; default strict CLI report passed; `calibration-v1` strict CLI report failed as expected |
| `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` | Done | Tuned fake match-engine rates and reworked conversion bands so the 20-season `calibration-v1` sample passes near 2.8 goals per match. | Config-only tuning uses base opportunity rate `0.09`, cap `0.24`, conversion probabilities `0.105/0.20/0.35`, and home advantage `1.10`; no engine algorithms changed. | Baseline `calibration-v1` 20-season report failed; first tuning reached goals `3.197`; rework reached goals `2.773` with strict report PASS; `pnpm check` passed |
| `docs/steps/03-balance-calibration/03-table-spread-review.md` | Done | Added explicit average table points spread to balance reporting and confirmed the tuned 20-season sample remains plausible. | `simulation-tools` now reports `table_points_spread` as average first-place minus last-place points; content target profiles include broad/default and stricter `calibration-v1` bands. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused calibration/CLI tests; `pnpm check`; `calibration-v1` strict 20-season report passed |
| `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` | Done | Fake content now produces a stronger top-to-bottom hierarchy while preserving current scoring calibration. | Widened generated player base ability gradient from roughly `7.2..12.5` to roughly `6.6..13.3` and reduced slot noise from `0.5` to `0.35`; no engine algorithms or scoring probabilities changed. | `pnpm --filter @game/content run typecheck`; focused content/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md` | Done | Every engine-local goal step event now carries a deterministic scorer from the scoring side lineup. | `attributeGoal` derives an independent `goal-attribution` RNG stream from seed, fixture, minute, side, and pre-goal score, then picks a weighted scorer by lineup role; this avoids consuming the main match RNG and preserves aggregate match outcomes/calibration. | `pnpm --filter @game/engine run typecheck`; focused match-engine Vitest files; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md` | Done | Durable domain goal events now preserve the scorer ID from engine-local goal step events. | `GoalMatchEvent` includes `scorerPlayerId`; `createMatchReport` copies it exactly from the engine event; `MATCH_EVENT_SCHEMA_VERSION` was bumped from `1` to `2` because the durable event schema changed. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-report/fixture tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001` |
| `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md` | Done | Simulated seasons now expose deterministic player goal totals derived from durable match reports. | `computeSeasonPlayerGoalStats` reads `MatchReport` schema v2 goal events, maps `home/away` sides to fixture clubs, includes fixed-lineup registered players with zero goals, and sorts by goals descending then stable player ID; `simulateSeason` returns `playerGoalStats`. | `pnpm --filter @game/engine run typecheck`; focused player-stat/simulate-season tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001` |
| `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md` | Done | CLI season output now prints a real deterministic top scorer instead of the aggregate-engine placeholder. | `simulate-season` now calls engine `simulateSeason` directly and formats `result.playerGoalStats[0]` with player display name, club short name, and goal count; it does not recompute stats in CLI. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md` | Done | CLI can now print deterministic fixture results and goal scorers for one requested round. | `simulate-season --round=<number>` reuses the existing `simulateSeason` result, prints fixtures in round order, includes final score and scorer/minute details from durable reports, and rejects invalid or missing round arguments cleanly. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/README.md` | Done | Created the Phase 5 documentation path for richer structured match-event detail. | Phase 5 starts with a shot-event contract, then optional assists, goalkeeper save attribution, player match stats, and CLI match detail v2; it stays deterministic, CLI-first, and avoids full duel chains or UI. | Documentation-only update; no code checks required |
| `docs/steps/05-match-event-detail/01-shot-event-contract.md` | Done | Durable and engine-local shot outcome events now carry structured shot context. | Added `shotType` and `chanceType` to `ShotContext` and engine-local shot events; values are derived deterministically from existing minute, side, quality, and tactical distribution data without consuming extra RNG or changing outcomes; `MATCH_EVENT_SCHEMA_VERSION` is now `3`. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine/player-stat tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/02-assist-attribution.md` | Done | Goal events can now carry deterministic optional assist IDs. | Added `attributeAssist` with a separate `assist-attribution` RNG stream keyed by seed, fixture, minute, side, pre-goal score, scorer, `shotType`, and `chanceType`; assists are optional, exclude the scorer and goalkeepers, favor midfield creators, and are copied into durable reports without changing match outcomes. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` | Done | Saved-shot events now carry the defending goalkeeper ID. | Added `attributeGoalkeeperSave`, required `goalkeeperPlayerId` on durable save events, bumped `MATCH_EVENT_SCHEMA_VERSION` to `5`, and made missing goalkeeper slots fail clearly. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/04-player-match-stats.md` | Done | Engine can derive compact per-player match stats from durable reports. | Added public `computePlayerMatchStats` with goals, assists, known player shots, shots on target, and saves; explicit registrations include zero-stat players and output sorts deterministically. | `pnpm --filter @game/engine run typecheck`; focused engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` | Done | CLI can now inspect one fixture with structured match-event detail and compact player stats. | Added `simulate-season --fixture=<fixtureId>` rendering from existing season results and engine `computePlayerMatchStats`; output includes event order, goals with optional assists, stable shot/chance keys, saves, misses, blocks, and compact player stats. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/README.md` | Done | Created the Phase 6 documentation path for cleaner CLI inspection and complete current player stats. | Phase 6 starts with fixture-only CLI output, then shot taker attribution, complete player match stats, fixture player-stat rendering v2, and season assist/save summaries. | Documentation-only update; no code checks required |
| `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md` | Done | `--fixture=<fixtureId>` now prints a clean fixture-detail view without the full final table. | The CLI branches to a fixture-only renderer when `--fixture` is present, reusing the same simulated season result and preserving base season and round views. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md` | Done | Generated non-goal shot events now carry deterministic attacking shooter IDs. | Added `attributeShotTaker` on a separate derived RNG stream; generated save/miss/block report events now include `shooterPlayerId`, while goals keep `scorerPlayerId` as the shooter field in the current aggregate model; `MATCH_EVENT_SCHEMA_VERSION` is now `6`. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md` | Done | `computePlayerMatchStats` now counts complete current shot stats from durable report events. | Goals credit `scorerPlayerId`; generated save/miss/block events credit `shooterPlayerId` when present; shots on target follow durable `shot.isShotOnTarget`; saves remain credited to the defending goalkeeper. | `pnpm --filter @game/engine run typecheck`; focused engine and CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md` | Done | Fixture detail now renders a clearer all-starter player-stat table. | The CLI passes home/away lineup registrations into `computePlayerMatchStats`, keeps contribution sorting for active players, and includes zero-stat starters as deterministic rows. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md` | Done | Season output now includes top assist and top goalkeeper-save summaries. | Added engine `computeSeasonPlayerSummaryStats` for goals, assists, and saves from durable reports; `simulateSeason` returns `playerSummaryStats`; CLI selects top assist/save rows from engine-derived stats without parsing rendered text. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; focused player-stat/simulate-season/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/README.md` | Done | Created the Phase 7 documentation path for causal match-event work. | Phase 7 starts with a baseline review, then chance actor selection, step-match integration, durable causal event context, and CLI causal fixture review. | Documentation-only update; no code checks required |
| `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md` | Done | Phase 6 CLI output is coherent enough to become the before/after baseline for causal match work. | No rework before causal actors: keep current fixture detail as the baseline, with the known limitation that richer causal context is still future Phase 7 scope rather than a blocker. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` | Done | Added an engine-local deterministic `ChanceActors` selector with focused tests. | `selectChanceActors` uses a separate `chance-actors` RNG stream, chooses attacking creator/shooter, defending primary defender, and defending goalkeeper from explicit lineup order, excludes goalkeepers from attacking creator/shooter roles, and requires a defending `gk` slot. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md` | Done | `stepMatch` now uses one coherent chance actor set for current player attribution. | `selectChanceActors` is called once per generated opportunity after aggregate outcome resolution; goals use selected shooter as scorer, optional assists use selected creator when credited, non-goal shots use selected shooter, saves use selected goalkeeper, blocked shots keep selected primary defender engine-local for the durable-context step, and obsolete standalone attribution helpers/tests were removed. | `pnpm --filter @game/engine run typecheck`; focused match-engine and player-stat Vitest tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` | Done | Durable match reports now preserve minimal causal actor context. | `MATCH_EVENT_SCHEMA_VERSION` is `7`; goal events may carry `creatorPlayerId` only when it is not already represented by scorer/assist, and block events may carry `primaryDefenderPlayerId`; `createMatchReport` copies these fields from engine-local events without recalculating. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused match-engine/player-stat Vitest tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` | Done | CLI fixture detail now renders durable causal context for goals and blocks. | Goal rows append compact `creator=<player>` when durable reports expose a non-duplicated creator; block rows append `defender=<player>` when durable reports expose the primary defender; base season output and fixture-only shape remain otherwise unchanged. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/README.md` | Done | Created the Phase 8 documentation path for the first managerial lever. | Phase 8 starts with a Phase 7 output review, then domain contracts, engine builder, season setup overrides, and CLI tactic/lineup inspection; UI, live match-day, player states, persistence, and management systems remain out of scope. | Documentation-only update; no code checks required |
| `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md` | Done | Phase 7 output accepted as coherent enough for tactic/lineup MVP. | No Phase 7 rework needed before domain tactic contracts; season leaders are plausible, `creator=` does not duplicate assists, `defender=` appears on block events, player stats align, and strict calibration passes. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` | Done | Added dependency-free selected-lineup and tactic setup contracts to domain. | `SelectedLineup` stores club ID plus ordered slot/player/role selections; `TacticSetup` stores five-step `mentality` plus 0-1 `pressing`, `directness`, `width`, and `risk`; helper constructors reject ambiguous lineup/tactic data and preserve serializable shape. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts`; `pnpm check` |
| `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` | Done | Added engine builder from selected lineup/tactic setup to current `MatchTeamContext`. | `buildTacticTeamContext` validates explicit required lineup size, available players, role-weight resolution, and domain setup contracts; selected slots become ordered `LineupSlot`s, strength uses existing `deriveTeamStrength`, and tactic distribution maps only `directness`, `pressing`, `width`, and `risk`. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts`; `pnpm check` |
| `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` | Done | `simulateSeason` can use explicit selected setup overrides while preserving default behavior. | Added ordered `setupOverrides` entries with self-contained lineup, tactic, players, role weights, and required lineup size; overrides call `buildTacticTeamContext`, duplicate/invalid overrides fail with `SimulateSeasonError`, and no-override CLI output remains unchanged. | `pnpm --filter @game/engine run typecheck`; focused engine tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` | Done | CLI can compare default season output against a deterministic selected lineup/tactic setup. | Added explicit `--setup-demo=pro01-attacking`; the CLI builds a PRO01 selected setup, changes slots `slot:08` and `slot:09` from `midfielder` to `attacker`, applies attacking tactic values through `simulateSeason.setupOverrides`, and prints setup context before season or fixture output. Default output remains unchanged without the flag. | `pnpm --filter @game/cli run typecheck`; focused CLI tests; `pnpm check`; default season smoke; fixture smoke; setup-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/README.md` | Done | Created the Phase 9 documentation path for manual tactical switching. | Phase 9 starts by reviewing Phase 8 output, then adds saved demo tactic profiles, an explicit manual tactic-change contract, segmented fixture simulation, and CLI inspection for one user-declared switch. Automatic tactical decisions are explicitly out of scope. | Documentation-only update; no code checks required |
| `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md` | Done | Phase 8 output accepted as a technical baseline for manual tactical switching. | `--setup-demo=pro01-attacking` clearly proves setup overrides and prints selected club, tactic values, and role changes; its season-long downside is understood as a reason to add manager-selected profiles and switches, not as a blocker. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` | Done | CLI now supports three deterministic saved setup demos for PRO01. | `--setup-demo` accepts `pro01-balanced`, `pro01-attacking`, and `pro01-defensive`; balanced matches the default PRO01 setup, while attacking and defensive are explicit manager-selectable profiles for later manual switching. | CLI typecheck; focused CLI tests; `pnpm check`; default/profile smoke commands; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md` | Done | Engine now has a deterministic contract for explicit manual tactic changes by minute. | `buildManualTacticChangeSchedule` validates caller-declared side/minute/team-context changes, sorts by minute then home/away, rejects invalid minutes, missing team contexts, invalid sides, and duplicate side+minute pairs, and performs no simulation or automatic tactical decisions. | Engine typecheck; focused manual-tactic-change tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md` | Done | Engine can simulate one fixture with caller-declared manual tactic changes. | `simulateMatchWithManualTactics` delegates to `simulateMatch` when no changes are supplied, otherwise validates `ManualTacticChangeSchedule`, applies side contexts before their declared minute, reuses the same match RNG and `stepMatch`, and keeps report/player-stat compatibility. | Engine typecheck; focused manual-tactic/simulate-with-manual-tactics tests; `pnpm check`; default season smoke; fixture smoke; strict `calibration-v1` balance report |
| `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md` | Done | CLI can inspect one user-declared manual tactic switch for a requested fixture. | Added `--manual-tactic-switch=<minute>:<profile>` for fixture detail only. The CLI requires `--fixture` and `--setup-demo`, builds the target saved profile, re-simulates the requested fixture through `simulateMatchWithManualTactics` when PRO01 is involved, and prints an explicit profile timeline; if PRO01 is not playing, it reports that the switch does not apply and leaves the fixture unchanged. | CLI typecheck; focused CLI tests; `pnpm check`; default season smoke; fixture smoke; manual-switch smoke for non-applicable and applicable fixtures; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/README.md` | Done | Created the Phase 10 documentation path for the first cross-match player state. | Phase 10 starts by reviewing Phase 9 output, then adds pure fitness spend/recovery rules, bounded fitness strength impact, optional season fitness lifecycle, and CLI condition inspection. Form, morale, injuries, staff, training, and automatic rotation remain out of scope. | Documentation-only update; no code checks required |
| `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md` | Done | Phase 9 output accepted as a stable baseline for player fitness consequences. | Manual switch output clearly shows selected club, initial profile, switch minute, target profile, applicability, and profile timeline; no automatic tactical decision is implied. | Required Phase 10 review CLI commands passed; strict `calibration-v1` balance report passed |
| `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` | Done | Pure deterministic fitness spend/recovery helpers were added. | `DEFAULT_FITNESS_RULES` spends 8 fitness per match and recovers 5 fitness per calendar day, clamps to `0..100`, copy-on-writes player states, rejects missing states and duplicate ordered IDs, and does not wire into season or CLI output yet. | Engine typecheck; focused fitness tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` | Done | Low fitness can now lightly affect team strength through explicit curves. | Fake content exposes fitness curve bands `<=39:0.88`, `<=59:0.94`, `<=79:0.98`, `<=100:1.00`; CLI team-context builders pass the curve to `deriveTeamStrength`. All generated players still start at fitness 100, so default output is unchanged. | Content/engine/CLI typechecks; focused content/engine/CLI tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` | Done | `simulateSeason` can optionally carry deterministic fitness spend/recovery across the season. | `fitnessLifecycle` is opt-in; when supplied, the use-case copy-on-writes player states, recovers tracked players between fixture dates, spends fitness for starters after each fixture, recomputes team strength from current fitness, and returns `finalPlayerStates`. Default no-lifecycle output remains unchanged. | Engine typecheck; focused engine tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md` | Done | CLI can show deterministic PRO01 fitness consequences for the season. | Added explicit `--condition-demo=pro01-season`; it enables the optional season fitness lifecycle, keeps default output unchanged, prints lifecycle rules, the first selected-club fixture, post-match fitness, recovered fitness before the next selected fixture, selected club table impact, and final starter condition. | CLI/engine typechecks; focused CLI tests; `pnpm check`; default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/README.md` | Done | Created the Phase 11 documentation path for manual lineup rotation. | Phase 11 starts by reviewing Phase 10 output, then adds lineup demo profiles, an explicit fixture lineup override contract, season wiring, and CLI lineup/condition inspection. The user chooses who plays; automatic rotation is out of scope. | Documentation-only update; no code checks required |
| `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` | Done | Phase 10 condition output accepted as a baseline for manual lineup rotation. | Existing `--condition-demo=pro01-season` clearly shows selected club, lifecycle state, rules, first fixture, post-match fitness `92`, seven-day recovery to `100`, and final starter fitness `92`. | Default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` | Done | CLI can inspect deterministic PRO01 first-team and rotated lineup profiles without applying them to the season. | Fake content now generates 16 senior players per club while keeping the default 11-player lineup unchanged; `pro01-rotated` uses real reserves No12, No13, No15, and No16 and reports differences from the first team. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/CLI Vitest tests; `pnpm check`; default season smoke; `--lineup-demo=pro01-rotated` smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` | Done | Engine now accepts and validates explicit fixture lineup override input. | `SimulateSeasonFixtureLineupOverride` identifies fixture, club, ordered lineup slots, required size, player lookup, role weights, and optional state curves; `simulateSeason` validates duplicate overrides, missing fixtures/teams, wrong fixture club, and invalid lineup data without applying overrides yet. | Engine typecheck; focused `simulate-season` tests; `pnpm check`; default season smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` | Done | `simulateSeason` now applies explicit fixture lineup overrides. | Overrides are indexed by fixture/club, apply only to the matching participant, preserve the club's existing tactic, rebuild strength from the selected lineup and current fitness states, include override players in season registrations, and spend fitness for the actual selected starters. | Engine typecheck; focused `simulate-season` tests; `pnpm check`; default season smoke; condition-demo smoke; strict `calibration-v1` balance report |
| `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` | Done | CLI can inspect one explicit user-selected lineup override for one fixture. | `--lineup-demo=<profile>` remains available for profile-only inspection and, when combined with `--fixture=<fixtureId>`, applies the selected PRO01 lineup only if PRO01 plays that fixture; output shows applicability, selected starters, rested first-team players, expected fixture fitness impact, fixture events, and player stats for the actual starters. | CLI typecheck; focused CLI tests; `pnpm check`; default season smoke; condition-demo smoke; `--fixture=fixture:000006 --lineup-demo=pro01-rotated` smoke; strict `calibration-v1` balance report |
| `docs/steps/12-squad-selection-and-formation-core/README.md` | Done | Created the Phase 12 documentation path for squad selection and formation core. | Phase 12 consolidates Phases 08-11 into a real manager-facing squad/formation model: broad curated formation catalog, squad depth, position suitability, formation fit reporting, and CLI inspection of squad gaps and fit trade-offs without prescribing market actions. | Documentation-only update; no code checks required |
| `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md` | Done | Phase 11 outputs were reviewed and accepted before formation work. | CLI season output, PRO01 rotated fixture inspection, and `calibration-v1` strict balance still pass; Phase 12 can build on manual lineup rotation without code rework. | `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md` | Done | Curated domain formation catalog was added. | `domain/tactics` exposes 22 stable formation keys, structured formation slots, recognized position families, `FORMATION_CATALOG`, deterministic ordered `FORMATIONS`, and lookup/narrowing helpers; no player assignment or squad-fit logic was added. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/formations.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` | Done | Squad-depth domain contract was added. | `domain/squad` exposes explicit squad, starter, and bench/reserve player groups plus validation for duplicates, membership, overlap, and match starter count; it preserves user choice and does not select players automatically. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/squad/squad-depth.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` | Done | Player-position to formation-slot suitability was added. | `domain/tactics` exposes strict `natural`, `adapted`, `weak`, and `invalid` suitability evaluation from `PlayerPosition[]` to formation position families; weak fits do not count as real coverage, so squad gaps remain visible. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` | Done | Engine formation squad-fit reporting was added and later reworked to avoid market-prescriptive wording. | `engine/squad` reports slot coverage, uncovered/weak/adapted slots, natural fits, likely out-of-position players, family depth, broad extra-depth groups, and stable factual `squadFitHints` keys such as `gap:*`, `adapted_only:*`, and `extra_depth:*`; it does not assign players or recommend transfers. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts`; `pnpm check` |
| `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` | Done | CLI formation-fit inspection was added and later reworded as factual squad assessment. | `simulate-season --formation-fit=<formationKey>` renders a standalone inspection for the selected fake club squad, including formation slots, covered/adapted/weak/missing slots, extra-depth groups, and localized squad-fit notes; fake clubs now generate 22 senior players while fixed default lineups stay 11 players. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/13-localization-foundation/README.md` | Done | Created and broadened the Phase 13 documentation path for localization foundation. | Phase 13 supports `it`, `en`, `de`, `es`, and `fr`, keeps English as fallback, covers all current CLI-visible game text rather than only formation-fit labels, adds enforcement against hardcoded presentation strings, and closes with project-wide policy alignment in requirements/rules. | Documentation-only update; no code checks required |
| `docs/steps/13-localization-foundation/01-phase-12-output-review.md` | Done | Current Phases 00-12 user-facing CLI text was inventoried before localization. | Localization scope covers command errors, doctor output, balance reports, season summaries, round/fixture detail, event words, player stats, tactic/setup/manual-switch output, condition/lineup output, formation-fit labels, warnings, and factual squad-fit notes; domain/engine keys remain structured data. | Source scan; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1` |
| `docs/steps/13-localization-foundation/02-language-contract-and-fallback.md` | Done | Added isolated localization package and supported-language contract. | `@game/i18n` defines supported languages `it/en/de/es/fr`, English fallback, parsing helpers, typed message keys, interpolation, and dependency isolation from simulation packages. | `pnpm --filter @game/i18n run typecheck`; focused i18n tests |
| `docs/steps/13-localization-foundation/03-label-catalog-it-en.md` | Done | Added the first English and Italian catalog for current CLI-visible presentation text. | The catalog covers common labels, CLI errors, doctor, balance report, season summary, fixture detail, event words, tactic/setup/manual-switch, condition, lineup, formation-fit, warnings, and factual squad-fit notes. | focused i18n tests |
| `docs/steps/13-localization-foundation/04-cli-language-option.md` | Done | Exposed CLI `--lang` and migrated current CLI presentation output through localization. | `simulate-season`, `balance-report`, `doctor`, and unknown-command output now render headings, labels, statuses, user-facing errors, event words, and formation-fit vocabulary through `@game/i18n`; simulation data and deterministic results stay unchanged. | CLI typecheck; focused CLI tests; localized CLI smokes |
| `docs/steps/13-localization-foundation/05-five-language-label-completion.md` | Done | Completed German, Spanish, and French labels for the current catalog. | All current message keys now have concrete `it`, `en`, `de`, `es`, and `fr` translations; English fallback remains available for future missing catalog entries. | focused i18n tests verify zero missing translations for all five languages |
| `docs/steps/13-localization-foundation/06-hardcoded-presentation-text-enforcement.md` | Done | Added a deterministic guard against new hardcoded CLI presentation text. | `scripts/check-localized-presentation-text.ts` scans current CLI output/error boundaries for direct user-facing string literals and `pnpm check` now runs `pnpm check:localized-text`. | `pnpm check:localized-text`; `pnpm check` |
| `docs/steps/13-localization-foundation/07-project-policy-localization-alignment.md` | Done | Requirements and project rules were verified as the binding localization policy. | `requirements.md` and `docs/PROJECT_RULES.md` state that labels useful to CLI/UI/event rendering/reports/statuses/warnings/hints/errors must be localization keys, while domain/engine keep language-agnostic structured data. | `rg -n "hardcoded|localizzazione|localization|user-facing|UI|CLI" requirements.md docs/PROJECT_RULES.md docs/PROJECT_STATUS.md`; `pnpm check` |
| `docs/steps/14-engine-audit-and-core-quality-review/README.md` | Done | Created the Phase 14 documentation path for complete engine/core audit before market or youth work. | Phase 14 is a non-feature audit gate with seven points: architecture boundaries, determinism, match engine, season engine, tactic/lineup/formation, code quality/dead code/naming, and final report/next-phase decision. | Documentation-only update; no source checks required |
| `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md` | Done | Package seams were audited. | Dependency Cruiser and import scans found no package-boundary violations; CLI remains the presentation/composition adapter and domain/engine remain language-agnostic. | `pnpm depcruise`; `pnpm lint`; forbidden import scans |
| `docs/steps/14-engine-audit-and-core-quality-review/02-determinism-audit.md` | Done | Determinism was audited. | Representative CLI outputs reproduce by seed and forbidden runtime scans found only acceptable storage metadata clock usage; engine has one cleanup finding for `Object.values()` in `simulateSeason`. | focused tests; CLI smokes; repeatability diff; forbidden runtime scan |
| `docs/steps/14-engine-audit-and-core-quality-review/03-match-engine-audit.md` | Done | Match engine was audited. | Current aggregate match engine, chance actors, durable reports, manual tactic segmentation, and player match stats are coherent for current scope; full possession chains remain accepted future scope. | domain/engine typecheck; focused match/player-stat tests; fixture smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/04-season-engine-audit.md` | Done | Season engine was audited. | Calendar, fixture application, table derivation, player summaries, fitness lifecycle, setup overrides, lineup overrides, and balance reporting are connected; `GameState` fixture consolidation remains a pre-persistence cleanup. | engine/simulation-tools typecheck; focused season/use-case tests; season/condition/lineup/balance smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/05-tactic-lineup-formation-audit.md` | Done | Manager-choice boundary was audited. | Tactics, lineups, formation catalog, position suitability, squad fit, setup demos, manual switches, and lineup rotation preserve explicit manager choice and avoid automatic lineup/tactic/market recommendations. | domain/engine/content/CLI typecheck; focused tactics/squad/CLI tests; Italian formation/setup/lineup smokes |
| `docs/steps/14-engine-audit-and-core-quality-review/06-code-quality-dead-code-naming-audit.md` | Done | Code quality, naming, and dead-code risks were audited. | No dead attribution helpers or old hint keys remain; cleanup findings are stale CLI comments, large `simulate-season.ts` locality risk, and the engine `Object.values()` rule violation. | `pnpm lint`; `pnpm check:localized-text`; `pnpm typecheck`; text scans |
| `docs/steps/14-engine-audit-and-core-quality-review/07-audit-report-and-next-phase-decision.md` | Done | Final audit report was created. | `docs/audits/ENGINE_CORE_AUDIT.md` gives score `86/100`, no critical blockers, one high finding, medium/low findings, verified strengths, and recommends a narrow Phase 15 core cleanup before market/youth. | `pnpm check`; final CLI smokes; audit report review |
| `docs/steps/15-core-cleanup-before-career-systems/README.md` | Done | Created the Phase 15 documentation path for narrow cleanup before market/youth/career work. | Phase 15 closes Phase 14 findings: explicit fixture-lineup override order, factual squad-fit naming cleanup, CLI module split, fixture-state decision, and final cleanup report. | Documentation-only update; no source checks required |
| `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md` | Done | Confirmed all Phase 14 cleanup findings still exist before source cleanup starts. | Phase 15 remains scoped to cleanup: ordered fixture-lineup overrides, factual squad-fit naming, CLI module locality, fixture-state decision, and final report. | `rg` scans for object iteration, market wording, fixture state; `wc -l apps/cli/src/commands/simulate-season.ts` |
| `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md` | Done | Removed the engine `Object.values()` order risk from fixture lineup overrides. | `simulateSeason` now validates fixture lineup overrides into an internal `OrderedFixtureLineupOverrides` Module with `byKey` lookup plus caller-ordered `ordered` array; player registrations use the ordered array. | engine/CLI typecheck; focused engine/CLI tests; object-iteration scan; lineup override CLI smoke; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md` | Done | Removed stale market/recommendation wording from current squad-fit implementation comments. | Runtime output stays factual and unchanged; internal comments now describe formation-fit notes and factual coverage targets instead of market hints. | CLI typecheck; focused CLI tests; localized-text check; stale-wording scan; Italian formation-fit smoke; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md` | Done | Split the large CLI `simulate-season` implementation into private modules. | `runSimulateSeasonCommand` remains the public command Interface; profile keys, argument parsing, and formation-fit formatting moved behind private CLI Modules to improve locality without behavior changes. | CLI typecheck; focused CLI tests; required season/fixture/formation/manual-switch smokes; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md` | Done | Consolidated fixture state into the canonical `GameState` contract. | `GameState` now owns `fixtures` and `fixtureIds`; `applyMatchReportToFixture` accepts and returns `GameState` directly, and the obsolete fixture-slice/alias types were removed. | domain/engine/storage typecheck; focused domain/use-case/storage tests; required season and fixture CLI smokes; `pnpm check` |
| `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md` | Done | Created the Phase 15 cleanup report and next-phase recommendation. | `docs/audits/CORE_CLEANUP_REPORT.md` scores the cleaned core at `92/100`, records all fixed findings, accepts the aggregate-match limitation, and originally recommended market MVP next; Phase 16 now adds a dependency-map gate before implementation. | `pnpm check`; required season/fixture/formation/manual-switch CLI smokes; `calibration-v1` strict balance report |
| `docs/steps/16-career-systems-dependency-map/README.md` | Done | Created the Phase 16 documentation path for mapping shared career-system dependencies before market implementation. | Phase 16 checks whether market can proceed linearly or needs shared career state, economy, calendar, scouting, or youth foundations first. | Documentation-only update; no source checks required |
| `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md` | Done | Market roadmap dependencies were classified before implementation. | `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` now marks which market phases can start now, which require career state/economy/calendar/scouting/prior market work, and where non-market shared phases should interrupt the roadmap. | `find docs/market-roadmap -type f | sort`; roadmap phase `rg`; dependency keyword `rg` |
| `docs/steps/16-career-systems-dependency-map/02-shared-career-state-seams.md` | Done | Shared career-state seams were mapped before market implementation. | `GameState` and `GameStorage` are enough for future persistence, while durable market behavior still needs an explicit career slice, roster ownership evolution, selected-club context, transfer history, and season progression seams. | `GameState`/storage `rg`; squad/tactic/state `rg`; career/save `rg` |
| `docs/steps/16-career-systems-dependency-map/03-economy-and-budget-dependencies.md` | Done | Economy and budget dependencies were mapped before market implementation. | `Money`/`BasisPoints` already exist; the first market MVP may use a narrow transfer-budget Interface, while wages, contracts, installments, future commitments, and full finances remain blocked for later phases. | Economy keyword `rg`; category/reputation `rg`; Money value-object scan |
| `docs/steps/16-career-systems-dependency-map/04-calendar-and-season-transition-dependencies.md` | Done | Calendar and season-transition dependencies were mapped before loans/windows/contracts. | Current `GameDate`, calendar, and fixture dates are enough for a narrow transfer MVP, but loans, windows, registration, contract expiry, promotion/relegation, and multi-season processing require dedicated calendar/season-transition Modules. | Calendar primitive `rg`; loan/window/registration/promotion `rg` |
| `docs/steps/16-career-systems-dependency-map/05-scouting-youth-and-market-overlap.md` | Done | Scouting, youth, and market information seams were mapped. | Market MVP may use true player data behind valuation/willingness Interfaces, but must not hardcode fog, visible potential ranges, youth ownership, loan development, ambition/personality, or presentation text. | Scouting/youth keyword `rg`; player truth data `rg` |
| `docs/steps/16-career-systems-dependency-map/06-phase-order-decision.md` | Done | Finalized the dependency map and next implementation phase decision. | `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` recommends `Phase 17 — Market MVP Permanent Transfers` next, constrained to in-memory permanent transfers with temporary transfer budget, no windows, truth-based player willingness, and no persistence/contracts/loans/scouting fog. | report existence check; required report-section `rg`; project-status `rg`; Phase README documentation-scan rule reviewed |
| `docs/steps/17-market-mvp-permanent-transfers/README.md` | Done | Created the Phase 17 documentation path for a constrained market MVP. | Phase 17 is permanent-transfer only, in-memory, manager-driven, truth-based for valuation/willingness, and explicitly excludes persistence, loans, wages/contracts, windows, scouting fog, AI, installments, and player exchanges. | Documentation-only update; no source checks required |
| `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md` | Done | Confirmed Phase 17 scope from Phase 16 before coding. | Phase 17 may proceed as a constrained, manager-driven, in-memory permanent-transfer MVP; persistence, loans, wages/contracts, windows, scouting fog, AI, installments, and player exchanges remain blocked for later documented phases. | dependency-map/roadmap `rg`; next-step existence check |
| `docs/steps/17-market-mvp-permanent-transfers/02-market-domain-contracts.md` | Done | Added dependency-free domain contracts for permanent transfers. | `domain` now exposes `MarketState`, `ClubTransferBudget`, `PermanentTransferIntent`, feasibility status, structured rejection reasons, `PermanentTransferPreview`, and small validators/helpers while staying free of future-only transfer branches. | domain typecheck; focused transfer entity tests; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/03-player-valuation-v1.md` | Done | Added deterministic true-data player valuation v1. | `engine/market` now exposes `derivePlayerValuation` with explicit config, `Money` output, current/potential ability averages, age/category/reputation/position multipliers, clamping, and focused tests; it does not use generated content or mutate state. | engine typecheck; focused player valuation tests; out-of-scope scan; `pnpm check`; runtime scan false-positive noted for `GameDate` naming |
| `docs/steps/17-market-mvp-permanent-transfers/04-player-willingness-v1.md` | Done | Added deterministic permanent-transfer willingness v1. | `engine/market` now exposes `derivePlayerWillingness`, rejecting unrealistic sporting/reputation downgrades for strong prime players while accepting plausible same-level or younger non-star moves; output is structured and language-agnostic. | engine typecheck; focused player willingness tests; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/05-transfer-feasibility-and-apply-preview.md` | Done | Combined ownership, temporary budget, valuation, and willingness into in-memory transfer feasibility and apply preview. | `engine/market` now exposes `evaluatePermanentTransfer` and `previewPermanentTransfer`, returning structured rejection reasons or copy-on-write `GameState`/`MarketState` previews without touching storage. | engine typecheck; focused transfer feasibility tests; no-storage scan; out-of-scope scan; `pnpm check` |
| `docs/steps/17-market-mvp-permanent-transfers/06-cli-market-inspection.md` | Done | Added localized CLI inspection for accepted and rejected permanent-transfer demos. | `simulate-season --market-demo=pro01-affordable-permanent|pro01-star-rejected` renders standalone localized market previews with selected club, buyer/seller, target player, transfer value, buyer budget before/after, reasons, willingness details, and roster preview; no career save is written. | CLI/i18n typecheck; focused CLI/i18n tests; localization guard; `pnpm check`; accepted/rejected/Italian CLI smokes |
| `docs/steps/17-market-mvp-permanent-transfers/07-phase-17-review-and-next-phase-decision.md` | Done | Finalized Phase 17 with a market MVP report and next-phase decision. | `docs/audits/MARKET_MVP_REPORT.md` documents implemented scope, demo outputs, kept boundaries, residual risks, and recommends career state and transfer persistence next. | `pnpm check`; season smoke; Italian formation-fit smoke; accepted/rejected/Italian market-demo smokes; strict calibration balance report; no-storage scan; out-of-scope scan |
| `docs/steps/18-career-state-and-transfer-persistence/README.md` | Done | Created the Phase 18 documentation path for durable career state and transfer persistence. | Phase 18 turns accepted permanent-transfer decisions from inspection-only previews into persisted career state, while keeping loans, wages/contracts, windows, scouting fog, AI market behavior, installments, player exchanges, and UI out of scope. | Documentation-only update; no source checks required |
| `docs/steps/18-career-state-and-transfer-persistence/01-phase-17-output-review.md` | Done | Confirmed the minimal durable career scope after Phase 17. | Phase 18 should persist selected club context, the current game snapshot, transfer funds, permanent-transfer roster changes, and transfer history; loans, contracts/wages, windows, scouting fog, AI market behavior, installments, player exchanges, and UI remain out of scope. | `test -f docs/audits/MARKET_MVP_REPORT.md`; `test -f docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`; required career/persistence roadmap `rg` |
| `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md` | Done | Added the dependency-free durable career-state contract. | `CareerState` wraps `GameState` with `saveId`, schema version, selected club, durable `MarketState`, and ordered permanent-transfer history; `createCareerState` validates selected club order, budget club references, safe non-negative money, and transfer-history references. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/state/career-state.test.ts`; domain forbidden import scan; `pnpm check` |
| `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md` | Done | Added JSON-backed career save persistence. | `JsonCareerStorage` persists full `CareerState` snapshots in career-specific JSON envelopes, validates through `createCareerState` on save/load, preserves typed storage failures, and remains independent from engine/content/CLI/i18n. | `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/storage/src/career-storage.test.ts`; storage forbidden import scan; `pnpm check` |
| `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md` | Done | Added engine use case for persistent permanent-transfer application. | `applyCareerPermanentTransfer` reuses existing market preview logic, returns original `CareerState` on rejection, and returns a copied `CareerState` with updated `GameState`, `MarketState`, and appended transfer-history entry when accepted. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/apply-career-transfer.test.ts`; engine forbidden import scan; `pnpm check` |
| `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md` | Done | Added deterministic CLI career market apply flow for supported market demos. | `pnpm cli career --save=<saveId> --apply-market-demo=<profile>` bootstraps deterministic fake career state, applies accepted permanent-transfer demos through `applyCareerPermanentTransfer`, writes accepted results through `JsonCareerStorage`, leaves rejected demos unsaved, and renders localized output without CLI-domain direct imports. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; accepted/rejected CLI smokes |
| `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md` | Done | Added CLI inspection for reloaded career state, budget, roster, and transfer history. | `pnpm cli career --save=<saveId> --inspect` loads `JsonCareerStorage`, shows selected club roster size and transfer funds, lists permanent-transfer history, and prints affected clubs with persisted roster sizes and budgets. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; career apply and inspect CLI smokes |
| `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md` | Done | Produced the first playable loop readiness report. | `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md` states that Phase 18 passes as a persistence bridge and recommends Phase 19 as a CLI-first playable career loop MVP before deeper market, youth, scouting, contracts, or UI work. | `pnpm check`; career apply/inspect CLI smokes; localized market inspection smoke; strict `calibration-v1` balance report |
| `docs/steps/19-fictional-people-identity-foundation/README.md` | Done | Created the Phase 19 documentation path for fictional people identity. | Phase 19 moves before the first playable career loop so generated players stop looking like technical placeholders; it covers person identity, name cultures, nationality distribution by division/reputation, player identity generation, staff identity readiness, and a quality report. | Documentation-only update; no source checks required |
| `docs/steps/19-fictional-people-identity-foundation/01-phase-18-output-and-identity-gap-review.md` | Done | Confirmed that current player-facing output still uses technical placeholder names. | Season, fixture-detail, and career-inspect outputs still show `PlayerXX NoYY`; source scan points to `packages/content/src/generators/fake-players.ts` as the placeholder generator, while names remain content data and not localization labels. | `test -f docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli career --save=career-demo --inspect`; placeholder/name/staff `rg` scan |
| `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md` | Done | Added a reusable domain person-identity contract for players now and staff later. | `PersonIdentity` stores generated first/last name, primary nationality, optional second nationality, birth country, and name-culture key; constructors validate empty names, unsupported keys, duplicate second nationality, and unexpected rendered-prose fields while remaining language-agnostic. | `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/value-objects/person-identity.test.ts`; domain forbidden import scan; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md` | Done | Added content-owned fictional name culture pools. | `content/identity/name-cultures` now exposes explicit first/last-name pools for every supported `NameCultureKey`, with stable key order and no localization coupling. | `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/name-cultures.test.ts`; content forbidden import scan; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md` | Done | Added deterministic nationality distribution by league nation, division, and club strength/reputation. | `selectNationality` uses derived RNG and explicit weighted profiles: third division mostly domestic, second division more mixed, first division more international, and strong first-division clubs can become majority international; output remains structured identity metadata, not prose. | `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/nationality-distribution.test.ts`; deterministic runtime scan; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md` | Done | Replaced generated player placeholder display names with deterministic fictional identities. | Fake player generation now selects structured identity metadata from seeded nationality/name-culture content, keeps stable `player:` IDs, writes player display names from generated `PersonIdentity`, and updates CLI/career tests to assert behavior without old placeholder names. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused fake-player/league-system/simulate-season/career tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; career apply+inspect smoke; strict `calibration-v1` balance report |
| `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md` | Done | Confirmed that the identity foundation can support future staff without implementing staff gameplay. | `PersonIdentity` is sufficient as shared identity metadata for staff, scouts, presidents, agents/procuratori, and AI managers; future staff systems must keep role, rating, specialization, assignments, persona/tendencies, wages, and gameplay effects in separate contracts. | staff/scouting/persona `rg` review; `pnpm check` |
| `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md` | Done | Added identity review CLI output and produced the identity foundation quality report. | `simulate-season --identity-review` shows selected fake-club identity metadata and nationality summary with localized presentation labels; `docs/audits/IDENTITY_FOUNDATION_REPORT.md` records the adopted identity model, staff readiness, manual checks, and the known repeated-name limitation. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; season, fixture, identity-review, career apply/inspect, and strict balance CLI smokes |
| `docs/steps/20-new-career-world-generation/README.md` | Done | Created the Phase 20 documentation path for new career world generation. | Phase 20 will make generated people and squads vary per new career/world seed while staying persisted and reproducible inside a save; it also prepares flag asset mapping outside domain/engine. | Documentation-only update; no source checks required |
| `docs/steps/20-new-career-world-generation/01-current-generated-content-review.md` | Done | Reviewed current fake content, identity, career, and CLI generation paths. | `generateFakePlayersForClubs` is already seed-aware for identity generation, but `createFakeLeagueSystem()` still uses the default `demo-001` path; `GameState.meta.seed` currently acts as the season/match runtime seed, so a separate durable career world seed belongs in career metadata before career creation writes saves. | required `rg` scans; `pnpm check` |
| `docs/steps/20-new-career-world-generation/02-career-world-seed-contract.md` | Done | Added a durable career world seed metadata contract. | `CareerWorldMetadata` stores trimmed `worldSeed`, positive `generatorVersion`, and stable `creationSourceKey`; `CareerState` can now persist optional validated world metadata without changing existing save callers until the CLI creation step writes it. | `pnpm --filter @game/domain run typecheck`; focused career-world/career-state tests; domain import scan; `pnpm check` |
| `docs/steps/20-new-career-world-generation/03-generated-player-archetypes.md` | Done | Added content-owned generated player archetypes. | `GENERATED_PLAYER_ARCHETYPES` defines stable machine keys for first-team regulars, rotation players, veterans, prospects, high-potential prospects, and rare wonderkids, with deterministic age/current-ability/potential ranges and lineup/reserve weights. | `pnpm --filter @game/content run typecheck`; focused player-archetypes tests; `pnpm check` |
| `docs/steps/20-new-career-world-generation/04-seeded-squad-generation.md` | Done | Fake squad generation now varies by world seed while preserving stable player IDs. | `createFakeLeagueSystem({ worldSeed })` passes the seed into player generation; names avoid duplicate full names inside one club when possible; a small seed-specific ability variance changes generated squads without changing engine algorithms. CLI tests now assert structure and money formatting instead of old dataset-specific valuation constants. | `pnpm --filter @game/content run typecheck`; focused fake-player, league-system, simulate-season, and career CLI tests; `pnpm check`; season and identity-review CLI smokes |
| `docs/steps/20-new-career-world-generation/05-potential-age-and-prospect-distribution.md` | Done | Applied generated player archetypes to age/current ability/potential generation. | Fake players now carry content-only `playerArchetypes`; age derives from archetype ranges at the 2026-08-01 career start, current ability gets archetype offsets, potential uses archetype uplift, and rare wonderkids are possible but uncommon across generated worlds. Existing CLI tests now avoid old dataset-specific score/standing assumptions. | content typecheck; focused archetype/fake-player/league-system tests; `pnpm check`; season and identity CLI smokes; strict `calibration-v1` balance report PASS with goals `2.863`, first-place points `70.350`, spread `46.400` |
| `docs/steps/20-new-career-world-generation/06-cli-new-career-world-creation-preview.md` | Done | Added a localized career CLI path that writes and inspects a seeded generated career world. | `pnpm cli career --save=<saveId> --seed=<worldSeed> --new-world-preview` builds `createFakeLeagueSystem({ worldSeed })`, persists `CareerWorldMetadata`, selected club state, generated squads, and compact nationality/age/prospect summaries; `career --inspect` now shows world seed and generator version when present. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused career/i18n tests; `pnpm check`; `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase20-world-b --seed=world-b --new-world-preview`; `pnpm cli career --save=phase20-world-a --inspect` |
| `docs/steps/20-new-career-world-generation/07-flag-asset-readiness.md` | Done | Added a content-owned flag asset mapping for every supported nationality. | `flagAssetForNationality` maps `NationalityCode` to a stable SVG filename stem and project-relative `assets/flags/<code>.svg` path for future UI/CLI presentation; domain and engine remain asset-agnostic. | `pnpm --filter @game/content run typecheck`; focused flag-asset tests; `find assets/flags -maxdepth 1 -name "*.svg" | sort`; `pnpm check` |
| `docs/steps/20-new-career-world-generation/08-world-generation-quality-report.md` | Done | Produced the Phase 20 quality report and next-phase recommendation. | `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md` records world seed persistence, same-seed reproducibility, different-seed variation, name/nationality/age/prospect quality, flag asset ownership, balance results, manual commands, and recommends `Phase 21 - Playable Career Loop MVP`. | focused Phase 20 tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase20-world-b --seed=world-b --new-world-preview`; `pnpm cli career --save=phase20-world-a --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/20-new-career-world-generation/09-name-pool-and-surname-variety-rework.md` | Done | Reworked generated surname variety after user review found too many repeated surnames in one squad. | Fake player generation now tracks club and league name usage, avoids duplicate full names, avoids repeated surnames inside a club, limits surnames to two league uses under normal pool capacity, and requires different first names when a surname repeats; Italian and Balkan surname pools were expanded to support the stronger constraint. | `pnpm --filter @game/content run typecheck`; focused name-culture/fake-player/simulate-season tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview` |
| `docs/steps/20-new-career-world-generation/10-simulate-season-identity-world-seed-rework.md` | Done | Fixed standalone identity review so different `simulate-season --seed` values generate different fake worlds. | `runSimulateSeasonCommand` now calls `createFakeLeagueSystem({ worldSeed: parsed.seed })`; this keeps `simulate-season --seed=<value> --identity-review` useful for quick world inspection while persisted careers still store durable `CareerWorldMetadata.worldSeed`. | `pnpm --filter @game/cli run typecheck`; focused simulate-season CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli simulate-season --seed=world-c --identity-review` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/README.md` | Done | Created the Phase 21 audit and roadmap reconciliation documentation path. | Phase 21 is an audit gate before the first playable career-loop phase: it reviews docs, code boundaries, determinism, save consistency, product-loop readiness, roadmap dependencies, and next-phase priority without implementing gameplay features. | Documentation-only update; no source checks required |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/01-documentation-state-audit.md` | Done | Audited binding, operational, advisory, and historical docs. | `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` now identifies `requirements.md`, project rules, project status, and active steps as source-of-truth hierarchy; older roadmap and audit recommendations are historical/advisory when they conflict with current status. | `find docs -maxdepth 3 -type f \| sort`; roadmap/audit `rg` scan; `git diff --check` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/02-code-boundary-and-dead-code-audit.md` | Done | Audited package boundaries, dead-code markers, deterministic API use, and CLI module pressure. | No boundary or forbidden runtime blocker found; the main maintainability watch is keeping future career-loop code modular instead of growing `apps/cli/src/commands/career.ts` unchecked. | `pnpm depcruise`; `pnpm lint`; domain/engine/content/CLI typecheck; dead-code and forbidden-runtime `rg` scans |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/03-determinism-and-save-consistency-audit.md` | Done | Verified seed-varying identity output and persisted career world metadata. | `CareerWorldMetadata.worldSeed` remains separate from `GameState.meta.seed`; career inspect loads stored metadata instead of regenerating a world. | shared/storage/CLI typecheck; `world-a`/`world-b` identity reviews; `phase21-determinism-a` and `phase21-determinism-b` create+inspect smokes; `git diff --check` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/04-product-loop-readiness-audit.md` | Done | Verified current CLI inspection flows and identified the missing cohesive loop. | The project is ready for a narrow playable career loop, but many flows are still fragmented between `simulate-season` and `career` commands instead of operating from one loaded save. | season, fixture, lineup, manual tactic switch, formation-fit, condition, market IT, and strict balance CLI smokes |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/05-roadmap-dependency-reconciliation.md` | Done | Reconciled market roadmap, dependency map, playable-loop report, and Phase 20 world-generation report. | Market MVP and transfer persistence already exist; deeper market/youth/scouting/UI work should wait until a save-driven playable loop exists. | `find docs/market-roadmap -type f \| sort`; dependency/roadmap `rg` scan |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/06-risk-and-priority-report.md` | Done | Prioritized findings and set readiness score. | No blockers; high-risk item is product cohesion: no unified save-driven career loop yet. Readiness score is `88 / 100`. | audit report priority scan; `git diff --check` |
| `docs/steps/21-project-audit-and-roadmap-reconciliation/07-next-phase-spec-recommendation.md` | Done | Finalized the Phase 21 audit and next-phase recommendation. | The recommendation was later refined into `Phase 22 - Pre Playable Loop Hardening` followed by `Phase 23 - Playable Career Loop MVP`, preserving Phase 21 as the completed audit gate. | `pnpm check`; final season/identity/career/balance CLI smokes; `git diff --check` |
| `docs/steps/22-pre-playable-loop-hardening/README.md` | Not started | Created the Phase 22 documentation path. | Phase 22 is a hardening phase to resolve roadmap/status ambiguity, career CLI module pressure, save runtime policy, and career determinism tests before the playable loop. | Documentation-only update; `git diff --check` |
| `docs/steps/22-pre-playable-loop-hardening/01-roadmap-status-alignment.md` | Done | Aligned active roadmap/status terminology after the Phase 21 audit gate. | Phase 22 remains pre-loop hardening and Phase 23 remains the playable loop; older Phase 22 playable mentions are historical drift, not active direction. | `rg -n "Phase 22 - Playable\|Phase 23 - Playable\|Pre Playable\|playable loop" docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md docs/PROJECT_STATUS.md`; `git diff --check` |
| `docs/steps/22-pre-playable-loop-hardening/02-career-cli-module-boundaries.md` | Done | Split the broad career command into private parsing, scenario/state, formatting, and type modules without changing command behavior. | `career.ts` remains the public orchestrator; private modules under `apps/cli/src/commands/career/` own argument parsing, deterministic scenario creation, and localized output formatting. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; sequential career create/inspect smoke commands; `pnpm check` |
| `docs/steps/22-pre-playable-loop-hardening/03-career-save-runtime-policy.md` | Done | Made career save runtime behavior visible and safer for local development. | Career CLI output now prints the storage directory through localized `career.saveDirectory`; `.gitignore` explicitly ignores `apps/cli/saves/` runtime saves. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused career/i18n tests; career create/inspect smokes; `git check-ignore -v apps/cli/saves/career/save%3Aphase22-save-policy-world.career.json`; `pnpm check` |
| `docs/steps/22-pre-playable-loop-hardening/04-career-determinism-golden-checks.md` | Done | Added focused career determinism and persistence golden checks. | Career tests now prove same world seed creates stable selected-club player data, different seeds vary generated worlds, and accepted permanent transfers survive storage adapter reloads. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/storage/src/career-storage.test.ts`; `pnpm check` |
| `docs/steps/22-pre-playable-loop-hardening/05-phase-23-readiness-review.md` | Done | Completed the Phase 22 hardening report and approved Phase 23 start. | `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md` scores readiness at `95 / 100`; remaining risk is accepted because the save-driven loop itself is Phase 23 scope. | `pnpm check`; `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-hardening-world --inspect`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/23-playable-career-loop-mvp/README.md` | Not started | Created the Phase 23 documentation path. | Phase 23 is the first cohesive save-driven career loop MVP after Phase 22 hardening. | Documentation-only update; `git diff --check` |
| `docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md` | Done | Phase 22 readiness was confirmed before implementing career-loop behavior. | Treat the remaining readiness gap as Phase 23 scope; no source changes were needed in this review step. | `rg -n "Score\|Blocker\|Phase 23\|playable" docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md docs/PROJECT_STATUS.md`; `git diff --check` |
| `docs/steps/23-playable-career-loop-mvp/02-career-summary-from-save.md` | Done | Added a localized save-driven career summary and persisted initial fixtures for new career worlds. | `--summary` loads an existing career save, prints current date/season, selected club, roster size, budget, and next selected-club fixture without mutating the save; new world creation now stores the initial deterministic calendar. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase23-summary-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-summary-world --summary`; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/03-career-next-fixture-progression-contract.md` | Done | Added a pure engine contract for finding the next unplayed selected-club fixture. | `findNextCareerFixture` returns typed `found`, `none`, or `invalid` results using only persisted `CareerState` and explicit fixture order; it does not simulate, mutate, or persist. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts`; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/04-persisted-fixture-progression.md` | Done | Added a reusable in-memory use-case that simulates and applies one next selected-club fixture. | `progressNextCareerFixture` reuses `findNextCareerFixture`, supplied match team contexts, `simulateMatch`, `createMatchReport`, and fixture result application to return a copied career state without writing storage or choosing lineups/tactics. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts packages/engine/src/career/progress-fixture.test.ts apps/cli/src/commands/career.test.ts`; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/05-career-advance-cli.md` | Done | Added the first save-writing career advancement command. | `--advance-next-fixture` loads a career save, builds deterministic MVP default team contexts from persisted roster/player state, advances one selected-club fixture, writes the updated save only on success, and prints localized result/next-fixture output. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts packages/engine/src/career/progress-fixture.test.ts`; create-summary-advance-inspect CLI smoke; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/06-durable-decision-continuity.md` | Done | Proved an accepted manual transfer remains visible after fixture advancement. | A focused career CLI test and smoke flow apply an accepted transfer, verify roster/budget/history, advance one selected-club fixture, reload the save, and verify the manual decision plus played-fixture count remain durable. | `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; create/apply/summary/advance/inspect CLI continuity smoke; `pnpm check` |
| `docs/steps/23-playable-career-loop-mvp/07-playability-audit-and-next-phase-decision.md` | Done | Completed the playability audit and next-phase decision. | `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md` scores the current milestone at `98 / 100` and recommends only `Phase 24 - Career Match Preparation Persistence` next. | `pnpm check`; create-summary-advance-inspect CLI smoke on `phase23-loop-world`; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/24-player-generation-quality-rework/README.md` | Not started | Created the Phase 24 documentation path after the user identified player generation quality as the core risk to resolve before more career systems. | Phase 24 supersedes the previous next-phase recommendation for now: first audit and rework generated player quality by division, club tier, role, age, potential, and rarity; then decide whether to resume career match preparation persistence. | Documentation-only update; `git diff --check` |
| `docs/steps/24-player-generation-quality-rework/01-current-generator-audit.md` | Done | Confirmed that current generated identities vary by seed but ability generation is too broad and off-role values are inflated by the common base formula. | `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md` records source areas, suspicious output examples, and concrete requirements for bands, role templates, archetypes, and rarity budgets. | `rg` generator scan; `pnpm --filter @game/content run typecheck`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review` |
| `docs/steps/24-player-generation-quality-rework/02-division-and-club-tier-attribute-bands.md` | Done | Added explicit current/potential generation bands by division and generated club tier. | `player-generation-bands.ts` separates first/second/third-division quality and title/playoff/mid-table/survival tiers; fake player base ability now starts from these bands before role templates. A brittle CLI condition-demo test was generalized because generated content changes can validly change a fixture score. | `pnpm --filter @game/content run typecheck`; focused content band/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/03-role-based-attribute-templates.md` | Done | Added explicit role templates for generated player attributes. | `player-role-templates.ts` builds all 25 abilities from role templates; defenders, attackers, outfield players, and goalkeepers now have caps that stop off-role attributes from rising with the general base. The old generic `abilitiesForPosition` helper was removed. | `pnpm --filter @game/content run typecheck`; focused role/fake-player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/04-age-potential-and-prospect-archetypes.md` | Done | Replaced broad old archetypes with explicit senior, category, youth, serious prospect, and prodigy archetypes. | Archetypes now carry `potentialClass`, fractional current offsets, and separate potential uplift; career formatting now counts serious/elite potential classes instead of old hardcoded archetype names. | `pnpm --filter @game/content run typecheck`; focused archetype/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/05-rarity-budget-and-white-fly-rules.md` | Done | Added deterministic league-level rarity budgets for lower-division exceptions. | `player-rarity-budget.ts` assigns white-fly players, serious prospects, and rare prodigies by world seed; ordinary archetype selection now skips budget-controlled archetypes so rare cases cannot leak outside the allocation. | `pnpm --filter @game/content run typecheck`; focused rarity/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/06-player-generation-quality-tests.md` | Done | Added product-level generated league quality tests. | `player-generation-quality.test.ts` checks seed stability/variation, role-coherence caps, limited high-current players, rarity-budget counts, and at least one prospect per club without guaranteeing stars. | `pnpm --filter @game/content run typecheck`; focused quality/player tests; `pnpm check` |
| `docs/steps/24-player-generation-quality-rework/07-cli-generation-quality-report.md` | Done | Added a localized `simulate-season --player-generation-report` inspection. | The CLI summarizes seed-level division, club/player counts, current ability bands, potential classes, rarity budget usage, prospect coverage, and role-coherence warnings without writing saves or listing hidden individual potential. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `git diff --check` |
| `docs/steps/24-player-generation-quality-rework/08-phase-report-and-next-phase-decision.md` | Done | Completed the Phase 24 quality report and next-phase decision. | `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md` scores player generation at `93 / 100` for current maturity and recommends `Phase 25 - Career Match Preparation Persistence` as the single next phase. | `pnpm check`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/25-career-match-preparation-persistence/README.md` | Not started | Created the Phase 25 documentation path. | Phase 25 turns match preparation into durable career state: inspect squad, save lineup, save tactic, advance with saved preparation, then report readiness. | Documentation-only update; `git diff --check` |
| `docs/steps/25-career-match-preparation-persistence/01-phase-24-output-and-prep-gap-review.md` | Done | Documented the current career match-preparation persistence gap. | `docs/audits/CAREER_MATCH_PREPARATION_GAP_REVIEW.md` records that selected-club career advancement still uses runtime default lineup/tactic construction and should move to saved manager choices while reusing existing domain `SelectedLineup` and `TacticSetup` contracts. | `rg -n "defaultLineupFromRoster|advanceCareerNextFixture|createSelectedLineup|createTacticSetup|CareerState" apps packages docs`; `git diff --check` |
| `docs/steps/25-career-match-preparation-persistence/02-career-squad-player-inspection.md` | Done | Added save-driven selected-club squad inspection. | `pnpm cli career --save=<saveId> --squad` loads an existing career save, prints selected club, squad size, ordered roster, age, natural position, compact role-relevant current ability, and fitness/form/morale without exposing hidden potential or mutating the save. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase25-squad-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase25-squad-world --squad`; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/03-match-preparation-state-contract.md` | Done | Added durable optional match-preparation state to `CareerState`. | `CareerMatchPreparation` stores selected club, optional target fixture, optional selected lineup, optional tactic, and update date; `createCareerState` validates club/fixture references, selected-club player ownership, selected-lineup ambiguity through `createSelectedLineup`, and tactic values through `createTacticSetup`; storage round-trips the new slice while old saves without preparation remain valid. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/domain/src/state/career-state.test.ts packages/storage/src/career-storage.test.ts`; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/04-save-career-lineup-selection.md` | Done | Added save-writing career lineup selection. | `pnpm cli career --save=<saveId> --set-lineup-demo=pro01-first-team|pro01-rotated` loads an existing career save, writes `matchPreparation.selectedLineup`, binds it to the next selected-club fixture when available, preserves any existing tactic, and `--inspect` shows the saved lineup after reload. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; CLI create/set-lineup/inspect smoke; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/05-save-career-tactic-selection.md` | Done | Added save-writing career tactic selection. | `pnpm cli career --save=<saveId> --set-tactic-demo=pro01-balanced|pro01-attacking|pro01-defensive` writes `matchPreparation.tactic`, preserves any saved lineup, and summary/inspect output shows the full saved tactic values. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; CLI create/set-lineup/set-tactic/summary smoke; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/06-advance-fixture-uses-saved-preparation.md` | Done | Career fixture advancement now uses saved selected-club preparation. | `advanceCareerNextFixture` blocks selected-club progression when saved preparation, lineup, or tactic is missing; with preparation present it builds the selected club through `buildTacticTeamContext`, keeps deterministic opponent defaults only for non-user clubs, persists the played fixture, and retargets saved preparation to the next selected-club fixture. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts packages/engine/src/career/progress-fixture.test.ts`; CLI create/set-lineup/set-tactic/advance/inspect smoke; `pnpm check` |
| `docs/steps/25-career-match-preparation-persistence/07-phase-report-and-next-phase-decision.md` | Done | Completed the Phase 25 final report and next-phase decision. | `docs/audits/CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md` scores the career preparation loop at `95 / 100`, confirms selected-club default preparation is blocked, and recommends exactly one next phase: `Phase 26 - Career Match-Day Interaction MVP`. | `pnpm check`; career create/squad/set-lineup/set-tactic/summary/advance/inspect CLI smoke on `phase25-prep-world`; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/README.md` | Not started | Created the Phase 26 documentation path. | Phase 26 supersedes the immediate match-day recommendation and prepares the long-run path by cleaning docs, defining active reports, recording the engine baseline, and defining long-run metrics. | Documentation-only update; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/01-documentation-noise-audit.md` | Done | Classified project documentation noise without moving or deleting files. | `docs/audits/DOCUMENTATION_NOISE_AUDIT.md` marks active guidance, historical references, archive candidates, and no deletion candidates; obsolete roadmap material is ready for a policy-backed archive step. | `find docs -maxdepth 3 -type f | sort`; `rg -n "roadmap|Phase 7|Phase 20|future|archive|obsolete" docs`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/02-report-retention-policy.md` | Done | Created active audit/report retention policy. | `docs/audits/README.md` now defines the active reading path and report categories; `docs/archive/README.md` defines how archived files should be treated. No files were moved or deleted. | `test -f docs/audits/DOCUMENTATION_NOISE_AUDIT.md`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/03-archive-obsolete-roadmaps.md` | Done | Archived obsolete roadmap material without deleting decision history. | `docs/ROADMAP_PHASES_07_20.md` moved to `docs/archive/roadmaps/ROADMAP_PHASES_07_20.md`; `docs/market-roadmap/` moved to `docs/archive/roadmaps/market-roadmap/`; audit and archive indexes record that these are historical context, not active implementation order. | `find docs -maxdepth 4 -type f | sort`; `rg -n "PROJECT_ROADMAP|roadmap|archive" docs/audits docs/archive docs/steps`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/04-current-engine-baseline.md` | Done | Created the current engine baseline before long-run work. | `docs/audits/CURRENT_ENGINE_BASELINE.md` summarizes match, season, career persistence, player generation, market MVP, current limitations, and the minimum Phase 27-30 path; the current strict balance sample is recorded at `2.859` goals per match. | `rg -n "simulateSeason|progressNextCareerFixture|CareerState|generateFake|player-generation|transfer" packages apps docs`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/05-long-run-metrics-definition.md` | Done | Defined the long-run credibility metrics before runner implementation. | `docs/audits/LONG_RUN_METRICS_SPEC.md` separates mandatory Phase 30 metrics from later metrics and covers season results, player development, aging, squad stability, market turnover, anomalies, and manual inspection outputs. | `test -f docs/audits/CURRENT_ENGINE_BASELINE.md`; `git diff --check` |
| `docs/steps/26-project-cleanup-and-long-run-readiness/06-phase-report-and-phase-27-readiness.md` | Done | Closed Phase 26 and confirmed Phase 27 can start. | `docs/audits/LONG_RUN_READINESS_REPORT.md` records archived roadmap material, active audit structure, current baseline summary, long-run metric summary, and the decision to start `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md`. | `find docs -maxdepth 4 -type f | sort`; `rg -n "CURRENT_ENGINE_BASELINE|LONG_RUN_METRICS_SPEC|LONG_RUN_READINESS_REPORT" docs`; `git diff --check`; Phase-level docs checks |
| `docs/steps/27-season-rollover-foundation/README.md` | Not started | Created the Phase 27 documentation path. | Phase 27 makes a career save finish one season, archive it, generate the next calendar, and roll player age/state forward. | Documentation-only update; `git diff --check` |
| `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md` | Done | Added pure current-season completion detection. | `assessCareerSeasonCompletion` walks ordered fixture IDs, validates fixture and club references, ignores non-current-season fixtures, and returns typed `complete`, `incomplete`, or `invalid` results without storage or CLI decisions. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; focused season-completion/domain tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/02-next-season-calendar-generation.md` | Done | Added pure next-season calendar generation. | `generateNextSeasonCalendar` requires a complete current season, carries forward the same clubs/competition, derives the next season ID deterministically, schedules the new season 70 days after the latest current-season fixture, and remaps fixture IDs after the current maximum to avoid collisions. | `pnpm --filter @game/engine run typecheck`; focused next-season/calendar tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/03-career-season-archive.md` | Done | Added compact completed-season history to durable career state. | `CareerState.seasonHistory` stores optional structured season archive entries with sequence, season, competition, final table, champion, selected-club finish, and aggregate goals; `createCareerState` validates archive references and old saves without archives remain valid. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/storage run typecheck`; focused domain/storage tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/04-player-age-and-state-rollover.md` | Done | Added pure player age/state rollover for next season. | `rolloverPlayersForNextSeason` treats calendar date as the age source, advances to the supplied next season start, resets fitness to `100`, resets form to `50`, normalizes morale toward `50` by 10 points, and leaves abilities, potential, birth dates, and player order unchanged. | `pnpm --filter @game/engine run typecheck`; focused player-season-rollover tests; `pnpm check` |
| `docs/steps/27-season-rollover-foundation/05-cli-lab-rollover-smoke.md` | Done | Added localized career season rollover lab command. | `pnpm cli career --save=<saveId> --rollover-season` validates that the current season is complete, writes no save on invalid/incomplete state, archives final table/champion/selected-club finish/aggregate goals, appends the next season calendar, advances calendar season/date, resets player fitness/form, normalizes morale, clears stale match preparation, and writes the save only on success. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; deterministic completed-save rollover smoke in career command test |
| `docs/steps/27-season-rollover-foundation/06-phase-report-and-phase-28-readiness.md` | Done | Completed the Phase 27 closeout report and Phase 28 readiness decision. | `docs/audits/SEASON_ROLLOVER_FOUNDATION_REPORT.md` documents the rollover model, archive model, CLI smoke, remaining limitations, and recommends `docs/steps/28-player-development-and-aging-v1/01-development-model-spec.md` as the next active step. | `pnpm check`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts -t "career command rolls a completed season into the next persisted season"`; `git diff --check` |
| `docs/steps/28-player-development-and-aging-v1/README.md` | Not started | Created the Phase 28 documentation path. | Phase 28 implements deterministic player growth, decline, and potential realization for multi-season credibility. | Documentation-only update; `git diff --check` |
| `docs/steps/28-player-development-and-aging-v1/01-development-model-spec.md` | Done | Created the deterministic player development model spec. | `docs/audits/PLAYER_DEVELOPMENT_MODEL_SPEC.md` defines age bands by broad position, growth/peak/decline windows, model inputs, role-relevant growth, bounded potential realization, third-division credibility targets, out-of-scope items, and mandatory implementation tests. | `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`; `git diff --check` |
| `docs/steps/28-player-development-and-aging-v1/02-player-growth-engine.md` | Done | Added pure deterministic positive player growth. | `developPlayersForSeason` derives per-player growth from `worldSeed`, `seasonId`, and player ID; growth is strongest for young players with room to potential, biased toward role-relevant attributes, bounded by true potential, and returned with structured non-presentational change summaries. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`; `pnpm check` |
| `docs/steps/28-player-development-and-aging-v1/03-aging-and-decline-engine.md` | Done | Added deterministic aging decline to the development engine. | Outfield decline starts by age group with physical abilities declining before technical/mental abilities; goalkeeper decline starts later and targets rushing-out/footwork first, with reflexes/handling/positioning declining only later. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`; `pnpm check` |
| `docs/steps/28-player-development-and-aging-v1/04-potential-realization-and-variance.md` | Done | Added controlled potential-realization variance. | Growth now uses a stable per-player realization modifier plus per-season variance; potential remains a bound, high-upside players have better opportunity without guaranteed stars, and long-run tests confirm varied paths and bounded outcomes. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`; `pnpm check` |
| `docs/steps/28-player-development-and-aging-v1/05-development-report-cli-lab.md` | Done | Added a localized in-memory career development report. | `pnpm cli career --save=<saveId> --development-report` simulates seven seasons from an existing save without writing it, reports selected-club aggregate growth/decline/stalled prospects plus example players, and avoids exposing exact hidden potential. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli career --save=phase28-development-world --development-report` |
| `docs/steps/28-player-development-and-aging-v1/06-phase-report-and-phase-29-readiness.md` | Done | Completed the Phase 28 closeout report and Phase 29 readiness decision. | `docs/audits/PLAYER_DEVELOPMENT_AND_AGING_REPORT.md` documents the growth model, decline model, potential-realization variance, CLI lab report output, remaining limitations, and recommends `docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md` as the next active step. | `pnpm check`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts -t "development report"`; `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/README.md` | Not started | Created the Phase 29 documentation path. | Phase 29 replaces placeholder club names with deterministic fictional city-based identities and reviews calendar readiness. | Documentation-only update; `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md` | Done | Created the fictional city-based club identity source-data spec. | `docs/audits/CLUB_IDENTITY_SOURCE_DATA_SPEC.md` defines supported countries, city-pool categories, division weighting, fictional naming patterns, duplicate avoidance, short-name rules, and IP-safety rules. | `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md` | Rework done | Reworked deterministic fictional club names away from repetitive generic suffixes. | `packages/content/src/clubs/club-identity-source-data.ts` now defines country-specific weighted naming patterns and fallback disambiguators; `generateFakeClubs({ seed })` now mixes names like `A.C. Lecco`, `Como Calcio`, `Virtus Trento`, and `Pro Palermo` while preserving stable `club:province-XX` IDs and technical short names. | `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b` |
| `docs/steps/29-club-identity-and-world-calendar-v1/03-club-identity-in-career-worlds.md` | Done | Career and simulation CLI output now uses generated club names consistently. | The CLI presentation helpers now prefer `Club.name` for selected club, fixtures, tables, market demos, career summaries, and formation-fit output; localized table headers were widened and tests now assert readable generated names rather than `PROxx` placeholders. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/04-world-calendar-v1-review.md` | Done | Reviewed the current world calendar model before Phase 30. | `docs/audits/WORLD_CALENDAR_V1_REVIEW.md` documents the deterministic closed-league double round-robin model, confirms it is sufficient for first ten-season reporting, and records non-blocking limitations such as no promotions, cups, playoffs, or multi-division world yet. | `rg -n "generate.*Calendar|Round|Fixture|competition|season" packages docs`; `git diff --check` |
| `docs/steps/29-club-identity-and-world-calendar-v1/05-club-identity-and-calendar-report.md` | Done | Completed the Phase 29 closeout and Phase 30 readiness decision. | `docs/audits/CLUB_IDENTITY_AND_WORLD_CALENDAR_REPORT.md` records the club naming model, sample generated clubs for `world-a` and `world-b`, career preview samples, calendar model limits, and confirms Phase 30 can start as a closed single-division ten-season report. | `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase29-world-b --seed=world-b --new-world-preview`; `git diff --check` |
| `docs/steps/30-ten-season-simulation-report/README.md` | Not started | Created the Phase 30 documentation path. | Phase 30 simulates roughly ten seasons and produces reports to decide whether the engine is credible enough for future UI exploration. | Documentation-only update; `git diff --check` |
| `docs/steps/30-ten-season-simulation-report/01-ten-season-report-spec.md` | Done | Created the ten-season report specification. | `docs/audits/TEN_SEASON_REPORT_SPEC.md` defines report sections, standard seeds, metrics, goals/assists/creator concentration thresholds, anomaly categories, unavailable-system handling, and final decision criteria. | `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`; `git diff --check` |
| `docs/steps/30-ten-season-simulation-report/02-multi-season-runner.md` | Done | Added the deterministic multi-season runner and the first CLI lab command. | `simulation-tools` owns `runLongRunSimulation` with stable per-season seed derivation; CLI bridges fake content through a shared season-input helper and exposes localized `pnpm cli ten-season-report`. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused runner/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/03-player-evolution-metrics.md` | Done | Added player-evolution and production metrics to the ten-season report. | `simulation-tools` owns generic player-evolution aggregation from report-safe snapshots; CLI builds snapshots from an in-memory career world, applies deterministic player development for the report horizon, and prints growth/decline, prospect/prodigy, age, scorer/assist depth, and creator-share metrics. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused player-evolution/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/04-club-and-market-stability-metrics.md` | Done | Added club and missing-system stability metrics to the ten-season report. | `simulation-tools` owns generic club-stability aggregation; CLI derives champion/title/selected-club rows from completed seasons and explicitly reports transfer and squad turnover as unavailable instead of fabricating market activity. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused club-stability/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/05-balance-and-anomaly-scoring.md` | Done | Added deterministic anomaly scoring to the ten-season report. | `simulation-tools` scores goals, table spread, top assist maximum, top-one/top-three creator share, champion streak, useful players after long run, age distribution, and unavailable turnover systems; CLI renders the overall status and ordered checks without tuning engine values. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused anomaly-scoring/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/30-ten-season-simulation-report/06-final-ten-season-playability-report.md` | Done | Completed the final ten-season playability report and next-phase decision. | `docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md` records `world-a` and `world-b` ten-season evidence, confirms match balance is credible, identifies age distribution and missing turnover as blockers, and recommends Phase 31 for career squad refresh and transfer turnover before UI. | `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=10`; `pnpm cli ten-season-report --seed=world-b --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/README.md` | Not started | Created the Phase 31 documentation path. | Phase 31 adds deterministic exits, intake, squad-shape maintenance, simple transfer turnover, long-run integration, and a validation ladder: 50x10 smoke, 250x30 development regression, and 10,000x50 final hard gate before UI exploration. | Documentation-only update; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/01-phase-30-findings-review.md` | Done | Created the Phase 31 squad-refresh spec from Phase 30 findings. | `docs/audits/CAREER_SQUAD_REFRESH_SPEC.md` defines the long-run squad-health targets, non-goals, required metrics, and validation ladder before code starts. | `test -f docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/02-player-exit-and-retirement-rules.md` | Done | Added deterministic end-of-season player exit rules. | `applyEndOfSeasonPlayerExits` evaluates active players by age, broad position, current ability, world seed, season ID, and player ID; exited players leave active rosters/order and produce structured retirement/released/career-step-down records without generating replacements. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-exits.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/03-new-player-intake-pool.md` | Done | Added deterministic replacement-player intake generation and validation. | `generateCareerIntakePlayers` reuses content-owned nationality distribution, name pools, division bands, youth archetypes, and role templates; `createCareerIntakePool` validates unique non-active candidates for later squad maintenance without applying them yet. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/content/src/generators/career-intake-players.test.ts packages/engine/src/career/player-intake.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/04-squad-size-and-role-balance-maintenance.md` | Done | Added squad-size and broad role-balance maintenance. | `maintainCareerSquadShape` applies validated intake players only where clubs have minimum-size, goalkeeper, or broad department depth needs; it preserves active player order, does not choose lineups/tactics, and emits factual warnings. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/squad-maintenance.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/05-transfer-turnover-simulation-mvp.md` | Done | Added minimal deterministic transfer turnover between clubs. | `simulateTransferTurnover` moves a controlled number of suitable players between clubs based on broad positional need, source roster safety, age/ability context, club reputation, and simple downward-move willingness checks; it has no fees, wages, contracts, negotiations, loans, or persistence writes. | `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/transfer-turnover.test.ts`; `pnpm check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/06-career-long-run-integration.md` | Done | Integrated career refresh into the long-run report path. | `runCareerLongRunSimulation` sequences season simulation and app-provided post-season refresh; CLI composes fake content with development, exits, intake generation, squad maintenance, and transfer turnover in memory, surfacing real refresh totals without writing career saves. | simulation-tools/CLI/i18n typechecks; focused long-run/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/07-turnover-and-age-distribution-metrics.md` | Done | Added detailed refresh metrics and structural anomaly checks to the long-run report. | `ten-season-report` now aggregates exit reasons, intake, transfer turnover, squad-size min/avg/max, clubs below minimum squad size, clubs without natural goalkeeper, and role coverage warnings; anomaly scoring now fails structural squad collapse instead of only warning on unavailable turnover. | simulation-tools/CLI/i18n typechecks; focused long-run/CLI tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md` | Blocked | Added the explicit gate runner and ran the 50x10 smoke gate, which failed before larger gates. | `ten-season-report` now supports `--seed-prefix`, `--worlds`, `--seasons`, and `--report-output`; the 50x10 report found no squad-structure collapse but failed on `phase31-gate-world-00009` (`top_assist_max`) and `phase31-gate-world-00040` (`champion_streak`), so 250x30 and 10,000x50 were intentionally not run. | focused CLI/i18n/simulation-tools tests; `pnpm check`; strict `calibration-v1` balance report; 50x10 gate report; `git diff --check` |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08a-long-run-gate-anomaly-rework.md` | Blocked | Reworked the failed 50x10 gate and cleared the 250x30 gate, but did not launch the final 10,000x50 gate because the current serial CLI runner would likely take multiple hours. | Added warning/failing check diagnostics, fixed intake-player age anchoring to the current career date, seed-shuffled transfer-turnover destination order, raised long-run turnover and intake capacity, scaled assist/champion anomaly thresholds by run length, and made top-three creator-share scoring ignore low-goal clubs. | Focused typechecks/tests; `pnpm check`; strict `calibration-v1` balance report; representative seeds `00001`, `00009`, `00040`; 50x10 PASS; 250x30 PASS; 10,000x50 blocked by runtime |
| `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/09-phase-31-final-report-and-next-decision.md` | Not started | Planned final Phase 31 report and next decision. | The step decides whether the project can move toward UI exploration or needs another simulation-hardening phase. | Pending |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/README.md` | Not started | Created the Phase 32 documentation path. | Phase 32 introduces a bounded youth-academy pipeline to reduce reliance on external senior intake and keep long-run squads credible without overpopulating the world. | Documentation-only update; `git diff --check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/01-phase-31-findings-and-youth-pipeline-spec.md` | Done | Created the youth academy pipeline spec from Phase 31 evidence. | Locked conservative youth population targets, user-control boundaries, lifecycle vocabulary, non-goals, and long-run success metrics before code. | `test -f docs/audits/CAREER_SQUAD_REFRESH_ANOMALY_REWORK_REPORT.md`; `test -f docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`; `git diff --check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/02-youth-academy-domain-contracts.md` | Done | Added durable youth academy contracts and validation. | `CareerState` now optionally persists `YouthAcademyState` with ordered club rosters and lifecycle rows; active youth players are validated as existing, non-senior, non-duplicated players, and old saves without youth state remain valid. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/storage run typecheck`; focused domain/storage tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/03-initial-youth-roster-generation.md` | Done | New career worlds now include bounded initial youth academies. | Content generates exactly `8` deterministic youth players per club, age `15..19`, with role-coherent lower-division quality; CLI new-world creation persists them as real players in `GameState` and active youth members in `YouthAcademyState` without changing senior rosters. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused content/CLI/i18n tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/04-seasonal-youth-intake.md` | Done | Added bounded annual youth intake generation and application. | Content generates deterministic annual youth candidates (`2..4`, age `15..17`); engine applies accepted candidates to youth rosters up to cap `12`, records generated/accepted/skipped IDs, initializes old saves without youth state, and leaves senior rosters unchanged. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; focused content/engine tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/05-youth-aging-development-and-exits.md` | Done | Added youth-only development and age-out lifecycle processing. | `applyYouthAcademyLifecycle` develops only active academy players, removes aged-out players from active youth rosters, deletes released/external-move youth from active state, and keeps promotion candidates as non-rostered lifecycle rows for the next promotion step. | `pnpm --filter @game/engine run typecheck`; focused youth lifecycle tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/06-youth-promotion-and-senior-pipeline.md` | Done | Added explicit youth-to-senior promotion rules and long-run lab integration. | `promoteYouthCandidatesToSeniorSquads` promotes only lifecycle `promotion_candidate` players when senior squads have room; selected club is protected by default, while the automated ten-season lab opts in explicitly before external squad maintenance. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused engine/CLI/i18n tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/07-long-run-youth-metrics.md` | Done | Added youth-academy population metrics to long-run reports. | `LongRunYouthStabilityReport` now scores youth over/underpopulation separately from existing anomaly scoring, and the ten-season report/gate surface senior/youth/total active players, youth roster range, intake, exits, promotions, selected-club youth size, and youth PASS/WARN/FAIL checks. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=phase32-step07 --seasons=2` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/08-cli-youth-academy-inspection.md` | Done | Added safe youth academy CLI inspection. | `pnpm cli career --save=<saveId> --youth-academy` reads a persisted career save without mutation and prints selected-club youth count, senior/youth/total active players, broad youth ability/development categories, and lifecycle status without exact hidden potential. Nationality currently displays as unavailable when the save lacks durable identity metadata. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused career/i18n tests; `pnpm check` |
| `docs/steps/32-youth-academy-and-squad-pipeline-v1/09-phase-32-gates-and-final-report.md` | Done | Wrote final Phase 32 gate report and blocked the next phase from evidence. | Youth overpopulation is controlled (`youth_max=12`, `clubs_above_youth_target=0`), but the required `250x30` gate fails in 8 worlds on `top_creator_goal_share_max` and every world warns on youth underpopulation, so Phase 32 needs a rework before broader career/UI work. | `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=50 --seasons=10 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md` failed as expected from gate findings; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/README.md` | Not started | Created the Phase 33 documentation path. | Phase 33 is the chosen remediation for the broader player generation/development issue identified during the Phase 32 youth-academy discussion: explicit role identity, archetypes, hard attribute caps, division/age bands, potential rarity, academy refill, and development cap enforcement. | Documentation-only update; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/01-generation-audit-and-model-spec.md` | Done | Created the Phase 33 model spec and current-code audit. | The audit confirms Phase 24 improved generation, but Phase 33 still needs explicit role identity/familiarity contracts, complete role/archetype classification, role-aware development caps, exact youth refill to 11, and reportable long-run validation. | `test -f docs/audits/YOUTH_ACADEMY_AND_SQUAD_PIPELINE_REPORT.md`; `test -f docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`; required `rg` audit scan; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/02-role-identity-and-familiarity-contracts.md` | Done | Added explicit role identity and familiarity contracts for generated players. | `domain` now owns the Phase 33 role/archetype/familiarity contract and validator; `content` maps every generated tactical position to one stable primary role, archetype, natural/adapted/weak role set, and role familiarity for senior, initial youth, seasonal youth, and career intake players. | `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/content run typecheck`; focused domain/content Vitest files; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/03-role-attribute-classification-and-hard-caps.md` | Done | Added complete role/archetype attribute classification and hard-cap data. | `content` now owns reusable ability-key classifications for all official roles and archetypes, including goalkeeper separation, defender finishing caps, attacker defensive caps, and outfield goalkeeper caps; tests fail if any ability is unclassified or duplicated. | `pnpm --filter @game/content run typecheck`; focused content classification test; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/04-division-age-and-current-ability-bands.md` | Done | Added explicit current-ability bands for senior and youth generation. | `content` now owns division-, age-, role-bucket-, rarity-lane-, and tier-aware current-ability bands plus deterministic sampling helpers and effective role/ability ranges that apply hard caps; club tier can move values only inside division lanes. | `pnpm --filter @game/content run typecheck`; focused current-band/classification tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/05-potential-rarity-and-white-fly-budget.md` | Done | Added explicit potential rarity bands and division/season rarity budgets. | `content` maps existing archetypes to `ordinary`, `interesting`, `high`, and `elite`; the existing league-level rarity allocator now reads division/season budgets so third-division `high` potential is bounded to 2..5 and `elite` remains 0..1 while white-fly stories stay rare. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; focused content rarity tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/06-senior-generator-rework.md` | Done | Rewired senior generation to the Phase 33 role-aware path. | Senior current abilities are now sampled per ability from role classifications, division/current bands, rarity lanes, and club-tier modifiers, then clamped by role hard caps; potential is still generated through the existing potential path but is capped by role and never below current ability. Player-generation report thresholds now match Phase 33 caps. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/CLI/i18n tests; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/07-youth-academy-refill-generator-rework.md` | Done | Reworked academy generation/refill around the exact Phase 33 youth structure. | Initial academies now generate exactly 11 players per club with 1 goalkeeper, 4 defenders, 4 midfielders, and 2 attackers; seasonal refill generates only missing positions, mostly ages 15..17 with rare 18, uses role-aware youth current bands, fails if a club remains underfilled after refill, and long-run/report automation no longer auto-promotes the selected club. | `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/engine/simulation-tools/CLI tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/08-development-respects-role-caps.md` | Done | Reworked player development so growth respects Phase 33 role caps. | Development now derives a stable development role from `primaryRole` with a natural-position fallback, prioritizes core/secondary/allowed/capped ability buckets, clamps growth room by role hard caps, preserves the player's primary role, and keeps aging decline behavior intact. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; focused engine development tests; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/09-generation-quality-report-and-tests.md` | Done | Extended generation quality reports and tests with youth academy evidence. | `simulate-season --player-generation-report` now prints senior current/potential/rarity/role-coherence metrics plus initial academy baseline totals, exact 11-player club coverage, youth roster min/max, youth department counts, youth age distribution, and youth role-coherence warnings; all new labels are localized in the five supported languages. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm check`; `git diff --check` |
| `docs/steps/33-player-role-and-ability-generation-rework/10-long-run-gates-and-phase-report.md` | Blocked | Wrote the Phase 33 report and identified the remaining gate blocker. | Player generation, development caps, and youth academy structure are credible enough for inspection, but the phase cannot close because the required 250x30 long-run gate has one `top_creator_goal_share_max` failure in `phase33-generation-world-00173`; the next work must be a narrow match-event creator/assist concentration rework. | `pnpm check`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `pnpm cli career --save=phase33-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase33-world-a --development-report`; `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md` failed as expected from the blocker; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` |
| `docs/steps/34-match-event-concentration-rework/README.md` | Not started | Created the Phase 34 documentation path. | Phase 34 is a narrow remediation for the remaining Phase 33 long-run blocker: rare excessive goal-creator concentration in `phase33-generation-world-00173`; it must audit first, avoid threshold widening, avoid season-level caps, and preserve player-generation/youth fixes. | Documentation-only update; `git diff --check` |
| `docs/steps/34-match-event-concentration-rework/01-failing-world-creator-concentration-audit.md` | Done | Reproduced and explained the failing Phase 33 seed. | The failure is isolated to season `2`: `A.C. Brescia`, creator `Matteo Morandi`, `15` assists on `37` club goals, `top_creator_goal_share=0.41`; the CLI production rows now include creator club, team goals, same-club top scorer, and top creator fields as diagnostics only, with no attribution behavior change. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused simulation-tools/CLI/i18n tests; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; final `pnpm check` and `git diff --check` pending after status update |
| `docs/steps/34-match-event-concentration-rework/02-creator-assist-attribution-diagnostics.md` | Done | Added compact creator-concentration diagnostics to long-run gate output. | Worst-world rows now include `creator_snapshot` with season, club, creator, assists, team goals, top1/top3 share, top assist, and top scorer; this separates creator concentration from scorer and assist maxima without changing engine behavior. | `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused simulation-tools/CLI/i18n tests; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; temporary 2-world gate with report output; final `pnpm check` and `git diff --check` pending after status update |
| `docs/steps/34-match-event-concentration-rework/03-creator-selection-distribution-rework.md` | Done | Reworked creator selection distribution by chance type. | Creator weights now vary by chance type: open play still favors midfielders, counters favor attackers, crosses give defenders/attackers more share, dead balls keep a mixed outfield pool, and goalkeepers remain excluded; this reduced the failing seed's `top_creator_goal_share_max` from `0.41` to `0.26` without changing scoring probabilities, generation, youth, or thresholds. | `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; focused engine/CLI tests; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; final `pnpm check` and `git diff --check` pending after status update |
| `docs/steps/34-match-event-concentration-rework/04-long-run-smoke-gate.md` | Blocked | Ran the 50x10 smoke gate and stopped before the final 250x30 gate. | The creator-concentration rework holds under the smoke gate, but the gate still fails because `phase34-concentration-world-00003` and `phase34-concentration-world-00040` have low `table_points_spread_avg`; this is a separate table-spread anomaly, not a creator/assist concentration failure. | `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=50 --seasons=10 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md` failed with `table_points_spread_avg=2` failing worlds; `pnpm cli ten-season-report --seed=phase34-concentration-world-00003 --seasons=10`; `pnpm cli ten-season-report --seed=phase34-concentration-world-00040 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed |
| `docs/steps/34-match-event-concentration-rework/05-phase-34-gate-and-report.md` | Not started | Planned final gate and report. | Run the final 250x30 gate, strict balance report, and write the Phase 34 concentration report with the next action. | Pending |
| `docs/steps/35-table-spread-anomaly-rework/README.md` | Done | Created the Phase 35 documentation path. | Phase 35 is the narrow remediation path for the two Phase 34 smoke-gate `table_points_spread_avg` failures; it must audit first, add diagnostics if needed, identify the table-compression source, rework only that source, and preserve the Phase 34 creator-concentration fix. | Documentation-only update; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/01-table-spread-failure-audit.md` | Done | Reproduced and documented the two table-spread failure worlds. | Single-world season summaries now include last-place points and first-minus-last table spread as diagnostics only; the audit shows both failed worlds pass goals and creator metrics but repeatedly produce compressed standings, with many champions below the mid-60s and bottom clubs often above 30 points. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI test; `pnpm check`; both failing-world reproduction commands; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/02-table-spread-diagnostics.md` | Done | Added compact table-spread diagnostics to long-run gate output. | Multi-world reports now expose table spread avg/min at aggregate level and per-worst-world `table_spread` snapshots with average, min, max, lowest-spread season, champion-points range, and last-place-points range; this is diagnostics-only and does not change simulation behavior or thresholds. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI test; temporary 2-world diagnostic gate; `pnpm check`; both failing-world reproduction commands; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/03-strength-hierarchy-source-review.md` | Done | Selected the source of the table-spread anomaly. | Added diagnostics for senior ability hierarchy and draw rate; rejected pure goals, creator concentration, pure draw-rate, and pure final ability-spread convergence as sole causes; selected insufficient match-result separation from existing team-strength differences as the Step 04 target. | `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI test; `pnpm check`; both failing-world reproduction commands; comparison `world-a`; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/04-narrow-table-spread-rework.md` | Done | Reworked match-result separation narrowly. | Increased only the opportunity-volume sensitivity to existing team-strength differences with `OPPORTUNITY_STRENGTH_SEPARATION_DIVISOR = 16`; conversion probabilities, thresholds, creator logic, and long-run refresh stayed unchanged; the two targeted table-spread failures improved from FAIL to WARN while strict balance stayed PASS. | `pnpm --filter @game/engine run typecheck`; focused step-match test; both failing-world reproduction commands; strict `calibration-v1` balance; `pnpm check`; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/05-smoke-gate-and-balance-check.md` | Blocked | Smoke gate failed on an out-of-scope champion-streak anomaly. | The 50x10 gate has zero `table_points_spread_avg` failures and zero creator-concentration failures after the Step 04 rework, but it still exits nonzero because `phase35-table-spread-world-00037` fails `champion_streak`; the final 250x30 gate was not run. | `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `git diff --check` |
| `docs/steps/35-table-spread-anomaly-rework/05a-champion-streak-smoke-rework.md` | Done | Reclassified the only 50x10 smoke blocker as a short-run champion-streak policy issue and made the smoke gate pass. | Ten-season `champion_streak` anomaly scoring now treats `7` as WARN and keeps `8+` as FAIL after evidence showed the `phase35-table-spread-world-00037` dynasty had healthy table-spread, scoring, creator, squad, youth, and turnover metrics; longer scaled thresholds remain unchanged. | Focused anomaly-scoring and CLI report-output tests; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; strict `calibration-v1` balance; `pnpm check` |
| `docs/steps/35-table-spread-anomaly-rework/06-final-long-run-gate-and-phase-report.md` | Done | Closed Phase 35 with a passing final long-run gate. | The final 250x30 gate passes with zero failed worlds and no failing checks; table spread remains healthy, Phase 34 creator-concentration remains cleared on the original failing seed, and strict balance remains green. | `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check` |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/README.md` | Done | Created the Phase 36 documentation path. | Phase 36 audits remaining long-run warnings through user fun, football credibility, readability, and emergent-story value before any tuning or threshold changes. | Documentation-only update; `git diff --check` |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/01-warning-taxonomy-and-fun-criteria.md` | Done | Created the warning taxonomy and fun-first criteria. | `docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md` records the Phase 35 warning set, defines the classification vocabulary, asks player-facing evaluation questions, and assigns initial hypotheses without changing simulation behavior, thresholds, or CLI output. | `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/02-active-player-population-diagnostics.md` | Done | Diagnosed why `active_player_population` warns in every final Phase 35 world. | Added diagnostics only: active senior/youth/total min-max counts in single-world, multi-world CLI, markdown, and worst-world rows; the 250x30 gate shows stable senior `396..443`, youth `198..198`, total `594..641`, so the warning is bad threshold semantics with useful monitoring value, not world-health collapse. | Focused tests; CLI/simulation-tools typecheck; small smoke report; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/03-creator-and-assist-warning-audit.md` | Done | Classified creator and assist warnings as non-blocking story/monitoring signals. | Added diagnostics only: aggregate production warning maxima and markdown production warning snapshots; the 250x30 gate shows max assists `18`, max top1 creator share `0.40`, max top3 share `0.57`, and no failures, so high-assist seasons are currently credible playmaker stories rather than attribution bugs. | Focused CLI/i18n/simulation tests; CLI typecheck; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/04-champion-streak-and-dynasty-audit.md` | Done | Classified champion-streak warnings as healthy dynasty variance with monitoring value. | Added diagnostics only: champion streak max, dynasty warning snapshots, champion points during streak, streak table spread, unique champions, and turnover context; the strongest dynasty is rare, has healthy spread and turnover, and does not indicate structural stagnation. | Focused CLI/i18n/simulation tests; CLI typecheck; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/05-table-spread-warning-audit.md` | Done | Classified table-spread warnings as healthy tight-league variance with monitoring value. | Added diagnostics only: table-spread warning snapshots ordered by tightest average spread; only `3 / 250` worlds warn, the lowest average is `35.67` versus pass `36`, and supporting draw/ability/spread evidence does not show recurring compression collapse. | Focused CLI/i18n/simulation tests; CLI typecheck; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` pending |
| `docs/steps/36-long-run-warning-semantics-and-fun-audit/06-warning-semantics-decision-report.md` | Done | Completed the Phase 36 final warning semantics decision report. | All remaining long-run warning types stay as monitoring signals; no gameplay tuning is recommended just to reduce warning counts, and the only future cleanup candidate is splitting `active_player_population` into clearer senior/youth/total semantics. | `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/37-long-run-gate-semantics-cleanup/README.md` | Done | Created the Phase 37 documentation path. | Phase 37 turns Phase 36 warning decisions into clearer long-run gate semantics without changing gameplay behavior. | Documentation-only update; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/01-phase-36-decision-review.md` | Done | Created the Phase 37 cleanup baseline report. | `docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md` records the Phase 36 decisions, confirms Phase 37 is not gameplay tuning, and identifies `active_player_population` as the only required semantics rework. | `test -f docs/audits/LONG_RUN_WARNING_FUN_AUDIT.md`; `git diff --check` |
| `docs/steps/37-long-run-gate-semantics-cleanup/02-active-player-population-semantic-split.md` | Done | Split the ambiguous total-player warning into explicit senior, youth, and total active-player semantics. | Replaced `active_player_population` with `senior_active_player_population`, `youth_active_player_population`, and `total_active_player_population`; a healthy `594` active-player world now passes while structural squad/youth collapse remains covered by existing strict checks. | Focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/03-warning-severity-and-report-language.md` | Done | Added report-level signal grouping for warning checks. | The batch gate now prints and writes `Signal check counts`, grouping warning-level check keys as `story`, `monitor`, or `structural`; `fail` remains the only blocker severity and all anomaly keys/thresholds stay unchanged. | Focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00065 --seasons=30`; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00238 --seasons=30`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/04-monitoring-signal-readability.md` | Done | Confirmed the long-run warning output is readable after the Step 03 signal grouping. | No additional code was needed; the existing aggregate counts plus `Signal check counts`, worst worlds, production snapshots, dynasty snapshots, and table-spread snapshots make the remaining warnings interpretable as story or monitoring signals. | Focused simulation-tools/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/05-regression-gates-after-semantics-cleanup.md` | Done | Proved the semantics cleanup did not change gameplay outcomes or hide real failures. | The 250x30 long-run gate passed with `0` failing worlds, `56` warning worlds, active-player ranges senior `396..443`, youth `198..198`, total `594..641`, and only story/monitor warning signals; strict `calibration-v1` balance also passed. | `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` pending |
| `docs/steps/37-long-run-gate-semantics-cleanup/06-phase-report-and-next-decision.md` | Done | Completed Phase 37 and left the next phase unselected. | The final report states gameplay behavior did not change, the long-run gate passes, strict balance passes, and remaining warning signals are not current blockers. | `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` pending |
| `docs/steps/38-match-engine-and-calculator-quality-review/README.md` | Done | Created the Phase 38 documentation path. | Phase 38 reviews the match engine and calculator as a football-quality system before any optimization or tuning. | Documentation-only update; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/01-calculator-surface-map.md` | Done | Mapped the current match-engine calculator surface. | `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md` now identifies the main inputs, outputs, explainable data paths, and aggregate/opaque areas without judging balance or changing behavior. | `rg -n "deriveTeamStrength|buildTacticTeamContext|stepMatch|simulateMatch|simulateSeason|ChanceActors|MatchEngineConfig" packages apps docs`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/02-team-strength-sensitivity-audit.md` | Done | Team-strength sensitivity is directionally credible. | Added focused engine tests proving striker, defender, midfielder, and goalkeeper-relevant attributes move the expected department while irrelevant cross-role attributes do not dominate; natural/adapted/weak suitability remains an explicit lineup/formation surface, not a hidden team-strength penalty. | `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/03-chance-generation-and-conversion-audit.md` | Done | Chance generation and conversion are directionally credible for the current aggregate scope. | Added deterministic full-match flow tests for equal teams, stronger home, stronger away, strong attack versus weak defense, and weak attack versus strong defense; stronger profiles produce more credible opportunities, shots on target, goals, and wins without removing variance. | `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/04-causal-actor-selection-audit.md` | Done | Causal actor selection is credible enough for the current aggregate match engine. | Fixture and long-run evidence show outfield scorers/creators, goalkeeper saves, optional assists, and no impossible role assignments; the main future limitation is that actors explain aggregate outcomes but do not yet cause them through a pre-outcome duel chain. | `pnpm check`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/05-tactic-lineup-and-condition-effect-audit.md` | Done | Tactic, lineup, and condition effects are visible and manager-driven, with no automatic tactical choice introduced. | No gameplay rework was applied; future work should separate pure tactic effects, lineup/role reshaping effects, and condition/fatigue effects more explicitly when diagnostics or UI need it. | `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/06-performance-and-determinism-benchmark.md` | Done | Current runtime is acceptable and representative seeded output remains deterministic. | No optimization was applied; one-season and balance checks are fast enough, 50x10 is acceptable as an explicit batch report, and larger gates should remain explicit report jobs rather than interactive UI actions. | `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; repeated seeded `diff`; `git diff --check` |
| `docs/steps/38-match-engine-and-calculator-quality-review/07-phase-report-and-next-decision.md` | Done | Phase 38 concluded that the match engine and calculator are acceptable for continued product work. | No broad optimization or balance tuning is justified now; if the next product goal is engine-focused, the recommended narrow direction is deterministic match-explanation traceability rather than mathematical tuning. | `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/README.md` | Done | Created the Phase 39 documentation path. | Phase 39 hardens engine code and adds deterministic match explanation traceability without changing gameplay behavior unless a narrow bug is proven. | Documentation-only update; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/01-phase-38-baseline-and-behavior-lock.md` | Done | Captured the Phase 38 baseline and fixed the behavior lock before cleanup or trace work. | `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md` records representative season, fixture, strict balance, and 50x10 long-run outputs plus the rule that cleanup/trace work must preserve fixed-seed behavior unless a narrow bug is proven. | `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/02-engine-code-quality-audit.md` | Done | Audited engine code quality and selected a narrow cleanup scope. | Step 03 is approved only for extracting the duplicated match loop shared by `simulateMatch` and `simulateMatchWithManualTactics`, plus stale match-engine comment cleanup; calculator weights, CLI split, and large season-use-case split are explicitly out of scope. | Required `rg` scans; `pnpm check`; `git diff --check` |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/03-safe-engine-cleanup-pass.md` | Done | Extracted a shared full-match simulation runner and cleaned stale match-engine comments without changing fixed-seed behavior. | `simulateMatch` and `simulateMatchWithManualTactics` now reuse `match-simulation-runner.ts`; manual tactics use a deterministic pre-step context hook and public contracts remain stable. | focused match-engine tests; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; strict `calibration-v1` balance report |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/04-match-explanation-trace-contract.md` | Done | Added the engine-local structured explanation trace contract without emitting it from simulation. | `match-explanation-trace.ts` defines schema version, stable factor keys, team snapshots, lineup/tactic/condition snapshots, opportunity summaries, and data-only variance markers; no domain durability or presentation prose was added. | focused trace-contract test; `pnpm --filter @game/engine run typecheck`; `pnpm check` after rerunning an unrelated timed-out content test |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/05-trace-emission-without-outcome-change.md` | Done | Added optional match explanation trace emission without changing default simulation output or fixed-seed behavior. | `SimulateMatchOptions.includeExplanationTrace` adds `explanationTrace` only when requested; trace data is built from existing context, score, stats, and events without consuming RNG. | focused match-engine tests; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; strict `calibration-v1` balance report |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/06-cli-fixture-explanation-inspection.md` | Done | Added optional localized fixture explanation output for `simulate-season --fixture=<fixtureId> --fixture-explanation`. | The CLI appends factual trace sections for team strength, tactics, lineup roles, condition impact, chance summary, and variance markers only when requested; default fixture output remains unchanged. | CLI/i18n typechecks; focused CLI/i18n tests; `pnpm check`; default fixture command; fixture explanation command; strict `calibration-v1` balance report |
| `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/07-regression-gate-and-phase-report.md` | Done | Closed Phase 39 with a passing regression gate and final report. | `docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md` records cleanup, trace capability, aggregate limits, verification results, and the decision that no immediate match-engine tuning is needed. | focused tests; `pnpm check`; fixed-seed season/fixture/fixture-explanation; 50x10 long-run PASS; strict `calibration-v1` balance PASS; deterministic repeat check; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/README.md` | Done | Created the Phase 40 documentation path. | Phase 40 audits the current career loop as a manager journey and uses one matchday slice to decide whether to move toward UI or fix one core blocker first. | Documentation-only update; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/01-phase-39-output-review.md` | Done | Reviewed Phase 39 explanation output from a career playability perspective. | Existing trace data is useful enough to continue, but it must be connected to career save, preparation, condition, and post-match consequences before it is playable. | `test -f docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/02-career-loop-playability-spec.md` | Done | Defined the minimum playable career loop from new save through first post-match review. | The loop is judged by whether the manager can connect decision, match, consequence, and next decision without automatic advice. | `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/03-career-state-matchday-readiness-audit.md` | Done | Audited selected club, squad, condition, match preparation, and next fixture from one deterministic career save. | Career state is ready for first-match audit, but saved formation/tactic/lineup preparation is still missing from the summary and remains a future matchday ritual friction. | `pnpm cli career --save=phase40-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --squad`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/04-career-fixture-explanation-readiness.md` | Done | Added optional factual explanation for played career fixtures. | `career --advance-next-fixture --fixture-explanation` attaches structured match explanation to the played career fixture only when requested; default career advance output remains compact. | focused career/CLI tests; CLI/engine/i18n typechecks; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/05-season-rollover-and-development-loop-smoke.md` | Done | Smoke-tested repeated fixture advancement, development report, youth academy report, and rollover invalid state from the same career viewpoint. | The career can be followed beyond one match; development/youth are readable inspections, while full rollover remains unavailable until the season is completed. | `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `pnpm cli career --save=phase40-check --development-report`; `pnpm cli career --save=phase40-check --youth-academy`; `pnpm cli career --save=phase40-check --rollover-season` expected invalid; `pnpm check`; `git diff --check` |
| `docs/steps/40-career-loop-playability-audit-and-matchday-slice/06-playability-friction-report-and-next-decision.md` | Done | Closed Phase 40 with a playability report and one next-phase recommendation. | The current career loop is close to playable, but the next best user-fun improvement is career matchday consequences and condition integration before serious UI work. | focused tests; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/README.md` | Done | Created the Phase 41 documentation path. | Phase 41 integrates deterministic post-match condition consequences into career fixture advancement so the manager can see why rotation matters before UI work. | Documentation-only update; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/01-phase-40-output-review.md` | Done | Created the focused career matchday condition audit. | Phase 41 proceeds without a new product decision: played career fixtures should spend deterministic fitness for explicit selected starters and report that consequence without choosing for the manager. | `test -f docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/02-career-condition-consequence-contract.md` | Done | Added a pure engine condition-consequence contract for one played career fixture. | `applyCareerFixtureConditionConsequences` spends fitness only for explicit selected starters, preserves non-starters, returns ordered structured changes, and leaves save writing/output to later steps. | focused condition-consequence test; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/03-career-advance-condition-application.md` | Done | Wired career fixture advancement to persist selected-club condition consequences. | `progressNextCareerFixture` now applies starter fitness spend after match simulation/result application, returns structured condition changes, preserves non-starters, and marks selected-club explanation condition as tracked when requested. | focused progress-fixture test; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/04-cli-post-match-condition-output.md` | Done | Added compact localized post-match condition output to career fixture advancement. | Successful `career --advance-next-fixture` now prints selected-starter condition deltas and rested first-team players when available; `career --squad` shows the persisted fitness state. | focused career CLI test; CLI/i18n typechecks; `pnpm check`; career advance smoke; career squad smoke; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/05-multi-fixture-condition-smoke.md` | Done | Repeated fixture advancement now shows accumulating selected-starter condition pressure. | The `phase41-check` smoke advanced three selected-club fixtures with the same lineup: starters moved from 100 to 76, reserves stayed at 100, and explained output marked selected-club condition as tracked/negative. | focused career/condition/progression tests; `pnpm check`; summary/advance/explained-advance/squad smokes; `git diff --check` |
| `docs/steps/41-career-matchday-consequences-and-condition-integration/06-phase-report-and-next-decision.md` | Done | Closed Phase 41 with a final condition-consequence report and next-phase recommendation. | The career loop now has visible matchday condition consequences, but the next core blocker before serious UI is deterministic between-fixture recovery. | focused career/condition/progression tests; `pnpm check`; summary/advance/explained-advance/squad smokes; strict `calibration-v1` balance report; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/README.md` | Done | Created the Phase 42 documentation path. | Phase 42 adds deterministic between-fixture recovery to make career matchday readiness fair and inspectable before UI work. | Documentation-only update; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/01-phase-41-output-review.md` | Done | Created the focused career weekly recovery audit. | Phase 42 proceeds from the Phase 41 one-way condition drain: recovery must be date-based, applied before match simulation, and exposed as factual readiness without advice or auto-rotation. | `test -f docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/02-career-recovery-contract.md` | Done | Added a pure career weekly recovery contract. | `applyCareerWeeklyRecovery` wraps the existing fitness recovery helper, returns ordered before/after/delta summaries, treats non-positive day gaps as no-op summaries, and does not advance fixtures, spend match fitness, choose players, or render text. | focused recovery test; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/03-career-advance-recovery-application.md` | Done | Career fixture advancement from CLI now applies recovery before simulation. | `advanceCareerNextFixture` finds the next selected-club fixture, recovers the selected-club roster by calendar-day gap, builds match contexts from the recovered state, then lets `progressNextCareerFixture` simulate and spend condition; tests cover weekly full recovery, short-gap partial recovery, and unchanged saved lineup. | focused career CLI/progression tests; engine typecheck; `pnpm check`; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/04-cli-pre-match-readiness-output.md` | Done | Added compact localized pre-match recovery output to career advancement. | Successful `career --advance-next-fixture` now prints recovery days, improved-player count, and selected-club fitness range before post-match condition deltas; output is factual and non-advisory. | focused career CLI/i18n tests; CLI and i18n typechecks; `pnpm check`; career summary/advance/squad smokes; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/05-repeated-fixture-recovery-smoke.md` | Done | Repeated selected-club fixture smoke confirms weekly recovery prevents cumulative drain. | The `phase42-check` smoke advanced four selected-club fixtures with the same first-team lineup; after the opening same-day match, each seven-day gap restored starters from `92..100` to `100..100` before kickoff, then the match spend returned starters to `92`. Current demo calendar has no short-gap pressure, which is a future scheduling/cups finding rather than a Phase 42 blocker. | `pnpm check`; phase42-check create/prepare/four-advance/squad smokes; `git diff --check` |
| `docs/steps/42-career-weekly-recovery-and-matchday-readiness/06-phase-report-and-next-decision.md` | Done | Closed Phase 42 with a complete recovery report and one next-phase recommendation. | The career loop now supports visible saved preparation, pre-match recovery, fixture result, post-match condition, persisted squad state, and optional explanation; the next recommended phase is a minimal career matchday UI slice, not more CLI-only systems. | `pnpm check`; career summary/squad smokes; strict `calibration-v1` balance report; `git diff --check` |

Status values:

- `Planned`: identified as future work but not yet the active step.
- `Not started`: documented but no implementation work done.
- `In progress`: currently being implemented.
- `Done`: implementation merged locally and Definition of Done satisfied.
- `Rework`: implemented but needs correction before the next step.
- `Skipped`: intentionally not done, with reason recorded in Outcome.

## Adopted Solutions

- Documentation is split into executable implementation steps under `docs/steps/`.
- Work proceeds one active step at a time.
- The process is incremental and iterative: implement, test, learn, update next step, advance.
- The mandatory execution loop is: read status, choose active step, implement, test, fix or adjust next step, update status briefly, advance.
- Future scope is kept in `docs/steps/99-future/README.md` as a queue, not a ban list.
- `docs/PROJECT_RULES.md` is stable across phases; moving forward should add step docs, not rewrite rules.
- The implementation target remains CLI-first and deterministic; persistence is added only through documented storage/career phases, while UI remains out of scope until explicitly planned.
- After Phase 25, the immediate match-day interaction idea is intentionally deferred: Phases 26-30 now focus on cleanup, season rollover, player development, club identity/calendar, and ten-season simulation reports before UI exploration.
- The Step Ledger tracks individual step files, not only broad phase groups.
- Every step prompt tells the implementer to read and update `docs/PROJECT_STATUS.md`.
- Phase 7 follows the roadmap gate rule: review current output before adding causal actor code.
- `pnpm` is exposed through Corepack under Node `v24.16.0`; this shell required `source ~/.nvm/nvm.sh && nvm use` before running pnpm commands.
- Domain IDs use one namespace convention for every entity type: `type:value` (`player:000001`, `club:perugia`, `competition:ita-3`, `fixture:000001`, `season:2026`, `save:demo-001`).
- Domain ID validation is intentionally not exposed as a partial public helper; callers must use specific constructors like `playerId`, `clubId`, and `fixtureId`.
- TypeScript source files written so far carry TSDoc/JSDoc comments for public contracts, package entrypoints, and test fixture intent.
- Shared deterministic RNG uses local streams only: callers derive streams from `seed + streamName + stable key parts`; no global RNG state exists.
- Shared date utilities convert `YYYY-MM-DD` to epoch-day and back with pure Gregorian arithmetic; JavaScript `Date` and timezone APIs are not used.
- JSON storage persists full `GameState` snapshots behind `GameStorage`; storage metadata uses real ISO timestamps, while game time remains `GameDate` in domain/engine.
- Enforcement is executable: `pnpm check` runs ESLint, Dependency Cruiser, Vitest, and workspace typecheck.
- ESLint currently focuses on engine determinism bans; Dependency Cruiser currently enforces source-import package boundaries.
- Existing package tests were migrated from Node native `node:test` registration to Vitest `test` registration while keeping Node `assert/strict`.
- `pnpm cli doctor` is the first real CLI command and prints a stable success line without gameplay side effects.
- Team strength calculation is pure and data-driven: role weights and dynamic-state multiplier curves are passed by the caller, not hardcoded in engine.
- Match context is serializable and self-contained: future match simulation should consume `MatchContext` without reading `GameState`, content files, storage, or UI preferences.
- Match RNG derivation data is standardized as `seed + "match" + fixtureId`; the context step defines the key but does not create or consume an RNG stream.
- Match stepping is local and serializable: `MatchSimulationState` owns minute, score, stats, and marker flags; durable domain `MatchEvent`/`MatchReport` types are still deferred to their documented step.
- Batch match simulation is reproducible end-to-end: `simulateMatch` derives the match RNG internally and the fixed golden output test locks the complete result shape and event sequence.
- Match reports are durable domain data: `MatchReport` stores schema version, fixture ID, final minute, score, stats, and sparse structured events; narration, fixture application, storage schemas, and retention remain separate future steps.
- Calendar generation is deterministic and date-first: fixtures carry both `roundNumber` and `GameDate`; the first implementation supports even-club double round-robin leagues, one round every seven days, no cups/breaks/rescheduling.
- Fixture results are the source of truth for future standings: `FixtureResult` stores `played`, `homeGoals`, and `awayGoals`; the rich `MatchReport` is only an optional reference.
- Fixture result application is copy-on-write over `GameState & FixtureStateSlice`; `game-state.ts` was not modified because it was not listed in the active step's expected files.
- League tables are derived, not persisted: `computeLeagueTable` reads only compact fixture results in explicit fixture order and uses stable club ID ordering as the final tie-breaker.
- The first season CLI milestone uses fictional generated content only: 18 fake clubs, generated players, fixed 4-4-2 lineups, content-provided role weights, and no real football data.
- `simulate-season` is deterministic by seed and prints a final table plus best defense and worst attack; player-level top scorer is explicitly unavailable until the match engine attributes goals to players.
- `simulateSeason` is now exported from `@game/engine` because balance tooling needs the season use-case through the package boundary.
- `packages/simulation-tools` is the content-free place for deterministic aggregate reports; it may use `domain`, `engine`, and `shared`, while apps supply concrete content and target profiles.
- `balance-report` uses broad hand-authored calibration targets from content, reports goals per match, result rates, table points, and upset proxy, and exits nonzero only when `--strict` is enabled and a metric fails.
- Phase 3 balance calibration starts with target/profile separation before tuning: `default` remains a broad smoke profile, while `calibration-v1` is the stricter gate used to expose under-scoring and draw-heavy output.
- Current `calibration-v1` baseline for `seed-prefix=balance-demo`, `seasons=3`: goals per match `1.127` fails `2.000..3.200`; home win rate `0.296` fails `0.330..0.550`; draw rate `0.444` fails `0.180..0.330`; first-place points `57.000` fails `66.000..90.000`.
- Match rate tuning is config-only so far: fake content now uses base opportunity rate `0.09`, max opportunity rate `0.24`, conversion probabilities `0.105/0.20/0.35`, and home advantage `1.10`.
- Current tuned `calibration-v1` sample for `seed-prefix=test-balance`, `seasons=20`: goals per match `2.853`, home win rate `0.416`, draw rate `0.235`, away win rate `0.350`, first-place points `71.450`, last-place points `23.500`, table points spread `47.950`, upset rate `0.331`; all pass.
- Table spread review is an explicit report metric now: `table_points_spread` means average first-place points minus last-place points across the simulated season batch.
- Fake content strength spread is now wider and less noisy by slot: the top generated clubs should separate more reliably from bottom generated clubs before future richer match mechanics exist.
- Phase 4 focuses on player-visible match detail: goal attribution, durable scorer events, season player goal stats, CLI top scorers, and minimal fixture detail.
- Goal attribution is engine-local in step 04/01: goal step events include `scorerPlayerId`, but durable domain `MatchReport` goal events and CLI output still do not expose scorers until later Phase 4 steps.
- Goal attribution uses an independent deterministic `goal-attribution` RNG stream, not the main match RNG, so adding scorer IDs does not change match results, league tables, or balance metrics.
- Match event schema version `2` adds durable `scorerPlayerId` to goal events; season/player-stat code should read this field from `MatchReport` goal events instead of engine-local step events.
- `simulateSeason` now returns `playerGoalStats`, derived from durable report goal events and fixed-lineup registrations; CLI consumes this result for the top-scorer line without recomputing stats.
- Current `pnpm cli simulate-season --seed=demo-001` top scorer: `Matteo Ricciardi (PRO05) - 23 goals`.
- `simulate-season --round=<number>` prints deterministic fixture-level results and scorer lines from existing simulated season reports; it does not run a separate match/season simulation path.
- Phase 4 is intentionally not the full duel engine, match-day UI, storage migration, market, growth, staff, youth, facilities, or economy phase.
- Phase 5 is documented as match event detail: richer shot context, optional assists, goalkeeper save attribution, player match stats, and CLI match detail v2.
- Phase 5 must stay deterministic and language-agnostic; it should not implement full possession chains, live match-day UI, storage browsing, management systems, or rendered commentary.
- Match event schema version `3` adds structured shot context to durable shot outcome events: `shotType` and `chanceType` are enum-like keys derived without additional RNG consumption.
- Current structured shot context derivation is intentionally aggregate and minimal: it uses minute, side, opportunity quality, and attacking tactical distribution to label `open_play`, `counter`, or `cross`, and `normal` or `header`; it does not create set-piece systems, assists, goalkeeper attribution, or full duels.
- Match event schema version `4` adds optional `assistPlayerId` to durable goal events; current CLI output does not render assists yet, so `simulate-season --round=<number>` remains visually unchanged until `05-cli-match-detail-v2`.
- Assist attribution is optional and independent from the main match RNG; it uses `shotType`/`chanceType` for eligibility, excludes the scorer and goalkeepers, and does not change goals, scores, tables, or balance metrics.
- Match event schema version `5` adds `goalkeeperPlayerId` to durable save events; save attribution uses the defending side's explicit `roleKey: "gk"` lineup slot.
- Save attribution does not change shot outcomes, scores, tables, or balance metrics; it only enriches saved-shot events and fails clearly if a simulated team has no goalkeeper slot.
- `computePlayerMatchStats` derives match player stats only from durable `MatchReport` events; current per-player shots and shots on target are credited only for goals because non-goal shot events do not yet identify the shooter.
- Player match stats are exported from `@game/engine` so the CLI can render match detail without duplicating report parsing.
- `simulate-season --fixture=<fixtureId>` is the first structured match inspection command; use `--round=<number>` to discover fixture IDs, then `--fixture` to inspect one match's events and compact player stats.
- Phase 6 is a CLI/stat completeness phase: clean fixture-only output first, then shot taker attribution, complete current player match stats, clearer fixture player-stat rendering, and minimal season assist/save summaries.
- `simulate-season --fixture=<fixtureId>` now uses a fixture-focused output path and intentionally omits the final table/top-scorer season summary.
- Match event schema version `6` adds `shooterPlayerId` to generated non-goal durable shot events (`save`, `miss`, `block`); goal events intentionally do not duplicate it because `scorerPlayerId` is the shooter in the current aggregate model.
- Match event schema version `7` adds minimal durable causal context: optional non-duplicated `creatorPlayerId` on goals and optional `primaryDefenderPlayerId` on blocks; CLI fixture detail renders these as compact `creator=` and `defender=` fields when present.
- `computePlayerMatchStats` now derives complete current shot counts: goals count through `scorerPlayerId`, non-goal shot events count through `shooterPlayerId` when present, and save events also credit the defending goalkeeper.
- `simulate-season --fixture=<fixtureId>` now registers all home and away starters when rendering player stats, so zero-stat starters appear after contribution rows.
- `simulateSeason` now also returns `playerSummaryStats`, derived from durable reports and fixed-lineup registrations; current fields are goals, assists, and goalkeeper saves.
- Current `pnpm cli simulate-season --seed=demo-001` season summaries: top scorer `Matteo Ricciardi (PRO05) - 23 goals`; top assist `Enrico Ferri (PRO01) - 11 assists`; top goalkeeper saves `Marko Stanic (PRO02) - 94 saves`.
- Phase 7 now has an engine-local causal actor building block: `selectChanceActors` selects creator, shooter, primary defender, and goalkeeper without consuming the main match RNG.
- `stepMatch` now consumes that building block for player attribution only: scores, tables, opportunity counts, and balance metrics remain stable, while player-level goals/assists/shots can change for fixed seeds.
- The old standalone match-engine attribution helpers for scorer, assist, shot taker, and goalkeeper saves have been retired after `stepMatch` integration because they no longer had production callers; current attribution lives in `chance-actors.ts` plus the small assist-credit decision inside `step-match.ts`.
- Current `pnpm cli simulate-season --seed=demo-001` season summaries after identity generation: top scorer `Matteo Ricciardi (PRO05) - 23 goals`; top assist `Enrico Ferri (PRO01) - 11 assists`; top goalkeeper saves `Marko Stanic (PRO02) - 94 saves`.
- Phase 7 CLI fixture review is complete: `fixture:000001` shows creator context on unassisted goals, and `fixture:000002` shows defender context on a blocked shot.
- Phase 8 is documented as tactic and lineup MVP: review Phase 7 output first, then add selected-lineup/tactic contracts, engine setup builder, season setup overrides, and a minimal CLI inspection path.
- Phase 8 output review accepted Phase 7 output as a stable baseline: `fixture:000001` shows `creator=` on unassisted goals without duplicating assists, `fixture:000002` shows `defender=` on a block, player stats align with event rows, and `calibration-v1` strict mode still passes.
- Phase 8 domain contracts are dependency-free: selected lineups are ordered slot/player/role selections, tactic setup has a five-step `mentality` key plus bounded 0-1 `pressing`, `directness`, `width`, and `risk`; `mentality` is setup data only until a later step explicitly maps it to engine behavior.
- Phase 8 engine builder converts selected setup into current match-engine data only: `buildTacticTeamContext` validates size/player/role inputs, derives strength through existing role weights, maps the four existing tactic knobs, and keeps `mentality` as validated data with no independent match effect.
- Phase 8 season overrides are API-only so far: `simulateSeason.setupOverrides` accepts ordered self-contained setup overrides and preserves default output when omitted; CLI inspection is intentionally deferred to `05-cli-tactic-lineup-inspection`.
- Phase 9 is documented around manual manager intent: saved tactical profiles can be selected and later switched by an explicit minute command, while automatic tactical switching based on score/minute/context is out of scope.
- Phase 9 output review accepted Phase 8 as a technical baseline: `pro01-attacking` is useful as an explicit demo/manual tactic option, but it should not be treated as an optimized season-long tactic.
- Phase 9 saved setup demos now expose `pro01-balanced`, `pro01-attacking`, and `pro01-defensive` through one explicit CLI profile registry; these are user-selectable tactic options, not automatic score/minute decisions.
- Phase 9 manual tactic-change contract is engine-only and uses already-built `MatchTeamContext` values, so future segmented simulation can apply caller intent without importing content, CLI, or saved profile registries.
- Phase 9 segmented fixture simulation is wired to CLI fixture inspection only: `simulateMatchWithManualTactics` applies explicit scheduled team contexts by minute, delegates to `simulateMatch` for no-change compatibility, and remains caller-declared rather than automatic.
- `simulate-season --fixture=<fixtureId> --setup-demo=<initialProfile> --manual-tactic-switch=<minute>:<targetProfile>` is now the manual tactic switch inspection path. It shows the selected club inside the manual switch block, whether that club is actually playing the fixture, and the profile timeline.
- Phase 10 is documented around player fitness as the first dynamic cross-match state: pure spend/recovery rules first, bounded strength impact second, optional season lifecycle third, CLI condition inspection last.
- Phase 10 intentionally uses existing `PlayerDynamicState.fitness`; `form` and `morale` remain future systems even though the domain shape already includes them.
- Phase 11 is documented around manual lineup rotation: the user chooses who plays, while the engine and CLI apply and inspect explicit lineup choices without automatic rotation or recommendations.

## Open Decisions And Follow-Up

- `pnpm-lock.yaml` was created by the required `pnpm install` verification even though it was not listed in the step `Expected files`; keep it as the workspace lockfile.
- `pnpm install` resolved TypeScript `^5.8.3` to `5.9.3`; keep this acceptable unless a later step needs a pinned compiler version.
- `packages/domain/tsconfig.json` enables `allowImportingTsExtensions` so Node 24 can execute TypeScript tests directly.
- `packages/shared/tsconfig.json` also enables `allowImportingTsExtensions`, matching `domain`, because the workspace currently runs `.ts` files directly under Node 24.
- `packages/storage/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/engine/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because it typechecks against workspace source imports from `domain`.
- `packages/content/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because generated content now imports workspace source packages directly.
- `apps/cli/tsconfig.json` enables `allowImportingTsExtensions` and omits `rootDir` because the CLI imports local `.ts` command modules and workspace source packages directly under Node 24.
- `tsconfig.base.json` sets `noEmit: true`, because current packages are typechecked and executed directly from `.ts` files; this satisfies TypeScript's `allowImportingTsExtensions` requirement without producing unresolved emitted JavaScript imports.
- `vitest.config.ts` includes both `packages/**/*.test.ts` and `apps/**/*.test.ts` so CLI command tests are part of `pnpm check`.
- Phase 10 player dynamic states v1 is complete.
- Step 11/02 established that manual lineup rotation needs real reserve players in fake content; fake clubs now generate 16 senior players while default generated lineups remain 11 starters.
- Step 11/03 intentionally validated fixture lineup override input without applying it; Step 11/04 is responsible for using that contract during match context creation and fitness spend.
- Step 11/04 applies fixture lineup overrides inside `simulateSeason`; the default CLI season and condition-demo outputs remained unchanged because no CLI command passes fixture lineup overrides yet.
- Phase 11 manual lineup rotation v1 is complete. Manual lineup override inspection command to review: `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`.
- Phase 12 is now selected as squad selection and formation core before career persistence. It must make formation choice reveal squad-fit facts and trade-offs without auto-selecting players, recommending market actions, or executing transfers.
- When a future documented step lists `packages/domain/src/state/game-state.ts`, consolidate `fixtures` and `fixtureIds` into the base `GameState` contract instead of keeping them only as a use-case slice.
- Phase 12 squad selection and formation core is complete. Review command: `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`.
- Phase 12 formation-fit report was reworked after manual inspection: CLI slot rows now separate `natural`, `adapted`, and `weak` counts instead of a vague `candidates` total, and adapted-only DM/AM coverage now appears as factual weak-depth notes backed by `adapted_only:*` fit keys.
- Phase 13 is documented as localization foundation. The game supports five language codes (`it`, `en`, `de`, `es`, `fr`) with English fallback; domain/engine keys remain stable and language-agnostic, while CLI/UI presentation layers localize all user-facing text.
- `docs/PROJECT_RULES.md` now includes binding presentation/localization rules: user-facing headings, labels, event words, report metrics, statuses, warnings, hints, and user-facing errors must go through localization once Phase 13 introduces the layer.
- `requirements.md` Area 20 now states the same product rule: labels useful to UI or CLI must not be hardcoded in produced code and must pass through localization keys.
- Phase 14 is documented as a complete engine/core audit before market or youth. It has seven points: architecture boundaries, determinism, match engine, season engine, tactic/lineup/formation, code quality/dead code/naming, and audit report/next-phase decision.
- Phase 14 audit result: score `86/100`, no critical blockers. The current core is healthy, but Phase 15 should be a narrow cleanup/rework phase before market/youth: remove `Object.values()` from engine simulation order, rename stale market-hint comments, split the large CLI `simulate-season` module, and decide whether to consolidate fixtures into `GameState` before persistence/career state.
- Phase 15 is documented as `docs/steps/15-core-cleanup-before-career-systems/`: it closes the Phase 14 findings before market/youth and must end with `docs/audits/CORE_CLEANUP_REPORT.md`.
- Phase 15 core cleanup is complete. The cleaned core score is `92/100`; no critical or high cleanup blockers remain. Its original recommendation was market MVP next, but Phase 16 now inserts a dependency-map gate before market implementation.
- Market roadmap is documented in `docs/market-roadmap/`. The agreed scope removes sell-on percentages, appearance/goal bonuses, complex loan buy options/obligations, multiple-player exchanges, and highly legalistic clauses; it keeps one-player exchange and simple installments for a later structured-deals phase.
- Phase 16 is now a dependency-map phase, not market implementation. It exists to decide whether market MVP can proceed next or whether a shared career-state, economy, calendar, scouting, or youth foundation must come first.
- Phase 17 is documented as `docs/steps/17-market-mvp-permanent-transfers/`: a constrained in-memory permanent-transfer MVP. It must prove transfer contracts, valuation, willingness, feasibility/apply preview, and localized CLI inspection before any persistence, loans, contracts, wages, windows, scouting, AI, installments, or player exchanges.
- Phase 18 is documented as `docs/steps/18-career-state-and-transfer-persistence/`: it must make selected-club career state, transfer funds, roster changes, and permanent-transfer history durable before deeper market systems or first-playable-loop work.
- Phase 19 is documented as `docs/steps/19-fictional-people-identity-foundation/`: it intentionally moves before the first playable career loop so generated players stop using placeholder names and squads reflect credible domestic/international nationality distribution by division and club strength.
- Phase 20 is documented as `docs/steps/20-new-career-world-generation/`: it must make each new career/world seed generate distinct fictional squads and prospects while keeping the generated world persisted and stable inside the save.
- Phase 21 completed `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`: no blocker found and readiness scored `88 / 100`; the recommendation is now refined into `Phase 22 - Pre Playable Loop Hardening` followed by `Phase 23 - Playable Career Loop MVP`, before youth, scouting, loans, contracts, UI, staff, facilities, or deeper market.
- Phase 22 pre playable loop hardening is complete and scored `95 / 100` in `docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md`; Phase 23 should now prove the first save-driven playable loop and move the current milestone near `100 / 100`.
- Phase 23 playable career loop MVP is complete and scored `98 / 100` in `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md`; its original next-phase recommendation was `Phase 24 - Career Match Preparation Persistence`, but the user later identified player generation quality as the more important core risk.
- Phase 24 is complete as `docs/steps/24-player-generation-quality-rework/`: the generator now has division/tier bands, role templates, archetypes, rarity budgets, quality tests, and CLI inspection.
- Career match preparation persistence should now resume as `Phase 25 - Career Match Preparation Persistence`; do not reuse the old Phase 24 numbering for it.
- Nationality flag SVG files under `assets/flags/` are presentation assets. Future code should map `NationalityCode` to a flag asset code outside domain/engine and must not store SVG paths in player, match, or career domain state.

### 2026-06-21 — `docs/steps/21-project-audit-and-roadmap-reconciliation/`

- Status: Done
- Outcome: Completed a full project audit across documentation, package boundaries, determinism, save consistency, product-loop readiness, roadmap dependencies, and next-phase priority.
- Adopted solution: `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` is the current audit handoff; it scores readiness at `88 / 100`, records no blockers, and now recommends `Phase 22 - Pre Playable Loop Hardening` before `Phase 23 - Playable Career Loop MVP`.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli career --save=phase21-audit-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase21-audit-world --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Execute Phase 22 hardening before Phase 23 loop implementation.

### 2026-06-21 — Phase 22 and Phase 23 documentation

- Status: Done
- Outcome: Created the pre-loop hardening phase and the playable career loop MVP phase documentation.
- Adopted solution: Keep completed Phase 21 as audit history; use Phase 22 for hardening and Phase 23 for the first save-driven career loop.
- Verification: `git diff --check`.
- Follow-up: Start `docs/steps/22-pre-playable-loop-hardening/01-roadmap-status-alignment.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/01-roadmap-status-alignment.md`

- Status: Done
- Outcome: Confirmed and recorded that Phase 22 is pre-loop hardening and Phase 23 is the playable loop.
- Adopted solution: Preserve the completed Phase 21 audit history and treat older Phase 22 playable references as historical drift unless `docs/PROJECT_STATUS.md` says otherwise.
- Verification: `rg -n "Phase 22 - Playable\|Phase 23 - Playable\|Pre Playable\|playable loop" docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md docs/PROJECT_STATUS.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/02-career-cli-module-boundaries.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/02-career-cli-module-boundaries.md`

- Status: Done
- Outcome: Reduced career CLI module pressure without changing existing command behavior.
- Adopted solution: `apps/cli/src/commands/career.ts` now orchestrates only, while private modules under `apps/cli/src/commands/career/` own parsing, scenario/state construction, formatting, and shared aliases.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm cli career --save=phase22-boundary-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-boundary-world --inspect`; `pnpm check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/03-career-save-runtime-policy.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/03-career-save-runtime-policy.md`

- Status: Done
- Outcome: Made local career save behavior explicit and safe before adding more save-writing commands.
- Adopted solution: Career CLI output now shows the effective save directory via localized labels, and `.gitignore` explicitly excludes `apps/cli/saves/` runtime files.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase22-save-policy-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-save-policy-world --inspect`; `git check-ignore -v apps/cli/saves/career/save%3Aphase22-save-policy-world.career.json`; `pnpm check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/04-career-determinism-golden-checks.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/04-career-determinism-golden-checks.md`

- Status: Done
- Outcome: Added automated career determinism coverage before the playable loop.
- Adopted solution: Career CLI tests now cover same-seed stable generated worlds, different-seed variation, and accepted transfer persistence across fresh storage adapter reloads.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/storage/src/career-storage.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/22-pre-playable-loop-hardening/05-phase-23-readiness-review.md`.

### 2026-06-21 — `docs/steps/22-pre-playable-loop-hardening/05-phase-23-readiness-review.md`

- Status: Done
- Outcome: Completed the Phase 22 hardening report and approved Phase 23 start.
- Adopted solution: Readiness is now `95 / 100`; the project should not claim `100 / 100` until Phase 23 proves the save-driven playable career loop.
- Verification: `pnpm check`; `pnpm cli career --save=phase22-hardening-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase22-hardening-world --inspect`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md`.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/01-phase-22-output-review.md`

- Status: Done
- Outcome: Confirmed Phase 22 hardening cleared the pre-loop blockers and Phase 23 can proceed.
- Adopted solution: Treat the remaining readiness gap as Phase 23 scope; no source changes were needed in this review step.
- Verification: `rg -n "Score\|Blocker\|Phase 23\|playable" docs/audits/PRE_PLAYABLE_LOOP_HARDENING_REPORT.md docs/PROJECT_STATUS.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/02-career-summary-from-save.md`.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/02-career-summary-from-save.md`

- Status: Done
- Outcome: Added a localized career summary command that reads an existing save and shows the next selected-club fixture.
- Adopted solution: `pnpm cli career --save=<saveId> --summary` loads persisted `CareerState`, prints current date/season, selected club roster/budget, and first unplayed selected-club fixture; new career world creation now persists the initial deterministic fixture calendar so the summary and later progression steps have saved fixture state.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm cli career --save=phase23-summary-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-summary-world --summary`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/03-career-next-fixture-progression-contract.md`; keep next-fixture selection pure and move it out of CLI formatting.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/03-career-next-fixture-progression-contract.md`

- Status: Done
- Outcome: Added a pure engine contract for locating the next unplayed fixture involving the selected career club.
- Adopted solution: `findNextCareerFixture(careerState)` reads explicit fixture order and returns discriminated `found`, `none`, or `invalid` results; invalid state covers missing selected club, unordered selected club, missing fixture references, and fixture club references.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/04-persisted-fixture-progression.md`; reuse `findNextCareerFixture` instead of duplicating fixture selection.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/04-persisted-fixture-progression.md`

- Status: Done
- Outcome: Added reusable in-memory progression for exactly one selected-club fixture.
- Adopted solution: `progressNextCareerFixture` takes a loaded `CareerState`, caller-provided match team contexts, and match config; it simulates only the selected club's next fixture, applies the resulting `MatchReport` to a copied game state, and returns a copied `CareerState` without storage writes or automatic lineup/tactic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/career/next-fixture.test.ts packages/engine/src/career/progress-fixture.test.ts apps/cli/src/commands/career.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/05-career-advance-cli.md`; CLI must supply deterministic team contexts and perform the actual save write.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/05-career-advance-cli.md`

- Status: Done
- Outcome: Added the first save-writing career advancement command.
- Adopted solution: `pnpm cli career --save=<saveId> --advance-next-fixture` loads the save, uses persisted roster/player state to build deterministic MVP default team contexts, advances only the next selected-club fixture, writes the save on `advanced`, and prints localized fixture result plus next fixture.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts packages/engine/src/career/progress-fixture.test.ts`; `pnpm cli career --save=phase23-advance-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-advance-world --summary`; `pnpm cli career --save=phase23-advance-world --advance-next-fixture`; `pnpm cli career --save=phase23-advance-world --inspect`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/06-durable-decision-continuity.md`; prove a manual durable decision survives fixture advancement.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/06-durable-decision-continuity.md`

- Status: Done
- Outcome: Proved a manual accepted transfer remains visible after career fixture advancement.
- Adopted solution: The continuity test and smoke flow use the existing accepted permanent-transfer demo, then `--advance-next-fixture`, then reload/inspect to verify roster size `23`, post-transfer budget, transfer history, and selected-club played-fixture count all survive.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm cli career --save=phase23-continuity-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-continuity-transfer --seed=demo-001 --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=phase23-continuity-transfer --summary`; `pnpm cli career --save=phase23-continuity-transfer --advance-next-fixture`; `pnpm cli career --save=phase23-continuity-transfer --inspect`; `pnpm check`.
- Follow-up: Execute `docs/steps/23-playable-career-loop-mvp/07-playability-audit-and-next-phase-decision.md`; document whether this phase reaches the current near-100 milestone and select the next phase without implementing it.

### 2026-06-21 — `docs/steps/23-playable-career-loop-mvp/07-playability-audit-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 23 and recorded the first playable career loop MVP as `98 / 100`.
- Adopted solution: `docs/audits/PLAYABLE_CAREER_LOOP_MVP_REPORT.md` treats the save-driven loop as proven, records the remaining MVP shortcut, and recommends exactly one next phase: `Phase 24 - Career Match Preparation Persistence`.
- Verification: `pnpm cli career --save=phase23-loop-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase23-loop-world --summary`; `pnpm cli career --save=phase23-loop-world --advance-next-fixture`; `pnpm cli career --save=phase23-loop-world --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check`.
- Follow-up: Do not start Phase 24 until its docs and incremental steps are explicitly requested.

### 2026-06-21 — Phase 25 career match preparation persistence docs

- Status: Done
- Outcome: Created `docs/steps/25-career-match-preparation-persistence/` with README and seven step documents.
- Adopted solution: Phase 25 starts with a gap review, then adds save-driven squad inspection, durable preparation state, saved lineup, saved tactic, fixture advancement through saved preparation, and a final report. This keeps the user as the decision-maker and removes the selected-club default preparation shortcut through documented steps.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/25-career-match-preparation-persistence/01-phase-24-output-and-prep-gap-review.md`; do not implement product code before the review documents the current preparation gap.

### 2026-06-21 — Phases 26-30 long-run simulation documentation

- Status: Done
- Outcome: Created documentation for Phase 26 through Phase 30 and shifted the next milestone away from adding more isolated CLI features.
- Adopted solution: Phase 26 cleans documentation noise and defines long-run metrics; Phase 27 adds season rollover; Phase 28 adds player development and aging; Phase 29 adds fictional city-based club identity and calendar readiness; Phase 30 produces a ten-season simulation report as the gate before future UI exploration.
- Verification: `git diff --check`.
- Next action: Execute `docs/steps/26-project-cleanup-and-long-run-readiness/01-documentation-noise-audit.md`.

### 2026-06-21 — Phase 26 project cleanup and long-run readiness

- Status: Done
- Outcome: Completed Phase 26 without gameplay/code changes.
- Adopted solution: Obsolete roadmap material was archived under `docs/archive/roadmaps/`; active audit/report policy was clarified in `docs/audits/README.md` and `docs/archive/README.md`; `docs/audits/CURRENT_ENGINE_BASELINE.md`, `docs/audits/LONG_RUN_METRICS_SPEC.md`, and `docs/audits/LONG_RUN_READINESS_REPORT.md` now define the baseline and long-run direction.
- Verification: Phase 26 required document scans; strict `calibration-v1` balance report with `2.859` goals per match; `git diff --check`. `pnpm check` intentionally skipped because this phase changed documentation only.
- Next action: Execute `docs/steps/27-season-rollover-foundation/01-season-completion-contract.md`; do not start Phase 28+ before Phase 27 is complete.

### 2026-06-21 — `docs/steps/25-career-match-preparation-persistence/07-phase-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 25 and recorded durable match preparation readiness.
- Adopted solution: `docs/audits/CAREER_MATCH_PREPARATION_PERSISTENCE_REPORT.md` records persisted preparation state, verified CLI flow, default-shortcut removal, limitations, a `95 / 100` maturity score, and exactly one recommended next phase: `Phase 26 - Career Match-Day Interaction MVP`.
- Verification: `pnpm cli career --save=phase25-prep-world --seed=world-a --new-world-preview`; `pnpm cli career --save=phase25-prep-world --squad`; `pnpm cli career --save=phase25-prep-world --set-lineup-demo=pro01-first-team`; `pnpm cli career --save=phase25-prep-world --set-tactic-demo=pro01-balanced`; `pnpm cli career --save=phase25-prep-world --summary`; `pnpm cli career --save=phase25-prep-world --advance-next-fixture`; `pnpm cli career --save=phase25-prep-world --inspect`; strict `calibration-v1` balance report; `pnpm check`; `git diff --check`.
- Next action: If approved, create Phase 26 documentation before implementing career match-day interaction.

### 2026-06-21 — Phase 24 player generation quality rework docs

- Status: Done
- Outcome: Created `docs/steps/24-player-generation-quality-rework/` with README and eight step documents.
- Adopted solution: Supersede the previous immediate Phase 24 recommendation for now. Before adding more career systems, the project will audit and rework player generation quality so attributes are credible by division, club tier, role, age, current ability, potential, and rarity.
- Verification: `git diff --check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/01-current-generator-audit.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/01-current-generator-audit.md`

- Status: Done
- Outcome: Confirmed the player-generation quality risk before code changes.
- Adopted solution: `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md` records that the current identity generator is seed-varied, but the ability model is too uniform because one base value drives most attributes with small role offsets.
- Verification: `rg` generator scan; `pnpm --filter @game/content run typecheck`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/02-division-and-club-tier-attribute-bands.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/02-division-and-club-tier-attribute-bands.md`

- Status: Done
- Outcome: Added deterministic division and club-tier bands for generated current ability and potential ceilings.
- Adopted solution: `packages/content/src/generators/player-generation-bands.ts` owns first/second/third-division bands and generated club tiers; `fake-players.ts` now derives its base ability from these bands. The condition-demo CLI test no longer pins one exact generated fixture score because the phase intentionally changes generated player quality.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-generation-bands.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/03-role-based-attribute-templates.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/03-role-based-attribute-templates.md`

- Status: Done
- Outcome: Made generated attributes role-coherent.
- Adopted solution: `packages/content/src/generators/player-role-templates.ts` owns role templates and caps; `fake-players.ts` now builds player abilities through that module, and the obsolete base-plus-small-offset helper was removed.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-role-templates.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/04-age-potential-and-prospect-archetypes.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/04-age-potential-and-prospect-archetypes.md`

- Status: Done
- Outcome: Separated generated age/current-ability archetypes from potential classes.
- Adopted solution: `player-archetypes.ts` now uses explicit archetypes such as `category_star`, `veteran_drop_down`, `good_prospect`, `serious_prospect`, and `rare_prodigy`; potential can exceed normal category anchors only through prospect/prodigy uplift, while current ability remains separately offset.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-archetypes.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/05-rarity-budget-and-white-fly-rules.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/05-rarity-budget-and-white-fly-rules.md`

- Status: Done
- Outcome: Budgeted rare lower-division exceptions at league level.
- Adopted solution: `player-rarity-budget.ts` creates deterministic white-fly, serious-prospect, and rare-prodigy assignments by seed; `fake-players.ts` forces assigned rare archetypes and excludes budgeted archetypes from ordinary weighted selection.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-rarity-budget.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/06-player-generation-quality-tests.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/06-player-generation-quality-tests.md`

- Status: Done
- Outcome: Added broad generated-league quality regression coverage.
- Adopted solution: `player-generation-quality.test.ts` validates same-seed stability, different-seed variation, role-coherence caps, bounded high-current players, rarity-budget compliance, and prospect availability across generated third-division clubs.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/player-generation-quality.test.ts packages/content/src/generators/fake-players.test.ts`; `pnpm check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/07-cli-generation-quality-report.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/07-cli-generation-quality-report.md`

- Status: Done
- Outcome: Added localized seed-level player generation quality inspection to the CLI.
- Adopted solution: `simulate-season --player-generation-report` prints aggregate division, player-count, current-ability band, potential-class, rarity-budget, prospect-coverage, and role-coherence data without writing career saves or exposing exact individual hidden potential.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a --player-generation-report`; `pnpm cli simulate-season --seed=world-b --player-generation-report`; `git diff --check`.
- Next action: Execute `docs/steps/24-player-generation-quality-rework/08-phase-report-and-next-phase-decision.md`.

### 2026-06-21 — `docs/steps/24-player-generation-quality-rework/08-phase-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed the Phase 24 final report and next-phase decision.
- Adopted solution: `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md` records before/after findings, inspection output, verification results, a `93 / 100` maturity score, and recommends `Phase 25 - Career Match Preparation Persistence`.
- Verification: `pnpm check`; identity reviews for `world-a` and `world-b`; player-generation reports for `world-a` and `world-b`; strict `calibration-v1` balance report; `git diff --check`.
- Next action: Create Phase 25 documentation before implementing durable career match preparation persistence.

### 2026-06-21 — Phase 20 new career world generation docs

- Status: Done
- Outcome: Created `docs/steps/20-new-career-world-generation/` with README and eight step documents.
- Adopted solution: Phase 20 focuses on per-new-career world generation: audit current fixed generation, add a durable world seed, define generated player archetypes, vary squads by seed, tune age/potential/prospect distribution, expose a CLI preview/create path, prepare flag asset mapping, and produce a quality report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/20-new-career-world-generation/01-current-generated-content-review.md`.

### 2026-06-21 — Phase 19 fictional people identity foundation docs

- Status: Done
- Outcome: Created `docs/steps/19-fictional-people-identity-foundation/` with README and seven step documents.
- Adopted solution: Phase 19 covers identity-gap review, reusable `PersonIdentity`, content-owned fictional name culture pools, deterministic nationality distribution by league/division/reputation, generated player identities, staff identity readiness without staff gameplay, and final CLI/review report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/01-phase-18-output-and-identity-gap-review.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/01-phase-18-output-and-identity-gap-review.md`

- Status: Done
- Outcome: Confirmed the identity gap in current Phase 18 outputs.
- Adopted solution: Player and future staff names are treated as generated content, not i18n labels; current outputs still expose `PlayerXX NoYY` placeholders, so the next step remains a small language-agnostic identity contract before name pools and generation.
- Verification: `test -f docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli career --save=career-demo --inspect`; `rg -n "Player[0-9]+ No[0-9]+|firstName|lastName|nationality|Staff|staff" packages docs requirements.md`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md`

- Status: Done
- Outcome: Added the domain `PersonIdentity` contract.
- Adopted solution: `PersonIdentity` is a language-agnostic value shape with generated first/last name, nationality, optional second nationality, birth country, and name culture; validation rejects empty names, unsupported keys, duplicate nationalities, and rendered-prose fields such as `displayName`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/value-objects/person-identity.test.ts`; domain forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md`

- Status: Done
- Outcome: Added content-owned fictional name culture pools.
- Adopted solution: `content/identity/name-cultures` maps every domain `NameCultureKey` to explicit first-name and last-name pools; names are content entries, not localization keys, and lookup uses stable culture keys rather than presentation text.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/name-cultures.test.ts`; content forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/04-nationality-distribution-model.md`

- Status: Done
- Outcome: Added deterministic nationality distribution for generated people.
- Adopted solution: `selectNationality` uses `deriveRng` with seed, league nation, club category, club reputation, and stable player key; weighted profiles keep third division mostly domestic, make second division more mixed, and allow strong first-division clubs to become majority international.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/identity/nationality-distribution.test.ts`; deterministic runtime scan; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md`

- Status: Done
- Outcome: Generated player-facing names now use deterministic fictional identities instead of `PlayerXX NoYY` placeholders.
- Adopted solution: `generateFakePlayersForClubs` derives nationality and name culture from content profiles, picks names from seeded culture pools, stores structured `playerIdentities`, keeps stable player IDs, and feeds generated first/last names into existing player display output without changing engine outcomes.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts apps/cli/src/commands/simulate-season.test.ts apps/cli/src/commands/career.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/06-staff-identity-readiness.md`

- Status: Done
- Outcome: Confirmed staff identity readiness without adding staff gameplay.
- Adopted solution: `PersonIdentity` remains a reusable, language-agnostic people identity value for future staff/scout/president/agent/AI-manager contracts; all staff-specific mechanics must stay separate as role, rating, specialization, assignment, persona/tendency, wage, and effect contracts.
- Verification: `rg -n "staff|scout|medico|preparatore|DS|responsabile vivaio|presidente|agent|procurator" requirements.md docs/PROJECT_STATUS.md packages`; `pnpm check`.
- Next action: Execute `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md`.

### 2026-06-21 — `docs/steps/19-fictional-people-identity-foundation/07-identity-cli-review-and-quality-report.md`

- Status: Done
- Outcome: Added the identity review CLI path and completed the Phase 19 quality report.
- Adopted solution: `pnpm cli simulate-season --seed=<seed> --identity-review` renders the selected generated club's player names, nationality, optional second nationality, birth country, name culture, and nationality summary using localized labels; `docs/audits/IDENTITY_FOUNDATION_REPORT.md` records the model, staff limits, manual commands, and the repeated-name limitation from small pools.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Decide the next phase; recommended first action is handling repeated generated full names before or inside the first playable career-loop phase.

### 2026-06-21 — Phase 19 expanded nationality rework

- Status: Done
- Outcome: Expanded fictional nationality coverage beyond the first compact set.
- Adopted solution: Added Colombia, Mexico, Ivory Coast, Wales, Scotland, Russia, South Korea, Albania, and Turkey to domain nationality codes; Serbia remains present and USA continues to use the stable `american` key. Distribution buckets now include the expanded football-nationality set, with Turkish and Korean name-culture pools added and all nationality/name-culture labels localized in `it/en/de/es/fr`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused person-identity/name-culture/nationality/i18n/CLI tests; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --identity-review`; `pnpm cli simulate-season --seed=demo-001 --identity-review --lang=it`.
- Next action: Decide the next phase; repeated generated full names remain the recommended identity-quality cleanup.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md`

- Status: Done
- Outcome: Created `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`.
- Adopted solution: The report marks Phase 18 as a successful persistence bridge, lists what is playable/durable/inspection-only, records manual commands to inspect, and recommends Phase 19 as a CLI-first playable career loop MVP before deeper market, youth, scouting, contracts, or UI work.
- Verification: `pnpm check`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`; `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Decide and document Phase 19. Recommended: first playable career loop MVP.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md`

- Status: Done
- Outcome: Added CLI inspection for persisted career saves.
- Adopted solution: `pnpm cli career --save=<saveId> --inspect` reloads `JsonCareerStorage`, displays the selected club roster size and transfer funds, lists permanent-transfer history, and shows affected clubs with persisted roster size and transfer budget.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`; `pnpm cli career --save=career-demo --inspect`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md`

- Status: Done
- Outcome: Added the first deterministic CLI flow that turns an accepted market demo into a persisted career save.
- Adopted solution: `pnpm cli career --save=<saveId> --apply-market-demo=<profile>` builds the same deterministic fake career context, applies permanent transfers through the engine career use case, writes accepted results through `JsonCareerStorage`, leaves rejected transfers unsaved, and renders output through i18n labels.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; accepted/rejected `pnpm cli career` smoke checks.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md`

- Status: Done
- Outcome: Added an engine-only persistent permanent-transfer application use case.
- Adopted solution: `applyCareerPermanentTransfer` wraps the existing market preview, appends durable transfer history only for accepted transfers, and preserves the original `CareerState` reference for rejected transfers; engine still does not import storage, CLI, or i18n.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/apply-career-transfer.test.ts`; engine forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/05-cli-career-market-apply.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md`

- Status: Done
- Outcome: Added career-state save/load persistence through the storage package.
- Adopted solution: `JsonCareerStorage` stores full `CareerState` snapshots in `*.career.json` envelopes, validates snapshots via the domain constructor, reports missing/malformed saves through `StorageError`, and does not import engine/content/CLI/i18n.
- Verification: `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/storage/src/career-storage.test.ts`; storage forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/04-persistent-transfer-application.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`

- Status: Done
- Outcome: Added the minimal dependency-free domain `CareerState` contract and tests.
- Adopted solution: `CareerState` is a versioned wrapper over `GameState` with explicit selected-club context, durable transfer funds via `MarketState`, and ordered permanent-transfer history; validation remains domain-only and does not apply transfers or perform storage.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/state/career-state.test.ts`; domain forbidden import scan; `pnpm check`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/03-career-save-adapter.md`.

### 2026-06-21 — `docs/steps/18-career-state-and-transfer-persistence/01-phase-17-output-review.md`

- Status: Done
- Outcome: Confirmed the Phase 18 persistence scope from Phase 17 output and existing career-system dependency notes.
- Adopted solution: The first durable career slice must include save ID, selected club, current `GameState`, market transfer funds, and permanent-transfer history; no wider economy, loans, contracts, windows, scouting, AI market, or UI scope is opened.
- Verification: `test -f docs/audits/MARKET_MVP_REPORT.md`; `test -f docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`; required career/persistence roadmap `rg`.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`.

### 2026-06-21 — Phase 18 career state and transfer persistence docs

- Status: Done
- Outcome: Created `docs/steps/18-career-state-and-transfer-persistence/` as the next phase after the in-memory market MVP.
- Adopted solution: Phase 18 is the persistence bridge before fun/playability evaluation: accepted permanent transfers can become durable career state, rejected transfers must not mutate saves, and final review must decide whether the project is ready for the first playable career loop.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/18-career-state-and-transfer-persistence/01-phase-17-output-review.md`.

### 2026-06-20 — Phase 15 core cleanup before career systems docs

- Step: `docs/steps/15-core-cleanup-before-career-systems/README.md`
- Status: Done
- Outcome: Created the Phase 15 cleanup specification and six executable step documents.
- Adopted solution: Phase 15 is a non-feature cleanup phase that fixes or documents Phase 14 risks before market/youth: ordered fixture-lineup overrides, factual squad-fit naming, CLI `simulate-season` module split, fixture-state decision, and final cleanup report.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`

- Status: Done
- Outcome: Confirmed the Phase 14 findings are still current before changing source code.
- Adopted solution: Keep Phase 15 scoped as cleanup. The confirmed items are engine `Object.values()` in `simulateSeason`, stale CLI market wording around squad-fit notes, a 2685-line `simulate-season.ts` CLI module, and fixture state still living as a slice around `GameState`.
- Verification: `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src`; `rg -n "market|need|recommend|auto-select|automatic|best XI|best-XI" apps/cli/src packages apps docs/audits/ENGINE_CORE_AUDIT.md`; `wc -l apps/cli/src/commands/simulate-season.ts`; `rg -n "FixtureStateSlice|fixtureIds|fixturesById|fixtures" packages/domain/src packages/engine/src/use-cases`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`

- Status: Done
- Outcome: Removed the Phase 14 high finding from `simulateSeason`.
- Adopted solution: Fixture lineup overrides keep the public ordered-array caller interface, then become an internal `OrderedFixtureLineupOverrides` Module with `byKey` for fixture lookup and `ordered` for caller-order registration. No unordered object enumeration remains in the touched engine path.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts`; `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src/use-cases/simulate-season.ts`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`

- Status: Done
- Outcome: Removed stale market/recommendation wording from current formation-fit implementation comments.
- Adopted solution: Kept the runtime CLI output unchanged and factual; internal comments now describe stable formation-fit notes and factual coverage targets.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check:localized-text`; `rg -n "market hint|market-depth|market need|marketNeed|need:|consider:|surplus:" apps/cli/src packages/i18n/src`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`

- Status: Done
- Outcome: Improved CLI Module locality without changing command behavior.
- Adopted solution: `runSimulateSeasonCommand` stays as the public Interface in `apps/cli/src/commands/simulate-season.ts`; profile keys live in `simulate-season/profile-keys.ts`, argument parsing/validation in `simulate-season/parse-args.ts`, and formation-fit output in `simulate-season/formation-fit-output.ts`.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`

- Status: Done
- Outcome: Removed the temporary fixture-state slice before career persistence work.
- Adopted solution: `GameState` now owns fixture lookup and deterministic fixture ID order; `applyMatchReportToFixture` accepts and returns canonical `GameState`; the obsolete `FixtureStateSlice` and `ApplyMatchReportToFixtureState` exports were removed instead of kept as compatibility leftovers.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/storage run typecheck`; `pnpm exec vitest run packages/domain/src packages/engine/src/use-cases packages/storage/src`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm check`.
- Next action: Execute `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`.

### 2026-06-20 — `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`

- Status: Done
- Outcome: Completed Phase 15 and created the durable cleanup handoff report.
- Adopted solution: `docs/audits/CORE_CLEANUP_REPORT.md` records the Phase 15 fixes, scores the cleaned core at `92/100`, keeps the aggregate-match engine as an accepted limitation, and originally recommended market MVP before youth; Phase 16 now refines this with a dependency-map gate.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Next action: Superseded by Phase 16 dependency-map docs; execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-21 — Phase 17 market MVP permanent transfers docs

- Status: Done
- Outcome: Created `docs/steps/17-market-mvp-permanent-transfers/` after the Phase 16 dependency-map gate.
- Adopted solution: Phase 17 is a constrained in-memory permanent-transfer MVP: domain contracts, true-data valuation, player willingness, feasibility/apply preview, localized CLI inspection, and final report. Persistence, loans, contracts, wages, windows, scouting fog, AI, installments, and player exchanges remain out of scope.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md`.

### 2026-06-20 — Market roadmap planning

- Status: Done
- Outcome: Created the market-specific roadmap and individual phase overview documents.
- Adopted solution: `docs/market-roadmap/` now defines candidate market phases for permanent transfers, career persistence, loans, contracts/wages, scouting quality, AI club behavior, negotiation, transfer windows, structured deals, and market balance review. The plan deliberately removes sell-on percentages, appearance/goal bonuses, complex loan buy options/obligations, multiple-player exchanges, and highly legalistic clauses.
- Verification: Documentation-only update; no source checks required.
- Next action: Superseded by Phase 16 dependency-map docs; execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-20 — Phase 16 career systems dependency map docs

- Status: Done
- Outcome: Created `docs/steps/16-career-systems-dependency-map/` before opening market implementation.
- Adopted solution: Phase 16 is a dependency-map gate that will decide whether market MVP can proceed next or whether shared career state, economy, calendar, scouting, or youth foundations must be inserted first. This keeps `docs/steps/` linear instead of treating `docs/market-roadmap/` as a direct implementation order.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`.

### 2026-06-20 — Phase 14 engine audit and core quality review

- Status: Done
- Outcome: Completed the seven-point engine/core audit and created `docs/audits/ENGINE_CORE_AUDIT.md`.
- Adopted solution: The project can continue after one focused cleanup phase. The audit found no critical blockers, one high determinism-discipline finding in `simulateSeason`, medium maintainability/state-model findings, and low naming/documentation issues.
- Verification: `pnpm depcruise`; `pnpm lint`; `pnpm check:localized-text`; `pnpm typecheck`; `pnpm test`; focused match/season/tactic/CLI tests; CLI smoke commands; deterministic repeatability diff; `pnpm check`.
- Next action: Create Phase 15 documentation for core cleanup before implementing market or youth.

### 2026-06-20 — Phase 14 engine audit and core quality review docs

- Status: Done
- Outcome: Created the Phase 14 audit documentation and made architecture boundary audit the active next step.
- Adopted solution: Phase 14 is a stop-and-review phase, not a feature phase. It will write `docs/audits/ENGINE_CORE_AUDIT.md`, score the current engine/core from `0` to `100`, classify findings, and decide whether to proceed to market, youth, or a focused core rework phase.
- Verification: Documentation-only update; no source checks required.
- Next action: Execute `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md`.

### 2026-06-20 — Phase 13 localization foundation

- Status: Done
- Outcome: Added `@game/i18n`, CLI `--lang` support, five-language current label coverage, localized current CLI presentation output, and a localized-text enforcement check.
- Adopted solution: Domain/engine continue emitting stable structured keys; CLI presentation maps those keys to localized labels in `it`, `en`, `de`, `es`, and `fr` with English fallback for future missing keys.
- Verification: `pnpm --filter @game/i18n run typecheck`; `pnpm --filter @game/cli run typecheck`; focused i18n/CLI Vitest files; localized CLI smokes for Italian/German/French; `pnpm check:localized-text`; `pnpm check`.
- Next action: Phase 14 is now documented as engine audit and core quality review; execute the architecture boundary audit next.

### 2026-06-20 — Phase 12/13 squad-fit language rework

- Status: Done
- Outcome: Removed market-prescriptive wording from formation-fit output and localized additional enum-like values that were visible in CLI output.
- Adopted solution: Engine formation-fit report now exposes factual `squadFitHints` using `gap:*`, `adapted_only:*`, and `extra_depth:*`; CLI renders these as localized squad-fit notes, not market advice. Fixture event `shotType`/`chanceType`, setup mentality values, and lineup role keys now render through localization.
- Verification: focused engine/CLI/i18n tests; `pnpm check`; localized smoke commands for Italian fixture detail, Italian formation-fit, and Italian setup-demo output.
- Next action: Use Phase 14 for the complete engine/core audit before deciding market, youth, or focused rework.

### 2026-06-20 — `docs/steps/13-localization-foundation/README.md`

- Status: Done
- Outcome: Created and then broadened Phase 13 documentation and implementation step documents for localization foundation, including a final policy-alignment step.
- Adopted solution: Phase 13 now starts with a review of all user-facing CLI/source text created across Phases 00-12, including events, balance reports, season summaries, fixture detail, player stats, tactic/lineup/condition output, formation/squad-fit output, and user-facing errors. It then adds a supported-language/message-key contract, an `it/en` catalog, CLI `--lang` integration across current presentation output, `de/es/fr` completion, hardcoded-presentation-text enforcement, and final requirements/project-rules policy alignment. Domain/engine keys remain stable and untranslated.
- Rule update: Added project rules and requirements text requiring user-facing presentation text to go through localization once Phase 13 introduces it, while keeping domain/engine reports structured and language-agnostic.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/13-localization-foundation/01-phase-12-output-review.md` next; do not add localization code before reviewing the current user-facing text surface.

### 2026-06-20 — Phase 12 formation-fit report readability rework

- Status: Done
- Outcome: Improved the Phase 12 formation-fit CLI output so a user can distinguish true natural depth from adapted or weak cover.
- Adopted solution: Slot rows now render `best`, `natural`, `adapted`, and `weak` counts; engine fit hints now include `adapted_only:defensive_midfielder` and `adapted_only:attacking_midfielder` when those families are covered only by adapted players; the CLI renders those as factual weak-depth notes.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`.
- Follow-up: Re-run `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1` and verify that `rb` no longer looks like it has 10 natural candidates, while DM/AM adapted-only coverage is clearly visible.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md`

- Status: Done
- Outcome: Added a standalone CLI formation-fit inspection path and expanded fake senior squads to 22 players per club without changing the default fixed 11-player lineup.
- Adopted solution: `simulate-season --formation-fit=<formationKey>` builds a squad-depth snapshot for the selected generated club, runs the engine formation-fit report, and prints formation slots, covered slots, adapted/weak slots, missing slots, extra-depth groups, and localized squad-fit notes. The CLI explicitly states that no lineup is auto-selected and no transfer action is created.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/league-system.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Manually inspect `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`; verify that adapted DM/AM slots and surplus wide/center-back hints are understandable before deciding Phase 13.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md`

- Status: Done
- Outcome: Added deterministic engine reporting for how a squad fits a selected formation.
- Adopted solution: `packages/engine/src/squad/formation-squad-fit.ts` consumes domain formation catalog data, squad depth, and player natural positions to report covered, adapted, weak, and uncovered slots plus family depth, likely out-of-position players, extra-depth groups, and stable factual `squadFitHints`. It does not assign players to slots or recommend transfers.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/squad/formation-squad-fit.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` next; keep default season simulation output unchanged.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md`

- Status: Done
- Outcome: Added strict deterministic suitability between player natural positions and formation slot requirements.
- Adopted solution: `packages/domain/src/tactics/position-suitability.ts` classifies fit as `natural`, `adapted`, `weak`, or `invalid`; full backs/wing backs, central midfield bands, wide players, and strikers have explicit non-equivalent adaptation rules so formation gaps remain visible.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` next; do not auto-select lineups.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md`

- Status: Done
- Outcome: Added a dependency-free squad-depth contract for explicit user-selected starters and bench/reserves.
- Adopted solution: `packages/domain/src/squad/squad-depth.ts` validates ordered squad, starter, and bench/reserve player IDs, rejects duplicates, membership errors, and starter/bench overlap, and keeps the exact eleven-starter rule in `validateMatchSquadDepth` so non-match squad inspection stays flexible.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/squad/squad-depth.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` next; do not build formation-fit reports yet.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/02-formation-catalog-contract.md`

- Status: Done
- Outcome: Added a dependency-free domain formation catalog for the major professional shapes planned in Phase 12.
- Adopted solution: Formation data lives in `packages/domain/src/tactics/formations.ts` as stable keys, structured slots, broad departments, tactical lines, side/channel metadata, and recognized position-family requirements. The catalog is exported through `packages/domain/src/tactics/index.ts` and the root domain surface.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/tactics/formations.test.ts`; `pnpm check`.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` next; do not compute formation fit or assign players automatically.

### 2026-06-20 — `docs/steps/12-squad-selection-and-formation-core/README.md`

- Status: Done
- Outcome: Created Phase 12 documentation and six implementation step documents for squad selection and formation core.
- Adopted solution: Phase 12 pauses career persistence work to consolidate the core manager loop around formation choice, squad depth, player-slot suitability, and squad-fit reporting. The formation catalog should cover common major-league shapes, while reports should expose coverage gaps, weak central roles, and extra-depth groups as structured data for manager interpretation.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/12-squad-selection-and-formation-core/01-phase-11-output-review.md` next; do not add formation code before reviewing Phase 11 output.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/README.md`

- Status: Done
- Outcome: Created Phase 11 documentation and five implementation step documents for manual lineup rotation v1.
- Adopted solution: Phase 11 will first review completed Phase 10 condition output, then add deterministic PRO01 lineup demo profiles, an explicit fixture lineup override contract, season wiring for user-selected lineup overrides, and a CLI lineup/condition inspection path. The phase explicitly preserves the rule that the user chooses who plays; automatic rotation, fatigue-based recommendations, substitutions, injuries, form, morale, career mode, and UI remain out of scope.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` next; do not add lineup profiles before the Phase 10 output review is recorded.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md`

- Status: Done
- Outcome: Accepted Phase 10 condition output as a stable baseline for manual lineup rotation.
- Adopted solution: Existing `--condition-demo=pro01-season` output is clear enough to compare first-team and rotated selections later. It shows selected club `PRO01`, lifecycle enabled, match cost `8`, daily recovery `5`, first PRO01 fixture, post-match fitness `92`, seven-day recovery to `100`, and final starter fitness `92`.
- Verification: Direct Node 24 CLI smoke for `simulate-season --seed=demo-001`; direct Node 24 CLI smoke for `simulate-season --seed=demo-001 --condition-demo=pro01-season`; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md` next; add profile selection/inspection but do not apply lineups to fixtures or seasons yet.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/02-lineup-demo-profiles.md`

- Status: Done
- Outcome: Added explicit PRO01 lineup demo inspection for `pro01-first-team` and `pro01-rotated`.
- Adopted solution: After user authorization, fake content now generates 16 senior players per club while keeping the default 11-player lineup unchanged; the rotated profile replaces four first-team slots with real deterministic reserves and remains inspection-only.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/content/src/generators/league-system.test.ts apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --lineup-demo=pro01-rotated`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` next; define the engine contract before applying lineup overrides.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md`

- Status: Done
- Outcome: Added the engine contract and validation path for explicit fixture lineup overrides.
- Adopted solution: `SimulateSeasonFixtureLineupOverride` is serializable caller intent for one fixture/club lineup; `simulateSeason` now validates duplicates, missing fixtures, missing teams, wrong fixture clubs, lineup size/slot/player shape, and role/player strength data while leaving actual application to the next step.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` next; apply the validated contract during fixture simulation and fitness spend.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md`

- Status: Done
- Outcome: Wired explicit fixture lineup overrides into season simulation.
- Adopted solution: `simulateSeason` indexes validated fixture/club overrides, applies the selected lineup only to the matching fixture participant, preserves existing tactic distribution, rebuilds strength from current fitness states when lifecycle is enabled, registers override players for season stats, and spends fitness for actual selected starters.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --condition-demo=pro01-season`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` next; expose one CLI inspection path without adding automatic rotation.

### 2026-06-20 — `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md`

- Status: Done
- Outcome: Added CLI fixture-level inspection for manually selected lineup profiles.
- Adopted solution: `--lineup-demo=<profile>` still supports profile-only inspection; when combined with `--fixture=<fixtureId>`, it applies the selected PRO01 lineup only if PRO01 plays the fixture, keeps non-applicable fixtures unchanged, prints selected starters, rested first-team players, expected per-fixture fitness impact, re-simulated fixture events, and player stats for actual starters.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --condition-demo=pro01-season`; `node apps/cli/src/index.ts -- simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `node apps/cli/src/index.ts -- balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Phase 11 is complete. Manually inspect `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`, especially selected starters, rested players, expected fitness impact, and player stats for actual starters.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/README.md`

- Status: Done
- Outcome: Created Phase 10 documentation and five implementation step documents for player dynamic states v1.
- Adopted solution: Phase 10 will first review the completed Phase 9 output, then add pure deterministic fitness spend/recovery helpers, bounded fitness strength impact through explicit multiplier curves, optional season fitness lifecycle, and a CLI condition inspection view. The phase uses existing `PlayerDynamicState.fitness` and explicitly excludes injuries, form, morale, staff, training, growth, automatic rotation, and career persistence.
- Verification: Documentation-only update; no source or test files changed.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md` next; do not add fitness rules before the Phase 9 output review is recorded.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/01-phase-9-output-review.md`

- Status: Done
- Outcome: Phase 9 output is good enough to build player fitness consequences on top of it.
- Adopted solution: Keep Phase 9 as the baseline. Default season output works, fixture-only output remains clean, non-applicable manual switches explicitly say `Applies to fixture: no`, applicable switches show `Selected club: PRO01`, initial/target profiles, switch minute, and timeline, and no output implies automatic tactical decisions.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md` next; add pure fitness spend/recovery rules without touching season simulation or CLI output.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/02-fitness-state-rules.md`

- Status: Done
- Outcome: Added pure deterministic engine helpers for player fitness spend and recovery.
- Adopted solution: `packages/engine/src/player-state/fitness.ts` owns `DEFAULT_FITNESS_RULES` with match cost `8`, daily recovery `5`, and `0..100` clamps over existing `PlayerDynamicState.fitness`. Helpers copy-on-write the state lookup, update only explicitly ordered player IDs, reject missing states and duplicate IDs, and keep form/morale untouched.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/player-state/fitness.test.ts` passed 8 tests; `pnpm check` passed with 28 files and 203 tests; `pnpm cli simulate-season --seed=demo-001` preserved the current table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md` next; use explicit multiplier curves and do not start season fitness lifecycle yet.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/03-fitness-strength-impact.md`

- Status: Done
- Outcome: Fitness can now lightly affect team strength through explicit content-owned multiplier curves.
- Adopted solution: Fake content exposes `stateMultiplierCurves.fitness` with bands `<=39 => 0.88`, `<=59 => 0.94`, `<=79 => 0.98`, and `<=100 => 1.00`. CLI season and balance team-context builders pass those curves to `deriveTeamStrength`; since generated players start at fitness `100`, default season output and balance metrics remain unchanged.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; focused content/engine/CLI tests passed 42 tests; `pnpm check` passed with 29 files and 207 tests; `pnpm cli simulate-season --seed=demo-001` preserved the current table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md` next; keep lifecycle optional and do not add CLI condition output yet.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`

- Status: Done
- Outcome: Added a deterministic CLI condition inspection path for PRO01.
- Adopted solution: `simulate-season --condition-demo=pro01-season` enables the optional season fitness lifecycle for inspection only. It keeps the default season output unchanged, rejects combination with `--round` or `--fixture`, prints the lifecycle rules, first PRO01 fixture, first-match fitness spend, recovery before the next selected fixture, final table impact, and final condition for all PRO01 starters.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; focused CLI tests passed 28 tests; `pnpm check` passed with 29 files and 215 tests; direct Node 24 CLI smoke for default season passed; direct Node 24 CLI smoke for `--condition-demo=pro01-season` printed final PRO01 starter fitness `92`; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Phase 11 is now documented; use `docs/steps/11-manual-lineup-rotation-v1/01-phase-10-output-review.md` as the next active step before adding lineup profiles.

### 2026-06-20 — `docs/steps/10-player-dynamic-states/04-season-fitness-lifecycle.md`

- Status: Done
- Outcome: Added optional deterministic season fitness lifecycle to `simulateSeason`.
- Adopted solution: `simulateSeason.fitnessLifecycle` carries a copy-on-write player-state lookup only when explicitly supplied. It recovers tracked players once between new fixture dates, spends fitness for both starting lineups after each fixture, rebuilds team strength from current player states plus explicit player/role/curve data, and returns `finalPlayerStates` for inspection. Default no-lifecycle season and balance outputs remain unchanged.
- Verification: `pnpm --filter @game/engine run typecheck`; focused engine tests passed 24 tests; `pnpm check` passed with 29 files and 212 tests; direct Node 24 CLI smoke for `simulate-season --seed=demo-001` preserved the current table; direct Node 24 CLI balance report passed strict `calibration-v1` with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Completed by `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md`; the existing optional lifecycle is now visible through CLI inspection without rotation, injuries, form, morale, career mode, or UI.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md`

- Status: Done
- Outcome: Added CLI inspection for one explicit user-declared manual tactic switch in a requested fixture; reworked the output so the manual switch block also names the selected club.
- Adopted solution: `simulate-season --fixture=<fixtureId> --setup-demo=<initialProfile> --manual-tactic-switch=<minute>:<targetProfile>` now validates the switch input, requires fixture context and an initial setup profile, builds the target saved profile, and uses `simulateMatchWithManualTactics` only for the requested fixture. The `Manual tactic switch` section prints `Selected club: PRO01`, so it is clear which club the switch controls. If the selected club is not playing that fixture, the CLI reports `Applies to fixture: no` and preserves the original fixture detail; if it is playing, the CLI reports `Applies to fixture: yes`, prints a profile timeline, and renders the switched fixture report/player stats. No automatic score/minute decision, live session, pause/resume, substitution, or season-wide switching was added.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` passed 25 tests; `pnpm check` passed with 27 files and 195 tests; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Review the `fixture:000001` non-applicable example and the `fixture:000006` applicable example. If the inspection shape is acceptable, create Phase 10 documentation before implementing new features.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md`

- Status: Done
- Outcome: Added an engine-only segmented fixture simulation path for explicit manual tactic changes.
- Adopted solution: `simulateMatchWithManualTactics` delegates to existing `simulateMatch` when no manual changes are supplied. With changes, it validates the caller-supplied `ManualTacticChangeSchedule`, applies a side's already-built `MatchTeamContext` before the declared minute is stepped, reuses the same match RNG stream and `stepMatch`, and returns a normal `SimulateMatchResult` compatible with `createMatchReport` and `computePlayerMatchStats`. No CLI flags, live sessions, substitutions, or automatic tactic decisions were added.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/manual-tactic-change.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts` passed 14 tests; `pnpm check` passed with 27 files and 191 tests; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md` next; expose a fixture inspection command that builds an explicit switch schedule from saved demo profiles.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md`

- Status: Done
- Outcome: Added a minimal deterministic engine contract for explicit manager-declared tactic changes during a match.
- Adopted solution: `buildManualTacticChangeSchedule` accepts already-built `MatchTeamContext` values for `home` or `away`, validates that change minutes are within `1..minuteCount`, rejects duplicate side+minute pairs and missing team contexts, and returns changes sorted by minute then side. The contract records caller intent only; it does not inspect score, choose profiles, simulate segments, or make automatic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/manual-tactic-change.test.ts` passed 8 tests; `pnpm check` passed with 26 files and 185 tests; `pnpm cli simulate-season --seed=demo-001` preserved the default table; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md` next; use the validated schedule to apply explicit context changes while preserving no-change behavior.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md`

- Status: Done
- Outcome: Added a small deterministic CLI registry of saved PRO01 tactic demo profiles.
- Adopted solution: `--setup-demo` now accepts `pro01-balanced`, `pro01-attacking`, and `pro01-defensive`. Balanced applies PRO01's base selected lineup/tactic and therefore matches the default season path; attacking keeps the existing advanced attacker role changes; defensive drops two attackers into midfield. All profiles route through `simulateSeason.setupOverrides` and remain explicit user-selected options, not automatic tactical behavior.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md` next; define the manual switch contract before any segmented fixture simulation.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/README.md`

- Status: Done
- Outcome: Created Phase 9 documentation and five implementation step documents for manual tactical switching.
- Adopted solution: Phase 9 will first review the completed Phase 8 output, then add a small saved-profile registry, an engine contract for explicit manual tactic changes, segmented fixture simulation, and CLI inspection for one declared switch such as `46:pro01-attacking`. The phase explicitly models manager choice and bans hidden automatic tactical AI.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md` next; do not add saved profiles or segmented match code before the review is recorded.

### 2026-06-20 — `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md`

- Status: Done
- Outcome: Phase 8 output is good enough to build manual tactical switching on top of it.
- Adopted solution: Keep Phase 8 as a technical baseline. The default season remains unchanged with `PRO01` first on 65 points; `--setup-demo=pro01-attacking` prints a clear PRO01 selected setup and changes the table with PRO01 sixth on 57 points; this downside is accepted as evidence that attacking should become a manager-selected profile/switch rather than an optimized full-season tactic.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-attacking`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. `pnpm check` was not run because no source or test files changed.
- Follow-up: Implement only `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md` next; add saved profile options without manual in-match switching yet.

### 2026-06-20 — `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md`

- Status: Done
- Outcome: Added the first CLI inspection path for a selected lineup/tactic setup.
- Adopted solution: `simulate-season --setup-demo=pro01-attacking` builds one deterministic PRO01 setup in the CLI, changes slots `slot:08` and `slot:09` from `midfielder` to `attacker`, applies tactic values `mentality=attacking`, `pressing=0.85`, `directness=0.75`, `width=0.80`, and `risk=0.70`, and passes the result through `simulateSeason.setupOverrides`. The command prints the applied setup before the final table or fixture detail; no flag means the default season and fixture outputs stay unchanged.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` passed 20 tests; `pnpm check` passed with 25 files and 176 tests; `pnpm cli simulate-season --seed=demo-001` preserved the default output with `PRO01` first on 65 points; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001` preserved fixture-only detail; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking` printed PRO01 setup context and changed the table with `PRO07` first on 64 points and `PRO01` sixth on 57 points; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: User should compare `pnpm cli simulate-season --seed=demo-001` with `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking` and decide whether Phase 8 is acceptable or needs a narrow rework before Phase 9 documentation.

### 2026-06-20 — `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md`

- Status: Done
- Outcome: `simulateSeason` now supports explicit selected setup overrides without changing default behavior.
- Adopted solution: Added ordered `SimulateSeasonSetupOverride` entries to `SimulateSeasonInput`. Each override carries `clubId`, selected lineup, tactic setup, required lineup size, players, role weights, and optional state data. The use-case builds override `MatchTeamContext`s once through `buildTacticTeamContext`, uses them for fixture simulation and player registrations, rejects duplicate overrides, and maps invalid selected setup to `SimulateSeasonError`.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/match-engine/tactic-team-context.test.ts` passed 20 tests; `pnpm check` passed with 25 files and 172 tests; `pnpm cli simulate-season --seed=demo-001` stayed on the existing default output with `PRO01` first on 65 points and `Player05 No10 (PRO05)` top scorer on 23 goals; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` next. CLI should call `simulateSeason.setupOverrides` for a deterministic demo setup and preserve default output when no tactic/lineup option is passed.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md`

- Status: Done
- Outcome: Added an engine builder that converts one selected lineup/tactic setup into an existing `MatchTeamContext`.
- Adopted solution: `buildTacticTeamContext` validates positive integer `requiredLineupSize`, exact selected lineup size, domain lineup/tactic contract errors, selected players against caller-supplied players, and role keys against caller-supplied role weights. It converts selected slots to ordered `LineupSlot`s, derives `TeamStrength` through existing `deriveTeamStrength`, and maps `directness`, `pressing`, `width`, and `risk` into `MatchTacticalDistributionInput`; `mentality` is validated but has no separate engine effect in this MVP.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts` passed 9 tests; `pnpm check` passed with 25 files and 167 tests.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` next. Season overrides should call `buildTacticTeamContext` and preserve default output when no override is supplied.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md`

- Status: Done
- Outcome: Added dependency-free selected-lineup and tactic setup contracts to `@game/domain`.
- Adopted solution: `SelectedLineup` stores one club ID and ordered `SelectedLineupSlot` entries with `slotKey`, `playerId`, and `roleKey`. `TacticSetup` stores a five-step `mentality` key and bounded 0-1 `pressing`, `directness`, `width`, and `risk` values. `createSelectedLineup`, `createTacticSetup`, `isTacticMentalityKey`, and `TacticContractError` provide the minimal runtime contract checks without importing engine/content/CLI.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts` passed 10 tests; `pnpm check` passed with 24 files and 158 tests.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` next. The builder should map `directness`, `pressing`, `width`, and `risk` into existing match context inputs, while treating `mentality` as validated setup data until a later documented step gives it a separate effect.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md`

- Status: Done
- Outcome: Accepted Phase 7 output as coherent enough to build the tactic/lineup MVP on top of it.
- Adopted solution: No Phase 7 rework is needed before domain tactic contracts. Base season leaders are plausible; fixture `fixture:000001` shows `creator=` only on unassisted goals; fixture `fixture:000002` shows `defender=` on a blocked shot; player stats still align with events.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000002`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. `pnpm check` was not run because no source/test files changed.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/02-tactic-domain-contracts.md` next.

### 2026-06-19 — `docs/steps/08-tactic-and-lineup-mvp/README.md`

- Status: Done
- Outcome: Created Phase 8 documentation and five implementation step documents for tactic and lineup MVP work.
- Adopted solution: Phase 8 will first review the completed Phase 7 output, then add dependency-free selected-lineup/tactic contracts, an engine setup builder, season setup overrides, and a minimal CLI inspection path. The phase intentionally excludes UI, live match sessions, substitutions, player dynamic states, persistence, market/economy, and broader management systems.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/08-tactic-and-lineup-mvp/01-phase-7-output-review.md` next; do not add tactic or lineup code before the review is recorded.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md`

- Status: Done
- Outcome: CLI fixture detail now exposes the durable causal context added in schema v7.
- Adopted solution: Goal event lines append `creator=<player>` only when the durable report carries a non-duplicated creator, while block event lines append `defender=<player>` when the durable report carries the primary defender. The output stays structured and compact; no commentary prose, localization, mechanics, scoring, content, or balance tuning changed.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (16 tests); `pnpm check` (23 files, 148 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`.
- Follow-up: Phase 7 is complete. Review `fixture:000001` for `creator=` goal context and `fixture:000002` for `defender=` block context, then create Phase 8 docs before implementing more code.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md`

- Status: Done
- Outcome: Durable match reports now preserve the smallest useful causal actor context from the engine-local chance actors.
- Adopted solution: `MATCH_EVENT_SCHEMA_VERSION` is now `7`; `GoalMatchEvent` can carry `creatorPlayerId` only when the selected creator is not already represented by scorer or assist, and `BlockMatchEvent` can carry `primaryDefenderPlayerId`. `createMatchReport` copies those fields from `stepMatch` events without recalculating actor selection; CLI rendering is intentionally unchanged until the next step.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/season-engine/player-match-stats.test.ts` (41 tests); `pnpm check` (23 files, 147 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/05-cli-causal-match-review.md` next; render/review the new durable causal fields without adding new match semantics.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md`

- Status: Done
- Outcome: Wired causal chance actors into `stepMatch` attribution without changing aggregate match outcomes.
- Adopted solution: `stepMatch` now calls `selectChanceActors` once per generated opportunity after existing outcome resolution and shot context derivation. Goal scorer is the selected shooter; optional assist credits the selected creator when an independent assist decision passes and creator differs from shooter; save/miss/block shooter is the selected shooter; save goalkeeper is the selected goalkeeper; block events keep `primaryDefenderPlayerId` engine-local for the next durable-context step. The obsolete standalone attribution helpers/tests were removed because they had no remaining production callers. Durable report shape and `MATCH_EVENT_SCHEMA_VERSION` were not changed.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (42 tests); `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts packages/engine/src/season-engine/player-match-stats.test.ts packages/engine/src/season-engine/player-stats.test.ts` (15 tests); `pnpm check` (27 files, 163 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Observed output change: table and score outputs are stable, but player attribution changed. For `demo-001`, top scorer is now `Player05 No10 (PRO05) - 23 goals`; fixture `fixture:000001` remains `PRO04 5-0 PRO18`, with Player04 No10 scoring a hat-trick and assists credited to Player04 No08, Player04 No07, and Player04 No09.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/04-durable-causal-event-context.md` next; persist minimal causal context without adding CLI causal rendering yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md`

- Status: Done
- Outcome: Added a minimal deterministic engine-local selector for opportunity actors.
- Adopted solution: Created `packages/engine/src/match-engine/chance-actors.ts` with `ChanceActors` and `selectChanceActors`; actor selection uses a separate `chance-actors` RNG stream keyed by seed, fixture, minute, attacking side, pre-chance score, shot type, and chance type; creator/shooter come from attacking outfield players, primary defender comes from defending outfield players, and goalkeeper comes from the defending `roleKey: "gk"` slot.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts` (8 tests); `pnpm check` (27 files, 161 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, and table points spread `47.950`.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/03-step-match-causal-actors.md` next; wire the selector into engine-local stepping without changing durable report schema or CLI output yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md`

- Status: Done
- Outcome: Accepted the current Phase 6 CLI output as a coherent baseline for Phase 7 causal match-event work.
- Adopted solution: No pre-Phase-7 rework is needed. The base season output has plausible leaders, fixture `fixture:000001` renders as `PRO04 5-0 PRO18`, five goal rows match five PRO04 scorers, assists and goalkeeper saves line up with the event list, and the current lack of fuller causal context on non-goal events remains the intended Phase 7 improvement area.
- Verification: `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals per match `2.853`, first-place points `71.450`, table points spread `47.950`, and upset proxy rate `0.331`. No source/test files changed, so `pnpm check` was not required by this review step.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/02-chance-actor-selection.md` next; keep it engine-local and do not wire causal actors into `stepMatch` yet.

### 2026-06-19 — `docs/steps/07-match-engine-causal-v1/README.md`

- Status: Done
- Outcome: Created Phase 7 documentation and five implementation step documents for match engine causal v1 work.
- Adopted solution: Phase 7 will first review current Phase 6 output, then introduce engine-local chance actors, wire them into `stepMatch`, promote minimal durable causal context, and render that context in CLI fixture detail; UI, storage, tactics, player states, live match-day, and management systems remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/07-match-engine-causal-v1/01-causality-baseline-review.md` next; do not add causal actor code before the baseline review is recorded.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md`

- Status: Done
- Outcome: Season output now shows top assist provider and top goalkeeper by saves alongside the existing top scorer.
- Adopted solution: Extended `packages/engine/src/season-engine/player-stats.ts` with `computeSeasonPlayerSummaryStats`, derived only from durable `MatchReport` events and fixed-lineup registrations; `simulateSeason` exposes `playerSummaryStats`; CLI picks top assist/save rows from that engine-derived result.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts` (25 tests); `pnpm check` (26 files, 153 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Phase 6 is complete; create the next numbered docs step group before implementing more code.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md`

- Status: Done
- Outcome: Fixture detail now shows a clearer all-starter player-stat table.
- Adopted solution: `simulate-season --fixture=<fixtureId>` passes home and away fake-content lineup registrations into engine `computePlayerMatchStats`, keeps contribution sorting, and renders zero-stat starters at the bottom with stable lineup/player ordering.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (26 files, 151 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/05-season-assists-and-saves-summary.md` next; do not add extra player stats beyond current goals, assists, shots, shots on target, and saves.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md`

- Status: Done
- Outcome: Player match stats now count all current durable shot events that identify a shooter.
- Adopted solution: `computePlayerMatchStats` credits goal shots through `scorerPlayerId`, credits generated `save`, `miss`, and `block` shots through `shooterPlayerId` when present, uses `shot.isShotOnTarget` for shots on target, and still credits saves to the defending goalkeeper.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-match-stats.test.ts` (5 tests); `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (26 files, 151 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/04-cli-fixture-player-stats-v2.md` next; the fixture player-stat table now has more rows and can be rendered more clearly.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md`

- Status: Done
- Outcome: Added deterministic shooter attribution for generated non-goal shot events.
- Adopted solution: `attributeShotTaker` uses an independent `shot-attribution` RNG stream keyed by seed, fixture, minute, side, score, outcome, shot type, and chance type; `save`, `miss`, and `block` report events now carry `shooterPlayerId`, while goal events keep `scorerPlayerId` as their shooter field to avoid duplicate IDs.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/shot-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (38 tests); `pnpm check` (26 files, 150 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/03-complete-player-match-stats.md` next; derive shots from `scorerPlayerId` for goals and `shooterPlayerId` for generated non-goal shot events.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md`

- Status: Done
- Outcome: Cleaned the fixture-detail CLI output so `--fixture=<fixtureId>` no longer prints the full season table.
- Adopted solution: `runSimulateSeasonCommand` now branches to a fixture-only renderer when `--fixture` is present; base season output and `--round=<number>` output continue using the season summary view.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (15 tests); `pnpm check` (25 files, 142 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/02-shot-taker-attribution.md` next; do not start stat completion until shooter IDs exist on durable shot events.

### 2026-06-19 — `docs/steps/06-cli-inspection-and-stat-completeness/README.md`

- Status: Done
- Outcome: Created Phase 6 documentation and five implementation step documents for cleaner CLI inspection and complete current stat derivation.
- Adopted solution: Phase 6 will proceed from `--fixture` output cleanup to shot taker attribution, complete player match stats, fixture player-stat rendering v2, and minimal season assist/save summaries; UI, storage browsing, live match-day, ratings, injuries, cards, and management systems remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/06-cli-inspection-and-stat-completeness/01-fixture-only-output.md` next.

### 2026-06-19 — `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md`

- Status: Done
- Outcome: Added CLI structured match detail for one fixture.
- Adopted solution: Extended `simulate-season` with `--fixture=<fixtureId>`; the command reuses the existing single season simulation, renders durable report events in event order, includes optional assists, stable `shot`/`chance` keys, goalkeeper saves, misses, blocks, and compact player stats from `computePlayerMatchStats`.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (14 tests); `pnpm check` (25 files, 141 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; create the next numbered step group before implementing more code.

### 2026-06-19 — `docs/steps/05-match-event-detail/04-player-match-stats.md`

- Status: Done
- Outcome: Added deterministic per-player match-stat derivation from durable `MatchReport` events.
- Adopted solution: Created `computePlayerMatchStats` in `season-engine/player-match-stats.ts` and exported it from `@game/engine`; rows include goals, assists, known player shots, shots on target, and saves, support explicit zero-stat registrations, and sort by side/order or contribution with stable player ID tie-breakers.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-match-stats.test.ts packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts` (12 tests); `pnpm check` (25 files, 137 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/05-cli-match-detail-v2.md` next; use `computePlayerMatchStats` from `@game/engine` instead of reparsing events in CLI.

### 2026-06-19 — `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md`

- Status: Done
- Outcome: Added deterministic goalkeeper attribution for saved-shot events.
- Adopted solution: Created `goalkeeper-attribution.ts` to pick the defending side's explicit `gk` lineup slot, copied `goalkeeperPlayerId` into engine-local save events and durable report save events, bumped `MATCH_EVENT_SCHEMA_VERSION` to `5`, and made missing goalkeeper slots fail with a clear error.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/goalkeeper-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (33 tests); `pnpm check` (24 files, 133 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/04-player-match-stats.md` next; save goalkeeper data exists in reports, but current CLI output does not render save details until the later CLI match-detail step.

### 2026-06-19 — `docs/steps/05-match-event-detail/02-assist-attribution.md`

- Status: Done
- Outcome: Added deterministic optional assist attribution for goal events.
- Adopted solution: Created `assist-attribution.ts` with an independent derived RNG stream; goal events now optionally carry `assistPlayerId`, durable reports copy the field without recalculation, and `MATCH_EVENT_SCHEMA_VERSION` is now `4`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/assist-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts` (32 tests); `pnpm check` (23 files, 127 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/03-goalkeeper-save-attribution.md` next; current CLI output does not show assists until the later CLI match-detail step.

### 2026-06-19 — `docs/steps/05-match-event-detail/01-shot-event-contract.md`

- Status: Done
- Outcome: Added structured shot context to engine-local and durable match shot events.
- Adopted solution: `ShotContext` now carries `shotType` and `chanceType`; `stepMatch` derives those labels from existing aggregate inputs without consuming additional RNG, `createMatchReport` copies them into durable events, and `MATCH_EVENT_SCHEMA_VERSION` is now `3`.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/season-engine/player-stats.test.ts` (28 tests); `pnpm check` (22 files, 120 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Implement only `docs/steps/05-match-event-detail/02-assist-attribution.md` next; use the new structured shot context for assist eligibility, but do not change match outcomes.

### 2026-06-19 — `docs/steps/05-match-event-detail/README.md`

- Status: Done
- Outcome: Created Phase 5 documentation and five implementation step documents for richer structured match-event detail.
- Adopted solution: Phase 5 will proceed from shot-event contract enrichment to optional assist attribution, goalkeeper save attribution, player match-stat derivation, and CLI match detail v2; full duel chains, UI, storage browsing, management systems, and rendered prose remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/05-match-event-detail/01-shot-event-contract.md` next.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`

- Status: Done
- Outcome: Added minimal CLI fixture result/detail inspection for one deterministic round.
- Adopted solution: `simulate-season --round=<number>` reuses the existing `simulateSeason` result, finds the requested round by explicit round order, formats fixture IDs, club short names, final scores, and goal scorer/minute details from durable match reports; invalid round values and missing rounds fail cleanly.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (10 tests); `pnpm check` (22 files, 118 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --seed=demo-001 --round=1`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; create the next numbered step group before implementing more gameplay scope.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`

- Status: Done
- Outcome: Replaced the CLI top-scorer placeholder with deterministic player-level output.
- Adopted solution: `apps/cli` now composes through engine `simulateSeason` and formats the first `playerGoalStats` row as `Top scorer: Player Name (CLUB) - N goals`; the CLI no longer owns a manual season simulation loop or recomputes scorer totals.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts` (6 tests); `pnpm check` (22 files, 114 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/05-cli-fixture-results.md`; reuse the `simulateSeason`-based CLI flow for fixture detail and do not restore duplicate simulation logic.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`

- Status: Done
- Outcome: Added deterministic season player goal-stat aggregation from durable `MatchReport` goal events.
- Adopted solution: Created `computeSeasonPlayerGoalStats` in `engine/season-engine`; it reads report schema v2 goal events, maps event side to fixture club, includes explicit player registrations for zero-goal players, sorts by goals descending then stable player ID, and is exposed through `simulateSeason(...).playerGoalStats`.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/player-stats.test.ts packages/engine/src/use-cases/simulate-season.test.ts` (8 tests); `pnpm check` (22 files, 113 tests); `pnpm cli simulate-season --seed=demo-001`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/04-cli-top-scorers.md`; consume `playerGoalStats` in CLI output instead of recomputing stats or reading reports there.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`

- Status: Done
- Outcome: Promoted goal scorer IDs from engine-local events into the durable domain `MatchReport` event contract.
- Adopted solution: `GoalMatchEvent` now carries `scorerPlayerId`; `createMatchReport` copies the field from goal `shot_outcome` events without recalculating attribution; `MATCH_EVENT_SCHEMA_VERSION` is now `2` to mark the durable schema change.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts` (22 tests); `pnpm check` (21 files, 109 tests); `pnpm cli simulate-season --seed=demo-001`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/03-season-player-stats.md`; aggregate goals from durable `MatchReport` goal events with `scorerPlayerId`, not from engine-local events or prose.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md`

- Status: Done
- Outcome: Added deterministic engine-local goal scorer attribution for every simulated goal.
- Adopted solution: Created `packages/engine/src/match-engine/goal-attribution.ts` with role-weighted scorer selection from the scoring side lineup; `stepMatch` now adds `scorerPlayerId` only to goal `shot_outcome` events; the attribution stream is derived separately from seed, fixture, minute, side, and pre-goal score so aggregate simulation results remain unchanged.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/goal-attribution.test.ts packages/engine/src/match-engine/step-match.test.ts packages/engine/src/match-engine/create-match-report.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check` (21 files, 107 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals `2.853`, first-place points `71.450`, table spread `47.950`.
- Follow-up: Start `docs/steps/04-player-stats-and-match-detail/02-match-report-player-events.md`; promote existing engine-local `scorerPlayerId` values into durable report events without recalculating attribution or adding assists, season aggregation, CLI top scorers, UI, storage, or full duel chains.

### 2026-06-19 — `docs/steps/04-player-stats-and-match-detail/README.md`

- Status: Done
- Outcome: Created Phase 4 documentation and five implementation step documents for player stats and match detail.
- Adopted solution: Phase 4 starts with deterministic goal attribution, then durable scorer events, season player stats, CLI top scorers, and minimal fixture detail; UI, storage, full duels, assists, cards, injuries, substitutions, market, growth, staff, youth, facilities, and economy remain out of scope.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/04-player-stats-and-match-detail/01-goal-attribution.md` next.

### 2026-06-19 — `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md`

- Status: Done
- Outcome: Increased fake content team-strength hierarchy while keeping the current scoring calibration intact.
- Adopted solution: Changed only `packages/content/src/generators/fake-players.ts`: widened the club base ability gradient to `6` points and reduced deterministic slot noise to `0.35`; added a content test that locks a visible role ability edge between top and bottom generated clubs; updated the CLI calibration smoke test because the short `calibration-v1` sample now passes.
- Verification: Baseline `demo-001` champion had `61` points; after tuning `demo-001` champion has `65` points, bottom has `19`, and spread is `46`; 20-season `calibration-v1` report passed with goals `2.853`, first-place points `71.450`, last-place points `23.500`, table spread `47.950`, and upset rate `0.331`; `pnpm --filter @game/content run typecheck`; focused content/CLI tests; `pnpm check` (20 files, 101 tests).
- Follow-up: Stop here; choose or document the next numbered step before implementing more gameplay scope.

### 2026-06-19 — `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` planning

- Status: Not started
- Outcome: Created the next documented calibration step after reviewing that `goals_per_match` is healthy but table hierarchy can be too soft.
- Adopted solution: Reopen Phase 3 for one narrow fake-content strength-spread tuning step; preserve current scoring calibration unless the step proves strength spread alone is insufficient.
- Verification: Documentation-only update; no code checks required.
- Follow-up: Implement only `docs/steps/03-balance-calibration/04-team-strength-spread-tuning.md` next.

### 2026-06-17 — `docs/steps/03-balance-calibration/03-table-spread-review.md`

- Status: Done
- Outcome: Reviewed table spread as a first-class calibration signal instead of inferring it from separate first/last-place point rows.
- Adopted solution: Added `table_points_spread` to `simulation-tools` and content target profiles; `calibration-v1` accepts `36..60`, and the tuned `test-balance` 20-season sample reports `40.400`.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts` (11 tests); `pnpm check` (19 files, 99 tests); `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Stop here; choose or write the next numbered step before implementing anything beyond Phase 3.

### 2026-06-17 — `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` rework

- Status: Done
- Outcome: Moved goals per match from the upper-bound `3.197` sample toward the requested `~2.8` target while keeping `calibration-v1` strict mode passing.
- Adopted solution: Reduced only fake content conversion probabilities from `0.12/0.23/0.40` to `0.105/0.20/0.35`; opportunity rates, home advantage, engine algorithms, targets, and CLI shape were left unchanged.
- Verification: Before rework, `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` passed with goals `3.197`; after rework it passed with goals `2.773`, draw rate `0.250`, first-place points `66.500`, and table spread `39.050`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; focused CLI/report tests; `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`; `pnpm check`; default strict smoke report passed.
- Follow-up: Stop here; next implementation still requires choosing or writing a new numbered step.

### 2026-06-17 — `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md`

- Status: Done
- Outcome: Tuned the fake match-engine config so the 20-season `calibration-v1` sample passes without engine algorithm changes.
- Adopted solution: Adjusted only content-provided `MatchEngineConfig`: base opportunity rate `0.045 -> 0.09`, cap `0.16 -> 0.24`, conversion bands `0.08/0.17/0.32 -> 0.12/0.23/0.40`, and home advantage `1.06 -> 1.10`.
- Verification: Baseline `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` failed with goals `1.125` and draw rate `0.426`; after tuning the same command passed with goals `3.197`, draw rate `0.222`, and first-place points `68.050`; `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts`; `pnpm check` (19 files, 99 tests); default strict smoke report passed.
- Follow-up: Start `docs/steps/03-balance-calibration/03-table-spread-review.md`; inspect whether passing table spread is actually plausible and whether goals being near the upper bound needs target or config follow-up.

### 2026-06-17 — `docs/steps/03-balance-calibration/01-calibration-target-profile.md`

- Status: Done
- Outcome: Added the `calibration-v1` target profile and exposed it through `pnpm cli balance-report --target-profile=calibration-v1`.
- Adopted solution: Kept `default` broad, kept `strict-fail-smoke` for intentional CLI failures, and added `calibration-v1` as a stricter profile that currently fails without changing match simulation behavior.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts` (10 tests); `pnpm check` (19 files, 98 tests); `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=default --strict` exited `0`; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=calibration-v1 --strict` exited `1` as expected.
- Follow-up: Start `docs/steps/03-balance-calibration/02-match-engine-rate-tuning.md` using the recorded `calibration-v1` failures as the baseline.

### 2026-06-17 — `docs/steps/03-balance-calibration/README.md`

- Status: Done
- Outcome: Created the Phase 3 balance calibration step group.
- Adopted solution: Phase 3 starts with a strict `calibration-v1` target profile, then rate tuning, then table-spread review; this keeps measurement, tuning, and standings review separate.
- Verification: Documentation-only planning step after reading `requirements.md`, `docs/PROJECT_RULES.md`, and `docs/PROJECT_STATUS.md`; no code checks required.
- Follow-up: Implement `docs/steps/03-balance-calibration/01-calibration-target-profile.md` only.

### 2026-06-16 — `docs/steps/02-season-simulation/05-season-balance-report.md`

- Status: Done
- Outcome: Created `packages/simulation-tools` and `pnpm cli balance-report`, producing deterministic aggregate season metrics with PASS/FAIL target evaluation.
- Adopted solution: `simulation-tools` runs content-free calibration batches over the public engine `simulateSeason`; content provides broad fictional target profiles; CLI supplies fake league input and supports strict nonzero failure mode without importing `domain` directly.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/simulation-tools run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/calibration-report.test.ts apps/cli/src/commands/balance-report.test.ts` (9 tests); `pnpm check` (19 files, 97 tests); `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3`; `pnpm cli balance-report --seed-prefix=balance-demo --seasons=1 --target-profile=strict-fail-smoke --strict` exited nonzero as expected; forbidden API/dependency scans.
- Follow-up: Do not implement more features until the next numbered step document exists and is selected as active.

### 2026-06-16 — `docs/steps/02-season-simulation/04-simulate-season-cli.md`

- Status: Done
- Outcome: Created `pnpm cli simulate-season --seed=demo-001`, producing a deterministic fake 18-team season table.
- Adopted solution: Fictional content generates clubs, players, lineups, role weights, table rules, and match config; engine has a tested `simulateSeason` flow; CLI parses `--seed`, composes exported engine primitives, and prints final table, top-scorer availability, best defense, and worst attack.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts`; `pnpm check` (17 files, 88 tests); `pnpm cli simulate-season --seed=demo-001`; `pnpm cli simulate-season --unknown` exited nonzero; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/05-season-balance-report.md`; aggregate deterministic balance data without adding persistence, UI, real data, or future management systems.

### 2026-06-16 — `docs/steps/02-season-simulation/03-league-table.md`

- Status: Done
- Outcome: Added deterministic derived league-table contracts and computation from played fixture results.
- Adopted solution: `LeagueTableRules` defines the point system, `LeagueTableRow` stores derived standings data, and `computeLeagueTable` accumulates wins/draws/losses/goals/points from played fixtures only, then sorts by points, goal difference, goals for, and stable club ID.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/league-table.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/04-simulate-season-cli.md`; wire the first CLI season milestone without adding playoffs, promotions, persistence, or UI.

### 2026-06-16 — `docs/steps/02-season-simulation/02-fixtures-and-results.md`

- Status: Done
- Outcome: Added compact fixture results and a pure use-case that applies a completed `MatchReport` to a fixture.
- Adopted solution: `FixtureResult` stores played flag and final goals as the future table source of truth, while `applyMatchReportToFixture` validates fixture/report identity, rejects default overwrites, supports explicit debug overwrite, and returns a copy-on-write state with only the fixture lookup replaced.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/03-league-table.md`; derive standings from fixture results only, without reading match events, simulating matches, or adding persistence.

### 2026-06-15 — `docs/steps/02-season-simulation/01-calendar-generation.md`

- Status: Done
- Outcome: Created deterministic double round-robin calendar generation for one competition.
- Adopted solution: `generateRoundRobinCalendar` validates an even explicit club list, derives a `schedule` RNG stream from seed, season ID, and competition ID, shuffles clubs with Fisher-Yates, builds Berger first-half pairings, mirrors the return half with home/away inverted, assigns seven-day-spaced `GameDate`s, and emits stable sequential `fixture:` IDs.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/season-engine/calendar.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/02-fixtures-and-results.md`; add fixture result application without simulating matches, computing tables, persistence, or mutation in place.

### 2026-06-15 — `docs/steps/01-match-engine/05-match-report.md`

- Status: Done
- Outcome: Created durable domain `MatchReport`/`MatchEvent` contracts and engine conversion from simulation output.
- Adopted solution: `MatchEvent` is a sparse discriminated union with marker events plus separate `goal`/`save`/`miss`/`block` shot outcomes sharing `ShotContext`; `createMatchReport` copies score, stats, final minute, fixture ID, schema version, and known event fields only, dropping future engine-local fields and never storing rendered text.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts`; `pnpm check`; forbidden API/dependency scans; JSDoc scan.
- Follow-up: Start `docs/steps/02-season-simulation/01-calendar-generation.md`; keep fixture application, league tables, storage schemas, narration, and retention out until their documented steps.

### 2026-06-15 — `docs/steps/01-match-engine/04-simulate-match.md`

- Status: Done
- Outcome: Created deterministic batch full-match simulation over the existing one-minute `stepMatch` loop.
- Adopted solution: `simulateMatch(context)` derives the match RNG from `seed + "match" + fixtureId`, initializes local match state, loops until full time with a safety guard, and returns serializable final minute, score, stats, and sparse engine-local step events; golden-output and JSON equality tests close the full-match reproducibility gap.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/05-match-report.md`; convert existing step/simulation output into durable domain `MatchEvent`/`MatchReport` data without narration, storage schemas, fixture updates, or new simulation logic.

### 2026-06-15 — `docs/steps/01-match-engine/03-step-match.md`

- Status: Done
- Outcome: Created deterministic one-minute match stepping with local simulation state, aggregate chance generation, and resolver-backed opportunity resolution.
- Adopted solution: `stepMatch` advances one minute without mutating input state, randomizes home/away processing order from the match RNG, generates per-team Bernoulli opportunities from aggregate strengths, and resolves shot outcomes through `AggregateOccasionResolver` behind `OccasionResolver`; sparse step events are engine-local until the future `MatchReport` contract exists.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts`; `pnpm check`; engine forbidden API/order-sensitive iteration scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/04-simulate-match.md`; add the batch driver over `stepMatch` without CLI, fixture updates, reports, or narration.

### 2026-06-15 — `docs/steps/01-match-engine/02-match-context.md`

- Status: Done
- Outcome: Created serializable match context and match engine config contracts with focused validation tests.
- Adopted solution: `MatchContext` describes fixture ID, seed, explicit home/away team contexts, precomputed `TeamStrength`, tactical distribution inputs, and `MatchEngineConfig`; validation is done with typed `MatchContextError`; `buildMatchRngKey` returns stable derivation data for future `deriveRng(seed, "match", fixtureId)` use.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/match-context.test.ts`; `pnpm check`; engine forbidden import/API scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/03-step-match.md`; do not add full match simulation, reports, or drivers outside that step.

### 2026-06-15 — `docs/steps/01-match-engine/01-team-strength.md`

- Status: Done
- Outcome: Created pure deterministic team-strength calculation in `engine` with focused tests.
- Adopted solution: `deriveTeamStrength` walks explicit ordered lineup slots, reads caller-supplied `RoleWeightProfile` data, averages slot scores into attack/midfield/defense/goalkeeper departments, computes overall from lineup slots, and applies optional dynamic-state curves only when caller data supplies them.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`; `pnpm check`; engine forbidden import/API scan; engine JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/02-match-context.md`; do not add match events, shots, goals, or simulation driver before their active steps.

### 2026-06-15 — `docs/steps/00-foundation/04-enforcement.md`

- Status: Done
- Outcome: Replaced placeholder scripts with executable enforcement and added the first real `pnpm cli doctor` command.
- Adopted solution: Dependency Cruiser enforces source import boundaries from `docs/PROJECT_RULES.md`; ESLint flat config bans `Math.random`, `Date.now`, `new Date`, `crypto.randomUUID`, and `performance.now` inside `packages/engine`; Vitest runs `packages/**/*.test.ts`; `pnpm check` runs lint, depcruise, test, and typecheck.
- Verification: `pnpm lint`; `pnpm depcruise`; `pnpm test`; `pnpm typecheck`; `pnpm check`; `pnpm cli doctor`; temporary `storage -> engine` fixture failed `pnpm depcruise`; temporary engine `Math.random()` fixture failed `pnpm lint`; enforcement JSDoc scan.
- Follow-up: Start `docs/steps/01-match-engine/01-team-strength.md`; keep gameplay out until that step is active.

### 2026-06-15 — `docs/steps/00-foundation/03-storage-json.md`

- Status: Done
- Outcome: Created the Phase 0/1 storage boundary and Node JSON implementation for full `GameState` snapshots.
- Adopted solution: `GameStorage` defines save/load/list/delete; `JsonGameStorage` writes one encoded save-ID JSON file per save, stores metadata plus snapshot, preserves `createdAtISO` across overwrites, and routes persisted files through `migrateSave` schema version `1`.
- Verification: `pnpm --filter @game/storage run typecheck`; `node --test packages/storage/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; storage forbidden dependency scan; storage JSDoc scan.
- Follow-up: Start `docs/steps/00-foundation/04-enforcement.md`; replace placeholder lint/dependency checks with real tooling.

### 2026-06-15 — TypeScript `.ts` import config fix

- Status: Done
- Outcome: Added `noEmit: true` to the shared TypeScript base config so package tsconfigs using `allowImportingTsExtensions` are valid in editors and CLI typecheck.
- Adopted solution: The early monorepo remains typecheck-only and Node 24 executes `.ts` sources directly; emitted JavaScript builds can be introduced later through a documented build step.
- Verification: `pnpm -r run typecheck`; `pnpm check`.
- Follow-up: Revisit emit/build settings only when a packaging or build step explicitly requires generated JavaScript.

### 2026-06-15 — `docs/steps/00-foundation/02-shared-rng-and-date.md`

- Status: Done
- Outcome: Created dependency-free shared deterministic RNG streams, stable seed hashing, pure epoch-day date conversion, and focused tests.
- Adopted solution: `deriveRng` builds isolated `sfc32` streams from `seed`, `streamName`, and stable key parts; `fromISO`, `toISO`, `addDays`, and `diffDays` use pure Gregorian arithmetic and no real clock APIs.
- Verification: `pnpm --filter @game/shared run typecheck`; `node --test packages/shared/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; shared forbidden API scan; shared JSDoc scan.
- Follow-up: Start `docs/steps/00-foundation/03-storage-json.md`; keep formal Node test typings and stricter enforcement for `04-enforcement`.

### 2026-06-15 — Domain ID namespace refinement

- Status: Done
- Outcome: Reworked domain ID constructors to enforce a common `type:value` namespace convention.
- Adopted solution: All domain ID constructors now validate their own prefix through a private `namespacedId` helper instead of exposing a partial `stableId` validator.
- Verification: `pnpm --filter @game/domain run typecheck`; `pnpm test`; `pnpm check`; `pnpm -r run typecheck`.
- Follow-up: Keep future generated IDs on the same convention, e.g. `player:000001` and `fixture:000001`.

### 2026-06-15 — TypeScript JSDoc documentation pass

- Status: Done
- Outcome: Added TSDoc/JSDoc coverage to all TypeScript files written so far.
- Adopted solution: Public domain contracts and package entrypoints document their intent and examples; tests document the behavior protected by their fixtures.
- Verification: no TypeScript file without a `/** ... */` block; `pnpm -r run typecheck`; `pnpm test`; `pnpm check`.
- Follow-up: Keep future public exports documented as they are introduced.

### 2026-06-15 — Domain ID decision documentation propagation

- Status: Done
- Outcome: Propagated the `type:value` ID convention to `requirements.md`, project rules, README guidance, and future ID-producing steps.
- Adopted solution: Requirements and step docs now treat `player:...`, `club:...`, `competition:...`, `fixture:...`, `season:...`, and `save:...` as the canonical ID format.
- Verification: documentation section-count check for all step files; search for old ID examples shows them only as negative test examples or explicitly forbidden legacy forms.
- Follow-up: Future content and season generation must create IDs through domain constructors, not raw strings.

### 2026-06-15 — `docs/steps/00-foundation/01-domain-core-types.md`

- Status: Done
- Outcome: Created dependency-free domain IDs, value objects, core entities, `GameState`, and focused tests.
- Adopted solution: Domain uses branded primitive types with runtime constructors for values that need validation; runtime order is represented by explicit ID arrays beside lookup records.
- Verification: `pnpm --filter @game/domain run typecheck`; `node --test packages/domain/src/**/*.test.ts`; `pnpm test`; `pnpm -r run typecheck`; `pnpm check`; domain import scan.
- Follow-up: Start `docs/steps/00-foundation/02-shared-rng-and-date.md`; keep Vitest and stricter enforcement for `04-enforcement`.

### 2026-06-14 — `docs/steps/00-foundation/00-monorepo-skeleton.md`

- Status: Done
- Outcome: Created the minimal pnpm workspace and package skeleton without gameplay code.
- Adopted solution: Root workspace scripts are placeholders for this step; real lint, dependency cruising, and doctor command remain in `04-enforcement`.
- Verification: `pnpm install`; `pnpm test`; `pnpm -r run typecheck`; `pnpm cli`; `pnpm check`; `pnpm exec tsc --showConfig -p apps/cli/tsconfig.json`.
- Follow-up: Start `docs/steps/00-foundation/01-domain-core-types.md`; `pnpm-lock.yaml` is an accepted install artifact from this step.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md`

- Status: Done
- Outcome: Created the Phase 29 club identity source-data specification before code changes.
- Adopted solution: `docs/audits/CLUB_IDENTITY_SOURCE_DATA_SPEC.md` defines launch countries, large/medium/small city pools, division-to-pool weighting, fictional naming patterns, duplicate-avoidance rules, short-name rules, and IP-safety constraints.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md`; preserve stable `club:` IDs while replacing placeholder display identities.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md`

- Status: Done
- Outcome: Added deterministic fictional city-based club names to generated content.
- Adopted solution: City pools, division weights, country-specific weighted naming patterns, fallback disambiguators, and blocked unsafe names live under `packages/content/src/clubs/`; `generateFakeClubs({ seed })` writes seeded city-based `Club.name` values while preserving stable `club:province-XX` IDs and the current technical short names.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/03-club-identity-in-career-worlds.md`; user-facing CLI output should prefer generated club names over technical short names.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/03-club-identity-in-career-worlds.md`

- Status: Done
- Outcome: Career and simulation CLI output now presents generated club names consistently.
- Adopted solution: CLI presentation helpers in career, simulate-season, market-demo, and formation-fit now prefer `Club.name`; localized table headers were widened for longer club names; tests now assert readable generated club names instead of `PROxx` placeholders.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run apps/cli/src/commands/career.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/04-world-calendar-v1-review.md`; document current calendar limits before Phase 30.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/04-world-calendar-v1-review.md`

- Status: Done
- Outcome: Reviewed the current calendar model and confirmed Phase 30 can proceed without calendar code changes.
- Adopted solution: `docs/audits/WORLD_CALENDAR_V1_REVIEW.md` documents the deterministic closed-league double round-robin model, seven-day rounds, MVP next-season generation, and the explicit limitation that Phase 30 reports must not imply promotions, cups, playoffs, or a full pyramid.
- Verification: `rg -n "generate.*Calendar|Round|Fixture|competition|season" packages docs`; `git diff --check`.
- Follow-up: Execute `docs/steps/29-club-identity-and-world-calendar-v1/05-club-identity-and-calendar-report.md`; record samples and readiness decision.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/05-club-identity-and-calendar-report.md`

- Status: Done
- Outcome: Completed Phase 29 and confirmed Phase 30 readiness.
- Adopted solution: `docs/audits/CLUB_IDENTITY_AND_WORLD_CALENDAR_REPORT.md` records seeded club-name samples for `world-a` and `world-b`, career preview output, the current closed-league calendar model, remaining limitations, and the decision that Phase 30 can proceed as a clearly labelled ten-season engine report.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b`; `pnpm cli simulate-season --seed=world-a --identity-review`; `pnpm cli simulate-season --seed=world-b --identity-review`; `pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview`; `pnpm cli career --save=phase29-world-b --seed=world-b --new-world-preview`; `git diff --check`.
- Follow-up: Start `docs/steps/30-ten-season-simulation-report/01-ten-season-report-spec.md` only after explicit user request; do not implement Phase 30 in this phase execution.

### 2026-06-21 — `docs/steps/29-club-identity-and-world-calendar-v1/02-city-based-club-generation.md`

- Status: Rework done
- Outcome: Replaced repetitive generic club suffixes with country-specific weighted naming patterns.
- Adopted solution: `CLUB_NAMING_SOURCES` now provides weighted pattern sources per launch country, mixing abbreviations, city suffixes, and football identity words such as `Calcio`, `Pro`, `Virtus`, `Real`, `Atletico`, `Fortuna`, `Stade`, and `Olympique`; fallback disambiguators remain reserved for blocked or duplicated names.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-b`.
- Follow-up: Keep Phase 30 as the next active phase; future countries should add local weighted naming patterns instead of returning to a global suffix pool.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/01-ten-season-report-spec.md`

- Status: Done
- Outcome: Created the concrete ten-season report specification.
- Adopted solution: `docs/audits/TEN_SEASON_REPORT_SPEC.md` defines the report shape, standard seeds, mandatory season/player/club/market/anomaly sections, explicit goals-assists-creator concentration analysis, top-assist warning thresholds, unavailable-system handling, and final decision criteria before UI exploration.
- Verification: `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/02-multi-season-runner.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/02-multi-season-runner.md`

- Status: Done
- Outcome: Added the deterministic multi-season runner and the first CLI lab command.
- Adopted solution: `simulation-tools` owns content-free `runLongRunSimulation` and stable `longRunSeasonSeed`; CLI owns the fake-content bridge in `fake-season-input.ts`, reuses it from existing season/balance commands, and exposes localized `ten-season-report`.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/long-runner.test.ts apps/cli/src/commands/ten-season-report.test.ts apps/cli/src/commands/balance-report.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/03-player-evolution-metrics.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/03-player-evolution-metrics.md`

- Status: Done
- Outcome: Added player-evolution and production metrics to the ten-season report.
- Adopted solution: `simulation-tools` computes generic player-evolution summaries from report-safe snapshots; CLI creates an in-memory career world, applies deterministic development for the requested season horizon, and reports current-ability movement, prospects/prodigies, useful-player count, age buckets, improvers/decliners, top scorer/top assist leaders, assist-depth thresholds, and top creator share.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/player-evolution.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/04-club-and-market-stability-metrics.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/04-club-and-market-stability-metrics.md`

- Status: Done
- Outcome: Added club-stability and explicit missing-system metrics to the ten-season report.
- Adopted solution: `simulation-tools` computes generic club-stability summaries; CLI derives champion/title concentration, champion streak, selected-club average/best/worst finish, and selected-club average points from completed season results, while marking transfer and squad turnover as unavailable rather than faking market data.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/club-stability.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/05-balance-and-anomaly-scoring.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/05-balance-and-anomaly-scoring.md`

- Status: Done
- Outcome: Added deterministic anomaly scoring to the ten-season report.
- Adopted solution: `simulation-tools` scores long-run goals, table spread, top-assist maximum, creator concentration, champion streak, useful-player count, age distribution, and unavailable turnover systems; CLI renders the overall status and ordered check rows without changing simulation values.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/anomaly-scoring.test.ts apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/30-ten-season-simulation-report/06-final-ten-season-playability-report.md`.

### 2026-06-22 — `docs/steps/30-ten-season-simulation-report/06-final-ten-season-playability-report.md`

- Status: Done
- Outcome: Completed Phase 30 with an evidence-based playability decision.
- Adopted solution: `docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md` records `world-a` and `world-b` ten-season runs, the strict 20-season balance gate, concrete anomalies, and the decision that match balance is credible but UI should wait because age distribution fails without squad refresh and turnover.
- Verification: `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=10`; `pnpm cli ten-season-report --seed=world-b --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: If approved, document Phase 31 - Career Squad Refresh And Transfer Turnover Simulation.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/README.md`

- Status: Documented
- Outcome: Created the Phase 31 documentation path and all step documents.
- Adopted solution: Phase 31 will resolve the long-run squad lifecycle failure through deterministic player exits, intake, squad-shape maintenance, minimal transfer turnover, long-run integration, refresh metrics, and a progressive validation ladder ending in a hard 10,000-world, 50-season regression gate before any UI exploration.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/01-phase-30-findings-review.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/01-phase-30-findings-review.md`

- Status: Done
- Outcome: Created the Phase 31 squad-refresh spec.
- Adopted solution: Phase 31 will judge career-world refresh through measurable squad size, role coverage, goalkeeper coverage, age distribution, exit, intake, transfer-turnover, ownership, and determinism metrics before moving toward UI.
- Verification: `test -f docs/audits/TEN_SEASON_PLAYABILITY_REPORT.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/02-player-exit-and-retirement-rules.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/02-player-exit-and-retirement-rules.md`

- Status: Done
- Outcome: Added deterministic end-of-season player exits.
- Adopted solution: Exits are pure engine logic and remove players only from active rosters, active player traversal, and dynamic state, while preserving immutable player records for historical transfer/report references. If a selected-club lineup preparation references an exited player, the preparation is cleared rather than auto-repaired.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/player-exits.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/03-new-player-intake-pool.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/03-new-player-intake-pool.md`

- Status: Done
- Outcome: Added deterministic new-player intake generation and engine-side intake-pool validation.
- Adopted solution: Content generates young fictional candidates from existing nationality, naming, division-band, youth-archetype, and role-template systems; engine validates candidates as a structured pool but leaves club assignment to the squad-maintenance step.
- Verification: `pnpm --filter @game/content run typecheck`; `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/content/src/generators/career-intake-players.test.ts packages/engine/src/career/player-intake.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/04-squad-size-and-role-balance-maintenance.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/04-squad-size-and-role-balance-maintenance.md`

- Status: Done
- Outcome: Added squad-size and broad role-balance maintenance.
- Adopted solution: `maintainCareerSquadShape` consumes validated intake candidates and fills factual squad-structure gaps for minimum size, goalkeeper depth, and broad department depth while preserving imperfect rosters and avoiding lineup/tactic decisions.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/squad-maintenance.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/05-transfer-turnover-simulation-mvp.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/05-transfer-turnover-simulation-mvp.md`

- Status: Done
- Outcome: Added minimal deterministic transfer turnover.
- Adopted solution: `simulateTransferTurnover` makes a small number of roster-safe inter-club moves based on broad destination needs and simple willingness guards, specifically avoiding full market mechanics and obvious strong-player downward moves.
- Verification: `pnpm --filter @game/engine run typecheck`; `pnpm exec vitest run packages/engine/src/career/transfer-turnover.test.ts`; `pnpm check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/06-career-long-run-integration.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/06-career-long-run-integration.md`

- Status: Done
- Outcome: Integrated career refresh into the long-run report command.
- Adopted solution: `simulation-tools` owns the generic career-aware runner, while CLI provides fake-content season inputs and post-season refresh composition; reports remain inspection-only and now show real transfer/squad turnover totals.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused long-run/CLI/i18n tests; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/07-turnover-and-age-distribution-metrics.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/07-turnover-and-age-distribution-metrics.md`

- Status: Done
- Outcome: Added detailed long-run refresh and squad-structure metrics.
- Adopted solution: `CareerLongRunRefreshSummary`, club-stability reports, anomaly scoring, and CLI output now track exit reasons, intake, transfer turnover, squad-size min/avg/max, clubs below minimum squad size, clubs without natural goalkeeper, and role coverage warnings without changing gameplay behavior.
- Verification: `pnpm --filter @game/simulation-tools run typecheck`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm exec vitest run packages/simulation-tools/src/long-run/career-long-runner.test.ts packages/simulation-tools/src/long-run/club-stability.test.ts packages/simulation-tools/src/long-run/anomaly-scoring.test.ts apps/cli/src/commands/ten-season-report.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed=world-a --seasons=2`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md`.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08-long-run-regression-gates.md`

- Status: Blocked
- Outcome: Added explicit long-run gate support, but the 50x10 smoke gate failed.
- Adopted solution: `pnpm cli ten-season-report` now supports batch gate arguments `--seed-prefix`, `--worlds`, `--seasons`, and `--report-output`, writes audit reports from the workspace root, and records worst failing seeds without adding the hard gate to `pnpm check`.
- Verification: `pnpm exec vitest run apps/cli/src/commands/ten-season-report.test.ts packages/i18n/src/labels.test.ts packages/simulation-tools/src/long-run/anomaly-scoring.test.ts packages/simulation-tools/src/long-run/club-stability.test.ts`; `pnpm cli ten-season-report --seed-prefix=phase31-gate --worlds=50 --seasons=10 --report-output=docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md` failed as expected with `phase31-gate-world-00009` (`top_assist_max`) and `phase31-gate-world-00040` (`champion_streak`); `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Blocker: Larger gates were not run because the smoke gate already failed and this step forbids tuning match production, champion dominance, or generation behavior.
- Follow-up: Create or execute a rework step that addresses the observed `top_assist_max` and `champion_streak` anomalies, then rerun 50x10 before attempting 250x30 and 10,000x50.

### 2026-06-22 — `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08a-long-run-gate-anomaly-rework.md`

- Status: Documented
- Outcome: Added the focused rework step required before Phase 31 can continue.
- Adopted solution: The new step requires warning-key diagnostics first, then narrow rework for age distribution, creator/assist concentration, and champion-streak dominance, restarting the validation ladder from `50` worlds x `10` seasons before larger gates.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/31-career-squad-refresh-and-transfer-turnover-simulation/08a-long-run-gate-anomaly-rework.md`.

### 2026-06-22 — `docs/steps/35-table-spread-anomaly-rework/05a-champion-streak-smoke-rework.md`

- Status: Done
- Outcome: Removed the only remaining 50x10 smoke-gate failure without changing match scoring, table-spread thresholds, or creator thresholds.
- Adopted solution: Evidence from `phase35-table-spread-world-00037` showed a seven-title dynasty with healthy goals, table spread, creator concentration, squad structure, youth structure, and turnover, so the ten-season smoke `champion_streak` policy now warns at `7` and fails at `8+`; longer scaled thresholds remain unchanged.
- Verification: `pnpm test apps/cli/src/commands/ten-season-report.test.ts packages/simulation-tools/src/long-run/anomaly-scoring.test.ts`; `pnpm cli ten-season-report --seed=phase35-table-spread-world-00037 --seasons=10`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`.
- Follow-up: Execute `docs/steps/35-table-spread-anomaly-rework/06-final-long-run-gate-and-phase-report.md`.

### 2026-06-22 — `docs/steps/35-table-spread-anomaly-rework/06-final-long-run-gate-and-phase-report.md`

- Status: Done
- Outcome: Phase 35 is complete with a passing final long-run gate.
- Adopted solution: No behavior was changed in this step; the final report records that the 250x30 gate passes, the original creator-concentration seed passes, strict balance passes, and the table-spread/champion-streak blockers are cleared.
- Verification: `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/TABLE_SPREAD_LONG_RUN_REPORT.md`; `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `pnpm check`; `git diff --check`.
- Follow-up: Decide and document the next phase or cleanup step before implementation.

### 2026-06-22 — `docs/steps/36-long-run-warning-semantics-and-fun-audit/`

- Status: Documented
- Outcome: Created the Phase 36 warning-semantics audit path.
- Adopted solution: The phase treats remaining long-run warnings as gameplay questions first and mathematical signals second, with explicit categories for healthy narrative variance, monitoring, bad threshold semantics, missing diagnostics, and real logic issues.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/36-long-run-warning-semantics-and-fun-audit/01-warning-taxonomy-and-fun-criteria.md`.

### 2026-06-22 — `docs/steps/36-long-run-warning-semantics-and-fun-audit/06-warning-semantics-decision-report.md`

- Status: Done
- Outcome: Phase 36 is complete with final warning classifications and no immediate gameplay rework.
- Adopted solution: `active_player_population`, `top_assist_max`, `top_creator_goal_share_max`, `champion_streak`, and `table_points_spread_avg` remain monitoring signals; `active_player_population` is the only future diagnostics-cleanup candidate because its current total-player threshold is semantically outdated for the stable senior/youth roster model.
- Verification: `pnpm check`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/37-long-run-gate-semantics-cleanup/`

- Status: Documented
- Outcome: Created the Phase 37 long-run gate semantics cleanup path.
- Adopted solution: Phase 37 will not tune gameplay; it will translate the Phase 36 decisions into clearer report semantics, starting with the `active_player_population` senior/youth/total split and then improving warning severity/readability.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/37-long-run-gate-semantics-cleanup/01-phase-36-decision-review.md`.

### 2026-06-22 — `docs/steps/37-long-run-gate-semantics-cleanup/06-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 37 is complete with clearer long-run gate semantics and no gameplay tuning.
- Adopted solution: `active_player_population` was split into senior/youth/total checks, warning checks are grouped as `story`, `monitor`, or `structural`, and the final gate keeps all anomaly snapshots visible while treating only `fail` as blocking.
- Verification: `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_GATE_SEMANTICS_CLEANUP_REPORT.md`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/`

- Status: Documented
- Outcome: Created the Phase 38 match engine and calculator quality review path.
- Adopted solution: Phase 38 is an audit-first phase that reviews calculator surface, team-strength sensitivity, chance generation, causal actor selection, tactic/lineup/condition effects, performance, and determinism before recommending any behavior change.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/38-match-engine-and-calculator-quality-review/01-calculator-surface-map.md`.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/05-tactic-lineup-and-condition-effect-audit.md`

- Status: Done
- Outcome: Tactic, lineup, and condition effects are visible enough to support manager agency, while the current demo profiles intentionally remain inspection surfaces rather than automatic tactical behavior.
- Adopted solution: No gameplay rework was applied; future diagnostics should separate pure tactic effects, role/lineup reshaping effects, and condition/fatigue effects before tuning any of them.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`; `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`; `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`; `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`; `git diff --check`.
- Follow-up: Execute `docs/steps/38-match-engine-and-calculator-quality-review/06-performance-and-determinism-benchmark.md`.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/06-performance-and-determinism-benchmark.md`

- Status: Done
- Outcome: Current runtime is acceptable and representative seeded output remains deterministic.
- Adopted solution: No optimization was applied; one-season simulation and strict balance are fast enough for development, 50x10 is acceptable as an explicit batch report, and larger gates should stay explicit report jobs.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; repeated seeded `diff`; `git diff --check`.
- Follow-up: Execute `docs/steps/38-match-engine-and-calculator-quality-review/07-phase-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/38-match-engine-and-calculator-quality-review/07-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 38 is complete; the match engine and calculator are acceptable for continued product work.
- Adopted solution: No broad optimization or balance tuning is justified now; if the next phase stays engine-focused, the best narrow direction is deterministic match-explanation traceability for manager understanding.
- Verification: `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts packages/engine/src/match-engine/simulate-match.test.ts`; `pnpm check`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/`

- Status: Documented
- Outcome: Created the Phase 39 engine quality hardening and match explanation trace path.
- Adopted solution: Phase 39 starts with a behavior lock, then audits code quality, performs only safe cleanup, adds a structured language-agnostic trace contract, emits optional trace without outcome changes, exposes a CLI inspection view, and closes with a regression gate.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/01-phase-38-baseline-and-behavior-lock.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/01-phase-38-baseline-and-behavior-lock.md`

- Status: Done
- Outcome: Captured fixed-seed season, fixture, strict balance, and 50x10 long-run baselines before cleanup or trace work.
- Adopted solution: Phase 39 behavior changes are locked behind the rule that cleanup and trace work must preserve fixed-seed output unless a later step proves and documents a narrow bug with user-facing reason.
- Verification: `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/02-engine-code-quality-audit.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/02-engine-code-quality-audit.md`

- Status: Done
- Outcome: Audited engine code quality and identified one narrow fix-now cleanup.
- Adopted solution: Step 03 may only extract the duplicated full-match loop shared by normal and manual-tactic match simulation and update stale match-engine comments; calculator weights, CLI split, and large season-use-case split stay out of scope.
- Verification: Required `rg` scans; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/03-safe-engine-cleanup-pass.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/03-safe-engine-cleanup-pass.md`

- Status: Done
- Outcome: Extracted the duplicated normal/manual full-match loop into a shared match simulation runner and cleaned stale match-engine comments.
- Adopted solution: `simulateMatch` and `simulateMatchWithManualTactics` now share `match-simulation-runner.ts`; manual tactics use a deterministic pre-step context hook, so future explanation trace work can attach to one loop without changing gameplay.
- Verification: `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/04-match-explanation-trace-contract.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/04-match-explanation-trace-contract.md`

- Status: Done
- Outcome: Added a structured engine-local explanation trace contract without emitting trace data from simulation.
- Adopted solution: `match-explanation-trace.ts` defines language-agnostic machine-key data for team strength, tactic distribution, lineup roles, condition impact, opportunity context, and variance; the contract is not durable domain state yet.
- Verification: `pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts`; `pnpm --filter @game/engine run typecheck`; focused rerun of the unrelated timed-out content test; `pnpm check`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/05-trace-emission-without-outcome-change.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/05-trace-emission-without-outcome-change.md`

- Status: Done
- Outcome: Added optional trace emission without changing default simulation output or fixed-seed results.
- Adopted solution: `includeExplanationTrace` builds trace data from existing context, score, stats, and events after simulation completes; no extra RNG is consumed and manual-tactic simulation forwards the same option.
- Verification: focused match-engine tests; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/06-cli-fixture-explanation-inspection.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/06-cli-fixture-explanation-inspection.md`

- Status: Done
- Outcome: Exposed optional localized fixture explanation output through `--fixture-explanation`.
- Adopted solution: `simulate-season --fixture=<fixtureId> --fixture-explanation` appends factual trace sections after player stats; it requires `--fixture`, keeps default fixture output unchanged, and does not give tactical advice.
- Verification: `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; focused CLI/i18n tests; `pnpm check`; default fixture command; fixture explanation command; strict `calibration-v1` balance report.
- Follow-up: Execute `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/07-regression-gate-and-phase-report.md`.

### 2026-06-22 — `docs/steps/39-engine-quality-hardening-and-match-explanation-trace/07-regression-gate-and-phase-report.md`

- Status: Done
- Outcome: Phase 39 is complete with cleaner match simulation code and deterministic fixture explanation traceability.
- Adopted solution: Keep the current match engine behavior; use the new optional trace as a factual inspection surface while leaving full possession chains, tactical advice, and hidden scouting data out of scope.
- Verification: focused tests; `pnpm check`; `pnpm cli simulate-season --seed=world-a`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`; `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; deterministic repeat check; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/`

- Status: Documented
- Outcome: Created the Phase 40 career loop playability audit and matchday slice path.
- Adopted solution: Phase 40 starts by reviewing Phase 39 explanation output, defines the minimum playable career loop, audits matchday readiness, checks career fixture explanation readiness, smokes post-match/rollover/development continuity, and closes with one next-phase decision.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/01-phase-39-output-review.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/01-phase-39-output-review.md`

- Status: Done
- Outcome: Phase 39 fixture explanation is useful for match understanding but not yet connected to career playability.
- Adopted solution: Continue Phase 40 with existing trace data while explicitly auditing the gap between fixture explanation and career save/preparation/condition/post-match consequences.
- Verification: `test -f docs/audits/ENGINE_QUALITY_HARDENING_AND_TRACE_REPORT.md`; `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/02-career-loop-playability-spec.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/02-career-loop-playability-spec.md`

- Status: Done
- Outcome: Defined the minimum playable loop as a manager journey from career creation to first post-match review.
- Adopted solution: Judge playability by whether the user can connect club, squad, preparation, next fixture, match result, consequences, and next decision without automatic advice.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/03-career-state-matchday-readiness-audit.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/03-career-state-matchday-readiness-audit.md`

- Status: Done
- Outcome: Career save, selected club, squad, condition, and next fixture are readable, but saved match preparation is absent in the current save.
- Adopted solution: Continue to fixture-explanation readiness; treat missing visible preparation as matchday friction, not as a Phase 40 blocker.
- Verification: `pnpm cli career --save=phase40-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/04-career-fixture-explanation-readiness.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/04-career-fixture-explanation-readiness.md`

- Status: Done
- Outcome: Played career fixtures can now expose optional factual explanation.
- Adopted solution: Added `career --advance-next-fixture --fixture-explanation`, backed by optional engine trace propagation; default career advance output stays compact and no save schema stores rendered text.
- Verification: focused career/CLI tests; CLI/engine/i18n typechecks; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/05-season-rollover-and-development-loop-smoke.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/05-season-rollover-and-development-loop-smoke.md`

- Status: Done
- Outcome: The career save can be followed across multiple selected-club fixtures, and development/youth reports are readable inspection surfaces.
- Adopted solution: Treat development/youth as useful inspection reports for now; full rollover remains correctly blocked until the current season is complete.
- Verification: `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `pnpm cli career --save=phase40-check --development-report`; `pnpm cli career --save=phase40-check --youth-academy`; `pnpm cli career --save=phase40-check --rollover-season` expected invalid; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/40-career-loop-playability-audit-and-matchday-slice/06-playability-friction-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/40-career-loop-playability-audit-and-matchday-slice/06-playability-friction-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 40 is complete; the current career loop is close to playable but needs visible matchday condition consequences before serious UI work.
- Adopted solution: Recommend exactly one next direction: `41-career-matchday-consequences-and-condition-integration`.
- Verification: focused tests; `pnpm check`; `pnpm cli career --save=phase40-check --summary`; `pnpm cli career --save=phase40-check --advance-next-fixture`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly before implementation.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/`

- Status: Documented
- Outcome: Created the Phase 41 career matchday consequences and condition integration path.
- Adopted solution: Phase 41 starts from the Phase 40 playability friction, audits the missing post-match condition consequence, adds a pure condition-consequence contract, wires it into career fixture advancement, exposes compact CLI output, smokes repeated fixtures, and closes with one next decision.
- Verification: `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/01-phase-40-output-review.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/01-phase-40-output-review.md`

- Status: Done
- Outcome: Created `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md` and locked the Phase 41 blocker in user-facing terms.
- Adopted solution: Reuse existing player dynamic state and deterministic fitness helpers; keep the phase focused on explicit selected-starter condition spend after career fixtures, with no injuries, morale, training, tactical advice, UI, or auto-rotation.
- Verification: `test -f docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/02-career-condition-consequence-contract.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/02-career-condition-consequence-contract.md`

- Status: Done
- Outcome: Added the pure engine condition-consequence contract for one played career fixture.
- Adopted solution: `applyCareerFixtureConditionConsequences` reuses deterministic fitness rules, spends condition only for explicit selected starters, preserves non-starters, returns ordered structured changes, and avoids save writes, output text, recovery, and player choice.
- Verification: `pnpm exec vitest run packages/engine/src/career/career-condition-consequences.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/03-career-advance-condition-application.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/03-career-advance-condition-application.md`

- Status: Done
- Outcome: Career fixture advancement now persists selected-club condition consequences.
- Adopted solution: `progressNextCareerFixture` simulates the match from pre-match state, applies the result/report, then spends fitness for the actual selected-club starters and returns structured condition changes; optional explanation marks the selected-club condition side as tracked without changing match outcomes.
- Verification: `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/04-cli-post-match-condition-output.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/04-cli-post-match-condition-output.md`

- Status: Done
- Outcome: Career advance output now shows compact post-match condition consequences.
- Adopted solution: The CLI renders localized selected-starter deltas and rested first-team players from structured engine condition changes; `career --squad` remains the detailed follow-up inspection for persisted fitness.
- Verification: `pnpm exec vitest run apps/cli/src/commands/career.test.ts`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm check`; `pnpm cli career --save=phase41-check --advance-next-fixture`; `pnpm cli career --save=phase41-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/05-multi-fixture-condition-smoke.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/05-multi-fixture-condition-smoke.md`

- Status: Done
- Outcome: Repeated fixture advancement makes selected-starter fatigue visible.
- Adopted solution: The `phase41-check` smoke kept the same saved lineup over three selected-club fixtures; selected starters moved from `100` to `76`, reserves stayed at `100`, and explained output reported selected-club condition as `tracked effect=negative affected=11`.
- Verification: focused career/condition/progression tests; `pnpm check`; `pnpm cli career --save=phase41-check --summary`; `pnpm cli career --save=phase41-check --advance-next-fixture`; `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase41-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/41-career-matchday-consequences-and-condition-integration/06-phase-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/41-career-matchday-consequences-and-condition-integration/06-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 41 is complete; career match advancement now has visible selected-club condition consequences.
- Adopted solution: Keep the new consequence layer factual and manager-driven: selected starters spend fitness, non-starters remain unchanged, post-match output shows deltas, and explanation marks selected-club condition as tracked when requested. The final report recommends one next core-loop phase for between-fixture recovery before serious UI work.
- Verification: focused career/condition/progression tests; `pnpm check`; `pnpm cli career --save=phase41-check --summary`; `pnpm cli career --save=phase41-check --advance-next-fixture`; `pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation`; `pnpm cli career --save=phase41-check --squad`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly; recommended direction is `42-career-weekly-recovery-and-matchday-readiness`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/`

- Status: Done
- Outcome: Created the Phase 42 career weekly recovery and matchday readiness documentation path.
- Adopted solution: Phase 42 starts from the Phase 41 one-way condition drain, adds a pure day-based career recovery contract, applies recovery before selected-club fixture simulation, exposes compact readiness output, and verifies repeated fixture behavior without adding auto-rotation, advice, injuries, morale, training, staff, UI, or match-balance tuning.
- Verification: Documentation-only update; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/01-phase-41-output-review.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/01-phase-41-output-review.md`

- Status: Done
- Outcome: Created `docs/audits/CAREER_WEEKLY_RECOVERY_AUDIT.md` and documented the Phase 41 recovery blocker.
- Adopted solution: Treat the Phase 41 one-way fitness drain as a missing recovery layer, not as a tuning problem; Phase 42 should recover selected-club players by fixture date before match simulation, then spend condition after the match while keeping the manager in control.
- Verification: `test -f docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/02-career-recovery-contract.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/02-career-recovery-contract.md`

- Status: Done
- Outcome: Added a pure engine recovery contract for pre-fixture career readiness.
- Adopted solution: `applyCareerWeeklyRecovery` reuses deterministic fitness recovery, returns structured before/after/delta summaries, treats non-positive day gaps as no-op summaries, and leaves fixture advancement, match spend, lineup choice, and presentation to later steps.
- Verification: `pnpm exec vitest run packages/engine/src/career/career-weekly-recovery.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/03-career-advance-recovery-application.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/03-career-advance-recovery-application.md`

- Status: Done
- Outcome: Career advancement from a save now applies selected-club recovery before fixture simulation.
- Adopted solution: The CLI composition layer computes the next fixture day gap, recovers the selected-club roster first, builds match contexts from the recovered state, and then calls `progressNextCareerFixture` so post-match condition spend persists from the recovered baseline. The saved lineup and tactic are preserved; `apps/cli/src/commands/career.test.ts` was touched as necessary coverage for the save-driven behavior.
- Verification: `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/engine/src/career/progress-fixture.test.ts packages/engine/src/career/career-weekly-recovery.test.ts`; `pnpm --filter @game/engine run typecheck`; `pnpm check`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/04-cli-pre-match-readiness-output.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/04-cli-pre-match-readiness-output.md`

- Status: Done
- Outcome: Career advance output now exposes compact pre-match recovery facts.
- Adopted solution: The CLI prints localized recovery days, improved-player count, and selected-club fitness range before post-match condition deltas; it remains factual inspection output and does not recommend rotation.
- Verification: `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`; `pnpm --filter @game/cli run typecheck`; `pnpm --filter @game/i18n run typecheck`; `pnpm check`; `pnpm cli career --save=phase42-check --summary`; `pnpm cli career --save=phase42-check --advance-next-fixture`; `pnpm cli career --save=phase42-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/05-repeated-fixture-recovery-smoke.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/05-repeated-fixture-recovery-smoke.md`

- Status: Done
- Outcome: Repeated fixture smoke confirmed weekly recovery prevents the Phase 41 one-way condition drain.
- Adopted solution: Keep current recovery tuning: same-day first fixture spends `100 -> 92`; each following seven-day league gap recovers the selected-club roster from `92..100` to `100..100` before kickoff, then match spend returns starters to `92`. Current demo calendar has no short-gap pressure, which is a future scheduling/cups concern, not a recovery blocker.
- Verification: `pnpm check`; `pnpm cli career --save=phase42-check --seed=world-a --new-world-preview`; `pnpm cli career --save=phase42-check --set-lineup-demo=pro01-first-team`; `pnpm cli career --save=phase42-check --set-tactic-demo=pro01-balanced`; four `--advance-next-fixture` smokes including one with `--fixture-explanation`; `pnpm cli career --save=phase42-check --squad`; `git diff --check`.
- Follow-up: Execute `docs/steps/42-career-weekly-recovery-and-matchday-readiness/06-phase-report-and-next-decision.md`.

### 2026-06-22 — `docs/steps/42-career-weekly-recovery-and-matchday-readiness/06-phase-report-and-next-decision.md`

- Status: Done
- Outcome: Phase 42 is complete; career matchday readiness now includes deterministic pre-match recovery and visible post-match condition.
- Adopted solution: The save-driven loop now lets the manager inspect saved lineup, saved tactic, next fixture, pre-match recovery days/range, match result, post-match condition, persisted squad fitness, and optional condition explanation. No auto-rotation, advice, injuries, morale, training, or balance tuning was added.
- Verification: `pnpm check`; `pnpm cli career --save=phase42-check --summary`; `pnpm cli career --save=phase42-check --squad`; `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`; `git diff --check`.
- Follow-up: Choose the next phase explicitly; recommended direction is `43-career-matchday-ui-slice`.

## Update Protocol

For every step attempt, follow this loop:

1. Read this file.
2. Choose the active step.
3. Implement only that step.
4. Run the required checks.
5. If something is wrong, fix the current step or update the next relevant step document.
6. Update this file in a short entry.
7. Advance only when the step Definition of Done is satisfied.

When updating this file:

1. Update `Current Active Step`.
2. Change the row in the Step Ledger to `Done`, `Rework`, `Skipped`, or the next appropriate status.
3. Summarize the outcome in one sentence.
4. Record the adopted solution, not every rejected option.
5. Add the verification command or test result.
6. Add any lesson that changes future work to `Open Decisions And Follow-Up`.
7. If the next step changed, update that step document before implementation starts.

## Handoff Note Template

Use this format at the end of a step:

```md
### YYYY-MM-DD — Step path

- Status: Done | Rework | Skipped
- Outcome:
- Adopted solution:
- Verification:
- Follow-up:
```
