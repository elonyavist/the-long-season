# Step 05 - Contested Routes And Lateral Focus

## Status

**Done on 2026-08-08.** The Step 05 exit profile restored the low-block xG
contract on both A2 seed sets, so Checkpoint B / Step 06 is open.

Step 04 is Done. Its input contract is exact: every outfield role allocates
`42_000` basis points across ten positive tasks, the goalkeeper allocates `0`,
and `tacticalRoleAllocationTotal(...)` is the only total derivation. This step
may reallocate that finite resource through routes and lateral focus; it may not
retune the common budget, add a second normalized table, or restore unequal
role totals to make the matchup pass.

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
- `packages/content/src/balance/match-tactics-calibration.test.ts`. The shipped
  version pin moves with the behaviour-bearing calibration; changing the asset
  while leaving its contract test on the previous stamp would make the stamp
  decorative.
- `packages/engine/src/match-engine/tactical-matchup.ts`
- `packages/engine/src/match-engine/tactical-matchup.test.ts`
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
- `packages/engine/src/match-engine/match-control.ts`
- `packages/engine/src/match-engine/match-control.test.ts`
- `packages/engine/src/match-engine/occasion-context.ts`
- `packages/engine/src/match-engine/occasion-context.test.ts`
- `packages/engine/src/match-engine/aggregate-occasion-resolver.ts`
- `packages/engine/src/match-engine/aggregate-occasion-resolver.test.ts`. Route
  quality currently finishes here by rereading tactical calibration. These four
  files move the already-derived route-quality edge across the occasion seam so
  the resolver executes it without owning a second tactical formula.
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`. The compact
  deterministic season sentinel is expected to move when the minute loop stops
  rebuilding control outside the contested plan. It is re-recorded only after
  the same seed reproduces the new table and scorer facts twice; fixture count,
  champion and calendar remain independent guardrails.
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`. The trace
  is a production caller of the minute plan and must read its derived route
  saturation rather than keep the removed stored-capacity shape alive.
- `packages/engine/src/match-engine/index.ts`. New plan readings that later
  checkpoints consume need one public engine seam, not deep imports.
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts`
  **(new)**. Lateral focus is not selected by the career policy yet, so the
  permanent reachability proof must take a real generated world and the two
  production-selected elevens from `buildTacticalAgencyLowBlockInput(...)`,
  then exercise all three plan instructions. A shape fixture would only prove
  that the branch can be called, not that it moves football a career can field.
- `docs/PROJECT_STATUS.md`
- this step document
- `README.md`. Its active-step paragraph still names 03D/04; this step owns the
  correction when it records the Step 05 handoff.
- `06-checkpoint-b-structural-ceiling.md`

## Frozen Step 05 Before-State

Measured on 2026-08-08 after Step 04, before any Step 05 production change,
with the locked `phase81a-a2` profile, both seven-world seed sets, the existing
paired replay count, and exactly seven workers. The local canonical artifact is
`simulation-out/phase81a-step05-before.json`; it is generated evidence and is
not committed.

| set | conceded xG reduction | own loss / conceded reduction | gate |
|---|---:|---:|---|
| in-sample | `0.1622` | `1.7775` | held |
| out-of-sample | `0.1760` | `2.6590` | broken |

This is the causal denominator for the step. The older `1.8938`/`2.8051`
readings predate the conserved `42_000` allocation and remain Checkpoint A2
history, not this implementation's before-state.

## Adopted Ownership Before Implementation

- The plan stores only irreducible contest facts: conserved route allocation,
  opponent resistance, connected exposure, bottleneck, volume, control inputs
  and the two calibration magnitudes needed by derived readings. Saturation,
  route weights, expected route quality and budget are derived through shared
  ordered functions; they are not duplicate fields.
- `deriveTacticalMatchup(...)` owns chain formation and resistance. It no longer
  stores a final route capacity that the minute plan must invalidate after
  reallocating the chain.
- Knob and lateral-focus preferences reallocate the plan's existing route
  budget. They never create route budget. Opponent commitments act as signed
  connected exposures and therefore remain separate from own allocation.
- `deriveMatchMinuteControl(...)` keeps match-state effects such as condition,
  home advantage and score pressure, but receives both already-derived plans.
  It may not read a tactic knob, shape capacity, or tactical calibration.
- The quality resolver receives the route-quality edge already derived by the
  plan. Player quality, random texture and finishing stay in the resolver.
- Strategic signatures use a versioned, ordered basis-point encoding of every
  analytic plan fact. They do not read result, win share or best-response
  identity.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/tactical-matchup.test.ts
pnpm exec vitest run packages/engine/src/match-engine/opportunity-route.test.ts
pnpm cli simulation-report --profile=phase81a-a2 --workers=7
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

## Outcome And Handoff

### Adopted solution

- `OpportunityRoutePlan` now owns the irreducible minute facts: conserved
  allocation, resistance, signed connected exposure, bottleneck, volume,
  control, counter relief and the calibration inputs needed by its readings.
  Budget, saturation, selection weights, quality edge and expected saturation
  are shared ordered derivations, never parallel stored fields.
- Knob preferences and `lateralFocus` spend an existing route budget. A common
  scale returns every reallocation to the incoming total exactly; the
  self-mirroring `transition` route owns the floating-point remainder so the
  arithmetic cannot prefer left or right.
- `left` commits to the left and opens the opponent's right; `right` is its
  exact mirror. Both use width's already-authored affinity/exposure magnitudes,
  so lateral focus does not create a second coefficient for the same football.
- `deriveMatchMinuteControl(...)` consumes the two plans. It retains condition,
  score, venue, player quality and numerical advantage, but no longer reads a
  knob, shape capacity or tactical calibration. Pressing therefore contests
  build-up once, inside the route plan.
- Occasion resolution receives a signed route-quality edge already centred and
  calibrated by the plan. It still owns players, departmental quality, random
  texture and finishing, but no longer rebuilds tactical quality.
- Complete signatures use
  `opportunity-route-plan-bps-v1`: deterministic route order, signed basis-point
  quantization and no result, win-share, response-ID or catalog-order input.
- The behaviour-bearing content stamp advances from
  `match-tactics-calibration-v2` to `match-tactics-calibration-v3`; schema stays
  `2`. No storage schema, envelope, active-match persistence or beta-save reset
  changed. Step 14 remains the only persistence/reset owner.

### Verification

- Focused ownership/symmetry/occasion/control suite: `17` files, `199` tests,
  all passed. The production-real reachability test builds a generated career
  world, uses the two canonically selected elevens, reaches all three lateral
  focuses, observes three strategic signatures and proves both reallocation
  and connected exposure.
- Deterministic season sentinel: `30/30` passed twice on the same `306`
  fixtures. Champion, bottom club and fixture endpoints remain fixed; the
  runner-up loses one goal and two points, recorded beside the golden as the
  causal consequence of unified contested control.
- Final isolated profile command:
  `pnpm cli simulation-report --profile=phase81a-a2 --workers=7`; real exit `0`,
  report hash `03eea47a87fee78eab1afe5e2f0abdaa`.
- Final isolated `pnpm check`: real exit `0`; `294` test files and `2231`
  tests passed, `856` modules / `3519` dependencies with no violation, all four
  custom ownership/presentation checks green, and every workspace typecheck
  passed.
- Final `git diff --check` is clean, and `graphify update .` rebuilt the graph
  after the complete uncommitted implementation.

| set | before reduction | exit reduction | before exchange | exit exchange | target |
|---|---:|---:|---:|---:|---|
| in-sample | `0.1622` | `0.2088` | `1.7775` | `1.1659` | `>= 0.08`, `<= 2.0` |
| out-of-sample | `0.1760` | `0.2287` | `2.6590` | `1.6721` | `>= 0.08`, `<= 2.0` |

No tactic magnitude was changed after reading either run. The improvement is
the effect of conserved allocation, connected exposure and single ownership,
not coefficient selection on the gate population.

### Next action

Run Checkpoint B / Step 06. It must consume the public complete signature over
the full action space and may still return REFINE or STOP; this low-block exit
opens the checkpoint but does not pre-judge structural non-transitivity.
