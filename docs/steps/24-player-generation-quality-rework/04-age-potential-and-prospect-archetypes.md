# Step 04 - Age Potential And Prospect Archetypes

## Goal

Separate current ability from potential through deterministic age and prospect archetypes.

## Context

Lower divisions can be fun because they contain stories: an old specialist, a late-career leader, a category bomber, or a young player who may climb with the club. Those stories need controlled archetypes. A 17-year-old future star in third division should usually start raw, not already look like a first-division starter.

## Expected files

- `packages/content/src/generators/*.ts`
- `packages/content/src/generators/*.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define age bands and archetypes such as:
  - normal senior;
  - category starter;
  - category star;
  - veteran drop-down;
  - normal youth;
  - good prospect;
  - serious prospect;
  - rare prodigy.
- Keep `current ability` and `potential` separate in generation.
- Make interesting youths common enough to create stories, but not strong enough to flood upper divisions.
- Ensure rare high-potential lower-division players usually have low or moderate current ability.
- Add tests for current/potential separation and age-coherent archetypes.

## What NOT to implement

- Do not implement monthly growth.
- Do not implement youth intake.
- Do not implement scouting ranges.
- Do not implement contracts, wages, or transfer interest changes.
- Do not change the match engine to use potential.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused tests for touched content generator files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Age and prospect archetypes are explicit and deterministic.
- A lower-division high-potential player does not automatically have high current ability.
- Tests protect against potential/current ability collapse.
