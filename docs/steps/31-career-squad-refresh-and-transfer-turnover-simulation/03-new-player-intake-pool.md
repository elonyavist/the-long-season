# Step 03 - New Player Intake Pool

## Goal

Generate deterministic incoming players for career-world refresh.

## Context

Exits alone would shrink squads. The world needs new fictional players that respect existing nationality, naming, role, division, club-tier, and rarity rules.

## Expected files

- `packages/content/src/`
- `packages/content/src/**/*.test.ts`
- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a deterministic intake generator or intake adapter using existing content generation rules.
- Preserve fictional identities and surname-variety constraints.
- Generate players by club/division context, not as uniformly random talent.
- Respect Phase 24 role-based attribute templates and rarity budgets.
- Keep young prospects common enough to refresh squads but rare top-potential outliers controlled.
- Return structured intake records for reporting.
- Add tests for determinism, role coherence, age bands, and lower-division realism.

## What NOT to implement

- Do not add a youth academy UI.
- Do not expose exact hidden potential as user-facing truth.
- Do not create first-division-ready stars as ordinary lower-division intake.
- Do not implement scouting.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/engine run typecheck`
- focused content/engine tests
- `pnpm check`

## Definition of Done

- New player intake is deterministic by world seed and season.
- Generated players are credible for division and role.
- Intake can be consumed by later squad-refresh steps.

