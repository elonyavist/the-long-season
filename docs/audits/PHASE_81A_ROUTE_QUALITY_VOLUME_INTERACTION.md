# Phase 81A Route Quality And Volume Interaction

## Decision

`STOP / RETHINK`. The fourth endpoint factorial arm does not reach complete-row
materiality in either seed set. Both candidates are removed; shipped values are
`routeQualityBiasBasisPoints: 2500` and
`routeCapacitySeparationBasisPoints: 16000`.

## Combined Arm

| set | optimistic ceiling | optimistic exposure | selected ceiling | selected exposure | blind |
|---|---:|---:|---:|---:|---:|
| in-sample | `+0.03000` | `-0.03446` | `+0.01494` | `-0.01448` | `+0.00276` |
| out-of-sample | `+0.03907` | `-0.03004` | `+0.01979` | `-0.00849` | `-0.00492` |

Both Phase-1 sets pass and all `21/21` population rows hold. The run used the
exact 06C5 rows, `207` replay pairs and seven workers. Artifact SHA-256:
`ef77ae9e31fc98ad8a3bf8b2352bd25b851905e3cc6f4d15a6d4533da8fb03c2`.

## Interpretation

Quality and volume interact, but even their preregistered maximum endpoints do
not satisfy both `+0.045 / -0.045` targets in both sets. Coefficient scaling is
therefore exhausted. The next step must inspect where contextual information is
lost between the derived route plan, generated opportunities and resolved xG;
it may not choose a larger coefficient from this output.
