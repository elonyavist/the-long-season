# 04 - Product Loop Readiness Audit

## Goal

Audit whether the current project can support a first playable career loop, not just isolated inspection commands.

This step connects the technical state to the player experience: can the user make choices, see consequences, persist them, and continue?

## What to implement

- Review current playable or inspectable flows:
  - season simulation;
  - fixture detail;
  - identity review;
  - new career world preview;
  - career inspection;
  - permanent transfer application;
  - formation fit;
  - lineup override;
  - tactic setup and manual tactical switch;
  - condition lifecycle;
  - balance report.
- Identify what is:
  - playable now;
  - durable now;
  - inspection-only;
  - missing before a real loop;
  - misleading or too demo-specific;
  - likely to affect fun evaluation.
- Add product-loop readiness findings to `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not build the playable loop in this step.
- Do not add UI.
- Do not add automatic decisions for the manager.
- Do not hide tactical, lineup, formation, or market choices behind recommendations.
- Do not add youth, scouting, training, staff, contracts, or AI market behavior.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/21-project-audit-and-roadmap-reconciliation/05-roadmap-dependency-reconciliation.md` only if a lesson learned changes the next audit step.

## Required checks

- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1`
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`
- `git diff --check`

## Definition of Done

- The audit report states whether a first playable career loop should be next.
- Missing loop pieces are named concretely.
- Demo-only behavior that would block playability is recorded.
- `docs/PROJECT_STATUS.md` points to the next audit step.

