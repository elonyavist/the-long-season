# Step 01 - Club Identity Source Data Spec

## Goal

Define the source data and naming rules for fictional city-based clubs.

## Context

Club names should come from city identity, not placeholders. The system needs city pools by country and division relevance before generation code changes.

## Expected files

- `docs/audits/CLUB_IDENTITY_SOURCE_DATA_SPEC.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define supported countries for this phase.
- Define city-pool categories: large, medium, small.
- Define how division level maps to city-pool weights.
- Define fictional club-name patterns.
- Define duplicate-avoidance rules.
- Define IP-safety rules.

## What NOT to implement

- Do not write generation code.
- Do not add real club names.
- Do not modify player generation.

## Required checks

- `git diff --check`

## Definition of Done

- The naming spec is clear enough for deterministic content implementation.
- The spec explains how third-division city identity differs from first-division identity.

