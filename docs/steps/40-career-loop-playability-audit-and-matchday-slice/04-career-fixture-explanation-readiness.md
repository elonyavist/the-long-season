# Step 04 - Career Fixture Explanation Readiness

## Goal

Verify whether a played career fixture can expose enough factual explanation to
help the manager understand the result.

## Context

`simulate-season --fixture --fixture-explanation` explains a generated fixture,
but career playability needs the same idea connected to the saved career
context: selected club, match preparation, condition, and the actual next
fixture.

## Expected files

- `docs/audits/CAREER_LOOP_PLAYABILITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- if implementation is required by this step:
  - `apps/cli/src/commands/career.ts`
  - `apps/cli/src/commands/career.test.ts`
  - `packages/i18n/src/messages.ts`
  - touched engine/career files only if required
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- First audit the existing career fixture progression output.
- Compare it with the Phase 39 fixture explanation output.
- Decide if existing output is enough for the matchday slice.
- If not enough, add only the narrowest career fixture explanation inspection
  needed to connect played career fixtures to factual trace data.
- Keep explanation factual:
  - team strength;
  - tactic distribution;
  - lineup roles;
  - condition impact;
  - chance summary;
  - variance markers.
- Keep output localized.
- Preserve deterministic match outcomes.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not create tactical advice.
- Do not add a full match viewer.
- Do not change match probabilities.
- Do not change save schema unless the current step proves it is necessary and
  scoped.
- Do not duplicate explanation formatting if an existing formatter can be reused
  cleanly.

## Required checks

- focused tests for touched files
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`, if i18n changes
- `pnpm check`
- `pnpm cli career --save=phase40-check --summary`
- `pnpm cli career --save=phase40-check --advance-next-fixture`
- representative career fixture explanation smoke, if implemented
- `git diff --check`

## Definition of Done

- The audit states whether career fixture explanation is ready.
- If code changed, the career command exposes only the minimum factual
  explanation needed by the matchday slice.
- No default career flow becomes noisier unless explicitly documented.
- `docs/PROJECT_STATUS.md` is updated.
