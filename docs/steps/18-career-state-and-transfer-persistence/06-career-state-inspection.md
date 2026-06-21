# 06 - Career State Inspection

## Goal

Add a CLI inspection flow that reloads a saved career and shows the durable decisions that matter for continuing play.

This step is about verification and player trust: after a transfer is applied, the player must be able to see that the save really changed.

## Command intent

The exact CLI shape should follow the command introduced in the previous step.

Example target behavior:

```sh
pnpm cli career --save=career-demo --inspect
```

The output should show enough state to verify persistence without becoming a full UI.

## What to implement

- CLI option or command to load and inspect a career save.
- Output for:
  - save/career identifier;
  - selected club;
  - selected club roster size;
  - selected club transfer funds;
  - recent permanent-transfer history;
  - any affected selling club roster and budget if relevant.
- Localized labels for new user-facing output.
- Tests that apply a transfer, reload the save, and inspect the durable result.
- TSDoc/JSDoc comments on new exported CLI helpers.

## What NOT to implement

- Do not add a UI.
- Do not add edit behavior in the inspect command.
- Do not add a full save manager.
- Do not add multi-season career advancement.
- Do not add loans, contracts, wages, windows, scouting, AI market behavior, or youth systems.
- Do not add hardcoded user-facing labels.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/18-career-state-and-transfer-persistence/07-playable-loop-readiness-review.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused CLI tests for career save inspection
- focused i18n label tests if labels changed
- `pnpm check`
- `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli career --save=career-demo --inspect`

## Definition of Done

- Saved career state can be reloaded and inspected.
- The CLI shows that roster, budget, and transfer history persisted.
- Output remains localized and deterministic.
- `docs/PROJECT_STATUS.md` records the inspection command and expected manual review.

