# Step 06 - Career Long-Run Integration

## Goal

Integrate exits, intake, squad maintenance, and transfer turnover into the long-run simulation path.

## Context

Phase 30 reports currently simulate seasons and player development, but turnover categories are unavailable. This step makes the long-run runner apply the new career-world refresh loop.

## Expected files

- `packages/simulation-tools/src/long-run/`
- `packages/simulation-tools/src/long-run/*.test.ts`
- `apps/cli/src/commands/`
- `apps/cli/src/commands/*.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a long-run career refresh pipeline:
  1. simulate season;
  2. develop/age players;
  3. apply exits;
  4. apply intake;
  5. apply squad-size and role-balance maintenance;
  6. apply transfer turnover.
- Keep the report path inspection-only unless explicitly requested otherwise.
- Preserve deterministic seeds and season-specific derived keys.
- Surface refresh totals in CLI output.
- Localize new report labels.
- Add tests for same-seed stability and season-count handling with refresh enabled.

## What NOT to implement

- Do not start UI.
- Do not write career saves from the report command.
- Do not hide refresh failures; expose them as metrics.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused long-run/CLI/i18n tests
- `pnpm check`

## Definition of Done

- The long-run report uses real career refresh data.
- Transfer and squad turnover are no longer unavailable.
- Existing shorter reports remain deterministic.

