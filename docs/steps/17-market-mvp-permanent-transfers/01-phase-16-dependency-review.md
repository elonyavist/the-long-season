# Phase 16 Dependency Review

## Goal

Confirm the exact Phase 17 market MVP scope from `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md` before writing any market code.

## Why we implement it this way

Market systems are easy to over-expand. Phase 16 already decided that this phase is allowed only as a constrained in-memory permanent-transfer MVP. This first step protects that decision and prevents loans, persistence, contracts, wages, windows, scouting, or AI from slipping into the first market implementation.

## What to implement

- Read `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`.
- Read `docs/market-roadmap/README.md`.
- Read `docs/market-roadmap/phases/phase-16-market-mvp-permanent-transfers.md`.
- Confirm that Phase 17 is still:
  - permanent transfers only;
  - in-memory only;
  - manager-driven;
  - using temporary transfer budget;
  - no transfer windows;
  - truth-based valuation and willingness only.
- Update `docs/PROJECT_STATUS.md` with the confirmed scope.
- Do not write source code in this review step.

## What NOT to implement

- Do not implement market code.
- Do not create or modify domain, engine, content, CLI, or i18n source files.
- Do not create Phase 18 docs.
- Do not change project rules.
- Do not edit the market roadmap unless a factual contradiction blocks this phase.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/PROJECT_STATUS.md`
- This step document only if scope needs correction.

## Required tests/checks

- `rg -n "Phase 17|Market MVP|permanent|in-memory|budget|willingness|scouting|loan|window|persistence" docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md docs/market-roadmap docs/PROJECT_STATUS.md`
- `test -f docs/steps/17-market-mvp-permanent-transfers/02-market-domain-contracts.md`

## Definition of Done

- Phase 17 scope is confirmed in `docs/PROJECT_STATUS.md`.
- No source code is modified.
- The next active step is `02-market-domain-contracts.md`.

## Claude Code task prompt

Read the required project docs and this step document. Confirm the Phase 17 scope from Phase 16 and the market roadmap, run the required scans, update `docs/PROJECT_STATUS.md`, and stop unless executing the whole phase prompt.
