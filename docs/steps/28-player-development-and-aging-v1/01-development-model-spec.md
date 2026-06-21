# Step 01 - Development Model Spec

## Goal

Specify the player growth and decline model before code changes.

## Context

The user identified player generation and long-term evolution as core to the game. This step translates that intent into concrete development rules.

## Expected files

- `docs/audits/PLAYER_DEVELOPMENT_MODEL_SPEC.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define age bands by broad position.
- Define growth windows and peak years.
- Define decline windows.
- Define inputs: age, current ability, potential class, playing time, morale/form, division level, rarity archetype.
- Define what remains out of scope.
- Define mandatory tests for Phase 28 implementation.

## What NOT to implement

- Do not write code.
- Do not change player generation.
- Do not change match engine.

## Required checks

- `test -f docs/audits/LONG_RUN_METRICS_SPEC.md`
- `git diff --check`

## Definition of Done

- The spec is concrete enough for engine implementation.
- It states what makes third-division prospects credible over 6-7 seasons.

