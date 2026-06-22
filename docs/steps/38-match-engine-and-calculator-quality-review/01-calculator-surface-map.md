# Step 01 - Calculator Surface Map

## Goal

Map the current match-engine calculator surface before judging or changing it.

This step is documentation-first. It should identify which modules currently
influence match outcomes and where their outputs are observed.

## Context

The engine now includes team strength, match context, chance stepping, causal
actors, match reports, season simulation, manual tactics, lineup overrides, and
fitness effects. Before optimizing anything, the project needs a compact map of
what exists and what the calculator actually uses.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Inspect match-engine, team-strength, tactic-context, simulate-match, and
  simulate-season entry points.
- Identify calculator inputs:
  - player attributes;
  - role weights;
  - lineup slots;
  - tactic setup;
  - team strength;
  - fitness/dynamic-state curves;
  - home advantage;
  - match config probabilities;
  - RNG streams.
- Identify calculator outputs:
  - score;
  - shot events;
  - goal/assist/save/block actor IDs;
  - player match stats;
  - season table and player summaries;
  - long-run report metrics.
- Record which pieces are currently explainable from data and which are still
  aggregate or opaque.
- State explicitly that this step does not judge balance yet.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change code behavior.
- Do not tune probabilities.
- Do not add new CLI commands.
- Do not add new tests unless required to prove an existing documentation claim.
- Do not start Step 02.

## Required checks

- `rg -n "deriveTeamStrength|buildTacticTeamContext|stepMatch|simulateMatch|simulateSeason|ChanceActors|MatchEngineConfig" packages apps docs`
- `git diff --check`

## Definition of Done

- The audit report contains a readable calculator surface map.
- The report identifies major inputs, outputs, and opaque areas.
- No behavior change is made.
- `docs/PROJECT_STATUS.md` points to Step 02 as the next active step.
