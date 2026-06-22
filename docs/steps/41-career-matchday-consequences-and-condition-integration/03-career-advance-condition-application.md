# Step 03 - Career Advance Condition Application

## Goal

Wire the condition consequence contract into career fixture advancement so
played selected-club fixtures update persisted player condition.

## Context

Step 02 defines the pure condition consequence contract. This step applies it
inside the career advancement path after a selected-club fixture is played.

## Expected files

- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `apps/cli/src/commands/career/progression.ts`, only if CLI composition must pass rules/options
- `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Apply condition spend to the actual selected-club lineup used for the played
  career fixture.
- Persist updated player states in the returned career state.
- Keep opponent state behavior unchanged unless already tracked explicitly.
- Preserve fixture result, match report, and optional explanation behavior.
- Ensure optional explanation can report tracked condition when available.
- Add tests proving:
  - starters lose condition after advancement;
  - non-starters do not pay match cost;
  - result/report stay deterministic;
  - save state is copy-on-write;
  - explanation trace still remains optional.
- Update the audit and status.

## What NOT to implement

- Do not add recovery between fixtures unless the current date transition already
  requires it and the contract supports it.
- Do not alter match probabilities.
- Do not add injuries, form, morale, or training.
- Do not auto-choose lineups.
- Do not change persistence schema unless strictly necessary.

## Required checks

- `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts`
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Played career fixtures update selected-club player condition.
- Existing fixture advancement behavior remains deterministic.
- Optional explanation still works.
- `docs/PROJECT_STATUS.md` is updated.
