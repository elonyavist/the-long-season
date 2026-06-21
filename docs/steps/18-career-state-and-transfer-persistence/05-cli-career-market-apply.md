# 05 - CLI Career Market Apply

## Goal

Add a CLI inspection flow that creates or loads a career save, applies a supported permanent-transfer demo, writes the result, and reports what changed.

This is the first command where a market decision becomes durable.

## Command intent

The exact CLI shape should follow existing CLI conventions, but it must support this workflow:

- create or load a deterministic demo career;
- select a club;
- apply a Phase 17 permanent-transfer demo;
- write the updated career state;
- print the budget, roster, and transfer-history change;
- localize new user-facing labels.

Example target behavior:

```sh
pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent
```

The final command name may differ if the existing CLI structure suggests a cleaner option, but the behavior must remain explicit and non-interactive.

## What to implement

- CLI parsing for the career apply flow.
- A deterministic demo career bootstrap if the named demo save does not exist.
- Storage write after accepted transfer application.
- No state write after rejected transfer application unless the step explicitly records a harmless inspection result.
- Localized output for English and Italian labels added in this step.
- Focused CLI tests for accepted and rejected market demo behavior.
- TSDoc/JSDoc comments on new exported CLI helpers.

## What NOT to implement

- Do not build a UI.
- Do not make an interactive prompt.
- Do not add arbitrary player search.
- Do not add loans.
- Do not add contracts, wages, windows, AI market behavior, scouting fog, installments, or exchanges.
- Do not hide failures behind generic messages.
- Do not add hardcoded user-facing labels that should be localized.
- Do not let CLI import domain directly if project rules prohibit it.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/index.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/18-career-state-and-transfer-persistence/06-career-state-inspection.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused CLI tests for the career market apply flow
- `pnpm --filter @game/i18n run typecheck`
- focused i18n label tests if labels changed
- `pnpm check`
- `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli career --seed=demo-001 --save=career-demo-rejected --apply-market-demo=pro01-star-rejected`

## Definition of Done

- An accepted permanent-transfer demo can be written to a career save.
- A rejected permanent-transfer demo does not mutate the durable career state.
- Output is understandable and localized for supported labels in this step.
- The command remains deterministic and non-interactive.
- `docs/PROJECT_STATUS.md` records the manual command to inspect.

