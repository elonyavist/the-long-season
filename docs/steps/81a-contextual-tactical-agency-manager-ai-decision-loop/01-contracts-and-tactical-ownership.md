# Step 01 - Contracts And Tactical Ownership

## Status

Not started. First active step of Phase 81A.

## Goal

Remove duplicated tactical ownership and freeze the successor contracts without
changing match outcomes or RNG consumption.

## User-Facing Reason

Later choices cannot be trusted or explained while the minute engine and the
post-match trace calculate different football.

## Entry Gate

- Phase 81 report and Phase 81A design contract read in full.
- Graphify `explain` and `affected --depth 2` refreshed for the owned symbols.

## What To Implement

- Remove dead `OpportunityRoutePlan.controlCapacity`; do not preserve it for
  compatibility.
- Move only the positive magnitudes of `controlWeight(...)` into the one
  versioned match-tactics calibration asset, validated by
  `isBasisPointShare(...)`. Keep increase/decrease direction in one total typed
  football mapping beside `TACTIC_KNOB_FAVOURED_ROUTES` and
  `TACTIC_KNOB_EXPOSED_ROUTE`; do not add a signed content field or widen the
  share validator. Content stores positive magnitudes `1200 / 400 / 300 / 800`;
  typed code maps pressing/risk/width to `increase` and directness to `decrease`.
  Preserve the exact double result and prove replay identity.
- Make explanation snapshots consume the actual opportunity plan used by the
  minute; correct the false JSDoc.
- Record the future contracts for strategic signatures, opponent reads,
  chapters, preparation, and their single Step 14 persistence integration. Add
  a typed Interface only when this step gives it a real production consumer;
  leave no anticipatory export.
- Prove match outcomes, events, ordering, and RNG consumption identical to the
  before-state. Trace changes only where the old parallel model was wrong.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
- `packages/engine/src/match-engine/match-control.ts`
- `packages/engine/src/match-engine/match-control.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `02-real-career-before-state.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/opportunity-route.test.ts
pnpm exec vitest run packages/engine/src/match-engine/match-control.test.ts
pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement

No conservation, new route behaviour, lateral focus, AI evaluator, UI, career
schema change, or threshold tuning.

## Definition Of Done

One Module owns the minute plan, no dead field or hardcoded duplicate remains,
the trace reads that plan, paired replay is outcome/RNG-identical, and Step 02 is
the only next action.
