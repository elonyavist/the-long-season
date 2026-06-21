# Economy And Budget Dependencies

## Goal

Identify which economy and budget concepts must exist before market phases can safely implement fees, wages, installments, and financial consequences.

## Why we implement it this way

The market can start with a small budget model, but wages, installments, and structured deals require more durable economic state. This step prevents a temporary budget field from becoming a shallow Module duplicated by future finance systems.

## What to implement

- Review requirements Area 11 and Area 14.
- Review current code for money/budget concepts.
- Update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` with a section named `Economy And Budget Dependencies`.
- Classify concepts as:
  - required for permanent transfer MVP;
  - required before contracts/wages;
  - required before installments;
  - required before board/run failure;
  - defer.
- Identify required structured reasons for budget rejection.
- Decide whether market MVP can use a temporary `ClubBudget` Interface or needs an economy foundation first.

## What NOT to implement

- Do not add Money/value objects unless a future implementation step does it.
- Do not add budgets to source code.
- Do not add wages, contracts, installments, or finance simulation.
- Do not update balance tuning.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/PROJECT_STATUS.md`
- Next relevant step document only if scope changes.

## Required tests/checks

- `rg -n "Money|money|budget|wage|salary|contract|installment|fee|value|valuation|finance|economy" packages docs requirements.md`
- `rg -n "club category|reputation|category|third_division|division" packages/domain/src packages/content/src docs requirements.md`

## Definition of Done

- The report separates transfer budget, wage budget, future commitments, and broader finances.
- The report says what the market MVP may implement without blocking future economy systems.
- No source code is changed.

## Claude Code task prompt

Read the required project docs, the current dependency map report, and this step document. Map economy and budget dependencies, run the required scans, update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, update `docs/PROJECT_STATUS.md`, and stop.
