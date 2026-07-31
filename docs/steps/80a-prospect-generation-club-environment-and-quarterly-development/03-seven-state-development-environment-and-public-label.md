# Step 03 - Seven-State Development Environment And Public Label

## Status

Not started.

## Goal

Derive one frozen, public club-development environment from current category
and competitive tier, using the accepted seven-state matrix.

## Accepted Matrix

| Category | Survival | Mid-table | Playoff | Title contender |
|---|---|---|---|---|
| Serie C | Molto carente `0.92` | Carente `0.95` | Limitato `0.98` | Adeguato `1.00` |
| Serie B | Carente `0.95` | Limitato `0.98` | Adeguato `1.00` | Buono `1.03` |
| Serie A | Adeguato `1.00` | Ottimo `1.06` | Eccellente `1.10` | Eccellente `1.10` |

## What To Implement

- Add one versioned environment config/schema and a validated domain value.
- Derive environment from the season-frozen category/tier facts created by
  Step 02. Persist no independently mutable environment field or history.
- Expose the localized public label, never the numeric multiplier, in the
  existing club summary surface selected by the browser audit.
- Make the state available to development and youth-intake consumers without
  applying either effect yet.
- Add comments explaining that future facilities/staff may feed the same
  public scale but are not implemented here.

## What NOT To Implement

- No player development or intake probability change.
- No facility/staff system and no environment history.
- No UI development countdown or coefficient display.

## Expected Files

- `packages/domain/src/career/club-development-environment.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/balance/player-development-environment.json`
- `packages/content/src/balance/player-economy-calibration.ts`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- exact career calibration-version and composition owners identified by Step
  01
- `packages/engine/src/career/club-development-environment.ts`
- `packages/engine/src/career/club-development-environment.test.ts`
- existing club-summary `@game/ui` read model
- existing web club-summary component
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/content/src/balance/player-economy-calibration.test.ts \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/engine/src/career/club-development-environment.test.ts \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- All twelve category/tier cells resolve to the accepted state/multiplier.
- The season-frozen inputs round-trip and derive the identical environment
  after reload.
- The manager sees the state label without the coefficient.
- No growth or intake behavior changes prematurely.
- Step 04 is the only next action.
