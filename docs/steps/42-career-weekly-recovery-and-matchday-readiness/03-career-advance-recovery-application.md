# 03 - Career Advance Recovery Application

## Goal

Apply recovery before selected-club fixture simulation so match context and persisted condition use the recovered player state.

## Expected files

- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- `apps/cli/src/commands/career/progression.ts`, only if CLI composition must recover before building match contexts.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Compute the day gap from the current career date to the next selected-club fixture date.
- Apply recovery before building or using match contexts for that fixture.
- Ensure the simulated fixture sees the recovered player state.
- Persist both:
  - pre-match recovery;
  - post-match condition spend.
- Keep the operation deterministic.
- Keep user choice unchanged:
  - saved lineup remains saved lineup;
  - saved tactic remains saved tactic;
  - no automatic rotation is introduced.
- Store or return a compact structured recovery summary for CLI inspection.
- Add tests proving:
  - players recover before match spend;
  - weekly gaps can restore players to full condition;
  - short gaps produce less recovery;
  - fixture simulation still spends condition after recovery;
  - no lineup is auto-changed.

## What NOT to implement

- Do not modify season simulation balance.
- Do not modify match scoring probabilities.
- Do not add schedule generation.
- Do not add injuries, morale, training, or staff.
- Do not change player development or aging.
- Do not add user-facing advice.

## Required checks

- Focused tests for touched career progression files.
- `pnpm --filter @game/engine run typecheck`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Career fixture advancement performs recovery before condition spend.
- The recovered state is the state used by the match.
- The persisted career save reflects the correct post-match condition.

