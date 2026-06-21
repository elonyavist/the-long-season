# Step 07 - CLI Generation Quality Report

## Goal

Add a CLI inspection report for generated player quality.

## Context

The user needs a practical way to review several seeds without reading code or test output. The report should summarize the generated player model: division bands, club-tier spread, role-coherence warnings, potential distribution, and rarity counts.

## Expected files

- `apps/cli/src/commands/*.ts`
- `apps/cli/src/commands/*.test.ts`
- `packages/i18n/src/*.ts`
- `packages/content/src/**/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a deterministic CLI report command or flag for player-generation quality inspection.
- Print the seed, competition, selected division, and generated squad count.
- Summarize current-ability distribution and potential distribution.
- Summarize role-coherence warnings, if any.
- Summarize rarity budget usage, without exposing hidden labels as player-facing truth.
- Localize all user-facing labels through the existing i18n layer.
- Keep the report inspection-only; do not write career saves.

## What NOT to implement

- Do not add a UI.
- Do not expose exact hidden potential as a player-facing scouting truth.
- Do not add market recommendations.
- Do not mutate generated worlds or career saves.
- Do not change generation logic in this step unless a small formatting helper requires it.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused CLI/i18n tests
- `pnpm check`
- the new CLI player-generation quality report command for at least `world-a` and `world-b`
- `git diff --check`

## Definition of Done

- The CLI can inspect player-generation quality from a seed.
- The output helps the user judge whether third-division squads look credible.
- The output is localized.
- The command is inspection-only and deterministic.
