# 06 - Career Market And Rollover Output Module

## Goal

Extract remaining major career presentation families from `career/format.ts`:
market apply output and season rollover output.

These outputs are not the same product screen, but they are the remaining broad
career presentation areas after overview, preparation, matchday, roster, youth,
and development have moved. Split them into separate modules if that keeps each
module deep and readable.

This step should cover:

- permanent-transfer apply output;
- transfer feasibility reason lines;
- roster persisted preview lines;
- transfer status formatting;
- season rollover output;
- rollover invalid reason formatting;
- season aggregate/champion/selected-club finish output.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/market-output.ts`
- `apps/cli/src/commands/career/season-rollover-output.ts`
- `apps/cli/src/commands/career/scenarios.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- focused career CLI tests
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Move market and rollover output families without changing business rules.
- Keep transfer willingness, valuation, and apply behavior in their current
  engine/content/CLI composition locations.
- Keep rollover simulation and season-history behavior unchanged.
- Keep localization keys unchanged.
- Remove duplicated helpers if extraction makes old helpers obsolete.
- Update the audit with final remaining `format.ts` responsibilities.

## What NOT to implement

- Do not change market acceptance/rejection logic.
- Do not change budgets, valuation, willingness, or transfer application.
- Do not change season rollover rules.
- Do not add loans, contracts, installments, add-ons, or swaps.
- Do not add new career command flags.
- Do not create UI view models or a UI package.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused career CLI tests for market apply and rollover output
- `pnpm check`
- `pnpm cli career --save=phase45-market --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-market --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli career --save=phase45-rollover --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-rollover --rollover-season`
- `git diff --check`

## Definition of Done

- Market and rollover output live in named modules with clear ownership.
- Career market and rollover behavior remain unchanged.
- `career/format.ts` has only intentional shared presentation helpers or is
  small enough to remain as an index-style facade with real callers.
- `docs/PROJECT_STATUS.md` points to Step 07 as the next active step.
