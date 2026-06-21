# Step 05 - Long-Run Metrics Definition

## Goal

Define the metrics that will decide whether the game remains credible and interesting over 5-10 simulated seasons.

## Context

The project should not add long-run simulation and then decide what to inspect afterward. The quality metrics must be explicit first.

## Expected files

- `docs/audits/LONG_RUN_METRICS_SPEC.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define season-result metrics.
- Define player-development metrics.
- Define aging/decline metrics.
- Define club/squad stability metrics.
- Define market turnover metrics.
- Define anomaly metrics.
- Define manual inspection outputs.
- Mark which metrics are mandatory for Phase 30 and which can wait.

## What NOT to implement

- Do not implement the report yet.
- Do not implement growth, decline, or market AI yet.
- Do not add user-facing CLI commands beyond documentation.

## Required checks

- `test -f docs/audits/CURRENT_ENGINE_BASELINE.md`
- `git diff --check`

## Definition of Done

- The metric spec exists.
- Phase 27, 28, 29, and 30 know what they are building toward.
- The spec focuses on ten-season credibility, not UI polish.

