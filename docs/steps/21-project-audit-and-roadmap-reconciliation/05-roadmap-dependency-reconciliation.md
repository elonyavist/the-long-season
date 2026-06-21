# 05 - Roadmap Dependency Reconciliation

## Goal

Reconcile the broad roadmap, market roadmap, dependency-map audit, and current project state before selecting the next phase.

This step prevents the project from adding market, youth, scouting, UI, or economy work in an order that depends on missing shared career infrastructure.

## What to implement

- Review:
  - `docs/ROADMAP_PHASES_07_20.md`;
  - `docs/market-roadmap/README.md`;
  - `docs/market-roadmap/phases/`;
  - `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`;
  - `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`;
  - `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`;
  - the Phase 16-20 step docs.
- Identify dependencies shared by:
  - playable career loop;
  - market depth;
  - youth intake;
  - scouting;
  - contracts/wages;
  - staff;
  - UI;
  - season transition.
- Decide whether the next phase should be:
  - a playable career loop;
  - another core rework;
  - a career infrastructure phase;
  - a market continuation phase;
  - a youth/scouting foundation phase.
- Add the dependency reconciliation to `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not create future phase docs in this step.
- Do not rewrite the whole roadmap.
- Do not implement missing shared infrastructure.
- Do not add features to unblock a preferred roadmap branch.
- Do not treat advisory roadmap files as more binding than current requirements and project rules.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/21-project-audit-and-roadmap-reconciliation/06-risk-and-priority-report.md` only if a lesson learned changes the next audit step.

## Required checks

- `find docs/market-roadmap -type f | sort`
- `rg -n "dependency|depends|blocked|playable|market|youth|scouting|contract|wage|staff|UI|career loop|season transition" docs requirements.md`
- `git diff --check`

## Definition of Done

- The audit report contains a roadmap dependency section.
- The next-phase options are compared against explicit dependencies.
- The report names any prerequisites before market/youth/scouting/UI work.
- `docs/PROJECT_STATUS.md` points to the next audit step.

