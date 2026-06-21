# Step 01 - Ten-Season Report Spec

## Goal

Define the exact ten-season report structure before implementation.

## Context

The report should answer whether the game is fun and credible over time, not merely whether commands run.

## Expected files

- `docs/audits/TEN_SEASON_REPORT_SPEC.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define report sections.
- Define required metrics from `LONG_RUN_METRICS_SPEC`.
- Define a dedicated scoring-production section for goals, assists, and creator concentration.
- Define acceptable output size.
- Define which seeds must be used for comparison.
- Define failure/anomaly categories.
- Define final score criteria.

## Mandatory Scoring-Production Analysis

The spec must require a detailed ten-season analysis of attacking output:

- top scorer goals per season;
- top assist count per season;
- average top assist count across the run;
- maximum observed top assist count;
- number of players with at least `5`, `8`, `10`, and `12` assists;
- assist concentration for the top assist player as a share of team goals;
- assist concentration for the top three assist players as a share of team goals;
- creator concentration warnings when one player repeatedly dominates chance creation;
- explicit comparison between goals and assists, so the report can show whether scorer numbers are believable while assist numbers are too concentrated.

Initial review thresholds:

- top assist `8..12`: normal;
- top assist `13..15`: high but acceptable;
- top assist `16..18`: warning if frequent;
- top assist `19+`: likely anomaly;
- repeated `15+` top-assist seasons across many seeds should trigger review even if individual values remain plausible.

## What NOT to implement

- Do not implement the runner.
- Do not tune engine values.
- Do not add UI.

## Required checks

- `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`
- `git diff --check`

## Definition of Done

- The report spec is concrete enough to implement.
- It states what evidence is needed before UI work.
