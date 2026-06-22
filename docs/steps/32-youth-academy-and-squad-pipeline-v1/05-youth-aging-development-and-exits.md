# Step 05 - Youth Aging Development And Exits

## Goal

Make youth players age, develop, and leave the youth roster through bounded deterministic lifecycle rules.

## Context

Without exits, youth rosters will overpopulate. Youth players should improve over time, but by the end of their age-19 season they must either become promotion candidates, leave for another path, or be released.

## Expected files

- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Reuse or adapt existing player-development logic for youth players.
- Keep youth growth bounded by potential and role relevance.
- Add deterministic youth exit evaluation for players who age out.
- Represent factual youth lifecycle records:
  - developed;
  - aged out;
  - released;
  - external move candidate;
  - promotion candidate.
- Ensure youth roster size trends toward the target band after exits and intake.
- Add tests for deterministic development, age-out behavior, bounded youth count, and no first-team mutation.

## What NOT to implement

- Do not auto-promote players to the user's first team.
- Do not add contracts, loans, wages, or transfer fees.
- Do not create youth match results.
- Do not tune senior match scoring.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- focused youth lifecycle tests
- `pnpm check`

## Definition of Done

- Youth players age and develop deterministically.
- Youth rosters do not grow without bound.
- Age-out decisions are factual and reportable.
