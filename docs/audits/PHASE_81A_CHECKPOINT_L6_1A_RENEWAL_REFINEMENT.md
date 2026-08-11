# Phase 81A Checkpoint L6.1A - Renewal Refinement

Date: 2026-08-10
Decision: **STOP / RETHINK**
Gameplay changes: **none**

## Thesis Result

L6.1A identified two strong diagnostic owners, absolved the active-talk cap as
a standalone correction, and then stopped because the declared pre-06B16
control population did not complete. The stop is structural: one of seven
control worlds reaches the canonical `finance_lifecycle_rejected` branch in
season 9. It is not a reconciliation failure and is not removed from the
corpus.

No 06B20 gameplay step is authorized by this report. In particular, the
`matchday_selection` and `population_strength` findings remain diagnostic until
the scenario-completion failure is resolved by a newly preregistered plan.

## Canonical Commands And Artifacts

Canary:

```text
pnpm cli simulation-report \
  --profile=phase81a-renewal-refinement-l6-1a-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-renewal-refinement-l6-1a-canary-7x1.json
```

- real exit: `0`;
- report decision: `PASS`; checkpoint: `GO`;
- report hash: `82a0478ff4890ee96bdc16331df55f55`;
- file SHA-256: `35e06d00fc0a9b79176e706ccac731e328dd4fd7452ff71c9de2a2d7fbb849bc`;
- purity: `7/7` compared, `0` mismatches;
- scenario failures: `0`; reconciliation failures: `0`;
- balance decision: `not_evaluated`.

Full cohort:

```text
pnpm cli simulation-report \
  --profile=phase81a-renewal-refinement-l6-1a-28x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-renewal-refinement-l6-1a-28x10.json
```

- real exit: `1`; report decision: `FAIL`;
- checkpoint: `STOP_RETHINK`; failed key: `scenario_completion`;
- wall time for the corrected uncached replay: `1h 25m 46s`;
- report hash: `d9ccde5f5ee75ddb6a16838ded3d0009`;
- file SHA-256: `40e210c761bbf992b16e6c9e5eda51149cf19a7239c42d42bcae7dfdb70b5949`;
- cached replay: `26s`, real exit `1`, identical SHA-256;
- scenario failures: `1`; reconciliation failures: `0`;
- full-cohort purity: `not_evaluated`, as declared; the canary owns purity.

## Scenario Manifest

| Scenario | Cache | Completed | Failed | Meaning |
|---|---:|---:|---:|---|
| current | v2 | 28 | 0 | ordinary current product semantics |
| control | v1 | 6 | 1 | pre-06B16 market plus generic intake |
| market | v1 | 7 | 0 | role-aware market only |
| blueprint | v1 | 7 | 0 | identity intake only |
| talk ceiling | v1 | 7 | 0 | combined semantics, active-talk cap removed |

The failed row is fixed and persisted:

```text
phase81a-renewal-refinement-l6-1a-v1-world-00005
season 9
finance_lifecycle_rejected
```

Its hashed failure envelope occupies the same checkpoint path a successful
projection would occupy. Resume therefore cannot replace the failed world,
shrink the arm or pay nine seasons again.

## Squad-Use Attribution

| Fact | Current | Owner counterfactual / result |
|---|---:|---:|
| appearance share | 0.649579 | 0.573532 |
| distinct users per club-season | 23.032738 | 26.086706 |
| owner | - | `matchday_selection` |
| owner worlds | - | 28 / 28 |
| reconciliation failures | 0 | 0 |

The exact selector pool contains enough players to clear both frozen A6 bands,
but too few of them reach a match-day squad. The loss is downstream of supply,
dated availability and the academy/call-up boundary, and upstream of in-match
substitution. This names the stage; it does not authorize a correction after a
structural checkpoint stop.

## Active-Talk Ceiling Attribution

Removing the cap eliminates the terminal label (`5,415 -> 0`) but does not
create a healthy downstream response:

| Metric | Paired delta | 95% half-width | Coherent worlds |
|---|---:|---:|---:|
| fulfilled need share | -0.025251 | 0.012239 | 0 / 7 |
| realized generated fulfillment | +0.028628 | 0.077126 | 3 / 7 |
| local replacement capacity | +0.018917 | 0.069368 | 3 / 7 |
| division replacement capacity | -0.035845 | 0.116423 | 2 / 7 |
| four-formation retention | 0.000000 | 0.075440 | 3 / 7 |
| generated-leader share | +0.002381 | 0.049607 | 2 / 7 |
| champion points | +0.728571 | 1.353687 | 4 / 7 |

The current path fulfills `0.234124` of eligible needs; the ceiling path
fulfills `0.208848`. No newly realized player intersects the improved metric
path (`0` intersections). Owner: `coupled_unresolved`. The active-talk cap is
therefore not the owner and no cap value may be tuned from this output.

## Standings Attribution

The powered 28-world cohort remains below the exact First-Division champion
band:

- current champion points mean: `71.546429`;
- paired `1.5` strength mean: `76.339286`;
- healthy direction: `28/28` worlds;
- owner: `population_strength`;
- paired historical guardrails: `5/5` held.

| Guardrail | Current | Paired | Paired distance to band |
|---|---:|---:|---:|
| last-club points | 23.678571 | 20.107143 | 0 |
| points spread | 47.867857 | 56.232143 | 0 |
| PPG standard deviation | 0.397750 | 0.478472 | 0 |
| goals per match | 2.814729 | 2.878863 | 0 |
| draw share | 0.275175 | 0.254540 | 0 |

This is a causal diagnostic owner, not an authorization, because the composite
checkpoint stopped before its declared factorial population completed.

## Factorial And Decision

The fresh 2 x 2 factorial is `not_evaluated`. Running it on six control worlds,
replacing the failed seed or extending the corpus would violate the frozen
matrix. The result cannot confirm or reject the former L6.1 interactions.

The only valid decision is therefore:

```text
STOP_RETHINK
failedGateKeys = [scenario_completion]
scenarioFailureCount = 1
reconciliationFailureCount = 0
```

06B20A-D, the `100 x 10`, Checkpoint B2 and Steps 07-16 remain closed. A future
plan must first decide how to handle an exact pre-06B16 counterfactual that is
not a viable ten-season world. It may not reinterpret the six survivors as a
complete control arm.
