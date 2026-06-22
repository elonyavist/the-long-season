# Step 04 - Seasonal Youth Intake

## Goal

Add deterministic annual youth intake that keeps academies alive without growing forever.

## Context

A youth academy must receive new players each season. The first model should be conservative: `2..4` players per club per season, aged `15..17`, with quality controlled by division, club tier, and existing generation rules.

## Expected files

- `packages/content/src/`
- `packages/content/src/**/*.test.ts`
- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a pure annual youth intake generator or adapter.
- Use current career season/date as the age anchor.
- Generate `2..4` youth players per club deterministically by world seed, season ID, and club ID.
- Keep generated youth player IDs stable and non integer-like.
- Keep youth intake players in youth rosters, not senior rosters.
- Preserve fictional name quality and nationality distribution.
- Add structured intake records for reports.
- Add tests for determinism, bounds, age range, unique IDs, and no overpopulation in a small multi-season fixture.

## What NOT to implement

- Do not implement youth promotion or releases yet.
- Do not add staff/facility effects.
- Do not expose exact potential.
- Do not create youth match simulation.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/engine run typecheck`
- focused content/engine tests
- `pnpm check`

## Definition of Done

- Annual youth intake exists as a pure deterministic operation.
- Intake counts are bounded.
- Intake records can be consumed by later lifecycle and report steps.
