# 01 - Documentation State Audit

## Goal

Audit the current documentation state before reading source code in depth.

This step verifies whether requirements, project rules, project status, roadmap files, phase docs, market roadmap, and existing audit reports still describe the same project.

## What to implement

- Read and review:
  - `requirements.md`;
  - `docs/PROJECT_RULES.md`;
  - `docs/PROJECT_STATUS.md`;
  - `docs/steps/README.md`;
  - all completed phase README files from `docs/steps/`;
  - `docs/ROADMAP_PHASES_07_20.md`;
  - `docs/market-roadmap/README.md`;
  - existing files under `docs/audits/`.
- Create or initialize `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`.
- Record:
  - stale or contradictory documentation;
  - phase-numbering drift;
  - outdated next-phase recommendations;
  - missing audit/report links;
  - documents that should be treated as historical instead of binding;
  - the current source-of-truth hierarchy.
- Update `docs/PROJECT_STATUS.md` with the documentation audit result and next action.

## What NOT to implement

- Do not change source code.
- Do not rewrite roadmap strategy.
- Do not create the next phase docs.
- Do not modify `docs/PROJECT_RULES.md`.
- Do not modify `requirements.md` unless the audit finds a documentation typo that blocks correct interpretation.
- Do not mark the whole phase complete in this step.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/21-project-audit-and-roadmap-reconciliation/02-code-boundary-and-dead-code-audit.md` only if a lesson learned changes the next audit step.

## Required checks

- `find docs -maxdepth 3 -type f | sort`
- `rg -n "recommended next phase|next phase|Phase 21|Phase 22|playable|roadmap|market|youth|audit" docs requirements.md`
- `git diff --check`

## Definition of Done

- The audit report has a documentation-state section.
- The report states which docs are binding, historical, or advisory.
- Any contradiction that affects the next phase is recorded.
- `docs/PROJECT_STATUS.md` points to the next audit step.

