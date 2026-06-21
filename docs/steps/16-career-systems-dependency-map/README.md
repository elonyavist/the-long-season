# Career Systems Dependency Map Steps

## Goal

Map the dependencies between market, career state, economy, calendar, scouting, youth, and persistence before implementing the next feature phase.

This phase exists because `docs/market-roadmap/` is a useful long-term vision, but it is not automatically a safe linear implementation order. Some market phases depend on shared career Modules that also belong to other systems.

## Why we implement it this way

The project should not build a market Module that later needs to be rewritten when career saves, budgets, scouting, loans, youth, or multi-season progression arrive.

Before writing Phase 17 implementation steps, this phase must decide:

- which career-state Interfaces are shared across systems;
- which market work can safely be done now;
- which market work requires persistence first;
- which economy concepts are required before contracts, wages, and installments;
- which calendar concepts are required before loans, transfer windows, and season transitions;
- which scouting/youth concepts overlap with market and should not be duplicated.

The output is a durable dependency map, not source code.

## What to implement

- Review the market roadmap against current project state.
- Identify shared career-state seams.
- Identify economy/budget dependencies.
- Identify calendar and season-transition dependencies.
- Identify scouting, youth, and market overlaps.
- Decide the real next implementation order.
- Create or update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not implement market.
- Do not implement youth.
- Do not implement contracts, wages, loans, scouting, staff, facilities, UI, persistence changes, or career saves.
- Do not add new source packages or code Modules.
- Do not create Phase 17 implementation steps until the final dependency decision step.
- Do not change `docs/PROJECT_RULES.md`.
- Do not add user-facing labels or localization keys.

## Allowed dependencies

- No new runtime dependencies.
- Documentation may read any existing project source, roadmap, audit, and step file.

## Expected files

- `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`
- `docs/steps/16-career-systems-dependency-map/02-shared-career-state-seams.md`
- `docs/steps/16-career-systems-dependency-map/03-economy-and-budget-dependencies.md`
- `docs/steps/16-career-systems-dependency-map/04-calendar-and-season-transition-dependencies.md`
- `docs/steps/16-career-systems-dependency-map/05-scouting-youth-and-market-overlap.md`
- `docs/steps/16-career-systems-dependency-map/06-phase-order-decision.md`
- Future phase output: `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`

## Required tests

- No tests for this overview.
- Each step defines documentation checks/scans.
- Final phase verification should run documentation scans only unless a step explicitly requires `pnpm check`.

## Definition of Done

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` exists.
- The report says which shared Modules must exist before each market phase can start.
- The report decides the next real implementation phase:
  - market MVP;
  - career state/persistence;
  - economy foundation;
  - calendar/multi-season foundation;
  - or another dependency rework phase.
- `docs/PROJECT_STATUS.md` records the Phase 16 result and next action.
- No feature implementation starts.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, `docs/market-roadmap/README.md`, `docs/ROADMAP_PHASES_07_20.md`, and `docs/steps/16-career-systems-dependency-map/01-market-roadmap-dependency-review.md`. Start the dependency map from market-roadmap review, update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, update `docs/PROJECT_STATUS.md`, and stop after this step unless executing the whole phase prompt.
