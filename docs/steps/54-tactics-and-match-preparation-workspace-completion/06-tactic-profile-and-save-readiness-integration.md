# 06 - Tactic Profile And Save Readiness Integration

## Goal

Integrate formation, XI, bench, and tactic profile into one explicit save
readiness flow.

The manager should understand exactly why preparation can or cannot be saved.

## Expected files

- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/career/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts` if new visible labels are required
- Focused i18n tests if labels are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Keep tactic profile selection visible in the workspace.
- Ensure save action is available only when:
  - formation is selected;
  - every XI slot is selected;
  - bench is complete;
  - no player is duplicated;
  - a tactic profile is selected.
- Make blocker text specific and localized.
- Ensure save writes only the current in-memory demo preparation state.
- Ensure changing formation, XI, bench, or tactic after save marks preparation
  unsaved.
- Keep the save action obvious but not visually louder than unresolved blockers.

## What NOT to implement

- Do not persist to JSON/browser storage.
- Do not advance the fixture.
- Do not add tactic recommendations.
- Do not add automatic tactic switching.
- Do not add individual player instructions.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/i18n run typecheck` if labels change
- Focused i18n label tests if labels change
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Save readiness matches the full preparation state.
- Every blocker is visible and actionable.
- Saving still clears the relevant preparation blockers in the prototype.
- `docs/PROJECT_STATUS.md` identifies Step 07 as the next action.
