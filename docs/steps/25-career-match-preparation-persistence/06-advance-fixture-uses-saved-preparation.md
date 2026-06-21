# Step 06 - Advance Fixture Uses Saved Preparation

## Goal

Make career fixture advancement use the saved lineup and tactic preparation.

## Context

`advanceCareerNextFixture` currently builds a deterministic default lineup/tactic because no saved preparation exists. After Steps 03-05, this shortcut should be removed or downgraded to a clear blocked state. Advancing a selected-club fixture should use the manager's saved preparation.

## Expected files

- `packages/engine/src/**/*.ts`
- `packages/engine/src/**/*.test.ts`
- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Update career fixture progression to read saved preparation.
- Use the saved selected lineup for the selected club.
- Use the saved tactic for the selected club.
- Keep opponent setup deterministic through existing MVP defaults unless already persisted.
- If preparation is missing, return a clear invalid/blocked result instead of silently auto-picking the selected club lineup.
- Remove redundant default selected-club lineup/tactic helpers if they become obsolete.
- Persist the played fixture result after advancing.
- Keep the operation deterministic.
- Localize any new CLI status/error text.

## What NOT to implement

- Do not add automatic selected-club lineup selection.
- Do not add substitutions or bench logic.
- Do not add live match tactical changes.
- Do not add injuries, suspensions, or availability constraints.
- Do not alter match-engine scoring algorithms.
- Do not simulate full rounds.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused engine/career CLI/i18n tests
- `pnpm cli career --save=phase25-advance-prep-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase25-advance-prep-world --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase25-advance-prep-world --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase25-advance-prep-world --advance-next-fixture`
- `pnpm cli career --save=phase25-advance-prep-world --inspect`
- `pnpm check`

## Definition of Done

- Advancing without saved selected-club preparation is blocked with a clear message.
- Advancing with saved selected-club preparation succeeds.
- The selected fixture result is persisted.
- Reloading the save shows the played fixture and retained preparation state.
- No obsolete default selected-club preparation helper remains undocumented.
