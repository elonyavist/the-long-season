# 06 - Risk And Priority Report

## Goal

Turn the audit findings into a prioritized, actionable risk report.

This step should make it clear what must be fixed before the next phase and what can wait.

## What to implement

- Review findings from the first five audit steps.
- Classify findings as:
  - blocker;
  - high;
  - medium;
  - low;
  - accepted risk.
- For each non-low finding, record:
  - affected files or docs;
  - impact on player experience or maintainability;
  - whether it blocks the next phase;
  - recommended handling;
  - whether it requires a product decision.
- Add a concise score from `0` to `100` for current readiness to start the next phase.
- Update `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not fix findings in this step.
- Do not start the recommended phase.
- Do not inflate severity for issues that are clearly future scope.
- Do not bury blockers in prose without a priority label.
- Do not leave action items only in chat.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/21-project-audit-and-roadmap-reconciliation/07-next-phase-spec-recommendation.md` only if a lesson learned changes the next audit step.

## Required checks

- `rg -n "Blocker|High|Medium|Low|accepted risk|score|next phase" docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `git diff --check`

## Definition of Done

- The audit report has an explicit priority table or priority list.
- The report distinguishes blockers from improvements.
- The report has a readiness score.
- `docs/PROJECT_STATUS.md` points to the next audit step.

