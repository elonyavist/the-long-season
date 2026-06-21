# Step 04 - Current Engine Baseline

## Goal

Create one concise baseline report that explains what the engine/career loop can do today and what is still missing before ten-season simulation.

## Context

Before implementing season rollover or player development, the project needs a single current-state document. This should replace reading many old reports when deciding what to build next.

## Expected files

- `docs/audits/CURRENT_ENGINE_BASELINE.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Summarize the current match engine.
- Summarize current season simulation.
- Summarize current career persistence.
- Summarize current player generation.
- Summarize current market MVP.
- Summarize current limitations for 5-10 season runs.
- Record the minimum missing systems for Phase 27-30.

## What NOT to implement

- Do not implement code.
- Do not change balance tuning.
- Do not change player generation.
- Do not start rollover.

## Required checks

- `rg -n "simulateSeason|progressNextCareerFixture|CareerState|generateFake|player-generation|transfer" packages apps docs`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- The baseline report exists.
- The report is short enough to be useful as a first read.
- The report states what blocks a credible ten-season simulation.

