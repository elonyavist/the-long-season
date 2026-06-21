# Market Roadmap Dependency Review

## Goal

Review `docs/market-roadmap/` and identify which market phases are independent and which depend on shared career systems.

## Why we implement it this way

The market roadmap is intentionally broad. This step prevents it from becoming a false linear plan. The project should know, before implementation, whether the candidate market MVP can stand alone or whether it needs a prior shared career-state Module.

## What to implement

- Read all files under `docs/market-roadmap/`.
- Read the current Phase 15 cleanup report.
- Create or update `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`.
- Add a section named `Market Roadmap Dependency Review`.
- For each market roadmap phase, classify it as:
  - `can_start_now`;
  - `needs_career_state`;
  - `needs_economy`;
  - `needs_calendar`;
  - `needs_scouting_or_youth`;
  - `needs_prior_market_phase`;
  - `defer_until_later`.
- Identify where the roadmap should be interrupted by non-market shared phases.
- Do not decide the final phase order yet; later steps refine the dependency map.

## What NOT to implement

- Do not create market code.
- Do not create Phase 17 implementation docs yet.
- Do not edit the market roadmap unless a factual contradiction is found.
- Do not change project rules.
- Do not add user-facing text keys.

## Allowed dependencies

- Documentation-only step.

## Expected files

- `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`
- `docs/PROJECT_STATUS.md`
- This step document only if scope needs correction.

## Required tests/checks

- `find docs/market-roadmap -type f | sort`
- `rg -n "Phase 16|Phase 17|Phase 18|Phase 19|Phase 20|Phase 21|Phase 22|Phase 23|Phase 24|Phase 25" docs/market-roadmap docs/ROADMAP_PHASES_07_20.md`
- `rg -n "career|persist|budget|wage|loan|scout|youth|calendar|window|installment|exchange" docs/market-roadmap docs/ROADMAP_PHASES_07_20.md requirements.md`

## Definition of Done

- The dependency map report exists.
- Each market roadmap phase has an initial dependency classification.
- `docs/PROJECT_STATUS.md` records Step 01 as complete or blocked.
- No feature code is introduced.

## Claude Code task prompt

Read the required project docs and this step document. Review the market roadmap dependencies, write the first section of `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, run the required scans, update `docs/PROJECT_STATUS.md`, and stop.
