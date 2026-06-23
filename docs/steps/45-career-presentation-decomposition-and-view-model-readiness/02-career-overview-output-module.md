# 02 - Career Overview Output Module

## Goal

Extract career overview presentation from `career/format.ts` into a named
CLI-local module.

This step should cover the outputs that help the user understand a save before
making a decision:

- new career world preview;
- career summary;
- career inspect;
- shared world metadata lines;
- selected-club next fixture lines;
- transfer history and affected-club inspection lines only when needed by the
  overview outputs.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/overview-output.ts`
- `apps/cli/src/commands/career/types.ts`
- `apps/cli/src/commands/career/scenarios.ts` only if type imports require it
- focused career CLI tests
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Move only the overview output family and its directly-owned helpers.
- Keep exported function names stable when possible so `career.ts` remains a
  straightforward adapter.
- Keep localization keys unchanged.
- Keep generated world, save loading, market state, and fixture lookup behavior
  unchanged.
- Avoid creating a generic shared helper module unless at least two extracted
  modules need the helper after this step.
- Update the audit with what moved and what stayed.

## What NOT to implement

- Do not change save creation or loading.
- Do not change selected club choice.
- Do not change generated world content.
- Do not add new career command flags.
- Do not move preparation, advancement, squad, youth, development, rollover, or
  market apply output in this step.
- Do not create UI view models or a UI package.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused career CLI tests for new-world, summary, and inspect output
- `pnpm check`
- `pnpm cli career --save=phase45-overview --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-overview --summary`
- `pnpm cli career --save=phase45-overview --inspect`
- `git diff --check`

## Definition of Done

- Overview output lives in a named module with clear ownership.
- `career/format.ts` is smaller without leaving duplicate formatting logic.
- New-world, summary, and inspect CLI output still work.
- `docs/PROJECT_STATUS.md` points to Step 03 as the next active step.
