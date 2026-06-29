# Step 03 - Match Edge Case Determinism Tests

## Goal

Add match-level regression tests for edge cases and repeatability that matter to
future match-engine changes.

This step protects match credibility before later phases review tactical inputs
or matchday presentation.

## Expected files

- `packages/engine/src/match-engine/simulate-match.test.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Add deterministic repeat coverage for a representative fixture/match setup.
- Add one low-scoring or 0-0 edge case if it can be achieved through existing
  config/test setup without changing production behavior.
- Add a low-event or no-event minute test where useful to prove that the match
  loop remains deterministic when no visible event is emitted.
- Prefer testing public or near-public engine Interfaces where possible.
- If an exact no-event RNG-consumption test is not feasible without invasive
  test seams, document the reason in the audit and add the narrowest useful
  repeatability test instead.

## What NOT to implement

- Do not change event probabilities to force a 0-0.
- Do not expose private internals just for a brittle test.
- Do not add fake production flags.
- Do not change RNG stream keys.
- Do not alter match output semantics.

## Required checks

```sh
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts
pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Definition of Done

- Match simulation has stronger deterministic repeat evidence.
- At least one low-event or low-scoring case is protected or explicitly
  documented as infeasible without a future seam.
- The audit records what remains uncovered and why.
- `docs/PROJECT_STATUS.md` records the result.

