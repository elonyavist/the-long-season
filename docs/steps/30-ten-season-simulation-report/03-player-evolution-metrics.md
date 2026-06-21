# Step 03 - Player Evolution Metrics

## Goal

Add player-focused metrics to the ten-season report.

## Context

The user specifically wants to know whether players grow, decline, and produce believable long-term stories.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Track current ability distribution by season.
- Track top improvers and biggest decliners.
- Track serious prospects and prodigies.
- Track how many third-division players remain useful after many seasons.
- Track age distribution.
- Track season-level scorer and assist leaders.
- Track assist distribution depth: players with at least `5`, `8`, `10`, and `12` assists.
- Track creator concentration: top assist player and top three assist players as a share of their club's goals.
- Highlight whether top scorer output and top assist output diverge in realism.
- Avoid exposing exact hidden potential as user-facing truth.

## What NOT to implement

- Do not change development logic unless a failing test proves a bug.
- Do not add scouting UI.
- Do not add youth intake.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- focused long-run metric tests
- `pnpm check`

## Definition of Done

- The ten-season report explains player evolution clearly.
- Metrics can expose overpowered or stagnant player generation/development.
- Metrics can expose too many assists being concentrated on one creator even when goal totals look believable.
