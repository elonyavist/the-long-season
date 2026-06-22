# Step 01 - Failing World Creator Concentration Audit

## Goal

Reproduce and explain the exact Phase 33 gate failure before changing attribution code.

## Context

The Phase 33 final gate failed only on:

- `phase33-generation-world-00173`;
- `top_creator_goal_share_max`.

This step must identify whether the failure is caused by:

- a single club/player dominating one season;
- creator selection weights;
- assist attribution;
- chance type distribution;
- lineup role composition;
- deterministic randomness in one rare world;
- an overly broad report metric.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `packages/i18n/src/**/*.test.ts`
- `docs/audits/MATCH_EVENT_CONCENTRATION_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Reproduce the failing seed with:
  - `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- Add or extend report detail only if current output cannot identify:
  - failing season number;
  - failing club;
  - top creator player;
  - top creator goal share;
  - top three creator goal share;
  - top assist value;
  - scorer distribution for the same club/season.
- Do not change match-event attribution yet.
- Write `docs/audits/MATCH_EVENT_CONCENTRATION_AUDIT.md` with:
  - failing seed;
  - observed metric values;
  - suspected cause;
  - recommended narrow rework for Step 02/03.

## What NOT to implement

- Do not change creator selection.
- Do not change assist attribution.
- Do not change match scoring.
- Do not change long-run thresholds.
- Do not tune player generation or youth academy behavior.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused tests for touched simulation-tools/CLI/i18n files
- `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The failing seed is reproduced.
- The audit identifies where concentration happens.
- No attribution behavior is changed yet.
- The next step has enough evidence to implement a narrow fix.
