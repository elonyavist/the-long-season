# 04 - Career Matchday Output Module

## Goal

Extract save-driven matchday presentation from `career/format.ts` into a named
CLI-local module.

This step should cover:

- career fixture advancement output;
- invalid/no-next-fixture advancement output;
- pre-match recovery output;
- match condition changes output;
- optional fixture explanation trace output used by career advancement;
- matchday fixture result line formatting.

## Expected files

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/matchday-output.ts`
- `apps/cli/src/commands/career/overview-output.ts` or
  `preparation-output.ts` only if a shared next-fixture/preparation helper needs
  to move
- `apps/cli/src/commands/career/progression.ts`
- focused career CLI tests
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Move only career advancement and explanation trace presentation.
- Keep recovery and condition-change facts exactly as returned by the existing
  progression flow.
- Keep explanation trace rendering CLI-local; do not move it into engine.
- Reuse existing localization keys.
- Update the audit with moved helpers and any remaining helper ownership
  decisions.

## What NOT to implement

- Do not change `progressNextCareerFixture` behavior.
- Do not change condition spend/recovery rules.
- Do not change match simulation, result application, or fixture ordering.
- Do not add new matchday command flags.
- Do not change explanation trace semantics.
- Do not create UI view models or a UI package.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused career CLI tests for advancement output
- `pnpm check`
- `pnpm cli career --save=phase45-matchday --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-matchday --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase45-matchday --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase45-matchday --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase45-matchday --summary`
- `git diff --check`

## Definition of Done

- Matchday output lives in a named module with clear ownership.
- Advancement output, condition consequences, and optional explanation trace
  still work.
- No engine or career progression behavior changes are made.
- `docs/PROJECT_STATUS.md` points to Step 05 as the next active step.
