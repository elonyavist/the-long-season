# 03 - Web Preparation State And Formation Switching

## Goal

Update the web demo adapter/state so the browser can change formation and build
the new preparation read model without UI-only shortcuts.

## Expected files

- `apps/web/src/career/*`
- Focused `apps/web` tests
- `packages/i18n/src/labels.ts` if visible formation labels are added
- Focused i18n tests if labels are added
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Store selected formation id in the web demo preparation state.
- Store selected player ids by formation slot.
- Store selected substitute player ids in explicit bench order.
- When formation changes:
  - preserve selected players only where a compatible slot still exists;
  - clear invalid stale slots deterministically;
  - reset saved state to false;
  - do not auto-fill empty slots.
- Build the extended `@game/ui` preparation input from web state.
- Keep demo-only player facts in the web adapter, not in React components.
- Add tests for:
  - formation switch changes slot shape;
  - formation switch does not auto-select players;
  - saved preparation becomes unsaved after formation/bench changes;
  - duplicate XI/bench state is represented through blockers.

## What NOT to implement

- Do not render the new UI yet.
- Do not add browser persistence.
- Do not auto-select best players.
- Do not create fake squad recommendations.
- Do not change engine match behavior.

## Required checks

- `pnpm --filter @game/web run typecheck`
- Focused web adapter/state tests
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Web state can drive formation switching, XI, bench, tactic, and save status.
- No automatic manager choice is introduced.
- The next step can render the workspace from structured state.
- `docs/PROJECT_STATUS.md` identifies Step 04 as the next action.
