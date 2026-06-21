# Step 01 - Phase 24 Output And Prep Gap Review

## Goal

Review the current post-Phase-24 state and define the exact persistence gap for career match preparation.

## Context

Phase 24 made generated players more credible. The next useful career step is not more generation or market depth. It is making manager choices durable: the user must be able to inspect the squad, choose a lineup, choose a tactic, and then advance a fixture using those saved choices.

## Expected files

- `docs/audits/CAREER_MATCH_PREPARATION_GAP_REVIEW.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read the Phase 24 report.
- Review current career advancement behavior.
- Identify where default runtime lineup/tactic construction still exists.
- Record the minimum durable preparation data needed for this phase.
- Record any existing domain contracts that can be reused.
- Confirm that no code changes are needed in this review step.

## What NOT to implement

- Do not write product code.
- Do not modify career state yet.
- Do not add CLI flags yet.
- Do not change match simulation or player generation.

## Required checks

- `rg -n "defaultLineupFromRoster|advanceCareerNextFixture|createSelectedLineup|createTacticSetup|CareerState" apps packages docs`
- `git diff --check`

## Definition of Done

- The audit file exists.
- The gap is stated clearly enough for Step 02 and Step 03.
- `docs/PROJECT_STATUS.md` points to the next Phase 25 step.
