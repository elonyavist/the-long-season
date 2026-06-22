# Step 06 - Youth Promotion And Senior Pipeline

## Goal

Allow youth players to become senior first-team players through explicit deterministic pipeline rules.

## Context

The senior squad refresh system should be able to use academy players before generating external replacements. For AI clubs, promotion can be automatic when squad shape needs it. For the user's selected club, the system must not silently choose the manager's strategy; it may present promotion candidates or use a documented non-committal preview in CLI/lab output.

## Expected files

- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define promotion eligibility:
  - age;
  - broad role;
  - current ability;
  - potential/usefulness;
  - senior squad need.
- Let AI clubs promote youth players only through explicit rules.
- For the selected club, avoid hidden promotion decisions unless the current command is an automated long-run lab and documents the behavior.
- Prefer youth promotion before external squad-maintenance intake where appropriate.
- Record promotion counts and promoted player IDs for reports.
- Keep senior roster target `23..25` and hard minimum `18`.
- Add tests for AI promotion, selected-club protection, deterministic ordering, and senior squad integrity.

## What NOT to implement

- Do not auto-select user lineups.
- Do not auto-sell user youth.
- Do not expose exact hidden potential.
- Do not add UI confirmation flows.
- Do not implement full transfer market behavior for youth players.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused engine/CLI/i18n tests
- `pnpm check`

## Definition of Done

- Youth promotions can feed senior squads in long-run simulations.
- User-control boundaries are explicit and tested.
- Promotion records are available for metrics.
