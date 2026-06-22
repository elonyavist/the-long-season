# Step 04 - Causal Actor Selection Audit

## Goal

Review whether named players involved in match events are selected for believable
football reasons.

The user should not see goals, assists, saves, blocks, or shots that feel like
random labels pasted onto aggregate events.

## Context

Previous phases added scorer, assist, shooter, goalkeeper, and defender
attribution. Phase 34 reworked concentration issues. This step should verify
that causal actor selection remains credible after later player-generation and
long-run changes.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- engine/simulation-tools tests or diagnostics only if needed
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Review the actor-selection code paths for:
  - shooter;
  - goal scorer;
  - assist/creator;
  - goalkeeper save;
  - block defender.
- Inspect deterministic fixture outputs and season summaries for:
  - forwards and attacking midfielders producing most goals;
  - creators producing assists without impossible concentration;
  - goalkeepers receiving saves only when appropriate;
  - defenders/defensive midfielders appearing in defensive events;
  - role-adapted players still behaving plausibly.
- Use existing long-run evidence where possible instead of adding broad new
  reports.
- Identify if any actor field lacks enough context for future match-day UI.
- Record findings and possible future rework candidates.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add new event types.
- Do not add possession chains.
- Do not tune player generation.
- Do not remove rare standout creators or scorers if they remain explainable.
- Do not start Step 05.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
- `pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10`
- `git diff --check`

## Definition of Done

- Actor selection credibility is documented with examples.
- Any suspicious concentration or role mismatch is classified as acceptable,
  monitor, or future fix.
- No unexplained actor-selection blocker remains hidden.
- `docs/PROJECT_STATUS.md` points to Step 05 as the next active step.
