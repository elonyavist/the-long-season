# Step 05 - Contested Routes And Lateral Focus

## Status

Not started; requires Step 04 Done. This step is the condition on Checkpoint
A2's downstream authorization: Step 06 remains closed until the low-block xG
contract holds on both A2 seed sets.

## Goal

Make formation and tactics spend a finite budget differently so opponents can
reward a concentration and exploit its connected cost.

## What To Implement

- Deepen the minute-plan Module to own budget, allocation, opponent resistance,
  route saturation, volume, quality, control, and exposure.
- Make `deriveMatchMinuteControl(...)` consume that plan rather than rebuilding
  tactical coefficients.
- Add the one match-time instruction
  `lateralFocus = balanced | left | right` to the canonical minute-plan
  Interface. Step 14 later adds it to durable career preparation in the single
  phase persistence integration.
- Do not change a storage schema, envelope, or beta version in this step.
- Preserve left/right mirror symmetry and make focus open the connected opposite
  exposure.
- Add basis-point strategic signatures over every analytic plan fact.
- Calibrate `low_block` against the A xG baseline: conceded-xG reduction
  `>= 8%`, own-loss/defensive-gain ratio `<= 2.0`.

## Expected Files

- `packages/domain/src/entities/tactic.entity.ts`
- `packages/domain/src/entities/tactic.entity.test.ts`
- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/engine/src/match-engine/tactical-matchup.ts`
- `packages/engine/src/match-engine/tactical-matchup.test.ts`
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
- `packages/engine/src/match-engine/match-control.ts`
- `packages/engine/src/match-engine/match-control.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `06-checkpoint-b-structural-ceiling.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/tactical-matchup.test.ts
pnpm exec vitest run packages/engine/src/match-engine/opportunity-route.test.ts
pnpm cli tactical-agency-report --checkpoint --workers=7
pnpm check
git diff --check
graphify update .
```

The checkpoint command and `pnpm check` run separately, each alone. The
checkpoint uses exactly `7` workers.

## Definition Of Done

One minute-plan owner exists, lateral focus is deterministic, every benefit has
a connected cost, low block meets its frozen xG contract, persistence remains
unchanged for the single Step 14 integration, and the checkpoint report shows
the low-block guardrail holding on **both** A2 seed sets. Only then is Step 06
the next action; otherwise Step 05 remains open with targets unchanged.
