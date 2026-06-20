# Engine Audit And Core Quality Review Steps

## Goal

Run a complete audit of the current deterministic game engine before opening market, youth, economy, or career systems.

This phase exists because Phases 08-13 introduced core manager-facing systems: tactics, selected lineups, manual tactical switches, player fitness, manual lineup rotation, formation fit, squad shape, and localization. Before adding larger career features, the project must verify that the current core is coherent, deterministic, maintainable, and good enough to build on.

## Why we implement it this way

Market and youth systems will multiply the amount of state, player decisions, and long-term consequences. If the current engine has unclear boundaries, dead code, weak determinism, naming drift, or misleading manager-facing output, those problems will become harder to fix later.

Phase 14 is not a feature phase. It is an audit gate with seven explicit review points:

1. Architecture boundary audit.
2. Determinism audit.
3. Match engine audit.
4. Season engine audit.
5. Tactic, lineup, and formation audit.
6. Code quality, dead code, and naming audit.
7. Audit report and next-phase decision.

The audit should read code and run checks, then write a durable report. It should not silently fix unrelated issues or mix refactors into the review. If the audit finds necessary work, document a focused rework step or recommend the next phase with clear blockers.

## What to implement

- Create or update a single audit report at `docs/audits/ENGINE_CORE_AUDIT.md`.
- Review package boundaries and dependency rules.
- Review deterministic behavior and forbidden runtime APIs.
- Review the match engine from team strength through causal event output.
- Review the season engine from calendar generation through season simulation, tables, player summaries, condition lifecycle, setup overrides, and lineup overrides.
- Review tactics, lineups, formations, squad fit, and manager-choice boundaries.
- Review code quality, naming, dead code, compatibility leftovers, duplicate helpers, and documentation quality.
- Produce a final report with:
  - score from `0` to `100`;
  - critical blockers;
  - high/medium/low findings;
  - verified strengths;
  - recommended rework before new features, if any;
  - recommendation for the next phase: market, youth, or a core rework phase.

## What NOT to implement

- Do not implement market, youth, scouting, economy, contracts, persistence, UI, staff, injuries, substitutions, training, or career saves.
- Do not change engine algorithms during the audit.
- Do not tune balance during the audit.
- Do not rewrite source code unless a step explicitly documents a narrow source change as required. The default output is the audit report.
- Do not add hidden recommendations that choose tactics, lineups, signings, or squad actions for the manager.
- Do not add hardcoded user-facing labels; any new report text intended for CLI/UI later must be treated as localization scope.
- Do not leave discovered dead code or architecture problems only in chat; record them in the audit report and project status.

## Allowed dependencies

- No new runtime dependencies.
- The audit may read any project source file and documentation file.
- The audit report must stay in `docs/audits/`.
- Source package dependency rules remain binding:
  - `domain -> nothing`
  - `shared -> nothing`
  - `engine -> domain, shared`
  - `content -> domain, shared`
  - `simulation-tools -> domain, engine, shared`
  - `i18n -> stable keys / presentation only`
  - `apps/cli -> composition and presentation`

## Expected files

- `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md`
- `docs/steps/14-engine-audit-and-core-quality-review/02-determinism-audit.md`
- `docs/steps/14-engine-audit-and-core-quality-review/03-match-engine-audit.md`
- `docs/steps/14-engine-audit-and-core-quality-review/04-season-engine-audit.md`
- `docs/steps/14-engine-audit-and-core-quality-review/05-tactic-lineup-formation-audit.md`
- `docs/steps/14-engine-audit-and-core-quality-review/06-code-quality-dead-code-naming-audit.md`
- `docs/steps/14-engine-audit-and-core-quality-review/07-audit-report-and-next-phase-decision.md`
- Future implementation output: `docs/audits/ENGINE_CORE_AUDIT.md`

## Required tests

- No tests for this overview.
- Each audit step defines its own checks.
- Final phase verification should run `pnpm check` unless the audit discovers a blocker that makes the check impossible to complete.

## Definition of Done

- All seven audit points are covered.
- `docs/audits/ENGINE_CORE_AUDIT.md` exists and gives a clear score, findings, risks, strengths, and next-phase recommendation.
- `docs/PROJECT_STATUS.md` explains whether the project can proceed to market/youth or needs a rework phase first.
- No feature code is introduced by the audit unless explicitly documented as a narrow rework blocker.
- The project still identifies exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/14-engine-audit-and-core-quality-review/01-architecture-boundary-audit.md`. Start the Phase 14 audit from architecture boundaries, create or update `docs/audits/ENGINE_CORE_AUDIT.md`, run the required checks for that step, update `docs/PROJECT_STATUS.md`, and stop after the step unless executing the whole phase prompt.
